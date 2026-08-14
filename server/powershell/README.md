# Stellare Industrien Server – Steuerung über PowerShell (Raspberry Pi OS 13 „Trixie“)

Diese Anleitung richtet den Server auf einem Raspberry Pi mit Raspberry Pi OS 13
(Trixie, 64-Bit empfohlen) ein und steuert ihn danach **ausschließlich über
PowerShell** (`pwsh`) – kein manuelles `systemctl`/`journalctl`/`apt` mehr
nötig, das übernehmen die Skripte hier für dich.

## 1. Einmaliges Bootstrap: PowerShell installieren

PowerShell existiert auf einem frischen Raspberry Pi OS nicht von Haus aus.
Dieser **eine** Schritt läuft deshalb zwangsläufig noch über die normale
Shell – direkt danach ist PowerShell da und übernimmt alles Weitere:

```bash
cd Interstellar-Industries/server/powershell
bash bootstrap-pwsh.sh
```

Das Skript erkennt die Architektur automatisch (arm64/arm32/x64), lädt die
passende offizielle PowerShell-Version von Microsoft herunter und installiert
sie nach `/opt/microsoft/powershell/7` mit einem Symlink auf `/usr/bin/pwsh`.
Das ist nötig, weil Trixie noch zu neu für Microsofts offizielles APT-Repo
sein kann – die Binärarchiv-Methode funktioniert unabhängig davon garantiert.

Prüfen:
```bash
pwsh -v
```

Ab jetzt einfach `pwsh` aufrufen, um in eine interaktive PowerShell-Sitzung
zu wechseln, oder Befehle direkt mit `pwsh -File ./stellare.ps1 <befehl>`
ausführen.

## 2. Server installieren

Innerhalb von PowerShell (`pwsh`):

```powershell
cd Interstellar-Industries/server/powershell
./stellare.ps1 install
```

Das erledigt automatisch:
- prüft, ob Node.js ≥ 18 vorhanden ist, installiert es sonst über NodeSource
- installiert die npm-Abhängigkeiten des Servers
- erstellt/aktualisiert einen systemd-Dienst (`stellare-industrien`), der den
  Server dauerhaft laufen lässt – auch nach einem Neustart des Pi
- startet den Dienst sofort und zeigt Status + LAN-Adresse an

Ein anderer Port als der Standard 3000 lässt sich mit `-Port` angeben, z.B.
`./stellare.ps1 install -Port 3500`.

## 3. Alle Befehle

```powershell
./stellare.ps1 start                # Server starten
./stellare.ps1 stop                 # Server stoppen
./stellare.ps1 restart              # Server neu starten
./stellare.ps1 status               # Dienststatus + API-Gesundheitscheck
./stellare.ps1 logs                 # letzte 100 Log-Zeilen
./stellare.ps1 logs -Follow         # Logs live mitverfolgen (Strg+C zum Beenden)
./stellare.ps1 backup               # Universum-Datei sichern (server/backups/)
./stellare.ps1 update               # git pull + npm install + Neustart
./stellare.ps1 enable-autostart     # Autostart beim Booten an
./stellare.ps1 disable-autostart    # Autostart beim Booten aus
./stellare.ps1 address              # LAN-IP-Adresse(n) des Pi anzeigen
./stellare.ps1 uninstall            # Dienst entfernen (Spieldaten bleiben)
./stellare.ps1 uninstall -RemoveData # Dienst UND Spieldaten entfernen
./stellare.ps1 help                 # Kurzübersicht
```

Diese Befehle rufen intern `systemctl`/`journalctl`/`apt` über `sudo` auf –
das ist auf Linux normal (PowerShell wrappt hier dieselben Systemwerkzeuge,
die auch `bash` benutzen würde), du selbst tippst dabei aber nie etwas
anderes als PowerShell-Befehle.

## 4. Für Fortgeschrittene: das Modul direkt nutzen

Alle Funktionen stehen auch als eigenständige PowerShell-Cmdlets zur
Verfügung, wenn du das Modul importierst:

```powershell
Import-Module ./StellareIndustrien.psm1
Get-StellareServerStatus
Get-StellareServerLog -Lines 200
Backup-StellareUniverse -Destination "~/meine-sicherung.json"
```

## 5. Fernsteuerung von einem Windows-PC aus

Auch von einem Windows-Rechner mit PowerShell lässt sich der Pi rein über
PowerShell steuern, per SSH (Raspberry Pi OS hat den SSH-Server standardmäßig
aktivierbar über `raspi-config`):

```powershell
ssh pi@<Pi-IP-Adresse> "pwsh -File ~/Interstellar-Industries/server/powershell/stellare.ps1 status"
```

Oder interaktiv einloggen und danach nur noch mit `pwsh` weiterarbeiten:
```powershell
ssh pi@<Pi-IP-Adresse>
pwsh
cd Interstellar-Industries/server/powershell
./stellare.ps1 status
```
