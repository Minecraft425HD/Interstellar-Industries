const defs = {
  buildings: {
    metalMine:{name:'Metallmine', desc:'Produziert Metall, den wichtigsten Rohstoff für Gebäude und Schiffe. Jede Stufe erhöht die Förderleistung.', base:{metal:60, crystal:15, deut:0}, powerUse:l=>10*l, prod:l=>30*l*Math.pow(1.1,l)},
    crystalMine:{name:'Kristallmine', desc:'Produziert Kristall, benötigt für fortschrittlichere Bauten und Technologien.', base:{metal:48, crystal:24, deut:0}, powerUse:l=>10*l, prod:l=>20*l*Math.pow(1.1,l)},
    deutSynth:{name:'Deuterium-Synthesizer', desc:'Gewinnt Deuterium aus der Planetenatmosphäre - Treibstoff für Flotten und Antrieb der Fusionskraftwerke.', base:{metal:225, crystal:75, deut:0}, powerUse:l=>20*l, prod:l=>10*l*Math.pow(1.1,l)},
    solarPlant:{name:'Solarkraftwerk', desc:'Erzeugt Energie durch Sonnenlicht, die von den Minen zum Betrieb benötigt wird.', base:{metal:75, crystal:30, deut:0}, power:l=>40*l*Math.pow(1.05,l)},
    fusionReactor:{name:'Fusionskraftwerk', desc:'Erzeugt zusätzliche Energie durch Verbrennung von Deuterium - unabhängig vom Sonnenlicht, verbraucht aber laufend Deuterium.', base:{metal:900, crystal:360, deut:180}, power:l=>30*l*Math.pow(1.05,l), deutUse:l=>Math.floor(10*l*Math.pow(1.1,l)), requires:{deutSynth:5, energyTech:3}},
    robotFactory:{name:'Roboterfabrik', desc:'Beschleunigt den Bau von Gebäuden und ist Voraussetzung für viele fortgeschrittene Anlagen.', base:{metal:400, crystal:120, deut:200}},
    shipyard:{name:'Raumschiffwerft', desc:'Ermöglicht den Bau von Raumschiffen und Verteidigungsanlagen.', base:{metal:400, crystal:200, deut:100}, requires:{robotFactory:2}},
    spaceDock:{name:'Raumstation', desc:'Fortgeschrittene Werftanlage, Voraussetzung für die stärksten Kriegsschiffe.', base:{metal:20000, crystal:40000, deut:0}, requires:{shipyard:3}},
    researchLab:{name:'Forschungslabor', desc:'Ermöglicht das Erforschen neuer Technologien und beschleunigt laufende Forschung.', base:{metal:200, crystal:400, deut:200}},
    metalStorage:{name:'Metallspeicher', desc:'Erhöht die maximale Lagerkapazität für Metall.', base:{metal:1000, crystal:0, deut:0}},
    crystalStorage:{name:'Kristallspeicher', desc:'Erhöht die maximale Lagerkapazität für Kristall.', base:{metal:1000, crystal:500, deut:0}},
    deutTank:{name:'Deuteriumtank', desc:'Erhöht die maximale Lagerkapazität für Deuterium.', base:{metal:1000, crystal:1000, deut:0}},
    missileLauncher:{name:'Raketenwerfer', desc:'Einfache, günstige Verteidigungsanlage mit solidem Grundschutz.', base:{metal:2000, crystal:0, deut:0}, isDefense:true, attack:80, shield:20, hull:2000, requires:{shipyard:1}},
    lightLaser:{name:'Leichtes Laser-Geschütz', desc:'Leichte Laserkanone mit ausgewogenem Verhältnis aus Kosten und Feuerkraft.', base:{metal:1500, crystal:500, deut:0}, isDefense:true, attack:100, shield:25, hull:2000, requires:{shipyard:2, energyTech:1}},
    heavyLaser:{name:'Schweres Laser-Geschütz', desc:'Schwere Laserkanone mit deutlich mehr Angriffskraft.', base:{metal:6000, crystal:2000, deut:0}, isDefense:true, attack:250, shield:100, hull:8000, requires:{shipyard:4, energyTech:3}},
    gaussCannon:{name:'Gauß-Kanone', desc:'Schweres Railgun-Geschütz mit hoher Durchschlagskraft, teuer aber effektiv.', base:{metal:20000, crystal:15000, deut:2000}, isDefense:true, attack:1100, shield:200, hull:35000, requires:{shipyard:6, weaponsTech:3, shieldingTech:1, energyTech:6}},
    ionCannon:{name:'Ionenkanone', desc:'Spezialisiert auf hohe Schildwerte - schwer zu durchdringen.', base:{metal:5000, crystal:3000, deut:0}, isDefense:true, attack:150, shield:500, hull:8000, requires:{shipyard:4, ionTech:4}},
    plasmaTurret:{name:'Plasmawerfer', desc:'Stärkste konventionelle Verteidigungsanlage mit enormer Feuerkraft.', base:{metal:50000, crystal:50000, deut:30000}, isDefense:true, attack:3000, shield:300, hull:100000, requires:{shipyard:8, plasmaTech:7}},
    smallShield:{name:'Kleine Schildkuppel', desc:'Errichtet einen Schutzschild um den gesamten Planeten (nur einmal baubar).', base:{metal:10000, crystal:10000, deut:0}, isDefense:true, unique:true, attack:1, shield:2000, hull:20000, requires:{shieldingTech:2}},
    largeShield:{name:'Große Schildkuppel', desc:'Mächtiger Schutzschild mit deutlich höherer Kapazität als die kleine Schildkuppel (nur einmal baubar).', base:{metal:50000, crystal:50000, deut:0}, isDefense:true, unique:true, attack:1, shield:10000, hull:100000, requires:{shipyard:6, shieldingTech:6}},
    interplanetaryMissile:{name:'Interplanetare Rakete', desc:'Einweg-Fernwaffe gegen gegnerische Verteidigung in Reichweite des Raketensilos.', base:{metal:12500, crystal:2500, deut:0}, isDefense:true, attack:12000, shield:0, hull:1, requires:{missileSilo:4}},
    naniteFactory:{name:'Nanitenfabrik', desc:'Hochentwickelte Fertigungsanlage, Voraussetzung für die fortschrittlichsten Bauten.', base:{metal:1000000, crystal:500000, deut:100000}, requires:{robotFactory:10, computerTech:10}, facility:true},
    terraformer:{name:'Terraformer', desc:'Formt die Planetenoberfläche um und schafft zusätzlichen Baugrund.', base:{metal:0, crystal:50000, deut:100000}, requires:{naniteFactory:1, energyTech:12}, facility:true},
    allianceDepot:{name:'Allianzdepot', desc:'Lagerplatz für Ressourcen, die der Allianz zur Verfügung gestellt werden.', base:{metal:20000, crystal:40000, deut:0}, requires:{shipyard:3}, facility:true},
    missileSilo:{name:'Raketensilo', desc:'Lagert und startet interplanetare Raketen zum Fernangriff auf gegnerische Verteidigung.', base:{metal:20000, crystal:20000, deut:1000}, requires:{shipyard:1}, facility:true},
    sensorPhalanx:{name:'Sensorphalanx', desc:'Ermöglicht die Überwachung fremder Systeme von einem Mond aus.', base:{metal:20000, crystal:40000, deut:20000}, requires:{naniteFactory:1}, moonOnly:true, facility:true},
    jumpGate:{name:'Sprungtor', desc:'Verbindet zwei eigene Monde für verzögerungsfreien Flottentransfer.', base:{metal:2000000, crystal:4000000, deut:800000}, requires:{naniteFactory:1, hyperspaceTech:7}, moonOnly:true, facility:true},
    lunarBase:{name:'Lunarbasis', desc:'Grundlegende Infrastruktur auf einem Mond, Voraussetzung für weitere Mondgebäude.', base:{metal:20000, crystal:40000, deut:20000}, requires:{}, moonOnly:true, facility:true},
  },
  research: {
    energyTech:{name:'Energietechnik', desc:'Grundlagentechnologie für effizientere Energiegewinnung, Voraussetzung für viele weitere Forschungen.', base:{metal:0, crystal:800, deut:400}, requires:{researchLab:1}},
    combustion:{name:'Verbrennungstriebwerk', desc:'Verbessert konventionelle Schiffsantriebe.', base:{metal:400, crystal:0, deut:600}, requires:{researchLab:1, energyTech:1}},
    computerTech:{name:'Computertechnik', desc:'Erhöht die maximale Anzahl gleichzeitiger Flottenbewegungen und ist Grundlage für viele Technologien.', base:{metal:0, crystal:400, deut:600}, requires:{researchLab:1}},
    weaponsTech:{name:'Waffentechnik', desc:'Erhöht die Angriffskraft aller Schiffe und Verteidigungsanlagen.', base:{metal:800, crystal:200, deut:0}, requires:{researchLab:4}},
    shieldingTech:{name:'Schildtechnik', desc:'Erhöht die Schildstärke aller Schiffe und Verteidigungsanlagen.', base:{metal:200, crystal:600, deut:0}, requires:{researchLab:6, energyTech:3}},
    espionageTech:{name:'Spionagetechnik', desc:'Verbessert Spionageberichte und die Erfolgschance bei Forschungsdiebstahl.', base:{metal:200, crystal:1000, deut:200}, requires:{researchLab:3}},
    impulseDrive:{name:'Impulstriebwerk', desc:'Schnellerer Antrieb für mittelschwere Schiffe.', base:{metal:2000, crystal:4000, deut:600}, requires:{researchLab:2, energyTech:1}},
    armourTech:{name:'Rumpfpanzerung', desc:'Erhöht die Hüllenstärke aller Schiffe und Verteidigungsanlagen.', base:{metal:1000, crystal:0, deut:0}, requires:{researchLab:2}},
    hyperspaceTech:{name:'Hyperraumtechnik', desc:'Grundlage für Hyperraumantrieb und weitere fortschrittliche Technologien.', base:{metal:0, crystal:4000, deut:2000}, requires:{researchLab:7, energyTech:5, shieldingTech:5}},
    hyperspaceDrive:{name:'Hyperraumantrieb', desc:'Schnellster verfügbarer Antrieb für große Kriegsschiffe.', base:{metal:10000, crystal:20000, deut:6000}, requires:{researchLab:7, hyperspaceTech:3}},
    laserTech:{name:'Lasertechnik', desc:'Grundlage für Laserwaffen und weiterführende Waffentechnologien.', base:{metal:200, crystal:100, deut:0}, requires:{researchLab:1, energyTech:2}},
    ionTech:{name:'Iontechnik', desc:'Grundlage für Ionenwaffen und -verteidigung.', base:{metal:1000, crystal:300, deut:100}, requires:{researchLab:4, laserTech:5, energyTech:4}},
    plasmaTech:{name:'Plasmatechnik', desc:'Grundlage für Plasmawaffen, die stärkste konventionelle Waffentechnologie.', base:{metal:2000, crystal:4000, deut:1000}, requires:{researchLab:4, energyTech:8, laserTech:10, ionTech:5}},
    gravitonTech:{name:'Gravitationstechnik', desc:'Extrem aufwendige Forschung, Voraussetzung für den Todesstern.', base:{metal:0, crystal:0, deut:0}, requires:{researchLab:12}},
    astrophysics:{name:'Astrophysik', desc:'Erhöht die maximale Anzahl an Kolonien und gleichzeitigen Expeditionen.', base:{metal:4000, crystal:8000, deut:4000}, requires:{researchLab:3, espionageTech:4, impulseDrive:3}},
    intergalacticNetwork:{name:'Intergalaktisches Forschungsnetzwerk', desc:'Beschleunigt die Forschung durch ein Netzwerk verbundener Forschungslabore.', base:{metal:240000, crystal:400000, deut:160000}, requires:{researchLab:10, computerTech:8}},
  },
  ships: {
    smallCargo:{name:'Kleiner Transporter', desc:'Günstiger Transporter für kleinere Ladungen.', cost:{metal:2000, crystal:2000, deut:0}, cargo:5000, speed:1, fuel:12, attack:5, shield:10, hull:4000, role:'cargo', requires:{shipyard:2}},
    largeCargo:{name:'Großer Transporter', desc:'Transporter mit deutlich größerer Ladekapazität.', cost:{metal:6000, crystal:6000, deut:0}, cargo:25000, speed:0.8, fuel:28, attack:5, shield:25, hull:12000, role:'cargo', requires:{shipyard:4}},
    colonyShip:{name:'Kolonieschiff', desc:'Wird für die Gründung neuer Kolonien benötigt.', cost:{metal:10000, crystal:20000, deut:10000}, cargo:7500, speed:0.6, fuel:60, attack:0, shield:100, hull:30000, role:'colony', requires:{shipyard:4, combustion:3}},
    espionageProbe:{name:'Spionagesonde', desc:'Günstige, schnelle Sonde für Spionagemissionen.', cost:{metal:0, crystal:1000, deut:0}, cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'probe', requires:{shipyard:3, combustion:3}},
    lightFighter:{name:'Leichter Jäger', desc:'Günstiges Kampfschiff für frühe Angriffe.', cost:{metal:3000, crystal:1000, deut:0}, cargo:50, speed:1.4, fuel:20, attack:50, shield:10, hull:4000, role:'combat', requires:{shipyard:1, combustion:1}},
    heavyFighter:{name:'Schwerer Jäger', desc:'Robusteres Kampfschiff mit mehr Feuerkraft als der leichte Jäger.', cost:{metal:6000, crystal:4000, deut:0}, cargo:100, speed:1.0, fuel:25, attack:150, shield:25, hull:10000, role:'combat', requires:{shipyard:3, armourTech:2, impulseDrive:2}},
    cruiser:{name:'Kreuzer', desc:'Vielseitiges Kampfschiff, effektiv gegen leichte Jäger.', cost:{metal:20000, crystal:7000, deut:2000}, cargo:800, speed:1.1, fuel:40, attack:400, shield:50, hull:27000, role:'combat', requires:{shipyard:5, weaponsTech:2}},
    battleship:{name:'Schlachtschiff', desc:'Schweres Kampfschiff mit hoher Feuerkraft und Hülle.', cost:{metal:45000, crystal:15000, deut:0}, cargo:1500, speed:0.8, fuel:50, attack:1000, shield:200, hull:60000, role:'combat', requires:{shipyard:7, hyperspaceDrive:4}},
    battlecruiser:{name:'Großer Kreuzer', desc:'Spezialisiert auf die Bekämpfung von Verteidigungsanlagen.', cost:{metal:30000, crystal:40000, deut:15000}, cargo:750, speed:0.9, fuel:250, attack:700, shield:400, hull:70000, role:'combat', requires:{shipyard:8, hyperspaceTech:5, laserTech:12}},
    bomber:{name:'Bomber', desc:'Spezialisiert auf die Zerstörung feindlicher Verteidigungsanlagen.', cost:{metal:50000, crystal:25000, deut:15000}, cargo:500, speed:0.6, fuel:65, attack:1000, shield:500, hull:75000, role:'combat', requires:{shipyard:8, plasmaTech:5, impulseDrive:6}},
    destroyer:{name:'Zerstörer', desc:'Schweres Kampfschiff, besonders effektiv gegen Bomber.', cost:{metal:60000, crystal:50000, deut:15000}, cargo:2000, speed:0.7, fuel:100, attack:2000, shield:500, hull:110000, role:'combat', requires:{shipyard:9, hyperspaceTech:5, hyperspaceDrive:6}},
    reaper:{name:'Reaper', desc:'Elite-Kampfschiff mit enormer Feuerkraft und Hülle.', cost:{metal:85000, crystal:55000, deut:20000}, cargo:10000, speed:0.6, fuel:80, attack:2800, shield:700, hull:140000, role:'combat', requires:{shipyard:10, spaceDock:1, hyperspaceTech:6, hyperspaceDrive:7}},
    pathfinder:{name:'Pfadfinder', desc:'Schnelles, vielseitiges Schiff mit hoher Ladekapazität.', cost:{metal:8000, crystal:15000, deut:8000}, cargo:10000, speed:1.6, fuel:20, attack:200, shield:100, hull:23000, role:'combat', requires:{shipyard:5, spaceDock:1, hyperspaceDrive:2, hyperspaceTech:3}},
    deathstar:{name:'Todesstern', desc:'Die mächtigste Waffe im Universum - extrem teuer und stark.', cost:{metal:5000000, crystal:4000000, deut:1000000}, cargo:1000000, speed:0.4, fuel:1, attack:200000, shield:50000, hull:9000000, role:'combat', requires:{shipyard:12, hyperspaceTech:6, gravitonTech:1}},
    solarSatellite:{name:'Solarsatellit', desc:'Liefert zusätzliche Energie, kann sich nicht bewegen oder kämpfen.', cost:{metal:0, crystal:2000, deut:500}, cargo:0, speed:0, fuel:0, attack:1, shield:1, hull:2000, role:'power', requires:{}},
    recycler:{name:'Recycler', desc:'Sammelt Trümmerfelder nach Schlachten ein.', cost:{metal:10000, crystal:6000, deut:2000}, cargo:20000, speed:0.7, fuel:30, attack:1, shield:10, hull:16000, role:'recycler', requires:{shipyard:4, combustion:6}},
    researchProbe:{name:'Forschungssonde', desc:'Baugleich mit der Spionagesonde, ermöglicht aber bei Spionage gegen NPC-Kolonien den Diebstahl fremder Forschung.', cost:{metal:0, crystal:1000, deut:0}, cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'research', requires:{shipyard:3, combustion:3}},
  }
};
const missionLabels = {transport:'Transport', spy:'Spionage', attack:'Angriff', colonize:'Kolonisierung', harvest:'Trümmerfeld-Bergung'};

