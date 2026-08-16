'use strict';

// ---- Rohstoffe & Planetentypen -------------------------------------------------
// 18 reale Rohstoffe ersetzen das alte Metall/Kristall/Deuterium-System. Kein
// Planet/Mond ist von Natur aus "universell ergiebig" - jeder Himmelskoerper hat
// einen von 6 Typen, und nur die zu diesem Typ passenden Rohstoffe koennen dort
// abgebaut werden. Das erzwingt Handel/Kolonisierung verschiedener Planetentypen,
// statt (wie im alten System) alles auf einem einzigen Heimatplaneten zu bauen.
const RESOURCE_KEYS = [
  'iron','copper','aluminium','gold','silver','lithium','rareEarths','nickel','uranium','limestone',
  'crudeOil','naturalGas','coal',
  'sulfur','phosphate','wood',
  'freshwater','saltwater',
];
const RESOURCE_INFO = {
  iron: {name:'Eisen', group:'ore'},
  copper: {name:'Kupfer', group:'ore'},
  aluminium: {name:'Aluminium', group:'ore'},
  nickel: {name:'Nickel', group:'ore'},
  limestone: {name:'Kalkstein', group:'ore'},
  gold: {name:'Gold', group:'tech'},
  silver: {name:'Silber', group:'tech'},
  lithium: {name:'Lithium', group:'tech'},
  rareEarths: {name:'Seltene Erden', group:'tech'},
  crudeOil: {name:'Rohöl', group:'fuel'},
  naturalGas: {name:'Erdgas', group:'fuel'},
  coal: {name:'Kohle', group:'fuel'},
  uranium: {name:'Uran', group:'fuel'},
  sulfur: {name:'Schwefel', group:'special'},
  phosphate: {name:'Phosphat', group:'special'},
  wood: {name:'Holz', group:'special'},
  freshwater: {name:'Süßwasser', group:'water'},
  saltwater: {name:'Salzwasser', group:'water'},
};
const RESOURCE_GROUPS = {
  ore: {name:'Erze', storageBuilding:'oreStorage'},
  tech: {name:'Technologiemetalle', storageBuilding:'techStorage'},
  fuel: {name:'Energieträger', storageBuilding:'fuelStorage'},
  special: {name:'Sonderrohstoffe', storageBuilding:'resourceStorage'},
  water: {name:'Wasser', storageBuilding:'resourceStorage'},
};
const PLANET_TYPES = {
  rocky: {name:'Gesteinsplanet', desc:'Fester, mineralreicher Untergrund - der Standard-Planetentyp für Heimatwelten.', resources:['iron','copper','aluminium','nickel','limestone']},
  desert: {name:'Wüstenplanet', desc:'Heiß, trocken, geologisch alt - reich an Edelmetallen und radioaktiven Ablagerungen.', resources:['gold','silver','uranium','rareEarths','sulfur','phosphate']},
  ice: {name:'Eiswelt', desc:'Gefrorene Wassereis- und Gashydrat-Vorkommen unter der Oberfläche.', resources:['freshwater','lithium','naturalGas']},
  ocean: {name:'Ozeanplanet', desc:'Selten - noch immer flüssiges Wasser, sedimentäre Ablagerungen.', resources:['saltwater','freshwater','limestone','phosphate']},
  volcanic: {name:'Vulkanplanet', desc:'Geologisch hochaktiv, reich an fossilen und mineralischen Tiefenvorkommen.', resources:['coal','crudeOil','sulfur','rareEarths']},
  gasMoon: {name:'Gasriesenmond', desc:'Dünne Atmosphäre im Orbit eines Gasriesen, Sole-Ablagerungen und Gaslecks.', resources:['naturalGas','aluminium','lithium']},
};
function planetTypesForResource(resource){
  return Object.entries(PLANET_TYPES).filter(([,t])=>t.resources.includes(resource)).map(([k])=>k);
}
function zeroResources(){ const r={}; RESOURCE_KEYS.forEach(k=>r[k]=0); return r; }
function resTotal(c){ return RESOURCE_KEYS.reduce((s,k)=>s+(c[k]||0),0); }

// Selbstversorgende Minen-Kosten: verteilt einen Gesamtwert ausschliesslich auf die
// Rohstoffe, die der BAUENDE Planet(entyp) selbst hervorbringt. Damit kann jeder
// Planetentyp seine eigene Basis-Abbauinfrastruktur hochziehen, ohne von Anfang an auf
// Handel angewiesen zu sein - Handel wird erst fuer Energie/Infrastruktur/Schiffe/
// Forschung noetig, die bewusst Rohstoffe mehrerer Planetentypen kombinieren (siehe cv()).
function mineBaseCost(planetType, magnitude){
  const pool = PLANET_TYPES[planetType] ? PLANET_TYPES[planetType].resources : [];
  const cost = zeroResources();
  if(!pool.length) return cost;
  const share = magnitude / pool.length;
  pool.forEach(r=>{ cost[r] = Math.round(share); });
  return cost;
}
// Liefert die tatsaechliche Kosten-Basis fuer ein Gebaeude auf Planet p: bei Minen
// dynamisch nach dem Planetentyp von p aufgeloest (siehe mineBaseCost), sonst die
// statische def.base.
function costBaseFor(def, p){
  if(def.costMagnitude!=null) return mineBaseCost(p.planetType, def.costMagnitude);
  return def.base;
}

// Mechanischer, wertneutraler Umrechner: verteilt einen alten {metal,crystal,deut}-
// Kostenwert (aus der urspruenglichen, bereits ausbalancierten OGame-Formel) auf die
// neuen Rohstoffe, gruppiert nach thematischer Naehe. Die GESAMTSUMME bleibt gleich -
// nur die Zusammensetzung aendert sich. Das ist ein erster, bewusst nachvollziehbarer
// Entwurf: exakte Kosten pro Gebaeude lassen sich nach dem Anspielen gezielt verfeinern.
function cv(old){
  const m = old.metal||0, c = old.crystal||0, d = old.deut||0;
  const r = (x)=>Math.round(x);
  return {
    iron: r(m*0.35), copper: r(m*0.20), aluminium: r(m*0.15), nickel: r(m*0.15), limestone: r(m*0.15),
    gold: r(c*0.25), silver: r(c*0.25), lithium: r(c*0.20), rareEarths: r(c*0.30),
    crudeOil: r(d*0.30), naturalGas: r(d*0.20), coal: r(d*0.15), uranium: r(d*0.20), sulfur: r(d*0.15),
  };
}
function addCost(a, extra){ const r=Object.assign({}, a); for(const [k,v] of Object.entries(extra||{})){ r[k]=(r[k]||0)+v; } return r; }

