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

function Invoke-Native {
    <#
    .SYNOPSIS
        Führt einen externen Befehl aus und wirft einen PowerShell-Fehler, wenn er fehlschlägt.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position=0)][string]$FilePath,
        [Parameter(Position=1, ValueFromRemainingArguments)][string[]]$ArgumentList
    )
    & $FilePath @ArgumentList
    if($LASTEXITCODE -ne 0){
        throw "Befehl fehlgeschlagen: $FilePath $($ArgumentList -join ' ') (Exit-Code $LASTEXITCODE)"
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

Export-ModuleMember -Function `
    Install-StellareServer, Start-StellareServer, Stop-StellareServer, Restart-StellareServer, `
    Get-StellareServerStatus, Get-StellareServerLog, Backup-StellareUniverse, Update-StellareServer, `
    Uninstall-StellareServer, Enable-StellareAutostart, Disable-StellareAutostart, Get-StellarePiAddress
