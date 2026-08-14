'use strict';

const defs = {
  buildings: {
    metalMine:{name:'Metallmine', base:{metal:60, crystal:15, deut:0}, powerUse:l=>10*l, prod:l=>30*l*Math.pow(1.1,l)},
    crystalMine:{name:'Kristallmine', base:{metal:48, crystal:24, deut:0}, powerUse:l=>10*l, prod:l=>20*l*Math.pow(1.1,l)},
    deutSynth:{name:'Deuterium-Synthesizer', base:{metal:225, crystal:75, deut:0}, powerUse:l=>20*l, prod:l=>10*l*Math.pow(1.1,l)},
    solarPlant:{name:'Solarkraftwerk', base:{metal:75, crystal:30, deut:0}, power:l=>40*l*Math.pow(1.05,l)},
    fusionReactor:{name:'Fusionskraftwerk', base:{metal:900, crystal:360, deut:180}, power:l=>30*l*Math.pow(1.05,l), deutUse:l=>Math.floor(10*l*Math.pow(1.1,l)), requires:{deutSynth:5, energyTech:3}},
    robotFactory:{name:'Roboterfabrik', base:{metal:400, crystal:120, deut:200}},
    shipyard:{name:'Raumschiffwerft', base:{metal:400, crystal:200, deut:100}, requires:{robotFactory:2}},
    spaceDock:{name:'Raumstation', base:{metal:20000, crystal:40000, deut:0}, requires:{shipyard:3}},
    researchLab:{name:'Forschungslabor', base:{metal:200, crystal:400, deut:200}},
    metalStorage:{name:'Metallspeicher', base:{metal:1000, crystal:0, deut:0}},
    crystalStorage:{name:'Kristallspeicher', base:{metal:1000, crystal:500, deut:0}},
    deutTank:{name:'Deuteriumtank', base:{metal:1000, crystal:1000, deut:0}},
    missileLauncher:{name:'Raketenwerfer', base:{metal:2000, crystal:0, deut:0}, isDefense:true, attack:80, shield:20, hull:2000, requires:{shipyard:1}},
    lightLaser:{name:'Leichtes Laser-Geschütz', base:{metal:1500, crystal:500, deut:0}, isDefense:true, attack:100, shield:25, hull:2000, requires:{shipyard:2, energyTech:1}},
    heavyLaser:{name:'Schweres Laser-Geschütz', base:{metal:6000, crystal:2000, deut:0}, isDefense:true, attack:250, shield:100, hull:8000, requires:{shipyard:4, energyTech:3}},
    gaussCannon:{name:'Gauß-Kanone', base:{metal:20000, crystal:15000, deut:2000}, isDefense:true, attack:1100, shield:200, hull:35000, requires:{shipyard:6, weaponsTech:3, shieldingTech:1, energyTech:6}},
    ionCannon:{name:'Ionenkanone', base:{metal:5000, crystal:3000, deut:0}, isDefense:true, attack:150, shield:500, hull:8000, requires:{shipyard:4, ionTech:4}},
    plasmaTurret:{name:'Plasmawerfer', base:{metal:50000, crystal:50000, deut:30000}, isDefense:true, attack:3000, shield:300, hull:100000, requires:{shipyard:8, plasmaTech:7}},
    smallShield:{name:'Kleine Schildkuppel', base:{metal:10000, crystal:10000, deut:0}, isDefense:true, unique:true, attack:1, shield:2000, hull:20000, requires:{shieldingTech:2}},
    largeShield:{name:'Große Schildkuppel', base:{metal:50000, crystal:50000, deut:0}, isDefense:true, unique:true, attack:1, shield:10000, hull:100000, requires:{shipyard:6, shieldingTech:6}},
    interplanetaryMissile:{name:'Interplanetare Rakete', base:{metal:12500, crystal:2500, deut:0}, isDefense:true, attack:12000, shield:0, hull:1, requires:{missileSilo:4}},
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
    astrophysics:{name:'Astrophysik', base:{metal:4000, crystal:8000, deut:4000}, requires:{researchLab:3, espionageTech:4, impulseDrive:3}},
    intergalacticNetwork:{name:'Intergalaktisches Forschungsnetzwerk', base:{metal:240000, crystal:400000, deut:160000}, requires:{researchLab:10, computerTech:8}},
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
    reaper:{name:'Reaper', cost:{metal:85000, crystal:55000, deut:20000}, cargo:10000, speed:0.6, fuel:80, attack:2800, shield:700, hull:140000, role:'combat', requires:{shipyard:10, spaceDock:1, hyperspaceTech:6, hyperspaceDrive:7}},
    pathfinder:{name:'Pfadfinder', cost:{metal:8000, crystal:15000, deut:8000}, cargo:10000, speed:1.6, fuel:20, attack:200, shield:100, hull:23000, role:'combat', requires:{shipyard:5, spaceDock:1, hyperspaceDrive:2, hyperspaceTech:3}},
    deathstar:{name:'Todesstern', cost:{metal:5000000, crystal:4000000, deut:1000000}, cargo:1000000, speed:0.4, fuel:1, attack:200000, shield:50000, hull:9000000, role:'combat', requires:{shipyard:12, hyperspaceTech:6, gravitonTech:1}},
    solarSatellite:{name:'Solarsatellit', cost:{metal:0, crystal:2000, deut:500}, cargo:0, speed:0, fuel:0, attack:1, shield:1, hull:2000, role:'power', requires:{}},
    recycler:{name:'Recycler', cost:{metal:10000, crystal:6000, deut:2000}, cargo:20000, speed:0.7, fuel:30, attack:1, shield:10, hull:16000, role:'recycler', requires:{shipyard:4, combustion:6}},
  }
};
const missionLabels = {transport:'Transport', spy:'Spionage', attack:'Angriff', colonize:'Kolonisierung', harvest:'Trümmerfeld-Bergung'};
const UNIVERSE = { galaxies: 9, systems: 499, positions: 15 };