// Client-local UI state. Everything game-related (planets, fleets, resources, ...) is
// authoritative on the server and only ever written here via applyServerState().
const state = {
  activePlanet: 0,
  view: 'overview',
  planets: [],
  fleets: [],
  reports: [],
  messages: [],
  debrisFields: {},
  moons: [],
  activeMoonIndex: null,
  alliance: {name:'', tag:'', members:[], points:0, depot:{metal:0, crystal:0, deut:0}},
  officerExpiry: {},
  darkMatter: 0,
  expeditions: [],
  lifeform: {active:'humans', points:0, buildings:{}, research:{}},
  marketRate: { metal:1, crystal:1.5, deut:3 },
  logs: [],
  galaxyIndex: 1,
  galaxySystem: 145,
  fleetPrefill: null,
  username: null,
  isAdmin: false,
  adminMode: false
};

const UNIVERSE = { galaxies: 9, systems: 499, positions: 15 };
function validCoord(galaxy, system, pos){ return Number.isInteger(galaxy) && galaxy>=1 && galaxy<=UNIVERSE.galaxies && Number.isInteger(system) && system>=1 && system<=UNIVERSE.systems && Number.isInteger(pos) && pos>=1 && pos<=UNIVERSE.positions; }

const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.floor(n));
const fmt1 = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
function coordStr(c){return '['+c[0]+':'+c[1]+':'+c[2]+']'}
function coordLinkHtml(coord, label){ return `<button type="button" class="coord-link" data-coord="${coord[0]}:${coord[1]}:${coord[2]}">${label!=null?label:coordStr(coord)}</button>`; }
function closeCoordMenu(){ const m=document.getElementById('coordMenu'); if(m) m.remove(); }
function openCoordMenu(anchorEl){
  closeCoordMenu();
  const [gal,sys,pos] = anchorEl.dataset.coord.split(':').map(Number);
  const missions = [['transport','Transport'],['spy','Spionage'],['attack','Angriff'],['colonize','Kolonisierung'],['harvest','Trümmerfeld-Bergung']];
  const menu = document.createElement('div');
  menu.id = 'coordMenu';
  menu.className = 'coord-menu';
  menu.innerHTML = `<div class="coord-menu-title">[${gal}:${sys}:${pos}]</div>` + missions.map(([m,label])=>`<button type="button" data-menu-mission="${m}">${label}</button>`).join('');
  document.body.appendChild(menu);
  const rect = anchorEl.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  let top = rect.bottom + 4, left = rect.left;
  if(left + menuRect.width > window.innerWidth - 8) left = window.innerWidth - menuRect.width - 8;
  if(top + menuRect.height > window.innerHeight - 8) top = rect.top - menuRect.height - 4;
  if(left < 8) left = 8;
  if(top < 8) top = 8;
  menu.style.top = top+'px';
  menu.style.left = left+'px';
  menu.querySelectorAll('[data-menu-mission]').forEach(btn=>{
    btn.onclick = ()=>{
      state.fleetPrefill = {mission: btn.dataset.menuMission, gal, sys, pos};
      state.view='fleet';
      closeCoordMenu();
      render();
    };
  });
}
function infoIconHtml(type, key){ return `<button type="button" class="info-btn" data-info-type="${type}" data-info-key="${key}" title="Info" aria-label="Info">ⓘ</button>`; }
function closeInfoModal(){ const m=document.getElementById('infoModal'); if(m) m.remove(); }
function openInfoModal(type, key){
  closeInfoModal();
  const table = type==='building' ? defs.buildings : (type==='research' ? defs.research : defs.ships);
  const d = table && table[key];
  if(!d) return;
  const statsRows = [];
  if(d.attack!=null) statsRows.push(['Angriff', fmt(d.attack)]);
  if(d.shield!=null) statsRows.push(['Schild', fmt(d.shield)]);
  if(d.hull!=null) statsRows.push(['Hülle', fmt(d.hull)]);
  if(d.cargo!=null) statsRows.push(['Ladekapazität', fmt(d.cargo)]);
  if(d.speed!=null) statsRows.push(['Geschwindigkeit', d.speed]);
  if(d.requires && Object.keys(d.requires).length) statsRows.push(['Voraussetzung', requirementText(d.requires)]);
  const modal = document.createElement('div');
  modal.id = 'infoModal';
  modal.className = 'info-modal';
  modal.innerHTML = `<div class="info-modal-box">
    <div class="info-modal-head"><strong>${d.name}</strong><button type="button" class="info-modal-close" data-info-close="1">&times;</button></div>
    <div class="info-modal-body">
      <p>${d.desc||'Keine Beschreibung verfügbar.'}</p>
      ${statsRows.length ? `<table class="info-modal-table">${statsRows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>` : ''}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
document.addEventListener('click', (e)=>{
  const link = e.target.closest('.coord-link');
  if(link){ e.stopPropagation(); openCoordMenu(link); return; }
  const infoBtn = e.target.closest('.info-btn');
  if(infoBtn){ e.stopPropagation(); openInfoModal(infoBtn.dataset.infoType, infoBtn.dataset.infoKey); return; }
  if(e.target.closest('[data-info-close]')){ closeInfoModal(); return; }
  const modalBox = e.target.closest('.info-modal-box');
  const modalOverlay = e.target.closest('.info-modal');
  if(modalOverlay && !modalBox){ closeInfoModal(); return; }
  const menu = document.getElementById('coordMenu');
  if(menu && !menu.contains(e.target)){ closeCoordMenu(); }
});

function showError(msg){ state.logs = ['⚠ '+msg, ...state.logs].slice(0,10); renderSide(); showToast(msg); }

let toastTimer = null;
function showToast(msg){
  let el = document.getElementById('toast');
  if(!el){ el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.classList.remove('show'); }, 4500);
}

function meetsRequirements(p, req){ if(!req) return true; for(const [k,v] of Object.entries(req)){ const have = p.buildings[k]!=null ? p.buildings[k] : (p.research[k]!=null ? p.research[k] : 0); if(have<v) return false; } return true; }
function requirementText(req){ if(!req) return ''; return Object.entries(req).map(([k,v])=>{ const nm = defs.buildings[k]?defs.buildings[k].name:(defs.research[k]?defs.research[k].name:k); return nm+' Stufe '+v; }).join(', '); }
function debrisKey(coord){ return coord[0]+':'+coord[1]+':'+coord[2]; }
function officerActive(key){ return !!(state.officerExpiry[key] && state.officerExpiry[key] > Date.now()); }
function officerTimeLeft(key){ return officerActive(key) ? state.officerExpiry[key]-Date.now() : 0; }
function formatDuration(ms){ const totalMin=Math.max(0,Math.floor(ms/60000)); const d=Math.floor(totalMin/1440); const h=Math.floor((totalMin%1440)/60); const m=totalMin%60; if(d>0) return d+'T '+h+'Std'; if(h>0) return h+'Std '+m+'Min'; return m+'Min'; }
function officerBonus(){ return officerActive('geologist') ? 1.10 : 1.0; }
function fleetSpeedBonus(){ return officerActive('admiral') ? 1.1 : 1.0; }
function engineerBonus(){ return officerActive('engineer') ? 1.10 : 1.0; }
function commanderDiscount(){ return officerActive('commander') ? 0.95 : 1.0; }
function technocratSpeed(){ return officerActive('technocrat') ? 0.85 : 1.0; }
function pathfinderBonus(shipMap){ return (shipMap && shipMap.pathfinder>0) ? 1.1 : 1.0; }
function networkSpeed(p){ const lvl=(p.research.intergalacticNetwork)||0; return Math.max(0.5, 1-0.02*lvl); }
function buildingCost(base, level){ const c=scaledCost(base, level); const d=commanderDiscount(); return {metal:Math.floor(c.metal*d), crystal:Math.floor(c.crystal*d), deut:Math.floor(c.deut*d)}; }
function maxColonies(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor((lvl+1)/2); }
function maxExpeditions(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor(lvl/2); }
function viewInteractionActive(){
  const el = document.activeElement;
  const view = document.getElementById('view');
  return !!(el && view && view.contains(el) && (el.tagName==='SELECT' || el.tagName==='INPUT' || el.tagName==='TEXTAREA'));
}
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
function allianceRank(points){ if(points>=2000000) return 'Elite-Kommandant'; if(points>=500000) return 'Kommandeur'; if(points>=100000) return 'Veteran'; if(points>=10000) return 'Krieger'; return 'Rekrut'; }

// ---- Server connection layer ----
const SERVER_KEY = 'stellareIndustrienServerUrl';
const TOKEN_KEY = 'stellareIndustrienToken';
const USERNAME_KEY = 'stellareIndustrienUsername';
function getServerUrl(){ return (localStorage.getItem(SERVER_KEY)||'').trim(); }
function setServerUrl(url){ if(url) localStorage.setItem(SERVER_KEY, url); else localStorage.removeItem(SERVER_KEY); }
function getToken(){ return localStorage.getItem(TOKEN_KEY)||''; }
function setToken(t){ if(t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
function getStoredUsername(){ return localStorage.getItem(USERNAME_KEY)||''; }
function setStoredUsername(u){ if(u) localStorage.setItem(USERNAME_KEY, u); else localStorage.removeItem(USERNAME_KEY); }
let connectionStatus = 'disconnected'; // disconnected | connecting | connected | error
let connectionError = '';
let everConnected = false;
let pollTimer = null;

const API_TIMEOUT_MS = 10000;
async function fetchWithTimeout(url, options, timeoutMs){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs || API_TIMEOUT_MS);
  try {
    return await fetch(url, Object.assign({}, options, {signal: controller.signal}));
  } finally {
    clearTimeout(timer);
  }
}

async function apiFetch(path, options){
  const base = getServerUrl().replace(/\/$/,'');
  if(!base) throw new Error('Keine Serveradresse konfiguriert');
  options = options || {};
  const headers = Object.assign({}, options.headers||{});
  const token = getToken();
  if(token) headers['Authorization'] = 'Bearer '+token;
  let res;
  try { res = await fetchWithTimeout(base+path, Object.assign({}, options, {headers})); }
  catch(networkErr){
    if(networkErr.name==='AbortError') throw new Error('Zeitüberschreitung – Server antwortet nicht innerhalb von '+(API_TIMEOUT_MS/1000)+'s. Adresse/Port prüfen und ob Handy & Server im selben Netzwerk sind.');
    throw new Error('Server nicht erreichbar ('+(networkErr.message || networkErr.name || 'Netzwerkfehler')+')');
  }
  let body = null;
  try { body = await res.json(); } catch(e){ /* no body */ }
  if(res.status===401){
    setToken(''); setStoredUsername('');
    const err = new Error((body && body.error) || 'Sitzung abgelaufen, bitte erneut anmelden');
    err.authRequired = true;
    throw err;
  }
  if(!res.ok){ throw new Error((body && body.error) || ('HTTP '+res.status)); }
  return body;
}

async function pollState(){
  if(!getToken()) return;
  try {
    const data = await apiFetch('/api/state');
    connectionStatus = 'connected'; connectionError = '';
    applyServerState(data, {forceRender:false});
  } catch(err){
    if(err.authRequired){
      state.username=null; state.isAdmin=false; state.adminMode=false; everConnected=false;
      connectionStatus='connected'; connectionError='';
      render();
      return;
    }
    connectionStatus = 'error'; connectionError = err.message;
    renderConnectionBanner();
    if(!everConnected) render();
  }
}

async function postAction(type, payload){
  try {
    const data = await apiFetch('/api/action', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type, payload})});
    connectionStatus = 'connected'; connectionError = '';
    if(data && data.state) applyServerState(data.state, {forceRender:true});
    if(data && data.ok===false && data.message) showError(data.message);
    return data;
  } catch(err){
    if(err.authRequired){ state.username=null; everConnected=false; render(); return null; }
    connectionStatus = 'error'; connectionError = err.message;
    showError('Verbindung fehlgeschlagen: '+err.message);
    renderConnectionBanner();
    return null;
  }
}

function applyServerState(serverState, opts){
  opts = opts || {};
  if(!serverState) return;
  state.username = serverState.username || state.username;
  state.isAdmin = !!serverState.isAdmin;
  if(serverState.planets === null){
    state.adminMode = true;
    everConnected = true;
    if(opts.forceRender || !viewInteractionActive()) render();
    return;
  }
  if(!Array.isArray(serverState.planets)) return;
  state.adminMode = false;
  state.planets = serverState.planets;
  state.fleets = serverState.fleets || [];
  state.reports = serverState.reports || [];
  state.messages = serverState.messages || [];
  state.debrisFields = serverState.debrisFields || {};
  state.moons = serverState.moons || [];
  state.alliance = serverState.alliance || state.alliance;
  state.officerExpiry = serverState.officerExpiry || {};
  state.darkMatter = serverState.darkMatter || 0;
  state.expeditions = serverState.expeditions || [];
  state.lifeform = serverState.lifeform || state.lifeform;
  state.marketRate = serverState.marketRate || state.marketRate;
  state.logs = serverState.logs || [];
  everConnected = true;
  if(state.activePlanet >= state.planets.length) state.activePlanet = 0;
  if(state.activeMoonIndex!=null && state.activeMoonIndex >= state.moons.length) state.activeMoonIndex = state.moons.length ? 0 : null;
  if(opts.forceRender || !viewInteractionActive()){
    render();
  } else {
    renderTop(); renderSide(); renderConnectionBanner();
  }
}

function renderConnectionBanner(){
  const el = $('#connBanner');
  if(!el) return;
  if(!everConnected){ el.style.display='none'; return; }
  if(connectionStatus==='error'){
    el.style.display='block'; el.className='conn-banner';
    el.textContent = '⚠ Verbindung zum Server verloren – versuche erneut… ('+connectionError+')';
  } else {
    el.style.display='none';
  }
}

function computePhase(){
  if(!getServerUrl()) return 'connect';
  if(!getToken()) return 'auth';
  if(!everConnected) return 'loading';
  return state.adminMode ? 'admin' : 'game';
}

let connectCheck = null; // null | 'checking' | 'ok' | {error: msg}
function renderConnectScreen(){
  const url = getServerUrl();
  const view = $('#view');
  if(!view) return;
  let statusHtml = '';
  if(connectCheck==='checking') statusHtml = '<div class="small" style="margin-top:12px;color:var(--muted)">Prüfe Erreichbarkeit…</div>';
  else if(connectCheck && connectCheck.error) statusHtml = `<div class="small" style="margin-top:12px;color:var(--danger)">⚠ ${connectCheck.error}</div><button class="btn alt" type="button" id="useAnywayBtn" style="width:100%;margin-top:8px">Trotzdem übernehmen</button>`;
  view.innerHTML = `<div class="card" style="max-width:440px;margin:8vh auto;">
    <h2>Mit Server verbinden</h2>
    <div class="small" style="margin-bottom:14px">Stellare Industrien läuft als dedizierter Server, z.B. dauerhaft auf einem Raspberry Pi. Trage die Adresse ein, unter der er erreichbar ist – eine lokale Adresse im selben WLAN (z.B. http://192.168.1.50:3000) oder eine öffentliche Adresse von überall (z.B. https://dein-tunnel.trycloudflare.com).</div>
    <form id="connectForm" class="fleet-form">
      <label>Server-Adresse<input type="text" name="url" value="${url}" placeholder="http://192.168.1.50:3000" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="url"></label>
      <button class="btn good" type="submit">Verbindung prüfen</button>
    </form>
    ${statusHtml}
  </div>`;
  const cf = $('#connectForm');
  if(cf) cf.onsubmit = async e=>{
    e.preventDefault();
    const u = cf.url.value.trim().replace(/\/$/,'');
    if(!u) return;
    const previousUrl = getServerUrl();
    setServerUrl(u);
    connectCheck = 'checking';
    renderConnectScreen();
    try {
      await apiFetch('/api/health');
      connectCheck = 'ok';
      render();
    } catch(err){
      connectCheck = { error: err.message };
      setServerUrl(previousUrl);
      renderConnectScreen();
      const useBtn = $('#useAnywayBtn');
      if(useBtn) useBtn.onclick = ()=>{ setServerUrl(u); connectCheck = null; render(); };
    }
  };
}

function renderLoadingScreen(){
  const view = $('#view');
  if(!view) return;
  const showError = connectionStatus==='error' && connectionError;
  const url = getServerUrl();
  view.innerHTML = `<div class="card" style="max-width:440px;margin:8vh auto;text-align:center">
    <h2>Verbinde…</h2>
    <div class="small">Lade Daten vom Server.</div>
    ${showError ? `
    <div class="small" style="margin-top:14px;color:var(--danger);text-align:left">⚠ Server nicht erreichbar (${connectionError}). Hat sich die Serveradresse geändert (z.B. neue Tunnel-Adresse nach einem Neustart)?</div>
    <form id="loadingReconnectForm" class="fleet-form" style="margin-top:10px;text-align:left">
      <label>Server-Adresse<input type="text" name="url" value="${url}" placeholder="https://dein-tunnel.trycloudflare.com" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="url"></label>
      <button class="btn good" type="submit">Adresse übernehmen &amp; erneut verbinden</button>
    </form>` : ''}
  </div>`;
  const rf = $('#loadingReconnectForm');
  if(rf) rf.onsubmit = e=>{
    e.preventDefault();
    const u = rf.url.value.trim().replace(/\/$/,'');
    if(!u) return;
    setServerUrl(u);
    connectionStatus='connecting'; connectionError='';
    render();
    pollState();
  };
}

// ---- Login / Registration ----
let authMode = 'login';
let authError = '';
const regForm = { username:'', password:'', password2:'', planetName:'', galaxy:1, system:1, selectedPos:null };
let regSlots = null;
let regLoading = false;

async function fetchRegSlots(){
  regLoading = true; regSlots = null; authError='';
  renderAuthScreen();
  try {
    const data = await apiFetch('/api/galaxy?galaxy='+regForm.galaxy+'&system='+regForm.system);
    regSlots = data.slots;
  } catch(err){
    authError = 'Positionen konnten nicht geladen werden: '+err.message;
  }
  regLoading = false;
  renderAuthScreen();
}

function logout(){
  apiFetch('/api/logout', {method:'POST'}).catch(()=>{});
  setToken(''); setStoredUsername('');
  state.username=null; state.isAdmin=false; state.adminMode=false; everConnected=false;
  stopAdminLogPolling();
  render();
}

function renderAuthScreen(){
  const view = $('#view');
  if(!view) return;
  const tabBtn = (mode,label)=>`<button type="button" class="pill ${authMode===mode?'active':''}" data-auth-tab="${mode}">${label}</button>`;
  let body = '';
  if(authMode==='login'){
    body = `<form id="loginForm" class="fleet-form">
      <label>Benutzername<input type="text" name="username" value="${regForm.username}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label>Passwort<input type="password" name="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <button class="btn good" type="submit">Anmelden</button>
    </form>`;
  } else {
    const slotsHtml = regLoading ? '<div class="small">Lade Positionen…</div>' : (regSlots ? `<div class="galaxy-grid">${regSlots.map(s=>{
      const selected = regForm.selectedPos===s.pos;
      if(s.type==='empty') return `<button type="button" class="slot empty${selected?' selected':''}" data-reg-pos="${s.pos}" style="text-align:left;cursor:pointer"><div>${s.pos}</div><div>Frei</div><div><span class="badge empty">${selected?'Gewählt':'Wählbar'}</span></div></button>`;
      if(s.type==='own') return `<div class="slot own"><div>${s.pos}</div><div>Eigener Planet</div><div><span class="badge own">Belegt</span></div></div>`;
      if(s.type==='player') return `<div class="slot"><div>${s.pos}</div><div>${s.planetName}<div class="sub">Spieler: ${s.ownerUsername}</div></div><div><span class="badge npc">Spieler</span></div></div>`;
      return `<div class="slot"><div>${s.pos}</div><div>${s.name}</div><div><span class="badge npc">NPC</span></div></div>`;
    }).join('')}</div>` : '<div class="small">Galaxie und System wählen, dann "Positionen laden".</div>');
    body = `<form id="regCoordForm" class="fleet-form" style="margin-bottom:12px">
      <label>Galaxie (1-${UNIVERSE.galaxies})<input type="number" name="galaxy" min="1" max="${UNIVERSE.galaxies}" value="${regForm.galaxy}"></label>
      <label>System (1-${UNIVERSE.systems})<input type="number" name="system" min="1" max="${UNIVERSE.systems}" value="${regForm.system}"></label>
      <button class="btn alt" type="submit">Positionen laden</button>
    </form>
    ${slotsHtml}
    <div style="height:14px"></div>
    <form id="registerForm" class="fleet-form">
      <label>Benutzername<input type="text" name="username" value="${regForm.username}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label>Passwort (min. 6 Zeichen)<input type="password" name="password" autocomplete="new-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label>Passwort wiederholen<input type="password" name="password2" autocomplete="new-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label>Planetenname (optional)<input type="text" name="planetName" value="${regForm.planetName}" placeholder="Heimatwelt"></label>
      <div class="small">Gewählte Position: ${regForm.selectedPos ? '['+regForm.galaxy+':'+regForm.system+':'+regForm.selectedPos+']' : 'keine – oben ein freies Feld anklicken'}</div>
      <button class="btn good" type="submit" ${regForm.selectedPos?'':'disabled'}>Konto erstellen</button>
    </form>`;
  }
  view.innerHTML = `<div class="card" style="max-width:${authMode==='register'?'560px':'440px'};margin:6vh auto;">
    <h2>Anmelden</h2>
    <div class="planet-tabs" style="margin-bottom:14px">${tabBtn('login','Anmelden')}${tabBtn('register','Neues Konto')}</div>
    ${body}
    ${authError?`<div class="small" style="margin-top:12px;color:var(--danger)">${authError}</div>`:''}
    <div style="height:10px"></div>
    <button class="btn alt" type="button" id="changeServerBtn" style="width:100%">Server ändern</button>
    <div class="small" style="margin-top:8px">Server: ${getServerUrl()}</div>
  </div>`;

  document.querySelectorAll('[data-auth-tab]').forEach(b=>b.onclick=()=>{ authMode=b.dataset.authTab; authError=''; renderAuthScreen(); });
  const changeBtn = $('#changeServerBtn'); if(changeBtn) changeBtn.onclick=()=>{ setServerUrl(''); render(); };

  const lf = $('#loginForm');
  if(lf) lf.onsubmit = async e=>{
    e.preventDefault();
    authError='';
    const username = lf.username.value.trim(), password = lf.password.value;
    regForm.username = username;
    try {
      const data = await apiFetch('/api/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})});
      setToken(data.token); setStoredUsername(data.username);
      state.username = data.username; state.isAdmin = data.isAdmin; state.adminMode = data.isAdmin;
      everConnected = false; connectionStatus='connecting';
      render();
      pollState();
    } catch(err){ authError = err.message; renderAuthScreen(); }
  };

  const rcf = $('#regCoordForm');
  if(rcf) rcf.onsubmit = e=>{
    e.preventDefault();
    const g = Number(rcf.galaxy.value), s = Number(rcf.system.value);
    if(Number.isInteger(g) && g>=1 && g<=UNIVERSE.galaxies) regForm.galaxy=g;
    if(Number.isInteger(s) && s>=1 && s<=UNIVERSE.systems) regForm.system=s;
    regForm.selectedPos = null;
    fetchRegSlots();
  };

  const rf = $('#registerForm');
  if(rf){
    rf.username.oninput = ()=>{ regForm.username = rf.username.value; };
    rf.planetName.oninput = ()=>{ regForm.planetName = rf.planetName.value; };
    rf.onsubmit = async e=>{
      e.preventDefault();
      authError='';
      if(!regForm.selectedPos){ authError='Bitte zuerst eine freie Position auswählen.'; renderAuthScreen(); return; }
      const username = rf.username.value.trim(), password = rf.password.value, password2 = rf.password2.value, planetName = rf.planetName.value.trim();
      if(password.length<6){ authError='Passwort muss mindestens 6 Zeichen haben.'; renderAuthScreen(); return; }
      if(password!==password2){ authError='Passwörter stimmen nicht überein.'; renderAuthScreen(); return; }
      try {
        const data = await apiFetch('/api/register', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password,galaxy:regForm.galaxy,system:regForm.system,position:regForm.selectedPos,planetName})});
        setToken(data.token); setStoredUsername(data.username);
        state.username = data.username; state.isAdmin=false; state.adminMode=false;
        everConnected=false; connectionStatus='connecting';
        render();
        pollState();
      } catch(err){ authError = err.message; renderAuthScreen(); }
    };
  }

  if(authMode==='register' && regSlots){
    document.querySelectorAll('[data-reg-pos]').forEach(b=>b.onclick=()=>{ regForm.selectedPos = Number(b.dataset.regPos); renderAuthScreen(); });
  }
}

// ---- Admin panel ----
let adminView = 'players'; // 'players' | 'log'
let adminPlayers = null;
let adminLoading = false;
let adminError = '';
let adminPendingDelete = null;
let adminLogLines = null;
let adminLogLoading = false;
let adminLogPollTimer = null;

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function fetchAdminPlayers(){
  adminLoading = true; adminError='';
  renderAdminPanel();
  try {
    const data = await apiFetch('/api/admin/players');
    adminPlayers = data.players;
  } catch(err){ adminError = err.message; }
  adminLoading = false;
  renderAdminPanel();
}

async function fetchAdminLog(){
  adminLogLoading = (adminLogLines===null);
  if(adminLogLoading) renderAdminPanel();
  try {
    const data = await apiFetch('/api/admin/log');
    adminLogLines = data.lines;
  } catch(err){ adminError = err.message; }
  adminLogLoading = false;
  if(state.adminMode && adminView==='log') renderAdminPanel();
}

function stopAdminLogPolling(){ if(adminLogPollTimer){ clearInterval(adminLogPollTimer); adminLogPollTimer=null; } }
function startAdminLogPolling(){
  stopAdminLogPolling();
  adminLogPollTimer = setInterval(()=>{ if(state.adminMode && adminView==='log') fetchAdminLog(); }, 2000);
}

function renderAdminPanel(){
  const view = $('#view');
  if(!view) return;
  if(adminView==='players' && adminPlayers===null && !adminLoading) fetchAdminPlayers();
  if(adminView==='log' && adminLogLines===null && !adminLogLoading) fetchAdminLog();

  const tabsHtml = `<div class="planet-tabs" style="margin:10px 0">
    <button class="pill ${adminView==='players'?'active':''}" data-admin-view="players">Spieler-Verwaltung</button>
    <button class="pill ${adminView==='log'?'active':''}" data-admin-view="log">Live-Log</button>
  </div>`;

  let bodyHtml = '';
  if(adminView==='players'){
    const rows = (adminPlayers||[]).map(p=>{
      const actions = adminPendingDelete===p.username
        ? `<button class="btn danger" data-admin-confirm-delete="${p.username}" style="padding:6px 10px;min-height:32px">Wirklich löschen?</button> <button class="btn alt" data-admin-cancel-delete="1" style="padding:6px 10px;min-height:32px">Abbrechen</button>`
        : `<button class="btn alt" data-admin-grant="${p.username}" style="padding:6px 10px;min-height:32px">+10k Ressourcen</button> <button class="btn danger" data-admin-delete="${p.username}" style="padding:6px 10px;min-height:32px">Löschen</button>`;
      return `<tr>
        <td>${p.username}</td>
        <td>${p.homeCoords ? p.homeCoords.join(':') : '-'}</td>
        <td>${fmt(p.points)}</td>
        <td>${fmt(p.planets)}</td>
        <td>${fmt(p.darkMatter)}</td>
        <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString('de-DE') : '-'}</td>
        <td>${actions}</td>
      </tr>`;
    }).join('');
    bodyHtml = `<button class="btn alt" id="adminRefreshBtn">Aktualisieren</button>
    <div style="height:14px"></div>
    ${adminLoading ? '<div class="small">Lade Spielerliste…</div>' : ''}
    ${adminPlayers && adminPlayers.length===0 ? '<div class="small">Noch keine Spieler registriert.</div>' : ''}
    ${adminPlayers && adminPlayers.length>0 ? `<div style="overflow-x:auto"><table><thead><tr><th>Benutzername</th><th>Heimatkoordinaten</th><th>Punkte</th><th>Planeten</th><th>Dunkle Materie</th><th>Registriert</th><th>Aktionen</th></tr></thead><tbody>${rows}</tbody></table></div>` : ''}`;
  } else {
    const linesHtml = (adminLogLines||[]).map(l=>`<div>${escapeHtml(l)}</div>`).join('');
    bodyHtml = `<div class="small" style="margin-bottom:8px">Aktualisiert automatisch alle 2 Sekunden – zeigt jede Verbindung und Aktion aller Spieler in Echtzeit.</div>
    ${adminLogLoading ? '<div class="small">Lade Log…</div>' : ''}
    <div id="adminLogBox" style="background:#0a0e14;border:1px solid var(--border);border-radius:8px;padding:10px;height:60vh;min-height:320px;overflow-y:auto;font-family:monospace;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;">${linesHtml || '<span class="small">Noch keine Logeinträge.</span>'}</div>`;
  }

  view.innerHTML = `<div class="card" style="max-width:960px;margin:4vh auto;">
    <h2>Admin-Modus</h2>
    <div class="small">Angemeldet als ${state.username} · Server: ${getServerUrl()}</div>
    <button class="btn danger" id="adminLogoutBtn" style="margin-top:10px">Abmelden</button>
    ${tabsHtml}
    ${adminError ? `<div class="small" style="color:var(--danger);margin-bottom:10px">${adminError}</div>` : ''}
    ${bodyHtml}
  </div>`;

  const lb = $('#adminLogoutBtn'); if(lb) lb.onclick=logout;
  document.querySelectorAll('[data-admin-view]').forEach(b=>b.onclick=()=>{
    adminView = b.dataset.adminView;
    adminError = '';
    if(adminView==='log'){ startAdminLogPolling(); if(adminLogLines===null) fetchAdminLog(); }
    else { stopAdminLogPolling(); }
    renderAdminPanel();
  });

  if(adminView==='players'){
    const rb = $('#adminRefreshBtn'); if(rb) rb.onclick=()=>{ adminPlayers=null; adminPendingDelete=null; fetchAdminPlayers(); };
    document.querySelectorAll('[data-admin-delete]').forEach(b=>b.onclick=()=>{ adminPendingDelete=b.dataset.adminDelete; renderAdminPanel(); });
    document.querySelectorAll('[data-admin-cancel-delete]').forEach(b=>b.onclick=()=>{ adminPendingDelete=null; renderAdminPanel(); });
    document.querySelectorAll('[data-admin-confirm-delete]').forEach(b=>b.onclick=async ()=>{
      try { await apiFetch('/api/admin/deletePlayer', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:b.dataset.adminConfirmDelete})}); adminPendingDelete=null; adminPlayers=null; fetchAdminPlayers(); }
      catch(err){ adminError = err.message; renderAdminPanel(); }
    });
    document.querySelectorAll('[data-admin-grant]').forEach(b=>b.onclick=async ()=>{
      try { await apiFetch('/api/admin/grantResources', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:b.dataset.adminGrant, metal:10000, crystal:10000, deut:10000})}); adminPlayers=null; fetchAdminPlayers(); }
      catch(err){ adminError = err.message; renderAdminPanel(); }
    });
  } else {
    const box = $('#adminLogBox'); if(box) box.scrollTop = box.scrollHeight;
  }
}

// ---- Galaxy view data (fetched from the server so real players show up) ----
let galaxyCache = {};
let galaxyLoadingKey = null;
function galaxyCacheKey(g,s){ return g+':'+s; }
async function fetchGalaxySlots(g,s){
  const key = galaxyCacheKey(g,s);
  galaxyLoadingKey = key;
  try {
    const data = await apiFetch('/api/galaxy?galaxy='+g+'&system='+s);
    galaxyCache[key] = data.slots;
  } catch(err){ showError('Galaxie konnte nicht geladen werden: '+err.message); }
  if(galaxyLoadingKey===key) galaxyLoadingKey = null;
  if(state.view==='galaxy') renderView(true);
}

// ---- Highscore data (real registered players) ----
let highscoreCache = null;
let highscoreLoading = false;
async function fetchHighscore(){
  highscoreLoading = true;
  try { const data = await apiFetch('/api/highscore'); highscoreCache = data.list; }
  catch(err){ showError('Rangliste konnte nicht geladen werden: '+err.message); }
  highscoreLoading = false;
  if(state.view==='highscore') renderView(true);
}

// ---- Action wrappers (network calls to the dedicated server) ----
function enqueueBuild(key){ postAction('enqueueBuild', {planetIndex: state.activePlanet, key}); }
function enqueueResearch(key){ postAction('enqueueResearch', {planetIndex: state.activePlanet, key}); }
function enqueueShip(key){ postAction('enqueueShip', {planetIndex: state.activePlanet, key}); }
function enqueueDefense(key){ postAction('enqueueDefense', {planetIndex: state.activePlanet, key}); }
function sendFleet(form){
  const gal = Number(form.galaxy.value), sys = Number(form.system.value), pos = Number(form.position.value);
  const ships = {};
  Object.keys(defs.ships).forEach(k=>{ if(defs.ships[k].role!=='power' && form[k]) ships[k]=Number(form[k].value)||0; });
  const cargo = {metal:Number(form.metal.value)||0, crystal:Number(form.crystal.value)||0, deut:Number(form.deut.value)||0};
  postAction('sendFleet', {planetIndex: state.activePlanet, mission: form.mission.value, gal, sys, pos, ships, cargo});
}
function sendExpedition(shipsMap, durationSlot){ postAction('sendExpedition', {planetIndex: state.activePlanet, ships: shipsMap, durationSlot}); }
function activeMoon(){ return state.activeMoonIndex!=null ? state.moons[state.activeMoonIndex] : null; }
function enqueueMoonBuild(key){
  if(state.activeMoonIndex==null) return showError('Kein Mond ausgewählt');
  postAction('enqueueMoonBuild', {planetIndex: state.activePlanet, moonIndex: state.activeMoonIndex, key});
}
function jumpGateTransfer(fromMoonIdx, toMoonIdx, cargo, ships){
  postAction('jumpGateTransfer', {fromMoonIndex: fromMoonIdx, toMoonIndex: toMoonIdx, ships});
}
function depositAlliance(){ postAction('depositAlliance', {planetIndex: state.activePlanet}); }
function marketTrade(giveType, wantType, amount){ postAction('marketTrade', {planetIndex: state.activePlanet, give: giveType, want: wantType, amount}); }
function merchantBuy(resourceType, amount){ postAction('merchantBuy', {planetIndex: state.activePlanet, resourceType, amount}); }
function launchMissiles(targetPos, count){ postAction('launchMissiles', {planetIndex: state.activePlanet, targetPos, count}); }

// ---- Backup / restore (server persists automatically; this is a local safety copy) ----
async function saveGame(){
  try {
    const data = await apiFetch('/api/backup');
    const dataStr = JSON.stringify(data);
    if(window.Android && window.Android.saveGame){ window.Android.saveGame(dataStr); showError('Spielstand wird gespeichert...'); return; }
    const blob = new Blob([dataStr], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stellare-industrien-backup.json'; a.click();
  } catch(err){ showError('Backup fehlgeschlagen: '+err.message); }
}
async function restoreGame(dataObj){
  try {
    const data = await apiFetch('/api/restore', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dataObj)});
    if(data && data.ok){ applyServerState(data.state, {forceRender:true}); showError('Spielstand wiederhergestellt'); }
    else { showError('Wiederherstellung fehlgeschlagen'); }
  } catch(err){ showError('Wiederherstellung fehlgeschlagen: '+err.message); }
}
function loadGame(file){ const reader = new FileReader(); reader.onload = e => { try { restoreGame(JSON.parse(e.target.result)); } catch(err){ showError('Datei ungültig'); } }; reader.readAsText(file); }
function requestNativeLoad(){ if(window.Android && window.Android.loadGame) window.Android.loadGame(); }
window.applyLoadedSave = function(jsonStr){ try { restoreGame(JSON.parse(jsonStr)); } catch(err){ showError('Datei ungültig'); } };
window.applyLoadedSaveBase64 = function(b64){
  try {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    window.applyLoadedSave(json);
  } catch(err){ showError('Datei ungültig'); }
};

function active(){return state.planets[state.activePlanet]}
function scaledCost(base, level){const mult=Math.pow(1.6, level-1); return {metal:Math.floor(base.metal*mult), crystal:Math.floor(base.crystal*mult), deut:Math.floor(base.deut*mult)}}
function fusionDeutUse(p){ return (p.buildings.fusionReactor) ? defs.buildings.fusionReactor.deutUse(p.buildings.fusionReactor) : 0; }
function energyStats(p){const solar=defs.buildings.solarPlant.power(p.buildings.solarPlant); const fusion=defs.buildings.fusionReactor.power(p.buildings.fusionReactor||0); const satellites=(p.ships.solarSatellite||0)*20; const prod=(solar+fusion+satellites)*engineerBonus(); const use=defs.buildings.metalMine.powerUse(p.buildings.metalMine)+defs.buildings.crystalMine.powerUse(p.buildings.crystalMine)+defs.buildings.deutSynth.powerUse(p.buildings.deutSynth); return {prod,use,ratio: use? Math.min(1,prod/use):1};}
function hourly(p){const e=energyStats(p).ratio; const bonus=officerBonus(); return {metal: defs.buildings.metalMine.prod(p.buildings.metalMine)*e*bonus, crystal: defs.buildings.crystalMine.prod(p.buildings.crystalMine)*e*bonus, deut: defs.buildings.deutSynth.prod(p.buildings.deutSynth)*e*bonus - fusionDeutUse(p)}}
function maxStorage(p){return {metal:Math.max(5000,5000*p.buildings.metalStorage), crystal:Math.max(5000,5000*p.buildings.crystalStorage), deut:Math.max(5000,5000*p.buildings.deutTank)}}
function capacityForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].cargo*v; } return total }
function fuelForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].fuel*v; } return total }
function fleetSpeed(shipMap){const vals=Object.entries(shipMap).filter(([,v])=>v>0).map(([k])=>defs.ships[k].speed); return vals.length?Math.min(...vals):1}
function distanceBetween(a,b){return Math.abs(a[0]-b[0])*15000 + Math.abs(a[1]-b[1])*20 + Math.abs(a[2]-b[2]) + 5}
function fleetDuration(fromCoord,toCoord,shipMap){const speed=fleetSpeed(shipMap)*fleetSpeedBonus()*pathfinderBonus(shipMap); const distance=distanceBetween(fromCoord,toCoord); return Math.max(10, Math.round((distance*3)/speed)); }
function secsLeft(t){return Math.max(0, Math.ceil((t-Date.now())/1000))}
function computePoints(p){
  let total=0;
  for(const [k,lvl] of Object.entries(p.buildings)){ const def=defs.buildings[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ const c=scaledCost(def.base,l); total+=c.metal+c.crystal+c.deut; } }
  for(const [k,lvl] of Object.entries(p.research)){ const def=defs.research[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ const c=scaledCost(def.base,l); total+=c.metal+c.crystal+c.deut; } }
  for(const [k,v] of Object.entries(p.ships)){ if(defs.ships[k] && v) total += (defs.ships[k].cost.metal+defs.ships[k].cost.crystal+defs.ships[k].cost.deut)*v; }
  return total;
}
function totalPlayerPoints(){ return Math.floor(state.planets.reduce((s,p)=>s+computePoints(p),0)/1000); }

const navItems = [['overview','Übersicht'],['buildings','Gebäude'],['facilities','Anlagen'],['defense','Verteidigung'],['resources','Ressourcen'],['research','Forschung'],['shipyard','Werft'],['fleet','Flotte'],['expeditions','Expeditionen'],['galaxy','Galaxie'],['moons','Monde'],['alliance','Allianz'],['officers','Offiziere'],['lifeform','Lebensform'],['market','Markt'],['reports','Berichte'],['messages','Nachrichten'],['empire','Imperium'],['highscore','Rangliste'],['settings','Einstellungen']];

function renderNav(){ $('#nav').innerHTML = navItems.map(([id,label])=>`<button class="${state.view===id?'active':''}" data-view="${id}">${label}</button>`).join(''); document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ if(b.dataset.view!=='fleet') state.fleetPrefill=null; if(b.dataset.view==='highscore') highscoreCache=null; if(b.dataset.view==='galaxy') galaxyCache={}; state.view=b.dataset.view; render(); }); }
function renderTop(){ const p=active(); if(!p) return; const inc=hourly(p), e=energyStats(p); $('#planetName').textContent=p.name; $('#planetCoords').innerHTML=coordLinkHtml(p.coords); $('#metalTop').textContent=fmt(p.resources.metal); $('#crystalTop').textContent=fmt(p.resources.crystal); $('#deutTop').textContent=fmt(p.resources.deut); $('#metalRate').textContent=fmt1(inc.metal)+'/h'; $('#crystalRate').textContent=fmt1(inc.crystal)+'/h'; $('#deutRate').textContent=fmt1(inc.deut)+'/h'; $('#energyTop').textContent=fmt(e.prod); $('#energyUse').textContent=fmt(e.use)+' genutzt'; }
function renderSide(){
  $('#planetTabs').innerHTML = state.planets.map((p,i)=>`<button class="pill ${state.activePlanet===i?'active':''}" data-planet="${i}">${p.name}</button>`).join('');
  document.querySelectorAll('[data-planet]').forEach(b=>b.onclick=()=>{state.activePlanet=Number(b.dataset.planet); render();});
  const p=active(); if(!p) return; const qs=[];
  p.buildQueue.forEach(q=>qs.push(`<div class="queue-item">Bau · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.researchQueue.forEach(q=>qs.push(`<div class="queue-item">Forschung · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.shipQueue.forEach(q=>qs.push(`<div class="queue-item">Werft · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  $('#queues').innerHTML = qs.join('') || '<div class="small">Keine aktiven Aufträge.</div>';
  $('#fleetMovements').innerHTML = state.fleets.map(f=>`<div class="queue-item">${missionLabels[f.mission]} ${state.planets[f.from]?state.planets[f.from].name:'?'} → ${coordLinkHtml(f.toCoord)}<br><span class="small">${f.phase==='outbound'?'Ankunft':'Rückflug'} in ${secsLeft(f.phase==='outbound'?f.arrive:f.returnAt)} s</span></div>`).join('') || '<div class="small">Keine Flotten unterwegs.</div>';
  $('#logs').innerHTML = state.logs.map(x=>`<div class="log">${x}</div>`).join('');
}

function viewOverview(){ const p=active(), e=energyStats(p), inc=hourly(p), cap=maxStorage(p); return `
  <div class="hero">
    <div class="card"><h2>Planetenübersicht</h2><p>Vollständiger Loop: Ressourcen, Energie, Forschung, Werft, Galaxie mit Spionage/Angriff/Kolonisierung, Kampfsimulation, Rangliste und Markt sind aktiv. Läuft server-seitig weiter, auch wenn die App geschlossen ist.</p>
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

function viewBuildings(){ const p=active(); return `<h2>Gebäude</h2><div class="list">${Object.entries(defs.buildings).filter(([,d])=>!d.isDefense && !d.facility).map(([k,d])=>{ const lvl=(p.buildings[k]||0)+1; const c=buildingCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k)}<button class="btn" data-build="${k}" ${ok?'':'disabled'}>Ausbauen</button></div></div>`; }).join('')}</div>`; }

function viewFacilities(){ const p=active(); const facKeys = Object.entries(defs.buildings).filter(([,d])=>d.facility && !d.moonOnly); return `<h2>Anlagen</h2><div class="list">${facKeys.map(([k,d])=>{ const lvl=(p.buildings[k]||0)+1; const c=buildingCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k)}<button class="btn alt" data-build="${k}" ${ok?'':'disabled'}>Ausbauen</button></div></div>`; }).join('')}</div>`; }
function viewResources(){ const p=active(), inc=hourly(p), e=energyStats(p); return `<h2>Ressourcen</h2><div class="grid2"><div class="card"><h3>Produktion pro Stunde</h3><div class="list"><div class="row"><span>Metall</span><strong>${fmt1(inc.metal)}</strong></div><div class="row"><span>Kristall</span><strong>${fmt1(inc.crystal)}</strong></div><div class="row"><span>Deuterium</span><strong>${fmt1(inc.deut)}</strong></div></div></div><div class="card"><h3>Energieeffizienz</h3><div class="bar"><span style="width:${Math.min(100,e.ratio*100)}%"></span></div><div style="height:10px"></div><div class="small">${fmt(e.prod)} verfügbar · ${fmt(e.use)} benötigt</div></div></div>`; }
function viewResearch(){ const p=active(); return `<h2>Forschung</h2><div class="small">Max. Kolonien: ${maxColonies(p)} · Max. gleichzeitige Expeditionen: ${maxExpeditions(p)} (abhängig von Astrophysik)</div><div style="height:10px"></div><div class="list">${Object.entries(defs.research).map(([k,d])=>{ const lvl=p.research[k]+1; const c=scaledCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.research[k]}</div><div class="sub">Kosten: M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('research',k)}<button class="btn good" data-research="${k}" ${ok?'':'disabled'}>Forschen</button></div></div>`; }).join('')}</div>`; }
function viewShipyard(){ const p=active(); return `<h2>Raumschiffwerft</h2><div class="list">${Object.entries(defs.ships).map(([k,d])=>{ const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(p.ships[k]||0)} · Angriff ${d.attack} · Ladung ${fmt(d.cargo)}</div><div class="sub">Kosten: M ${fmt(d.cost.metal)} · K ${fmt(d.cost.crystal)} · D ${fmt(d.cost.deut)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('ship',k)}<button class="btn warn" data-ship="${k}" ${ok?'':'disabled'}>Bauen</button></div></div>`; }).join('')}</div>`; }

function viewFleet(){
  const p=active();
  const pre = state.fleetPrefill;
  const missionVal = pre ? pre.mission : 'transport';
  const galVal = pre ? pre.gal : p.coords[0];
  const sysVal = pre ? pre.sys : p.coords[1];
  const posVal = pre ? pre.pos : 1;
  const missionOpt = (v,label)=>`<option value="${v}" ${missionVal===v?'selected':''}>${label}</option>`;
  const sendableShips = Object.entries(defs.ships).filter(([,d])=>d.role!=='power');
  const shipOptions = (key)=>Array.from({length:(p.ships[key]||0)+1},(_,i)=>`<option>${i}</option>`).join('');
  return `<h2>Flotte versenden</h2><div class="grid2">
  <div class="card"><h3>Missionsformular</h3><form class="fleet-form" id="fleetForm">
    <label>Mission<select name="mission" id="missionSelect">${missionOpt('transport','Transport')}${missionOpt('spy','Spionage')}${missionOpt('attack','Angriff')}${missionOpt('colonize','Kolonisierung')}${missionOpt('harvest','Trümmerfeld-Bergung')}</select></label>
    <label>Zielgalaxie (1-${UNIVERSE.galaxies})<input type="number" name="galaxy" min="1" max="${UNIVERSE.galaxies}" value="${galVal}"></label>
    <label>Zielsystem (1-${UNIVERSE.systems})<input type="number" name="system" min="1" max="${UNIVERSE.systems}" value="${sysVal}"></label>
    <label>Zielposition (1-${UNIVERSE.positions})<input type="number" name="position" min="1" max="${UNIVERSE.positions}" value="${posVal}"></label>
    <input type="hidden" name="target" id="targetField">
    <div class="grid3">
      ${sendableShips.map(([k,d])=>`<label>${d.name}<select name="${k}">${shipOptions(k)}</select></label>`).join('')}
    </div>
    <div class="grid3"><label>Metall<input type="number" min="0" name="metal" value="0"></label><label>Kristall<input type="number" min="0" name="crystal" value="0"></label><label>Deuterium<input type="number" min="0" name="deut" value="0"></label></div>
    <button class="btn" type="submit">Flotte starten</button>
  </form></div>
  <div class="card"><h3>Hinweise</h3><div class="small">Transport bewegt Ressourcen. Spionage liefert einen Bericht. Angriff löst eine mehrstufige Kampfsimulation gegen NPC-Kolonien aus (bis zu 6 Runden, Schilde regenerieren pro Runde). Kolonisierung braucht ein Kolonieschiff, ein leeres Feld und freie Kolonieplätze (Astrophysik). Eigene Planeten können nicht angegriffen werden.</div><div style="height:10px"></div><table><tr><th>Schiff</th><th>Angriff</th><th>Hülle</th><th>Ladung</th></tr>${Object.entries(defs.ships).map(([k,d])=>`<tr><td>${d.name}</td><td>${d.attack}</td><td>${fmt(d.hull)}</td><td>${fmt(d.cargo)}</td></tr>`).join('')}</table></div>
  </div>`; }

function galaxyJumpFormHtml(gal, sys){
  return `<div class="card" style="margin-bottom:12px"><form class="galaxy-form" id="galaxyJump" style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
    <label>Galaxie (1-${UNIVERSE.galaxies})<input type="number" name="galaxy" min="1" max="${UNIVERSE.galaxies}" value="${gal}" style="width:90px"></label>
    <label style="flex:1">System (1-${UNIVERSE.systems})<input type="number" name="system" min="1" max="${UNIVERSE.systems}" value="${sys}"></label>
    <button class="btn alt" type="submit">System anzeigen</button>
    <button class="btn" type="button" id="galaxyRefreshBtn">Aktualisieren</button>
  </form></div>`;
}
function viewGalaxy(){
  const gal = state.galaxyIndex, sys = state.galaxySystem;
  const key = galaxyCacheKey(gal, sys);
  const slots = galaxyCache[key];
  if(!slots && galaxyLoadingKey!==key){ fetchGalaxySlots(gal, sys); }
  if(!slots){
    return `<h2>Galaxie</h2>${galaxyJumpFormHtml(gal, sys)}<div class="small">Lade Systemdaten vom Server…</div>`;
  }
  return `<h2>Galaxie</h2>${galaxyJumpFormHtml(gal, sys)}
  <div class="small" style="margin-bottom:10px">Aktuell: [${gal}:${sys}] · Universum: ${UNIVERSE.galaxies} Galaxien × ${UNIVERSE.systems} Systeme × ${UNIVERSE.positions} Positionen</div>
  <div class="galaxy-grid">${slots.map(s=>{
    const key2 = debrisKey([gal,sys,s.pos]); const debris = state.debrisFields[key2];
    const debrisRow = debris ? `<div class="sub">Trümmerfeld: M ${fmt(debris.metal)} · K ${fmt(debris.crystal)} <button class="btn alt" data-mission-target="harvest:${gal}:${sys}:${s.pos}" style="margin-left:8px;padding:6px 10px;min-height:32px">Bergen</button></div>` : '';
    if(s.type==='own') return `<div class="slot own"><div>${s.pos}</div><div><strong>${s.planet.name}</strong><div class="sub">${coordLinkHtml(s.planet.coords)}</div>${debrisRow}</div><div><span class="badge own">Eigen</span></div><div class="sub">Metall ${fmt(s.planet.resources.metal)}</div><div></div></div>`;
    if(s.type==='player') return `<div class="slot"><div>${s.pos}</div><div><strong>${s.planetName}</strong><div class="sub">Spieler: ${s.ownerUsername}</div>${debrisRow}</div><div><span class="badge npc">Spieler</span></div><div class="sub">—</div><div><button class="btn danger" data-mission-target="attack:${gal}:${sys}:${s.pos}">Angriff</button> <button class="btn alt" data-mission-target="spy:${gal}:${sys}:${s.pos}">Spionage</button> <button class="btn" data-mission-target="transport:${gal}:${sys}:${s.pos}">Transport</button></div></div>`;
    if(s.type==='npc'){ const defPower = sidePower(s.defenseShips, defs.buildings).attack; return `<div class="slot"><div>${s.pos}</div><div><strong>${s.name}</strong><div class="sub">Stufe ${s.level}</div>${debrisRow}</div><div><span class="badge npc">NPC</span></div><div class="sub">Def ${fmt(defPower)}</div><div><button class="btn danger" data-mission-target="attack:${gal}:${sys}:${s.pos}">Angriff</button> <button class="btn alt" data-mission-target="spy:${gal}:${sys}:${s.pos}">Spionage</button></div></div>`; }
    return `<div class="slot empty"><div>${s.pos}</div><div>Freies Feld${debrisRow}</div><div><span class="badge empty">Leer</span></div><div class="sub">—</div><div><button class="btn good" data-mission-target="colonize:${gal}:${sys}:${s.pos}">Kolonisieren</button></div></div>`;
  }).join('')}</div>`; }

function missileLaunchFormHtml(p){
  return `<div class="card"><h3>Raketenangriff</h3><div class="small">Interplanetare Raketen erreichen Ziele im selben System sofort. Vorhanden: ${fmt(p.buildings.interplanetaryMissile||0)}.</div><div style="height:10px"></div><form class="fleet-form" id="missileForm"><label>Zielposition (1-15, gleiches System)<input type="number" min="1" max="15" name="position" value="1"></label><label>Anzahl Raketen<input type="number" min="1" max="${p.buildings.interplanetaryMissile||0}" name="count" value="1"></label><button class="btn danger" type="submit">Abfeuern</button></form></div>`;
}
function viewDefense(){
  const p=active(); const d2=commanderDiscount();
  const defenseKeys = Object.entries(defs.buildings).filter(([,d])=>d.isDefense);
  const missileCap = (p.buildings.missileSilo||0)*10;
  const rows = defenseKeys.map(([k,d])=>{
    const count=p.buildings[k]||0; const ok=meetsRequirements(p,d.requires);
    const uniqueBlocked = d.unique && count>=1;
    const missileBlocked = k==='interplanetaryMissile' && count>=missileCap;
    const disabled = !ok || uniqueBlocked || missileBlocked;
    const cm=Math.floor(d.base.metal*d2), cc=Math.floor(d.base.crystal*d2), cd=Math.floor(d.base.deut*d2);
    const capNote = k==='interplanetaryMissile' ? `<div class="sub">Kapazität: ${count}/${missileCap} (Raketensilo)</div>` : '';
    return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(count)} · Angriff ${d.attack} · Schild ${fmt(d.shield)} · Hülle ${fmt(d.hull)}</div>${capNote}<div class="sub">Kosten: M ${fmt(cm)} · K ${fmt(cc)} · D ${fmt(cd)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}${uniqueBlocked?'<div class="sub warn-text">Bereits vorhanden (Unikat)</div>':''}${missileBlocked?'<div class="sub warn-text">Silo-Kapazität erreicht</div>':''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k)}<button class="btn danger" data-defense="${k}" ${disabled?'disabled':''}>Bauen</button></div></div>`;
  }).join('');
  const missileForm = (missileCap>=1 && (p.buildings.interplanetaryMissile||0)>0) ? missileLaunchFormHtml(p) : '';
  return `<h2>Verteidigung</h2><div class="list">${rows}</div><div style="height:16px"></div>${missileForm}`;
}