const defs = {
  buildings: {
    // ---- Minen: eine pro Rohstoff, jeweils nur auf passenden Planetentypen baubar ----
    ironMine:{name:'Eisenmine', resource:'iron', costMagnitude:75, powerUse:l=>10*l, prod:l=>30*l*Math.pow(1.1,l)},
    copperMine:{name:'Kupfermine', resource:'copper', costMagnitude:73, powerUse:l=>10*l, prod:l=>26*l*Math.pow(1.1,l)},
    aluminiumMine:{name:'Aluminiumverhüttung', resource:'aluminium', costMagnitude:85, powerUse:l=>11*l, prod:l=>24*l*Math.pow(1.1,l)},
    nickelMine:{name:'Nickelmine', resource:'nickel', costMagnitude:74, powerUse:l=>10*l, prod:l=>22*l*Math.pow(1.1,l)},
    limestoneQuarry:{name:'Kalksteinbruch', resource:'limestone', costMagnitude:55, powerUse:l=>8*l, prod:l=>28*l*Math.pow(1.1,l)},
    goldMine:{name:'Goldmine', resource:'gold', costMagnitude:72, powerUse:l=>12*l, prod:l=>14*l*Math.pow(1.1,l)},
    silverMine:{name:'Silbermine', resource:'silver', costMagnitude:70, powerUse:l=>12*l, prod:l=>16*l*Math.pow(1.1,l)},
    uraniumMine:{name:'Uranmine', resource:'uranium', costMagnitude:110, powerUse:l=>14*l, prod:l=>10*l*Math.pow(1.1,l)},
    rareEarthsMine:{name:'Seltenerdmine', resource:'rareEarths', costMagnitude:93, powerUse:l=>13*l, prod:l=>12*l*Math.pow(1.1,l)},
    sulfurMine:{name:'Schwefelmine', resource:'sulfur', costMagnitude:52, powerUse:l=>9*l, prod:l=>18*l*Math.pow(1.1,l)},
    phosphateMine:{name:'Phosphatmine', resource:'phosphate', costMagnitude:56, powerUse:l=>9*l, prod:l=>18*l*Math.pow(1.1,l)},
    crudeOilPump:{name:'Ölbohrturm', resource:'crudeOil', costMagnitude:300, powerUse:l=>20*l, prod:l=>10*l*Math.pow(1.1,l)},
    naturalGasPump:{name:'Erdgasförderanlage', resource:'naturalGas', costMagnitude:270, powerUse:l=>18*l, prod:l=>11*l*Math.pow(1.1,l)},
    coalMine:{name:'Kohlebergwerk', resource:'coal', costMagnitude:70, powerUse:l=>10*l, prod:l=>20*l*Math.pow(1.1,l)},
    freshwaterExtractor:{name:'Süßwassergewinnung', resource:'freshwater', costMagnitude:50, powerUse:l=>7*l, prod:l=>20*l*Math.pow(1.1,l)},
    saltwaterDesalinator:{name:'Meerwasserpumpe', resource:'saltwater', costMagnitude:43, powerUse:l=>6*l, prod:l=>22*l*Math.pow(1.1,l)},
    lithiumExtractor:{name:'Lithium-Solefeld', resource:'lithium', costMagnitude:76, powerUse:l=>11*l, prod:l=>13*l*Math.pow(1.1,l)},
    // Holz ist die einzige Ausnahme vom Planetentyp-System: keine natuerliche Quelle,
    // erfordert einen Terraformer (kuenstliche Biosphaere), dafuer auf JEDEM Typ danach baubar.
    sawmill:{name:'Forstplantage', resource:'wood', base:cv({metal:80,crystal:40,deut:20}), powerUse:l=>10*l, prod:l=>15*l*Math.pow(1.1,l), requires:{terraformer:1}},

    // ---- Energie ----
    // Solarenergie ist ueberall nutzbar (Sonnenlicht statt planetentyp-spezifischer
    // Rohstoffe) - deshalb bewusst wie eine Mine selbstversorgend aus den Rohstoffen
    // DES EIGENEN Planeten finanziert, damit jeder neue Spieler ueberhaupt Energie
    // fuer seine ersten Minen bekommt, ohne von Anfang an auf Handel angewiesen zu sein.
    solarPlant:{name:'Solarkraftwerk', costMagnitude:105, power:l=>40*l*Math.pow(1.05,l)},
    nuclearReactor:{name:'Kernreaktor', base:addCost(cv({metal:900,crystal:360,deut:0}),{uranium:60}), power:l=>30*l*Math.pow(1.05,l), uraniumUse:l=>Math.floor(10*l*Math.pow(1.1,l)), requires:{uraniumMine:5, energyTech:3}},

    // ---- Lager (gruppiert statt 18 Einzeltanks) ----
    // Selbstversorgend wie die Minen: das ERSTE Lager, das ein neuer Spieler braucht,
    // um seine eigene (Erz-)Produktion vor dem Ueberlauf zu bewahren, bevor ueberhaupt
    // Handel moeglich war.
    oreStorage:{name:'Erzlager', costMagnitude:1000},
    techStorage:{name:'Technologielager', base:cv({metal:600,crystal:800,deut:0})},
    fuelStorage:{name:'Energielager', base:cv({metal:800,crystal:200,deut:400})},
    resourceStorage:{name:'Rohstofflager', base:addCost(cv({metal:700,crystal:300,deut:0}),{phosphate:100,freshwater:50})},

    // ---- Infrastruktur ----
    robotFactory:{name:'Roboterfabrik', base:cv({metal:400,crystal:120,deut:200})},
    shipyard:{name:'Raumschiffwerft', base:addCost(cv({metal:400,crystal:200,deut:100}),{nickel:50}), requires:{robotFactory:2}},
    spaceDock:{name:'Raumstation', base:cv({metal:20000,crystal:40000,deut:0}), requires:{shipyard:3}},
    researchLab:{name:'Forschungslabor', base:addCost(cv({metal:200,crystal:400,deut:200}),{silver:40}), },
    naniteFactory:{name:'Nanitenfabrik', base:cv({metal:1000000,crystal:500000,deut:100000}), requires:{robotFactory:10, computerTech:10}, facility:true},
    terraformer:{name:'Terraformer', base:addCost(cv({metal:0,crystal:50000,deut:100000}),{freshwater:20000,wood:5000}), requires:{naniteFactory:1, energyTech:12}, facility:true},
    allianceDepot:{name:'Allianzdepot', base:addCost(cv({metal:20000,crystal:40000,deut:0}),{phosphate:5000}), requires:{shipyard:3}, facility:true},
    missileSilo:{name:'Raketensilo', base:cv({metal:20000,crystal:20000,deut:1000}), requires:{shipyard:1}, facility:true},
    sensorPhalanx:{name:'Sensorphalanx', base:cv({metal:20000,crystal:40000,deut:20000}), requires:{naniteFactory:1}, moonOnly:true, facility:true},
    jumpGate:{name:'Sprungtor', base:cv({metal:2000000,crystal:4000000,deut:800000}), requires:{naniteFactory:1, hyperspaceTech:7}, moonOnly:true, facility:true},
    lunarBase:{name:'Lunarbasis', base:cv({metal:20000,crystal:40000,deut:20000}), requires:{}, moonOnly:true, facility:true},

    // ---- Verteidigung ----
    missileLauncher:{name:'Raketenwerfer', base:cv({metal:2000,crystal:0,deut:0}), isDefense:true, attack:80, shield:20, hull:2000, requires:{shipyard:1}},
    lightLaser:{name:'Leichtes Laser-Geschütz', base:cv({metal:1500,crystal:500,deut:0}), isDefense:true, attack:100, shield:25, hull:2000, requires:{shipyard:2, energyTech:1}},
    heavyLaser:{name:'Schweres Laser-Geschütz', base:cv({metal:6000,crystal:2000,deut:0}), isDefense:true, attack:250, shield:100, hull:8000, requires:{shipyard:4, energyTech:3}},
    gaussCannon:{name:'Gauß-Kanone', base:cv({metal:20000,crystal:15000,deut:2000}), isDefense:true, attack:1100, shield:200, hull:35000, requires:{shipyard:6, weaponsTech:3, shieldingTech:1, energyTech:6}},
    ionCannon:{name:'Ionenkanone', base:cv({metal:5000,crystal:3000,deut:0}), isDefense:true, attack:150, shield:500, hull:8000, requires:{shipyard:4, ionTech:4}},
    plasmaTurret:{name:'Plasmawerfer', base:cv({metal:50000,crystal:50000,deut:30000}), isDefense:true, attack:3000, shield:300, hull:100000, requires:{shipyard:8, plasmaTech:7}},
    smallShield:{name:'Kleine Schildkuppel', base:cv({metal:10000,crystal:10000,deut:0}), isDefense:true, unique:true, attack:1, shield:2000, hull:20000, requires:{shieldingTech:2}},
    largeShield:{name:'Große Schildkuppel', base:cv({metal:50000,crystal:50000,deut:0}), isDefense:true, unique:true, attack:1, shield:10000, hull:100000, requires:{shipyard:6, shieldingTech:6}},
    interplanetaryMissile:{name:'Interplanetare Rakete', base:cv({metal:12500,crystal:2500,deut:0}), isDefense:true, attack:12000, shield:0, hull:1, requires:{missileSilo:4}},
  },
  research: {
    energyTech:{name:'Energietechnik', base:cv({metal:0,crystal:800,deut:400}), requires:{researchLab:1}},
    combustion:{name:'Verbrennungstriebwerk', base:cv({metal:400,crystal:0,deut:600}), requires:{researchLab:1, energyTech:1}},
    computerTech:{name:'Computertechnik', base:cv({metal:0,crystal:400,deut:600}), requires:{researchLab:1}},
    weaponsTech:{name:'Waffentechnik', base:cv({metal:800,crystal:200,deut:0}), requires:{researchLab:4}},
    shieldingTech:{name:'Schildtechnik', base:cv({metal:200,crystal:600,deut:0}), requires:{researchLab:6, energyTech:3}},
    espionageTech:{name:'Spionagetechnik', base:cv({metal:200,crystal:1000,deut:200}), requires:{researchLab:3}},
    impulseDrive:{name:'Impulstriebwerk', base:cv({metal:2000,crystal:4000,deut:600}), requires:{researchLab:2, energyTech:1}},
    armourTech:{name:'Rumpfpanzerung', base:cv({metal:1000,crystal:0,deut:0}), requires:{researchLab:2}},
    hyperspaceTech:{name:'Hyperraumtechnik', base:cv({metal:0,crystal:4000,deut:2000}), requires:{researchLab:7, energyTech:5, shieldingTech:5}},
    hyperspaceDrive:{name:'Hyperraumantrieb', base:cv({metal:10000,crystal:20000,deut:6000}), requires:{researchLab:7, hyperspaceTech:3}},
    laserTech:{name:'Lasertechnik', base:cv({metal:200,crystal:100,deut:0}), requires:{researchLab:1, energyTech:2}},
    ionTech:{name:'Iontechnik', base:cv({metal:1000,crystal:300,deut:100}), requires:{researchLab:4, laserTech:5, energyTech:4}},
    plasmaTech:{name:'Plasmatechnik', base:cv({metal:2000,crystal:4000,deut:1000}), requires:{researchLab:4, energyTech:8, laserTech:10, ionTech:5}},
    gravitonTech:{name:'Gravitationstechnik', base:cv({metal:0,crystal:0,deut:0}), requires:{researchLab:12}},
    astrophysics:{name:'Astrophysik', base:cv({metal:4000,crystal:8000,deut:4000}), requires:{researchLab:3, espionageTech:4, impulseDrive:3}},
    intergalacticNetwork:{name:'Intergalaktisches Forschungsnetzwerk', base:cv({metal:240000,crystal:400000,deut:160000}), requires:{researchLab:10, computerTech:8}},
  },
  ships: {
    smallCargo:{name:'Kleiner Transporter', cost:cv({metal:2000,crystal:2000,deut:0}), cargo:5000, speed:1, fuel:12, attack:5, shield:10, hull:4000, role:'cargo', requires:{shipyard:2}},
    largeCargo:{name:'Großer Transporter', cost:cv({metal:6000,crystal:6000,deut:0}), cargo:25000, speed:0.8, fuel:28, attack:5, shield:25, hull:12000, role:'cargo', requires:{shipyard:4}},
    colonyShip:{name:'Kolonieschiff', cost:cv({metal:10000,crystal:20000,deut:10000}), cargo:7500, speed:0.6, fuel:60, attack:0, shield:100, hull:30000, role:'colony', requires:{shipyard:4, combustion:3}},
    espionageProbe:{name:'Spionagesonde', cost:cv({metal:0,crystal:1000,deut:0}), cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'probe', requires:{shipyard:3, combustion:3}},
    lightFighter:{name:'Leichter Jäger', cost:cv({metal:3000,crystal:1000,deut:0}), cargo:50, speed:1.4, fuel:20, attack:50, shield:10, hull:4000, role:'combat', requires:{shipyard:1, combustion:1}},
    heavyFighter:{name:'Schwerer Jäger', cost:cv({metal:6000,crystal:4000,deut:0}), cargo:100, speed:1.0, fuel:25, attack:150, shield:25, hull:10000, role:'combat', requires:{shipyard:3, armourTech:2, impulseDrive:2}},
    cruiser:{name:'Kreuzer', cost:cv({metal:20000,crystal:7000,deut:2000}), cargo:800, speed:1.1, fuel:40, attack:400, shield:50, hull:27000, role:'combat', requires:{shipyard:5, weaponsTech:2}},
    battleship:{name:'Schlachtschiff', cost:cv({metal:45000,crystal:15000,deut:0}), cargo:1500, speed:0.8, fuel:50, attack:1000, shield:200, hull:60000, role:'combat', requires:{shipyard:7, hyperspaceDrive:4}},
    battlecruiser:{name:'Großer Kreuzer', cost:cv({metal:30000,crystal:40000,deut:15000}), cargo:750, speed:0.9, fuel:250, attack:700, shield:400, hull:70000, role:'combat', requires:{shipyard:8, hyperspaceTech:5, laserTech:12}},
    bomber:{name:'Bomber', cost:cv({metal:50000,crystal:25000,deut:15000}), cargo:500, speed:0.6, fuel:65, attack:1000, shield:500, hull:75000, role:'combat', requires:{shipyard:8, plasmaTech:5, impulseDrive:6}},
    destroyer:{name:'Zerstörer', cost:cv({metal:60000,crystal:50000,deut:15000}), cargo:2000, speed:0.7, fuel:100, attack:2000, shield:500, hull:110000, role:'combat', requires:{shipyard:9, hyperspaceTech:5, hyperspaceDrive:6}},
    reaper:{name:'Reaper', cost:cv({metal:85000,crystal:55000,deut:20000}), cargo:10000, speed:0.6, fuel:80, attack:2800, shield:700, hull:140000, role:'combat', requires:{shipyard:10, spaceDock:1, hyperspaceTech:6, hyperspaceDrive:7}},
    pathfinder:{name:'Pfadfinder', cost:cv({metal:8000,crystal:15000,deut:8000}), cargo:10000, speed:1.6, fuel:20, attack:200, shield:100, hull:23000, role:'combat', requires:{shipyard:5, spaceDock:1, hyperspaceDrive:2, hyperspaceTech:3}},
    deathstar:{name:'Todesstern', cost:cv({metal:5000000,crystal:4000000,deut:1000000}), cargo:1000000, speed:0.4, fuel:1, attack:200000, shield:50000, hull:9000000, role:'combat', requires:{shipyard:12, hyperspaceTech:6, gravitonTech:1}},
    solarSatellite:{name:'Solarsatellit', cost:cv({metal:0,crystal:2000,deut:500}), cargo:0, speed:0, fuel:0, attack:1, shield:1, hull:2000, role:'power', requires:{}},
    recycler:{name:'Recycler', cost:cv({metal:10000,crystal:6000,deut:2000}), cargo:20000, speed:0.7, fuel:30, attack:1, shield:10, hull:16000, role:'recycler', requires:{shipyard:4, combustion:6}},
    researchProbe:{name:'Forschungssonde', cost:cv({metal:0,crystal:1000,deut:0}), cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'research', requires:{shipyard:3, combustion:3}},
  },
  items: {
    oreBooster:{name:'Erz-Produktionsbooster', desc:'Erhöht die Produktion aller Erze (Eisen, Kupfer, Aluminium, Nickel, Kalkstein) für 24 Stunden um 50%.', group:'ore', durationHours:24},
    techBooster:{name:'Technologiemetall-Produktionsbooster', desc:'Erhöht die Produktion aller Technologiemetalle (Gold, Silber, Lithium, Seltene Erden) für 24 Stunden um 50%.', group:'tech', durationHours:24},
    fuelBooster:{name:'Energieträger-Produktionsbooster', desc:'Erhöht die Produktion aller Energieträger (Rohöl, Erdgas, Kohle, Uran) für 24 Stunden um 50%.', group:'fuel', durationHours:24},
    speedBooster:{name:'Flottengeschwindigkeitsbooster', desc:'Erhöht die Fluggeschwindigkeit aller Flotten für 24 Stunden um 30%.', effect:'speedBoost', durationHours:24},
  },
  lifeformBuildings: {
    humanResidence:{name:'Wohnkomplex', desc:'Menschliche Siedlungen, die effizienter Erze fördern. +2% Erzproduktion pro Stufe.', species:'humans', boostsGroup:'ore', base:cv({metal:4800,crystal:2400,deut:0})},
    humanFarm:{name:'Nahrungsfarm', desc:'Versorgt die wachsende Bevölkerung und steigert nebenbei die Technologiemetall-Gewinnung. +2% pro Stufe.', species:'humans', boostsGroup:'tech', base:cv({metal:3600,crystal:4800,deut:0})},
    humanBank:{name:'Handelszentrum', desc:'Effizientere Energielogistik durch florierenden Handel. +2% Energieträger-Produktion pro Stufe.', species:'humans', boostsGroup:'fuel', base:cv({metal:2400,crystal:2400,deut:1200})},
    rocktalMeditation:{name:'Meditationshalle', desc:"Rock'tal-Weisheit steigert die Effizienz der Erzförderung. +2% Erzproduktion pro Stufe.", species:'rocktal', boostsGroup:'ore', base:cv({metal:5200,crystal:2000,deut:0})},
    rocktalCrystalFarm:{name:'Edelmetallfarm', desc:"Von Rock'tal-Mönchen gepflegte Abbaustätten. +2% Technologiemetall-Produktion pro Stufe.", species:'rocktal', boostsGroup:'tech', base:cv({metal:3200,crystal:5200,deut:0})},
    rocktalRefinery:{name:'Energie-Raffinerie', desc:"Traditionelle Rock'tal-Destillation. +2% Energieträger-Produktion pro Stufe.", species:'rocktal', boostsGroup:'fuel', base:cv({metal:2600,crystal:2200,deut:1400})},
    mechasAssembly:{name:'Montagehalle', desc:'Mechas-Automatisierung optimiert den Erzabbau. +2% Erzproduktion pro Stufe.', species:'mechas', boostsGroup:'ore', base:cv({metal:6000,crystal:1800,deut:0})},
    mechasProcessor:{name:'Metallprozessor', desc:'Mechanische Präzision bei der Technologiemetall-Verarbeitung. +2% pro Stufe.', species:'mechas', boostsGroup:'tech', base:cv({metal:3400,crystal:5600,deut:0})},
    mechasReactor:{name:'Reaktorkern', desc:'Hocheffiziente Mechas-Reaktoren steigern die Energieträger-Ausbeute. +2% pro Stufe.', species:'mechas', boostsGroup:'fuel', base:cv({metal:2800,crystal:2400,deut:1600})},
    kaeleshShrine:{name:'Schrein', desc:'Kaelesh-Rituale segnen die Erzförderung. +2% Erzproduktion pro Stufe.', species:'kaelesh', boostsGroup:'ore', base:cv({metal:5000,crystal:2600,deut:0})},
    kaeleshMonastery:{name:'Kloster', desc:'Kaelesh-Mönche verfeinern die Technologiemetall-Gewinnung. +2% pro Stufe.', species:'kaelesh', boostsGroup:'tech', base:cv({metal:3000,crystal:5400,deut:0})},
    kaeleshOracle:{name:'Orakel', desc:'Prophetische Voraussicht optimiert die Energieträger-Förderung. +2% pro Stufe.', species:'kaelesh', boostsGroup:'fuel', base:cv({metal:2600,crystal:2600,deut:1500})},
  },
  events: {
    oreRush:{name:'Erzrausch', desc:'Die Produktion aller Erze (Eisen, Kupfer, Aluminium, Nickel, Kalkstein) ist für alle Spieler um 50% erhöht.', group:'ore', multiplier:1.5},
    techRush:{name:'Technologiemetallrausch', desc:'Die Produktion aller Technologiemetalle (Gold, Silber, Lithium, Seltene Erden) ist für alle Spieler um 50% erhöht.', group:'tech', multiplier:1.5},
    fuelRush:{name:'Energieträgerrausch', desc:'Die Produktion aller Energieträger (Rohöl, Erdgas, Kohle, Uran) ist für alle Spieler um 50% erhöht.', group:'fuel', multiplier:1.5},
    galacticBoom:{name:'Galaktischer Boom', desc:'Die Produktion aller Rohstoffe ist für jeden Spieler um 25% erhöht.', group:'all', multiplier:1.25},
  },
};
// Reverse-Lookup: welches Minengebaeude foerdert welchen Rohstoff (fuer Produktions-
// berechnung, Anforderungspruefung und generische Client-Anzeige).
const MINE_BY_RESOURCE = {};
for(const [key, def] of Object.entries(defs.buildings)){ if(def.resource) MINE_BY_RESOURCE[def.resource] = key; }

const missionLabels = {transport:'Transport', spy:'Spionage', attack:'Angriff', colonize:'Kolonisierung', harvest:'Trümmerfeld-Bergung'};
const UNIVERSE = { galaxies: 9, systems: 499, positions: 15 };
const AUCTION_DURATION_MS = 20*60*1000;
const EVENT_DURATION_MS = 30*60*1000;
const EVENT_GAP_MIN_MS = 20*60*1000;
const EVENT_GAP_MAX_MS = 45*60*1000;

// ---- Universe / accounts ----

