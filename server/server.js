'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const engine = require('./gameEngine');
const auth = require('./auth');

// Manuell synchron zu www/app.js APP_VERSION halten - dient als Diagnosehilfe: ueber
// /api/health (kein Login noetig) laesst sich damit von jedem Browser aus sofort pruefen,
// ob ein Server nach einem "git pull" auch wirklich neu gestartet wurde (Node laedt
// geaenderten Code nicht automatisch nach, nur ein Prozess-Neustart tut das).
const SERVER_VERSION = '1.40';

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'universe.json');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Scheissexbox2.';

function ensureAdminAccount(universe){
  if(!universe.accounts[ADMIN_USERNAME]){
    const { salt, hash } = auth.hashPassword(ADMIN_PASSWORD);
    universe.accounts[ADMIN_USERNAME] = { salt, hash, isAdmin:true, createdAt: Date.now() };
    console.log('Admin-Konto initialisiert (Benutzername: ' + ADMIN_USERNAME + ')');
  }
}

function loadUniverse(){
  try {
    if(fs.existsSync(DATA_FILE)){
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const universe = engine.normalizeUniverse(JSON.parse(raw));
      console.log('Universum geladen aus ' + DATA_FILE + ' ('+Object.keys(universe.players).length+' Spieler)');
      ensureAdminAccount(universe);
      return universe;
    }
  } catch(e){
    console.error('Universum konnte nicht geladen werden, starte neu:', e.message);
  }
  console.log('Kein vorhandenes Universum gefunden, initialisiere neu.');
  const universe = engine.createUniverse();
  ensureAdminAccount(universe);
  return universe;
}

let universe = loadUniverse();
let dirty = false;

function saveUniverse(){
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmpFile = DATA_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(universe));
    fs.renameSync(tmpFile, DATA_FILE);
    dirty = false;
  } catch(e){
    console.error('Universum konnte nicht gespeichert werden:', e.message);
  }
}

// ---- Sessions (in-memory; a restart simply requires logging in again) ----
const sessions = new Map(); // token -> { username, isAdmin, createdAt }
const SESSION_TTL_MS = 30*24*3600*1000;

function issueToken(username, isAdmin){
  const token = auth.genToken();
  sessions.set(token, { username, isAdmin, createdAt: Date.now() });
  return token;
}
function sessionFromHeader(req){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token) return null;
  const s = sessions.get(token);
  if(!s) return null;
  if(Date.now() - s.createdAt > SESSION_TTL_MS){ sessions.delete(token); return null; }
  return { token, ...s };
}

const LOG_BUFFER_MAX = 500;
const logBuffer = [];
function logLine(msg){
  const line = '[' + new Date().toISOString() + '] ' + msg;
  console.log(line);
  logBuffer.push(line);
  if(logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();
}
function clientIp(req){
  const raw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?';
  return String(raw).replace('::ffff:', '');
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Real-time access log: every incoming request, who it was (once authenticated),
// what it hit and how it was answered. Visible live via `journalctl -u stellare-industrien -f`
// or `pwsh ./stellare.ps1 logs -Follow`.
app.use((req, res, next) => {
  const start = Date.now();
  const ip = clientIp(req);
  res.on('finish', () => {
    const dur = Date.now() - start;
    const who = req.username ? (' user=' + req.username + (req.isAdmin ? '(admin)' : '')) : '';
    logLine(ip + ' ' + req.method + ' ' + req.originalUrl + ' -> ' + res.statusCode + ' (' + dur + 'ms)' + who);
  });
  next();
});

// Simple in-memory rate limiting for the unauthenticated auth endpoints, since the
// server may now be reachable from the whole internet (e.g. via a Cloudflare Tunnel)
// instead of just the LAN.
const rateLimitState = new Map(); // key -> { count, windowStart }
function checkRateLimit(key, maxAttempts, windowMs){
  const now = Date.now();
  const entry = rateLimitState.get(key);
  if(!entry || now - entry.windowStart > windowMs){
    rateLimitState.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count++;
  return entry.count <= maxAttempts;
}
setInterval(() => {
  const now = Date.now();
  for(const [key, entry] of rateLimitState.entries()){
    if(now - entry.windowStart > 3600000) rateLimitState.delete(key);
  }
}, 600000);

function requireAuth(req, res, next){
  const session = sessionFromHeader(req);
  if(!session) return res.status(401).json({ ok:false, error:'Nicht angemeldet' });
  req.username = session.username;
  req.isAdmin = session.isAdmin;
  next();
}
function requireAdmin(req, res, next){
  if(!req.isAdmin) return res.status(403).json({ ok:false, error:'Admin-Rechte erforderlich' });
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok:true, version: SERVER_VERSION, uptime: process.uptime(), players: Object.keys(universe.players).length });
});

