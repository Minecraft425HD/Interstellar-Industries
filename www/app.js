const defs = {
  buildings: {
    metalMine:{name:'Metallmine', base:{metal:60, crystal:15, deut:0}, powerUse:l=>10*l, prod:l=>30*l*Math.pow(1.1,l)},
    crystalMine:{name:'Kristallmine', base:{metal:48, crystal:24, deut:0}, powerUse:l=>10*l, prod:l=>20*l*Math.pow(1.1,l)},
    deutSynth:{name:'Deuterium-Synthesizer', base:{metal:225, crystal:75, deut:0}, powerUse:l=>20*l, prod:l=>10*l*Math.pow(1.1,l)},
    solarPlant:{name:'Solarkraftwerk', base:{metal:75, crystal:30, deut:0}, power:l=>40*l*Math.pow(1.05,l)},
    robotFactory:{name:'Roboterfabrik', base:{metal:400, crystal:120, deut:200}},
    shipyard:{name:'Raumschiffwerft', base:{metal:400, crystal:200, deut:100}, requires:{robotFactory:2}},
    researchLab:{name:'Forschungslabor', base:{metal:200, crystal:400, deut:200}},
    metalStorage:{name:'Metallspeicher', base:{metal:1000, crystal:0, deut:0}},
    crystalStorage:{name:'Kristallspeicher', base:{metal:1000, crystal:500, deut:0}},
    deutTank:{name:'Deuteriumtank', base:{metal:1000, crystal:1000, deut:0}},
    missileLauncher:{name:'Raketenwerfer', base:{metal:2000, crystal:0, deut:0}, isDefense:true, attack:80, hull:2000, requires:{shipyard:1}},
    lightLaser:{name:'Leichtes Laser-Geschütz', base:{metal:1500, crystal:500, deut:0}, isDefense:true, attack:100, hull:2000, requires:{shipyard:2, energyTech:1}},
    heavyLaser:{name:'Schweres Laser-Geschütz', base:{metal:6000, crystal:2000, deut:0}, isDefense:true, attack:250, hull:8000, requires:{shipyard:4, energyTech:3}},
    naniteFactory:{name:'Nanitenfabrik', base:{metal:1000000, crystal:500000, deut:100000}, requires:{robotFactory:10, computerTech:10}, facility:true},
    terraformer:{name:'Terraformer', base:{metal:0, crystal:50000, deut:100000}, requires:{naniteFactory:1, energyTech:12}, facility:true},
    allianceDepot:{name:'Allianzdepot', base:{metal:20000, crystal:40000, deut:0}, requires:{shipyard:3}, facility:true},
    missileSilo:{name:'Raketensilo', base:{metal:20000, crystal:20000, deut:1000}, requires:{shipyard:1}, facility:true},
    sensorPhalanx:{name:'Sensorphalanx', base:{metal:20000, crystal:40000, deut:20000}, requires:{naniteFactory:1}, moonOnly:true, facility:true},
    jumpGate:{name:'Sprungtor', base:{metal:2000000, crystal:4000000, deut:800000}, requires:{naniteFactory:1, hyperspaceTech:7}, moonOnly:true, facility:true},
    lunarBase:{name:'Lunarbasis', base:{metal:20000, crystal:40000, deut:20000}, requires:{}, moonOnly:true, facility:true},
  },
  research: {
    energyTech:{name:'Energietechnik', base:{metal:0, crystal:800, deut:400}, requires:{researchLab:1}},
    combustion:{name:'Verbrennungstriebwerk', base:{metal:400, crystal:0, deut:600}, requires:{researchLab:1, energyTech:1}},
    computerTech:{name:'Computertechnik', base:{metal:0, crystal:400, deut:600}, requires:{researchLab:1}},
    weaponsTech:{name:'Waffentechnik', base:{metal:800, crystal:200, deut:0}, requires:{researchLab:4}},
    shieldingTech:{name:'Schildtechnik', base:{metal:200, crystal:600, deut:0}, requires:{researchLab:6, energyTech:3}},
    espionageTech:{name:'Spionagetechnik', base:{metal:200, crystal:1000, deut:200}, requires:{researchLab:3}},
    impulseDrive:{name:'Impulstriebwerk', base:{metal:2000, crystal:4000, deut:600}, requires:{researchLab:2, energyTech:1}},
    armourTech:{name:'Rumpfpanzerung', base:{metal:1000, crystal:0, deut:0}, requires:{researchLab:2}},
    hyperspaceTech:{name:'Hyperraumtechnik', base:{metal:0, crystal:4000, deut:2000}, requires:{researchLab:7, energyTech:5, shieldingTech:5}},
    hyperspaceDrive:{name:'Hyperraumantrieb', base:{metal:10000, crystal:20000, deut:6000}, requires:{researchLab:7, hyperspaceTech:3}},
    laserTech:{name:'Lasertechnik', base:{metal:200, crystal:100, deut:0}, requires:{researchLab:1, energyTech:2}},
    ionTech:{name:'Iontechnik', base:{metal:1000, crystal:300, deut:100}, requires:{researchLab:4, laserTech:5, energyTech:4}},
    plasmaTech:{name:'Plasmatechnik', base:{metal:2000, crystal:4000, deut:1000}, requires:{researchLab:4, energyTech:8, laserTech:10, ionTech:5}},
    gravitonTech:{name:'Gravitationstechnik', base:{metal:0, crystal:0, deut:0}, requires:{researchLab:12}},
  },
  ships: {
    smallCargo:{name:'Kleiner Transporter', cost:{metal:2000, crystal:2000, deut:0}, cargo:5000, speed:1, fuel:12, attack:5, shield:10, hull:4000, role:'cargo', requires:{shipyard:2}},
    largeCargo:{name:'Großer Transporter', cost:{metal:6000, crystal:6000, deut:0}, cargo:25000, speed:0.8, fuel:28, attack:5, shield:25, hull:12000, role:'cargo', requires:{shipyard:4}},
    colonyShip:{name:'Kolonieschiff', cost:{metal:10000, crystal:20000, deut:10000}, cargo:7500, speed:0.6, fuel:60, attack:0, shield:100, hull:30000, role:'colony', requires:{shipyard:4, combustion:3}},
    espionageProbe:{name:'Spionagesonde', cost:{metal:0, crystal:1000, deut:0}, cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'probe', requires:{shipyard:3, combustion:3}},
    lightFighter:{name:'Leichter Jäger', cost:{metal:3000, crystal:1000, deut:0}, cargo:50, speed:1.4, fuel:20, attack:50, shield:10, hull:4000, role:'combat', requires:{shipyard:1, combustion:1}},
    heavyFighter:{name:'Schwerer Jäger', cost:{metal:6000, crystal:4000, deut:0}, cargo:100, speed:1.0, fuel:25, attack:150, shield:25, hull:10000, role:'combat', requires:{shipyard:3, armourTech:2, impulseDrive:2}},
    cruiser:{name:'Kreuzer', cost:{metal:20000, crystal:7000, deut:2000}, cargo:800, speed:1.1, fuel:40, attack:400, shield:50, hull:27000, role:'combat', requires:{shipyard:5, weaponsTech:2}},
    battleship:{name:'Schlachtschiff', cost:{metal:45000, crystal:15000, deut:0}, cargo:1500, speed:0.8, fuel:50, attack:1000, shield:200, hull:60000, role:'combat', requires:{shipyard:7, hyperspaceDrive:4}},
    battlecruiser:{name:'Großer Kreuzer', cost:{metal:30000, crystal:40000, deut:15000}, cargo:750, speed:0.9, fuel:250, attack:700, shield:400, hull:70000, role:'combat', requires:{shipyard:8, hyperspaceTech:5, laserTech:12}},
    bomber:{name:'Bomber', cost:{metal:50000, crystal:25000, deut:15000}, cargo:500, speed:0.6, fuel:65, attack:1000, shield:500, hull:75000, role:'combat', requires:{shipyard:8, plasmaTech:5, impulseDrive:6}},
    destroyer:{name:'Zerstörer', cost:{metal:60000, crystal:50000, deut:15000}, cargo:2000, speed:0.7, fuel:100, attack:2000, shield:500, hull:110000, role:'combat', requires:{shipyard:9, hyperspaceTech:5, hyperspaceDrive:6}},
    deathstar:{name:'Todesstern', cost:{metal:5000000, crystal:4000000, deut:1000000}, cargo:1000000, speed:0.4, fuel:1, attack:200000, shield:50000, hull:9000000, role:'combat', requires:{shipyard:12, hyperspaceTech:6, gravitonTech:1}},
    solarSatellite:{name:'Solarsatellit', cost:{metal:0, crystal:2000, deut:500}, cargo:0, speed:0, fuel:0, attack:1, shield:1, hull:2000, role:'power', requires:{}},
    recycler:{name:'Recycler', cost:{metal:10000, crystal:6000, deut:2000}, cargo:20000, speed:0.7, fuel:30, attack:1, shield:10, hull:16000, role:'recycler', requires:{shipyard:4, combustion:6}},
  }
};
const missionLabels = {transport:'Transport', spy:'Spionage', attack:'Angriff', colonize:'Kolonisierung', harvest:'Trümmerfeld-Bergung'};