function viewMessages(){ if(state.messages.length===0) return `<h2>Nachrichten</h2><div class="small">Keine Nachrichten.</div>`; return `<h2>Nachrichten</h2><div class="list">${state.messages.map(m=>`<div class="report">${m}</div>`).join('')}</div>`; }

function viewSettings(){
  const native = !!(window.Android && window.Android.saveGame);
  const url = getServerUrl();
  const statusLabel = connectionStatus==='connected' ? 'Verbunden' : (connectionStatus==='error' ? 'Fehler: '+connectionError : 'Nicht verbunden');
  const statusColor = connectionStatus==='connected' ? 'var(--good)' : (connectionStatus==='error' ? 'var(--danger)' : 'var(--muted)');
  return `<h2>Einstellungen</h2><div class="grid2">
  <div class="card"><h3>Konto</h3><div class="small">Angemeldet als <strong>${state.username||'-'}</strong></div><div class="small" style="color:${statusColor}">Server-Status: ${statusLabel}</div><div class="small">Server: ${url}</div><div style="height:10px"></div><button class="btn danger" id="logoutBtn">Abmelden</button> <button class="btn alt" id="changeServerBtn2">Server wechseln</button></div>
  <div class="card"><h3>Spielstand-Sicherung</h3><div class="small">Der Server speichert automatisch und dauerhaft. Diese Buttons erstellen zusätzlich eine lokale Sicherungskopie deines Imperiums.</div><div style="height:10px"></div><button class="btn" id="saveBtn">Backup herunterladen</button><div style="height:10px"></div>${native ? '<button class="btn alt" id="loadBtnNative">Backup wiederherstellen</button>' : '<input type="file" id="loadInput" accept="application/json">'}</div>
  </div>`;
}