function createInitialState(){
  return {
    timeScale: 20,
    now: Date.now(),
    planets: [
      {name:'Terra Prime', coords:[1,145,7], owner:'player', resources:{metal:2200, crystal:1400, deut:900}, buildings:{metalMine:5, crystalMine:4, deutSynth:3, solarPlant:5, robotFactory:2, shipyard:2, researchLab:2, metalStorage:2, crystalStorage:2, deutTank:2, missileLauncher:4, lightLaser:2, heavyLaser:0}, research:{energyTech:1, combustion:1, computerTech:0, weaponsTech:0, shieldingTech:0, espionageTech:0}, ships:{smallCargo:6, largeCargo:1, colonyShip:1, espionageProbe:3, lightFighter:8, cruiser:0, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]},
      {name:'Nova Draconis', coords:[1,201,10], owner:'player', resources:{metal:900, crystal:550, deut:220}, buildings:{metalMine:3, crystalMine:3, deutSynth:2, solarPlant:3, robotFactory:1, shipyard:1, researchLab:1, metalStorage:1, crystalStorage:1, deutTank:1, missileLauncher:2, lightLaser:0, heavyLaser:0}, research:{energyTech:0, combustion:0, computerTech:0, weaponsTech:0, shieldingTech:0, espionageTech:0}, ships:{smallCargo:2, largeCargo:0, colonyShip:0, espionageProbe:1, lightFighter:2, cruiser:0, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]},
      {name:'Asterion', coords:[1,312,5], owner:'player', resources:{metal:1500, crystal:900, deut:500}, buildings:{metalMine:5, crystalMine:4, deutSynth:3, solarPlant:5, robotFactory:2, shipyard:2, researchLab:2, metalStorage:2, crystalStorage:2, deutTank:2, missileLauncher:6, lightLaser:3, heavyLaser:0}, research:{energyTech:1, combustion:1, computerTech:0, weaponsTech:1, shieldingTech:0, espionageTech:0}, ships:{smallCargo:6, largeCargo:1, colonyShip:0, espionageProbe:3, lightFighter:4, cruiser:1, recycler:0}, buildQueue:[], researchQueue:[], shipQueue:[]}
    ],
    fleets: [],
    reports: [],
    messages: ['Willkommen: Vollständiges OGame-Feature-Set aktiv (Monde, Allianz, Offiziere, Expeditionen, Lebensformen-Basis, Kampfsimulation, Rangliste, Händler).'],
    debrisFields: {},
    moons: [],
    alliance: {name:'Freie Sternenflotte', tag:'FSF', members:['Du','Kryon Def.','Vesper Union'], points:20000, depot:{metal:0, crystal:0, deut:0}},
    officerExpiry: {},
    darkMatter: 4200,
    expeditions: [],
    lifeform: {active:'humans', points:0, buildings:{}, research:{}},
    marketRate: { metal:1, crystal:1.5, deut:3 },
    logs: ['Neue Galaxie initialisiert.'],
  };
}

function coordStr(c){ return '['+c[0]+':'+c[1]+':'+c[2]+']'; }
function coordLinkHtml(coord, label){ return `<button type="button" class="coord-link" data-coord="${coord[0]}:${coord[1]}:${coord[2]}">${label!=null?label:coordStr(coord)}</button>`; }
function validCoord(galaxy, system, pos){ return Number.isInteger(galaxy) && galaxy>=1 && galaxy<=UNIVERSE.galaxies && Number.isInteger(system) && system>=1 && system<=UNIVERSE.systems && Number.isInteger(pos) && pos>=1 && pos<=UNIVERSE.positions; }
function debrisKey(coord){ return coord[0]+':'+coord[1]+':'+coord[2]; }

function seedGalaxy(state, galaxy, system){
  const rnd = (seed)=>{ let x=Math.sin(seed*999+system*13+galaxy*104729)*10000; return x-Math.floor(x); };
  const slots = [];
  for(let pos=1; pos<=UNIVERSE.positions; pos++){
    const owned = state.planets.find(p=>p.coords[0]===galaxy && p.coords[1]===system && p.coords[2]===pos);
    if(owned){ slots.push({pos, type:'own', planet:owned}); continue; }
    const r = rnd(pos+system);
    if(r < 0.35){
      const level = Math.max(3, Math.floor(r*30));
      const defenseShips = { missileLauncher: level*4, lightLaser: Math.floor(level*1.5) };
      const fleet = { lightFighter: Math.floor(level*1.5) };
      if(level>10) fleet.cruiser = Math.floor(level/4);
      slots.push({pos, type:'npc', name:'Kolonie '+String.fromCharCode(65+pos), level, metal:800*level, crystal:500*level, deut:200*level, defenseShips, fleet});
    } else {
      slots.push({pos, type:'empty'});
    }
  }
  return slots;
}

function log(state, msg){ state.logs.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.logs = state.logs.slice(0,10); }
function message(state, msg){ state.messages.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.messages = state.messages.slice(0,20); }
function fail(state, msg){ log(state, msg); return { ok:false, message: msg }; }
function ok(state, msg){ if(msg) log(state, msg); return { ok:true, message: msg }; }