function pickRandomItemKey(){ const keys=Object.keys(defs.items); return keys[Math.floor(Math.random()*keys.length)]; }
function ensureAuction(universe){
  if(universe.auction && !defs.items[universe.auction.itemKey]){
    // Auktion referenziert einen Item-Key aus einer frueheren Wirtschaftsversion (z.B. vor
    // der Rohstoffreform umbenannt) - Gebot zurueckerstatten und Auktion sauber neu ziehen,
    // statt mit einem crashenden defs.items[...]-Zugriff die gesamte API-Antwort zu killen.
    if(universe.auction.currentBidder && universe.players[universe.auction.currentBidder]){
      universe.players[universe.auction.currentBidder].darkMatter += universe.auction.currentBid;
    }
    universe.auction = null;
  }
  if(!universe.auction){ universe.auction = { itemKey: pickRandomItemKey(), currentBid: 0, currentBidder: null, endsAt: Date.now()+AUCTION_DURATION_MS }; }
}
function getPublicAuctionView(universe){
  ensureAuction(universe);
  const a = universe.auction;
  const def = defs.items[a.itemKey];
  return { itemKey:a.itemKey, itemName:def.name, itemDesc:def.desc, currentBid:a.currentBid, currentBidder:a.currentBidder, endsAt:a.endsAt };
}
function resolveAuctionIfDue(universe){
  ensureAuction(universe);
  const a = universe.auction;
  if(Date.now()<a.endsAt) return;
  if(a.currentBidder && universe.players[a.currentBidder]){
    const winner = universe.players[a.currentBidder];
    const def = defs.items[a.itemKey];
    if(!winner.itemExpiry) winner.itemExpiry = {};
    const base = Math.max(Date.now(), winner.itemExpiry[a.itemKey]||0);
    winner.itemExpiry[a.itemKey] = base + def.durationHours*3600*1000;
    message(winner, 'Auktion gewonnen: '+def.name+' für '+a.currentBid+' Dunkle Materie ersteigert!');
    log(winner, 'Auktion gewonnen: '+def.name);
  }
  universe.auction = { itemKey: pickRandomItemKey(), currentBid: 0, currentBidder: null, endsAt: Date.now()+AUCTION_DURATION_MS };
}
function bidAuction(universe, username, amount){
  const state = universe.players[username];
  ensureAuction(universe);
  const a = universe.auction;
  const bid = Math.floor(Number(amount)||0);
  if(bid<=a.currentBid) return fail(state, 'Gebot muss höher als das aktuelle Höchstgebot ('+a.currentBid+' Dunkle Materie) sein');
  if(bid>state.darkMatter) return fail(state, 'Nicht genug Dunkle Materie für dieses Gebot');
  if(a.currentBidder && universe.players[a.currentBidder]) universe.players[a.currentBidder].darkMatter += a.currentBid;
  state.darkMatter -= bid;
  a.currentBid = bid; a.currentBidder = username;
  return ok(state, 'Gebot über '+bid+' Dunkle Materie auf '+defs.items[a.itemKey].name+' abgegeben');
}
function itemActive(state, key){ return !!(state.itemExpiry && state.itemExpiry[key] && state.itemExpiry[key] > Date.now()); }

function randomEventGap(){ return EVENT_GAP_MIN_MS + Math.random()*(EVENT_GAP_MAX_MS-EVENT_GAP_MIN_MS); }
function pickRandomEventKey(){ const keys=Object.keys(defs.events); return keys[Math.floor(Math.random()*keys.length)]; }
// Zeitlich begrenzte Server-Events (Rohstoffrausch-Wochenenden, wie im echten OGame):
// ein universumsweiter Boost, der fuer alle Spieler gleichzeitig gilt, in unregelmaessigen
// Abstaenden auftritt und nach EVENT_DURATION_MS wieder endet.
function resolveEventIfDue(universe){
  const now = Date.now();
  if(universe.event){
    if(now >= universe.event.endsAt){
      universe.event = null;
      universe.nextEventAt = now + randomEventGap();
    }
    return;
  }
  if(universe.nextEventAt == null) universe.nextEventAt = now + randomEventGap();
  if(now >= universe.nextEventAt){
    const key = pickRandomEventKey();
    const def = defs.events[key];
    universe.event = { key, name:def.name, desc:def.desc, group:def.group, multiplier:def.multiplier, startedAt:now, endsAt:now+EVENT_DURATION_MS };
    universe.nextEventAt = null;
  }
}
function getPublicEventView(universe){
  if(!universe.event) return null;
  const e = universe.event;
  return { key:e.key, name:e.name, desc:e.desc, group:e.group, multiplier:e.multiplier, endsAt:e.endsAt };
}
function eventResourceMultiplier(universe, resource){
  if(!universe || !universe.event) return 1;
  const e = universe.event;
  if(e.group==='all') return e.multiplier;
  return (RESOURCE_INFO[resource] && RESOURCE_INFO[resource].group===e.group) ? e.multiplier : 1;
}

function createUniverse(){ const u = { accounts: {}, players: {}, alliances: {} }; ensureAuction(u); return u; }

function coordStr(c){ return '['+c[0]+':'+c[1]+':'+c[2]+']'; }
function coordLinkHtml(coord, label){ return `<button type="button" class="coord-link" data-coord="${coord[0]}:${coord[1]}:${coord[2]}">${label!=null?label:coordStr(coord)}</button>`; }
function validCoord(galaxy, system, pos){ return Number.isInteger(galaxy) && galaxy>=1 && galaxy<=UNIVERSE.galaxies && Number.isInteger(system) && system>=1 && system<=UNIVERSE.systems && Number.isInteger(pos) && pos>=1 && pos<=UNIVERSE.positions; }
function debrisKey(coord){ return coord[0]+':'+coord[1]+':'+coord[2]; }

// Deterministischer Planetentyp fuer eine Koordinate: dieselbe Position liefert
// immer denselben Typ (stabil ueber Neuladen/verschiedene Betrachter hinweg), analog
// zu npcSeedRandom weiter unten. Heimatwelten bei der Registrierung sind IMMER
// Gesteinsplaneten (Standard-Starttyp); Kolonien/NPC-Felder nutzen diese Funktion.
const PLANET_TYPE_KEYS = Object.keys(PLANET_TYPES);
function planetTypeSeedRandom(galaxy, system, pos){
  let x = Math.sin((pos*131 + system*13 + galaxy*104729) * 1777 + 31.41) * 10000;
  return x - Math.floor(x);
}
function planetTypeForCoord(galaxy, system, pos){
  const idx = Math.floor(planetTypeSeedRandom(galaxy, system, pos) * PLANET_TYPE_KEYS.length);
  return PLANET_TYPE_KEYS[Math.min(idx, PLANET_TYPE_KEYS.length-1)];
}

function createStarterEmpire(coord, name){
  const planetType = 'rocky';
  const startRes = zeroResources();
  for(const r of PLANET_TYPES[planetType].resources) startRes[r] = 500;
  const planet = {
    name: (name && String(name).trim()) || 'Heimatwelt',
    coords: coord,
    planetType,
    resources: startRes,
    buildings: {}, research: {}, ships: {},
    buildQueue: [], researchQueue: [], shipQueue: []
  };
  ensurePlanetDefaults(planet);
  return {
    timeScale: 20,
    now: Date.now(),
    planets: [planet],
    fleets: [],
    reports: [],
    messages: ['Willkommen bei Stellare Industrien! Dein Heimatplanet ('+PLANET_TYPES[planetType].name+') wurde bei '+coordStr(coord)+' gegründet.'],
    debrisFields: {},
    moons: [],
    allianceTag: null,
    officerExpiry: {},
    itemExpiry: {},
    darkMatter: 500,
    expeditions: [],
    lifeform: {active:'humans', points:0, buildings:{}, research:{}},
    marketRate: buildMarketRate(),
    logs: ['Imperium gegründet.'],
    mail: [],
  };
}
// Grundlegende Markt-Umrechnungskurse: seltenere/wertvollere Rohstoffe (Technologie-
// metalle, Uran) sind teurer als haeufige Erze; Wasser ist am guenstigsten.
function buildMarketRate(){
  const rate = {};
  for(const k of RESOURCE_KEYS){
    const g = RESOURCE_INFO[k].group;
    rate[k] = g==='ore' ? 1 : g==='special' ? 1.2 : g==='water' ? 0.6 : g==='tech' ? 3 : 2.5;
  }
  return rate;
}

// Finds which player (if any) owns a planet at the given coordinate.
function findPlanetOwner(universe, coord, excludeUsername){
  for(const [username, state] of Object.entries(universe.players)){
    if(username === excludeUsername) continue;
    const idx = state.planets.findIndex(pl=>!pl.destroyed && pl.coords[0]===coord[0] && pl.coords[1]===coord[1] && pl.coords[2]===coord[2]);
    if(idx>=0) return { username, planetIndex: idx };
  }
  return null;
}

// Deterministic NPC/empty layout, overlaid with real player planets for the viewer.
// Deterministic multi-stream PRNG for NPC flavor generation: same coords always
// produce the same NPC (stable across views/players), while different "salt"
// values give independent-looking numbers derived from the same seed.
function npcSeedRandom(galaxy, system, pos, salt){
  let x = Math.sin((pos*131 + system*13 + galaxy*104729) * 999 + salt*7919.13) * 10000;
  return x - Math.floor(x);
}

const npcNamePrefixes = ['Kolonie','Außenposten','Bergwerk','Zitadelle','Forschungsstation','Handelsposten','Bastion','Siedlung','Werft','Relais','Vorposten','Garnison'];
const npcNameSuffixes = ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Sigma','Omega','Prime','Nova','Vega','Orion','Rigel','Centauri','Draconis','Kepler','Cygnus','Andromeda','Pyxis'];
function npcPlanetName(galaxy, system, pos){
  const pIdx = Math.floor(npcSeedRandom(galaxy,system,pos,1)*npcNamePrefixes.length);
  const sIdx = Math.floor(npcSeedRandom(galaxy,system,pos,2)*npcNameSuffixes.length);
  return npcNamePrefixes[pIdx]+' '+npcNameSuffixes[sIdx];
}

// NPC-Gebaeude: nur Minen fuer Rohstoffe, die zum (deterministischen) Planetentyp
// dieser Koordinate passen, damit NPCs denselben Regeln folgen wie Spieler.
function npcBuildings(galaxy, system, pos, level, planetType){
  const r = (salt)=>npcSeedRandom(galaxy,system,pos,salt);
  const b = {};
  const resources = PLANET_TYPES[planetType].resources;
  resources.forEach((res, i)=>{
    const mineKey = MINE_BY_RESOURCE[res];
    if(mineKey) b[mineKey] = Math.max(1, Math.round(level*0.6 + r(10+i)*4));
  });
  b.solarPlant = Math.max(1, Math.round(level*0.6 + r(13)*3));
  b.robotFactory = Math.min(10, Math.max(0, Math.round(level/4)));
  b.shipyard = level>=8 ? Math.min(8, Math.max(1, Math.round(level/5))) : 0;
  b.researchLab = level>=8 ? Math.min(8, Math.max(1, Math.round(level/6))) : 0;
  b.oreStorage = Math.max(0, Math.round(level/5));
  b.techStorage = Math.max(0, Math.round(level/6));
  b.fuelStorage = Math.max(0, Math.round(level/7));
  b.missileSilo = level>=12 ? Math.min(6, Math.round(level/8)) : 0;
  return b;
}

function npcResearch(galaxy, system, pos, level){
  const res = {};
  const keys = Object.keys(defs.research);
  keys.forEach((k,i)=>{
    const base = Math.max(0, Math.floor(level/3) - 2);
    res[k] = Math.max(0, base + Math.floor(npcSeedRandom(galaxy,system,pos,60+i)*4));
  });
  return res;
}

function npcDefense(galaxy, system, pos, level){
  const r = (salt)=>npcSeedRandom(galaxy,system,pos,salt);
  const d = {};
  d.missileLauncher = Math.max(1, Math.round(level*3 + r(20)*level));
  if(level>=6) d.lightLaser = Math.max(1, Math.round(level*1.2 + r(21)*level*0.5));
  if(level>=12) d.heavyLaser = Math.max(1, Math.round(level*0.6 + r(22)*level*0.3));
  if(level>=16) d.ionCannon = Math.max(1, Math.round(level*0.3 + r(23)*level*0.2));
  if(level>=20) d.gaussCannon = Math.max(1, Math.round(level*0.15 + r(24)*level*0.1));
  if(level>=25) d.plasmaTurret = Math.max(1, Math.round(level*0.08 + r(25)*level*0.05));
  if(level>=22 && r(26)<0.3) d.smallShield = 1;
  if(level>=28 && r(27)<0.2) d.largeShield = 1;
  return d;
}

function npcFleet(galaxy, system, pos, level){
  const r = (salt)=>npcSeedRandom(galaxy,system,pos,salt);
  const f = {};
  f.lightFighter = Math.max(1, Math.round(level*1.5 + r(40)*level*0.5));
  if(level>=10) f.cruiser = Math.max(1, Math.round(level/4 + r(41)*level*0.1));
  if(level>=18) f.heavyFighter = Math.max(1, Math.round(level/6 + r(42)*level*0.08));
  if(level>=24) f.battleship = Math.max(1, Math.round(level/10 + r(43)*level*0.05));
  return f;
}

function seedGalaxy(universe, galaxy, system, viewerUsername){
  const occupied = {};
  for(const [username, state] of Object.entries(universe.players)){
    state.planets.forEach((pl, idx)=>{
      if(!pl.destroyed && pl.coords[0]===galaxy && pl.coords[1]===system) occupied[pl.coords[2]] = {username, planetIndex:idx, planet:pl};
    });
  }
  // Presence/level roll kept on the ORIGINAL single-seed formula so which positions
  // are NPC vs. empty never shifts for already-registered players; only the content
  // of each NPC (name/buildings/research/defense/fleet) is newly enriched below.
  const rnd = (seed)=>{ let x=Math.sin(seed*999+system*13+galaxy*104729)*10000; return x-Math.floor(x); };
  const slots = [];
  for(let pos=1; pos<=UNIVERSE.positions; pos++){
    const o = occupied[pos];
    const planetType = planetTypeForCoord(galaxy, system, pos);
    if(o){
      if(o.username===viewerUsername) slots.push({pos, type:'own', planet:o.planet});
      else slots.push({pos, type:'player', ownerUsername:o.username, planetName:o.planet.name, coords:o.planet.coords});
      continue;
    }
    const r = rnd(pos+system);
    if(r < 0.35){
      // Level uses its own wide, independent roll (3-35) so NPC strength actually
      // spans the full tier range; only the presence check above (r<0.35) is kept
      // on the original formula to avoid shifting which positions are occupied.
      const level = Math.max(3, Math.min(35, Math.floor(3 + npcSeedRandom(galaxy,system,pos,0)*33)));
      const name = npcPlanetName(galaxy, system, pos);
      const buildings = npcBuildings(galaxy, system, pos, level, planetType);
      const research = npcResearch(galaxy, system, pos, level);
      const defenseShips = npcDefense(galaxy, system, pos, level);
      const fleet = npcFleet(galaxy, system, pos, level);
      const resAmounts = zeroResources();
      PLANET_TYPES[planetType].resources.forEach(res=>{ resAmounts[res] = Math.floor(150*level); });
      slots.push({pos, type:'npc', name, level, planetType, resources:resAmounts, buildings, research, defenseShips, fleet});
    } else {
      slots.push({pos, type:'empty', planetType});
    }
  }
  return slots;
}

