#Requires -Version 7.0
# Steuerungsmodul für den Stellare-Industrien-Server unter Raspberry Pi OS.
# Kapselt systemd/journalctl/apt-Aufrufe, damit die Bedienung komplett über
# PowerShell erfolgen kann.

$script:ServiceName = 'stellare-industrien'
$script:PowershellDir = $PSScriptRoot
$script:ServerDir = Split-Path -Parent $script:PowershellDir
$script:RepoRoot = Split-Path -Parent $script:ServerDir
$script:DataDir = Join-Path $script:ServerDir 'data'
$script:UniverseFile = Join-Path $script:DataDir 'universe.json'
$script:UnitTarget = '/etc/systemd/system/stellare-industrien.service'

$script:TunnelServiceName = 'stellare-tunnel'
$script:TunnelBinary = '/usr/local/bin/cloudflared'
$script:TunnelUnitTarget = '/etc/systemd/system/stellare-tunnel.service'
$script:TunnelMetricsPort = 20241

function Invoke-Native {
    <#
    .SYNOPSIS
        Führt einen externen Befehl aus und wirft einen PowerShell-Fehler, wenn er fehlschlägt.
    .DESCRIPTION
        Bewusst OHNE param()/[CmdletBinding()] geschrieben: Aufrufe wie
        "Invoke-Native sudo rm -f $path" duerfen NICHT durch PowerShells eigene
        Parameterbindung interpretiert werden (z.B. wuerde "-f" sonst als
        Praefix von "-FilePath" fehlinterpretiert und dem eigentlichen Befehl
        entzogen). $args faengt hier daher wirklich jedes Token roh ab.

        Wichtig: $args[1..($args.Count-1)] wird NICHT verwendet, weil PowerShell
        bei genau einem verbleibenden Element einen einzelnen String statt eines
        1-Element-Arrays zurueckgibt - "& $filePath @rest" wuerde diesen String
        dann zeichenweise aufsplitten (z.B. "pull" -> p,u,l,l als vier einzelne
        Argumente, siehe git-pull-Bug). "Select-Object -Skip 1", in @() gehuellt,
        liefert garantiert immer ein echtes Array, auch bei 0 oder 1 Elementen.
    #>
    if($args.Count -eq 0){ throw "Invoke-Native: kein Programm angegeben." }
    $filePath = $args[0]
    $rest = @($args | Select-Object -Skip 1)
    & $filePath @rest
    if($LASTEXITCODE -ne 0){
        throw "Befehl fehlgeschlagen: $filePath $($rest -join ' ') (Exit-Code $LASTEXITCODE)"
    }
}

function Get-StellarePiAddress {
    <#
    .SYNOPSIS
        Zeigt die LAN-IP-Adresse(n) des Raspberry Pi.
    #>
    [CmdletBinding()]
    param()
    $raw = (& hostname -I 2>$null)
    if($LASTEXITCODE -ne 0 -or -not $raw){ return @() }
    return ($raw.Trim() -split '\s+')
}

