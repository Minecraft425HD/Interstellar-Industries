# Stellare Industrien – Server (Raspberry Pi)

Dieser Server ist ein echter Mehrspieler-Server: mehrere Personen können sich
mit eigenem Konto (Benutzername + Passwort) anmelden und spielen gemeinsam im
selben Universum – inklusive gegenseitiger Spionage, Angriffe, Transporte und
Raketenbeschuss. Der Server läuft dauerhaft, auch wenn kein Client (die
Android-App) verbunden ist: Ressourcenproduktion, Bau- und
Forschungswarteschlangen sowie Flottenankünfte werden serverseitig jede
Sekunde für jeden Spieler weitergerechnet und auf Platte gespeichert.

## Konten & Registrierung

Jeder Spieler registriert sich in der App selbst (Reiter "Neues Konto"):
Benutzername, Passwort, und die gewünschte Startposition (Galaxie, System,
freie Position im System werden direkt in der App angezeigt und ausgewählt).
Passwörter werden serverseitig gehasht gespeichert (nie im Klartext).

## Admin-Modus

Für Wartung/Debugging gibt es ein festes Admin-Konto:
- Benutzername: `admin`
- Passwort: `Scheissexbox2.`

Meldet man sich in der App mit diesen Daten an, öffnet sich statt des Spiels
ein Admin-Panel mit einer Liste aller registrierten Spieler (Punkte, Planeten,
Heimatkoordinaten, Dunkle Materie). Von dort aus lassen sich Spieler löschen
(z.B. um eine Position wieder freizugeben) oder mit Ressourcen ausstatten.
Das Admin-Konto selbst hat kein eigenes Imperium und kann nicht gelöscht
werden.

## Einrichtung auf dem Raspberry Pi

1. Node.js installieren (Version 18 oder neuer):
   ```
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   node -v
   ```

2. Projekt auf den Pi kopieren (z.B. via `git clone` oder `scp`), dann in den
   `server`-Ordner wechseln:
   ```
   cd Interstellar-Industries/server
   npm install --production
   ```

3. Server manuell testen:
   ```
   npm start
   ```
   Die Konsole zeigt die IP-Adresse, unter der der Server erreichbar ist.
   Die IP-Adresse des Pi im lokalen Netzwerk findet man mit `hostname -I`.

4. Mit `Strg+C` beenden – der Spielstand wird beim Beenden automatisch
   gespeichert.

## Dauerhaft laufen lassen (systemd)

Damit der Server automatisch beim Booten startet und sich nach einem Absturz
selbst neu startet:

1. `stellare-industrien.service` nach `/etc/systemd/system/` kopieren und den
   Pfad (`WorkingDirectory`) sowie den Nutzernamen (`User`) an die eigene
   Installation anpassen (Standard-Pfad geht von `/home/pi/...` und Nutzer
   `pi` aus):
   ```
   sudo cp stellare-industrien.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable stellare-industrien
   sudo systemctl start stellare-industrien
   ```

2. Status prüfen:
   ```
   sudo systemctl status stellare-industrien
   ```

3. Logs ansehen:
   ```
   journalctl -u stellare-industrien -f
   ```

Der Server läuft danach dauerhaft im Hintergrund, startet automatisch beim
Neustart des Pi neu und läuft weiter, selbst wenn keine App verbunden ist.

## Port

Standardmäßig läuft der Server auf Port `3000`. Ein anderer Port lässt sich
über die Umgebungsvariable `PORT` setzen (auch in der `.service`-Datei
möglich).

## In der App verbinden

In der Android-App unter "Einstellungen" die Server-Adresse eingeben, z.B.:
```
http://192.168.1.42:3000
```
(Die tatsächliche IP-Adresse des Pi im eigenen Netzwerk verwenden, siehe
`hostname -I` auf dem Pi.) Handy und Pi müssen sich im selben WLAN/Netzwerk
befinden.

## Datensicherung

Der gesamte Universumszustand (alle Konten und Imperien) liegt in
`server/data/universe.json`. Diese Datei kann jederzeit kopiert werden, um
ein Vollbackup zu erstellen. Alternativ bietet die App unter "Einstellungen"
einen Sicherungs-/Wiederherstellungs-Knopf pro Spieler, der über die
Server-API (`/api/backup`, `/api/restore`) nur das eigene Imperium sichert.