function meetsRequirements(p, req){ if(!req) return true; for(const [k,v] of Object.entries(req)){ const have = p.buildings[k]!=null ? p.buildings[k] : (p.research[k]!=null ? p.research[k] : 0); if(have<v) return false; } return true; }
function requirementText(req){ if(!req) return ''; return Object.entries(req).map(([k,v])=>{ const nm = defs.buildings[k]?defs.buildings[k].name:(defs.research[k]?defs.research[k].name:k); return nm+' Stufe '+v; }).join(', '); }
function addDebris(state, coord, metal, crystal){ const key=debrisKey(coord); const cur = state.debrisFields[key] || {coord, metal:0, crystal:0}; cur.metal += metal; cur.crystal += crystal; state.debrisFields[key]=cur; }
function officerActive(state, key){ return !!(state.officerExpiry[key] && state.officerExpiry[key] > Date.now()); }
function officerBonus(state){ return officerActive(state,'geologist') ? 1.10 : 1.0; }
function fleetSpeedBonus(state){ return officerActive(state,'admiral') ? 1.1 : 1.0; }
function engineerBonus(state){ return officerActive(state,'engineer') ? 1.10 : 1.0; }
function commanderDiscount(state){ return officerActive(state,'commander') ? 0.95 : 1.0; }
function technocratSpeed(state){ return officerActive(state,'technocrat') ? 0.85 : 1.0; }
function pathfinderBonus(shipMap){ return (shipMap && shipMap.pathfinder>0) ? 1.1 : 1.0; }
function networkSpeed(p){ const lvl=(p.research.intergalacticNetwork)||0; return Math.max(0.5, 1-0.02*lvl); }
function buildingCost(state, base, level){ const c=scaledCost(base, level); const d=commanderDiscount(state); return {metal:Math.floor(c.metal*d), crystal:Math.floor(c.crystal*d), deut:Math.floor(c.deut*d)}; }
function maxColonies(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor((lvl+1)/2); }
function maxExpeditions(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor(lvl/2); }
function moonChanceFromDebris(debrisTotal){ return Math.min(0.20, Math.floor(debrisTotal/50000)*0.01); }
function maybeCreateMoon(state, coord, debrisTotal){
  const chance = moonChanceFromDebris(debrisTotal);
  if(Math.random()<chance){
    const exists = state.moons.find(m=>m.coord[0]===coord[0]&&m.coord[1]===coord[1]&&m.coord[2]===coord[2]);
    if(!exists){
      state.moons.push({coord:[...coord], size: Math.floor(2000+Math.random()*5000), buildings:{lunarBase:0, sensorPhalanx:0, jumpGate:0}, buildQueue:[], ships:{smallCargo:0,largeCargo:0,colonyShip:0,espionageProbe:0,lightFighter:0,heavyFighter:0,cruiser:0,battleship:0,battlecruiser:0,bomber:0,destroyer:0,deathstar:0,solarSatellite:0,recycler:0}});
      message(state, 'Ein Mond ist bei '+coordLinkHtml(coord)+' entstanden.');
    }
  }
}
function allianceRank(points){ if(points>=2000000) return 'Elite-Kommandant'; if(points>=500000) return 'Kommandeur'; if(points>=100000) return 'Veteran'; if(points>=10000) return 'Krieger'; return 'Rekrut'; }

function sidePower(shipMap, table){
  let attack=0, shield=0, hull=0;
  for(const [k,v] of Object.entries(shipMap||{})){
    if(!v || !table[k]) continue;
    attack += (table[k].attack||0)*v;
    shield += (table[k].shield||0)*v;
    hull += (table[k].hull||0)*v;
  }
  return {attack, shield, hull};
}
function extractDefense(buildings){ const result={}; for(const [k,d] of Object.entries(defs.buildings)){ if(d.isDefense && buildings[k]) result[k]=buildings[k]; } return result; }
function simulateBattle(attackerShips, defenderShips, defenderDefenseShips){
  const att0 = sidePower(attackerShips, defs.ships);
  const defFleet0 = sidePower(defenderShips, defs.ships);
  const defDef0 = sidePower(defenderDefenseShips, defs.buildings);
  const def0 = {attack: defFleet0.attack+defDef0.attack, shield: defFleet0.shield+defDef0.shield, hull: defFleet0.hull+defDef0.hull};
  let attHull=att0.hull, defHull=def0.hull, rounds=0;
  const variance=()=>0.9+Math.random()*0.2;
  while(rounds<6 && attHull>0 && defHull>0){
    rounds++;
    const dmgToDef = Math.max(0, att0.attack*variance() - def0.shield);
    const dmgToAtt = Math.max(0, def0.attack*variance() - att0.shield);
    defHull -= dmgToDef;
    attHull -= dmgToAtt;
  }
  const attackerWon = defHull<=0 && attHull>0;
  const attackerLossRatio = att0.hull>0 ? Math.min(1,Math.max(0,(att0.hull-Math.max(0,attHull))/att0.hull)) : 0;
  const defenderLossRatio = def0.hull>0 ? Math.min(1,Math.max(0,(def0.hull-Math.max(0,defHull))/def0.hull)) : 1;
  return { rounds, attackerWon, defenderWon: !attackerWon, attackerLossRatio, defenderLossRatio, attackerPower:att0, defenderPower:def0 };
}
function applyLosses(shipMap, ratio){ const res={}; for(const [k,v] of Object.entries(shipMap||{})){ res[k] = v ? Math.floor(v*(1-ratio)) : 0; } return res; }
function diffLosses(before, after){ const res={}; for(const k of Object.keys(before||{})){ res[k]=Math.max(0,(before[k]||0)-(after[k]||0)); } return res; }
function shipCostSum(shipMap, resource){ let sum=0; for(const [k,v] of Object.entries(shipMap||{})){ if(v && defs.ships[k]) sum += defs.ships[k].cost[resource]*v; } return sum; }