function viewExpeditions(){ const p=active(); const shipOptions=(key)=>Array.from({length:(p.ships[key]||0)+1},(_,i)=>`<option>${i}</option>`).join('');
  return `<h2>Expeditionen</h2><div class="small">Freie Plätze: ${state.expeditions.length}/${maxExpeditions(p)} (abhängig von Astrophysik)</div><div style="height:10px"></div><div class="grid2">
  <div class="card"><h3>Expedition starten</h3><form class="fleet-form" id="expeditionForm">
    <label>Dauer-Slot (1-3, je 15 Min)<input type="number" min="1" max="3" value="1" name="slot"></label>
    <div class="grid3">
      <label>Leichter Jäger<select name="lightFighter">${shipOptions('lightFighter')}</select></label>
      <label>Kreuzer<select name="cruiser">${shipOptions('cruiser')}</select></label>
      <label>Großer Transporter<select name="largeCargo">${shipOptions('largeCargo')}</select></label>
      <label>Pfadfinder<select name="pathfinder">${shipOptions('pathfinder')}</select></label>
      <label>Reaper<select name="reaper">${shipOptions('reaper')}</select></label>
    </div>
    <button class="btn good" type="submit">Expedition senden</button>
  </form></div>
  <div class="card"><h3>Laufende Expeditionen</h3><div class="list">${state.expeditions.length? state.expeditions.map(e=>`<div class="row"><div>Von ${state.planets[e.from]?state.planets[e.from].name:'?'}</div><div>${secsLeft(e.done)} s</div></div>`).join('') : '<div class="small">Keine aktiven Expeditionen.</div>'}</div></div>
  </div>`; }