function Install-StellareServer {
    <#
    .SYNOPSIS
        Installiert Node.js (falls nötig), npm-Abhängigkeiten und richtet den
        systemd-Dienst ein, der den Server dauerhaft laufen hält.
    #>
    [CmdletBinding()]
    param(
        [int]$Port = 3000
    )

    Write-Host "== Node.js pruefen ==" -ForegroundColor Cyan
    $nodeOk = $false
    $nodePath = $null
    try {
        $nodeCmd = Get-Command node -ErrorAction Stop
        $v = & node -v 2>$null
        if($v -match '^v(\d+)\.'){
            $major = [int]$Matches[1]
            if($major -ge 18){ $nodeOk = $true; $nodePath = $nodeCmd.Source; Write-Host "Node.js $v gefunden unter $nodePath." -ForegroundColor Green }
        }
    } catch { }

    if(-not $nodeOk){
        Write-Host "Installiere Node.js LTS ueber NodeSource..." -ForegroundColor Yellow
        Invoke-Native sudo bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
        Invoke-Native sudo apt-get install -y nodejs
        $nodeCmd = Get-Command node -ErrorAction Stop
        $nodePath = $nodeCmd.Source
    }

    Write-Host "== npm-Abhaengigkeiten installieren ==" -ForegroundColor Cyan
    Push-Location $script:ServerDir
    try { Invoke-Native npm install --omit=dev }
    finally { Pop-Location }

    Write-Host "== systemd-Dienst einrichten ==" -ForegroundColor Cyan
    $currentUser = (& whoami).Trim()
    $unitContent = @"
[Unit]
Description=Stellare Industrien Spiel-Server
After=network.target

[Service]
Type=simple
WorkingDirectory=$script:ServerDir
ExecStart=$nodePath server.js
Restart=always
RestartSec=3
Environment=PORT=$Port
User=$currentUser

[Install]
WantedBy=multi-user.target
"@
    $tmpUnit = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tmpUnit -Value $unitContent -NoNewline
    Invoke-Native sudo cp $tmpUnit $script:UnitTarget
    Remove-Item $tmpUnit -Force
    Invoke-Native sudo systemctl daemon-reload
    Invoke-Native sudo systemctl enable $script:ServiceName
    Invoke-Native sudo systemctl restart $script:ServiceName

    Start-Sleep -Seconds 2
    Get-StellareServerStatus -Port $Port

    $addresses = Get-StellarePiAddress
    Write-Host ""
    Write-Host "Server laeuft auf Port $Port und startet automatisch bei jedem Boot." -ForegroundColor Green
    if($addresses.Count -gt 0){
        Write-Host "Erreichbar im Heimnetzwerk unter:" -ForegroundColor Green
        foreach($a in $addresses){ Write-Host "  http://${a}:$Port" -ForegroundColor Green }
    }
    Write-Host "Admin-Login in der App: Benutzername 'admin', Passwort 'Scheissexbox2.'" -ForegroundColor Green
}

function Start-StellareServer {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl start $script:ServiceName
    Get-StellareServerStatus
}

function Stop-StellareServer {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl stop $script:ServiceName
    Write-Host "Server gestoppt." -ForegroundColor Yellow
}

function Restart-StellareServer {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl restart $script:ServiceName
    Start-Sleep -Seconds 1
    Get-StellareServerStatus
}

function Enable-StellareAutostart {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl enable $script:ServiceName
    Write-Host "Autostart beim Booten aktiviert." -ForegroundColor Green
}

function Disable-StellareAutostart {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl disable $script:ServiceName
    Write-Host "Autostart beim Booten deaktiviert." -ForegroundColor Yellow
}

function Get-StellareServerStatus {
    <#
    .SYNOPSIS
        Zeigt den systemd-Dienststatus und prueft den API-Gesundheitsendpunkt.
    #>
    [CmdletBinding()]
    param([int]$Port = 3000)
    & sudo systemctl status $script:ServiceName --no-pager -l
    Write-Host ""
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 3
        Write-Host "API erreichbar: $($health.players) Spieler registriert, Laufzeit $([math]::Round($health.uptime))s" -ForegroundColor Green
    } catch {
        Write-Host "API auf Port $Port nicht erreichbar (Dienst startet evtl. noch oder anderer Port konfiguriert)." -ForegroundColor Yellow
    }
}

function Get-StellareServerLog {
    <#
    .SYNOPSIS
        Zeigt die Server-Logs (optional live per -Follow).
    #>
    [CmdletBinding()]
    param(
        [int]$Lines = 100,
        [switch]$Follow
    )
    if($Follow){
        & sudo journalctl -u $script:ServiceName -f
    } else {
        & sudo journalctl -u $script:ServiceName -n $Lines --no-pager
    }
}

function Backup-StellareUniverse {
    <#
    .SYNOPSIS
        Sichert die aktuelle Universumsdatei (alle Accounts + Imperien) mit Zeitstempel.
    #>
    [CmdletBinding()]
    param([string]$Destination)
    if(-not (Test-Path $script:UniverseFile)){
        Write-Warning "Keine Universumsdatei gefunden unter $script:UniverseFile (Server evtl. noch nie gestartet)."
        return $null
    }
    if(-not $Destination){
        $backupDir = Join-Path $script:ServerDir 'backups'
        if(-not (Test-Path $backupDir)){ New-Item -ItemType Directory -Path $backupDir | Out-Null }
        $stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
        $Destination = Join-Path $backupDir "universe-$stamp.json"
    }
    Copy-Item -Path $script:UniverseFile -Destination $Destination -Force
    Write-Host "Backup gespeichert: $Destination" -ForegroundColor Green
    return $Destination
}

