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
#>
param(
    [Parameter(Position=0)]
    [ValidateSet('install','start','stop','restart','status','logs','backup','update','uninstall','enable-autostart','disable-autostart','address','help')]
    [string]$Command = 'help',

    [int]$Port = 3000,
    [int]$Lines = 100,
    [switch]$Follow,
    [switch]$RemoveData
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
    'update'            { Update-StellareServer }
    'uninstall'         { Uninstall-StellareServer -RemoveData:$RemoveData }
    'enable-autostart'  { Enable-StellareAutostart }
    'disable-autostart' { Disable-StellareAutostart }
    'address'           { Get-StellarePiAddress | ForEach-Object { Write-Host $_ } }
    default {
        @'
Stellare Industrien Server - Steuerung (PowerShell)

Verwendung: ./stellare.ps1 <Befehl> [Optionen]

Befehle:
  install                     Node.js pruefen/installieren, Abhaengigkeiten
                               installieren, systemd-Dienst einrichten und starten
  start                       Server starten
  stop                        Server stoppen
  restart                     Server neu starten
  status                      Dienststatus + API-Gesundheitscheck anzeigen
  logs [-Lines n] [-Follow]   Server-Logs anzeigen (optional live verfolgen)
  backup                      Universum-Datei sichern (server/backups/)
  update                      git pull + npm install + Neustart
  uninstall [-RemoveData]     systemd-Dienst entfernen (Spieldaten bleiben,
                               ausser -RemoveData wird angegeben)
  enable-autostart            Autostart beim Booten aktivieren
  disable-autostart           Autostart beim Booten deaktivieren
  address                     LAN-IP-Adresse(n) des Pi anzeigen

Beispiele:
  ./stellare.ps1 install -Port 3000
  ./stellare.ps1 status
  ./stellare.ps1 logs -Follow
'@ | Write-Host
    }
}