function viewMoons(){
  if(state.moons.length===0) return `<h2>Monde</h2><div class="small">Noch keine Monde entstanden. Monde entstehen mit einer Chance nach Schlachten mit großem Trümmerfeld (Angriff auf NPC-Kolonien, gewonnen oder verloren).</div>`;
  const moonKeys = ['lunarBase','sensorPhalanx','jumpGate'];
  const tabs = state.moons.map((m,i)=>`<button class="pill ${state.activeMoonIndex===i?'active':''}" data-moon-select="${i}">Mond ${coordStr(m.coord)}</button>`).join('');
  const m = activeMoon();
  let detail = '<div class="small">Wähle oben einen Mond aus.</div>';
  if(m){
    const buildRows = moonKeys.map(k=>{ const def=defs.buildings[k]; const lvl=(m.buildings[k]||0)+1; const c=scaledCost(def.base, lvl); return `<div class="row"><div><strong>${def.name}</strong><div class="sub">Stufe ${m.buildings[k]||0}</div><div class="sub">Kosten (vom gewählten Planeten): M ${fmt(c.metal)} · K ${fmt(c.crystal)} · D ${fmt(c.deut)}</div></div><button class="btn alt" data-moon-build="${k}">Ausbauen</button></div>`; }).join('');
    const queueRows = m.buildQueue.map(q=>`<div class="queue-item">${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`).join('') || '<div class="small">Keine aktiven Mondbauten.</div>';
    const otherMoons = state.moons.filter((mm,i)=>i!==state.activeMoonIndex);
    const jumpForm = otherMoons.length ? `<form id="jumpGateForm" class="fleet-form">
      <label>Zielmond<select name="targetMoon">${state.moons.map((mm,i)=> i!==state.activeMoonIndex ? `<option value="${i}">${coordStr(mm.coord)}</option>` : '').join('')}</select></label>
      <label>Leichter Jäger<select name="lightFighter">${Array.from({length:(m.ships.lightFighter||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <label>Kreuzer<select name="cruiser">${Array.from({length:(m.ships.cruiser||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <button class="btn good" type="submit">Sofort transferieren</button>
    </form>` : '<div class="small">Es gibt noch keinen zweiten Mond für einen Transfer.</div>';
    detail = `<div class="small" style="margin-bottom:10px">Koordinaten: ${coordLinkHtml(m.coord)}</div><div class="grid2">
      <div class="card"><h3>Mondgebäude</h3><div class="list">${buildRows}</div></div>
      <div class="card"><h3>Baustatus</h3><div class="queue">${queueRows}</div></div>
    </div>
    <div style="height:16px"></div>
    <div class="card"><h3>Sprungtor-Transfer</h3><div class="small">Sprungtore verbinden zwei Monde und transferieren Flotten verzögerungsfrei, sofern beide ein Sprungtor der Stufe 1 besitzen.</div><div style="height:10px"></div>${jumpForm}</div>`;
  }
  return `<h2>Monde</h2><div class="planet-tabs">${tabs}</div><div style="height:14px"></div>${detail}`;
}