const state = {
  timeScale: 20,
  activePlanet: 0,
  view: 'overview',
  now: Date.now(),
  planets: [
    {name:'Terra Prime', coords:[1,145,7], owner:'player', resources:{metal:2200, crystal:1400, deut:900}, buildings:{metalMine:5, crystalMine:4, deutSynth:3, solarPlant:5, robotFactory:2, shipyard:2, researchLab:2, metalStorage:2, crystalStorage:2, deutTank:2, missileLauncher:4, lightLaser:2, heavyLaser:0}, research:{energyTech:1, combustion:1, computerTech:0, weaponsTech:0, shieldingTech:0, espionageTech:0}, ships:{smallCargo:6, largeCargo:1, colonyShip:1, espionageProbe:3, lightFighter:8, cruiser:0, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]},
    {name:'Nova Draconis', coords:[1,201,10], owner:'player', resources:{metal:900, crystal:550, deut:220}, buildings:{metalMine:3, crystalMine:3, deutSynth:2, solarPlant:3, robotFactory:1, shipyard:1, researchLab:1, metalStorage:1, crystalStorage:1, deutTank:1, missileLauncher:2, lightLaser:0, heavyLaser:0}, research:{energyTech:0, combustion:0, computerTech:0, weaponsTech:0, shieldingTech:0, espionageTech:0}, ships:{smallCargo:2, largeCargo:0, colonyShip:0, espionageProbe:1, lightFighter:2, cruiser:0, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]},
    {name:'Asterion', coords:[1,312,5], owner:'player', resources:{metal:1500, crystal:900, deut:500}, buildings:{metalMine:5, crystalMine:4, deutSynth:3, solarPlant:5, robotFactory:2, shipyard:2, researchLab:2, metalStorage:2, crystalStorage:2, deutTank:2, missileLauncher:6, lightLaser:3, heavyLaser:0}, research:{energyTech:1, combustion:1, computerTech:0, weaponsTech:1, shieldingTech:0, espionageTech:0}, ships:{smallCargo:6, largeCargo:1, colonyShip:0, espionageProbe:3, lightFighter:4, cruiser:1, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]}
  ],
  fleets: [],
  reports: [],
  messages: ['Willkommen: Vollständiges OGame-Feature-Set aktiv (Monde, Allianz, Offiziere, Expeditionen, Lebensformen-Basis).'],
  debrisFields: {},
  moons: [],
  activeMoonIndex: null,
  alliance: {name:'Freie Sternenflotte', tag:'FSF', members:['Du','Kryon Def.','Vesper Union'], rank:'Krieger', points:87000, depot:{metal:0, crystal:0, deut:0}},
  officers: {commander:false, admiral:false, engineer:false, geologist:false, technocrat:false},
  darkMatter: 4200,
  expeditions: [],
  lifeform: {active:'humans', points:0, buildings:{}, research:{}},
  marketRate: { metal:1, crystal:1.5, deut:3 },
  logs: ['Neue Galaxie initialisiert.'],
  galaxySystem: 145
};

function seedGalaxy(system){
  const rnd = (seed)=>{ let x=Math.sin(seed*999+system*13)*10000; return x-Math.floor(x); };
  const slots = [];
  for(let pos=1; pos<=15; pos++){
    const owned = state.planets.find(p=>p.coords[1]===system && p.coords[2]===pos);
    if(owned){ slots.push({pos, type:'own', planet:owned}); continue; }
    const r = rnd(pos+system);
    if(r < 0.35){
      const level = Math.max(3, Math.floor(r*30));
      slots.push({pos, type:'npc', name:'Kolonie '+String.fromCharCode(65+pos), level, metal:800*level, crystal:500*level, deut:200*level, defense: 20*level, fleet: {lightFighter: Math.floor(level*1.5)}});
    } else {
      slots.push({pos, type:'empty'});
    }
  }
  return slots;
}