function isPositionFree(universe, galaxy, system, pos){
  if(!validCoord(galaxy, system, pos)) return false;
  if(findPlanetOwner(universe, [galaxy,system,pos], null)) return false;
  const slots = seedGalaxy(universe, galaxy, system, null);
  const slot = slots.find(s=>s.pos===pos);
  return !!slot && slot.type==='empty';
}

function registerAccount(universe, username, passwordHash, coord, planetName){
  username = String(username||'').trim();
  if(!/^[A-Za-z0-9_\-]{3,20}$/.test(username)) return { ok:false, error:'Benutzername muss 3-20 Zeichen sein (Buchstaben, Zahlen, _ -)' };
  if(universe.accounts[username]) return { ok:false, error:'Benutzername bereits vergeben' };
  const [gal, sys, pos] = coord;
  if(!validCoord(gal, sys, pos)) return { ok:false, error:'Ungültige Koordinaten' };
  if(!isPositionFree(universe, gal, sys, pos)) return { ok:false, error:'Diese Position ist bereits belegt' };
  universe.accounts[username] = { salt: passwordHash.salt, hash: passwordHash.hash, isAdmin:false, createdAt: Date.now() };
  universe.players[username] = createStarterEmpire([gal,sys,pos], planetName);
  return { ok:true };
}

function computeHighscore(universe){
  return Object.entries(universe.players)
    .map(([username, state])=>{
      const b = totalPlayerPointsBreakdown(state);
      return { username, points: totalPlayerPoints(state), planets: state.planets.filter(p=>!p.destroyed).length,
        buildingPoints: b.buildings, researchPoints: b.research, fleetPoints: b.fleet, defensePoints: b.defense };
    })
    .sort((a,b)=>b.points-a.points);
}

function adminListPlayers(universe){
  return Object.entries(universe.players).map(([username, state])=>({
    username,
    planets: state.planets.length,
    points: totalPlayerPoints(state),
    darkMatter: state.darkMatter,
    createdAt: universe.accounts[username] ? universe.accounts[username].createdAt : null,
    homeCoords: state.planets[0] ? state.planets[0].coords : null,
  })).sort((a,b)=>b.points-a.points);
}
function adminDeletePlayer(universe, username){
  username = String(username||'').trim();
  if(universe.accounts[username] && universe.accounts[username].isAdmin) return { ok:false, error:'Admin-Konto kann nicht gelöscht werden' };
  if(!universe.players[username]) return { ok:false, error:'Spieler nicht gefunden' };
  removePlayerFromAlliance(universe, username);
  delete universe.players[username];
  delete universe.accounts[username];
  return { ok:true };
}
function adminGrantResources(universe, username, res){
  username = String(username||'').trim();
  const state = universe.players[username];
  if(!state) return { ok:false, error:'Spieler nicht gefunden' };
  const p = state.planets[0];
  if(!p) return { ok:false, error:'Spieler hat keinen Planeten' };
  const grant = {};
  for(const k of RESOURCE_KEYS){ if(res[k]!=null) grant[k] = Number(res[k])||0; }
  addRes(p, grant);
  log(state, 'Admin hat Ressourcen gutgeschrieben');
  return { ok:true };
}

function log(state, msg){ state.logs.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.logs = state.logs.slice(0,10); }
function message(state, msg){ state.messages.unshift(new Date().toLocaleTimeString('de-DE')+' · '+msg); state.messages = state.messages.slice(0,20); }
function fail(state, msg){ log(state, msg); return { ok:false, message: msg }; }
function ok(state, msg){ if(msg) log(state, msg); return { ok:true, message: msg }; }

function meetsRequirements(p, req){
  if(!req) return true;
  for(const [k,v] of Object.entries(req)){
    const have = p.buildings[k]!=null ? p.buildings[k] : (p.research[k]!=null ? p.research[k] : 0);
    if(have<v) return false;
  }
  return true;
}
// Prueft zusaetzlich, ob ein Gebaeude (typischerweise eine Mine) ueberhaupt auf dem
// Planetentyp von p gebaut werden darf - unabhaengig von Stufen-Anforderungen.
function meetsPlanetType(p, def){
  if(!def.resource) return true; // kein Abbaugebaeude -> kein Typ-Zwang
  const allowed = planetTypesForResource(def.resource);
  return allowed.length===0 || allowed.includes(p.planetType);
}
function requirementText(req){ if(!req) return ''; return Object.entries(req).map(([k,v])=>{ const nm = defs.buildings[k]?defs.buildings[k].name:(defs.research[k]?defs.research[k].name:k); return nm+' Stufe '+v; }).join(', '); }
function addDebris(state, coord, resBag){
  const key=debrisKey(coord);
  const cur = state.debrisFields[key] || {coord, ...zeroResources()};
  for(const k of RESOURCE_KEYS) cur[k] = (cur[k]||0) + (resBag[k]||0);
  state.debrisFields[key]=cur;
}
function officerActive(state, key){ return !!(state.officerExpiry[key] && state.officerExpiry[key] > Date.now()); }
function officerBonus(state){ return officerActive(state,'geologist') ? 1.10 : 1.0; }
function fleetSpeedBonus(state){ let m=officerActive(state,'admiral') ? 1.1 : 1.0; if(itemActive(state,'speedBooster')) m*=1.3; return m; }
function engineerBonus(state){ return officerActive(state,'engineer') ? 1.10 : 1.0; }
function commanderDiscount(state){ return officerActive(state,'commander') ? 0.95 : 1.0; }
function technocratSpeed(state){ return officerActive(state,'technocrat') ? 0.85 : 1.0; }
function pathfinderBonus(shipMap){ return (shipMap && shipMap.pathfinder>0) ? 1.1 : 1.0; }
function networkSpeed(p){ const lvl=(p.research.intergalacticNetwork)||0; return Math.max(0.5, 1-0.02*lvl); }
function buildingCost(state, base, level){ const c=scaledCost(base, level); const d=commanderDiscount(state); const r={}; for(const k of RESOURCE_KEYS) r[k]=Math.floor((c[k]||0)*d); return r; }
function maxColonies(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor((lvl+1)/2); }
function maxExpeditions(p){ const lvl=(p.research.astrophysics)||0; return 1+Math.floor(lvl/2); }
function moonChanceFromDebris(debrisTotal){ return Math.min(0.20, Math.floor(debrisTotal/50000)*0.01); }
function maybeCreateMoon(state, coord, debrisTotal){
  const chance = moonChanceFromDebris(debrisTotal);
  if(Math.random()<chance){
    const exists = state.moons.find(m=>m.coord[0]===coord[0]&&m.coord[1]===coord[1]&&m.coord[2]===coord[2]);
    if(!exists){
      const moonShips = {}; Object.keys(defs.ships).forEach(k=>moonShips[k]=0);
      state.moons.push({coord:[...coord], size: Math.floor(2000+Math.random()*5000), buildings:{lunarBase:0, sensorPhalanx:0, jumpGate:0}, buildQueue:[], ships:moonShips});
      message(state, 'Ein Mond ist bei '+coordLinkHtml(coord)+' entstanden.');
    }
  }
}
function allianceRank(points){ if(points>=2000000) return 'Elite-Kommandant'; if(points>=500000) return 'Kommandeur'; if(points>=100000) return 'Veteran'; if(points>=10000) return 'Krieger'; return 'Rekrut'; }
function deathStarDestroyChance(count){ return Math.min(0.7, count*0.01); }
// Markiert den Planeten als zerstoert, OHNE ihn aus dem planets-Array zu entfernen - viele
// Stellen im Code (in transit befindliche Flotten, activePlanet, planetIndex in Aktionen)
// adressieren Planeten ueber ihren rohen Array-Index; ein echtes Herausloeschen wuerde alle
// nachfolgenden Indizes verschieben und bestehende Referenzen korrumpieren. Koordinate und
// Feld werden dadurch wieder frei fuer eine Neukolonisierung (siehe findPlanetOwner/seedGalaxy).
function destroyPlanet(state, planetIndex){
  const p = state.planets[planetIndex];
  if(!p || p.destroyed) return;
  const coord = p.coords;
  p.destroyed = true;
  p.resources = zeroResources();
  Object.keys(p.buildings).forEach(k=>{ p.buildings[k]=0; });
  Object.keys(p.research).forEach(k=>{ p.research[k]=0; });
  Object.keys(p.ships).forEach(k=>{ p.ships[k]=0; });
  p.buildQueue = []; p.researchQueue = []; p.shipQueue = [];
  state.moons = state.moons.filter(m=>!(m.coord[0]===coord[0] && m.coord[1]===coord[1] && m.coord[2]===coord[2]));
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
function extractDefense(buildings){ const result={}; for(const [k,d] of Object.entries(defs.buildings)){ if(d.isDefense && buildings[k]) result[k]=buildings[k]; } return result; }
// Aggregierte Angriffs-/Schild-/Huellenwerte aus Flotte + Verteidigung kombiniert, fuer den
// Kampfsimulator im Spionagebericht - bewusst nur die Summe, keine Aufschluesselung nach
// Einheitentyp, damit kein zusaetzliches Detail ueber die Spionageabwehr-Mechanik hinaus preisgegeben wird.
function combinedDefenderPower(fleetShips, defenseShips){
  const f = sidePower(fleetShips, defs.ships);
  const d = sidePower(defenseShips, defs.buildings);
  return {attack: f.attack+d.attack, shield: f.shield+d.shield, hull: f.hull+d.hull};
}
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
function shipCostSum(shipMap, resource){ let sum=0; for(const [k,v] of Object.entries(shipMap||{})){ if(v && defs.ships[k]) sum += (defs.ships[k].cost[resource]||0)*v; } return sum; }
// Verlustwert eines Schiffsverbands ueber ALLE 18 Rohstoffe hinweg (fuer Truemmerfeld-Beitrag).
function shipCostBag(shipMap){ const bag=zeroResources(); for(const k of RESOURCE_KEYS) bag[k]=shipCostSum(shipMap,k); return bag; }
function mergeShipMaps(list){ const result={}; for(const m of list){ for(const [k,v] of Object.entries(m||{})){ result[k]=(result[k]||0)+(v||0); } } return result; }
// ACS (Allianz-Kampfstärke): findet eine bereits unterwegs befindliche Angriffsflotte mit
// derselben acsId + Ziel, ueber ALLE Spieler hinweg (nicht nur den eigenen Zustand), damit
// mehrere Allianzmitglieder ihre Flotten auf dieselbe Ankunftszeit synchronisieren koennen.
function findAcsWave(universe, acsId, toCoord){
  for(const state of Object.values(universe.players)){
    for(const f of state.fleets){
      if(f.phase==='outbound' && f.mission==='attack' && f.acsId===acsId && f.toCoord[0]===toCoord[0] && f.toCoord[1]===toCoord[1] && f.toCoord[2]===toCoord[2]) return f;
    }
  }
  return null;
}

function scaledCost(base, level){ const mult=Math.pow(1.6, level-1); const r={}; for(const k of RESOURCE_KEYS){ r[k]=Math.floor((base[k]||0)*mult); } return r; }
function hasRes(p,c){ for(const k of RESOURCE_KEYS){ if((p.resources[k]||0) < (c[k]||0)) return false; } return true; }
function spend(p,c){ for(const k of RESOURCE_KEYS){ p.resources[k] = (p.resources[k]||0) - (c[k]||0); } }
function addRes(p,c){ for(const k of RESOURCE_KEYS){ p.resources[k] = (p.resources[k]||0) + (c[k]||0); } }
function fusionDeutUse(p){ return (p.buildings.nuclearReactor) ? defs.buildings.nuclearReactor.uraniumUse(p.buildings.nuclearReactor) : 0; }
function energyStats(state, p){
  const solar=defs.buildings.solarPlant.power(p.buildings.solarPlant);
  const nuclear=defs.buildings.nuclearReactor.power(p.buildings.nuclearReactor||0);
  const satellites=(p.ships.solarSatellite||0)*20;
  const prod=(solar+nuclear+satellites)*engineerBonus(state);
  let use=0;
  for(const [res, mineKey] of Object.entries(MINE_BY_RESOURCE)){
    if(defs.buildings[mineKey].powerUse) use += defs.buildings[mineKey].powerUse(p.buildings[mineKey]||0);
  }
  return {prod,use,ratio: use? Math.min(1,prod/use):1};
}
function lifeformBoost(state, resource){
  let mult = 1;
  const lf = state.lifeform;
  if(!lf) return mult;
  const group = RESOURCE_INFO[resource] && RESOURCE_INFO[resource].group;
  for(const [key,def] of Object.entries(defs.lifeformBuildings)){
    if(def.species===lf.active && def.boostsGroup===group){
      const lvl = (lf.buildings && lf.buildings[key]) || 0;
      mult += lvl*0.02;
    }
  }
  return mult;
}
function itemGroupBoost(state, resource){
  const group = RESOURCE_INFO[resource] && RESOURCE_INFO[resource].group;
  for(const [key,def] of Object.entries(defs.items)){
    if(def.group===group && itemActive(state,key)) return 1.5;
  }
  return 1;
}
// Produktion pro Stunde fuer ALLE 18 Rohstoffe: nur Minen, die tatsaechlich auf dem
// Planetentyp existieren (also je gebaut werden konnten), liefern einen Ertrag > 0.
function hourly(state, p, universe){
  const e=energyStats(state, p).ratio; const bonus=officerBonus(state);
  const inc = zeroResources();
  for(const res of PLANET_TYPES[p.planetType].resources.concat(p.buildings.sawmill ? ['wood'] : [])){
    const mineKey = MINE_BY_RESOURCE[res];
    const lvl = p.buildings[mineKey]||0;
    if(!lvl) continue;
    const boost = itemGroupBoost(state,res) * lifeformBoost(state,res) * eventResourceMultiplier(universe,res);
    inc[res] = defs.buildings[mineKey].prod(lvl)*e*bonus*boost;
  }
  inc.uranium -= fusionDeutUse(p);
  return inc;
}
function maxStorage(p){
  const cap = {};
  for(const k of RESOURCE_KEYS){
    const group = RESOURCE_INFO[k].group;
    const storageKey = RESOURCE_GROUPS[group].storageBuilding;
    cap[k] = Math.max(5000, 5000*(p.buildings[storageKey]||0));
  }
  return cap;
}
function capacityForShips(shipMap){ let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].cargo*v; } return total; }
function fuelForShips(shipMap){ let total=0; for(const [k,v] of Object.entries(shipMap)){ total += defs.ships[k].fuel*v; } return total; }
function fleetSpeed(shipMap){ const vals=Object.entries(shipMap).filter(([,v])=>v>0).map(([k])=>defs.ships[k].speed); return vals.length?Math.min(...vals):1; }
function distanceBetween(a,b){ return Math.abs(a[0]-b[0])*15000 + Math.abs(a[1]-b[1])*20 + Math.abs(a[2]-b[2]) + 5; }
function fleetDuration(state, fromCoord,toCoord,shipMap){ const speed=fleetSpeed(shipMap)*fleetSpeedBonus(state)*pathfinderBonus(shipMap); const distance=distanceBetween(fromCoord,toCoord); return Math.max(10, Math.round((distance*3)/speed)); }
function computePoints(p){
  let total=0;
  for(const [k,lvl] of Object.entries(p.buildings)){ const def=defs.buildings[k]; if(!def||!lvl) continue; const base=costBaseFor(def,p); for(let l=1;l<=lvl;l++){ total+=resTotal(scaledCost(base,l)); } }
  for(const [k,lvl] of Object.entries(p.research)){ const def=defs.research[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ total+=resTotal(scaledCost(def.base,l)); } }
  for(const [k,v] of Object.entries(p.ships)){ if(defs.ships[k] && v) total += resTotal(defs.ships[k].cost)*v; }
  return total;
}
// Wie computePoints(), aber nach OGame-Ranglisten-Kategorien aufgeschluesselt statt einer
// einzelnen Summe: Gebaeude (ohne Verteidigung), Verteidigung (isDefense-Gebaeude eigens),
// Forschung, Flotte (Schiffe).
function computePointsBreakdown(p){
  let buildings=0, defense=0, research=0, fleet=0;
  for(const [k,lvl] of Object.entries(p.buildings)){
    const def=defs.buildings[k]; if(!def||!lvl) continue;
    const base=costBaseFor(def,p);
    let sum=0; for(let l=1;l<=lvl;l++){ sum+=resTotal(scaledCost(base,l)); }
    if(def.isDefense) defense+=sum; else buildings+=sum;
  }
  for(const [k,lvl] of Object.entries(p.research)){ const def=defs.research[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ research+=resTotal(scaledCost(def.base,l)); } }
  for(const [k,v] of Object.entries(p.ships)){ if(defs.ships[k] && v) fleet += resTotal(defs.ships[k].cost)*v; }
  return {buildings, defense, research, fleet};
}
function totalPlayerPointsBreakdown(state){
  const sum = {buildings:0, defense:0, research:0, fleet:0};
  for(const p of state.planets){
    if(p.destroyed) continue;
    const b = computePointsBreakdown(p);
    sum.buildings+=b.buildings; sum.defense+=b.defense; sum.research+=b.research; sum.fleet+=b.fleet;
  }
  const buildings=Math.floor(sum.buildings/1000), defense=Math.floor(sum.defense/1000), research=Math.floor(sum.research/1000), fleet=Math.floor(sum.fleet/1000);
  return {buildings, defense, research, fleet, total: buildings+defense+research+fleet};
}
function totalPlayerPoints(state){ return Math.floor(state.planets.filter(p=>!p.destroyed).reduce((s,p)=>s+computePoints(p),0)/1000); }