function viewAlliance(){
  const a=state.alliance; const points = totalPlayerPoints()+a.points; const rank = allianceRank(points);
  return `<h2>Allianz</h2><div class="grid2">
  <div class="card"><h3>${a.name} [${a.tag}]</h3><div class="small">Rang: ${rank} · Allianzpunkte: ${fmt(points)}</div><div style="height:10px"></div><table><tr><th>Mitglied</th></tr>${a.members.map(m=>`<tr><td>${m}</td></tr>`).join('')}</table></div>
  <div class="card"><h3>Allianzdepot</h3><div class="grid3"><div class="card"><div class="label">Metall</div><div class="value">${fmt(a.depot.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt(a.depot.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt(a.depot.deut)}</div></div></div><div style="height:10px"></div><button class="btn alt" id="depositBtn">Bis zu 1000 von jeder Ressource einzahlen</button></div>
  </div>`; }

function viewOfficers(){
  const list=[['commander','Kommandant','Reduziert Baukosten für Gebäude und Verteidigung leicht (-5%).'],['admiral','Admiral','Erhöht die Flottengeschwindigkeit (+10%).'],['engineer','Ingenieur','Erhöht die Energieproduktion (+10%).'],['geologist','Geologe','Erhöht die Rohstoffproduktion um 10%.'],['technocrat','Technokrat','Beschleunigt die Forschung (-15% Zeit).']];
  return `<h2>Offiziere</h2><div class="small">Dunkle Materie: ${fmt(state.darkMatter)} · Offiziere gelten für 7 Tage nach Aktivierung.</div><div style="height:10px"></div><div class="list">${list.map(([k,name,desc])=>{
    const active=officerActive(k);
    const affordable = state.darkMatter>=500;
    const disabled = active || !affordable;
    const label = active ? 'Aktiv' : (affordable ? 'Aktivieren (500 DM)' : 'Zu wenig Dunkle Materie');
    return `<div class="row"><div><strong>${name}</strong><div class="sub">${desc}</div>${active?`<div class="sub">Noch aktiv: ${formatDuration(officerTimeLeft(k))}</div>`:''}</div><button class="btn ${active?'good':'alt'}" data-officer="${k}" ${disabled?'disabled':''}>${label}</button></div>`;
  }).join('')}</div>`; }