function Reset-StellareUniverse {
    <#
    .SYNOPSIS
        Setzt das gesamte Universum vollstaendig zurueck: loescht ALLE registrierten
        Accounts und Imperien unwiderruflich (das Admin-Konto wird beim naechsten
        Start automatisch neu angelegt).
    .DESCRIPTION
        Fragt standardmaessig eine Bestaetigung ab und erstellt vorher automatisch
        ein Backup. Mit -Force wird ohne Rueckfrage zurueckgesetzt (z.B. fuer
        Skripte); mit -SkipBackup wird kein Sicherheits-Backup erstellt.
    #>
    [CmdletBinding()]
    param([switch]$Force, [switch]$SkipBackup)

    if(-not (Test-Path $script:UniverseFile)){
        Write-Warning "Keine Universumsdatei gefunden unter $script:UniverseFile - nichts zurueckzusetzen."
        return
    }

    if(-not $Force){
        Write-Host "WARNUNG: Dies loescht ALLE registrierten Spieler und Imperien unwiderruflich!" -ForegroundColor Red
        $answer = Read-Host "Zum Bestaetigen 'ZURUECKSETZEN' eintippen (sonst abbrechen)"
        if($answer -ne 'ZURUECKSETZEN'){
            Write-Host "Abgebrochen, nichts wurde geloescht." -ForegroundColor Yellow
            return
        }
    }

    if(-not $SkipBackup){
        Write-Host "Erstelle Sicherheits-Backup vor dem Zuruecksetzen..." -ForegroundColor Cyan
        Backup-StellareUniverse | Out-Null
    }

    $wasRunning = $false
    try {
        $status = & sudo systemctl is-active $script:ServiceName 2>$null
        $wasRunning = ($status -eq 'active')
    } catch { }

    if($wasRunning){
        Write-Host "Stoppe Server..." -ForegroundColor Cyan
        Invoke-Native sudo systemctl stop $script:ServiceName
    }

    Remove-Item -Path $script:UniverseFile -Force
    Write-Host "Universum zurueckgesetzt." -ForegroundColor Green

    if($wasRunning){
        Write-Host "Starte Server neu (mit frischem Universum)..." -ForegroundColor Cyan
        Invoke-Native sudo systemctl start $script:ServiceName
        Start-Sleep -Seconds 2
        Get-StellareServerStatus
    }
}

function Update-StellareServer {
    <#
    .SYNOPSIS
        Zieht die neueste Version (git pull), installiert Abhaengigkeiten neu
        und startet den Dienst neu.
    #>
    [CmdletBinding()]
    param()
    if(Test-Path (Join-Path $script:RepoRoot '.git')){
        Write-Host "== Git pull ==" -ForegroundColor Cyan
        Push-Location $script:RepoRoot
        try { Invoke-Native git pull }
        finally { Pop-Location }
    } else {
        Write-Warning "Kein Git-Repository unter $script:RepoRoot gefunden - Aktualisierung ueberspringen (Dateien manuell kopieren)."
    }
    Push-Location $script:ServerDir
    try { Invoke-Native npm install --omit=dev }
    finally { Pop-Location }
    Restart-StellareServer
}

function Uninstall-StellareServer {
    <#
    .SYNOPSIS
        Entfernt den systemd-Dienst wieder. Die Spieldaten bleiben standardmaessig erhalten.
    #>
    [CmdletBinding()]
    param([switch]$RemoveData)
    try { Invoke-Native sudo systemctl stop $script:ServiceName } catch { Write-Warning $_.Exception.Message }
    try { Invoke-Native sudo systemctl disable $script:ServiceName } catch { Write-Warning $_.Exception.Message }
    if(Test-Path $script:UnitTarget){ Invoke-Native sudo rm $script:UnitTarget }
    Invoke-Native sudo systemctl daemon-reload
    if($RemoveData){
        if(Test-Path $script:DataDir){ Remove-Item -Recurse -Force $script:DataDir }
        Write-Host "Dienst und Spieldaten entfernt." -ForegroundColor Yellow
    } else {
        Write-Host "Dienst entfernt. Spieldaten bleiben unter $script:DataDir erhalten." -ForegroundColor Green
    }
}