// Alte Schluessel (aus frueheren Umbenennungen von Schiffstypen), die noch in
// gespeicherten Daten vorkommen koennen, obwohl defs.ships sie nicht mehr kennt.
// Ohne diese Migration wuerde jeder Client-Code, der ueber Object.entries(ships)
// iteriert und defs.ships[key].name nachschlaegt, mit einer stehengebliebenen
// alten Stueckzahl abstuerzen ("Cannot read properties of undefined").
const LEGACY_SHIP_KEY_MIGRATIONS = { researchShip: 'researchProbe' };
function migrateShipKeys(ships){
  if(!ships) return;
  for(const [oldKey, newKey] of Object.entries(LEGACY_SHIP_KEY_MIGRATIONS)){
    if(ships[oldKey]!=null){
      ships[newKey] = (ships[newKey]||0) + ships[oldKey];
      delete ships[oldKey];
    }
  }
}
// Migriert ein Ressourcenobjekt vom alten {metal,crystal,deut}-Schema (oder einem
// bereits-aber-unvollstaendigen neuen Schema) auf das vollstaendige 18-Schluessel-Schema.
// Alte Bestaende werden ueber cv() grob in die neuen Rohstoffe umgerechnet, damit
// bestehende Spielstaende beim Laden nicht auf 0 zurueckfallen.
function migrateResources(res){
  if(!res) return zeroResources();
  const hasAnyNewKey = RESOURCE_KEYS.some(k=>res[k]!=null);
  if(hasAnyNewKey){
    const full = zeroResources();
    for(const k of RESOURCE_KEYS) full[k] = res[k]||0;
    return full;
  }
  if(res.metal!=null || res.crystal!=null || res.deut!=null){
    return cv({metal:res.metal||0, crystal:res.crystal||0, deut:res.deut||0});
  }
  return zeroResources();
}
function ensurePlanetDefaults(p){
  migrateShipKeys(p.ships);
  p.resources = migrateResources(p.resources);
  if(!p.planetType || !PLANET_TYPES[p.planetType]) p.planetType = planetTypeForCoord(p.coords[0], p.coords[1], p.coords[2]);
  Object.keys(defs.buildings).forEach(k=>{ if(p.buildings[k]==null) p.buildings[k]=0; });
  Object.keys(defs.research).forEach(k=>{ if(p.research[k]==null) p.research[k]=0; });
  Object.keys(defs.ships).forEach(k=>{ if(p.ships[k]==null) p.ships[k]=0; });
  if(!p.buildQueue) p.buildQueue=[]; if(!p.researchQueue) p.researchQueue=[]; if(!p.shipQueue) p.shipQueue=[];
}
function ensureMoonDefaults(m){ migrateShipKeys(m.ships); ['lunarBase','sensorPhalanx','jumpGate'].forEach(k=>{ if(m.buildings[k]==null) m.buildings[k]=0; }); Object.keys(defs.ships).forEach(k=>{ if(m.ships[k]==null) m.ships[k]=0; }); if(!m.buildQueue) m.buildQueue=[]; }
function ensureDebrisFieldDefaults(field){
  if(!field) return field;
  const hasAnyNewKey = RESOURCE_KEYS.some(k=>field[k]!=null);
  if(!hasAnyNewKey && (field.metal!=null || field.crystal!=null)){
    const converted = cv({metal:field.metal||0, crystal:field.crystal||0, deut:0});
    for(const k of RESOURCE_KEYS) field[k]=converted[k]||0;
  } else {
    for(const k of RESOURCE_KEYS){ if(field[k]==null) field[k]=0; }
  }
  return field;
}
function ensureAllDefaults(state){
  if(!state.planets) state.planets=[];
  if(!state.moons) state.moons=[];
  if(!state.officerExpiry) state.officerExpiry={};
  if(!state.itemExpiry) state.itemExpiry={};
  if(!state.marketRate || RESOURCE_KEYS.some(k=>state.marketRate[k]==null)) state.marketRate=buildMarketRate();
  if(state.darkMatter==null) state.darkMatter=0;
  if(!state.expeditions) state.expeditions=[];
  if(!state.lifeform) state.lifeform={active:'humans',points:0,buildings:{},research:{}};
  if(state.allianceTag===undefined) state.allianceTag = null;
  if(!state.logs) state.logs=[];
  if(!state.messages) state.messages=[];
  if(!state.mail) state.mail=[];
  if(!state.reports) state.reports=[];
  if(!state.fleets) state.fleets=[];
  if(!state.debrisFields) state.debrisFields={};
  if(state.now==null) state.now=Date.now();
  if(state.timeScale==null) state.timeScale=20;
  state.planets.forEach(ensurePlanetDefaults);
  state.moons.forEach(ensureMoonDefaults);
  state.fleets.forEach(f=>{ migrateShipKeys(f.ships); if(f.cargo) f.cargo=migrateResources(f.cargo); });
  state.expeditions.forEach(e=>migrateShipKeys(e.ships));
  Object.values(state.debrisFields).forEach(ensureDebrisFieldDefaults);
}