function viewLifeform(){ const lf=state.lifeform; const species=[['humans','Menschen'],['rocktal',"Rock'tal"],['mechas','Mechas'],['kaelesh','Kaelesh']];
  return `<h2>Lebensform</h2><div class="small">Aktive Spezies: ${species.find(s=>s[0]===lf.active)[1]}. Jede Lebensform bringt eigene Gebäude und Technologien mit eigenem Bevölkerungs- und Nahrungssystem.</div><div style="height:10px"></div><div class="grid2">${species.map(([k,name])=>`<div class="card"><h3>${name}</h3><button class="btn ${lf.active===k?'good':'alt'}" data-lifeform="${k}">${lf.active===k?'Ausgewählt':'Wählen'}</button></div>`).join('')}</div>`; }

function merchantCost(amount){ return Math.ceil((Number(amount)||0)/5); }
function viewMarket(){ const r=state.marketRate; const initialAmount=1000; const initialCost=merchantCost(initialAmount); const initialAffordable = initialCost>0 && initialCost<=state.darkMatter;
  return `<h2>Markt</h2><div class="market-grid"><div class="card"><div class="label">Metall</div><div class="value">${fmt1(r.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt1(r.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt1(r.deut)}</div></div></div><div style="height:16px"></div><div class="grid2"><div class="card"><h3>Ressourcen handeln</h3><form class="market-form" id="marketForm"><label>Abgeben<select name="give"><option value="metal">Metall</option><option value="crystal">Kristall</option><option value="deut">Deuterium</option></select></label><label>Erhalten<select name="want"><option value="crystal">Kristall</option><option value="metal">Metall</option><option value="deut">Deuterium</option></select></label><label>Menge<input type="number" min="1" value="100" name="amount"></label><button class="btn good" type="submit">Am Markt tauschen</button></form></div><div class="card"><h3>Händler (Dunkle Materie)</h3><div class="small">Tausche Dunkle Materie sofort gegen Ressourcen. Kurs: 5 Einheiten pro 1 DM.</div><div style="height:10px"></div><form class="market-form" id="merchantForm"><label>Ressource<select name="resource"><option value="metal">Metall</option><option value="crystal">Kristall</option><option value="deut">Deuterium</option></select></label><label>Menge<input type="number" min="1" value="${initialAmount}" name="amount" id="merchantAmount"></label><div class="small" id="merchantCostHint">Kosten: ${fmt(initialCost)} Dunkle Materie</div><button class="btn warn" type="submit" id="merchantBuyBtn" ${initialAffordable?'':'disabled'}>Kaufen</button></form><div class="small" style="margin-top:8px">Dunkle Materie: ${fmt(state.darkMatter)}</div></div></div>`; }