const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.floor(n));
const fmt1 = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
function coordStr(c){return '['+c[0]+':'+c[1]+':'+c[2]+']'}
function log(msg){state.logs.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.logs=state.logs.slice(0,10); renderSide();}
function message(msg){state.messages.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.messages=state.messages.slice(0,20);}
function meetsRequirements(p, req){ if(!req) return true; for(const [k,v] of Object.entries(req)){ const have = p.buildings[k]!=null ? p.buildings[k] : (p.research[k]!=null ? p.research[k] : 0); if(have<v) return false; } return true; }
function requirementText(req){ if(!req) return ''; return Object.entries(req).map(([k,v])=>{ const nm = defs.buildings[k]?defs.buildings[k].name:(defs.research[k]?defs.research[k].name:k); return nm+' Stufe '+v; }).join(', '); }
function debrisKey(coord){ return coord[1]+':'+coord[2]; }
function addDebris(coord, metal, crystal){ const key=debrisKey(coord); const cur = state.debrisFields[key] || {coord, metal:0, crystal:0}; cur.metal += metal; cur.crystal += crystal; state.debrisFields[key]=cur; }
function officerBonus(){ return state.officers.geologist ? 1.10 : 1.0; }
function fleetSpeedBonus(){ return state.officers.admiral ? 1.1 : 1.0; }
function engineerBonus(){ return state.officers.engineer ? 1.10 : 1.0; }
function commanderDiscount(){ return state.officers.commander ? 0.95 : 1.0; }
function technocratSpeed(){ return state.officers.technocrat ? 0.85 : 1.0; }
function buildingCost(base, level){ const c=scaledCost(base, level); const d=commanderDiscount(); return {metal:Math.floor(c.metal*d), crystal:Math.floor(c.crystal*d), deut:Math.floor(c.deut*d)}; }
function viewInteractionActive(){
  const el = document.activeElement;
  const view = document.getElementById('view');
  return !!(el && view && view.contains(el) && (el.tagName==='SELECT' || el.tagName==='INPUT' || el.tagName==='TEXTAREA'));
}
function moonChanceFromDebris(debrisTotal){ return Math.min(0.20, debrisTotal/1000000); }
function maybeCreateMoon(coord, debrisTotal){ const chance = moonChanceFromDebris(debrisTotal); if(Math.random()<chance){ const exists = state.moons.find(m=>m.coord[1]===coord[1]&&m.coord[2]===coord[2]); if(!exists){ state.moons.push({coord:[...coord], size: Math.floor(2000+Math.random()*5000), buildings:{lunarBase:0, sensorPhalanx:0, jumpGate:0}, buildQueue:[], ships:{smallCargo:0,largeCargo:0,colonyShip:0,espionageProbe:0,lightFighter:0,heavyFighter:0,cruiser:0,battleship:0,battlecruiser:0,bomber:0,destroyer:0,deathstar:0,solarSatellite:0,recycler:0}}); message('Ein Mond ist bei '+coordStr(coord)+' entstanden.'); } } }
function sendExpedition(shipsMap, durationSlot){ const p=active(); for(const [k,v] of Object.entries(shipsMap)){ if(v>p.ships[k]) return log('Zu wenige '+defs.ships[k].name); } const total=Object.values(shipsMap).reduce((a,b)=>a+b,0); if(total<1) return log('Keine Schiffe für Expedition gewählt'); for(const [k,v] of Object.entries(shipsMap)) p.ships[k]-=v; const secs = durationSlot*900; state.expeditions.push({from:state.activePlanet, ships:shipsMap, done:Date.now()+secs*1000}); log('Expedition gestartet'); }
function resolveExpedition(exp){ const p=state.planets[exp.from]; const roll=Math.random();
  if(roll<0.5){ const gain={metal:Math.floor(Math.random()*20000), crystal:Math.floor(Math.random()*15000), deut:Math.floor(Math.random()*8000)}; addRes(p,gain); message('Expedition erfolgreich: '+fmt(gain.metal+gain.crystal+gain.deut)+' Ressourcen gefunden.'); }
  else if(roll<0.65){ const dm=Math.floor(Math.random()*500); state.darkMatter+=dm; message('Expedition fand '+fmt(dm)+' Dunkle Materie.'); }
  else if(roll<0.8){ for(const [k,v] of Object.entries(exp.ships)) p.ships[k]=(p.ships[k]||0)+v; message('Expeditionsflotte kehrte unbeschadet zurück.'); return; }
  else if(roll<0.92){ Object.keys(exp.ships).forEach(k=>exp.ships[k]=Math.floor(exp.ships[k]*0.5)); message('Expedition verlor die Hälfte der Flotte in einem Kampf.'); }
  else { message('Expeditionsflotte ist im Nichts verschwunden.'); return; }
  for(const [k,v] of Object.entries(exp.ships)) p.ships[k]=(p.ships[k]||0)+v;
}
function activeMoon(){ return state.activeMoonIndex!=null ? state.moons[state.activeMoonIndex] : null; }
function enqueueMoonBuild(key){ const m=activeMoon(); if(!m) return log('Kein Mond ausgewählt'); const def=defs.buildings[key]; const lvl=(m.buildings[key]||0)+1; const cost=scaledCost(def.base, lvl); const p=active(); if(!hasRes(p,cost)) return log('Nicht genug Ressourcen auf dem Heimatplaneten für '+def.name); spend(p,cost); const secs=Math.max(10, Math.round((cost.metal+cost.crystal)/300)); m.buildQueue.push({key, name:def.name, done:Date.now()+secs*1000}); log(def.name+' auf Mond gestartet (Kosten vom aktiven Planeten)'); render(); }
function jumpGateReady(m){ return (m.buildings.jumpGate||0) >= 1; }
function jumpGateTransfer(fromMoonIdx, toMoonIdx, cargo, ships){ const from=state.moons[fromMoonIdx]; const to=state.moons[toMoonIdx]; if(!jumpGateReady(from) || !jumpGateReady(to)) return log('Beide Monde brauchen ein Sprungtor'); for(const [k,v] of Object.entries(ships)){ if(v>(from.ships[k]||0)) return log('Zu wenige '+defs.ships[k].name+' auf dem Mond'); } for(const [k,v] of Object.entries(ships)){ from.ships[k]-=v; to.ships[k]=(to.ships[k]||0)+v; } log('Sprungtor-Transfer nach '+coordStr(to.coord)+' abgeschlossen (sofort)'); render(); }
function depositAlliance(res){ state.alliance.depot.metal += res.metal||0; state.alliance.depot.crystal += res.crystal||0; state.alliance.depot.deut += res.deut||0; log('Ressourcen ins Allianzdepot eingezahlt'); }
function saveGame(){
  const data = JSON.stringify({planets:state.planets, fleets:state.fleets, reports:state.reports, messages:state.messages, debrisFields:state.debrisFields, moons:state.moons, alliance:state.alliance, officers:state.officers, darkMatter:state.darkMatter, expeditions:state.expeditions, lifeform:state.lifeform, logs:state.logs, galaxySystem:state.galaxySystem, activePlanet:state.activePlanet});
  if(window.Android && window.Android.saveGame){ window.Android.saveGame(data); log('Spielstand wird gespeichert...'); return; }
  const blob = new Blob([data], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stellare-industrien-save.json'; a.click(); log('Spielstand exportiert');
}
function applySaveData(data){
  try {
    state.planets = data.planets; state.fleets = data.fleets||[]; state.reports = data.reports||[]; state.messages = data.messages||[]; state.debrisFields = data.debrisFields||{}; state.moons = data.moons||[]; state.alliance = data.alliance||state.alliance; state.officers = data.officers||state.officers; state.darkMatter = data.darkMatter!=null?data.darkMatter:state.darkMatter; state.expeditions = data.expeditions||[]; state.lifeform = data.lifeform||state.lifeform; state.logs = data.logs||[]; state.galaxySystem = data.galaxySystem||145; state.activePlanet = data.activePlanet||0; state.activeMoonIndex = null; log('Spielstand geladen'); render();
  } catch(err){ log('Fehler beim Laden des Spielstands'); }
}
function loadGame(file){ const reader = new FileReader(); reader.onload = e => { try { applySaveData(JSON.parse(e.target.result)); } catch(err){ log('Fehler beim Laden des Spielstands'); } }; reader.readAsText(file); }
function requestNativeLoad(){ if(window.Android && window.Android.loadGame) window.Android.loadGame(); }
window.applyLoadedSave = function(jsonStr){ try { applySaveData(JSON.parse(jsonStr)); } catch(err){ log('Fehler beim Laden des Spielstands'); } };
window.applyLoadedSaveBase64 = function(b64){
  try {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    window.applyLoadedSave(json);
  } catch(err){ log('Fehler beim Laden des Spielstands'); }
};
function active(){return state.planets[state.activePlanet]}
function scaledCost(base, level){const mult=Math.pow(1.6, level-1); return {metal:Math.floor(base.metal*mult), crystal:Math.floor(base.crystal*mult), deut:Math.floor(base.deut*mult)}}
function hasRes(p,c){return p.resources.metal>=c.metal && p.resources.crystal>=c.crystal && p.resources.deut>=c.deut}
function spend(p,c){p.resources.metal-=c.metal; p.resources.crystal-=c.crystal; p.resources.deut-=c.deut}
function addRes(p,c){p.resources.metal+=c.metal||0; p.resources.crystal+=c.crystal||0; p.resources.deut+=c.deut||0}
function energyStats(p){const solar=defs.buildings.solarPlant.power(p.buildings.solarPlant); const satellites=(p.ships.solarSatellite||0)*20; const prod=(solar+satellites)*engineerBonus(); const use=defs.buildings.metalMine.powerUse(p.buildings.metalMine)+defs.buildings.crystalMine.powerUse(p.buildings.crystalMine)+defs.buildings.deutSynth.powerUse(p.buildings.deutSynth); return {prod,use,ratio: use? Math.min(1,prod/use):1};}
function hourly(p){const e=energyStats(p).ratio; const bonus=officerBonus(); return {metal: defs.buildings.metalMine.prod(p.buildings.metalMine)*e*bonus, crystal: defs.buildings.crystalMine.prod(p.buildings.crystalMine)*e*bonus, deut: defs.buildings.deutSynth.prod(p.buildings.deutSynth)*e*bonus}}
function maxStorage(p){return {metal:Math.max(5000,5000*p.buildings.metalStorage), crystal:Math.max(5000,5000*p.buildings.crystalStorage), deut:Math.max(5000,5000*p.buildings.deutTank)}}
function capacityForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].cargo*v; } return total }
function fuelForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].fuel*v; } return total }
function fleetSpeed(shipMap){const vals=Object.entries(shipMap).filter(([,v])=>v>0).map(([k])=>defs.ships[k].speed); return vals.length?Math.min(...vals):1}
function distanceBetween(a,b){return Math.abs(a[1]-b[1])*20 + Math.abs(a[2]-b[2]) + 5}
function fleetDuration(fromCoord,toCoord,shipMap){const speed=fleetSpeed(shipMap)*fleetSpeedBonus(); const distance=distanceBetween(fromCoord,toCoord); return Math.max(10, Math.round((distance*3)/speed)); }
function secsLeft(t){return Math.max(0, Math.ceil((t-Date.now())/1000))}