function Install-StellareCloudflared {
    <#
    .SYNOPSIS
        Laedt das cloudflared-Binary passend zur Architektur des Pi herunter, falls noch nicht
        vorhanden oder nicht lauffaehig (z.B. falsche Architektur von einem frueheren Versuch).
    #>
    [CmdletBinding()]
    param([switch]$Force)

    if((Test-Path $script:TunnelBinary) -and -not $Force){
        $versionOutput = $null
        $works = $false
        try {
            $versionOutput = & $script:TunnelBinary --version 2>&1
            $works = ($LASTEXITCODE -eq 0)
        } catch { $works = $false }
        if($works){
            Write-Host "cloudflared bereits installiert: $versionOutput" -ForegroundColor Green
            return
        }
        Write-Warning "Vorhandenes cloudflared unter $script:TunnelBinary laesst sich nicht ausfuehren (evtl. falsche Architektur von einem frueheren Versuch) - wird neu heruntergeladen."
        Invoke-Native sudo rm -f $script:TunnelBinary
    } elseif(Test-Path $script:TunnelBinary){
        Invoke-Native sudo rm -f $script:TunnelBinary
    }

    $archRaw = (& uname -m).Trim()
    Write-Host "Erkannte Architektur: $archRaw" -ForegroundColor Cyan
    $arch = switch ($archRaw) {
        'aarch64' { 'arm64' }
        'arm64'   { 'arm64' }
        'armv7l'  { 'arm' }
        'armv6l'  { 'arm' }
        'x86_64'  { 'amd64' }
        'amd64'   { 'amd64' }
        default   { throw "Nicht unterstuetzte Architektur fuer cloudflared: $archRaw" }
    }
    Write-Host "Lade cloudflared ($arch)..." -ForegroundColor Cyan
    $tmp = [System.IO.Path]::GetTempFileName()
    Invoke-Native curl -fsSL -o $tmp "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$arch"
    Invoke-Native sudo install -m 0755 $tmp $script:TunnelBinary
    Remove-Item $tmp -Force

    $versionOutput = $null
    $works = $false
    try {
        $versionOutput = & $script:TunnelBinary --version 2>&1
        $works = ($LASTEXITCODE -eq 0)
    } catch { $works = $false }
    if(-not $works){
        throw "cloudflared wurde heruntergeladen, laesst sich aber nicht ausfuehren (Exec format error?). Erkannte Architektur: '$archRaw' -> '$arch'. Bitte 'uname -m' und 'cat /etc/os-release' pruefen und mitteilen."
    }
    Write-Host "cloudflared installiert: $versionOutput" -ForegroundColor Green
}

function Install-StellareTunnel {
    <#
    .SYNOPSIS
        Richtet einen Cloudflare Quick Tunnel als systemd-Dienst ein, der den lokalen
        Server unter einer zufaelligen *.trycloudflare.com-Adresse aus dem gesamten
        Internet erreichbar macht - ganz ohne Portweiterleitung am Router.
    .DESCRIPTION
        Ohne eigene Domain aendert sich die Adresse bei jedem Neustart des Tunnels.
        Mit Get-StellareTunnelAddress laesst sie sich jederzeit erneut abrufen.
    #>
    [CmdletBinding()]
    param([int]$Port = 3000, [switch]$Force)

    Install-StellareCloudflared -Force:$Force

    Write-Host "== Tunnel-Dienst einrichten ==" -ForegroundColor Cyan
    $currentUser = (& whoami).Trim()
    $unitContent = @"
[Unit]
Description=Stellare Industrien Cloudflare Tunnel
After=network.target stellare-industrien.service
Wants=stellare-industrien.service

[Service]
Type=simple
ExecStart=$script:TunnelBinary tunnel --no-autoupdate --metrics 127.0.0.1:$script:TunnelMetricsPort --url http://127.0.0.1:$Port
Restart=always
RestartSec=3
User=$currentUser

[Install]
WantedBy=multi-user.target
"@
    $tmpUnit = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tmpUnit -Value $unitContent -NoNewline
    Invoke-Native sudo cp $tmpUnit $script:TunnelUnitTarget
    Remove-Item $tmpUnit -Force
    Invoke-Native sudo systemctl daemon-reload
    Invoke-Native sudo systemctl enable $script:TunnelServiceName
    Invoke-Native sudo systemctl restart $script:TunnelServiceName

    Write-Host "Warte auf die oeffentliche Tunnel-Adresse..." -ForegroundColor Cyan
    $addr = Get-StellareTunnelAddress -MaxWaitSeconds 25
    Write-Host ""
    if($addr){
        Write-Host "Server ist jetzt von ueberall im Internet erreichbar unter:" -ForegroundColor Green
        Write-Host "  $addr" -ForegroundColor Green
        Write-Host "Diese Adresse in der App unter 'Server aendern' eintragen (mit https://)." -ForegroundColor Green
    } else {
        Write-Warning "Tunnel-Adresse konnte noch nicht ermittelt werden. Gleich erneut versuchen mit: ./stellare.ps1 tunnel-address"
    }
    Write-Host "Hinweis: Bei jedem Neustart des Tunnels (Reboot, Absturz, manueller Neustart)" -ForegroundColor Yellow
    Write-Host "aendert sich diese Adresse - dann einfach './stellare.ps1 tunnel-address' erneut aufrufen." -ForegroundColor Yellow
}