function scaledCost(base, level){ const mult=Math.pow(1.6, level-1); return {metal:Math.floor(base.metal*mult), crystal:Math.floor(base.crystal*mult), deut:Math.floor(base.deut*mult)}; }
function hasRes(p,c){ return p.resources.metal>=c.metal && p.resources.crystal>=c.crystal && p.resources.deut>=c.deut; }
function spend(p,c){ p.resources.metal-=c.metal; p.resources.crystal-=c.crystal; p.resources.deut-=c.deut; }
function addRes(p,c){ p.resources.metal+=c.metal||0; p.resources.crystal+=c.crystal||0; p.resources.deut+=c.deut||0; }
function fusionDeutUse(p){ return (p.buildings.fusionReactor) ? defs.buildings.fusionReactor.deutUse(p.buildings.fusionReactor) : 0; }
function energyStats(state, p){
  const solar=defs.buildings.solarPlant.power(p.buildings.solarPlant);
  const fusion=defs.buildings.fusionReactor.power(p.buildings.fusionReactor||0);
  const satellites=(p.ships.solarSatellite||0)*20;
  const prod=(solar+fusion+satellites)*engineerBonus(state);
  const use=defs.buildings.metalMine.powerUse(p.buildings.metalMine)+defs.buildings.crystalMine.powerUse(p.buildings.crystalMine)+defs.buildings.deutSynth.powerUse(p.buildings.deutSynth);
  return {prod,use,ratio: use? Math.min(1,prod/use):1};
}
function hourly(state, p){
  const e=energyStats(state, p).ratio; const bonus=officerBonus(state);
  return {
    metal: defs.buildings.metalMine.prod(p.buildings.metalMine)*e*bonus,
    crystal: defs.buildings.crystalMine.prod(p.buildings.crystalMine)*e*bonus,
    deut: defs.buildings.deutSynth.prod(p.buildings.deutSynth)*e*bonus - fusionDeutUse(p)
  };
}
function maxStorage(p){ return {metal:Math.max(5000,5000*p.buildings.metalStorage), crystal:Math.max(5000,5000*p.buildings.crystalStorage), deut:Math.max(5000,5000*p.buildings.deutTank)}; }
function capacityForShips(shipMap){ let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].cargo*v; } return total; }
function fuelForShips(shipMap){ let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].fuel*v; } return total; }
function fleetSpeed(shipMap){ const vals=Object.entries(shipMap).filter(([,v])=>v>0).map(([k])=>defs.ships[k].speed); return vals.length?Math.min(...vals):1; }
function distanceBetween(a,b){ return Math.abs(a[0]-b[0])*15000 + Math.abs(a[1]-b[1])*20 + Math.abs(a[2]-b[2]) + 5; }
function fleetDuration(state, fromCoord,toCoord,shipMap){ const speed=fleetSpeed(shipMap)*fleetSpeedBonus(state)*pathfinderBonus(shipMap); const distance=distanceBetween(fromCoord,toCoord); return Math.max(10, Math.round((distance*3)/speed)); }
function computePoints(p){
  let total=0;
  for(const [k,lvl] of Object.entries(p.buildings)){ const def=defs.buildings[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ const c=scaledCost(def.base,l); total+=c.metal+c.crystal+c.deut; } }
  for(const [k,lvl] of Object.entries(p.research)){ const def=defs.research[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ const c=scaledCost(def.base,l); total+=c.metal+c.crystal+c.deut; } }
  for(const [k,v] of Object.entries(p.ships)){ if(defs.ships[k] && v) total += (defs.ships[k].cost.metal+defs.ships[k].cost.crystal+defs.ships[k].cost.deut)*v; }
  return total;
}
function totalPlayerPoints(state){ return Math.floor(state.planets.reduce((s,p)=>s+computePoints(p),0)/1000); }

