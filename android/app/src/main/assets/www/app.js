// ---- Rohstoffe & Planetentypen (Spiegelbild von server/gameEngine.js) ----
const RESOURCE_KEYS = [
  'iron','copper','aluminium','gold','silver','lithium','rareEarths','nickel','uranium','limestone',
  'crudeOil','naturalGas','coal',
  'sulfur','phosphate','wood',
  'freshwater','saltwater',
  'steel','electronics','plastic','alloy','concrete','batteryCells',
  'machineParts','compositeMaterial',
  'precisionComponents',
];
const RESOURCE_INFO = {
  iron: {name:'Eisen', group:'ore'}, copper: {name:'Kupfer', group:'ore'}, aluminium: {name:'Aluminium', group:'ore'},
  nickel: {name:'Nickel', group:'ore'}, limestone: {name:'Kalkstein', group:'ore'},
  gold: {name:'Gold', group:'tech'}, silver: {name:'Silber', group:'tech'}, lithium: {name:'Lithium', group:'tech'}, rareEarths: {name:'Seltene Erden', group:'tech'},
  crudeOil: {name:'Rohöl', group:'fuel'}, naturalGas: {name:'Erdgas', group:'fuel'}, coal: {name:'Kohle', group:'fuel'}, uranium: {name:'Uran', group:'fuel'},
  sulfur: {name:'Schwefel', group:'special'}, phosphate: {name:'Phosphat', group:'special'}, wood: {name:'Holz', group:'special'},
  freshwater: {name:'Süßwasser', group:'water'}, saltwater: {name:'Salzwasser', group:'water'},
  steel: {name:'Stahl', group:'goods'}, electronics: {name:'Elektronik', group:'goods'}, plastic: {name:'Kunststoff', group:'goods'},
  alloy: {name:'Legierung', group:'goods'}, concrete: {name:'Beton', group:'goods'}, batteryCells: {name:'Batteriezellen', group:'goods'},
  machineParts: {name:'Maschinenteile', group:'goods'}, compositeMaterial: {name:'Verbundwerkstoff', group:'goods'},
  precisionComponents: {name:'Präzisionskomponenten', group:'goods'},
};
const RESOURCE_GROUPS = {
  ore: {name:'Erze', storageBuilding:'oreStorage'}, tech: {name:'Technologiemetalle', storageBuilding:'techStorage'},
  fuel: {name:'Energieträger', storageBuilding:'fuelStorage'}, special: {name:'Sonderrohstoffe', storageBuilding:'resourceStorage'},
  water: {name:'Wasser', storageBuilding:'resourceStorage'}, goods: {name:'Industriegüter', storageBuilding:'goodsStorage'},
};
// Gemeinsame Gruppierungsreihenfolge fuer Topbar (renderTop) und Uebersicht (viewOverview) -
// vorher hatte jede Stelle ihre eigene (teils unvollstaendige, 'goods' fehlte) Sortierung.
const RESOURCE_GROUP_ORDER = ['ore','tech','fuel','special','water','goods'];
const PLANET_TYPES = {
  rocky: {name:'Gesteinsplanet', desc:'Fester, mineralreicher Untergrund - der Standard-Planetentyp für Heimatwelten.', resources:['iron','copper','aluminium','nickel','limestone'],
    pros:'Reich an Eisen, Kupfer, Aluminium, Nickel und Kalkstein - die autarke Grundlage für Frühindustrie, ohne auf Handel angewiesen zu sein.',
    cons:'Kein natürliches Wasser, keine Edelmetalle, kein Uran und keine fossilen Brennstoffe - dafür ist Handel oder eine Kolonie mit anderem Planetentyp nötig.'},
  desert: {name:'Wüstenplanet', desc:'Heiß, trocken, geologisch alt - reich an Edelmetallen und radioaktiven Ablagerungen.', resources:['gold','silver','uranium','rareEarths','sulfur','phosphate'],
    pros:'Reich an Gold, Silber, Uran, Seltenen Erden, Schwefel und Phosphat - wichtig für Energietechnik und hochwertige Elektronik.',
    cons:'Kein Wasser und keine fossilen Brennstoffe (Kohle, Rohöl) - müssen importiert werden.'},
  ice: {name:'Eiswelt', desc:'Gefrorene Wassereis- und Gashydrat-Vorkommen unter der Oberfläche.', resources:['freshwater','lithium','naturalGas'],
    pros:'Süßwasser, Lithium und Erdgas im Überfluss - ideal für Batterieproduktion und Treibstoffversorgung.',
    cons:'Keine Metallerze und keine Edelmetalle - Grundmetalle müssen importiert werden.'},
  ocean: {name:'Ozeanplanet', desc:'Selten - noch immer flüssiges Wasser, sedimentäre Ablagerungen.', resources:['saltwater','freshwater','limestone','phosphate'],
    pros:'Salzwasser, Süßwasser, Kalkstein und Phosphat - die einzige natürliche Quelle für Salzwasser im ganzen Universum.',
    cons:'Sehr selten anzutreffen, kaum Metallerze außer Kalkstein - stark handelsabhängig.'},
  volcanic: {name:'Vulkanplanet', desc:'Geologisch hochaktiv, reich an fossilen und mineralischen Tiefenvorkommen.', resources:['coal','crudeOil','sulfur','rareEarths'],
    pros:'Kohle, Rohöl, Schwefel und Seltene Erden - die wichtigste Quelle für fossile Brennstoffe im Universum.',
    cons:'Kein Wasser und keine Edelmetalle - geologisch instabile, riskante Umgebung.'},
  gasMoon: {name:'Gasriesenmond', desc:'Dünne Atmosphäre im Orbit eines Gasriesen, Sole-Ablagerungen und Gaslecks.', resources:['naturalGas','aluminium','lithium'],
    pros:'Erdgas, Aluminium und Lithium - guter Kompromiss zwischen Metall- und Treibstoffversorgung.',
    cons:'Dünne Atmosphäre, kein Wasser, keine Edelmetalle oder fossilen Brennstoffe.'},
};
function planetTypesForResource(resource){ return Object.entries(PLANET_TYPES).filter(([,t])=>t.resources.includes(resource)).map(([k])=>k); }
function zeroResources(){ const r={}; RESOURCE_KEYS.forEach(k=>r[k]=0); return r; }
function resTotal(c){ return RESOURCE_KEYS.reduce((s,k)=>s+(c[k]||0),0); }
function resCostText(c){ const parts=RESOURCE_KEYS.map(k=>c[k]?`<span class="cost-chip">${RESOURCE_INFO[k].name} ${fmt(c[k])}</span>`:null).filter(Boolean); return parts.length ? parts.join('') : '<span class="cost-chip cost-chip-free">kostenlos</span>'; }
function mineBaseCost(planetType, magnitude){
  const pool = PLANET_TYPES[planetType] ? PLANET_TYPES[planetType].resources : [];
  const cost = zeroResources();
  if(!pool.length) return cost;
  const share = magnitude / pool.length;
  pool.forEach(r=>{ cost[r] = Math.round(share); });
  return cost;
}
function costBaseFor(def, p){ if(def.costMagnitude!=null) return mineBaseCost(p.planetType, def.costMagnitude); return def.base; }