function Start-StellareTunnel {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl start $script:TunnelServiceName
    Get-StellareTunnelAddress -MaxWaitSeconds 20 | Out-Null
}

function Stop-StellareTunnel {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl stop $script:TunnelServiceName
    Write-Host "Tunnel gestoppt. Server ist nur noch im lokalen Netzwerk erreichbar." -ForegroundColor Yellow
}

function Restart-StellareTunnel {
    [CmdletBinding()] param()
    Invoke-Native sudo systemctl restart $script:TunnelServiceName
    Write-Host "Warte auf neue Tunnel-Adresse..." -ForegroundColor Cyan
    $addr = Get-StellareTunnelAddress -MaxWaitSeconds 20
    if($addr){ Write-Host "Neue Adresse: $addr" -ForegroundColor Green }
}

function Get-StellareTunnelQuickUrl {
    <#
    .SYNOPSIS
        Fragt die aktuelle *.trycloudflare.com-Adresse direkt bei cloudflareds lokalem
        Metrics-Endpunkt ab (/quicktunnel) - unabhaengig vom Journal-Log und dessen
        Rotation, und OHNE den Tunnel oder Server neu zu starten.
    .DESCRIPTION
        Funktioniert nur, wenn der Tunnel-Dienst mit "--metrics 127.0.0.1:<port>"
        gestartet wurde (seit diesem Update Standard bei Install-StellareTunnel).
        Bei aelteren, bereits laufenden Tunnel-Diensten ohne --metrics-Flag liefert
        dies $null zurueck; dann greift Get-StellareTunnelAddress automatisch auf
        das Log zurueck bzw. es hilft ein einmaliger "tunnel-restart".
    #>
    [CmdletBinding()]
    param([int]$Port = $script:TunnelMetricsPort)
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/quicktunnel" -TimeoutSec 2 -ErrorAction Stop
        if($resp -and $resp.hostname){ return "https://$($resp.hostname)" }
    } catch { }
    return $null
}