function ensurePlanetDefaults(p){ Object.keys(defs.buildings).forEach(k=>{ if(p.buildings[k]==null) p.buildings[k]=0; }); Object.keys(defs.research).forEach(k=>{ if(p.research[k]==null) p.research[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(p.ships[k]==null) p.ships[k]=0; }); if(!p.buildQueue) p.buildQueue=[]; if(!p.researchQueue) p.researchQueue=[]; if(!p.shipQueue) p.shipQueue=[]; }
function ensureMoonDefaults(m){ ['lunarBase','sensorPhalanx','jumpGate'].forEach(k=>{ if(m.buildings[k]==null) m.buildings[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(m.ships[k]==null) m.ships[k]=0; }); if(!m.buildQueue) m.buildQueue=[]; }
function ensureAllDefaults(state){ state.planets.forEach(ensurePlanetDefaults); state.moons.forEach(ensureMoonDefaults); if(!state.officerExpiry) state.officerExpiry={}; if(!state.marketRate) state.marketRate={metal:1,crystal:1.5,deut:3}; }

function normalizeState(data){
  const fresh = createInitialState();
  const state = {
    timeScale: 20,
    now: Date.now(),
    planets: data.planets || fresh.planets,
    fleets: data.fleets || [],
    reports: data.reports || [],
    messages: data.messages || fresh.messages,
    debrisFields: data.debrisFields || {},
    moons: data.moons || [],
    alliance: data.alliance || fresh.alliance,
    officerExpiry: data.officerExpiry || {},
    darkMatter: data.darkMatter!=null ? data.darkMatter : fresh.darkMatter,
    expeditions: data.expeditions || [],
    lifeform: data.lifeform || fresh.lifeform,
    marketRate: data.marketRate || fresh.marketRate,
    logs: data.logs || fresh.logs,
  };
  ensureAllDefaults(state);
  return state;
}

// ---- Action handlers ----

function requirePlanet(state, planetIndex){
  const p = state.planets[planetIndex];
  if(!p) throw new Error('Ungültiger Planet');
  return p;
}

function enqueueBuild(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.buildings[key];
  if(!def) return fail(state, 'Unbekanntes Gebäude');
  if(!meetsRequirements(p, def.requires)) return fail(state, def.name+' benötigt: '+requirementText(def.requires));
  const lvl = p.buildings[key]+1;
  const cost = buildingCost(state, def.base, lvl);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(8, Math.round((cost.metal+cost.crystal)/(250*(1+p.buildings.robotFactory))));
  p.buildQueue.push({type:'building', key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' Stufe '+lvl+' gestartet');
}
function enqueueResearch(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.research[key];
  if(!def) return fail(state, 'Unbekannte Forschung');
  if(!meetsRequirements(p, def.requires)) return fail(state, def.name+' benötigt: '+requirementText(def.requires));
  const lvl = p.research[key]+1;
  const cost = scaledCost(def.base, lvl);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(12, Math.round((cost.crystal+cost.deut)/(220*(1+p.buildings.researchLab))*technocratSpeed(state)*networkSpeed(p)));
  p.researchQueue.push({type:'research', key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' Stufe '+lvl+' gestartet');
}
function enqueueShip(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.ships[key];
  if(!def) return fail(state, 'Unbekanntes Schiff');
  if(!meetsRequirements(p, def.requires)) return fail(state, def.name+' benötigt: '+requirementText(def.requires));
  const cost = def.cost;
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(6, Math.round((cost.metal+cost.crystal)/(300*(1+p.buildings.shipyard))));
  p.shipQueue.push({type:'ship', key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' in Bau');
}
function enqueueDefense(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.buildings[key];
  if(!def || !def.isDefense) return fail(state, 'Unbekannte Verteidigungsanlage');
  if(!meetsRequirements(p, def.requires)) return fail(state, def.name+' benötigt: '+requirementText(def.requires));
  const count = p.buildings[key]||0;
  if(def.unique && count>=1) return fail(state, def.name+' ist bereits vorhanden (nur 1 pro Planet)');
  if(key==='interplanetaryMissile'){ const cap=(p.buildings.missileSilo||0)*10; if(count>=cap) return fail(state, 'Raketensilo-Kapazität erreicht ('+cap+')'); }
  const d = commanderDiscount(state);
  const cost = {metal:Math.floor(def.base.metal*d), crystal:Math.floor(def.base.crystal*d), deut:Math.floor(def.base.deut*d)};
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(5, Math.round((cost.metal+cost.crystal)/(300*(1+p.buildings.shipyard))));
  p.buildQueue.push({type:'defense', key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' in Bau');
}

function sendFleet(state, planetIndex, params){
  const p = requirePlanet(state, planetIndex);
  const mission = params.mission;
  if(!missionLabels[mission]) return fail(state, 'Unbekannte Mission');
  const gal = Number(params.gal), sys = Number(params.sys), pos = Number(params.pos);
  if(!validCoord(gal,sys,pos)) return fail(state, 'Ungültiges Ziel: Galaxie (1-'+UNIVERSE.galaxies+'), System (1-'+UNIVERSE.systems+') und Position (1-'+UNIVERSE.positions+') angeben');
  const toCoord = [gal, sys, pos];
  const ownIdx = state.planets.findIndex(pl=>pl.coords[0]===gal && pl.coords[1]===sys && pl.coords[2]===pos);
  if(mission==='attack' && ownIdx>=0) return fail(state, 'Eigene Planeten können nicht angegriffen werden');
  let toPlanetIndex=null, npcSlot=null, emptySlot=null;
  if(ownIdx>=0) toPlanetIndex = ownIdx;
  else {
    const slots = seedGalaxy(state, gal, sys); const slot = slots.find(s=>s.pos===pos);
    if(slot.type==='npc') npcSlot = slot; else if(slot.type==='empty') emptySlot = slot;
  }
  const ships = {};
  Object.keys(defs.ships).forEach(k=>{ if(defs.ships[k].role!=='power') ships[k]=Number((params.ships||{})[k])||0; });
  const totalShips = Object.values(ships).reduce((a,b)=>a+b,0);
  if(totalShips<=0) return fail(state, 'Keine Schiffe ausgewählt');
  for(const [k,v] of Object.entries(ships)){ if(v>(p.ships[k]||0)) return fail(state, 'Zu wenige '+defs.ships[k].name); }
  const combatPower = Object.entries(ships).reduce((s,[k,v])=> s + (defs.ships[k] && defs.ships[k].role==='combat' ? v : 0), 0);
  if(mission==='colonize' && ships.colonyShip<1) return fail(state, 'Kolonisierung braucht mindestens ein Kolonieschiff');
  if(mission==='colonize' && !emptySlot) return fail(state, 'Zielfeld ist nicht leer');
  if(mission==='colonize' && state.planets.length>=maxColonies(p)) return fail(state, 'Maximale Kolonieanzahl erreicht (Astrophysik ausbauen, aktuell max '+maxColonies(p)+')');
  if(mission==='spy' && ships.espionageProbe<1) return fail(state, 'Spionage braucht mindestens eine Sonde');
  if(mission==='attack' && combatPower<1) return fail(state, 'Angriff braucht Kampfschiffe');
  if(mission==='harvest' && ships.recycler<1) return fail(state, 'Bergung braucht mindestens einen Recycler');
  if(mission==='harvest' && !state.debrisFields[debrisKey(toCoord)]) return fail(state, 'Kein Trümmerfeld auf diesem Feld');

  const cargo = {metal:Number((params.cargo||{}).metal)||0, crystal:Number((params.cargo||{}).crystal)||0, deut:Number((params.cargo||{}).deut)||0};
  const cap = capacityForShips(ships); const totalCargo = cargo.metal+cargo.crystal+cargo.deut;
  if(mission==='transport' && totalCargo>cap) return fail(state, 'Zu wenig Ladekapazität');
  const dur = fleetDuration(state, p.coords, toCoord, ships); const fuel = fuelForShips(ships)*Math.max(1,dur/20);
  if(cargo.deut+fuel>p.resources.deut) return fail(state, 'Zu wenig Deuterium für Ladung und Flug');
  if(cargo.metal>p.resources.metal||cargo.crystal>p.resources.crystal) return fail(state, 'Nicht genug Ressourcen zum Versenden');

  for(const [k,v] of Object.entries(ships)) p.ships[k]-=v;
  if(mission==='transport'){ p.resources.metal-=cargo.metal; p.resources.crystal-=cargo.crystal; p.resources.deut-=cargo.deut; }
  p.resources.deut-=fuel;

  state.fleets.push({from:planetIndex, toCoord, toPlanetIndex, npcSlot, emptySlot, ships, cargo:mission==='transport'?cargo:{metal:0,crystal:0,deut:0}, mission, arrive:Date.now()+dur*1000, returnAt:Date.now()+dur*2000, phase:'outbound', fuel});
  return ok(state, missionLabels[mission]+'-Flotte nach '+coordLinkHtml(toCoord)+' gestartet');
}

function sendExpedition(state, planetIndex, shipsMap, durationSlot){
  const p = requirePlanet(state, planetIndex);
  const maxExp = maxExpeditions(p);
  if(state.expeditions.length>=maxExp) return fail(state, 'Keine Expeditions-Plätze frei (max '+maxExp+', Astrophysik ausbauen)');
  const ships = {};
  Object.keys(shipsMap||{}).forEach(k=>{ if(defs.ships[k]) ships[k]=Number(shipsMap[k])||0; });
  for(const [k,v] of Object.entries(ships)){ if(v>(p.ships[k]||0)) return fail(state, 'Zu wenige '+defs.ships[k].name); }
  const total = Object.values(ships).reduce((a,b)=>a+b,0);
  if(total<1) return fail(state, 'Keine Schiffe für Expedition gewählt');
  for(const [k,v] of Object.entries(ships)) p.ships[k]-=v;
  const secs = (Number(durationSlot)||1)*900;
  state.expeditions.push({from:planetIndex, ships, done:Date.now()+secs*1000});
  return ok(state, 'Expedition gestartet');
}

function resolveExpedition(state, exp){
  const p = state.planets[exp.from]; const roll = Math.random();
  if(!p){ return; }
  if(roll<0.30){ const gain={metal:Math.floor(Math.random()*20000), crystal:Math.floor(Math.random()*15000), deut:Math.floor(Math.random()*8000)}; addRes(p,gain); message(state, 'Expedition erfolgreich: '+(gain.metal+gain.crystal+gain.deut)+' Ressourcen gefunden.'); }
  else if(roll<0.42){ const dm=Math.floor(100+Math.random()*500); state.darkMatter+=dm; message(state, 'Expedition fand '+dm+' Dunkle Materie.'); }
  else if(roll<0.55){ for(const [k,v] of Object.entries(exp.ships)) p.ships[k]=(p.ships[k]||0)+v; message(state, 'Expeditionsflotte kehrte unbeschadet zurück.'); return; }
  else if(roll<0.62){
    const bonusOptions=['smallCargo','lightFighter','espionageProbe'];
    const bonusKey = bonusOptions[Math.floor(Math.random()*bonusOptions.length)];
    p.ships[bonusKey]=(p.ships[bonusKey]||0)+1;
    for(const [k,v] of Object.entries(exp.ships)) p.ships[k]=(p.ships[k]||0)+v;
    message(state, 'Expedition fand ein Wrack: 1 zusätzliches Schiff geborgen ('+defs.ships[bonusKey].name+').');
    return;
  }
  else if(roll<0.90){
    const fleetSize = Object.values(exp.ships).reduce((a,b)=>a+b,0);
    const pirateFleet = {lightFighter: Math.max(1, Math.floor(fleetSize/2))};
    const battle = simulateBattle(exp.ships, pirateFleet, {});
    exp.ships = applyLosses(exp.ships, battle.attackerLossRatio);
    if(battle.attackerWon){ message(state, 'Expedition traf auf Piraten und siegte nach '+battle.rounds+' Kampfrunde(n).'); }
    else { message(state, 'Expedition traf auf Piraten und verlor einen Teil der Flotte ('+battle.rounds+' Kampfrunde(n)).'); }
  }
  else { message(state, 'Expeditionsflotte ist im Nichts verschwunden.'); return; }
  for(const [k,v] of Object.entries(exp.ships)) p.ships[k]=(p.ships[k]||0)+v;
}

function enqueueMoonBuild(state, planetIndex, moonIndex, key){
  const m = state.moons[moonIndex];
  if(!m) return fail(state, 'Kein Mond ausgewählt');
  const def = defs.buildings[key];
  if(!def) return fail(state, 'Unbekanntes Mondgebäude');
  const lvl = (m.buildings[key]||0)+1;
  const cost = scaledCost(def.base, lvl);
  const p = requirePlanet(state, planetIndex);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen auf dem Heimatplaneten für '+def.name);
  spend(p,cost);
  const secs = Math.max(10, Math.round((cost.metal+cost.crystal)/300));
  m.buildQueue.push({key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' auf Mond gestartet (Kosten vom gewählten Planeten)');
}
function jumpGateReady(m){ return (m.buildings.jumpGate||0) >= 1; }
function jumpGateTransfer(state, fromMoonIdx, toMoonIdx, shipsMap){
  const from = state.moons[fromMoonIdx]; const to = state.moons[toMoonIdx];
  if(!from || !to) return fail(state, 'Ungültiger Mond');
  if(!jumpGateReady(from) || !jumpGateReady(to)) return fail(state, 'Beide Monde brauchen ein Sprungtor');
  const ships = {};
  Object.keys(shipsMap||{}).forEach(k=>{ if(defs.ships[k]) ships[k]=Number(shipsMap[k])||0; });
  for(const [k,v] of Object.entries(ships)){ if(v>(from.ships[k]||0)) return fail(state, 'Zu wenige '+defs.ships[k].name+' auf dem Mond'); }
  for(const [k,v] of Object.entries(ships)){ from.ships[k]-=v; to.ships[k]=(to.ships[k]||0)+v; }
  return ok(state, 'Sprungtor-Transfer nach '+coordLinkHtml(to.coord)+' abgeschlossen (sofort)');
}
function depositAlliance(state, planetIndex){
  const p = requirePlanet(state, planetIndex);
  const amt = {metal:Math.min(1000,p.resources.metal), crystal:Math.min(1000,p.resources.crystal), deut:Math.min(1000,p.resources.deut)};
  p.resources.metal-=amt.metal; p.resources.crystal-=amt.crystal; p.resources.deut-=amt.deut;
  state.alliance.depot.metal += amt.metal; state.alliance.depot.crystal += amt.crystal; state.alliance.depot.deut += amt.deut;
  return ok(state, 'Ressourcen ins Allianzdepot eingezahlt');
}
function marketTrade(state, planetIndex, giveType, wantType, amount){
  const p = requirePlanet(state, planetIndex);
  amount = Number(amount)||0;
  if(giveType===wantType || amount<=0) return fail(state, 'Ungültiger Handel');
  if(!state.marketRate[giveType] || !state.marketRate[wantType]) return fail(state, 'Unbekannte Ressource');
  if(p.resources[giveType] < amount) return fail(state, 'Nicht genug '+giveType);
  const value = amount * state.marketRate[giveType];
  const received = Math.floor(value / state.marketRate[wantType] * 0.9);
  p.resources[giveType]-=amount; p.resources[wantType]+=received;
  return ok(state, 'Markt: '+amount+' '+giveType+' gegen '+received+' '+wantType+' getauscht');
}
function merchantBuy(state, planetIndex, resourceType, amount){
  const p = requirePlanet(state, planetIndex);
  amount = Math.floor(Number(amount))||0;
  if(amount<=0 || !['metal','crystal','deut'].includes(resourceType)) return fail(state, 'Ungültige Menge');
  const rate = 5;
  const cost = Math.ceil(amount/rate);
  if(state.darkMatter<cost) return fail(state, 'Nicht genug Dunkle Materie');
  state.darkMatter-=cost;
  addRes(p, {[resourceType]:amount});
  return ok(state, 'Händler: '+amount+' '+resourceType+' für '+cost+' Dunkle Materie gekauft');
}
function launchMissiles(state, planetIndex, targetPos, count){
  const p = requirePlanet(state, planetIndex);
  count = Math.floor(Number(count))||0;
  targetPos = Math.floor(Number(targetPos))||0;
  if(count<1 || count>(p.buildings.interplanetaryMissile||0)) return fail(state, 'Ungültige Raketenanzahl');
  if(targetPos<1 || targetPos>UNIVERSE.positions) return fail(state, 'Ungültige Zielposition');
  const ownIdx = state.planets.findIndex(pl=>pl.coords[0]===p.coords[0] && pl.coords[1]===p.coords[1] && pl.coords[2]===targetPos);
  if(ownIdx>=0) return fail(state, 'Eigene Planeten können nicht angegriffen werden');
  const slots = seedGalaxy(state, p.coords[0], p.coords[1]); const slot = slots.find(s=>s.pos===targetPos);
  if(!slot || slot.type!=='npc') return fail(state, 'Kein gültiges Ziel auf dieser Position');
  p.buildings.interplanetaryMissile -= count;
  const missileAttack = count*defs.buildings.interplanetaryMissile.attack;
  const defPower = sidePower(slot.defenseShips, defs.buildings).attack;
  const netDamage = Math.max(0, missileAttack-defPower);
  if(netDamage>0){ message(state, 'Raketenangriff auf '+slot.name+' bei '+coordLinkHtml([p.coords[0],p.coords[1],targetPos])+': '+netDamage+' Schaden an der Verteidigung.'); return ok(state, 'Raketen abgefeuert · '+netDamage+' Schaden'); }
  message(state, 'Raketenangriff auf '+slot.name+' von der Verteidigung vollständig abgefangen.');
  return ok(state, 'Raketen abgefeuert · abgefangen');
}
function activateOfficer(state, key){
  const validKeys = ['commander','admiral','engineer','geologist','technocrat'];
  if(!validKeys.includes(key)) return fail(state, 'Unbekannter Offizier');
  if(officerActive(state, key)) return fail(state, 'Offizier bereits aktiv');
  if(state.darkMatter<500) return fail(state, 'Nicht genug Dunkle Materie');
  state.darkMatter-=500;
  state.officerExpiry[key] = Date.now()+7*24*3600*1000;
  return ok(state, 'Offizier aktiviert (7 Tage)');
}
function setLifeform(state, species){
  const valid = ['humans','rocktal','mechas','kaelesh'];
  if(!valid.includes(species)) return fail(state, 'Unbekannte Lebensform');
  state.lifeform.active = species;
  return ok(state, 'Lebensform gewechselt');
}

function resolveArrival(state, f){
  if(f.mission==='transport'){
    const target = f.toPlanetIndex!=null ? state.planets[f.toPlanetIndex] : null;
    if(target){ addRes(target,f.cargo); log(state, 'Transport hat '+target.name+' erreicht und entladen'); }
    f.phase='return';
  } else if(f.mission==='spy'){
    if(f.npcSlot){
      const defPower = sidePower(f.npcSlot.defenseShips, defs.buildings).attack;
      state.reports.unshift({time:new Date().toLocaleTimeString('de-DE'), target:f.npcSlot.name, coords:coordStr(f.toCoord), coordArr:f.toCoord, resources:{metal:f.npcSlot.metal, crystal:f.npcSlot.crystal, deut:f.npcSlot.deut}, defense:defPower, fleet:f.npcSlot.fleet});
      log(state, 'Spionagebericht über '+f.npcSlot.name+' erhalten');
    } else if(f.toPlanetIndex!=null){
      const t = state.planets[f.toPlanetIndex];
      state.reports.unshift({time:new Date().toLocaleTimeString('de-DE'), target:t.name, coords:coordStr(t.coords), coordArr:t.coords, resources:{...t.resources}, defense:sidePower(extractDefense(t.buildings), defs.buildings).attack, fleet:t.ships});
      log(state, 'Spionagebericht über '+t.name+' erhalten');
    }
    f.phase='return';
  } else if(f.mission==='attack'){
    if(f.npcSlot){
      const battle = simulateBattle(f.ships, f.npcSlot.fleet, f.npcSlot.defenseShips);
      const survivingAttacker = applyLosses(f.ships, battle.attackerLossRatio);
      const survivingDefenderFleet = applyLosses(f.npcSlot.fleet, battle.defenderLossRatio);
      const lostAttacker = diffLosses(f.ships, survivingAttacker);
      const lostDefenderFleet = diffLosses(f.npcSlot.fleet, survivingDefenderFleet);
      const debrisMetal = Math.floor(shipCostSum(lostAttacker,'metal')*0.3 + shipCostSum(lostDefenderFleet,'metal')*0.3);
      const debrisCrystal = Math.floor(shipCostSum(lostAttacker,'crystal')*0.3 + shipCostSum(lostDefenderFleet,'crystal')*0.3);
      f.ships = survivingAttacker;
      const roundsText = battle.rounds>0 ? battle.rounds+' Kampfrunde(n)' : 'kampflos (keine Verteidigung)';
      if(debrisMetal+debrisCrystal>0){ addDebris(state, f.toCoord, debrisMetal, debrisCrystal); maybeCreateMoon(state, f.toCoord, debrisMetal+debrisCrystal); }
      if(battle.attackerWon){
        const loot = {metal: Math.floor(f.npcSlot.metal*0.5), crystal: Math.floor(f.npcSlot.crystal*0.5), deut: Math.floor(f.npcSlot.deut*0.5)};
        const cap = capacityForShips(f.ships); const totalLoot = Math.min(cap, loot.metal+loot.crystal+loot.deut);
        const ratio = (loot.metal+loot.crystal+loot.deut)>0 ? totalLoot/(loot.metal+loot.crystal+loot.deut) : 0;
        f.cargo = {metal:Math.floor(loot.metal*ratio), crystal:Math.floor(loot.crystal*ratio), deut:Math.floor(loot.deut*ratio)};
        message(state, 'Angriffsbericht: Sieg gegen '+f.npcSlot.name+' bei '+coordLinkHtml(f.toCoord)+' ('+roundsText+'). Beute '+(f.cargo.metal+f.cargo.crystal+f.cargo.deut)+'. Trümmerfeld: '+(debrisMetal+debrisCrystal)+'.');
        log(state, 'Angriff auf '+f.npcSlot.name+' erfolgreich · Beute '+(f.cargo.metal+f.cargo.crystal+f.cargo.deut));
      } else {
        f.cargo={metal:0,crystal:0,deut:0};
        message(state, 'Angriffsbericht: Niederlage gegen '+f.npcSlot.name+' bei '+coordLinkHtml(f.toCoord)+' ('+roundsText+'). Eigene Verluste erlitten.');
        log(state, 'Angriff auf '+f.npcSlot.name+' gescheitert · Verluste erlitten');
      }
    } else {
      log(state, 'Angriff nicht möglich'); f.cargo={metal:0,crystal:0,deut:0};
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
      log(state, 'Trümmerfeld bei '+coordLinkHtml(f.toCoord)+' geborgen: '+(gained.metal+gained.crystal));
    } else { f.cargo={metal:0,crystal:0,deut:0}; }
    f.phase='return';
  } else if(f.mission==='colonize'){
    if(f.emptySlot){
      const homeResearch = state.planets[f.from] ? state.planets[f.from].research : {};
      const newPlanet = {name:'Kolonie '+coordStr(f.toCoord), coords:f.toCoord, owner:'player', resources:{metal:500, crystal:300, deut:100}, buildings:{metalMine:1, crystalMine:1, deutSynth:0, solarPlant:1, robotFactory:0, shipyard:0, researchLab:0, metalStorage:1, crystalStorage:1, deutTank:1}, research:{...homeResearch}, ships:{smallCargo:0, largeCargo:0, colonyShip:0, espionageProbe:0, lightFighter:0, cruiser:0}, buildQueue:[], researchQueue:[], shipQueue:[]};
      ensurePlanetDefaults(newPlanet);
      state.planets.push(newPlanet);
      f.ships.colonyShip = Math.max(0, f.ships.colonyShip-1);
      log(state, 'Neue Kolonie gegründet: '+newPlanet.name);
    }
    f.phase='return';
  }
}

function tick(state){
  const now = Date.now();
  const dt = (now-state.now)/1000; state.now = now;
  const hours = (dt*state.timeScale)/3600;
  state.planets.forEach(p=>{
    const inc = hourly(state, p); const cap = maxStorage(p);
    p.resources.metal = Math.max(0, Math.min(cap.metal, p.resources.metal+inc.metal*hours));
    p.resources.crystal = Math.max(0, Math.min(cap.crystal, p.resources.crystal+inc.crystal*hours));
    p.resources.deut = Math.max(0, Math.min(cap.deut, p.resources.deut+inc.deut*hours));
    while(p.buildQueue[0] && p.buildQueue[0].done<=now){ const q=p.buildQueue.shift(); p.buildings[q.key]=(p.buildings[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
    while(p.researchQueue[0] && p.researchQueue[0].done<=now){ const q=p.researchQueue.shift(); p.research[q.key]=(p.research[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
    while(p.shipQueue[0] && p.shipQueue[0].done<=now){ const q=p.shipQueue.shift(); p.ships[q.key]=(p.ships[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
  });
  state.moons.forEach(m=>{ while(m.buildQueue[0] && m.buildQueue[0].done<=now){ const q=m.buildQueue.shift(); m.buildings[q.key]=(m.buildings[q.key]||0)+1; message(state, 'Mond '+coordLinkHtml(m.coord)+': '+q.name+' fertig'); } });
  state.fleets.forEach(f=>{
    if(f.phase==='outbound' && f.arrive<=now){ resolveArrival(state, f); }
    if(f.phase==='return' && f.returnAt<=now){
      const source = state.planets[f.from];
      if(source){
        for(const [k,v] of Object.entries(f.ships)) source.ships[k]=(source.ships[k]||0)+v;
        if(f.mission!=='transport'&&f.mission!=='colonize') addRes(source,f.cargo);
        log(state, 'Flotte nach '+source.name+' zurückgekehrt');
      }
      f.phase='done';
    }
  });
  state.fleets = state.fleets.filter(f=>f.phase!=='done');
  state.expeditions.forEach(exp=>{ if(exp.done<=now && !exp.resolved){ exp.resolved=true; resolveExpedition(state, exp); } });
  state.expeditions = state.expeditions.filter(exp=>!exp.resolved);
}

function applyAction(state, type, payload){
  payload = payload || {};
  switch(type){
    case 'enqueueBuild': return enqueueBuild(state, payload.planetIndex, payload.key);
    case 'enqueueResearch': return enqueueResearch(state, payload.planetIndex, payload.key);
    case 'enqueueShip': return enqueueShip(state, payload.planetIndex, payload.key);
    case 'enqueueDefense': return enqueueDefense(state, payload.planetIndex, payload.key);
    case 'sendFleet': return sendFleet(state, payload.planetIndex, payload);
    case 'sendExpedition': return sendExpedition(state, payload.planetIndex, payload.ships, payload.durationSlot);
    case 'enqueueMoonBuild': return enqueueMoonBuild(state, payload.planetIndex, payload.moonIndex, payload.key);
    case 'jumpGateTransfer': return jumpGateTransfer(state, payload.fromMoonIndex, payload.toMoonIndex, payload.ships);
    case 'depositAlliance': return depositAlliance(state, payload.planetIndex);
    case 'marketTrade': return marketTrade(state, payload.planetIndex, payload.give, payload.want, payload.amount);
    case 'merchantBuy': return merchantBuy(state, payload.planetIndex, payload.resourceType, payload.amount);
    case 'launchMissiles': return launchMissiles(state, payload.planetIndex, payload.targetPos, payload.count);
    case 'activateOfficer': return activateOfficer(state, payload.key);
    case 'setLifeform': return setLifeform(state, payload.species);
    default: throw new Error('Unbekannte Aktion: '+type);
  }
}

module.exports = {
  defs, UNIVERSE, missionLabels,
  createInitialState, normalizeState, ensureAllDefaults,
  seedGalaxy, validCoord, coordStr, coordLinkHtml, debrisKey,
  applyAction, tick,
};