const defs = {
  buildings: {
    ironMine:{name:'Eisenmine', desc:'Baut Eisenerz ab, den grundlegendsten Baustoff für frühe Infrastruktur.', resource:'iron', costMagnitude:75, powerUse:l=>10*l, prod:l=>30*l*Math.pow(1.1,l)},
    copperMine:{name:'Kupfermine', desc:'Fördert Kupfer, unverzichtbar für Verkabelung und Elektronik.', resource:'copper', costMagnitude:73, powerUse:l=>10*l, prod:l=>26*l*Math.pow(1.1,l)},
    aluminiumMine:{name:'Aluminiumverhüttung', desc:'Verhüttet Aluminiumerz zu leichtem, stabilem Konstruktionsmaterial.', resource:'aluminium', costMagnitude:85, powerUse:l=>11*l, prod:l=>24*l*Math.pow(1.1,l)},
    nickelMine:{name:'Nickelmine', desc:'Baut Nickel ab, wichtig für korrosionsbeständige Legierungen.', resource:'nickel', costMagnitude:74, powerUse:l=>10*l, prod:l=>22*l*Math.pow(1.1,l)},
    limestoneQuarry:{name:'Kalksteinbruch', desc:'Bricht Kalkstein für Beton und Baumaterialien.', resource:'limestone', costMagnitude:55, powerUse:l=>8*l, prod:l=>28*l*Math.pow(1.1,l)},
    goldMine:{name:'Goldmine', desc:'Fördert Gold für hochwertige elektronische Kontakte und Leiterbahnen.', resource:'gold', costMagnitude:72, powerUse:l=>12*l, prod:l=>14*l*Math.pow(1.1,l)},
    silverMine:{name:'Silbermine', desc:'Baut Silber ab, wichtig für Präzisionselektronik.', resource:'silver', costMagnitude:70, powerUse:l=>12*l, prod:l=>16*l*Math.pow(1.1,l)},
    uraniumMine:{name:'Uranmine', desc:'Fördert radioaktives Uranerz - Brennstoff für Kernreaktoren.', resource:'uranium', costMagnitude:110, powerUse:l=>14*l, prod:l=>10*l*Math.pow(1.1,l)},
    rareEarthsMine:{name:'Seltenerdmine', desc:'Gewinnt Seltene Erden für Hochleistungsmagnete und Sensorik.', resource:'rareEarths', costMagnitude:93, powerUse:l=>13*l, prod:l=>12*l*Math.pow(1.1,l)},
    sulfurMine:{name:'Schwefelmine', desc:'Baut vulkanischen Schwefel für chemische Prozesse ab.', resource:'sulfur', costMagnitude:52, powerUse:l=>9*l, prod:l=>18*l*Math.pow(1.1,l)},
    phosphateMine:{name:'Phosphatmine', desc:'Fördert Phosphat für Düngemittel und Lebenserhaltungssysteme.', resource:'phosphate', costMagnitude:56, powerUse:l=>9*l, prod:l=>18*l*Math.pow(1.1,l)},
    crudeOilPump:{name:'Ölbohrturm', desc:'Fördert Rohöl aus tiefen geologischen Lagerstätten - Treibstoffgrundlage der Flotte.', resource:'crudeOil', costMagnitude:300, powerUse:l=>20*l, prod:l=>10*l*Math.pow(1.1,l)},
    naturalGasPump:{name:'Erdgasförderanlage', desc:'Fördert Erdgas aus unterirdischen Vorkommen.', resource:'naturalGas', costMagnitude:270, powerUse:l=>18*l, prod:l=>11*l*Math.pow(1.1,l)},
    coalMine:{name:'Kohlebergwerk', desc:'Baut Kohle ab, ein vielseitiger fossiler Energieträger.', resource:'coal', costMagnitude:70, powerUse:l=>10*l, prod:l=>20*l*Math.pow(1.1,l)},
    freshwaterExtractor:{name:'Süßwassergewinnung', desc:'Gewinnt Süßwasser aus unterirdischem Eis.', resource:'freshwater', costMagnitude:50, powerUse:l=>7*l, prod:l=>20*l*Math.pow(1.1,l)},
    saltwaterDesalinator:{name:'Meerwasserpumpe', desc:'Pumpt Salzwasser aus verbliebenen Ozeanen.', resource:'saltwater', costMagnitude:43, powerUse:l=>6*l, prod:l=>22*l*Math.pow(1.1,l)},
    lithiumExtractor:{name:'Lithium-Solefeld', desc:'Gewinnt Lithium aus Solefeldern - essenziell für Energiespeicher.', resource:'lithium', costMagnitude:76, powerUse:l=>11*l, prod:l=>13*l*Math.pow(1.1,l)},
    atmosphericCondenser:{name:'Atmosphärischer Kondensator', desc:'Gewinnt Süßwasser aus Luftfeuchtigkeit - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Süßwassergewinnung auf einer Eis-/Ozeanwelt.', base:{aluminium:300, copper:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'freshwater', prod:l=>6*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    brineSynthesizer:{name:'Salzsyntheseanlage', desc:'Synthetisiert Salzwasser aus Bodenmineralien und Kondenswasser - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Meerwasserpumpe auf einer Ozeanwelt.', base:{nickel:300, sulfur:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'saltwater', prod:l=>6*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    traceGoldExtractor:{name:'Spurenelement-Goldgewinnung', desc:'Filtert Goldspuren aus dem Gesteinsboden - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Goldmine auf einer Wüstenwelt.', base:{iron:300, copper:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'gold', prod:l=>4*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    traceSilverExtractor:{name:'Spurenelement-Silbergewinnung', desc:'Filtert Silberspuren aus dem Gesteinsboden - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Silbermine auf einer Wüstenwelt.', base:{copper:300, nickel:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'silver', prod:l=>5*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    regolithUraniumExtractor:{name:'Regolith-Uranextraktion', desc:'Extrahiert radioaktive Spuren aus dem Regolith - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Uranmine auf einer Wüstenwelt.', base:{aluminium:300, iron:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'uranium', prod:l=>3*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    regolithRareEarthsExtractor:{name:'Regolith-Separationsanlage', desc:'Separiert Seltene Erden aus dem Regolith - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Seltenerdmine auf Wüsten- oder Vulkanwelten.', base:{nickel:300, aluminium:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'rareEarths', prod:l=>4*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    sulfurSynthesizer:{name:'Schwefelsyntheseanlage', desc:'Synthetisiert Schwefelverbindungen aus Bodenmineralien - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Schwefelmine auf Wüsten- oder Vulkanwelten.', base:{limestone:300, iron:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'sulfur', prod:l=>5*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    phosphateSynthesizer:{name:'Phosphatsyntheseanlage', desc:'Synthetisiert Phosphatverbindungen aus Bodenmineralien - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Phosphatmine auf Wüsten- oder Ozeanwelten.', base:{limestone:300, copper:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'phosphate', prod:l=>5*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    syntheticOilPlant:{name:'Synthetische Ölanlage', desc:'Synthetisiert Kohlenwasserstoffe im Labor - funktioniert auf jedem Planetentyp, aber deutlich schwächer als ein echter Ölbohrturm auf einer Vulkanwelt.', base:{aluminium:300, nickel:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'crudeOil', prod:l=>3*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    syntheticGasPlant:{name:'Synthesegasanlage', desc:'Synthetisiert Erdgas im Labor - funktioniert auf jedem Planetentyp, aber deutlich schwächer als eine echte Erdgasförderanlage auf Eis- oder Gasmondwelten.', base:{iron:300, aluminium:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'naturalGas', prod:l=>3*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    carbonSynthesizer:{name:'Kohlenstoffsyntheseanlage', desc:'Synthetisiert Kohlenstoffverbindungen aus Bodenmineralien - funktioniert auf jedem Planetentyp, aber deutlich schwächer als ein echtes Kohlebergwerk auf einer Vulkanwelt.', base:{copper:300, limestone:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'coal', prod:l=>6*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    regolithLithiumExtractor:{name:'Regolith-Lithiumgewinnung', desc:'Gewinnt Lithiumspuren aus dem Regolith - funktioniert auf jedem Planetentyp, aber deutlich schwächer als ein echtes Lithium-Solefeld auf Eis- oder Gasmondwelten.', base:{nickel:300, limestone:200}, powerUse:l=>10*l, factory:false,
      recipe:{output:'lithium', prod:l=>4*l*Math.pow(1.1,l), inputsPerUnit:{}}},
    sawmill:{name:'Forstplantage', desc:'Erntet Holz aus der künstlich angelegten Biosphäre nach der Terraformierung.', resource:'wood', base:{iron:100, freshwater:60}, powerUse:l=>10*l, prod:l=>15*l*Math.pow(1.1,l), requires:{terraformer:1}},
    solarPlant:{name:'Solarkraftwerk', desc:'Erzeugt Energie durch Sonnenlicht, die von den Minen zum Betrieb benötigt wird. Überall nutzbar - selbstversorgend aus lokalen Rohstoffen finanziert.', costMagnitude:105, power:l=>40*l*Math.pow(1.05,l)},
    nuclearReactor:{name:'Kernreaktor', desc:'Erzeugt zusätzliche Energie durch Kernspaltung - unabhängig vom Sonnenlicht, verbraucht aber laufend Uran.', base:{iron:700, aluminium:300, uranium:120}, power:l=>30*l*Math.pow(1.05,l), uraniumUse:l=>Math.floor(10*l*Math.pow(1.1,l)), requires:{uraniumMine:5, energyTech:3}},
    oreStorage:{name:'Erzlager', desc:'Erhöht die maximale Lagerkapazität für alle Erze. Selbstversorgend baubar.', costMagnitude:1000},
    techStorage:{name:'Technologielager', desc:'Erhöht die maximale Lagerkapazität für alle Technologiemetalle.', base:{gold:700, silver:700}, },
    fuelStorage:{name:'Energielager', desc:'Erhöht die maximale Lagerkapazität für alle Energieträger.', base:{iron:800, crudeOil:600}, },
    resourceStorage:{name:'Rohstofflager', desc:'Erhöht die maximale Lagerkapazität für Sonderrohstoffe und Wasser.', base:{limestone:600, freshwater:300, phosphate:250}, },
    goodsStorage:{name:'Güterlager', desc:'Erhöht die maximale Lagerkapazität für Industriegüter (Zwischenprodukte).', base:{steel:500, electronics:300}, },
    robotFactory:{name:'Roboterfabrik', desc:'Beschleunigt den Bau von Gebäuden und ist Voraussetzung für viele fortgeschrittene Anlagen.', base:{iron:500, copper:220}, },
    shipyard:{name:'Raumschiffwerft', desc:'Ermöglicht den Bau von Raumschiffen und Verteidigungsanlagen.', base:{iron:400, aluminium:250, nickel:100, steel:150}, requires:{robotFactory:2}},
    spaceDock:{name:'Raumstation', desc:'Fortgeschrittene Werftanlage, Voraussetzung für die stärksten Kriegsschiffe.', base:{aluminium:35000, gold:25000, machineParts:1200}, requires:{shipyard:3}},

    // ---- Fabriken (Zwischenprodukte) ----
    // Nicht planetentyp-gebunden (kein `resource`-Feld) - ueberall baubar, nur ueber
    // `requires` gegated. `recipe` beschreibt Nameplate-Produktion + Rohstoff-Eingaben
    // je gefertigter Einheit; bei knappem Input wird der tatsaechliche Output proportional
    // gedrosselt (siehe factoryThrottle/hourly weiter unten) - Grundlage der
    // Flaschenhals-Anzeige. Baukosten bewusst reine Rohstoffe. Erster anpassbarer Entwurf.
    steelMill:{name:'Stahlwerk', desc:'Verhüttet Eisen mit Kohle zu Stahl - Grundlage vieler Maschinenbauteile.', base:{iron:600, copper:250}, requires:{robotFactory:2}, powerUse:l=>12*l, factory:true,
      recipe:{output:'steel', prod:l=>15*l*Math.pow(1.1,l), inputsPerUnit:{iron:2, coal:1}}},
    electronicsFactory:{name:'Elektronikfabrik', desc:'Fertigt aus Kupfer und Gold hochwertige Elektronikbauteile.', base:{copper:600, silver:250}, requires:{robotFactory:2}, powerUse:l=>12*l, factory:true,
      recipe:{output:'electronics', prod:l=>10*l*Math.pow(1.1,l), inputsPerUnit:{copper:3, gold:1}}},
    plasticsPlant:{name:'Kunststoffwerk', desc:'Verarbeitet Rohöl und Kohle zu vielseitigem Kunststoff.', base:{aluminium:600, crudeOil:250}, requires:{robotFactory:2}, powerUse:l=>12*l, factory:true,
      recipe:{output:'plastic', prod:l=>12*l*Math.pow(1.1,l), inputsPerUnit:{crudeOil:2, coal:1}}},
    alloyFoundry:{name:'Legierungsschmelze', desc:'Schmilzt Aluminium, Nickel und Seltene Erden zu widerstandsfähigen Legierungen.', base:{aluminium:700, nickel:250}, requires:{robotFactory:2}, powerUse:l=>13*l, factory:true,
      recipe:{output:'alloy', prod:l=>9*l*Math.pow(1.1,l), inputsPerUnit:{aluminium:2, nickel:1, rareEarths:1}}},
    concretePlant:{name:'Betonwerk', desc:'Mischt Kalkstein und Süßwasser zu Beton für schwere Bauwerke.', base:{limestone:600, freshwater:250}, requires:{robotFactory:2}, powerUse:l=>10*l, factory:true,
      recipe:{output:'concrete', prod:l=>18*l*Math.pow(1.1,l), inputsPerUnit:{limestone:3, freshwater:1}}},
    batteryFactory:{name:'Batteriefabrik', desc:'Fertigt aus Lithium und Schwefel wiederaufladbare Batteriezellen.', base:{lithium:600, sulfur:250}, requires:{robotFactory:2}, powerUse:l=>13*l, factory:true,
      recipe:{output:'batteryCells', prod:l=>8*l*Math.pow(1.1,l), inputsPerUnit:{lithium:2, sulfur:1}}},
    machineWorks:{name:'Maschinenbauwerk', desc:'Fertigt aus Stahl und Elektronik komplexe Maschinenteile (Tier 2).', base:{steel:800, electronics:400}, requires:{steelMill:3, electronicsFactory:3}, powerUse:l=>16*l, factory:true,
      recipe:{output:'machineParts', prod:l=>7*l*Math.pow(1.1,l), inputsPerUnit:{steel:2, electronics:1}}},
    compositePlant:{name:'Verbundstoffwerk', desc:'Verbindet Legierung, Kunststoff und Holz zu hochfesten Verbundwerkstoffen (Tier 2).', base:{alloy:800, plastic:400}, requires:{alloyFoundry:3, plasticsPlant:3}, powerUse:l=>16*l, factory:true,
      recipe:{output:'compositeMaterial', prod:l=>6*l*Math.pow(1.1,l), inputsPerUnit:{alloy:2, plastic:1, wood:1}}},
    precisionWorks:{name:'Präzisionswerk', desc:'Kombiniert Maschinenteile, Verbundwerkstoff und Seltene Erden zu hochpräzisen Komponenten für die fortschrittlichste Technologie (Tier 3).', base:{machineParts:1200, compositeMaterial:1200}, requires:{machineWorks:5, compositePlant:5}, powerUse:l=>20*l, factory:true,
      recipe:{output:'precisionComponents', prod:l=>4*l*Math.pow(1.1,l), inputsPerUnit:{machineParts:2, compositeMaterial:2, rareEarths:5}}},
    // ---- Sonstige Einrichtungen ----
    researchLab:{name:'Forschungslabor', desc:'Ermöglicht das Erforschen neuer Technologien und beschleunigt laufende Forschung.', base:{copper:400, silver:440, electronics:150}, },
    naniteFactory:{name:'Nanitenfabrik', desc:'Hochentwickelte Fertigungsanlage, Voraussetzung für die fortschrittlichsten Bauten.', base:{nickel:900000, rareEarths:500000, uranium:200000, precisionComponents:1000}, requires:{robotFactory:10, computerTech:10}, facility:true},
    terraformer:{name:'Terraformer', desc:'Formt die Planetenoberfläche um, schafft eine künstliche Biosphäre und ermöglicht den Holzanbau. Erfordert vor allem Lithium und Süßwasser.', base:{lithium:20000, freshwater:5000, concrete:8000}, requires:{naniteFactory:1, energyTech:12}, facility:true},
    allianceDepot:{name:'Allianzdepot', desc:'Lagerplatz für Ressourcen, die der Allianz zur Verfügung gestellt werden.', base:{limestone:30000, gold:30000, phosphate:5000, concrete:6000}, requires:{shipyard:3}, facility:true},
    missileSilo:{name:'Raketensilo', desc:'Lagert und startet interplanetare Raketen zum Fernangriff auf gegnerische Verteidigung.', base:{iron:30000, sulfur:11000, steel:3000}, requires:{shipyard:1}, facility:true},
    sensorPhalanx:{name:'Sensorphalanx', desc:'Ermöglicht die Überwachung fremder Systeme von einem Mond aus.', base:{copper:30000, silver:35000, naturalGas:15000, electronics:6000}, requires:{naniteFactory:1}, moonOnly:true, facility:true},
    jumpGate:{name:'Sprungtor', desc:'Verbindet zwei eigene Monde für verzögerungsfreien Flottentransfer.', base:{aluminium:2000000, lithium:3500000, uranium:1300000, precisionComponents:5000}, requires:{naniteFactory:1, hyperspaceTech:7}, moonOnly:true, facility:true},
    lunarBase:{name:'Lunarbasis', desc:'Grundlegende Infrastruktur auf einem Mond, Voraussetzung für weitere Mondgebäude.', base:{limestone:40000, aluminium:40000, concrete:10000}, requires:{}, moonOnly:true, facility:true},
    missileLauncher:{name:'Raketenwerfer', desc:'Einfache, günstige Verteidigungsanlage mit solidem Grundschutz.', base:{iron:1400, sulfur:600, steel:200}, isDefense:true, attack:80, shield:20, hull:2000, requires:{shipyard:1}},
    lightLaser:{name:'Leichtes Laser-Geschütz', desc:'Leichte Laserkanone mit ausgewogenem Verhältnis aus Kosten und Feuerkraft.', base:{iron:1300, silver:700, electronics:150}, isDefense:true, attack:100, shield:25, hull:2000, requires:{shipyard:2, energyTech:1}},
    heavyLaser:{name:'Schweres Laser-Geschütz', desc:'Schwere Laserkanone mit deutlich mehr Angriffskraft.', base:{iron:5500, silver:2500, electronics:600}, isDefense:true, attack:250, shield:100, hull:8000, requires:{shipyard:4, energyTech:3}},
    gaussCannon:{name:'Gauß-Kanone', desc:'Schweres Railgun-Geschütz mit hoher Durchschlagskraft, teuer aber effektiv.', base:{iron:22000, silver:11000, naturalGas:4000, machineParts:800}, isDefense:true, attack:1100, shield:200, hull:35000, requires:{shipyard:6, weaponsTech:3, shieldingTech:1, energyTech:6}},
    ionCannon:{name:'Ionenkanone', desc:'Spezialisiert auf hohe Schildwerte - schwer zu durchdringen.', base:{aluminium:5000, lithium:3000, electronics:400}, isDefense:true, attack:150, shield:500, hull:8000, requires:{shipyard:4, ionTech:4}},
    plasmaTurret:{name:'Plasmawerfer', desc:'Stärkste konventionelle Verteidigungsanlage mit enormer Feuerkraft.', base:{aluminium:60000, rareEarths:45000, uranium:25000, precisionComponents:200}, isDefense:true, attack:3000, shield:300, hull:100000, requires:{shipyard:8, plasmaTech:7}},
    smallShield:{name:'Kleine Schildkuppel', desc:'Errichtet einen Schutzschild um den gesamten Planeten (nur einmal baubar).', base:{aluminium:12000, silver:8000, alloy:1500}, isDefense:true, unique:true, attack:1, shield:2000, hull:20000, requires:{shieldingTech:2}},
    largeShield:{name:'Große Schildkuppel', desc:'Mächtiger Schutzschild mit deutlich höherer Kapazität als die kleine Schildkuppel (nur einmal baubar).', base:{aluminium:60000, silver:40000, alloy:6000}, isDefense:true, unique:true, attack:1, shield:10000, hull:100000, requires:{shipyard:6, shieldingTech:6}},
    interplanetaryMissile:{name:'Interplanetare Rakete', desc:'Einweg-Fernwaffe gegen gegnerische Verteidigung in Reichweite des Raketensilos.', base:{iron:10000, sulfur:5000, steel:2000}, isDefense:true, attack:12000, shield:0, hull:1, requires:{missileSilo:4}},
  },
  research: {
    energyTech:{name:'Energietechnik', desc:'Grundlagentechnologie für effizientere Energiegewinnung, Voraussetzung für viele weitere Forschungen.', base:{silver:700, uranium:500, batteryCells:150}, requires:{researchLab:1}},
    combustion:{name:'Verbrennungstriebwerk', desc:'Verbessert konventionelle Schiffsantriebe.', base:{iron:400, crudeOil:600, steel:100}, requires:{researchLab:1, energyTech:1}},
    computerTech:{name:'Computertechnik', desc:'Erhöht die maximale Anzahl gleichzeitiger Flottenbewegungen und ist Grundlage für viele Technologien.', base:{lithium:600, naturalGas:400, electronics:200}, requires:{researchLab:1}},
    weaponsTech:{name:'Waffentechnik', desc:'Erhöht die Angriffskraft aller Schiffe und Verteidigungsanlagen.', base:{iron:700, silver:300, steel:150}, requires:{researchLab:4}},
    shieldingTech:{name:'Schildtechnik', desc:'Erhöht die Schildstärke aller Schiffe und Verteidigungsanlagen.', base:{aluminium:250, silver:550, alloy:100}, requires:{researchLab:6, energyTech:3}},
    espionageTech:{name:'Spionagetechnik', desc:'Verbessert Spionageberichte und die Erfolgschance bei Forschungsdiebstahl.', base:{copper:300, lithium:800, naturalGas:300, electronics:150}, requires:{researchLab:3}},
    impulseDrive:{name:'Impulstriebwerk', desc:'Schnellerer Antrieb für mittelschwere Schiffe.', base:{aluminium:2000, lithium:3600, crudeOil:1000, batteryCells:500}, requires:{researchLab:2, energyTech:1}},
    armourTech:{name:'Rumpfpanzerung', desc:'Erhöht die Hüllenstärke aller Schiffe und Verteidigungsanlagen.', base:{iron:700, nickel:300, steel:200}, requires:{researchLab:2}},
    hyperspaceTech:{name:'Hyperraumtechnik', desc:'Grundlage für Hyperraumantrieb und weitere fortschrittliche Technologien.', base:{rareEarths:4000, uranium:2000, compositeMaterial:400}, requires:{researchLab:7, energyTech:5, shieldingTech:5}},
    hyperspaceDrive:{name:'Hyperraumantrieb', desc:'Schnellster verfügbarer Antrieb für große Kriegsschiffe.', base:{aluminium:10000, rareEarths:18000, uranium:8000, machineParts:1000}, requires:{researchLab:7, hyperspaceTech:3}},
    laserTech:{name:'Lasertechnik', desc:'Grundlage für Laserwaffen und weiterführende Waffentechnologien.', base:{copper:180, silver:120, electronics:80}, requires:{researchLab:1, energyTech:2}},
    ionTech:{name:'Iontechnik', desc:'Grundlage für Ionenwaffen und -verteidigung.', base:{aluminium:800, lithium:400, naturalGas:200, electronics:150}, requires:{researchLab:4, laserTech:5, energyTech:4}},
    plasmaTech:{name:'Plasmatechnik', desc:'Grundlage für Plasmawaffen, die stärkste konventionelle Waffentechnologie.', base:{aluminium:2000, rareEarths:4200, uranium:800, compositeMaterial:300}, requires:{researchLab:4, energyTech:8, laserTech:10, ionTech:5}},
    gravitonTech:{name:'Gravitationstechnik', desc:'Extrem aufwendige Forschung, Voraussetzung für den Todesstern.', base:{}, requires:{researchLab:12}},
    astrophysics:{name:'Astrophysik', desc:'Erhöht die maximale Anzahl an Kolonien und gleichzeitigen Expeditionen.', base:{aluminium:5000, lithium:7000, crudeOil:4000, alloy:900}, requires:{researchLab:3, espionageTech:4, impulseDrive:3}},
    intergalacticNetwork:{name:'Intergalaktisches Forschungsnetzwerk', desc:'Beschleunigt die Forschung durch ein Netzwerk verbundener Forschungslabore.', base:{aluminium:250000, rareEarths:400000, naturalGas:150000, machineParts:1500}, requires:{researchLab:10, computerTech:8}},
  },
  ships: {
    smallCargo:{name:'Kleiner Transporter', desc:'Günstiger Transporter für kleinere Ladungen.', cost:{iron:2500, aluminium:1500, steel:400}, cargo:5000, speed:1, fuel:12, attack:5, shield:10, hull:4000, role:'cargo', requires:{shipyard:2}},
    largeCargo:{name:'Großer Transporter', desc:'Transporter mit deutlich größerer Ladekapazität.', cost:{iron:7500, aluminium:4500, steel:1200}, cargo:25000, speed:0.8, fuel:28, attack:5, shield:25, hull:12000, role:'cargo', requires:{shipyard:4}},
    colonyShip:{name:'Kolonieschiff', desc:'Wird für die Gründung neuer Kolonien benötigt.', cost:{aluminium:4000, lithium:4000, crudeOil:3000}, cargo:7500, speed:0.6, fuel:60, attack:0, shield:100, hull:30000, role:'colony', requires:{shipyard:4, combustion:3}},
    espionageProbe:{name:'Spionagesonde', desc:'Günstige, schnelle Sonde für Spionagemissionen.', cost:{lithium:1000, electronics:200}, cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'probe', requires:{shipyard:3, combustion:3}},
    lightFighter:{name:'Leichter Jäger', desc:'Günstiges Kampfschiff für frühe Angriffe.', cost:{iron:3000, aluminium:1000, steel:500}, cargo:50, speed:1.4, fuel:20, attack:50, shield:10, hull:4000, role:'combat', requires:{shipyard:1, combustion:1}},
    heavyFighter:{name:'Schwerer Jäger', desc:'Robusteres Kampfschiff mit mehr Feuerkraft als der leichte Jäger.', cost:{iron:6000, aluminium:3000, copper:1000, steel:900}, cargo:100, speed:1.0, fuel:25, attack:150, shield:25, hull:10000, role:'combat', requires:{shipyard:3, armourTech:2, impulseDrive:2}},
    cruiser:{name:'Kreuzer', desc:'Vielseitiges Kampfschiff, effektiv gegen leichte Jäger.', cost:{iron:18000, aluminium:8000, crudeOil:3000, steel:2500}, cargo:800, speed:1.1, fuel:40, attack:400, shield:50, hull:27000, role:'combat', requires:{shipyard:5, weaponsTech:2}},
    battleship:{name:'Schlachtschiff', desc:'Schweres Kampfschiff mit hoher Feuerkraft und Hülle.', cost:{iron:42000, aluminium:18000, steel:5000}, cargo:1500, speed:0.8, fuel:50, attack:1000, shield:200, hull:60000, role:'combat', requires:{shipyard:7, hyperspaceDrive:4}},
    battlecruiser:{name:'Großer Kreuzer', desc:'Spezialisiert auf die Bekämpfung von Verteidigungsanlagen.', cost:{aluminium:35000, lithium:35000, crudeOil:15000, alloy:4000}, cargo:750, speed:0.9, fuel:250, attack:700, shield:400, hull:70000, role:'combat', requires:{shipyard:8, hyperspaceTech:5, laserTech:12}},
    bomber:{name:'Bomber', desc:'Spezialisiert auf die Zerstörung feindlicher Verteidigungsanlagen.', cost:{iron:50000, aluminium:25000, crudeOil:15000, machineParts:2000}, cargo:500, speed:0.6, fuel:65, attack:1000, shield:500, hull:75000, role:'combat', requires:{shipyard:8, plasmaTech:5, impulseDrive:6}},
    destroyer:{name:'Zerstörer', desc:'Schweres Kampfschiff, besonders effektiv gegen Bomber.', cost:{iron:65000, aluminium:45000, crudeOil:15000, alloy:6000}, cargo:2000, speed:0.7, fuel:100, attack:2000, shield:500, hull:110000, role:'combat', requires:{shipyard:9, hyperspaceTech:5, hyperspaceDrive:6}},
    reaper:{name:'Reaper', desc:'Elite-Kampfschiff mit enormer Feuerkraft und Hülle.', cost:{iron:85000, aluminium:50000, rareEarths:25000, machineParts:4000}, cargo:10000, speed:0.6, fuel:80, attack:2800, shield:700, hull:140000, role:'combat', requires:{shipyard:10, spaceDock:1, hyperspaceTech:6, hyperspaceDrive:7}},
    pathfinder:{name:'Pfadfinder', desc:'Schnelles, vielseitiges Schiff mit hoher Ladekapazität.', cost:{aluminium:10000, lithium:14000, crudeOil:7000, electronics:1500}, cargo:10000, speed:1.6, fuel:20, attack:200, shield:100, hull:23000, role:'combat', requires:{shipyard:5, spaceDock:1, hyperspaceDrive:2, hyperspaceTech:3}},
    deathstar:{name:'Todesstern', desc:'Die mächtigste Waffe im Universum - extrem teuer und stark.', cost:{iron:4000000, aluminium:3000000, rareEarths:2000000, precisionComponents:15000}, cargo:1000000, speed:0.4, fuel:1, attack:200000, shield:50000, hull:9000000, role:'combat', requires:{shipyard:12, hyperspaceTech:6, gravitonTech:1}},
    solarSatellite:{name:'Solarsatellit', desc:'Liefert zusätzliche Energie, kann sich nicht bewegen oder kämpfen.', cost:{silver:1800, crudeOil:700}, cargo:0, speed:0, fuel:0, attack:1, shield:1, hull:2000, role:'power', requires:{}},
    recycler:{name:'Recycler', desc:'Sammelt Trümmerfelder nach Schlachten ein.', cost:{iron:11000, aluminium:5000, crudeOil:2000, steel:800}, cargo:20000, speed:0.7, fuel:30, attack:1, shield:10, hull:16000, role:'recycler', requires:{shipyard:4, combustion:6}},
    researchProbe:{name:'Forschungssonde', desc:'Baugleich mit der Spionagesonde, ermöglicht aber bei Spionage gegen NPC-Kolonien den Diebstahl fremder Forschung.', cost:{lithium:1000, electronics:150}, cargo:5, speed:3, fuel:1, attack:0, shield:0, hull:1000, role:'research', requires:{shipyard:3, combustion:3}},
  },
  items: {
    oreBooster:{name:'Erz-Produktionsbooster', desc:'Erhöht die Produktion aller Erze (Eisen, Kupfer, Aluminium, Nickel, Kalkstein) für 24 Stunden um 50%.', group:'ore', durationHours:24},
    techBooster:{name:'Technologiemetall-Produktionsbooster', desc:'Erhöht die Produktion aller Technologiemetalle (Gold, Silber, Lithium, Seltene Erden) für 24 Stunden um 50%.', group:'tech', durationHours:24},
    fuelBooster:{name:'Energieträger-Produktionsbooster', desc:'Erhöht die Produktion aller Energieträger (Rohöl, Erdgas, Kohle, Uran) für 24 Stunden um 50%.', group:'fuel', durationHours:24},
    speedBooster:{name:'Flottengeschwindigkeitsbooster', desc:'Erhöht die Fluggeschwindigkeit aller Flotten für 24 Stunden um 30%.', effect:'speedBoost', durationHours:24},
  },
  lifeformBuildings: {
    humanResidence:{name:'Wohnkomplex', desc:'Menschliche Siedlungen, die effizienter Erze fördern. +2% Erzproduktion pro Stufe.', species:'humans', boostsGroup:'ore', base:{iron:5000, copper:2200}},
    humanFarm:{name:'Nahrungsfarm', desc:'Versorgt die wachsende Bevölkerung und steigert nebenbei die Technologiemetall-Gewinnung. +2% pro Stufe.', species:'humans', boostsGroup:'tech', base:{gold:4200, silver:4200}},
    humanBank:{name:'Handelszentrum', desc:'Effizientere Energielogistik durch florierenden Handel. +2% Energieträger-Produktion pro Stufe.', species:'humans', boostsGroup:'fuel', base:{crudeOil:3500, naturalGas:2500}},
    rocktalMeditation:{name:'Meditationshalle', desc:"Rock'tal-Weisheit steigert die Effizienz der Erzförderung. +2% Erzproduktion pro Stufe.", species:'rocktal', boostsGroup:'ore', base:{iron:5200, nickel:2000}},
    rocktalCrystalFarm:{name:'Edelmetallfarm', desc:"Von Rock'tal-Mönchen gepflegte Abbaustätten. +2% Technologiemetall-Produktion pro Stufe.", species:'rocktal', boostsGroup:'tech', base:{silver:4400, lithium:4000}},
    rocktalRefinery:{name:'Energie-Raffinerie', desc:"Traditionelle Rock'tal-Destillation. +2% Energieträger-Produktion pro Stufe.", species:'rocktal', boostsGroup:'fuel', base:{coal:3400, uranium:2800}},
    mechasAssembly:{name:'Montagehalle', desc:'Mechas-Automatisierung optimiert den Erzabbau. +2% Erzproduktion pro Stufe.', species:'mechas', boostsGroup:'ore', base:{aluminium:5800, nickel:2000}},
    mechasProcessor:{name:'Metallprozessor', desc:'Mechanische Präzision bei der Technologiemetall-Verarbeitung. +2% pro Stufe.', species:'mechas', boostsGroup:'tech', base:{gold:4600, rareEarths:4400}},
    mechasReactor:{name:'Reaktorkern', desc:'Hocheffiziente Mechas-Reaktoren steigern die Energieträger-Ausbeute. +2% pro Stufe.', species:'mechas', boostsGroup:'fuel', base:{naturalGas:3600, uranium:3200}},
    kaeleshShrine:{name:'Schrein', desc:'Kaelesh-Rituale segnen die Erzförderung. +2% Erzproduktion pro Stufe.', species:'kaelesh', boostsGroup:'ore', base:{copper:4400, limestone:3200}},
    kaeleshMonastery:{name:'Kloster', desc:'Kaelesh-Mönche verfeinern die Technologiemetall-Gewinnung. +2% pro Stufe.', species:'kaelesh', boostsGroup:'tech', base:{lithium:4200, rareEarths:4200}},
    kaeleshOracle:{name:'Orakel', desc:'Prophetische Voraussicht optimiert die Energieträger-Förderung. +2% pro Stufe.', species:'kaelesh', boostsGroup:'fuel', base:{crudeOil:3600, coal:3100}},
  },
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
  mail: [],
  event: null,
  debrisFields: {},
  moons: [],
  activeMoonIndex: null,
  alliance: null,
  alliancesList: [],
  officerExpiry: {},
  darkMatter: 0,
  expeditions: [],
  lifeform: {active:'humans', points:0, buildings:{}, research:{}},
  marketRate: {},
  auction: null,
  logs: [],
  galaxyIndex: 1,
  galaxySystem: 145,
  fleetPrefill: null,
  username: null,
  isAdmin: false,
  adminMode: false,
  factoryTab: 'all'
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
function infoIconHtml(type, key, level){ return `<button type="button" class="info-btn" data-info-type="${type}" data-info-key="${key}" data-info-level="${level!=null?level:0}" title="Info" aria-label="Info">ⓘ</button>`; }
function closeInfoModal(){ const m=document.getElementById('infoModal'); if(m) m.remove(); }
function levelEffectText(d, key, lvl){
  const parts = [];
  if(d.prod) parts.push('Produktion '+fmt(Math.floor(d.prod(lvl)))+'/h');
  if(d.power) parts.push('Energie +'+fmt(Math.floor(d.power(lvl))));
  if(d.powerUse) parts.push('Verbrauch -'+fmt(Math.floor(d.powerUse(lvl)))+' Energie');
  if(d.uraniumUse) parts.push('Uran '+fmt(Math.floor(d.uraniumUse(lvl)))+'/h');
  if(RESOURCE_GROUPS[d.storageGroup]) parts.push('Kapazität '+fmt(Math.max(5000,5000*lvl)));
  if(d.boostsGroup){ const groupName=RESOURCE_GROUPS[d.boostsGroup]?RESOURCE_GROUPS[d.boostsGroup].name:d.boostsGroup; parts.push('+'+(lvl*2)+'% '+groupName+'-Produktion'); }
  if(d.recipe){
    parts.push('Produktion '+fmt(Math.floor(d.recipe.prod(lvl)))+' '+RESOURCE_INFO[d.recipe.output].name+'/h (bei voller Kapazität)');
    for(const [inputKey,perUnit] of Object.entries(d.recipe.inputsPerUnit)){
      parts.push('Verbraucht '+fmt(Math.floor(d.recipe.prod(lvl)*perUnit))+' '+RESOURCE_INFO[inputKey].name+'/h');
    }
  }
  return parts.length ? parts.join(' · ') : null;
}
function openInfoModal(type, key, level){
  closeInfoModal();
  const table = type==='building' ? defs.buildings : (type==='research' ? defs.research : (type==='lifeformBuilding' ? defs.lifeformBuildings : defs.ships));
  const d = table && table[key];
  if(!d) return;
  // Storage buildings boost capacity for their entire resource group, e.g. oreStorage -> 'ore'.
  const storageGroupEntry = Object.entries(RESOURCE_GROUPS).find(([,g])=>g.storageBuilding===key);
  if(storageGroupEntry) d.storageGroup = storageGroupEntry[0];
  const p = active();
  const isLeveled = type==='research' || type==='lifeformBuilding' || (type==='building' && !d.isDefense);
  const statsRows = [];
  let levelTableHtml = '';
  if(isLeveled){
    const curLevel = level||0;
    const hasEffect = levelEffectText(d, key, curLevel+1)!=null;
    const showTime = (type==='building' || type==='research') && p;
    const rows = [];
    for(let lvl=curLevel+1; lvl<=curLevel+10; lvl++){
      const base = (type==='building' && p) ? costBaseFor(d, p) : d.base;
      const cost = (type==='research'||type==='lifeformBuilding') ? scaledCost(base, lvl) : buildingCost(base, lvl);
      const effect = levelEffectText(d, key, lvl);
      const timeCell = showTime ? `<td>${formatDuration(buildSeconds(type==='research'?'research':'building', cost, p, lvl)*1000)}</td>` : '';
      rows.push(`<tr><td>${lvl}</td><td class="info-modal-cost">${resCostText(cost)}</td>${timeCell}${hasEffect?`<td class="info-modal-effect">${effect||''}</td>`:''}</tr>`);
    }
    levelTableHtml = `<div class="info-modal-subhead">Aktuelle Stufe: ${curLevel} · Kosten &amp; Effekt nächste 10 Stufen</div>
      <div class="info-modal-scroll"><table class="info-modal-table info-modal-leveltable">
        <thead><tr><th>Stufe</th><th>Kosten</th>${showTime?'<th>Bauzeit</th>':''}${hasEffect?'<th>Effekt</th>':''}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table></div>`;
    if(d.resource){
      const availableTypes = planetTypesForResource(d.resource);
      const onCurrentPlanet = availableTypes.length===0 || (p && availableTypes.includes(p.planetType));
      let val = availableTypes.length ? availableTypes.map(t=>PLANET_TYPES[t].name).join(', ') : 'nur nach Terraformierung';
      if(!onCurrentPlanet) val += ' · nicht auf diesem Planeten - alternativ Marktplatz oder Söldnerhändler';
      statsRows.push(['Planetentyp', val]);
    }
    if(d.requires && Object.keys(d.requires).length) statsRows.push(['Voraussetzung', requirementText(d.requires)]);
  } else {
    const cost = d.cost || d.base;
    if(cost) statsRows.push(['Kosten', resCostText(cost)]);
    if(cost && p){
      const isDefenseItem = type==='building' && d.isDefense;
      let timeCost = cost;
      if(isDefenseItem){ const disc=commanderDiscount(); timeCost={}; for(const k of RESOURCE_KEYS) timeCost[k]=Math.floor((cost[k]||0)*disc); }
      statsRows.push(['Bauzeit', formatDuration(buildSeconds(isDefenseItem?'defense':'ship', timeCost, p, 1)*1000)]);
    }
    if(d.attack!=null) statsRows.push(['Angriff', fmt(d.attack)]);
    if(d.shield!=null) statsRows.push(['Schild', fmt(d.shield)]);
    if(d.hull!=null) statsRows.push(['Hülle', fmt(d.hull)]);
    if(d.cargo!=null) statsRows.push(['Ladekapazität', fmt(d.cargo)]);
    if(d.speed!=null) statsRows.push(['Geschwindigkeit', d.speed]);
    if(d.fuel!=null) statsRows.push(['Treibstoffverbrauch (Rohöl)', fmt(d.fuel)]);
    if(d.requires && Object.keys(d.requires).length) statsRows.push(['Voraussetzung', requirementText(d.requires)]);
  }
  const modal = document.createElement('div');
  modal.id = 'infoModal';
  modal.className = 'info-modal';
  modal.innerHTML = `<div class="info-modal-box">
    <div class="info-modal-head"><strong>${d.name}</strong><button type="button" class="info-modal-close" data-info-close="1">&times;</button></div>
    <div class="info-modal-body">
      <p>${d.desc||'Keine Beschreibung verfügbar.'}</p>
      ${statsRows.length ? `<table class="info-modal-table">${statsRows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>` : ''}
      ${levelTableHtml}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function closeBattleSimModal(){ const m=document.getElementById('battleSimModal'); if(m) m.remove(); }
// Monte-Carlo-Vorschau: repliziert die serverseitige simulateBattle()-Rundenlogik client-
// seitig auf Basis der im Spionagebericht gespeicherten aggregierten Verteidigungsmacht -
// keine erneute Serveranfrage, kein zusätzliches Informationsleck ueber die einzelnen
// Verteidigungseinheiten hinaus (nur Summenwerte, wie sie der Bericht ohnehin schon zeigt).
function simulateBattlePreviewClient(attAgg, defAgg, trials){
  trials = trials || 50;
  let wins=0, totalAttLoss=0, totalDefLoss=0, totalRounds=0;
  for(let t=0; t<trials; t++){
    let attHull=attAgg.hull, defHull=defAgg.hull, rounds=0;
    const variance=()=>0.9+Math.random()*0.2;
    while(rounds<6 && attHull>0 && defHull>0){
      rounds++;
      const dmgToDef = Math.max(0, attAgg.attack*variance() - defAgg.shield);
      const dmgToAtt = Math.max(0, defAgg.attack*variance() - attAgg.shield);
      defHull -= dmgToDef; attHull -= dmgToAtt;
    }
    const attackerWon = defHull<=0 && attHull>0;
    if(attackerWon) wins++;
    totalAttLoss += attAgg.hull>0 ? Math.min(1,Math.max(0,(attAgg.hull-Math.max(0,attHull))/attAgg.hull)) : 0;
    totalDefLoss += defAgg.hull>0 ? Math.min(1,Math.max(0,(defAgg.hull-Math.max(0,defHull))/defAgg.hull)) : 1;
    totalRounds += rounds;
  }
  return { winRate: wins/trials, avgAttackerLoss: totalAttLoss/trials, avgDefenderLoss: totalDefLoss/trials, avgRounds: totalRounds/trials };
}
function openBattleSimulator(reportIndex){
  closeBattleSimModal();
  const r = state.reports[reportIndex];
  if(!r || !r.defenderPower) return;
  const sendableShips = Object.entries(defs.ships).filter(([,d])=>d.role!=='power');
  const modal = document.createElement('div');
  modal.id = 'battleSimModal';
  modal.className = 'info-modal';
  modal.innerHTML = `<div class="info-modal-box" style="max-width:480px">
    <div class="info-modal-head"><strong>Kampfsimulator: ${r.target}</strong><button type="button" class="info-modal-close" data-info-close="1">&times;</button></div>
    <div class="info-modal-body">
      <p>Basierend auf dem Spionagebericht von ${r.time}. Die tatsächliche Verteidigung kann sich seitdem geändert haben.</p>
      <div class="small" style="margin-bottom:10px">Verteidigungsmacht laut Bericht: Angriff ${fmt(r.defenderPower.attack)} · Schild ${fmt(r.defenderPower.shield)} · Hülle ${fmt(r.defenderPower.hull)}</div>
      <div class="info-modal-subhead">Eigene Angriffsflotte (Anzahl)</div>
      <div class="grid3" id="battleSimShips">${sendableShips.map(([k,d])=>`<label>${d.name}<input type="number" min="0" value="0" data-sim-ship="${k}"></label>`).join('')}</div>
      <div style="height:10px"></div>
      <button type="button" class="btn good" id="battleSimRunBtn" style="width:100%">Simulieren (50 Durchläufe)</button>
      <div id="battleSimResult" style="margin-top:12px"></div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('battleSimRunBtn').onclick = ()=>{
    const ships = {};
    document.querySelectorAll('#battleSimShips [data-sim-ship]').forEach(inp=>{ ships[inp.dataset.simShip]=Number(inp.value)||0; });
    const attAgg = sidePower(ships, defs.ships);
    const resultBox = document.getElementById('battleSimResult');
    if(attAgg.hull<=0){ resultBox.innerHTML = '<div class="small warn-text">Bitte mindestens ein Schiff angeben.</div>'; return; }
    const result = simulateBattlePreviewClient(attAgg, r.defenderPower, 50);
    resultBox.innerHTML = `<table class="info-modal-table">
      <tr><td>Siegchance</td><td>${Math.round(result.winRate*100)}%</td></tr>
      <tr><td>Ø eigene Verluste</td><td>${Math.round(result.avgAttackerLoss*100)}%</td></tr>
      <tr><td>Ø gegnerische Verluste</td><td>${Math.round(result.avgDefenderLoss*100)}%</td></tr>
      <tr><td>Ø Kampfrunden</td><td>${result.avgRounds.toFixed(1)}</td></tr>
    </table>`;
  };
}
document.addEventListener('click', (e)=>{
  const link = e.target.closest('.coord-link');
  if(link){ e.stopPropagation(); openCoordMenu(link); return; }
  const infoBtn = e.target.closest('.info-btn');
  if(infoBtn){ e.stopPropagation(); openInfoModal(infoBtn.dataset.infoType, infoBtn.dataset.infoKey, Number(infoBtn.dataset.infoLevel)||0); return; }
  if(e.target.closest('[data-info-close]')){ closeInfoModal(); closeBattleSimModal(); return; }
  const modalBox = e.target.closest('.info-modal-box');
  const modalOverlay = e.target.closest('.info-modal');
  if(modalOverlay && !modalBox){ closeInfoModal(); closeBattleSimModal(); return; }
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
// Client-Spiegel der 4 Bauzeit-Formeln aus enqueueBuild/enqueueResearch/enqueueShip/
// enqueueDefense im Server (server/gameEngine.js) - fuer die Bauzeit-Vorschau im Info-Modal.
function buildSeconds(kind, cost, p, lvl){
  const total = resTotal(cost);
  if(kind==='building') return Math.max(8*lvl, Math.round(total/(250*(1+p.buildings.robotFactory))));
  if(kind==='research') return Math.max(12*lvl, Math.round(total/(220*(1+p.buildings.researchLab))*technocratSpeed()*networkSpeed(p)));
  if(kind==='ship') return Math.max(6, Math.round(total/(300*(1+p.buildings.shipyard))));
  if(kind==='defense') return Math.max(5, Math.round(total/(300*(1+p.buildings.shipyard))));
  return 0;
}
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
    if(!everConnected && !viewInteractionActive()) render();
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
    const wasEverConnected = everConnected;
    everConnected = true;
    if(opts.forceRender || !wasEverConnected || !viewInteractionActive()) render();
    return;
  }
  if(!Array.isArray(serverState.planets)) return;
  state.adminMode = false;
  state.planets = serverState.planets;
  state.fleets = serverState.fleets || [];
  state.reports = serverState.reports || [];
  state.messages = serverState.messages || [];
  state.mail = serverState.mail || [];
  state.debrisFields = serverState.debrisFields || {};
  state.moons = serverState.moons || [];
  // Guard against an old, not-yet-updated server: its /api/state still sends a legacy
  // alliance:{name:'Unabhängig', tag:'-', ...} placeholder object (truthy!) under the same
  // field name. Only the new server shape always includes "founder" - a placeholder never
  // does - so use that to tell a real membership apart from the stale placeholder and avoid
  // showing a brand-new/independent player as if they were already in an alliance.
  if(serverState.alliance !== undefined) state.alliance = (serverState.alliance && serverState.alliance.founder) ? serverState.alliance : null;
  state.alliancesList = serverState.alliancesList || state.alliancesList;
  state.officerExpiry = serverState.officerExpiry || {};
  state.darkMatter = serverState.darkMatter || 0;
  state.expeditions = serverState.expeditions || [];
  state.lifeform = serverState.lifeform || state.lifeform;
  state.marketRate = serverState.marketRate || state.marketRate;
  state.auction = serverState.auction || state.auction;
  if(serverState.event !== undefined) state.event = serverState.event;
  state.logs = serverState.logs || [];
  const wasEverConnected = everConnected;
  everConnected = true;
  if(state.activePlanet >= state.planets.length || (state.planets[state.activePlanet] && state.planets[state.activePlanet].destroyed)){
    const firstAlive = state.planets.findIndex(p=>!p.destroyed);
    state.activePlanet = firstAlive>=0 ? firstAlive : 0;
  }
  if(state.activeMoonIndex!=null && state.activeMoonIndex >= state.moons.length) state.activeMoonIndex = state.moons.length ? 0 : null;
  if(opts.forceRender || !wasEverConnected || !viewInteractionActive()){
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
      try { const grant={username:b.dataset.adminGrant}; RESOURCE_KEYS.forEach(k=>grant[k]=10000); await apiFetch('/api/admin/grantResources', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(grant)}); adminPlayers=null; fetchAdminPlayers(); }
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
let highscoreCategory = 'points';
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
  const cargo = {}; RESOURCE_KEYS.forEach(k=>{ if(form['cargo_'+k]) cargo[k]=Number(form['cargo_'+k].value)||0; });
  const acsId = (form.mission.value==='attack' && form.acsId) ? form.acsId.value.trim() : '';
  postAction('sendFleet', {planetIndex: state.activePlanet, mission: form.mission.value, gal, sys, pos, ships, cargo, acsId});
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
function scaledCost(base, level){const mult=Math.pow(1.6, level-1); const r={}; for(const k of RESOURCE_KEYS) r[k]=Math.floor((base[k]||0)*mult); return r; }
function buildingCost(base, level){ const c=scaledCost(base, level); const d=commanderDiscount(); const r={}; for(const k of RESOURCE_KEYS) r[k]=Math.floor((c[k]||0)*d); return r; }
function mineByResource(resource){ return Object.entries(defs.buildings).find(([,d])=>d.resource===resource)?.[0]; }
function uraniumUse(p){ return (p.buildings.nuclearReactor) ? defs.buildings.nuclearReactor.uraniumUse(p.buildings.nuclearReactor) : 0; }
// Alle Gebaeude mit einem `recipe`-Feld (analog zu mineByResource fuer Minen).
const FACTORY_KEYS = Object.entries(defs.buildings).filter(([,d])=>d.recipe).map(([k])=>k);
function energyStats(p){
  const solar=defs.buildings.solarPlant.power(p.buildings.solarPlant||0);
  const nuclear=defs.buildings.nuclearReactor.power(p.buildings.nuclearReactor||0);
  const satellites=(p.ships.solarSatellite||0)*20;
  const prod=(solar+nuclear+satellites)*engineerBonus();
  let use=0;
  for(const [k,d] of Object.entries(defs.buildings)){ if(d.resource && d.powerUse) use += d.powerUse(p.buildings[k]||0); }
  for(const k of FACTORY_KEYS){ if(defs.buildings[k].powerUse) use += defs.buildings[k].powerUse(p.buildings[k]||0); }
  return {prod,use,ratio: use? Math.min(1,prod/use):1};
}
// Client-Spiegel von factoryThrottle() im Server: wie stark eine Fabrik gerade gedrosselt
// laufen muss, verhaeltnismaessig zum knappsten Eingaberohstoff. Grundlage der
// Flaschenhals-Anzeige in viewFactories().
function factoryThrottle(p, recipe, lvl){
  if(!lvl) return {throttle:1, limitingInput:null};
  let throttle = 1, limitingInput = null;
  const nameplate = recipe.prod(lvl);
  for(const [inputKey, perUnit] of Object.entries(recipe.inputsPerUnit)){
    const desiredRate = nameplate * perUnit;
    if(desiredRate<=0) continue;
    const ratio = Math.min(1, Math.max(0, p.resources[inputKey]||0) / desiredRate);
    if(ratio < throttle){ throttle = ratio; limitingInput = inputKey; }
  }
  return {throttle, limitingInput};
}
// Bewusste Vereinfachung (bestand schon vor dem Rohstoffsystem-Umbau): die Client-Vorschau
// spiegelt nur Energie/Offiziers-Boni, nicht Item-/Lebensform-Boosts - siehe hourly() im
// Server (server/gameEngine.js) für die vollstaendige, massgebliche Berechnung.
function hourly(p){
  const e=energyStats(p).ratio; const bonus=officerBonus();
  const inc = zeroResources();
  const planetRes = (PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky).resources.concat(p.buildings.sawmill?['wood']:[]);
  for(const res of planetRes){
    const mineKey = mineByResource(res);
    const lvl = mineKey ? (p.buildings[mineKey]||0) : 0;
    if(!lvl) continue;
    inc[res] = defs.buildings[mineKey].prod(lvl)*e*bonus;
  }
  inc.uranium -= uraniumUse(p);
  // Client-Spiegel von applyFactories() im Server - siehe dort fuer die vollstaendige
  // Begruendung (proportionale Drosselung statt hart an/aus, ein Tick Verzoegerung bei
  // mehrstufigen Rezepten, da Tier-2 nur aus vorhandenem Lagerbestand schoepft).
  for(const key of FACTORY_KEYS){
    const lvl = p.buildings[key]||0;
    if(!lvl) continue;
    const recipe = defs.buildings[key].recipe;
    const {throttle} = factoryThrottle(p, recipe, lvl);
    const actualOut = recipe.prod(lvl) * e * throttle;
    inc[recipe.output] = (inc[recipe.output]||0) + actualOut;
    for(const [inputKey, perUnit] of Object.entries(recipe.inputsPerUnit)){
      inc[inputKey] = (inc[inputKey]||0) - actualOut*perUnit;
    }
  }
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
function capacityForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ if(defs.ships[k]) total += defs.ships[k].cargo*v; } return total }
function fuelForShips(shipMap){let total=0; for(const [k,v] of Object.entries(shipMap)){ if(defs.ships[k]) total += defs.ships[k].fuel*v; } return total }
function fleetSpeed(shipMap){const vals=Object.entries(shipMap).filter(([k,v])=>v>0 && defs.ships[k]).map(([k])=>defs.ships[k].speed); return vals.length?Math.min(...vals):1}
function distanceBetween(a,b){return Math.abs(a[0]-b[0])*15000 + Math.abs(a[1]-b[1])*20 + Math.abs(a[2]-b[2]) + 5}
function fleetDuration(fromCoord,toCoord,shipMap){const speed=fleetSpeed(shipMap)*fleetSpeedBonus()*pathfinderBonus(shipMap); const distance=distanceBetween(fromCoord,toCoord); return Math.max(10, Math.round((distance*3)/speed)); }
function secsLeft(t){return Math.max(0, Math.ceil((t-Date.now())/1000))}
function computePoints(p){
  let total=0;
  for(const [k,lvl] of Object.entries(p.buildings)){ const def=defs.buildings[k]; if(!def||!lvl) continue; const base=costBaseFor(def,p); for(let l=1;l<=lvl;l++){ total+=resTotal(scaledCost(base,l)); } }
  for(const [k,lvl] of Object.entries(p.research)){ const def=defs.research[k]; if(!def||!lvl) continue; for(let l=1;l<=lvl;l++){ total+=resTotal(scaledCost(def.base,l)); } }
  for(const [k,v] of Object.entries(p.ships)){ if(defs.ships[k] && v) total += resTotal(defs.ships[k].cost)*v; }
  return total;
}
function totalPlayerPoints(){ return Math.floor(state.planets.filter(p=>!p.destroyed).reduce((s,p)=>s+computePoints(p),0)/1000); }

const navItems = [['overview','Übersicht'],['buildings','Gebäude'],['facilities','Anlagen'],['factories','Fabriken'],['defense','Verteidigung'],['resources','Ressourcen'],['research','Forschung'],['shipyard','Werft'],['fleet','Flotte'],['expeditions','Expeditionen'],['galaxy','Galaxie'],['moons','Monde'],['alliance','Allianz'],['officers','Offiziere'],['lifeform','Lebensform'],['market','Markt'],['reports','Berichte'],['messages','Nachrichten'],['empire','Imperium'],['highscore','Rangliste'],['settings','Einstellungen']];

function unreadMailCount(){ return (state.mail||[]).filter(m=>m.direction==='in' && !m.read).length; }
function renderNav(){ const unread=unreadMailCount(); $('#nav').innerHTML = navItems.map(([id,label])=>`<button class="${state.view===id?'active':''}" data-view="${id}">${label}${id==='messages'&&unread>0?` <span class="pill active" style="padding:1px 6px;font-size:11px">${unread}</span>`:''}</button>`).join(''); document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ if(b.dataset.view!=='fleet') state.fleetPrefill=null; if(b.dataset.view==='highscore') highscoreCache=null; if(b.dataset.view==='galaxy') galaxyCache={}; state.view=b.dataset.view; if(b.dataset.view==='messages' && unreadMailCount()>0) postAction('markMailRead', {}); render(); }); }
// Die Rohstoff-/Energieanzeige lebt bewusst nur noch im Übersicht-Tab (viewOverview) -
// die obere Leiste zeigt nur noch Planetname/Koordinaten, um Dopplung zu vermeiden.
function renderTop(){
  const p=active(); if(!p) return;
  $('#planetName').textContent=p.name;
  $('#planetCoords').innerHTML=coordLinkHtml(p.coords)+' · '+(PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky).name;
}
function renderSide(){
  $('#planetTabs').innerHTML = state.planets.map((p,i)=>p.destroyed?'':`<button class="pill ${state.activePlanet===i?'active':''}" data-planet="${i}">${p.name}</button>`).join('');
  document.querySelectorAll('[data-planet]').forEach(b=>b.onclick=()=>{state.activePlanet=Number(b.dataset.planet); render();});
  const p=active(); if(!p) return; const qs=[];
  p.buildQueue.forEach(q=>qs.push(`<div class="queue-item">Bau · ${q.name}${q.level?` (Stufe ${q.level})`:''}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.researchQueue.forEach(q=>qs.push(`<div class="queue-item">Forschung · ${q.name}${q.level?` (Stufe ${q.level})`:''}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  p.shipQueue.forEach(q=>qs.push(`<div class="queue-item">Werft · ${q.name}<br><span class="small">${secsLeft(q.done)} s</span></div>`));
  $('#queues').innerHTML = qs.join('') || '<div class="small">Keine aktiven Aufträge.</div>';
  $('#fleetMovements').innerHTML = state.fleets.map(f=>`<div class="queue-item">${missionLabels[f.mission]} ${state.planets[f.from]?state.planets[f.from].name:'?'} → ${coordLinkHtml(f.toCoord)}<br><span class="small">${f.phase==='outbound'?'Ankunft':'Rückflug'} in ${secsLeft(f.phase==='outbound'?f.arrive:f.returnAt)} s</span></div>`).join('') || '<div class="small">Keine Flotten unterwegs.</div>';
  $('#logs').innerHTML = state.logs.map(x=>`<div class="log">${x}</div>`).join('');
}

function viewOverview(){ const p=active(), e=energyStats(p), inc=hourly(p), cap=maxStorage(p); const ev=state.event;
  const eventBanner = ev ? `<div class="card" style="margin-bottom:16px;border-color:var(--accent2)"><h3>🌟 Server-Event: ${ev.name}</h3><div class="small">${ev.desc}</div><div class="small" style="margin-top:6px">Endet in ${formatDuration(ev.endsAt-Date.now())}</div></div>` : '';
  const planetType = PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky;
  // Zeigt JEDEN Rohstoff, den der Planet abbaut, produziert ODER (z.B. durch Handel) tatsaechlich
  // auf Lager hat - nicht nur die zum Planetentyp "heimischen" Rohstoffe wie zuvor.
  const relevant = RESOURCE_KEYS.filter(k=>planetType.resources.includes(k) || (p.resources[k]||0)>0 || (inc[k]||0)!==0);
  const groupCards = RESOURCE_GROUP_ORDER.filter(g=>relevant.some(k=>RESOURCE_INFO[k].group===g)).map(g=>{
    const rows = relevant.filter(k=>RESOURCE_INFO[k].group===g).map(k=>`<div class="row"><div><strong>${RESOURCE_INFO[k].name}</strong></div><div>${fmt(p.resources[k]||0)} / ${fmt(cap[k])}<span class="small" style="margin-left:6px">${fmt1(inc[k]||0)}/h</span></div></div>`).join('');
    return `<div class="card"><h3>${RESOURCE_GROUPS[g].name}</h3><div class="list">${rows}</div></div>`;
  }).join('');
  return `${eventBanner}
  <div class="hero">
    <div class="card"><h2>${escapeHtml(p.name)}</h2><div class="small">${coordLinkHtml(p.coords)} · ${planetType.name}</div>
      <p style="margin-top:8px">${planetType.desc}</p>
      <div class="small" style="margin-top:6px">✓ <strong>Vorteil:</strong> ${planetType.pros}</div>
      <div class="small warn-text" style="margin-top:4px">✕ <strong>Nachteil:</strong> ${planetType.cons}</div>
      <form id="renamePlanetForm" class="market-form" style="margin-top:10px"><label>Planet umbenennen<input type="text" name="name" maxlength="30" value="${escapeHtml(p.name)}"></label><button class="btn alt" type="submit">Speichern</button></form>
    </div>
    <div class="card"><h2>Energie</h2><div class="small">Ohne genug Energie sinkt die Produktion proportional.</div><div style="height:10px"></div><div class="bar"><span style="width:${Math.min(100,(e.prod/Math.max(1,e.use))*100)}%"></span></div><div style="height:10px"></div><div class="small">Produktion ${fmt(e.prod)} · Verbrauch ${fmt(e.use)} · Faktor ${fmt1(e.ratio*100)}%</div></div>
  </div>
  <div class="small" style="margin:16px 0 8px">Rohstoffe (Bestand / Lagerkapazität, Produktion pro Stunde):</div>
  <div class="grid3">${groupCards}</div>
  <div style="height:16px"></div>
  <div class="card"><h3>Flottenstatus</h3><div class="list">${Object.entries(p.ships).filter(([k])=>defs.ships[k]).map(([k,v])=>`<div class="row"><div><strong>${defs.ships[k].name}</strong></div><div>${fmt(v)}</div></div>`).join('')}</div></div>`; }

function viewBuildings(){
  const p=active();
  const planetType = PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky;
  const buildable = Object.entries(defs.buildings).filter(([,d])=>!d.isDefense && !d.facility && !d.factory);
  return `<h2>Gebäude</h2><div class="list">${buildable.map(([k,d])=>{
    const lvl=(p.buildings[k]||0)+1;
    const c=buildingCost(costBaseFor(d,p),lvl);
    const ok=meetsRequirements(p,d.requires);
    const typeOk = !d.resource || planetTypesForResource(d.resource).includes(p.planetType) || d.resource==='wood';
    const queued = p.buildQueue.some(q=>q.key===k);
    const typeHint = !typeOk ? `<div class="sub warn-text">Nicht auf ${planetType.name} abbaubar - vorkommend auf: ${planetTypesForResource(d.resource).map(t=>PLANET_TYPES[t].name).join(', ')}. Alternativ: Marktplatz oder Söldnerhändler.</div>` : '';
    const queuedHint = queued ? `<div class="sub warn-text">Wird bereits gebaut (Stufe ${lvl})</div>` : '';
    return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: ${resCostText(c)}</div>${typeHint}${queuedHint}${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k,p.buildings[k]||0)}<button class="btn" data-build="${k}" ${ok&&typeOk&&!queued?'':'disabled'}>Ausbauen</button></div></div>`;
  }).join('')}</div>`;
}

function viewFacilities(){ const p=active(); const facKeys = Object.entries(defs.buildings).filter(([,d])=>d.facility && !d.moonOnly); return `<h2>Anlagen</h2><div class="list">${facKeys.map(([k,d])=>{ const lvl=(p.buildings[k]||0)+1; const c=buildingCost(costBaseFor(d,p),lvl); const ok=meetsRequirements(p,d.requires); const queued=p.buildQueue.some(q=>q.key===k); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.buildings[k]||0}</div><div class="sub">Kosten: ${resCostText(c)}</div>${queued?`<div class="sub warn-text">Wird bereits gebaut (Stufe ${lvl})</div>`:''}${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k,p.buildings[k]||0)}<button class="btn alt" data-build="${k}" ${ok&&!queued?'':'disabled'}>Ausbauen</button></div></div>`; }).join('')}</div>`; }

// Ist ein Fabrik-Rezept Tier 2 (verbraucht mind. ein anderes Industriegut statt nur
// Rohstoffe)? Wird ueber die Rohstoffgruppe der Eingaben erkannt, kein Extra-Flag noetig.
// Tiefe eines Fabrik-Rezepts: 1, wenn alle Eingaben reine Rohstoffe sind, sonst
// 1 + die groesste Tiefe der Fabrik(en), die die verbrauchten Zwischenprodukte
// herstellen. Ersetzt die alte isTier2Factory() (die nur "verbraucht irgendein
// Gut" erkennen konnte und Tier 2/3 nicht mehr unterscheiden kann, sobald es
// mehr als zwei Tiers gibt).
function factoryTier(key){
  const d = defs.buildings[key];
  let maxInputTier = 0;
  for(const inputKey of Object.keys(d.recipe.inputsPerUnit)){
    const producer = FACTORY_KEYS.find(fk=>defs.buildings[fk].recipe.output===inputKey);
    if(producer){ maxInputTier = Math.max(maxInputTier, factoryTier(producer)); }
  }
  return maxInputTier + 1;
}
function viewFactories(){
  const p=active(); const allFactories = Object.entries(defs.buildings).filter(([,d])=>d.factory);
  const isThrottled = ([k,d])=>{ const lvl=p.buildings[k]||0; if(!lvl) return false; return factoryThrottle(p,d.recipe,lvl).throttle<1; };
  const tabs = [['all','Alle'],['tier1','Tier 1'],['tier2','Tier 2'],['tier3','Tier 3'],['bottleneck','Engpässe']];
  const tabHtml = `<div class="subnav">${tabs.map(([id,label])=>`<button class="${state.factoryTab===id?'active':''}" data-factory-tab="${id}">${label}</button>`).join('')}</div>`;

  let shown = allFactories;
  if(state.factoryTab==='tier1') shown = allFactories.filter(([k])=>factoryTier(k)===1);
  else if(state.factoryTab==='tier2') shown = allFactories.filter(([k])=>factoryTier(k)===2);
  else if(state.factoryTab==='tier3') shown = allFactories.filter(([k])=>factoryTier(k)===3);
  else if(state.factoryTab==='bottleneck') shown = allFactories.filter(isThrottled);

  const throttled = allFactories.filter(isThrottled);
  const bottleneckCard = `<div class="card"><h3>Aktuelle Engpässe</h3>${throttled.length ? `<div class="list">${throttled.map(([k,d])=>{
    const lvl=p.buildings[k]||0; const {throttle,limitingInput}=factoryThrottle(p,d.recipe,lvl);
    return `<div class="row"><div><strong>${d.name}</strong></div><div class="danger-text">${Math.round(throttle*100)}% Kapazität · Engpass: ${RESOURCE_INFO[limitingInput].name}</div></div>`;
  }).join('')}</div>` : '<div class="small">Keine Engpässe - alle Fabriken laufen mit voller Kapazität.</div>'}</div>`;

  const rows = shown.map(([k,d])=>{
    const curLvl=p.buildings[k]||0, lvl=curLvl+1;
    const c=buildingCost(costBaseFor(d,p),lvl);
    const ok=meetsRequirements(p,d.requires);
    const queued=p.buildQueue.some(q=>q.key===k);
    const recipeText = Object.entries(d.recipe.inputsPerUnit).map(([ik,amt])=>`${amt}× ${RESOURCE_INFO[ik].name}`).join(' + ') + ` → ${RESOURCE_INFO[d.recipe.output].name}`;
    let statusHtml = '';
    if(curLvl>0){
      const {throttle,limitingInput} = factoryThrottle(p, d.recipe, curLvl);
      const pct = Math.round(throttle*100);
      const capText = throttle<1 ? `<span class="danger-text">Läuft mit ${pct}% Kapazität · Engpass: ${RESOURCE_INFO[limitingInput].name}</span>` : 'Läuft mit voller Kapazität';
      statusHtml = `<div class="sub">${capText}</div><div class="bar${throttle<1?' bar-danger':''}" style="margin-top:4px"><span style="width:${pct}%"></span></div>`;
    }
    return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${curLvl}</div><div class="sub">Rezept: ${recipeText}</div><div class="sub">Kosten: ${resCostText(c)}</div>${statusHtml}${queued?`<div class="sub warn-text">Wird bereits gebaut (Stufe ${lvl})</div>`:''}${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k,curLvl)}<button class="btn alt" data-build="${k}" ${ok&&!queued?'':'disabled'}>Ausbauen</button></div></div>`;
  }).join('') || '<div class="small">Keine Fabriken in dieser Kategorie.</div>';

  return `<h2>Fabriken</h2>${tabHtml}<div style="height:12px"></div>${bottleneckCard}<div style="height:12px"></div><div class="list">${rows}</div>`;
}
function viewResources(){ const p=active(), inc=hourly(p), e=energyStats(p); const planetType=PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky; const shown=RESOURCE_KEYS.filter(k=>planetType.resources.includes(k) || (p.resources[k]||0)>0 || (inc[k]||0)!==0); return `<h2>Ressourcen</h2><div class="grid2"><div class="card"><h3>Produktion pro Stunde</h3><div class="list">${shown.map(k=>`<div class="row"><span>${RESOURCE_INFO[k].name}</span><strong>${fmt1(inc[k]||0)}</strong></div>`).join('')}</div></div><div class="card"><h3>Energieeffizienz</h3><div class="bar"><span style="width:${Math.min(100,e.ratio*100)}%"></span></div><div style="height:10px"></div><div class="small">${fmt(e.prod)} verfügbar · ${fmt(e.use)} benötigt</div></div></div>`; }
function viewResearch(){ const p=active(); return `<h2>Forschung</h2><div class="small">Max. Kolonien: ${maxColonies(p)} · Max. gleichzeitige Expeditionen: ${maxExpeditions(p)} (abhängig von Astrophysik)</div><div style="height:10px"></div><div class="list">${Object.entries(defs.research).map(([k,d])=>{ const lvl=p.research[k]+1; const c=scaledCost(d.base,lvl); const ok=meetsRequirements(p,d.requires); const queued=p.researchQueue.some(q=>q.key===k); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${p.research[k]}</div><div class="sub">Kosten: ${resCostText(c)}</div>${queued?`<div class="sub warn-text">Wird bereits erforscht (Stufe ${lvl})</div>`:''}${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('research',k,p.research[k])}<button class="btn good" data-research="${k}" ${ok&&!queued?'':'disabled'}>Forschen</button></div></div>`; }).join('')}</div>`; }
function viewShipyard(){ const p=active(); return `<h2>Raumschiffwerft</h2><div class="list">${Object.entries(defs.ships).map(([k,d])=>{ const ok=meetsRequirements(p,d.requires); return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(p.ships[k]||0)} · Angriff ${d.attack} · Ladung ${fmt(d.cargo)}</div><div class="sub">Kosten: ${resCostText(d.cost)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('ship',k)}<button class="btn warn" data-ship="${k}" ${ok?'':'disabled'}>Bauen</button></div></div>`; }).join('')}</div>`; }

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
    <div id="acsField" style="display:${missionVal==='attack'?'block':'none'}">
      <label>ACS-Code (optional, Allianz-Kampfstärke)<input type="text" name="acsId" placeholder="z.B. RAID-42" maxlength="24"></label>
      <div class="small">Gleicher Code + gleiches Ziel wie ein Allianzmitglied lässt eure Flotten gemeinsam und zeitgleich ankommen und als eine Streitmacht kämpfen. Erfordert denselben Allianz-Tag auf beiden Seiten. Leer lassen für einen normalen Solo-Angriff.</div>
    </div>
    <div class="grid3">
      ${sendableShips.map(([k,d])=>`<label>${d.name}<select name="${k}">${shipOptions(k)}</select></label>`).join('')}
    </div>
    <div class="info-modal-subhead" style="margin-top:6px">Fracht (nur bei Transport relevant)</div>
    <div class="grid4">${RESOURCE_KEYS.map(k=>`<label>${RESOURCE_INFO[k].name}<input type="number" min="0" name="cargo_${k}" value="0"></label>`).join('')}</div>
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
    const debrisRow = debris ? `<div class="sub">Trümmerfeld: ${fmt(resTotal(debris))} <button class="btn alt" data-mission-target="harvest:${gal}:${sys}:${s.pos}" style="margin-left:8px;padding:6px 10px;min-height:32px">Bergen</button></div>` : '';
    if(s.type==='own') return `<div class="slot own"><div>${s.pos}</div><div><strong>${s.planet.name}</strong><div class="sub">${coordLinkHtml(s.planet.coords)} · ${(PLANET_TYPES[s.planet.planetType]||PLANET_TYPES.rocky).name}</div>${debrisRow}</div><div><span class="badge own">Eigen</span></div><div class="sub">Rohstoffe ${fmt(resTotal(s.planet.resources))}</div><div></div></div>`;
    if(s.type==='player') return `<div class="slot"><div>${s.pos}</div><div><strong>${s.planetName}</strong><div class="sub">Spieler: ${s.ownerUsername}</div>${debrisRow}</div><div><span class="badge npc">Spieler</span></div><div class="sub">—</div><div><button class="btn danger" data-mission-target="attack:${gal}:${sys}:${s.pos}">Angriff</button> <button class="btn alt" data-mission-target="spy:${gal}:${sys}:${s.pos}">Spionage</button> <button class="btn" data-mission-target="transport:${gal}:${sys}:${s.pos}">Transport</button></div></div>`;
    if(s.type==='npc'){ const defPower = sidePower(s.defenseShips, defs.buildings).attack; const ptName=(PLANET_TYPES[s.planetType]||PLANET_TYPES.rocky).name; return `<div class="slot"><div>${s.pos}</div><div><strong>${s.name}</strong><div class="sub">Stufe ${s.level} · ${ptName}</div>${debrisRow}</div><div><span class="badge npc">NPC</span></div><div class="sub">Def ${fmt(defPower)}</div><div><button class="btn danger" data-mission-target="attack:${gal}:${sys}:${s.pos}">Angriff</button> <button class="btn alt" data-mission-target="spy:${gal}:${sys}:${s.pos}">Spionage</button></div></div>`; }
    const emptyTypeName=(PLANET_TYPES[s.planetType]||PLANET_TYPES.rocky).name;
    return `<div class="slot empty"><div>${s.pos}</div><div>Freies Feld <span class="sub">(${emptyTypeName})</span>${debrisRow}</div><div><span class="badge empty">Leer</span></div><div class="sub">—</div><div><button class="btn good" data-mission-target="colonize:${gal}:${sys}:${s.pos}">Kolonisieren</button></div></div>`;
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
    const c={}; for(const rk of RESOURCE_KEYS) c[rk]=Math.floor((d.base[rk]||0)*d2);
    const capNote = k==='interplanetaryMissile' ? `<div class="sub">Kapazität: ${count}/${missileCap} (Raketensilo)</div>` : '';
    return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Vorhanden ${fmt(count)} · Angriff ${d.attack} · Schild ${fmt(d.shield)} · Hülle ${fmt(d.hull)}</div>${capNote}<div class="sub">Kosten: ${resCostText(c)}</div>${!ok?`<div class="sub warn-text">Benötigt: ${requirementText(d.requires)}</div>`:''}${uniqueBlocked?'<div class="sub warn-text">Bereits vorhanden (Unikat)</div>':''}${missileBlocked?'<div class="sub warn-text">Silo-Kapazität erreicht</div>':''}</div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('building',k)}<button class="btn danger" data-defense="${k}" ${disabled?'disabled':''}>Bauen</button></div></div>`;
  }).join('');
  const missileForm = (missileCap>=1 && (p.buildings.interplanetaryMissile||0)>0) ? missileLaunchFormHtml(p) : '';
  return `<h2>Verteidigung</h2><div class="list">${rows}</div><div style="height:16px"></div>${missileForm}`;
}

function viewMessages(){
  const mail = state.mail||[];
  const unreadCount = mail.filter(m=>m.direction==='in' && !m.read).length;
  const mailRows = mail.length ? mail.map(m=>{
    const who = m.direction==='in' ? ('Von '+escapeHtml(m.from)) : ('An '+escapeHtml(m.to));
    const unread = m.direction==='in' && !m.read;
    return `<div class="report"${unread?' style="border-color:var(--accent2)"':''}><div class="row" style="border:none;background:none;padding:0"><strong>${who}</strong><span class="small">${m.time}</span></div><div class="small" style="margin-top:6px;white-space:pre-wrap">${escapeHtml(m.text)}</div></div>`;
  }).join('') : '<div class="small">Noch keine Spielernachrichten.</div>';
  const systemHtml = state.messages.length ? `<div class="list">${state.messages.map(m=>`<div class="report">${m}</div>`).join('')}</div>` : '<div class="small">Keine Systemnachrichten.</div>';
  return `<h2>Nachrichten</h2><div class="grid2">
  <div class="card"><h3>Neue Nachricht</h3><div class="small">Sende eine Direktnachricht an einen anderen Spieler (per genauem Benutzernamen).</div><div style="height:10px"></div><form class="fleet-form" id="mailForm">
    <label>Empfänger (Benutzername)<input type="text" name="toUsername" maxlength="20" required></label>
    <label>Nachricht<textarea name="text" rows="4" maxlength="1000" required></textarea></label>
    <button class="btn good" type="submit">Senden</button>
  </form></div>
  <div class="card"><h3>Spielernachrichten${unreadCount>0?` <span class="pill active" style="padding:2px 8px">${unreadCount} neu</span>`:''}</h3><div class="list" style="max-height:420px;overflow-y:auto">${mailRows}</div></div>
  </div>
  <div style="height:16px"></div>
  <h3>Systemnachrichten</h3>${systemHtml}`;
}

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
    const buildRows = moonKeys.map(k=>{ const def=defs.buildings[k]; const lvl=(m.buildings[k]||0)+1; const c=scaledCost(def.base, lvl); const queued=m.buildQueue.some(q=>q.key===k); return `<div class="row"><div><strong>${def.name}</strong><div class="sub">Stufe ${m.buildings[k]||0}</div><div class="sub">Kosten (vom gewählten Planeten): ${resCostText(c)}</div>${queued?`<div class="sub warn-text">Wird bereits gebaut (Stufe ${lvl})</div>`:''}</div><button class="btn alt" data-moon-build="${k}" ${queued?'disabled':''}>Ausbauen</button></div>`; }).join('');
    const queueRows = m.buildQueue.map(q=>`<div class="queue-item">${q.name}${q.level?` (Stufe ${q.level})`:''}<br><span class="small">${secsLeft(q.done)} s</span></div>`).join('') || '<div class="small">Keine aktiven Mondbauten.</div>';
    const otherMoons = state.moons.filter((mm,i)=>i!==state.activeMoonIndex);
    const jumpForm = otherMoons.length ? `<form id="jumpGateForm" class="fleet-form">
      <label>Zielmond<select name="targetMoon">${state.moons.map((mm,i)=> i!==state.activeMoonIndex ? `<option value="${i}">${coordStr(mm.coord)}</option>` : '').join('')}</select></label>
      <label>Leichter Jäger<select name="lightFighter">${Array.from({length:(m.ships.lightFighter||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <label>Kreuzer<select name="cruiser">${Array.from({length:(m.ships.cruiser||0)+1},(_,i)=>`<option>${i}</option>`).join('')}</select></label>
      <button class="btn good" type="submit">Sofort transferieren</button>
    </form>` : '<div class="small">Es gibt noch keinen zweiten Mond für einen Transfer.</div>';
    const phalanxLevel = m.buildings.sensorPhalanx||0;
    const phalanxRange = phalanxLevel*3;
    const phalanxCard = phalanxLevel>=1 ? `<div class="card"><h3>Sensorphalanx-Scan</h3><div class="small">Zeigt Flottenbewegungen zu/von einem Zielplaneten in Reichweite (max. ${phalanxRange} Systeme, gleiche Galaxie wie der Mond). Kosten: 5.000 Rohöl pro Scan.</div><div style="height:10px"></div><form class="fleet-form" id="phalanxForm">
      <label>Zielgalaxie<input type="number" name="galaxy" min="1" max="${UNIVERSE.galaxies}" value="${m.coord[0]}"></label>
      <label>Zielsystem<input type="number" name="system" min="1" max="${UNIVERSE.systems}" value="${m.coord[1]}"></label>
      <label>Zielposition<input type="number" name="position" min="1" max="${UNIVERSE.positions}" value="1"></label>
      <button class="btn good" type="submit">Scannen</button>
    </form></div>` : `<div class="card"><h3>Sensorphalanx-Scan</h3><div class="small">Baue die Sensorphalanx (mindestens Stufe 1) aus, um Flottenbewegungen fremder Planeten einsehen zu können.</div></div>`;
    detail = `<div class="small" style="margin-bottom:10px">Koordinaten: ${coordLinkHtml(m.coord)}</div><div class="grid2">
      <div class="card"><h3>Mondgebäude</h3><div class="list">${buildRows}</div></div>
      <div class="card"><h3>Baustatus</h3><div class="queue">${queueRows}</div></div>
    </div>
    <div style="height:16px"></div>
    <div class="grid2">
      <div class="card"><h3>Sprungtor-Transfer</h3><div class="small">Sprungtore verbinden zwei Monde und transferieren Flotten verzögerungsfrei, sofern beide ein Sprungtor der Stufe 1 besitzen.</div><div style="height:10px"></div>${jumpForm}</div>
      ${phalanxCard}
    </div>`;
  }
  return `<h2>Monde</h2><div class="planet-tabs">${tabs}</div><div style="height:14px"></div>${detail}`;
}

function viewAlliance(){
  const a = state.alliance;
  if(!a){
    const list = state.alliancesList||[];
    const listHtml = list.length ? `<table><tr><th>Name</th><th>Tag</th><th>Mitglieder</th><th>Punkte</th><th></th></tr>${list.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>[${escapeHtml(x.tag)}]</td><td>${fmt(x.memberCount)}</td><td>${fmt(x.points)}</td><td><button class="btn alt" data-apply-alliance="${escapeHtml(x.tag)}">Bewerben</button></td></tr>`).join('')}</table>` : `<div class="small">Noch keine Allianzen auf diesem Server.</div>`;
    return `<h2>Allianz</h2><div class="small">Du bist derzeit unabhängig.</div><div style="height:16px"></div><div class="grid2">
    <div class="card"><h3>Allianz gründen</h3><div class="small">Voraussetzungen: mindestens ${fmt(1000)} Punkte, eindeutiger Name &amp; Tag, Kosten ${resCostText({iron:6000, silver:4000, crudeOil:2000})} (vom gewählten Planeten).</div><div style="height:10px"></div><form class="fleet-form" id="foundAllianceForm">
      <label>Allianzname<input type="text" name="name" maxlength="30" required></label>
      <label>Allianz-Tag (2-5 Zeichen)<input type="text" name="tag" maxlength="5" required></label>
      <button class="btn good" type="submit">Gründen</button>
    </form></div>
    <div class="card"><h3>Bestehende Allianzen</h3>${listHtml}</div>
    </div>`;
  }
  const rank = allianceRank(a.points);
  const applicationsHtml = a.isFounder && a.applications.length ? `<div class="card" style="margin-top:16px"><h3>Bewerbungen</h3><table><tr><th>Spieler</th><th></th></tr>${a.applications.map(u=>`<tr><td>${escapeHtml(u)}</td><td><button class="btn good" data-respond-application="${escapeHtml(u)}:1">Annehmen</button> <button class="btn danger" data-respond-application="${escapeHtml(u)}:0">Ablehnen</button></td></tr>`).join('')}</table></div>` : '';
  return `<h2>Allianz</h2><div class="grid2">
  <div class="card"><h3>${escapeHtml(a.name)} [${escapeHtml(a.tag)}]</h3><div class="small">Gründer: ${escapeHtml(a.founder)}${a.isFounder?' (Du)':''} · Rang: ${rank} · Allianzpunkte: ${fmt(a.points)}</div><div style="height:10px"></div><table><tr><th>Mitglied</th></tr>${a.members.map(m=>`<tr><td>${escapeHtml(m)}${m===state.username?' (Du)':''}</td></tr>`).join('')}</table><div style="height:10px"></div><button class="btn danger" id="leaveAllianceBtn">Allianz verlassen</button></div>
  <div class="card"><h3>Allianzdepot</h3><div class="grid4">${RESOURCE_KEYS.filter(k=>(a.depot[k]||0)>0).map(k=>`<div class="card"><div class="label">${RESOURCE_INFO[k].name}</div><div class="value">${fmt(a.depot[k]||0)}</div></div>`).join('') || '<div class="small">Noch keine Einzahlungen.</div>'}</div><div style="height:10px"></div><button class="btn alt" id="depositBtn">Bis zu 1000 von jeder Ressource einzahlen</button></div>
  </div>${applicationsHtml}`; }

function viewOfficers(){
  const list=[['commander','Kommandant','Reduziert Baukosten für Gebäude und Verteidigung leicht (-5%).'],['admiral','Admiral','Erhöht die Flottengeschwindigkeit (+10%).'],['engineer','Ingenieur','Erhöht die Energieproduktion (+10%).'],['geologist','Geologe','Erhöht die Rohstoffproduktion um 10%.'],['technocrat','Technokrat','Beschleunigt die Forschung (-15% Zeit).']];
  return `<h2>Offiziere</h2><div class="small">Dunkle Materie: ${fmt(state.darkMatter)} · Offiziere gelten für 7 Tage nach Aktivierung.</div><div style="height:10px"></div><div class="list">${list.map(([k,name,desc])=>{
    const active=officerActive(k);
    const affordable = state.darkMatter>=500;
    const disabled = active || !affordable;
    const label = active ? 'Aktiv' : (affordable ? 'Aktivieren (500 DM)' : 'Zu wenig Dunkle Materie');
    return `<div class="row"><div><strong>${name}</strong><div class="sub">${desc}</div>${active?`<div class="sub">Noch aktiv: ${formatDuration(officerTimeLeft(k))}</div>`:''}</div><button class="btn ${active?'good':'alt'}" data-officer="${k}" ${disabled?'disabled':''}>${label}</button></div>`;
  }).join('')}</div>`; }

function viewLifeform(){
  const lf=state.lifeform; const species=[['humans','Menschen'],['rocktal',"Rock'tal"],['mechas','Mechas'],['kaelesh','Kaelesh']];
  const ownBuildings = Object.entries(defs.lifeformBuildings).filter(([,d])=>d.species===lf.active);
  const rows = ownBuildings.map(([k,d])=>{
    const lvl = (lf.buildings&&lf.buildings[k])||0;
    const c = scaledCost(d.base, lvl+1);
    return `<div class="row"><div><strong>${d.name}</strong><div class="sub">Stufe ${lvl}</div><div class="sub">Kosten: ${resCostText(c)}</div></div><div style="display:flex;gap:6px;align-items:center">${infoIconHtml('lifeformBuilding',k,lvl)}<button class="btn good" data-lifeform-build="${k}">Ausbauen</button></div></div>`;
  }).join('');
  return `<h2>Lebensform</h2><div class="small">Aktive Spezies: ${species.find(s=>s[0]===lf.active)[1]}. Jede Lebensform bringt eigene Gebäude mit, die zur aktiven Spezies passende Rohstoffproduktion dauerhaft steigern. Beim Wechsel bleiben bereits erreichte Stufen erhalten, wirken aber nur, solange die jeweilige Spezies aktiv ist.</div><div style="height:10px"></div><div class="grid2">${species.map(([k,name])=>`<div class="card"><h3>${name}</h3><button class="btn ${lf.active===k?'good':'alt'}" data-lifeform="${k}">${lf.active===k?'Ausgewählt':'Wählen'}</button></div>`).join('')}</div><div style="height:16px"></div><h3>Gebäude von ${species.find(s=>s[0]===lf.active)[1]}</h3><div class="list">${rows}</div>`; }

function merchantCost(amount){ return Math.ceil((Number(amount)||0)/5); }
function viewMarket(){ const r=state.marketRate; const initialAmount=1000; const initialCost=merchantCost(initialAmount); const initialAffordable = initialCost>0 && initialCost<=state.darkMatter;
  const a = state.auction;
  const secsLeft = a ? Math.max(0, Math.ceil((a.endsAt-Date.now())/1000)) : 0;
  const mins = Math.floor(secsLeft/60), secs = secsLeft%60;
  const minBid = a ? a.currentBid+1 : 1;
  const auctionCard = a ? `<div class="card"><h3>Auktionshaus</h3><div class="small">${a.itemDesc}</div><div style="height:8px"></div><div><strong>${a.itemName}</strong></div><div class="sub">Höchstgebot: ${fmt(a.currentBid)} Dunkle Materie${a.currentBidder?(' · von '+a.currentBidder):''}</div><div class="sub">Restzeit: ${mins}m ${secs}s</div><div style="height:10px"></div><form class="market-form" id="auctionForm"><label>Gebot (Dunkle Materie)<input type="number" min="${minBid}" value="${minBid}" name="amount"></label><button class="btn good" type="submit">Bieten</button></form><div class="small" style="margin-top:8px">Dunkle Materie: ${fmt(state.darkMatter)}</div></div>` : '';
  const resOptions = RESOURCE_KEYS.map(k=>`<option value="${k}">${RESOURCE_INFO[k].name}</option>`).join('');
  const rateCards = RESOURCE_KEYS.map(k=>`<div class="card"><div class="label">${RESOURCE_INFO[k].name}</div><div class="value">${fmt1(r[k]||0)}</div></div>`).join('');
  return `<h2>Markt</h2><div class="small">Kurswerte (relativer Tauschwert pro Einheit; 10% Marktabschlag beim Tausch):</div><div style="height:8px"></div><div class="grid4">${rateCards}</div><div style="height:16px"></div><div class="grid2"><div class="card"><h3>Ressourcen handeln</h3><form class="market-form" id="marketForm"><label>Abgeben<select name="give">${resOptions}</select></label><label>Erhalten<select name="want">${resOptions}</select></label><label>Menge<input type="number" min="1" value="100" name="amount"></label><button class="btn good" type="submit">Am Markt tauschen</button></form></div><div class="card"><h3>Händler (Dunkle Materie)</h3><div class="small">Tausche Dunkle Materie sofort gegen Ressourcen. Kurs: 5 Einheiten pro 1 DM.</div><div style="height:10px"></div><form class="market-form" id="merchantForm"><label>Ressource<select name="resource">${resOptions}</select></label><label>Menge<input type="number" min="1" value="${initialAmount}" name="amount" id="merchantAmount"></label><div class="small" id="merchantCostHint">Kosten: ${fmt(initialCost)} Dunkle Materie</div><button class="btn warn" type="submit" id="merchantBuyBtn" ${initialAffordable?'':'disabled'}>Kaufen</button></form><div class="small" style="margin-top:8px">Dunkle Materie: ${fmt(state.darkMatter)}</div></div>${auctionCard}</div>`; }

function viewReports(){
  if(state.reports.length===0) return `<h2>Berichte</h2><div class="small">Noch keine Spionageberichte vorhanden.</div>`;
  return `<h2>Berichte</h2>${state.reports.map((r,i)=>{
    if(r.type==='phalanx'){
      const rows = r.movements.length ? r.movements.map(m=>`<div class="row"><div><strong>${m.username}</strong><div class="sub">${missionLabels[m.mission]||m.mission} · ${m.direction==='incoming'?'kommend':'gehend'}</div></div><div><div>${m.shipTotal} Schiff(e)</div><div class="sub">Ankunft in ${formatDuration(m.etaSeconds*1000)}</div></div></div>`).join('') : '<div class="small">Keine Flottenbewegungen entdeckt.</div>';
      return `<div class="report"><div class="row" style="border:none;background:none;padding:0"><strong>Sensorphalanx-Scan: ${r.target}</strong><span class="small">${r.time}</span></div><div class="small">${r.coordArr?coordLinkHtml(r.coordArr):r.target}</div><div style="height:8px"></div><div class="list">${rows}</div></div>`;
    }
    const buildingsHtml = r.buildings ? `<div class="small" style="margin-top:6px">Gebäude: ${Object.entries(r.buildings).map(([k,v])=>v && defs.buildings[k] ? defs.buildings[k].name+' '+v : null).filter(Boolean).join(', ')||'keine'}</div>` : (r.tiers ? `<div class="small" style="margin-top:6px">Gebäude: Unbekannt (höhere Spionagetechnik nötig)</div>` : '');
    const researchHtml = r.research ? `<div class="small" style="margin-top:4px">Forschung: ${Object.entries(r.research).map(([k,v])=>v && defs.research[k] ? defs.research[k].name+' '+v : null).filter(Boolean).join(', ')||'keine'}</div>` : (r.tiers ? `<div class="small" style="margin-top:4px">Forschung: Unbekannt (höhere Spionagetechnik nötig)</div>` : '');
    const simBtn = r.defenderPower ? `<button type="button" class="btn alt" data-battle-sim="${i}" style="margin-top:8px">Kampf simulieren</button>` : '';
    const tierBadge = typeof r.tier==='number' ? ` <span class="pill active" style="padding:1px 8px;font-size:11px">Spionagestufe ${r.tier}/5</span>` : '';
    const defenseText = r.defense!=null ? fmt(r.defense) : 'Unbekannt (höhere Spionagetechnik nötig)';
    const fleetText = r.fleet ? (Object.entries(r.fleet).map(([k,v])=>v?defs.ships[k].name+' x'+v:null).filter(Boolean).join(', ')||'keine') : 'Unbekannt (höhere Spionagetechnik nötig)';
    const resCards = RESOURCE_KEYS.filter(k=>(r.resources[k]||0)>0).map(k=>`<div class="card"><div class="label">${RESOURCE_INFO[k].name}</div><div class="value">${fmt(r.resources[k]||0)}</div></div>`).join('') || '<div class="small">Keine Rohstoffe.</div>';
    return `<div class="report"><div class="row" style="border:none;background:none;padding:0"><strong>${r.target}</strong><span class="small">${r.time}${tierBadge}</span></div><div class="small">${r.coordArr?coordLinkHtml(r.coordArr):r.coords}</div><div class="grid4" style="margin-top:8px">${resCards}</div><div class="small" style="margin-top:8px">Verteidigung: ${defenseText} · Flotte: ${fleetText}</div>${buildingsHtml}${researchHtml}${simBtn}</div>`;
  }).join('')}`;
}

function viewEmpire(){ return `<h2>Imperium</h2><div class="small">Gesamtpunkte: ${fmt(totalPlayerPoints())}</div><div style="height:10px"></div><table><thead><tr><th>Planet</th><th>Koordinaten</th><th>Typ</th><th>Produktion/h</th><th>Energie</th><th>Punkte</th></tr></thead><tbody>${state.planets.filter(p=>!p.destroyed).map(p=>{ const inc=hourly(p), e=energyStats(p), pts=Math.floor(computePoints(p)/1000); const ptName=(PLANET_TYPES[p.planetType]||PLANET_TYPES.rocky).name; const incText = RESOURCE_KEYS.filter(k=>(inc[k]||0)!==0).map(k=>`${RESOURCE_INFO[k].name} ${fmt1(inc[k])}`).join(', ') || '—'; return `<tr><td>${p.name}</td><td>${coordLinkHtml(p.coords)}</td><td>${ptName}</td><td>${incText}</td><td>${fmt(e.prod)}/${fmt(e.use)}</td><td>${fmt(pts)}</td></tr>`; }).join('')}</tbody></table>`; }

function viewHighscore(){
  if(highscoreCache===null && !highscoreLoading){ fetchHighscore(); }
  if(!highscoreCache){
    return `<h2>Rangliste</h2><div class="small">Lade Rangliste…</div>`;
  }
  const categories = [['points','Gesamt'],['buildingPoints','Gebäude'],['researchPoints','Forschung'],['fleetPoints','Flotte'],['defensePoints','Verteidigung']];
  const cat = categories.find(c=>c[0]===highscoreCategory) ? highscoreCategory : 'points';
  const sorted = [...highscoreCache].sort((a,b)=>(b[cat]||0)-(a[cat]||0));
  const tabsHtml = categories.map(([k,label])=>`<button type="button" class="pill ${cat===k?'active':''}" data-highscore-cat="${k}">${label}</button>`).join('');
  return `<h2>Rangliste</h2><div class="small">Echte Punkte aller registrierten Spieler auf diesem Server, basierend auf dem Ressourcenwert aller Gebäude, Forschungen, Schiffe und Verteidigungsanlagen.</div><div style="height:10px"></div><div class="planet-tabs" style="margin-bottom:10px">${tabsHtml}</div><table><thead><tr><th>Rang</th><th>Spieler</th><th>Planeten</th><th>${categories.find(c=>c[0]===cat)[1]}</th></tr></thead><tbody>${sorted.map((e,i)=>`<tr${e.username===state.username?' style="color:var(--accent2);font-weight:700"':''}><td>${i+1}</td><td>${e.username}${e.username===state.username?' (Du)':''}</td><td>${fmt(e.planets)}</td><td>${fmt(e[cat]||0)}</td></tr>`).join('')}</tbody></table>`;
}

function renderView(bind=true){
  const views={overview:viewOverview,buildings:viewBuildings,facilities:viewFacilities,factories:viewFactories,defense:viewDefense,resources:viewResources,research:viewResearch,shipyard:viewShipyard,fleet:viewFleet,expeditions:viewExpeditions,galaxy:viewGalaxy,moons:viewMoons,alliance:viewAlliance,officers:viewOfficers,lifeform:viewLifeform,market:viewMarket,reports:viewReports,messages:viewMessages,empire:viewEmpire,highscore:viewHighscore,settings:viewSettings};
  $('#view').innerHTML = views[state.view]();
  if(bind){
    document.querySelectorAll('[data-factory-tab]').forEach(b=>b.onclick=()=>{ state.factoryTab=b.dataset.factoryTab; renderView(); });
    document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>enqueueBuild(b.dataset.build));
    document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>enqueueResearch(b.dataset.research));
    document.querySelectorAll('[data-ship]').forEach(b=>b.onclick=()=>enqueueShip(b.dataset.ship));
    document.querySelectorAll('[data-defense]').forEach(b=>b.onclick=()=>enqueueDefense(b.dataset.defense));
    const ff=$('#fleetForm'); if(ff){
      ff.onsubmit=e=>{e.preventDefault(); const gal=Number(ff.galaxy.value), sys=Number(ff.system.value), pos=Number(ff.position.value); $('#targetField').value = gal+':'+sys+':'+pos; state.fleetPrefill=null; sendFleet(ff)};
      ff.mission.onchange=()=>{ state.fleetPrefill=null; const acsField=$('#acsField'); if(acsField) acsField.style.display = ff.mission.value==='attack' ? 'block' : 'none'; };
      ff.galaxy.onchange=()=>{ state.fleetPrefill=null; };
      ff.system.onchange=()=>{ state.fleetPrefill=null; };
      ff.position.onchange=()=>{ state.fleetPrefill=null; };
    }
    const mf=$('#marketForm'); if(mf) mf.onsubmit=e=>{e.preventDefault(); marketTrade(mf.give.value,mf.want.value,mf.amount.value)};
    const auctionForm=$('#auctionForm'); if(auctionForm) auctionForm.onsubmit=e=>{e.preventDefault(); postAction('bidAuction', {amount: Number(auctionForm.amount.value)||0});};
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
    const foundAllianceForm=$('#foundAllianceForm'); if(foundAllianceForm) foundAllianceForm.onsubmit=e=>{e.preventDefault(); postAction('foundAlliance', {planetIndex: state.activePlanet, name: foundAllianceForm.name.value, tag: foundAllianceForm.tag.value}); };
    document.querySelectorAll('[data-apply-alliance]').forEach(b=>b.onclick=()=>postAction('applyToAlliance', {tag:b.dataset.applyAlliance}));
    document.querySelectorAll('[data-respond-application]').forEach(b=>b.onclick=()=>{ const [applicantUsername,acceptFlag]=b.dataset.respondApplication.split(':'); postAction('respondToApplication', {applicantUsername, accept: acceptFlag==='1'}); });
    const leaveAllianceBtn=$('#leaveAllianceBtn'); if(leaveAllianceBtn) leaveAllianceBtn.onclick=()=>{ if(confirm('Allianz wirklich verlassen?')) postAction('leaveAlliance', {}); };
    document.querySelectorAll('[data-officer]').forEach(b=>b.onclick=()=>{ if(officerActive(b.dataset.officer)) return; postAction('activateOfficer', {key:b.dataset.officer}); });
    document.querySelectorAll('[data-lifeform]').forEach(b=>b.onclick=()=>postAction('setLifeform', {species:b.dataset.lifeform}));
    document.querySelectorAll('[data-lifeform-build]').forEach(b=>b.onclick=()=>postAction('enqueueLifeformBuilding', {planetIndex: state.activePlanet, key:b.dataset.lifeformBuild}));
    document.querySelectorAll('[data-highscore-cat]').forEach(b=>b.onclick=()=>{ highscoreCategory=b.dataset.highscoreCat; renderView(); });
    document.querySelectorAll('[data-battle-sim]').forEach(b=>b.onclick=()=>openBattleSimulator(Number(b.dataset.battleSim)));
    document.querySelectorAll('[data-moon-select]').forEach(b=>b.onclick=()=>{ state.activeMoonIndex=Number(b.dataset.moonSelect); renderView(true); });
    document.querySelectorAll('[data-moon-build]').forEach(b=>b.onclick=()=>enqueueMoonBuild(b.dataset.moonBuild));
    const jgf=$('#jumpGateForm'); if(jgf) jgf.onsubmit=e=>{e.preventDefault(); const toIdx=Number(jgf.targetMoon.value); const ships={lightFighter:Number(jgf.lightFighter.value)||0, cruiser:Number(jgf.cruiser.value)||0}; jumpGateTransfer(state.activeMoonIndex, toIdx, {}, ships); };
    const phf=$('#phalanxForm'); if(phf) phf.onsubmit=e=>{e.preventDefault(); postAction('scanSystem', {moonIndex: state.activeMoonIndex, planetIndex: state.activePlanet, gal: Number(phf.galaxy.value), sys: Number(phf.system.value), pos: Number(phf.position.value)}).then(()=>{ state.view='reports'; render(); }); };
    const mailForm=$('#mailForm'); if(mailForm) mailForm.onsubmit=e=>{e.preventDefault(); postAction('sendDirectMessage', {toUsername: mailForm.toUsername.value.trim(), text: mailForm.text.value}).then(()=>{ renderView(true); }); };
    const renameForm=$('#renamePlanetForm'); if(renameForm) renameForm.onsubmit=e=>{e.preventDefault(); postAction('renamePlanet', {planetIndex: state.activePlanet, name: renameForm.name.value}); };
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