function enqueueBuild(key){const p=active(); const def=defs.buildings[key]; if(!meetsRequirements(p, def.requires)) return log(def.name+' benötigt: '+requirementText(def.requires)); const lvl=p.buildings[key]+1; const cost=buildingCost(def.base, lvl); if(!hasRes(p,cost)) return log('Nicht genug Ressourcen für '+def.name); spend(p,cost); const secs=Math.max(8, Math.round((cost.metal+cost.crystal)/(250*(1+p.buildings.robotFactory)))); p.buildQueue.push({type:'building', key, name:def.name, done:Date.now()+secs*1000}); log(def.name+' Stufe '+lvl+' gestartet'); render(); }
function enqueueResearch(key){const p=active(); const lvl=p.research[key]+1; const cost=scaledCost(defs.research[key].base, lvl); if(!hasRes(p,cost)) return log('Nicht genug Ressourcen für '+defs.research[key].name); spend(p,cost); const secs=Math.max(12, Math.round((cost.crystal+cost.deut)/(220*(1+p.buildings.researchLab))*technocratSpeed())); p.researchQueue.push({type:'research', key, name:defs.research[key].name, done:Date.now()+secs*1000}); log(defs.research[key].name+' Stufe '+lvl+' gestartet'); render(); }
function enqueueShip(key){const p=active(); const def=defs.ships[key]; if(!meetsRequirements(p, def.requires)) return log(def.name+' benötigt: '+requirementText(def.requires)); const cost=def.cost; if(!hasRes(p,cost)) return log('Nicht genug Ressourcen für '+def.name); spend(p,cost); const secs=Math.max(6, Math.round((cost.metal+cost.crystal)/(300*(1+p.buildings.shipyard)))); p.shipQueue.push({type:'ship', key, name:def.name, done:Date.now()+secs*1000}); log(def.name+' in Bau'); render(); }
function enqueueDefense(key){const p=active(); const def=defs.buildings[key]; if(!meetsRequirements(p, def.requires)) return log(def.name+' benötigt: '+requirementText(def.requires)); const count=(p.buildings[key]||0)+1; const d=commanderDiscount(); const cost={metal:Math.floor(def.base.metal*d), crystal:Math.floor(def.base.crystal*d), deut:Math.floor(def.base.deut*d)}; if(!hasRes(p,cost)) return log('Nicht genug Ressourcen für '+def.name); spend(p,cost); const secs=Math.max(5, Math.round((cost.metal+cost.crystal)/(300*(1+p.buildings.shipyard)))); p.buildQueue.push({type:'defense', key, name:def.name, done:Date.now()+secs*1000}); log(def.name+' in Bau'); render(); }

function sendFleet(form){
  const from = state.activePlanet; const p = active();
  const mission = form.mission.value;
  const targetVal = form.target.value; // format: system:pos or planetIndex
  let toCoord, toPlanetIndex=null, npcSlot=null, emptySlot=null;
  const [sys,pos] = targetVal.split(':').map(Number);
  if(!Number.isInteger(sys) || sys<1 || !Number.isInteger(pos) || pos<1 || pos>15) return log('Ungültiges Ziel: System und Position (1-15) angeben');
  toCoord = [1, sys, pos];
  const ownIdx = state.planets.findIndex(pl=>pl.coords[1]===sys && pl.coords[2]===pos);
  if(ownIdx>=0) toPlanetIndex = ownIdx;
  else {
    const slots = seedGalaxy(sys); const slot = slots.find(s=>s.pos===pos);
    if(slot.type==='npc') npcSlot = slot; else if(slot.type==='empty') emptySlot = slot;
  }
  const ships = {smallCargo:Number(form.smallCargo.value)||0,largeCargo:Number(form.largeCargo.value)||0,colonyShip:Number(form.colonyShip.value)||0,espionageProbe:Number(form.espionageProbe.value)||0,lightFighter:Number(form.lightFighter.value)||0,cruiser:Number(form.cruiser.value)||0,recycler:Number(form.recycler.value)||0};
  const totalShips = Object.values(ships).reduce((a,b)=>a+b,0);
  if(totalShips<=0) return log('Keine Schiffe ausgewählt');
  for(const [k,v] of Object.entries(ships)){ if(v>p.ships[k]) return log('Zu wenige '+defs.ships[k].name); }
  if(mission==='colonize' && ships.colonyShip<1) return log('Kolonisierung braucht mindestens ein Kolonieschiff');
  if(mission==='colonize' && !emptySlot) return log('Zielfeld ist nicht leer');
  if(mission==='spy' && ships.espionageProbe<1) return log('Spionage braucht mindestens eine Sonde');
  if(mission==='attack' && (ships.lightFighter+ships.cruiser)<1) return log('Angriff braucht Kampfschiffe');
  if(mission==='harvest' && ships.recycler<1) return log('Bergung braucht mindestens einen Recycler');
  if(mission==='harvest' && !state.debrisFields[debrisKey(toCoord)]) return log('Kein Trümmerfeld auf diesem Feld');

  const cargo={metal:Number(form.metal.value)||0, crystal:Number(form.crystal.value)||0, deut:Number(form.deut.value)||0};
  const cap=capacityForShips(ships); const totalCargo=cargo.metal+cargo.crystal+cargo.deut;
  if(mission==='transport' && totalCargo>cap) return log('Zu wenig Ladekapazität');
  const dur=fleetDuration(p.coords,toCoord,ships); const fuel=fuelForShips(ships)*Math.max(1,dur/20);
  if(cargo.deut+fuel>p.resources.deut) return log('Zu wenig Deuterium für Ladung und Flug');
  if(cargo.metal>p.resources.metal||cargo.crystal>p.resources.crystal) return log('Nicht genug Ressourcen zum Versenden');

  for(const [k,v] of Object.entries(ships)) p.ships[k]-=v;
  if(mission==='transport'){ p.resources.metal-=cargo.metal; p.resources.crystal-=cargo.crystal; p.resources.deut-=cargo.deut; }
  p.resources.deut-=fuel;

  state.fleets.push({from, toCoord, toPlanetIndex, npcSlot, emptySlot, ships, cargo:mission==='transport'?cargo:{metal:0,crystal:0,deut:0}, mission, arrive:Date.now()+dur*1000, returnAt:Date.now()+dur*2000, phase:'outbound', fuel});
  log(missionLabels[mission]+'-Flotte nach '+coordStr(toCoord)+' gestartet'); render();
}

function resolveArrival(f){
  const originPlanet = state.planets[f.from];
  if(f.mission==='transport'){
    const target = f.toPlanetIndex!=null ? state.planets[f.toPlanetIndex] : null;
    if(target){ addRes(target,f.cargo); log('Transport hat '+target.name+' erreicht und entladen'); }
    f.phase='return';
  } else if(f.mission==='spy'){
    if(f.npcSlot){
      state.reports.unshift({time:new Date().toLocaleTimeString('de-DE'), target:f.npcSlot.name, coords:coordStr(f.toCoord), resources:{metal:f.npcSlot.metal, crystal:f.npcSlot.crystal, deut:f.npcSlot.deut}, defense:f.npcSlot.defense, fleet:f.npcSlot.fleet});
      log('Spionagebericht über '+f.npcSlot.name+' erhalten');
    } else if(f.toPlanetIndex!=null){
      const t=state.planets[f.toPlanetIndex];
      state.reports.unshift({time:new Date().toLocaleTimeString('de-DE'), target:t.name, coords:coordStr(t.coords), resources:{...t.resources}, defense:0, fleet:t.ships});
      log('Spionagebericht über '+t.name+' erhalten');
    }
    f.phase='return';
  } else if(f.mission==='attack'){
    if(f.npcSlot){
      const atk = Object.entries(f.ships).reduce((s,[k,v])=>s+defs.ships[k].attack*v,0);
      const def = f.npcSlot.defense + Object.entries(f.npcSlot.fleet||{}).reduce((s,[k,v])=>s+defs.ships[k].attack*v,0);
      const won = atk > def*1.1;
      if(won){
        const loot = {metal: Math.floor(f.npcSlot.metal*0.5), crystal: Math.floor(f.npcSlot.crystal*0.5), deut: Math.floor(f.npcSlot.deut*0.5)};
        const cap = capacityForShips(f.ships); const totalLoot = Math.min(cap, loot.metal+loot.crystal+loot.deut);
        const ratio = totalLoot>0 ? totalLoot/(loot.metal+loot.crystal+loot.deut) : 0;
        f.cargo = {metal:Math.floor(loot.metal*ratio), crystal:Math.floor(loot.crystal*ratio), deut:Math.floor(loot.deut*ratio)};
        addDebris(f.toCoord, Math.floor(f.npcSlot.metal*0.08), Math.floor(f.npcSlot.crystal*0.08));
        maybeCreateMoon(f.toCoord, Math.floor(f.npcSlot.metal*0.08)+Math.floor(f.npcSlot.crystal*0.08));
        message('Angriffsbericht: Sieg gegen '+f.npcSlot.name+' bei '+coordStr(f.toCoord)+'. Beute '+fmt(f.cargo.metal+f.cargo.crystal+f.cargo.deut)+'. Trümmerfeld entstanden.');
        log('Angriff auf '+f.npcSlot.name+' erfolgreich · Beute '+fmt(f.cargo.metal+f.cargo.crystal+f.cargo.deut));
      } else {
        let lostMetal=0, lostCrystal=0;
        Object.keys(f.ships).forEach(k=>{ const lost = f.ships[k]-Math.floor(f.ships[k]*0.4); lostMetal += lost*defs.ships[k].cost.metal*0.3; lostCrystal += lost*defs.ships[k].cost.crystal*0.3; f.ships[k]=Math.floor(f.ships[k]*0.4); });
        addDebris(f.toCoord, Math.floor(lostMetal), Math.floor(lostCrystal));
        maybeCreateMoon(f.toCoord, Math.floor(lostMetal)+Math.floor(lostCrystal));
        f.cargo={metal:0,crystal:0,deut:0};
        message('Angriffsbericht: Niederlage gegen '+f.npcSlot.name+' bei '+coordStr(f.toCoord)+'. Verluste erlitten.');
        log('Angriff auf '+f.npcSlot.name+' gescheitert · Verluste erlitten');
      }
    } else if(f.toPlanetIndex!=null){
      log('Angriff auf eigenen Planeten wird im Prototyp nicht simuliert');
      f.cargo={metal:0,crystal:0,deut:0};
    }
    f.phase='return';
  } else if(f.mission==='harvest'){
    const key = debrisKey(f.toCoord); const field = state.debrisFields[key];
    if(field){
      const cap = capacityForShips(f.ships); const total = field.metal+field.crystal; const take = Math.min(cap, total);
      const ratio = total>0 ? take/total : 0;
      const gained = {metal:Math.floor(field.metal*ratio), crystal:Math.floor(field.crystal*ratio), deut:0};
      field.metal -= gained.metal; field.crystal -= gained.crystal;
      if(field.metal<=0 && field.crystal<=0) delete state.debrisFields[key];
      f.cargo = gained;
      log('Trümmerfeld bei '+coordStr(f.toCoord)+' geborgen: '+fmt(gained.metal+gained.crystal));
    } else { f.cargo={metal:0,crystal:0,deut:0}; }
    f.phase='return';
  } else if(f.mission==='colonize'){
    if(f.emptySlot){
      const newPlanet = {name:'Kolonie '+coordStr(f.toCoord), coords:f.toCoord, owner:'player', resources:{metal:500, crystal:300, deut:100}, buildings:{metalMine:1, crystalMine:1, deutSynth:0, solarPlant:1, robotFactory:0, shipyard:0, researchLab:0, metalStorage:1, crystalStorage:1, deutTank:1}, research:{...active().research}, ships:{smallCargo:0, largeCargo:0, colonyShip:0, espionageProbe:0, lightFighter:0, cruiser:0}, buildQueue:[], researchQueue:[], shipQueue:[]};
      state.planets.push(newPlanet);
      f.ships.colonyShip = Math.max(0, f.ships.colonyShip-1);
      log('Neue Kolonie gegründet: '+newPlanet.name);
    }
    f.phase='return';
  }
}