function Get-StellareTunnelAddress {
    <#
    .SYNOPSIS
        Ermittelt die aktuelle oeffentliche *.trycloudflare.com-Adresse - zuerst ueber
        cloudflareds Metrics-Endpunkt (schnell, kein Neustart noetig, funktioniert auch
        nach geleertem Log), als Fallback aus den Tunnel-Logs (fuer aeltere Tunnel-
        Dienste ohne --metrics-Flag).
    #>
    [CmdletBinding()]
    param([int]$MaxWaitSeconds = 5)
    $deadline = (Get-Date).AddSeconds($MaxWaitSeconds)
    do {
        $quick = Get-StellareTunnelQuickUrl
        if($quick){ Write-Host $quick; return $quick }

        $log = & sudo journalctl -u $script:TunnelServiceName -n 300 --no-pager 2>$null
        $urls = @()
        foreach($line in $log){
            foreach($m in [regex]::Matches($line, 'https://[a-z0-9-]+\.trycloudflare\.com')){
                $urls += $m.Value
            }
        }
        if($urls.Count -gt 0){
            $url = $urls[-1]
            Write-Host $url
            return $url
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)
    Write-Warning "Keine Tunnel-Adresse gefunden (weder ueber Metrics-Endpunkt noch im Log)."
    Write-Warning "Laeuft der Tunnel? -> ./stellare.ps1 tunnel-status"
    Write-Warning "Falls der Tunnel-Dienst noch VOR diesem Update eingerichtet wurde, hat er keinen"
    Write-Warning "Metrics-Endpunkt aktiv. Einmalig './stellare.ps1 tunnel-restart' behebt das dauerhaft"
    Write-Warning "(der Spiele-Server selbst bleibt davon unberuehrt und laeuft durchgehend weiter)."
    return $null
}

function Get-StellareTunnelStatus {
    [CmdletBinding()] param()
    & sudo systemctl status $script:TunnelServiceName --no-pager -l
}

function Get-StellareTunnelLog {
    [CmdletBinding()]
    param([int]$Lines = 100, [switch]$Follow)
    if($Follow){ & sudo journalctl -u $script:TunnelServiceName -f }
    else { & sudo journalctl -u $script:TunnelServiceName -n $Lines --no-pager }
}

function Clear-StellareTunnelLog {
    <#
    .SYNOPSIS
        Leert die Tunnel-Logs, OHNE den Tunnel oder den Spiele-Server anzufassen -
        beide laufen währenddessen und danach ununterbrochen weiter.
    .DESCRIPTION
        journald speichert Logs nicht separat pro Dienst, sondern in gemeinsamen
        Journal-Dateien - "leeren" heisst hier: aktuelle Journal-Datei rotieren und
        alles Aeltere als 1 Sekunde wegraeumen (--rotate + --vacuum-time=1s). Das
        betrifft das gesamte System-Journal (alle Dienste), nicht nur den Tunnel -
        es werden dabei aber ausschliesslich Log-DATEIEN geloescht, kein laufender
        Prozess wird gestoppt, neugestartet oder sonst beeinflusst.
    #>
    [CmdletBinding()]
    param()
    Write-Host "Leere System-Journal (Tunnel und Server bleiben dabei durchgehend aktiv)..." -ForegroundColor Cyan
    Invoke-Native sudo journalctl --rotate
    Invoke-Native sudo journalctl --vacuum-time=1s
    Write-Host "Journal geleert." -ForegroundColor Green
    Write-Host "Hinweis: Falls dadurch die letzte bekannte Tunnel-Adresse verschwunden ist, hilft" -ForegroundColor Yellow
    Write-Host "jetzt './stellare.ps1 tunnel-address' trotzdem sofort weiter, wenn der Tunnel-Dienst" -ForegroundColor Yellow
    Write-Host "mit aktivem Metrics-Endpunkt laeuft (Standard seit diesem Update)." -ForegroundColor Yellow
}

function Uninstall-StellareTunnel {
    [CmdletBinding()] param()
    try { Invoke-Native sudo systemctl stop $script:TunnelServiceName } catch { Write-Warning $_.Exception.Message }
    try { Invoke-Native sudo systemctl disable $script:TunnelServiceName } catch { Write-Warning $_.Exception.Message }
    if(Test-Path $script:TunnelUnitTarget){ Invoke-Native sudo rm $script:TunnelUnitTarget }
    Invoke-Native sudo systemctl daemon-reload
    Write-Host "Tunnel-Dienst entfernt. Server ist nur noch im lokalen Netzwerk erreichbar." -ForegroundColor Green
}

Export-ModuleMember -Function `
    Install-StellareServer, Start-StellareServer, Stop-StellareServer, Restart-StellareServer, `
    Get-StellareServerStatus, Get-StellareServerLog, Backup-StellareUniverse, Reset-StellareUniverse, Update-StellareServer, `
    Uninstall-StellareServer, Enable-StellareAutostart, Disable-StellareAutostart, Get-StellarePiAddress, `
    Install-StellareCloudflared, Install-StellareTunnel, Start-StellareTunnel, Stop-StellareTunnel, `
    Restart-StellareTunnel, Get-StellareTunnelAddress, Get-StellareTunnelQuickUrl, Get-StellareTunnelStatus, `
    Get-StellareTunnelLog, Clear-StellareTunnelLog, Uninstall-StellareTunnel