function viewReports(){
  if(state.reports.length===0) return `<h2>Berichte</h2><div class="small">Noch keine Spionageberichte vorhanden.</div>`;
  return `<h2>Spionageberichte</h2>${state.reports.map(r=>{
    const buildingsHtml = r.buildings ? `<div class="small" style="margin-top:6px">Gebäude: ${Object.entries(r.buildings).map(([k,v])=>v && defs.buildings[k] ? defs.buildings[k].name+' '+v : null).filter(Boolean).join(', ')||'keine'}</div>` : '';
    const researchHtml = r.research ? `<div class="small" style="margin-top:4px">Forschung: ${Object.entries(r.research).map(([k,v])=>v && defs.research[k] ? defs.research[k].name+' '+v : null).filter(Boolean).join(', ')||'keine'}</div>` : '';
    return `<div class="report"><div class="row" style="border:none;background:none;padding:0"><strong>${r.target}</strong><span class="small">${r.time}</span></div><div class="small">${r.coordArr?coordLinkHtml(r.coordArr):r.coords}</div><div class="grid3" style="margin-top:8px"><div class="card"><div class="label">Metall</div><div class="value">${fmt(r.resources.metal)}</div></div><div class="card"><div class="label">Kristall</div><div class="value">${fmt(r.resources.crystal)}</div></div><div class="card"><div class="label">Deuterium</div><div class="value">${fmt(r.resources.deut)}</div></div></div><div class="small" style="margin-top:8px">Verteidigung: ${fmt(r.defense)} · Flotte: ${Object.entries(r.fleet||{}).map(([k,v])=>v?defs.ships[k].name+' x'+v:null).filter(Boolean).join(', ')||'unbekannt'}</div>${buildingsHtml}${researchHtml}</div>`;
  }).join('')}`;
}

function viewEmpire(){ return `<h2>Imperium</h2><div class="small">Gesamtpunkte: ${fmt(totalPlayerPoints())}</div><div style="height:10px"></div><table><thead><tr><th>Planet</th><th>Koordinaten</th><th>Metall/h</th><th>Kristall/h</th><th>Deut/h</th><th>Energie</th><th>Punkte</th></tr></thead><tbody>${state.planets.map(p=>{ const inc=hourly(p), e=energyStats(p), pts=Math.floor(computePoints(p)/1000); return `<tr><td>${p.name}</td><td>${coordLinkHtml(p.coords)}</td><td>${fmt1(inc.metal)}</td><td>${fmt1(inc.crystal)}</td><td>${fmt1(inc.deut)}</td><td>${fmt(e.prod)}/${fmt(e.use)}</td><td>${fmt(pts)}</td></tr>`; }).join('')}</tbody></table>`; }

function viewHighscore(){
  if(highscoreCache===null && !highscoreLoading){ fetchHighscore(); }
  if(!highscoreCache){
    return `<h2>Rangliste</h2><div class="small">Lade Rangliste…</div>`;
  }
  return `<h2>Rangliste</h2><div class="small">Echte Punkte aller registrierten Spieler auf diesem Server, basierend auf dem Ressourcenwert aller Gebäude, Forschungen und Schiffe.</div><div style="height:10px"></div><table><thead><tr><th>Rang</th><th>Spieler</th><th>Planeten</th><th>Punkte</th></tr></thead><tbody>${highscoreCache.map((e,i)=>`<tr${e.username===state.username?' style="color:var(--accent2);font-weight:700"':''}><td>${i+1}</td><td>${e.username}${e.username===state.username?' (Du)':''}</td><td>${fmt(e.planets)}</td><td>${fmt(e.points)}</td></tr>`).join('')}</tbody></table>`;
}

function renderView(bind=true){
  const views={overview:viewOverview,buildings:viewBuildings,facilities:viewFacilities,defense:viewDefense,resources:viewResources,research:viewResearch,shipyard:viewShipyard,fleet:viewFleet,expeditions:viewExpeditions,galaxy:viewGalaxy,moons:viewMoons,alliance:viewAlliance,officers:viewOfficers,lifeform:viewLifeform,market:viewMarket,reports:viewReports,messages:viewMessages,empire:viewEmpire,highscore:viewHighscore,settings:viewSettings};
  $('#view').innerHTML = views[state.view]();
  if(bind){
    document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>enqueueBuild(b.dataset.build));
    document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>enqueueResearch(b.dataset.research));
    document.querySelectorAll('[data-ship]').forEach(b=>b.onclick=()=>enqueueShip(b.dataset.ship));
    document.querySelectorAll('[data-defense]').forEach(b=>b.onclick=()=>enqueueDefense(b.dataset.defense));
    const ff=$('#fleetForm'); if(ff){
      ff.onsubmit=e=>{e.preventDefault(); const gal=Number(ff.galaxy.value), sys=Number(ff.system.value), pos=Number(ff.position.value); $('#targetField').value = gal+':'+sys+':'+pos; state.fleetPrefill=null; sendFleet(ff)};
      ff.mission.onchange=()=>{ state.fleetPrefill=null; };
      ff.galaxy.onchange=()=>{ state.fleetPrefill=null; };
      ff.system.onchange=()=>{ state.fleetPrefill=null; };
      ff.position.onchange=()=>{ state.fleetPrefill=null; };
    }
    const mf=$('#marketForm'); if(mf) mf.onsubmit=e=>{e.preventDefault(); marketTrade(mf.give.value,mf.want.value,mf.amount.value)};
    const merchForm=$('#merchantForm'); if(merchForm){
      merchForm.onsubmit=e=>{e.preventDefault(); merchantBuy(merchForm.resource.value, merchForm.amount.value)};
      const merchAmountInput=$('#merchantAmount'), merchHint=$('#merchantCostHint'), merchBtn=$('#merchantBuyBtn');
      if(merchAmountInput && merchHint && merchBtn){
        merchAmountInput.oninput=()=>{
          const cost = merchantCost(merchAmountInput.value);
          merchHint.textContent = 'Kosten: '+fmt(cost)+' Dunkle Materie';
          merchBtn.disabled = !(cost>0 && cost<=state.darkMatter);
        };
      }
    }
    const msf=$('#missileForm'); if(msf) msf.onsubmit=e=>{e.preventDefault(); launchMissiles(msf.position.value, msf.count.value)};
    const gj=$('#galaxyJump'); if(gj) gj.onsubmit=e=>{e.preventDefault();
      const g=Number(gj.galaxy.value), s=Number(gj.system.value);
      if(Number.isInteger(g) && g>=1 && g<=UNIVERSE.galaxies) state.galaxyIndex=g;
      if(Number.isInteger(s) && s>=1 && s<=UNIVERSE.systems) state.galaxySystem=s;
      renderView();
    };
    const grb=$('#galaxyRefreshBtn'); if(grb) grb.onclick=()=>{ delete galaxyCache[galaxyCacheKey(state.galaxyIndex, state.galaxySystem)]; renderView(true); };
    document.querySelectorAll('[data-mission-target]').forEach(b=>b.onclick=()=>{
      const [mission,gal,sys,pos]=b.dataset.missionTarget.split(':');
      state.fleetPrefill = {mission, gal:Number(gal), sys:Number(sys), pos:Number(pos)};
      state.view='fleet'; render();
    });
    const saveBtn=$('#saveBtn'); if(saveBtn) saveBtn.onclick=saveGame;
    const loadInput=$('#loadInput'); if(loadInput) loadInput.onchange=e=>{ if(e.target.files[0]) loadGame(e.target.files[0]); };
    const loadBtnNative=$('#loadBtnNative'); if(loadBtnNative) loadBtnNative.onclick=requestNativeLoad;
    const logoutBtn=$('#logoutBtn'); if(logoutBtn) logoutBtn.onclick=logout;
    const changeServerBtn2=$('#changeServerBtn2'); if(changeServerBtn2) changeServerBtn2.onclick=()=>{ setToken(''); setServerUrl(''); state.username=null; everConnected=false; render(); };
    const ef=$('#expeditionForm'); if(ef) ef.onsubmit=e=>{e.preventDefault(); const ships={lightFighter:Number(ef.lightFighter.value)||0,cruiser:Number(ef.cruiser.value)||0,largeCargo:Number(ef.largeCargo.value)||0,pathfinder:Number(ef.pathfinder.value)||0,reaper:Number(ef.reaper.value)||0}; sendExpedition(ships, Number(ef.slot.value)||1);};
    const depositBtn=$('#depositBtn'); if(depositBtn) depositBtn.onclick=()=>depositAlliance();
    document.querySelectorAll('[data-officer]').forEach(b=>b.onclick=()=>{ if(officerActive(b.dataset.officer)) return; postAction('activateOfficer', {key:b.dataset.officer}); });
    document.querySelectorAll('[data-lifeform]').forEach(b=>b.onclick=()=>postAction('setLifeform', {species:b.dataset.lifeform}));
    document.querySelectorAll('[data-moon-select]').forEach(b=>b.onclick=()=>{ state.activeMoonIndex=Number(b.dataset.moonSelect); renderView(true); });
    document.querySelectorAll('[data-moon-build]').forEach(b=>b.onclick=()=>enqueueMoonBuild(b.dataset.moonBuild));
    const jgf=$('#jumpGateForm'); if(jgf) jgf.onsubmit=e=>{e.preventDefault(); const toIdx=Number(jgf.targetMoon.value); const ships={lightFighter:Number(jgf.lightFighter.value)||0, cruiser:Number(jgf.cruiser.value)||0}; jumpGateTransfer(state.activeMoonIndex, toIdx, {}, ships); };
  }
}

function ensurePlanetDefaults(p){ Object.keys(defs.buildings).forEach(k=>{ if(p.buildings[k]==null) p.buildings[k]=0; }); Object.keys(defs.research).forEach(k=>{ if(p.research[k]==null) p.research[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(p.ships[k]==null) p.ships[k]=0; }); if(!p.buildQueue) p.buildQueue=[]; if(!p.researchQueue) p.researchQueue=[]; if(!p.shipQueue) p.shipQueue=[]; }
function ensureMoonDefaults(m){ ['lunarBase','sensorPhalanx','jumpGate'].forEach(k=>{ if(m.buildings[k]==null) m.buildings[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(m.ships[k]==null) m.ships[k]=0; }); if(!m.buildQueue) m.buildQueue=[]; }
function ensureAllDefaults(){ state.planets.forEach(ensurePlanetDefaults); state.moons.forEach(ensureMoonDefaults); if(!state.officerExpiry) state.officerExpiry={}; }

function render(){
  const phase = computePhase();
  if(phase==='connect'){ document.body.classList.add('disconnected'); renderConnectScreen(); return; }
  if(phase==='auth'){ document.body.classList.add('disconnected'); renderAuthScreen(); return; }
  if(phase==='loading'){ document.body.classList.add('disconnected'); renderLoadingScreen(); return; }
  if(phase==='admin'){ document.body.classList.add('disconnected'); renderAdminPanel(); return; }
  document.body.classList.remove('disconnected');
  ensureAllDefaults();
  if(state.activeMoonIndex===null && state.moons.length>0) state.activeMoonIndex=0;
  renderNav(); renderTop(); renderSide(); renderView();
  renderConnectionBanner();
}

function initConnection(){
  render();
  if(getServerUrl() && getToken()){
    connectionStatus='connecting';
    pollState();
  }
  if(pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(()=>{ if(getToken()) pollState(); }, 1500);
}

initConnection();