// Coordinate occupancy for a system — public so the registration screen (no token yet) can show free slots.
app.get('/api/galaxy', (req, res) => {
  const galaxy = Number(req.query.galaxy), system = Number(req.query.system);
  if(!engine.validCoord(galaxy, system, 1)) return res.status(400).json({ ok:false, error:'Ungültige Koordinaten' });
  const session = sessionFromHeader(req);
  const slots = engine.sanitizeGalaxySlotsForClient(engine.seedGalaxy(universe, galaxy, system, session ? session.username : null));
  res.json({ ok:true, slots });
});

app.post('/api/register', (req, res) => {
  const { username, password, galaxy, system, position, planetName } = req.body || {};
  const ip = clientIp(req);
  if(!checkRateLimit('register:' + ip, 8, 3600000)){
    logLine('REGISTER RATE-LIMIT: zu viele Versuche von ' + ip);
    return res.status(429).json({ ok:false, error:'Zu viele Registrierungsversuche. Bitte in einer Stunde erneut versuchen.' });
  }
  if(!username || !password){ logLine('REGISTER FEHLGESCHLAGEN von ' + ip + ': Benutzername/Passwort fehlt'); return res.status(400).json({ ok:false, error:'Benutzername und Passwort erforderlich' }); }
  if(String(password).length < 6){ logLine('REGISTER FEHLGESCHLAGEN von ' + ip + ' (' + username + '): Passwort zu kurz'); return res.status(400).json({ ok:false, error:'Passwort muss mindestens 6 Zeichen haben' }); }
  const coord = [Number(galaxy), Number(system), Number(position)];
  const passwordHash = auth.hashPassword(password);
  const result = engine.registerAccount(universe, username, passwordHash, coord, planetName);
  if(!result.ok){ logLine('REGISTER FEHLGESCHLAGEN von ' + ip + ' (' + username + ' @ ' + coord.join(':') + '): ' + result.error); return res.status(400).json(result); }
  dirty = true; saveUniverse();
  const uname = String(username).trim();
  const token = issueToken(uname, false);
  logLine('REGISTER OK: ' + uname + ' @ [' + coord.join(':') + '] von ' + ip);
  res.json({ ok:true, token, username: uname, isAdmin:false });
});

app.post('/api/login', (req, res) => {
  const uname = String((req.body && req.body.username) || '').trim();
  const password = (req.body && req.body.password) || '';
  const ip = clientIp(req);
  if(!checkRateLimit('login:' + ip, 15, 300000)){
    logLine('LOGIN RATE-LIMIT: zu viele Versuche von ' + ip);
    return res.status(429).json({ ok:false, error:'Zu viele Loginversuche. Bitte kurz warten.' });
  }
  const account = universe.accounts[uname];
  if(!account || !auth.verifyPassword(password, account.salt, account.hash)){
    logLine('LOGIN FEHLGESCHLAGEN: "' + uname + '" von ' + ip);
    return res.status(401).json({ ok:false, error:'Benutzername oder Passwort falsch' });
  }
  const token = issueToken(uname, !!account.isAdmin);
  logLine('LOGIN OK: ' + uname + (account.isAdmin ? ' (admin)' : '') + ' von ' + ip);
  res.json({ ok:true, token, username: uname, isAdmin: !!account.isAdmin });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const session = sessionFromHeader(req);
  if(session) sessions.delete(session.token);
  res.json({ ok:true });
});

app.get('/api/state', requireAuth, (req, res) => {
  const empire = universe.players[req.username];
  if(!empire) return res.json({ ok:true, isAdmin: req.isAdmin, username: req.username, planets: null });
  res.json(Object.assign({ ok:true, isAdmin: req.isAdmin, username: req.username, serverVersion: SERVER_VERSION, auction: engine.getPublicAuctionView(universe), event: engine.getPublicEventView(universe), alliance: engine.getPlayerAllianceView(universe, req.username), alliancesList: engine.getAlliancesListView(universe), tradeOffers: engine.getPublicTradeOffersView(universe), napOffers: engine.getPublicNapOffersView(universe) }, empire));
});

