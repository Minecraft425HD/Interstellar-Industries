#!/usr/bin/env pwsh
#Requires -Version 7.0
<#
.SYNOPSIS
    Steuerung des Stellare-Industrien-Servers - vollstaendig ueber PowerShell.
.EXAMPLE
    ./stellare.ps1 install -Port 3000
.EXAMPLE
    ./stellare.ps1 status
.EXAMPLE
    ./stellare.ps1 logs -Follow
.EXAMPLE
    ./stellare.ps1 tunnel-install
#>
param(
    [Parameter(Position=0)]
    [ValidateSet(
        'install','start','stop','restart','status','logs','backup','reset','update','uninstall',
        'enable-autostart','disable-autostart','address',
        'tunnel-install','tunnel-start','tunnel-stop','tunnel-restart','tunnel-address',
        'tunnel-status','tunnel-logs','tunnel-uninstall',
        'help'
    )]
    [string]$Command = 'help',

    [int]$Port = 3000,
    [int]$Lines = 100,
    [switch]$Follow,
    [switch]$RemoveData,
    [switch]$SkipBackup,
    [switch]$Force
)

Import-Module (Join-Path $PSScriptRoot 'StellareIndustrien.psm1') -Force

switch ($Command) {
    'install'           { Install-StellareServer -Port $Port }
    'start'             { Start-StellareServer }
    'stop'              { Stop-StellareServer }
    'restart'           { Restart-StellareServer }
    'status'            { Get-StellareServerStatus -Port $Port }
    'logs'              { Get-StellareServerLog -Lines $Lines -Follow:$Follow }
    'backup'            { Backup-StellareUniverse }
    'reset'             { Reset-StellareUniverse -Force:$Force -SkipBackup:$SkipBackup }
    'update'            { Update-StellareServer }
    'uninstall'         { Uninstall-StellareServer -RemoveData:$RemoveData }
    'enable-autostart'  { Enable-StellareAutostart }
    'disable-autostart' { Disable-StellareAutostart }
    'address'           { Get-StellarePiAddress | ForEach-Object { Write-Host $_ } }
    'tunnel-install'    { Install-StellareTunnel -Port $Port -Force:$Force }
    'tunnel-start'      { Start-StellareTunnel }
    'tunnel-stop'       { Stop-StellareTunnel }
    'tunnel-restart'    { Restart-StellareTunnel }
    'tunnel-address'    { Get-StellareTunnelAddress -MaxWaitSeconds 5 | Out-Null }
    'tunnel-status'     { Get-StellareTunnelStatus }
    'tunnel-logs'       { Get-StellareTunnelLog -Lines $Lines -Follow:$Follow }
    'tunnel-uninstall'  { Uninstall-StellareTunnel }
    default {
        @'
Stellare Industrien Server - Steuerung (PowerShell)

Verwendung: ./stellare.ps1 <Befehl> [Optionen]

Server-Befehle:
  install                     Node.js pruefen/installieren, Abhaengigkeiten
                               installieren, systemd-Dienst einrichten und starten
  start                       Server starten
  stop                        Server stoppen
  restart                     Server neu starten
  status                      Dienststatus + API-Gesundheitscheck anzeigen
  logs [-Lines n] [-Follow]   Server-Logs anzeigen (optional live verfolgen)
  backup                      Universum-Datei sichern (server/backups/)
  reset [-Force] [-SkipBackup] Universum VOLLSTAENDIG zuruecksetzen (loescht ALLE
                               Accounts/Imperien unwiderruflich). Fragt zur Sicherheit
                               nach ("ZURUECKSETZEN" eintippen), ausser bei -Force.
                               Erstellt vorher automatisch ein Backup, ausser bei
                               -SkipBackup. Stoppt/startet den Server bei Bedarf.
  update                      git pull + npm install + Neustart
  uninstall [-RemoveData]     systemd-Dienst entfernen (Spieldaten bleiben,
                               ausser -RemoveData wird angegeben)
  enable-autostart            Autostart beim Booten aktivieren
  disable-autostart           Autostart beim Booten deaktivieren
  address                     LAN-IP-Adresse(n) des Pi anzeigen

Fernzugriff-Befehle (Cloudflare Tunnel, ohne Portweiterleitung):
  tunnel-install [-Force]       cloudflared installieren + Tunnel-Dienst einrichten/starten,
                                zeigt die oeffentliche https://...trycloudflare.com-Adresse.
                                -Force laedt cloudflared auch dann neu herunter, wenn schon
                                eine (moeglicherweise kaputte) Datei vorhanden ist.
  tunnel-start                 Tunnel starten
  tunnel-stop                  Tunnel stoppen (Server dann nur noch lokal erreichbar)
  tunnel-restart                Tunnel neu starten (Adresse aendert sich dabei!)
  tunnel-address                aktuelle oeffentliche Adresse erneut anzeigen
  tunnel-status                 Tunnel-Dienststatus anzeigen
  tunnel-logs [-Lines n] [-Follow]  Tunnel-Logs anzeigen
  tunnel-uninstall               Tunnel-Dienst entfernen

Beispiele:
  ./stellare.ps1 install -Port 3000
  ./stellare.ps1 status
  ./stellare.ps1 logs -Follow
  ./stellare.ps1 tunnel-install
  ./stellare.ps1 tunnel-address
'@ | Write-Host
    }
}