function tick(){
  const now=Date.now(); const dt=(now-state.now)/1000; state.now=now; const hours=(dt*state.timeScale)/3600;
  state.planets.forEach(p=>{
    const inc=hourly(p); const cap=maxStorage(p);
    p.resources.metal=Math.min(cap.metal,p.resources.metal+inc.metal*hours);
    p.resources.crystal=Math.min(cap.crystal,p.resources.crystal+inc.crystal*hours);
    p.resources.deut=Math.min(cap.deut,p.resources.deut+inc.deut*hours);
    while(p.buildQueue[0] && p.buildQueue[0].done<=now){ const q=p.buildQueue.shift(); p.buildings[q.key]=(p.buildings[q.key]||0)+1; log(p.name+': '+q.name+' fertig'); }
    while(p.researchQueue[0] && p.researchQueue[0].done<=now){ const q=p.researchQueue.shift(); p.research[q.key]=(p.research[q.key]||0)+1; log(p.name+': '+q.name+' fertig'); }
    while(p.shipQueue[0] && p.shipQueue[0].done<=now){ const q=p.shipQueue.shift(); p.ships[q.key]=(p.ships[q.key]||0)+1; log(p.name+': '+q.name+' fertig'); }
  });
  state.moons.forEach(m=>{ while(m.buildQueue[0] && m.buildQueue[0].done<=now){ const q=m.buildQueue.shift(); m.buildings[q.key]=(m.buildings[q.key]||0)+1; message('Mond '+coordStr(m.coord)+': '+q.name+' fertig'); } });
  state.fleets.forEach(f=>{
    if(f.phase==='outbound' && f.arrive<=now){ resolveArrival(f); }
    if(f.phase==='return' && f.returnAt<=now){ const source=state.planets[f.from]; for(const [k,v] of Object.entries(f.ships)) source.ships[k]=(source.ships[k]||0)+v; if(f.mission!=='transport'&&f.mission!=='colonize') addRes(source,f.cargo); f.phase='done'; log('Flotte nach '+source.name+' zurückgekehrt'); }
  });
  state.fleets=state.fleets.filter(f=>f.phase!=='done');
  state.expeditions.forEach(exp=>{ if(exp.done<=now && !exp.resolved){ exp.resolved=true; resolveExpedition(exp); } });
  state.expeditions = state.expeditions.filter(exp=>!exp.resolved);
  renderTop(); renderSide();
  if(!viewInteractionActive()) renderView(true);
}

const navItems = [['overview','Übersicht'],['buildings','Gebäude'],['facilities','Anlagen'],['defense','Verteidigung'],['resources','Ressourcen'],['research','Forschung'],['shipyard','Werft'],['fleet','Flotte'],['expeditions','Expeditionen'],['galaxy','Galaxie'],['moons','Monde'],['alliance','Allianz'],['officers','Offiziere'],['lifeform','Lebensform'],['market','Markt'],['reports','Berichte'],['messages','Nachrichten'],['empire','Imperium'],['settings','Einstellungen']];

