#!/usr/bin/env bash
# Einmaliges Bootstrap fuer Raspberry Pi OS 13 (Trixie): installiert PowerShell (pwsh).
#
# Dies ist der EINZIGE Schritt der gesamten Einrichtung, der nicht in PowerShell
# passieren kann - PowerShell existiert an dieser Stelle ja noch nicht auf dem
# System. Direkt danach laeuft alles Weitere ausschliesslich ueber PowerShell
# (stellare.ps1). Dieses Skript muss nur EIN einziges Mal ausgefuehrt werden.
#
# Aufruf:
#   bash bootstrap-pwsh.sh
set -euo pipefail

PWSH_VERSION="7.4.6"
ARCH="$(uname -m)"
case "$ARCH" in
  aarch64) PWSH_ARCH="arm64" ;;
  armv7l|armv6l) PWSH_ARCH="arm32" ;;
  x86_64) PWSH_ARCH="x64" ;;
  *) echo "Nicht unterstuetzte Architektur: $ARCH" >&2; exit 1 ;;
esac

if command -v pwsh >/dev/null 2>&1; then
  echo "PowerShell ist bereits installiert:"
  pwsh -v
  exit 0
fi

echo "Lade PowerShell $PWSH_VERSION ($PWSH_ARCH) fuer Raspberry Pi OS..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL -o "$TMP/pwsh.tar.gz" \
  "https://github.com/PowerShell/PowerShell/releases/download/v${PWSH_VERSION}/powershell-${PWSH_VERSION}-linux-${PWSH_ARCH}.tar.gz"

sudo mkdir -p /opt/microsoft/powershell/7
sudo tar -xzf "$TMP/pwsh.tar.gz" -C /opt/microsoft/powershell/7
sudo chmod +x /opt/microsoft/powershell/7/pwsh
sudo ln -sf /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh

echo ""
echo "PowerShell installiert:"
pwsh -v
echo ""
echo "Ab jetzt laeuft alles Weitere ueber PowerShell, z.B.:"
echo "  cd Interstellar-Industries/server/powershell"
echo "  pwsh ./stellare.ps1 install"
echo ""
echo "Tipp: 'pwsh' startet eine interaktive PowerShell-Sitzung, in der du danach"
echo "auch ohne das 'pwsh'-Praefix arbeiten kannst, z.B. './stellare.ps1 status'."