function normalizePlayerState(data){
  const fresh = createStarterEmpire([1,1,1], 'Heimatwelt');
  const state = {
    timeScale: 20,
    now: Date.now(),
    planets: data.planets || fresh.planets,
    fleets: data.fleets || [],
    reports: data.reports || [],
    messages: data.messages || fresh.messages,
    debrisFields: data.debrisFields || {},
    moons: data.moons || [],
    // Ein wiederhergestelltes Backup wird immer unabhängig: eine fremde/veraltete Allianz-
    // Mitgliedschaft aus der Backup-Datei koennte nicht mehr zur universe.alliances-Registry
    // passen (Allianz existiert nicht mehr, Konto ist bereits Mitglied einer anderen usw.).
    allianceTag: null,
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

function normalizeUniverse(data){
  const universe = { accounts: (data && data.accounts) || {}, players: {}, alliances: (data && data.alliances) || {}, auction: (data && data.auction) || null, event: (data && data.event) || null, nextEventAt: (data && data.nextEventAt) || null };
  const playersData = (data && data.players) || {};
  for(const [username, pstate] of Object.entries(playersData)){
    ensureAllDefaults(pstate);
    universe.players[username] = pstate;
  }
  ensureAuction(universe);
  return universe;
}

// ---- Action handlers (operate on a single player's empire state) ----

function requirePlanet(state, planetIndex){
  const p = state.planets[planetIndex];
  if(!p) throw new Error('Ungültiger Planet');
  return p;
}

function enqueueBuild(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.buildings[key];
  if(!def) return fail(state, 'Unbekanntes Gebäude');
  if(!meetsPlanetType(p, def)) return fail(state, def.name+' kann auf diesem Planetentyp ('+PLANET_TYPES[p.planetType].name+') nicht gebaut werden');
  if(!meetsRequirements(p, def.requires)) return fail(state, def.name+' benötigt: '+requirementText(def.requires));
  const lvl = p.buildings[key]+1;
  const cost = buildingCost(state, costBaseFor(def,p), lvl);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(8, Math.round(resTotal(cost)/(250*(1+p.buildings.robotFactory))));
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
  const secs = Math.max(12, Math.round(resTotal(cost)/(220*(1+p.buildings.researchLab))*technocratSpeed(state)*networkSpeed(p)));
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
  const secs = Math.max(6, Math.round(resTotal(cost)/(300*(1+p.buildings.shipyard))));
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
  const cost = {}; for(const k of RESOURCE_KEYS) cost[k]=Math.floor((def.base[k]||0)*d);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  const secs = Math.max(5, Math.round(resTotal(cost)/(300*(1+p.buildings.shipyard))));
  p.buildQueue.push({type:'defense', key, name:def.name, done:Date.now()+secs*1000});
  return ok(state, def.name+' in Bau');
}

function sendFleet(universe, username, planetIndex, params){
  const state = universe.players[username];
  const p = requirePlanet(state, planetIndex);
  const mission = params.mission;
  if(!missionLabels[mission]) return fail(state, 'Unbekannte Mission');
  const gal = Number(params.gal), sys = Number(params.sys), pos = Number(params.pos);
  if(!validCoord(gal,sys,pos)) return fail(state, 'Ungültiges Ziel: Galaxie (1-'+UNIVERSE.galaxies+'), System (1-'+UNIVERSE.systems+') und Position (1-'+UNIVERSE.positions+') angeben');
  const toCoord = [gal, sys, pos];
  const ownIdx = state.planets.findIndex(pl=>pl.coords[0]===gal && pl.coords[1]===sys && pl.coords[2]===pos);
  if(mission==='attack' && ownIdx>=0) return fail(state, 'Eigene Planeten können nicht angegriffen werden');
  let toPlanetIndex=null, toOwner=null, npcSlot=null, emptySlot=null;
  if(ownIdx>=0) toPlanetIndex = ownIdx;
  else {
    const owner = findPlanetOwner(universe, toCoord, username);
    if(owner){ toPlanetIndex = owner.planetIndex; toOwner = owner.username; }
    else {
      const slots = seedGalaxy(universe, gal, sys, username); const slot = slots.find(s=>s.pos===pos);
      if(slot.type==='npc') npcSlot = slot; else if(slot.type==='empty') emptySlot = slot;
    }
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

  const cargo = zeroResources();
  const cargoParam = params.cargo||{};
  for(const k of RESOURCE_KEYS) cargo[k] = Number(cargoParam[k])||0;
  const cap = capacityForShips(ships); const totalCargo = resTotal(cargo);
  if(mission==='transport' && totalCargo>cap) return fail(state, 'Zu wenig Ladekapazität');
  const dur = fleetDuration(state, p.coords, toCoord, ships);
  // Treibstoff (Rohöl) wird zusaetzlich zu evtl. mitgefuehrtem Rohöl-Frachtgut benoetigt.
  const fuel = fuelForShips(ships)*Math.max(1,dur/20);
  if(cargo.crudeOil+fuel>p.resources.crudeOil) return fail(state, 'Zu wenig Rohöl für Ladung und Flug');
  for(const k of RESOURCE_KEYS){ if(k==='crudeOil') continue; if(cargo[k]>p.resources[k]) return fail(state, 'Nicht genug Ressourcen zum Versenden'); }

  // ACS (Allianz-Kampfstärke): mehrere Angriffsflotten auf denselben ACS-Code + dasselbe
  // Ziel synchronisieren ihre Ankunft, damit sie gemeinsam als eine Streitmacht kämpfen.
  // Beitritt erfordert dieselbe echte Allianzmitgliedschaft wie die Welle (state.allianceTag).
  let arrive = Date.now()+dur*1000;
  let acsId = null, acsAllianceTag = null;
  if(mission==='attack' && params.acsId){
    acsId = String(params.acsId).trim().slice(0,24);
    if(acsId){
      const existing = findAcsWave(universe, acsId, toCoord);
      const myTag = state.allianceTag || '-';
      if(existing){
        if(myTag==='-' || existing.acsAllianceTag==='-' || existing.acsAllianceTag!==myTag){
          return fail(state, 'Beitritt zur ACS-Welle "'+acsId+'" nicht möglich: Allianz-Tag stimmt nicht mit dem der Welle überein.');
        }
        if(arrive>existing.arrive) return fail(state, 'Deine Flotte ist zu langsam, um die ACS-Welle "'+acsId+'" rechtzeitig zu erreichen.');
        arrive = existing.arrive;
      }
      acsAllianceTag = myTag;
    } else acsId = null;
  }

  for(const [k,v] of Object.entries(ships)) p.ships[k]-=v;
  if(mission==='transport'){ spend(p, cargo); }
  p.resources.crudeOil-=fuel;

  state.fleets.push({from:planetIndex, toCoord, toPlanetIndex, toOwner, npcSlot, emptySlot, ships, cargo:mission==='transport'?cargo:zeroResources(), mission, arrive, returnAt:Date.now()+dur*2000, phase:'outbound', fuel, acsId, acsAllianceTag});
  const acsNote = acsId ? ' (ACS-Welle "'+acsId+'", Ankunft synchronisiert)' : '';
  return ok(state, missionLabels[mission]+'-Flotte nach '+coordLinkHtml(toCoord)+' gestartet'+acsNote);
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
  if(roll<0.30){
    const gain = zeroResources();
    const resPool = PLANET_TYPES[p.planetType].resources;
    resPool.forEach(r=>{ gain[r]=Math.floor(Math.random()*8000); });
    addRes(p,gain);
    message(state, 'Expedition erfolgreich: '+resTotal(gain)+' Ressourcen gefunden.');
  }
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
  const secs = Math.max(10, Math.round(resTotal(cost)/300));
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
const PHALANX_SCAN_COST = {crudeOil: 5000};
function scanSystem(universe, username, payload){
  const state = universe.players[username];
  const moon = state.moons[Number(payload.moonIndex)];
  if(!moon) return fail(state, 'Kein Mond ausgewählt');
  const level = moon.buildings.sensorPhalanx||0;
  if(level<1) return fail(state, 'Die Sensorphalanx muss mindestens Stufe 1 haben');
  const gal=Number(payload.gal), sys=Number(payload.sys), pos=Number(payload.pos);
  if(!validCoord(gal,sys,pos)) return fail(state, 'Ungültiges Ziel');
  const range = level*3;
  if(gal!==moon.coord[0] || Math.abs(sys-moon.coord[1])>range) return fail(state, 'Ziel außerhalb der Reichweite (max. '+range+' Systeme, gleiche Galaxie wie der Mond)');
  const p = requirePlanet(state, Number(payload.planetIndex));
  if(!hasRes(p,PHALANX_SCAN_COST)) return fail(state, 'Nicht genug Rohöl für den Scan ('+PHALANX_SCAN_COST.crudeOil+' benötigt)');
  spend(p,PHALANX_SCAN_COST);
  const now = Date.now();
  const movements = [];
  for(const [otherUsername, otherState] of Object.entries(universe.players)){
    for(const f of otherState.fleets){
      if(f.phase!=='outbound') continue;
      const shipTotal = Object.values(f.ships).reduce((a,b)=>a+b,0);
      if(f.toCoord[0]===gal && f.toCoord[1]===sys && f.toCoord[2]===pos){
        movements.push({username:otherUsername, mission:f.mission, direction:'incoming', etaSeconds:Math.max(0,Math.round((f.arrive-now)/1000)), shipTotal});
      }
      const originPlanet = otherState.planets[f.from];
      if(originPlanet && originPlanet.coords[0]===gal && originPlanet.coords[1]===sys && originPlanet.coords[2]===pos){
        movements.push({username:otherUsername, mission:f.mission, direction:'outgoing', etaSeconds:Math.max(0,Math.round((f.arrive-now)/1000)), shipTotal, toCoordArr:f.toCoord});
      }
    }
  }
  state.reports.unshift({type:'phalanx', time:new Date().toLocaleTimeString('de-DE'), target:coordStr([gal,sys,pos]), coordArr:[gal,sys,pos], movements});
  log(state, 'Sensorphalanx-Scan bei '+coordStr([gal,sys,pos])+' durchgeführt ('+movements.length+' Flottenbewegung(en) entdeckt)');
  return ok(state, 'Scan abgeschlossen: '+movements.length+' Flottenbewegung(en) gefunden');
}
const MAIL_MAX_LEN = 1000;
const MAIL_MAX_ENTRIES = 50;
function sendDirectMessage(universe, username, payload){
  const state = universe.players[username];
  const toUsername = String(payload.toUsername||'').trim();
  if(!toUsername) return fail(state, 'Kein Empfänger angegeben');
  if(toUsername===username) return fail(state, 'Du kannst dir selbst keine Nachricht senden');
  const recipient = universe.players[toUsername];
  if(!recipient) return fail(state, 'Spieler "'+toUsername+'" wurde nicht gefunden');
  const text = String(payload.text||'').trim();
  if(!text) return fail(state, 'Nachricht darf nicht leer sein');
  if(text.length>MAIL_MAX_LEN) return fail(state, 'Nachricht zu lang (max. '+MAIL_MAX_LEN+' Zeichen)');
  const time = new Date().toLocaleTimeString('de-DE');
  if(!recipient.mail) recipient.mail=[];
  if(!state.mail) state.mail=[];
  recipient.mail.unshift({from:username, to:toUsername, text, time, direction:'in', read:false});
  recipient.mail = recipient.mail.slice(0, MAIL_MAX_ENTRIES);
  state.mail.unshift({from:username, to:toUsername, text, time, direction:'out', read:true});
  state.mail = state.mail.slice(0, MAIL_MAX_ENTRIES);
  return ok(state, 'Nachricht an '+toUsername+' gesendet');
}
function markMailRead(state){
  (state.mail||[]).forEach(m=>{ if(m.direction==='in') m.read=true; });
  return ok(state);
}
function depositAlliance(universe, username, planetIndex){
  const state = universe.players[username];
  const p = requirePlanet(state, planetIndex);
  const tag = state.allianceTag;
  if(!tag) return fail(state, 'Du bist in keiner Allianz');
  const alliance = universe.alliances[tag];
  if(!alliance) return fail(state, 'Allianz nicht gefunden');
  const amt = {};
  for(const k of RESOURCE_KEYS) amt[k] = Math.min(1000, p.resources[k]||0);
  spend(p, amt);
  if(!alliance.depot) alliance.depot = zeroResources();
  for(const k of RESOURCE_KEYS) alliance.depot[k] = (alliance.depot[k]||0) + amt[k];
  return ok(state, 'Ressourcen ins Allianzdepot eingezahlt');
}

// ---- Echte, universumsweite Allianzen (wie im echten OGame) ----
// universe.alliances ist eine Registry {tag: {tag, name, founder, members:[...], applications:[...], depot, createdAt}}.
// state.allianceTag zeigt auf den Tag der eigenen Allianz (oder null, wenn unabhaengig).
const ALLIANCE_MIN_POINTS = 1000;
const ALLIANCE_FOUND_COST = addCost(cv({metal:5000,crystal:5000,deut:2000}),{});
const ALLIANCE_TAG_RE = /^[A-Za-z0-9]{2,5}$/;
const ALLIANCE_NAME_MAX_LEN = 30;

function getAllianceView(universe, tag){
  const a = universe.alliances[tag];
  if(!a) return null;
  const points = a.members.reduce((sum,m)=> sum + (universe.players[m] ? totalPlayerPoints(universe.players[m]) : 0), 0);
  return { tag:a.tag, name:a.name, founder:a.founder, members:[...a.members], applications:[...a.applications], depot:{...a.depot}, points, createdAt:a.createdAt };
}
function getPlayerAllianceView(universe, username){
  const state = universe.players[username];
  if(!state || !state.allianceTag) return null;
  const view = getAllianceView(universe, state.allianceTag);
  if(!view) return null;
  view.isFounder = view.founder===username;
  return view;
}
function getAlliancesListView(universe){
  return Object.values(universe.alliances).map(a=>({
    tag:a.tag, name:a.name, memberCount:a.members.length,
    points: a.members.reduce((sum,m)=> sum + (universe.players[m] ? totalPlayerPoints(universe.players[m]) : 0), 0),
  })).sort((a,b)=>b.points-a.points);
}
// Entfernt einen Spieler aus seiner Allianz (Verlassen ODER Konto-Löschung durch Admin).
// Verlässt der Gründer, wird das älteste verbleibende Mitglied automatisch neuer Gründer;
// bleibt niemand übrig, wird die Allianz komplett aufgelöst.
function removePlayerFromAlliance(universe, username){
  const state = universe.players[username];
  if(!state || !state.allianceTag) return;
  const tag = state.allianceTag;
  const alliance = universe.alliances[tag];
  state.allianceTag = null;
  if(!alliance) return;
  alliance.members = alliance.members.filter(m=>m!==username);
  alliance.applications = (alliance.applications||[]).filter(m=>m!==username);
  if(alliance.founder===username){
    if(alliance.members.length>0){
      alliance.founder = alliance.members[0];
      const newFounder = universe.players[alliance.founder];
      if(newFounder) message(newFounder, 'Du bist jetzt Gründer der Allianz ['+tag+'] '+alliance.name+'.');
    } else {
      delete universe.alliances[tag];
    }
  }
}
function foundAlliance(universe, username, payload){
  const state = universe.players[username];
  if(state.allianceTag) return fail(state, 'Du bist bereits Mitglied einer Allianz. Verlasse sie zuerst.');
  const name = String(payload.name||'').trim();
  const tag = String(payload.tag||'').trim().toUpperCase();
  if(!name) return fail(state, 'Allianzname darf nicht leer sein');
  if(name.length>ALLIANCE_NAME_MAX_LEN) return fail(state, 'Allianzname zu lang (max. '+ALLIANCE_NAME_MAX_LEN+' Zeichen)');
  if(!ALLIANCE_TAG_RE.test(tag)) return fail(state, 'Allianz-Tag muss 2-5 Buchstaben/Zahlen sein');
  if(universe.alliances[tag]) return fail(state, 'Dieser Allianz-Tag ist bereits vergeben');
  if(Object.values(universe.alliances).some(a=>a.name.toLowerCase()===name.toLowerCase())) return fail(state, 'Dieser Allianzname ist bereits vergeben');
  const points = totalPlayerPoints(state);
  if(points<ALLIANCE_MIN_POINTS) return fail(state, 'Du benötigst mindestens '+ALLIANCE_MIN_POINTS+' Punkte, um eine Allianz zu gründen (aktuell '+Math.floor(points)+')');
  const p = requirePlanet(state, payload.planetIndex);
  if(!hasRes(p, ALLIANCE_FOUND_COST)) return fail(state, 'Nicht genug Ressourcen zum Gründen');
  spend(p, ALLIANCE_FOUND_COST);
  universe.alliances[tag] = { tag, name, founder:username, members:[username], applications:[], depot:zeroResources(), createdAt:Date.now() };
  state.allianceTag = tag;
  return ok(state, 'Allianz ['+tag+'] '+name+' gegründet');
}
function applyToAlliance(universe, username, payload){
  const state = universe.players[username];
  if(state.allianceTag) return fail(state, 'Du bist bereits Mitglied einer Allianz');
  const tag = String(payload.tag||'').trim().toUpperCase();
  const alliance = universe.alliances[tag];
  if(!alliance) return fail(state, 'Allianz nicht gefunden');
  if(alliance.applications.includes(username)) return fail(state, 'Bewerbung bereits eingereicht');
  alliance.applications.push(username);
  const founder = universe.players[alliance.founder];
  if(founder) message(founder, username+' hat sich bei deiner Allianz ['+tag+'] beworben.');
  return ok(state, 'Bewerbung bei ['+tag+'] '+alliance.name+' eingereicht');
}
function respondToApplication(universe, username, payload){
  const state = universe.players[username];
  const tag = state.allianceTag;
  if(!tag) return fail(state, 'Du bist in keiner Allianz');
  const alliance = universe.alliances[tag];
  if(!alliance) return fail(state, 'Allianz nicht gefunden');
  if(alliance.founder!==username) return fail(state, 'Nur der Gründer kann Bewerbungen bearbeiten');
  const applicantUsername = String(payload.applicantUsername||'').trim();
  const idx = alliance.applications.indexOf(applicantUsername);
  if(idx<0) return fail(state, 'Bewerbung nicht gefunden');
  alliance.applications.splice(idx,1);
  const applicantState = universe.players[applicantUsername];
  if(payload.accept){
    if(!applicantState) return fail(state, 'Bewerber existiert nicht mehr');
    if(applicantState.allianceTag) return fail(state, 'Bewerber ist inzwischen bereits in einer anderen Allianz');
    alliance.members.push(applicantUsername);
    applicantState.allianceTag = tag;
    message(applicantState, 'Deine Bewerbung bei ['+tag+'] '+alliance.name+' wurde angenommen!');
    return ok(state, applicantUsername+' wurde in die Allianz aufgenommen');
  } else {
    if(applicantState) message(applicantState, 'Deine Bewerbung bei ['+tag+'] '+alliance.name+' wurde abgelehnt.');
    return ok(state, 'Bewerbung von '+applicantUsername+' abgelehnt');
  }
}
function leaveAlliance(universe, username){
  const state = universe.players[username];
  if(!state.allianceTag) return fail(state, 'Du bist in keiner Allianz');
  const tag = state.allianceTag;
  removePlayerFromAlliance(universe, username);
  return ok(state, 'Allianz ['+tag+'] verlassen');
}
function marketTrade(state, planetIndex, giveType, wantType, amount){
  const p = requirePlanet(state, planetIndex);
  amount = Number(amount)||0;
  if(giveType===wantType || amount<=0) return fail(state, 'Ungültiger Handel');
  if(!state.marketRate[giveType] || !state.marketRate[wantType]) return fail(state, 'Unbekannte Ressource');
  if((p.resources[giveType]||0) < amount) return fail(state, 'Nicht genug '+giveType);
  const value = amount * state.marketRate[giveType];
  const received = Math.floor(value / state.marketRate[wantType] * 0.9);
  p.resources[giveType]-=amount; p.resources[wantType]=(p.resources[wantType]||0)+received;
  return ok(state, 'Markt: '+amount+' '+giveType+' gegen '+received+' '+wantType+' getauscht');
}
function merchantBuy(state, planetIndex, resourceType, amount){
  const p = requirePlanet(state, planetIndex);
  amount = Math.floor(Number(amount))||0;
  if(amount<=0 || !RESOURCE_KEYS.includes(resourceType)) return fail(state, 'Ungültige Menge');
  const rate = 5;
  const cost = Math.ceil(amount/rate);
  if(state.darkMatter<cost) return fail(state, 'Nicht genug Dunkle Materie');
  state.darkMatter-=cost;
  addRes(p, {[resourceType]:amount});
  return ok(state, 'Händler: '+amount+' '+resourceType+' für '+cost+' Dunkle Materie gekauft');
}
function launchMissiles(universe, username, planetIndex, targetPos, count){
  const state = universe.players[username];
  const p = requirePlanet(state, planetIndex);
  count = Math.floor(Number(count))||0;
  targetPos = Math.floor(Number(targetPos))||0;
  if(count<1 || count>(p.buildings.interplanetaryMissile||0)) return fail(state, 'Ungültige Raketenanzahl');
  if(targetPos<1 || targetPos>UNIVERSE.positions) return fail(state, 'Ungültige Zielposition');
  const ownIdx = state.planets.findIndex(pl=>pl.coords[0]===p.coords[0] && pl.coords[1]===p.coords[1] && pl.coords[2]===targetPos);
  if(ownIdx>=0) return fail(state, 'Eigene Planeten können nicht angegriffen werden');
  const targetCoord = [p.coords[0], p.coords[1], targetPos];
  const owner = findPlanetOwner(universe, targetCoord, username);
  let npcSlot = null;
  if(!owner){
    const slots = seedGalaxy(universe, p.coords[0], p.coords[1], username); const slot = slots.find(s=>s.pos===targetPos);
    if(!slot || slot.type!=='npc') return fail(state, 'Kein gültiges Ziel auf dieser Position');
    npcSlot = slot;
  }
  p.buildings.interplanetaryMissile -= count;
  const missileAttack = count*defs.buildings.interplanetaryMissile.attack;
  if(owner){
    const targetState = universe.players[owner.username];
    const t = targetState.planets[owner.planetIndex];
    const defBefore = extractDefense(t.buildings);
    const defPower = sidePower(defBefore, defs.buildings).attack;
    const netDamage = Math.max(0, missileAttack-defPower);
    if(netDamage>0){
      const totalHull = sidePower(defBefore, defs.buildings).hull;
      const destroyRatio = totalHull>0 ? Math.min(1, netDamage/totalHull) : 0;
      const survivingDef = applyLosses(defBefore, destroyRatio);
      for(const k of Object.keys(defBefore)) t.buildings[k]=survivingDef[k];
      message(state, 'Raketenangriff auf '+t.name+' ('+owner.username+') bei '+coordLinkHtml(targetCoord)+': '+netDamage+' Schaden an der Verteidigung.');
      log(state, 'Raketenangriff auf '+owner.username+' · '+netDamage+' Schaden');
      message(targetState, 'Dein Planet '+t.name+' wurde von '+username+' mit Raketen beschossen! Schaden: '+netDamage+'.');
      log(targetState, 'Raketenangriff von '+username+' erlitten');
      return ok(state, 'Raketen abgefeuert · '+netDamage+' Schaden');
    }
    message(state, 'Raketenangriff auf '+t.name+' von der Verteidigung vollständig abgefangen.');
    return ok(state, 'Raketen abgefeuert · abgefangen');
  }
  const defPower = sidePower(npcSlot.defenseShips, defs.buildings).attack;
  const netDamage = Math.max(0, missileAttack-defPower);
  if(netDamage>0){ message(state, 'Raketenangriff auf '+npcSlot.name+' bei '+coordLinkHtml(targetCoord)+': '+netDamage+' Schaden an der Verteidigung.'); return ok(state, 'Raketen abgefeuert · '+netDamage+' Schaden'); }
  message(state, 'Raketenangriff auf '+npcSlot.name+' von der Verteidigung vollständig abgefangen.');
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
function enqueueLifeformBuilding(state, planetIndex, key){
  const p = requirePlanet(state, planetIndex);
  const def = defs.lifeformBuildings[key];
  if(!def) return fail(state, 'Unbekanntes Lebensform-Gebäude');
  if(def.species!==state.lifeform.active) return fail(state, def.name+' gehört zu einer anderen Lebensform');
  if(!state.lifeform.buildings) state.lifeform.buildings = {};
  const lvl = (state.lifeform.buildings[key]||0)+1;
  const cost = scaledCost(def.base, lvl);
  if(!hasRes(p,cost)) return fail(state, 'Nicht genug Ressourcen für '+def.name);
  spend(p,cost);
  state.lifeform.buildings[key] = lvl;
  state.lifeform.points = (state.lifeform.points||0) + resTotal(cost);
  return ok(state, def.name+' Stufe '+lvl+' fertiggestellt');
}
const PLANET_NAME_MAX_LEN = 30;
function renamePlanet(state, planetIndex, name){
  const p = requirePlanet(state, planetIndex);
  const trimmed = String(name||'').trim();
  if(!trimmed) return fail(state, 'Planetenname darf nicht leer sein');
  if(trimmed.length>PLANET_NAME_MAX_LEN) return fail(state, 'Planetenname zu lang (max. '+PLANET_NAME_MAX_LEN+' Zeichen)');
  const oldName = p.name;
  p.name = trimmed;
  return ok(state, 'Planet "'+oldName+'" wurde in "'+trimmed+'" umbenannt');
}

// Spy mission with a research ship present: chance-based tech steal from an NPC.
// Success chance shifts with the attacker's espionage tech advantage over the NPC's;
// on success, one random research field jumps to the NPC's level if it's higher.
function espionageSuccessChance(atkEsp, defEsp){ return Math.min(0.95, Math.max(0.05, 0.5 + 0.05*(atkEsp-defEsp))); }
// Gestaffelte Spionageberichte (wie im echten OGame): je hoeher die eigene Spionagetechnik
// im Vergleich zur gegnerischen, desto mehr Kategorien werden im Bericht aufgedeckt.
// Ressourcen sind bei jedem erfolgreichen Spionageversuch sichtbar; Flotte, Verteidigung,
// Gebaeude und Forschung erfordern zunehmend groessere Technik-Vorspruenge.
function espionageReportTiers(atkEsp, defEsp){
  const diff = atkEsp - defEsp;
  return {
    resources: true,
    fleet: diff >= 0,
    defense: diff >= 3,
    buildings: diff >= 6,
    research: diff >= 9,
  };
}
function espionageTierCount(tiers){ return Object.values(tiers).filter(Boolean).length; }
function buildEspionageReport(opts){
  const tiers = opts.tiers;
  const report = { time:new Date().toLocaleTimeString('de-DE'), target:opts.target, coords:opts.coords, coordArr:opts.coordArr, resources:opts.resources, tier:espionageTierCount(tiers), tiers };
  if(tiers.fleet) report.fleet = opts.fleetShips;
  if(tiers.defense){ report.defense = sidePower(opts.defenseShips, defs.buildings).attack; report.defenderPower = combinedDefenderPower(opts.fleetShips, opts.defenseShips); }
  if(tiers.buildings) report.buildings = opts.buildings;
  if(tiers.research) report.research = opts.research;
  return report;
}
function attemptResearchTheft(state, p, npcSlot){
  if(!p || !npcSlot || !npcSlot.research) return;
  const atkEsp = p.research.espionageTech || 0;
  const defEsp = npcSlot.research.espionageTech || 0;
  const chance = espionageSuccessChance(atkEsp, defEsp);
  if(Math.random() > chance){
    message(state, 'Forschungsdiebstahl bei '+npcSlot.name+' fehlgeschlagen (Erfolgschance war '+Math.round(chance*100)+'%).');
    log(state, 'Forschungsdiebstahl bei '+npcSlot.name+' fehlgeschlagen');
    return;
  }
  const keys = Object.keys(defs.research);
  const key = keys[Math.floor(Math.random()*keys.length)];
  const theirLevel = npcSlot.research[key] || 0;
  const ourLevel = p.research[key] || 0;
  if(theirLevel > ourLevel){
    p.research[key] = theirLevel;
    message(state, 'Forschungsdiebstahl bei '+npcSlot.name+' erfolgreich: '+defs.research[key].name+' auf Stufe '+theirLevel+' übernommen!');
    log(state, 'Forschungsdiebstahl erfolgreich: '+defs.research[key].name+' Stufe '+theirLevel);
  } else {
    message(state, 'Forschungsdiebstahl bei '+npcSlot.name+' erfolgreich durchgeführt, aber '+defs.research[key].name+' war dort nicht weiter fortgeschritten als bei uns.');
    log(state, 'Forschungsdiebstahl ohne Fortschritt ('+defs.research[key].name+')');
  }
}

function resolveArrival(universe, username, f){
  const state = universe.players[username];
  const targetState = f.toOwner ? universe.players[f.toOwner] : null;
  if(f.mission==='transport'){
    const target = targetState ? targetState.planets[f.toPlanetIndex] : (f.toPlanetIndex!=null ? state.planets[f.toPlanetIndex] : null);
    if(target && !target.destroyed){
      addRes(target,f.cargo);
      log(state, 'Transport hat '+target.name+' erreicht und entladen');
      if(targetState){ message(targetState, 'Eingehender Transport von '+username+' bei '+coordLinkHtml(target.coords)+' erhalten.'); log(targetState, 'Transport von '+username+' erhalten'); }
    }
    f.phase='return';
  } else if(f.mission==='spy'){
    const atkEsp = (state.planets[f.from] && state.planets[f.from].research.espionageTech) || 0;
    if(f.npcSlot){
      const defEsp = (f.npcSlot.research && f.npcSlot.research.espionageTech) || 0;
      const chance = espionageSuccessChance(atkEsp, defEsp);
      if(Math.random() > chance){
        message(state, 'Spionage bei '+f.npcSlot.name+' gescheitert - die Spionageabwehr hat die Sonde entdeckt (Erfolgschance war '+Math.round(chance*100)+'%).');
        log(state, 'Spionage bei '+f.npcSlot.name+' gescheitert');
      } else {
        const tiers = espionageReportTiers(atkEsp, defEsp);
        state.reports.unshift(buildEspionageReport({
          target:f.npcSlot.name, coords:coordStr(f.toCoord), coordArr:f.toCoord,
          resources:{...f.npcSlot.resources},
          fleetShips:f.npcSlot.fleet, defenseShips:f.npcSlot.defenseShips, buildings:f.npcSlot.buildings, research:f.npcSlot.research, tiers,
        }));
        log(state, 'Spionagebericht über '+f.npcSlot.name+' erhalten (Stufe '+espionageTierCount(tiers)+'/5)');
        if(f.ships.researchProbe>0) attemptResearchTheft(state, state.planets[f.from], f.npcSlot);
      }
    } else if(targetState){
      const t = targetState.planets[f.toPlanetIndex];
      if(t && !t.destroyed){
        const defEsp = t.research.espionageTech || 0;
        const chance = espionageSuccessChance(atkEsp, defEsp);
        if(Math.random() > chance){
          log(state, 'Spionage bei '+t.name+' ('+f.toOwner+') gescheitert - Spionageabwehr hat die Sonde entdeckt');
          message(targetState, 'Ein Spionageversuch von '+username+' auf '+t.name+' wurde von deiner Spionageabwehr vereitelt.');
          log(targetState, 'Spionageversuch von '+username+' abgewehrt');
        } else {
          const tiers = espionageReportTiers(atkEsp, defEsp);
          state.reports.unshift(buildEspionageReport({
            target:t.name+' ('+f.toOwner+')', coords:coordStr(t.coords), coordArr:t.coords,
            resources:{...t.resources}, fleetShips:t.ships, defenseShips:extractDefense(t.buildings), buildings:t.buildings, research:t.research, tiers,
          }));
          log(state, 'Spionagebericht über '+t.name+' ('+f.toOwner+') erhalten (Stufe '+espionageTierCount(tiers)+'/5)');
          message(targetState, 'Dein Planet '+t.name+' wurde von '+username+' ausspioniert.');
          log(targetState, 'Spionage durch '+username+' entdeckt');
        }
      }
    } else if(f.toPlanetIndex!=null){
      const t = state.planets[f.toPlanetIndex];
      const tiers = espionageReportTiers(atkEsp, t.research.espionageTech || 0);
      state.reports.unshift(buildEspionageReport({
        target:t.name, coords:coordStr(t.coords), coordArr:t.coords,
        resources:{...t.resources}, fleetShips:t.ships, defenseShips:extractDefense(t.buildings), buildings:t.buildings, research:t.research, tiers,
      }));
      log(state, 'Spionagebericht über '+t.name+' erhalten (Stufe '+espionageTierCount(tiers)+'/5)');
    }
    f.phase='return';
  } else if(f.mission==='harvest'){
    const key = debrisKey(f.toCoord); const field = state.debrisFields[key];
    if(field){
      const cap = capacityForShips(f.ships); const total = resTotal(field);
      const take = Math.min(cap, total);
      const ratio = total>0 ? take/total : 0;
      const gained = zeroResources();
      for(const k of RESOURCE_KEYS){ gained[k]=Math.floor((field[k]||0)*ratio); field[k]=(field[k]||0)-gained[k]; }
      if(resTotal(field)<=0) delete state.debrisFields[key];
      f.cargo = gained;
      log(state, 'Trümmerfeld bei '+coordLinkHtml(f.toCoord)+' geborgen: '+resTotal(gained));
    } else { f.cargo=zeroResources(); }
    f.phase='return';
  } else if(f.mission==='colonize'){
    if(f.emptySlot){
      if(!isPositionFree(universe, f.toCoord[0], f.toCoord[1], f.toCoord[2])){
        log(state, 'Kolonisierung fehlgeschlagen: Feld ist inzwischen belegt'); f.phase='return'; return;
      }
      const homeResearch = state.planets[f.from] ? state.planets[f.from].research : {};
      const planetType = f.emptySlot.planetType || planetTypeForCoord(f.toCoord[0], f.toCoord[1], f.toCoord[2]);
      const startRes = zeroResources();
      PLANET_TYPES[planetType].resources.forEach(r=>{ startRes[r]=200; });
      const newPlanet = {name:'Kolonie '+coordStr(f.toCoord), coords:f.toCoord, planetType, resources:startRes, buildings:{}, research:{...homeResearch}, ships:{}, buildQueue:[], researchQueue:[], shipQueue:[]};
      const firstMineKey = MINE_BY_RESOURCE[PLANET_TYPES[planetType].resources[0]];
      if(firstMineKey) newPlanet.buildings[firstMineKey]=1;
      newPlanet.buildings.solarPlant=1;
      ensurePlanetDefaults(newPlanet);
      state.planets.push(newPlanet);
      f.ships.colonyShip = Math.max(0, f.ships.colonyShip-1);
      log(state, 'Neue Kolonie gegründet: '+newPlanet.name+' ('+PLANET_TYPES[planetType].name+')');
    }
    f.phase='return';
  }
}

// Loest Angriffsflotten aus, die gleichzeitig am selben Ziel ankommen - normalerweise genau
// eine solo-Flotte, bei einer ACS-Welle mehrere Flotten verschiedener Spieler. Alle Schiffe
// werden zu EINER Streitmacht zusammengefasst und in EINER Kampfrunde ausgewertet; Verluste
// treffen danach jede teilnehmende Flotte anteilig mit derselben Verlustquote, Beute wird nach
// verbleibender Ladekapazität aufgeteilt. Fuer eine einzelne Solo-Flotte ist das Ergebnis
// numerisch identisch zur alten Einzel-Kampfabwicklung.
function resolveAttackGroup(universe, participants){
  const first = participants[0].fleet;
  const isGroup = participants.length>1;
  const waveNote = isGroup ? ' (ACS-Welle "'+first.acsId+'", '+participants.length+' Flotten)' : '';
  const combinedShips = mergeShipMaps(participants.map(x=>x.fleet.ships));

  function applyGroupOutcome(battle, lostDefenderFleet, targetLabel, targetResources){
    const results = participants.map(({username, state, fleet})=>{
      const before = fleet.ships;
      const after = applyLosses(before, battle.attackerLossRatio);
      const lost = diffLosses(before, after);
      fleet.ships = after;
      return {username, state, fleet, lost, cap:capacityForShips(after)};
    });
    const totalCapacity = results.reduce((s,r)=>s+r.cap,0);
    const lostRes = zeroResources();
    for(const k of RESOURCE_KEYS){ lostRes[k] = results.reduce((s,r)=>s+shipCostSum(r.lost,k),0) + shipCostSum(lostDefenderFleet,k); }
    const debrisRes = zeroResources();
    for(const k of RESOURCE_KEYS){ debrisRes[k] = Math.floor(lostRes[k]*0.3); }
    const debrisTotal = resTotal(debrisRes);
    if(debrisTotal>0){
      for(const r of results) addDebris(r.state, first.toCoord, debrisRes);
      maybeCreateMoon(results[0].state, first.toCoord, debrisTotal);
    }
    const roundsText = battle.rounds>0 ? battle.rounds+' Kampfrunde(n)' : 'kampflos (keine Verteidigung)';
    const takenRes = zeroResources();
    if(battle.attackerWon && targetResources){
      const loot = zeroResources();
      for(const k of RESOURCE_KEYS) loot[k]=Math.floor((targetResources[k]||0)*0.5);
      const totalLootValue = resTotal(loot);
      const totalTaken = Math.min(totalCapacity, totalLootValue);
      const ratio = totalLootValue>0 ? totalTaken/totalLootValue : 0;
      const remaining = zeroResources();
      for(const k of RESOURCE_KEYS) remaining[k]=Math.floor(loot[k]*ratio);
      for(const r of results){
        const share = totalCapacity>0 ? r.cap/totalCapacity : 0;
        r.fleet.cargo = zeroResources();
        for(const k of RESOURCE_KEYS){ r.fleet.cargo[k]=Math.floor(remaining[k]*share); takenRes[k]+=r.fleet.cargo[k]; }
        const cargoTotal = resTotal(r.fleet.cargo);
        message(r.state, 'Angriffsbericht'+waveNote+': Sieg gegen '+targetLabel+' bei '+coordLinkHtml(first.toCoord)+' ('+roundsText+'). Beute '+cargoTotal+'. Trümmerfeld: '+debrisTotal+'.');
        log(r.state, 'Angriff auf '+targetLabel+' erfolgreich · Beute '+cargoTotal);
      }
    } else {
      for(const r of results){
        r.fleet.cargo = zeroResources();
        message(r.state, 'Angriffsbericht'+waveNote+': Niederlage gegen '+targetLabel+' bei '+coordLinkHtml(first.toCoord)+' ('+roundsText+'). Eigene Verluste erlitten.');
        log(r.state, 'Angriff auf '+targetLabel+' gescheitert · Verluste erlitten');
      }
    }
    for(const {fleet} of participants) fleet.phase='return';
    return {takenRes, won:battle.attackerWon};
  }

  if(first.npcSlot){
    const battle = simulateBattle(combinedShips, first.npcSlot.fleet, first.npcSlot.defenseShips);
    const survivingDefenderFleet = applyLosses(first.npcSlot.fleet, battle.defenderLossRatio);
    const lostDefenderFleet = diffLosses(first.npcSlot.fleet, survivingDefenderFleet);
    applyGroupOutcome(battle, lostDefenderFleet, first.npcSlot.name, first.npcSlot.resources);
    return;
  }

  const targetState = first.toOwner ? universe.players[first.toOwner] : null;
  if(targetState){
    const t = targetState.planets[first.toPlanetIndex];
    if(!t || t.destroyed){
      for(const {state, fleet} of participants){ log(state, 'Angriff nicht möglich: Ziel existiert nicht mehr'); fleet.cargo=zeroResources(); fleet.phase='return'; }
      return;
    }
    const defBefore = extractDefense(t.buildings);
    const battle = simulateBattle(combinedShips, t.ships, defBefore);
    const survivingDefenderFleet = applyLosses(t.ships, battle.defenderLossRatio);
    const survivingDef = applyLosses(defBefore, battle.defenderLossRatio);
    const lostDefenderFleet = diffLosses(t.ships, survivingDefenderFleet);
    t.ships = survivingDefenderFleet;
    for(const k of Object.keys(defBefore)) t.buildings[k] = survivingDef[k];
    const targetLabel = t.name+' ('+first.toOwner+')';
    const outcome = applyGroupOutcome(battle, lostDefenderFleet, targetLabel, t.resources);
    for(const k of RESOURCE_KEYS){ t.resources[k] = (t.resources[k]||0) - (outcome.takenRes[k]||0); }
    const attackerNames = participants.map(x=>x.username).join(', ');
    if(outcome.won){
      message(targetState, 'Dein Planet '+t.name+' wurde von '+attackerNames+waveNote+' angegriffen und geplündert! Verlust: '+resTotal(outcome.takenRes)+'.');
      log(targetState, 'Angriff von '+attackerNames+' erlitten · Verluste');
      // Planetenzerstörung: nur moeglich, wenn der Verteidiger nach der Schlacht komplett
      // schutzlos ist (weder Flotte noch Verteidigungsanlagen uebrig) UND die angreifende
      // Streitmacht Todessterne enthielt. Chance skaliert mit der Anzahl Todessterne, das
      // Ziel darf nicht sein letzter verbleibender Planet sein.
      const deathstars = combinedShips.deathstar||0;
      const fullyUndefended = Object.values(survivingDefenderFleet).every(v=>!v) && Object.values(survivingDef).every(v=>!v);
      const targetHasOtherPlanets = targetState.planets.filter(pl=>!pl.destroyed).length>1;
      if(deathstars>0 && fullyUndefended && targetHasOtherPlanets){
        const chance = deathStarDestroyChance(deathstars);
        if(Math.random()<chance){
          destroyPlanet(targetState, first.toPlanetIndex);
          message(targetState, 'KATASTROPHE: Dein Planet '+t.name+' wurde durch '+deathstars+' Todesstern(e) vollständig zerstört!');
          log(targetState, t.name+' durch Todessterne zerstört');
          for(const {state:atkState} of participants){
            message(atkState, 'Todesstern-Bombardement erfolgreich: '+t.name+' bei '+coordLinkHtml(first.toCoord)+' wurde vollständig zerstört!');
            log(atkState, t.name+' zerstört');
          }
        }
      }
    } else {
      message(targetState, 'Dein Planet '+t.name+' wurde von '+attackerNames+waveNote+' angegriffen – Verteidigung erfolgreich!');
      log(targetState, 'Angriff von '+attackerNames+' abgewehrt');
    }
    return;
  }

  for(const {state, fleet} of participants){ log(state, 'Angriff nicht möglich'); fleet.cargo=zeroResources(); fleet.phase='return'; }
}

function tick(universe){
  const now = Date.now();
  resolveAuctionIfDue(universe);
  resolveEventIfDue(universe);
  for(const state of Object.values(universe.players)){
    const dt = (now-state.now)/1000; state.now = now;
    const hours = (dt*state.timeScale)/3600;
    state.planets.forEach(p=>{
      const inc = hourly(state, p, universe); const cap = maxStorage(p);
      for(const k of RESOURCE_KEYS){
        p.resources[k] = Math.max(0, Math.min(cap[k], (p.resources[k]||0)+inc[k]*hours));
      }
      while(p.buildQueue[0] && p.buildQueue[0].done<=now){ const q=p.buildQueue.shift(); p.buildings[q.key]=(p.buildings[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
      while(p.researchQueue[0] && p.researchQueue[0].done<=now){ const q=p.researchQueue.shift(); p.research[q.key]=(p.research[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
      while(p.shipQueue[0] && p.shipQueue[0].done<=now){ const q=p.shipQueue.shift(); p.ships[q.key]=(p.ships[q.key]||0)+1; log(state, p.name+': '+q.name+' fertig'); }
    });
    state.moons.forEach(m=>{ while(m.buildQueue[0] && m.buildQueue[0].done<=now){ const q=m.buildQueue.shift(); m.buildings[q.key]=(m.buildings[q.key]||0)+1; message(state, 'Mond '+coordLinkHtml(m.coord)+': '+q.name+' fertig'); } });
  }
  // Angriffsflotten, die jetzt ankommen, werden zunaechst ueber ALLE Spieler hinweg gesammelt
  // und nach ACS-Welle gruppiert (bzw. einzeln bei Solo-Angriffen), damit gleichzeitig
  // eintreffende Allianzflotten gemeinsam statt nacheinander gegen das Ziel kaempfen.
  const arrivingAttacks = [];
  for(const [username, state] of Object.entries(universe.players)){
    state.fleets.forEach(f=>{ if(f.phase==='outbound' && f.arrive<=now && f.mission==='attack') arrivingAttacks.push({username, state, fleet:f}); });
  }
  const attackGroups = new Map();
  for(const entry of arrivingAttacks){
    const f = entry.fleet;
    const key = f.acsId ? ('acs:'+f.acsId+':'+f.toCoord.join(':')) : ('solo:'+entry.username+':'+f.toCoord.join(':')+':'+f.arrive+':'+f.from);
    if(!attackGroups.has(key)) attackGroups.set(key, []);
    attackGroups.get(key).push(entry);
  }
  for(const participants of attackGroups.values()) resolveAttackGroup(universe, participants);

  for(const [username, state] of Object.entries(universe.players)){
    state.fleets.forEach(f=>{
      if(f.phase==='outbound' && f.arrive<=now && f.mission!=='attack'){ resolveArrival(universe, username, f); }
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
}

function applyAction(universe, username, type, payload){
  payload = payload || {};
  const state = universe.players[username];
  if(!state) throw new Error('Kein Spielerimperium für dieses Konto');
  switch(type){
    case 'enqueueBuild': return enqueueBuild(state, payload.planetIndex, payload.key);
    case 'enqueueResearch': return enqueueResearch(state, payload.planetIndex, payload.key);
    case 'enqueueShip': return enqueueShip(state, payload.planetIndex, payload.key);
    case 'enqueueDefense': return enqueueDefense(state, payload.planetIndex, payload.key);
    case 'sendFleet': return sendFleet(universe, username, payload.planetIndex, payload);
    case 'bidAuction': return bidAuction(universe, username, payload.amount);
    case 'sendExpedition': return sendExpedition(state, payload.planetIndex, payload.ships, payload.durationSlot);
    case 'enqueueMoonBuild': return enqueueMoonBuild(state, payload.planetIndex, payload.moonIndex, payload.key);
    case 'jumpGateTransfer': return jumpGateTransfer(state, payload.fromMoonIndex, payload.toMoonIndex, payload.ships);
    case 'scanSystem': return scanSystem(universe, username, payload);
    case 'sendDirectMessage': return sendDirectMessage(universe, username, payload);
    case 'markMailRead': return markMailRead(state);
    case 'depositAlliance': return depositAlliance(universe, username, payload.planetIndex);
    case 'foundAlliance': return foundAlliance(universe, username, payload);
    case 'applyToAlliance': return applyToAlliance(universe, username, payload);
    case 'respondToApplication': return respondToApplication(universe, username, payload);
    case 'leaveAlliance': return leaveAlliance(universe, username);
    case 'marketTrade': return marketTrade(state, payload.planetIndex, payload.give, payload.want, payload.amount);
    case 'merchantBuy': return merchantBuy(state, payload.planetIndex, payload.resourceType, payload.amount);
    case 'launchMissiles': return launchMissiles(universe, username, payload.planetIndex, payload.targetPos, payload.count);
    case 'activateOfficer': return activateOfficer(state, payload.key);
    case 'setLifeform': return setLifeform(state, payload.species);
    case 'enqueueLifeformBuilding': return enqueueLifeformBuilding(state, payload.planetIndex, payload.key);
    case 'renamePlanet': return renamePlanet(state, payload.planetIndex, payload.name);
    default: throw new Error('Unbekannte Aktion: '+type);
  }
}

module.exports = {
  defs, UNIVERSE, missionLabels,
  RESOURCE_KEYS, RESOURCE_INFO, RESOURCE_GROUPS, PLANET_TYPES, MINE_BY_RESOURCE,
  createUniverse, normalizeUniverse, normalizePlayerState, createStarterEmpire,
  registerAccount, findPlanetOwner, isPositionFree,
  seedGalaxy, validCoord, coordStr, coordLinkHtml, debrisKey,
  computeHighscore, adminListPlayers, adminDeletePlayer, adminGrantResources,
  applyAction, tick, getPublicAuctionView, getPublicEventView,
  getPlayerAllianceView, getAlliancesListView,
};