function renderNav(){ $('#nav').innerHTML = navItems.map(([id,label])=>`<button class="${state.view===id?'active':''}" data-view="${id}">${label}</button>`).join(''); document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view; render();}); }
function renderTop(){ const p=active(), inc=hourly(p), e=energyStats(p); $('#planetName').textContent=p.name; $('#planetCoords').textContent=coordStr(p.coords); $('#metalTop').textContent=fmt(p.resources.metal); $('#crystalTop').textContent=fmt(p.resources.crystal); $('#deutTop').textContent=fmt(p.resources.deut); $('#metalRate').textContent=fmt1(inc.metal)+'/h'; $('#crystalRate').textContent=fmt1(inc.crystal)+'/h'; $('#deutRate').textContent=fmt1(inc.deut)+'/h'; $('#energyTop').textContent=fmt(e.prod); $('#energyUse').textContent=fmt(e.use)+' genutzt'; }
function renderSide(){
  $('#planetTabs').innerHTML = state.planets.map((p,i)=>`<button class="pill ${state.activePlanet===i?'active':''}" data-planet="${i}">${p.name}</button>`).join('');
  document.querySelectorAll('[data-planet]').forEach(b=>b.onclick=()=>{state.activePlanet=Number(b.dataset.planet); render();});
  const p=active(); const qs=[];
  p.buildQueue.forEach(q=>qs.push(`<div class="queue-item">Bau · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.researchQueue.forEach(q=>qs.push(`<div class="queue-item">Forschung · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.shipQueue.forEach(q=>qs.push(`<div class="queue-item">Werft · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  $('#queues').innerHTML = qs.join('') || '<div class="small">Keine aktiven Aufträge.</div>';
  $('#fleetMovements').innerHTML = state.fleets.map(f=>`<div class="queue-item">${missionLabels[f.mission]} ${state.planets[f.from].name} → ${coordStr(f.toCoord)}<br><span class="small">${f.phase==='outbound'?'Ankunft':'Rückflug'} in ${secsLeft(f.phase==='outbound'?f.arrive:f.returnAt)} s</span></div>`).join('') || '<div class="small">Keine Flotten unterwegs.</div>';
  $('#logs').innerHTML = state.logs.map(x=>`<div class="log">${x}</div>`).join('');
}

function viewOverview(){ const p=active(), e=energyStats(p), inc=hourly(p), cap=maxStorage(p); return `
  <div class="hero">
    <div class="card"><h2>Planetenübersicht</h2><p>Vollständiger Loop: Ressourcen, Energie, Forschung, Werft, Galaxie mit Spionage/Angriff/Kolonisierung und Markt sind aktiv.</p>
      <div class="grid3"><div class="card"><div class="label">Speicher Metall</div><div class="value">${fmt(cap.metal)}</div></div><div class="card"><div class="label">Speicher Kristall</div><div class="value">${fmt(cap.crystal)}</div></div><div class="card"><div class="label">Speicher Deuterium</div><div class="value">${fmt(cap.deut)}</div></div></div>
    </div>
    <div class="card"><h2>Energie</h2><div class="small">Ohne genug Energie sinkt die Produktion proportional.</div><div style="height:10px"></div><div class="bar"><span style="width:${Math.min(100,(e.prod/Math.max(1,e.use))*100)}%"></span></div><div style="height:10px"></div><div class="small">Produktion ${fmt(e.prod)} · Verbrauch ${fmt(e.use)} · Faktor ${fmt1(e.ratio*100)}%</div></div>
  </div>
  <div class="grid2">
    <div class="card"><h3>Rohstofffluss</h3><div class="list">
      <div class="row"><div><strong>Metall</strong></div><div>${fmt1(inc.metal)}/h</div></div>
      <div class="row"><div><strong>Kristall</strong></div><div>${fmt1(inc.crystal)}/h</div></div>
      <div class="row"><div><strong>Deuterium</strong></div><div>${fmt1(inc.deut)}/h</div></div>
    </div></div>
    <div class="card"><h3>Flottenstatus</h3><div class="list">${Object.entries(p.ships).map(([k,v])=>`<div class="row"><div><strong>${defs.ships[k].name}</strong></div><div>${fmt(v)}</div></div>`).join('')}</div></div>
  </div>`; }

function viewBuildings(){ const p=active(); return `<h2>Gebäude</h2><div class="list">${Object.entries(defs.buildings).filter(([,d])=>!d.isDefense && !d.facility).map(([k,d])=>{ const lvl=(p.buildings[k]||0)+1; const c=buildingCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><button class="btn" data-build="${k}" ${ok?'':'disabled'}>Ausbauen</button></div>`; }).join('')}</div>`; }

function viewFacilities(){ const p=active(); const facKeys = Object.entries(defs.buildings).filter(([,d])=>d.facility && !d.moonOnly); return `<h2>Anlagen</h2><div class="list">${facKeys.map(([k,d])=>{ const lvl=(p.buildings[k]||0)+1; const c=buildingCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><button class="btn alt" data-build="${k}" ${ok?'':'disabled'}>Ausbauen</button></div>`; }).join('')}</div>`; }
function viewResources(){ const p=active(), inc=hourly(p), e=energyStats(p); return `<h2>Ressourcen</h2><div class="grid2"><div class="card"><h3>Produktion pro Stunde</h3><div class="list"><div class="row"><span>Metall</span><strong>${fmt1(inc.metal)}</strong></div><div class="row"><span>Kristall</span><strong>${fmt1(inc.crystal)}</strong></div><div class="row"><span>Deuterium</span><strong>${fmt1(inc.deut)}</strong></div></div></div><div class="card"><h3>Energieeffizienz</h3><div class="bar"><span style="width:${Math.min(100,e.ratio*100)}%"></span></div><div style="height:10px"></div><div class="small">${fmt(e.prod)} verfügbar · ${fmt(e.use)} benötigt</div></div></div>`; }
function viewResearch(){ const p=active(); return `<h2>Forschung</h2><div class="list">${Object.entries(defs.research).map(([k,d])=>{ const lvl=p.research[k]+1; const c=scaledCost(d.base,lvl); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.research[k]}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div></div><button class="btn good" data-research="${k}">Forschen</button></div>`; }).join('')}</div>`; }
function viewShipyard(){ const p=active(); return `<h2>Raumschiffwerft</h2><div class="list">${Object.entries(defs.ships).map(([k,d])=>{ const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(p.ships[k]||0)} · Angriff ${d.attack} · Ladung ${fmt(d.cargo)}</div><div class="sub">Kosten: M ${fmt(d.cost.metal)} · K ${fmt(d.cost.crystal)} · D ${fmt(d.cost.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><button class="btn warn" data-ship="${k}" ${ok?'':'disabled'}>Bauen</button></div>`; }).join('')}</div>`; }

function viewFleet(){ const p=active(); const shipOptions = (key)=>Array.from({length:p.ships[key]+1},(_,i)=>`<option>${i}</option>`).join('');
  return `<h2>Flotte versenden</h2><div class="grid2">
  <div class="card"><h3>Missionsformular</h3><form class="fleet-form" id="fleetForm">
    <label>Mission<select name="mission" id="missionSelect"><option value="transport">Transport</option><option value="spy">Spionage</option><option value="attack">Angriff</option><option value="colonize">Kolonisierung</option><option value="harvest">Trümmerfeld-Bergung</option></select></label>
    <label>Zielsystem<input type="number" name="system" value="${p.coords[1]}"></label>
    <label>Zielposition (1-15)<input type="number" name="position" min="1" max="15" value="1"></label>
    <input type="hidden" name="target" id="targetField">
    <div class="grid3">
      <label>Kl. Transporter<select name="smallCargo">${shipOptions('smallCargo')}</select></label>
      <label>Gr. Transporter<select name="largeCargo">${shipOptions('largeCargo')}</select></label>
      <label>Kolonieschiff<select name="colonyShip">${shipOptions('colonyShip')}</select></label>
      <label>Sonde<select name="espionageProbe">${shipOptions('espionageProbe')}</select></label>
      <label>Leichter Jäger<select name="lightFighter">${shipOptions('lightFighter')}</select></label>
      <label>Kreuzer<select name="cruiser">${shipOptions('cruiser')}</select></label>
      <label>Recycler<select name="recycler">${shipOptions('recycler')}</select></label>
    </div>
    <div class="grid3"><label>Metall<input type="number" min="0" name="metal" value="0"></label><label>Kristall<input type="number" min="0" name="crystal" value="0"></label><label>Deuterium<input type="number" min="0" name="deut" value="0"></label></div>
    <button class="btn" type="submit">Flotte starten</button>
  </form></div>
  <div class="card"><h3>Hinweise</h3><div class="small">Transport bewegt Ressourcen. Spionage liefert einen Bericht. Angriff funktioniert gegen NPC-Kolonien in der Galaxie. Kolonisierung braucht ein Kolonieschiff und ein leeres Feld.</div><div style="height:10px"></div><table><tr><th>Schiff</th><th>Angriff</th><th>Ladung</th></tr>${Object.entries(defs.ships).map(([k,d])=>`<tr><td>${d.name}</td><td>${d.attack}</td><td>${fmt(d.cargo)}</td></tr>`).join('')}</table></div>
  </div>`; }

function viewGalaxy(){ const slots = seedGalaxy(state.galaxySystem); return `<h2>Galaxie</h2>
  <div class="card" style="margin-bottom:12px"><form class="galaxy-form" id="galaxyJump" style="display:flex;gap:10px;align-items:end;flex-wrap:wrap"><label style="flex:1">System<input type="number" name="system" value="${state.galaxySystem}"></label><button class="btn alt" type="submit">System anzeigen</button></form></div>
  <div class="galaxy-grid">${slots.map(s=>{
    const key = debrisKey([1,state.galaxySystem,s.pos]); const debris = state.debrisFields[key];
    const debrisRow = debris ? `<div class="sub">Trümmerfeld: M ${fmt(debris.metal)} · K ${fmt(debris.crystal)} <button class="btn alt" data-mission-target="harvest:${state.galaxySystem}:${s.pos}" style="margin-left:8px;padding:6px 10px;min-height:32px">Bergen</button></div>` : '';
    if(s.type==='own') return `<div class="slot own"><div>${s.pos}</div><div><strong>${s.planet.name}</strong><div class="sub">${coordStr(s.planet.coords)}</div>${debrisRow}</div><div><span class="badge own">Eigen</span></div><div class="sub">Metall ${fmt(s.planet.resources.metal)}</div><div></div></div>`;
    if(s.type==='npc') return `<div class="slot"><div>${s.pos}</div><div><strong>${s.name}</strong><div class="sub">Stufe ${s.level}</div>${debrisRow}</div><div><span class="badge npc">NPC</span></div><div class="sub">Def ${fmt(s.defense)}</div><div><button class="btn danger" data-mission-target="attack:${state.galaxySystem}:${s.pos}">Angriff</button> <button class="btn alt" data-mission-target="spy:${state.galaxySystem}:${s.pos}">Spionage</button></div></div>`;
    return `<div class="slot empty"><div>${s.pos}</div><div>Freies Feld${debrisRow}</div><div><span class="badge empty">Leer</span></div><div class="sub">—</div><div><button class="btn good" data-mission-target="colonize:${state.galaxySystem}:${s.pos}">Kolonisieren</button></div></div>`;
  }).join('')}</div>`; }

function viewDefense(){ const p=active(); const d2=commanderDiscount(); const defenseKeys = Object.entries(defs.buildings).filter(([,d])=>d.isDefense); return `<h2>Verteidigung</h2><div class="list">${defenseKeys.map(([k,d])=>{ const count=p.buildings[k]||0; const ok=meetsRequirements(p,d.requires); const cm=Math.floor(d.base.metal*d2), cc=Math.floor(d.base.crystal*d2), cd=Math.floor(d.base.deut*d2); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(count)} · Angriff ${d.attack} · Hülle ${fmt(d.hull)}</div><div class="sub">Kosten: M ${fmt(cm)} · K ${fmt(cc)} · D ${fmt(cd)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><button class="btn danger" data-defense="${k}" ${ok?'':'disabled'}>Bauen</button></div>`; }).join('')}</div>`; }

function viewMessages(){ if(state.messages.length===0) return `<h2>Nachrichten</h2><div class="small">Keine Nachrichten.</div>`; return `<h2>Nachrichten</h2><div class="list">${state.messages.map(m=>`<div class="report">${m}</div>`).join('')}</div>`; }

function viewSettings(){ const native = !!(window.Android && window.Android.saveGame); return `<h2>Einstellungen</h2><div class="grid2"><div class="card"><h3>Spielstand exportieren</h3><div class="small">Speichert den aktuellen Zustand als JSON-Datei${native?' im Downloads-Ordner':' zum Download'}.</div><div style="height:10px"></div><button class="btn" id="saveBtn">Spielstand speichern</button></div><div class="card"><h3>Spielstand laden</h3><div class="small">Lädt eine zuvor exportierte JSON-Datei.</div><div style="height:10px"></div>${native ? '<button class="btn alt" id="loadBtnNative">Datei auswählen</button>' : '<input type="file" id="loadInput" accept="application/json">'}</div></div>`; }

function viewExpeditions(){ const p=active(); const shipOptions=(key)=>Array.from({length:p.ships[key]+1},(_,i)=>`<option>${i}</option>`).join('');
  return `<h2>Expeditionen</h2><div class="grid2">
  <div class="card"><h3>Expedition starten</h3><form class="fleet-form" id="expeditionForm">
    <label>Dauer-Slot (1-3, je 15 Min)<input type="number" min="1" max="3" value="1" name="slot"></label>
    <div class="grid3">
      <label>Leichter Jäger<select name="lightFighter">${shipOptions('lightFighter')}</select></label>
      <label>Kreuzer<select name="cruiser">${shipOptions('cruiser')}</select></label>
      <label>Großer Transporter<select name="largeCargo">${shipOptions('largeCargo')}</select></label>
    </div>
    <button class="btn good" type="submit">Expedition senden</button>
  </form></div>
  <div class="card"><h3>Laufende Expeditionen</h3><div class="list">${state.expeditions.length? state.expeditions.map(e=>`<div class="row"><div>Von ${state.planets[e.from].name}</div><div>${secsLeft(e.done)} s</div></div>`).join('') : '<div class="small">Keine aktiven Expeditionen.</div>'}</div></div>
  </div>`; }

function viewMoons(){
  if(state.moons.length===0) return `<h2>Monde</h2><div class="small">Noch keine Monde entstanden. Monde entstehen mit einer Chance nach Schlachten mit großem Trümmerfeld (Angriff auf NPC-Kolonien, gewonnen oder verloren).</div>`;
  const moonKeys = ['lunarBase','sensorPhalanx','jumpGate'];
  const tabs = state.moons.map((m,i)=>`<button class="pill ${state.activeMoonIndex===i?'active':''}" data-moon-select="${i}">Mond ${coordStr(m.coord)}</button>`).join('');
  const m = activeMoon();
  let detail = '<div class="small">Wähle oben einen Mond aus.</div>';
  if(m){
    const buildRows = moonKeys.map(k=>{ const def=defs.buildings[k]; const lvl=(m.buildings[k]||0)+1; const c=scaledCost(def.base, lvl); return `<div class="row"><div><strong>${def.name}</strong><div class="sub">Stufe ${m.buildings[k]||0}</div><div class="sub">Kosten (vom Heimatplaneten): M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div></div><button class="btn alt" data-moon-build="${k}">Ausbauen</button></div>`; }).join('');
    const queueRows = m.buildQueue.map(q=>`<div class="queue-item">${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`).join('') || '<div class="small">Keine aktiven Mondbauten.</div>';
    const otherMoons = state.moons.filter((mm,i)=>i!==state.activeMoonIndex);
    const jumpForm = otherMoons.length ? `<form id="jumpGateForm" class="fleet-form">
      <label>Zielmond<select name="targetMoon">${state.moons.map((mm,i)=> i!==state.activeMoonIndex ? `<option value="${i}">${coordStr(mm.coord)}</option>` : '').join('')}</select></label>
      <label>Leichter Jäger<select name="lightFighter">${Array.from({length:(m.ships.lightFighter||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <label>Kreuzer<select name="cruiser">${Array.from({length:(m.ships.cruiser||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <button class="btn good" type="submit">Sofort transferieren</button>
    </form>` : '<div class="small">Es gibt noch keinen zweiten Mond für einen Transfer.</div>';
    detail = `<div class="grid2">
      <div class="card"><h3>Mondgebäude</h3><div class="list">${buildRows}</div></div>
      <div class="card"><h3>Baustatus</h3><div class="queue">${queueRows}</div></div>
    </div>
    <div style="height:16px"></div>
    <div class="card"><h3>Sprungtor-Transfer</h3><div class="small">Sprungtore verbinden zwei Monde und transferieren Flotten verzögerungsfrei, sofern beide ein Sprungtor der Stufe 1 besitzen.</div><div style="height:10px"></div>${jumpForm}</div>`;
  }
  return `<h2>Monde</h2><div class="planet-tabs">${tabs}</div><div style="height:14px"></div>${detail}`;
}

function viewAlliance(){ const a=state.alliance; return `<h2>Allianz</h2><div class="grid2">
  <div class="card"><h3>${a.name} [${a.tag}]</h3><div class="small">Rang: ${a.rank} · Punkte: ${fmt(a.points)}</div><div style="height:10px"></div><table><tr><th>Mitglied</th></tr>${a.members.map(m=>`<tr><td>${m}</td></tr>`).join('')}</table></div>
  <div class="card"><h3>Allianzdepot</h3><div class="grid3"><div class="card"><div class="label">Metall</div><div class="value">${fmt(a.depot.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt(a.depot.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt(a.depot.deut)}</div></div></div><div style="height:10px"></div><button class="btn alt" id="depositBtn">1000 von jeder Ressource einzahlen</button></div>
  </div>`; }

function viewOfficers(){ const o=state.officers; const list=[['commander','Kommandant','Reduziert Baukosten für Gebäude leicht.'],['admiral','Admiral','Erhöht die Flottengeschwindigkeit.'],['engineer','Ingenieur','Erhöht die Energieeffizienz.'],['geologist','Geologe','Erhöht die Rohstoffproduktion um 10%.'],['technocrat','Technokrat','Beschleunigt die Forschung.']];
  return `<h2>Offiziere</h2><div class="small">Dunkle Materie: ${fmt(state.darkMatter)}</div><div style="height:10px"></div><div class="list">${list.map(([k,name,desc])=>`<div class="row"><div><strong>${name}</strong><div class="sub">${desc}</div></div><button class="btn ${o[k]?'good':'alt'}" data-officer="${k}">${o[k]?'Aktiv':'Aktivieren (500 DM)'}</button></div>`).join('')}</div>`; }

function viewLifeform(){ const lf=state.lifeform; const species=[['humans','Menschen'],['rocktal',"Rock'tal"],['mechas','Mechas'],['kaelesh','Kaelesh']];
  return `<h2>Lebensform</h2><div class="small">Aktive Spezies: ${species.find(s=>s[0]===lf.active)[1]}. Jede Lebensform bringt eigene Gebäude und Technologien mit eigenem Bevölkerungs- und Nahrungssystem.</div><div style="height:10px"></div><div class="grid2">${species.map(([k,name])=>`<div class="card"><h3>${name}</h3><button class="btn ${lf.active===k?'good':'alt'}" data-lifeform="${k}">${lf.active===k?'Ausgewählt':'Wählen'}</button></div>`).join('')}</div>`; }

function viewMarket(){ const r=state.marketRate; return `<h2>Markt</h2><div class="market-grid"><div class="card"><div class="label">Metall</div><div class="value">${fmt1(r.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt1(r.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt1(r.deut)}</div></div></div><div style="height:16px"></div><div class="grid2"><div class="card"><h3>Ressourcen handeln</h3><form class="market-form" id="marketForm"><label>Abgeben<select name="give"><option value="metal">Metall</option><option value="crystal">Kristall</option><option value="deut">Deuterium</option></select></label><label>Erhalten<select name="want"><option value="crystal">Kristall</option><option value="metal">Metall</option><option value="deut">Deuterium</option></select></label><label>Menge<input type="number" min="1" value="100" name="amount"></label><button class="btn good" type="submit">Am Markt tauschen</button></form></div><div class="card"><h3>Raten</h3><div class="small">1 Metall = ${fmt1(r.metal)} Wert, 1 Kristall = ${fmt1(r.crystal)}, 1 Deuterium = ${fmt1(r.deut)}. Marktgebühr 10%.</div></div></div>`; }

function viewReports(){ if(state.reports.length===0) return `<h2>Berichte</h2><div class="small">Noch keine Spionageberichte vorhanden.</div>`; return `<h2>Spionageberichte</h2>${state.reports.map(r=>`<div class="report"><div class="row" style="border:none;background:none;padding:0"><strong>${r.target}</strong><span class="small">${r.time}</span></div><div class="small">${r.coords}</div><div class="grid3" style="margin-top:8px"><div class="card"><div class="label">Metall</div><div class="value">${fmt(r.resources.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt(r.resources.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt(r.resources.deut)}</div></div></div><div class="small" style="margin-top:8px">Verteidigung: ${fmt(r.defense)} · Flotte: ${Object.entries(r.fleet||{}).map(([k,v])=>v?defs.ships[k].name+' x'+v:null).filter(Boolean).join(', ')||'unbekannt'}</div></div>`).join('')}`; }

function viewEmpire(){ return `<h2>Imperium</h2><table><thead><tr><th>Planet</th><th>Koordinaten</th><th>Metall/h</th><th>Kristall/h</th><th>Deut/h</th><th>Energie</th></tr></thead><tbody>${state.planets.map(p=>{ const inc=hourly(p), e=energyStats(p); return `<tr><td>${p.name}</td><td>${coordStr(p.coords)}</td><td>${fmt1(inc.metal)}</td><td>${fmt1(inc.crystal)}</td><td>${fmt1(inc.deut)}</td><td>${fmt(e.prod)}/${fmt(e.use)}</td></tr>`; }).join('')}</tbody></table>`; }

function renderView(bind=true){
  const views={overview:viewOverview,buildings:viewBuildings,facilities:viewFacilities,defense:viewDefense,resources:viewResources,research:viewResearch,shipyard:viewShipyard,fleet:viewFleet,expeditions:viewExpeditions,galaxy:viewGalaxy,moons:viewMoons,alliance:viewAlliance,officers:viewOfficers,lifeform:viewLifeform,market:viewMarket,reports:viewReports,messages:viewMessages,empire:viewEmpire,settings:viewSettings};
  $('#view').innerHTML = views[state.view]();
  if(bind){
    document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>enqueueBuild(b.dataset.build));
    document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>enqueueResearch(b.dataset.research));
    document.querySelectorAll('[data-ship]').forEach(b=>b.onclick=()=>enqueueShip(b.dataset.ship));
    document.querySelectorAll('[data-defense]').forEach(b=>b.onclick=()=>enqueueDefense(b.dataset.defense));
    const ff=$('#fleetForm'); if(ff) ff.onsubmit=e=>{e.preventDefault(); const sys=Number(ff.system.value), pos=Number(ff.position.value); $('#targetField').value = sys+':'+pos; sendFleet(ff)};
    const mf=$('#marketForm'); if(mf) mf.onsubmit=e=>{e.preventDefault(); marketTrade(mf.give.value,mf.want.value,mf.amount.value)};
    const gj=$('#galaxyJump'); if(gj) gj.onsubmit=e=>{e.preventDefault(); state.galaxySystem=Number(gj.system.value); renderView();};
    document.querySelectorAll('[data-mission-target]').forEach(b=>b.onclick=()=>{
      const [mission,sys,pos]=b.dataset.missionTarget.split(':');
      state.view='fleet'; renderView(true);
      setTimeout(()=>{ const ff2=$('#fleetForm'); if(!ff2) return; ff2.mission.value=mission; ff2.system.value=sys; ff2.position.value=pos; },0);
    });
    const saveBtn=$('#saveBtn'); if(saveBtn) saveBtn.onclick=saveGame;
    const loadInput=$('#loadInput'); if(loadInput) loadInput.onchange=e=>{ if(e.target.files[0]) loadGame(e.target.files[0]); };
    const loadBtnNative=$('#loadBtnNative'); if(loadBtnNative) loadBtnNative.onclick=requestNativeLoad;
    const ef=$('#expeditionForm'); if(ef) ef.onsubmit=e=>{e.preventDefault(); const ships={lightFighter:Number(ef.lightFighter.value)||0,cruiser:Number(ef.cruiser.value)||0,largeCargo:Number(ef.largeCargo.value)||0}; sendExpedition(ships, Number(ef.slot.value)||1); renderView();};
    const depositBtn=$('#depositBtn'); if(depositBtn) depositBtn.onclick=()=>{ const p=active(); const amt={metal:Math.min(1000,p.resources.metal), crystal:Math.min(1000,p.resources.crystal), deut:Math.min(1000,p.resources.deut)}; p.resources.metal-=amt.metal; p.resources.crystal-=amt.crystal; p.resources.deut-=amt.deut; depositAlliance(amt); render(); };
    document.querySelectorAll('[data-officer]').forEach(b=>b.onclick=()=>{ const key=b.dataset.officer; if(state.officers[key]){ return; } if(state.darkMatter<500) return log('Nicht genug Dunkle Materie'); state.darkMatter-=500; state.officers[key]=true; log('Offizier aktiviert'); render(); });
    document.querySelectorAll('[data-lifeform]').forEach(b=>b.onclick=()=>{ state.lifeform.active=b.dataset.lifeform; log('Lebensform gewechselt'); render(); });
    document.querySelectorAll('[data-moon-select]').forEach(b=>b.onclick=()=>{ state.activeMoonIndex=Number(b.dataset.moonSelect); renderView(true); });
    document.querySelectorAll('[data-moon-build]').forEach(b=>b.onclick=()=>enqueueMoonBuild(b.dataset.moonBuild));
    const jgf=$('#jumpGateForm'); if(jgf) jgf.onsubmit=e=>{e.preventDefault(); const toIdx=Number(jgf.targetMoon.value); const ships={lightFighter:Number(jgf.lightFighter.value)||0, cruiser:Number(jgf.cruiser.value)||0}; jumpGateTransfer(state.activeMoonIndex, toIdx, {}, ships); };
  }
}
function marketTrade(giveType, wantType, amount){ const p=active(); amount=Number(amount)||0; if(giveType===wantType||amount<=0) return log('Ungültiger Handel'); if(p.resources[giveType] < amount) return log('Nicht genug '+giveType); const value = amount * state.marketRate[giveType]; const received = Math.floor(value / state.marketRate[wantType] * 0.9); p.resources[giveType]-=amount; p.resources[wantType]+=received; log('Markt: '+fmt(amount)+' '+giveType+' gegen '+fmt(received)+' '+wantType+' getauscht'); render(); }
function ensurePlanetDefaults(p){ Object.keys(defs.buildings).forEach(k=>{ if(p.buildings[k]==null) p.buildings[k]=0; }); Object.keys(defs.research).forEach(k=>{ if(p.research[k]==null) p.research[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(p.ships[k]==null) p.ships[k]=0; }); if(!p.buildQueue) p.buildQueue=[]; if(!p.researchQueue) p.researchQueue=[]; if(!p.shipQueue) p.shipQueue=[]; }
function ensureMoonDefaults(m){ ['lunarBase','sensorPhalanx','jumpGate'].forEach(k=>{ if(m.buildings[k]==null) m.buildings[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(m.ships[k]==null) m.ships[k]=0; }); if(!m.buildQueue) m.buildQueue=[]; }
function ensureAllDefaults(){ state.planets.forEach(ensurePlanetDefaults); state.moons.forEach(ensureMoonDefaults); }
function render(){ ensureAllDefaults(); if(state.activeMoonIndex===null && state.moons.length>0) state.activeMoonIndex=0; renderNav(); renderTop(); renderSide(); renderView(); }
ensureAllDefaults(); render(); setInterval(tick,1000); setInterval(()=>{ if(!viewInteractionActive()) render(); },5000);
