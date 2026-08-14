'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const engine = require('./gameEngine');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

function loadState(){
  try {
    if(fs.existsSync(DATA_FILE)){
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const state = engine.normalizeState(JSON.parse(raw));
      console.log('Spielstand geladen aus ' + DATA_FILE);
      return state;
    }
  } catch(e){
    console.error('Spielstand konnte nicht geladen werden, starte neu:', e.message);
  }
  console.log('Kein vorhandener Spielstand gefunden, initialisiere neues Universum.');
  return engine.createInitialState();
}

let state = loadState();
let dirty = false;

function saveState(){
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmpFile = DATA_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(state));
    fs.renameSync(tmpFile, DATA_FILE);
    dirty = false;
  } catch(e){
    console.error('Spielstand konnte nicht gespeichert werden:', e.message);
  }
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), planets: state.planets.length });
});

app.get('/api/state', (req, res) => {
  res.json(state);
});

app.post('/api/action', (req, res) => {
  const { type, payload } = req.body || {};
  if(!type) return res.status(400).json({ ok: false, error: 'Kein Aktionstyp angegeben' });
  try {
    const result = engine.applyAction(state, type, payload);
    dirty = true;
    saveState();
    res.json({ ok: result.ok, message: result.message, state });
  } catch(err){
    console.error('Aktion fehlgeschlagen:', type, err.message);
    res.status(400).json({ ok: false, error: err.message, state });
  }
});

app.get('/api/backup', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="stellare-industrien-backup.json"');
  res.json(state);
});

app.post('/api/restore', (req, res) => {
  try {
    state = engine.normalizeState(req.body);
    saveState();
    res.json({ ok: true, state });
  } catch(err){
    res.status(400).json({ ok: false, error: err.message });
  }
});

// tick loop: the universe keeps advancing even with no client connected
setInterval(() => {
  engine.tick(state);
  dirty = true;
}, 1000);

// periodic safety-net save (actions already save immediately; this covers pure tick progress)
setInterval(() => {
  if(dirty) saveState();
}, 15000);

function shutdown(){
  console.log('Beende Server, speichere Spielstand...');
  saveState();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, '0.0.0.0', () => {
  console.log('Stellare Industrien Server läuft auf Port ' + PORT);
  console.log('Im lokalen Netzwerk erreichbar unter http://<Pi-IP>:' + PORT);
});