app.post('/api/action', requireAuth, (req, res) => {
  const { type, payload } = req.body || {};
  if(!type) return res.status(400).json({ ok:false, error:'Kein Aktionstyp angegeben' });
  if(!universe.players[req.username]) return res.status(400).json({ ok:false, error:'Dieses Konto hat kein Spielerimperium (Admin-Konten spielen nicht mit)' });
  try {
    const result = engine.applyAction(universe, req.username, type, payload);
    dirty = true;
    saveUniverse();
    logLine('AKTION ' + (result.ok ? 'OK' : 'ABGELEHNT') + ': ' + req.username + ' -> ' + type + (result.message ? (' :: ' + result.message) : ''));
    res.json({ ok: result.ok, message: result.message, state: Object.assign({ isAdmin: req.isAdmin, username: req.username }, universe.players[req.username]) });
  } catch(err){
    logLine('AKTION FEHLER: ' + req.username + ' -> ' + type + ' :: ' + err.message);
    res.status(400).json({ ok:false, error: err.message });
  }
});

app.get('/api/backup', requireAuth, (req, res) => {
  if(!universe.players[req.username]) return res.status(400).json({ ok:false, error:'Kein Spielerimperium' });
  res.setHeader('Content-Disposition', 'attachment; filename="stellare-industrien-backup.json"');
  res.json(universe.players[req.username]);
});

app.post('/api/restore', requireAuth, (req, res) => {
  try {
    if(!universe.players[req.username]) return res.status(400).json({ ok:false, error:'Kein Spielerimperium' });
    universe.players[req.username] = engine.normalizePlayerState(req.body);
    dirty = true; saveUniverse();
    res.json({ ok:true, state: Object.assign({ isAdmin: req.isAdmin, username: req.username }, universe.players[req.username]) });
  } catch(err){
    res.status(400).json({ ok:false, error: err.message });
  }
});

app.get('/api/highscore', requireAuth, (req, res) => {
  res.json({ ok:true, list: engine.computeHighscore(universe) });
});

app.get('/api/admin/players', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok:true, players: engine.adminListPlayers(universe) });
});
app.get('/api/admin/log', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok:true, lines: logBuffer });
});
app.post('/api/admin/deletePlayer', requireAuth, requireAdmin, (req, res) => {
  const target = req.body && req.body.username;
  const result = engine.adminDeletePlayer(universe, target);
  if(result.ok){
    dirty=true; saveUniverse();
    // Noch gueltige Anmelde-Sessions des geloeschten Kontos sofort ungueltig machen,
    // statt sie bis zum natuerlichen Ablauf (30 Tage) weiter zu akzeptieren.
    for(const [token, session] of sessions.entries()){ if(session.username===target) sessions.delete(token); }
  }
  logLine('ADMIN ' + req.username + (result.ok ? ' loeschte Spieler ' : ' konnte Spieler NICHT loeschen ') + target + (result.error ? (' :: ' + result.error) : ''));
  res.status(result.ok?200:400).json(result);
});
app.post('/api/admin/grantResources', requireAuth, requireAdmin, (req, res) => {
  const { username, ...res_ } = req.body || {};
  const result = engine.adminGrantResources(universe, username, res_);
  if(result.ok){ dirty=true; saveUniverse(); }
  logLine('ADMIN ' + req.username + (result.ok ? ' gab Ressourcen an ' : ' konnte KEINE Ressourcen geben an ') + username + (result.error ? (' :: ' + result.error) : ''));
  res.status(result.ok?200:400).json(result);
});

// tick loop: the universe keeps advancing for every player even with no client connected
setInterval(() => {
  engine.tick(universe);
  dirty = true;
}, 1000);

// periodic safety-net save (actions already save immediately; this covers pure tick progress)
setInterval(() => {
  if(dirty) saveUniverse();
}, 15000);

function shutdown(){
  console.log('Beende Server, speichere Universum...');
  saveUniverse();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, '0.0.0.0', () => {
  console.log('Stellare Industrien Server läuft auf Port ' + PORT);
  console.log('Im lokalen Netzwerk erreichbar unter http://<Pi-IP>:' + PORT);
  console.log('Admin-Login: Benutzername "' + ADMIN_USERNAME + '"');
});
