// Rulebook tables, transcribed from the Scumbags! rulebook. Gamebook-only additions are marked "(gamebook)".

export const STATS = ['Dex', 'Str', 'Con', 'Wis', 'Int', 'Cha'];
export const STAT_NAMES = {
  Dex: 'Dexterity', Str: 'Strength', Con: 'Constitution', Wis: 'Wisdom', Int: 'Intelligence', Cha: 'Charisma',
};

// Ranged attack difficulty dice by distance (rulebook "Attacking"). Index = band.
export const BANDS = ['Engaged', 'Short', 'Medium', 'Long', 'Extreme'];
export const RANGED_DIE = [20, 4, 8, 12, 20];
export const MELEE_DIE = 8;      // "Most melee attacks are made with a d8 difficulty die."
export const DARK_DIE = 12;      // (gamebook) fighting or acting without light, per the rulebook's "dim lighting" example

export const QUALITIES = [
  { name: 'Slippery', core: 'Dex', anc: 'Cha', feature: 'Once per day, reroll a defending test', key: 'rerollDefend' },
  { name: 'Merciless', core: 'Dex', anc: 'Str', feature: 'Once per day, reroll an attacking test', key: 'rerollAttack' },
  { name: 'Unyielding', core: 'Str', anc: 'Dex', feature: 'Can’t be knocked prone', key: 'noProne' },
  { name: 'Swift', core: 'Str', anc: 'Con', feature: '+1 square of movement or 1/6 chance to move twice', key: 'swift' },
  { name: 'Hardened', core: 'Con', anc: 'Str', feature: '+1 maximum HP per level', key: 'hardened' },
  { name: 'Sottish', core: 'Con', anc: 'Wis', feature: 'Ignore simple poisons', key: 'noPoison' },
  { name: 'Dogmatic', core: 'Wis', anc: 'Con', feature: 'Ignore simple curses', key: 'noCurse' },
  { name: 'Favoured', core: 'Wis', anc: 'Int', feature: 'Restore an additional +1 HP per level when healing or being healed', key: 'favoured' },
  { name: 'Canny', core: 'Int', anc: 'Wis', feature: 'Automatically succeed in common knowledge tests', key: 'canny' },
  { name: 'Versatile', core: 'Int', anc: 'Cha', feature: 'Once per day, make an unskilled test as though skilled', key: 'versatile' },
  { name: 'Inscrutable', core: 'Cha', anc: 'Int', feature: 'Perfect poker face; skilled at lying', key: 'liar' },
  { name: 'Lucky', core: 'Cha', anc: 'Dex', feature: 'Once per day, reroll a saving throw', key: 'rerollSave' },
];

// prof = proficiency (heaviest weapon/shield/armour without penalty): 1 light, 2 medium, 3 heavy
export const PROFESSIONS = [
  { name: 'Assassin', core: 'Dex', anc: 'Cha', prof: 3, skills: ['attack:ranged', 'skulduggery', 'social'], feature: 'Critical success does triple damage when attacking', key: 'tripleCrit' },
  { name: 'Cutpurse', core: 'Dex', anc: 'Str', prof: 2, skills: ['attack:melee', 'attack:ranged', 'bruteforce', 'skulduggery'], feature: '1-3 on the skill die is a critical success when attacking', key: 'wideCrit' },
  { name: 'Sellsword', core: 'Str', anc: 'Dex', prof: 3, skills: ['attack:melee', 'athletics', 'bruteforce'], feature: 'May make a free attack after slaying an opponent', key: 'cleave' },
  { name: 'Pit fighter', core: 'Str', anc: 'Con', prof: 2, skills: ['attack:melee', 'athletics', 'bruteforce'], feature: 'May counterattack after successfully defending (melee)', key: 'counter' },
  { name: 'Bodyguard', core: 'Con', anc: 'Str', prof: 2, skills: ['attack:melee', 'defend:melee', 'defend:ranged', 'medicine'], feature: 'May defend for another player within short range per round', key: 'guard' },
  { name: 'Woodcutter', core: 'Con', anc: 'Wis', prof: 2, skills: ['attack:melee', 'defend:melee', 'survival'], feature: 'On hit, 1/6 chance to push opponent prone and attack again', key: 'fell' },
  { name: 'Cleric', core: 'Wis', anc: 'Con', prof: 2, skills: ['cast:divine', 'defend:melee', 'arcana'], feature: 'May cast divine spells', key: 'divine' },
  { name: 'Missionary', core: 'Wis', anc: 'Int', prof: 2, skills: ['cast:divine', 'attack:ranged', 'languages'], feature: 'May cast divine spells', key: 'divine' },
  { name: 'Alchemist', core: 'Int', anc: 'Wis', prof: 1, skills: ['cast:arcane', 'analysis', 'medicine'], feature: 'May cast arcane spells', key: 'arcane' },
  { name: 'Sorcerer', core: 'Int', anc: 'Cha', prof: 1, skills: ['cast:arcane', 'analysis', 'arcana'], feature: 'May cast arcane spells', key: 'arcane' },
  { name: 'Envoy', core: 'Cha', anc: 'Int', prof: 2, skills: ['attack:melee', 'attack:ranged', 'languages', 'social'], feature: 'May make an additional attack per turn (unskilled)', key: 'extraAttack' },
  { name: 'Hunter', core: 'Cha', anc: 'Dex', prof: 2, skills: ['attack:ranged', 'defend:ranged', 'survival'], feature: 'May make all ranged attacks as though short range', key: 'hunter' },
];

export const SKILL_NAMES = {
  'attack:melee': 'Attacking (melee)', 'attack:ranged': 'Attacking (ranged)',
  'defend:melee': 'Defending (melee)', 'defend:ranged': 'Defending (ranged)',
  'cast:divine': 'Spellcasting (divine)', 'cast:arcane': 'Spellcasting (arcane)',
  analysis: 'Analysis', arcana: 'Arcana', athletics: 'Athletics', bruteforce: 'Brute force', languages: 'Languages',
  medicine: 'Medicine', skulduggery: 'Skulduggery', social: 'Social', survival: 'Survival',
};

export const ENDEAVOURS = [
  'Commission a statue of yourself. The sculptor charges by the chin.',
  'Throw a feast for the whole town. The next town hears about it and comes too.',
  'Buy a knighthood. It comes with a horse, which costs more than the knighthood.',
  'Bribe a magistrate to clear your name. He keeps the file, just in case.',
  'Fund an expedition to the edge of the world. It gets as far as the edge of town, and the tavern there.',
  'Bet on the cockroach races. Yours eats the competition and is disqualified.',
  'Build a contraption. It works; nobody knows what it does.',
  'Pay the temple to pray for your soul. On reflection, they’ll need a lot more.',
  'Hire a bard to sing of your deeds. He sings them accurately, so you pay him to stop. Monthly.',
  'Buy a bear. It is your problem now.',
  'Gild a dung-shovel, as is tradition.',
  'Outbid a stranger for the last oversized turnip at market. He will remember this.',
  'Commission a portrait. It captures your soul, unflatteringly.',
  'Buy a fashionable hat. By the time you get it home, it isn’t.',
  'Adopt an orphan. It’s a halfling with expensive tastes.',
  'Hire a food taster. He dies on his first day. Someone wants you dead, and you’re out of food tasters.',
  'Buy a pardon for your sins in advance, then commit them all to get your money’s worth.',
  'Pay an astrologer to name a comet after you. It lands on a village, which sends you the bill.',
  'Design a coat of arms. The herald charges per beast, and you wanted all of them.',
  'Fake your own death and pay for the wake. Everyone has a lovely time without you.',
];
export const LEVEL_COST = 200;

export const WEAPON_DIE = { 1: 4, 2: 8, 3: 12 };
export const WEIGHT_NAME = { 1: 'light', 2: 'medium', 3: 'heavy' };
export const WEAPONS = [
  { id: 'dagger', name: 'Dagger', weight: 1, ranged: false },
  { id: 'sword', name: 'Sword', weight: 2, ranged: false },
  { id: 'mace', name: 'Mace', weight: 2, ranged: false },
  { id: 'maul', name: 'Maul', weight: 3, ranged: false },
  { id: 'sling', name: 'Sling', weight: 1, ranged: true },
  { id: 'bow', name: 'Bow', weight: 2, ranged: true },
  { id: 'crossbow', name: 'Crossbow', weight: 3, ranged: true },
];
export const ARMOURS = [
  { id: 'gambeson', name: 'Gambeson', weight: 1, ap: 2 },
  { id: 'leather', name: 'Leather armour', weight: 2, ap: 4 },
  { id: 'chainmail', name: 'Chain mail', weight: 3, ap: 6 },
];
export const SHIELDS = [
  { id: 'buckler', name: 'Buckler', weight: 1, block: [1, 6] },
  { id: 'kite', name: 'Kite shield', weight: 2, block: [2, 6] },
  { id: 'tower', name: 'Tower shield', weight: 3, block: [3, 6] },
];

// Mundane items (rulebook list). tokens = depletion; uses = 1-use items.
export const MUNDANE = {
  ammo: { name: 'Ammunition', tokens: 5, note: 'Depletion (5)' },
  bellows: { name: 'Bellows' },
  bucket: { name: 'Bucket' },
  chain: { name: 'Chain (10ft)' },
  climbing: { name: 'Climbing gear', note: 'Required for climbing' },
  oil: { name: 'Flask of oil', tokens: 12, note: 'Depletion (12) when used in a lantern' },
  flint: { name: 'Flint & steel' },
  glue: { name: 'Glue', uses: 1, note: '1 use' },
  mirror: { name: 'Hand mirror' },
  healerskit: { name: 'Healer’s kit', note: 'Required for healing' },
  holysymbol: { name: 'Holy symbol', note: 'Required for divine spellcasting' },
  holywater: { name: 'Holy water', uses: 1, note: '1 use; 2d8 damage to undead' },
  spikes: { name: 'Iron spikes', tokens: 3, note: 'Depletion (3)' },
  loupe: { name: 'Jeweller’s loupe' },
  lantern: { name: 'Lantern', note: 'Requires oil to produce light' },
  manacles: { name: 'Manacles', note: 'With key' },
  pick: { name: 'Mining pick' },
  padlock: { name: 'Padlock', note: 'With key' },
  pocketsand: { name: 'Pocket sand', uses: 1, note: '1 use; target can’t act until after their next turn' },
  pole: { name: 'Pole (10ft)' },
  prybar: { name: 'Pry bar' },
  quill: { name: 'Quill, ink & parchment' },
  rat: { name: 'Rat', note: '2/6 chance to follow a simple command' },
  rations: { name: 'Rations (5 days)', note: 'Includes water' },
  rope: { name: 'Rope (50ft)' },
  shovel: { name: 'Shovel' },
  salts: { name: 'Smelling salts' },
  tent: { name: 'Tent & bedroll' },
  tools: { name: 'Thieves’ tools', note: 'Required for picking locks and disarming traps' },
  torches: { name: 'Torches', tokens: 5, note: 'Depletion (5)' },
  whistle: { name: 'Watchman’s whistle' },
  // (gamebook) found or bought during adventures; not offered at character creation
  stilts: { name: 'Stilts', note: 'Makes you look six foot six', hidden: true },
};
export const MUNDANE_LIMIT = 6;

// Significant items (rulebook list, plus things found in the adventure).
export const SIGNIFICANT = {
  fire: { name: 'Alchemist’s fire', uses: 1, note: '1 use; 2d8 damage', cost: 20 },
  caltrops: { name: 'Caltrops', uses: 1, note: '1 use; d4 damage; stops horses (and most things with feet)', cost: 10 },
  insight: { name: 'Elixir of insight', uses: 1, note: '1 use; drink before a Wis or Int test to roll it as though skilled', cost: 20 },
  antidote: { name: 'Antidote', uses: 1, note: '1 use; cures poison', cost: 10 },
  salve: { name: 'Clotting salve', uses: 1, note: '1 use; stops bleeding out', cost: 30 },
  potion: { name: 'Healing potion', uses: 1, note: '1 use; heals 2d6 HP', cost: 10 },
  acid: { name: 'Vial of acid', uses: 1, note: '1 use; 2d4 damage, destroys locks', cost: 15 },
  map: { name: 'The old map', note: 'Cost you a fortune. Possibly accurate.' },
  ipad: { name: 'Glowing slate', tokens: 3, note: 'Gives light; Depletion (3)' },
  card: { name: 'Business card', note: '“Disruptor. Thought leader. Lost.”' },
  vaultkey: { name: 'Iron key', note: 'Stamped VAULT. Subtle.' },
  abacus: { name: 'Vane’s golden abacus', value: 100, note: 'Worth 100GP to a fool. Every abacus is worth 100GP to a fool.' },
  invitation: { name: 'Invitation', note: '“No guest under six feet will be admitted.”' },
  hat: { name: 'The Lofty Hat', slots: 4, value: 370, note: 'Nine feet of velvet and rubies; takes 4 slots. Mother Grubb pays 400GP' },
  diary: { name: 'The Lord’s diary', value: 100, note: 'Reveals he is five foot two. Lord Shortshanks pays 100GP' },
  candlestick: { name: 'Silver candlestick', slots: 2, value: 25, note: 'Six feet tall; takes 2 slots. Worth 25GP' },
  chips: { name: 'Gold chip', value: 100, note: 'Fortune’s Fang casino chip. Cash it at the cage for 100GP' },
  coffin: { name: 'Coffin key', note: 'Small, silver, and very important to someone' },
  turnip: { name: 'The Golden Turnip', slots: 3, value: 300, note: 'Prize-winning; takes 3 slots. Worth 300GP to the right buyer' },
  thimble: { name: 'Giant’s thimble', slots: 2, value: 60, note: 'Silver bucket; takes 2 slots. Worth 60GP' },
  rattle: { name: 'Giant baby’s rattle', note: 'Loud. Very loud' },
  deed: { name: 'Deed to the square', value: 50, note: 'Proof the town square belongs to Lord Grimsby. Or doesn’t' },
  tesseract: { name: 'Folded tesseract', value: 200, note: 'The murdercube, folded. It is in two pockets at once. Worth 200GP to a geometer' },
  strongkey: { name: 'Strongroom key', note: 'Heavy, iron, and handed to you by a skeleton' },
  scale: { name: 'Dragon scale', note: 'Red, the size of a dinner plate. Proof of removal' },
  sevenleague: { name: 'Seven-league boots', slots: 2, value: 250, note: 'Still twitching towards the horizon. Welt wants them back' },
  soap: { name: 'Carbolic soap', note: 'The size of a brick, and never used' },
  signet: { name: 'Mudlark signet ring', value: 40, note: 'Lost in mud for twenty years. Worth 40GP' },
  liqueur: { name: 'Shushing Liqueur', value: 40, note: 'Gin, sugar and more gin. Worth 40GP to a tavern' },
  slip: { name: 'Detention slip', note: 'Signed by Headmistress Grimble, with a name already filled in' },
  tiara: { name: 'Diamond tiara', value: 120, note: 'Fished out of a blob. Worth 120GP' },
  sweets: { name: 'Old Nan’s cough sweets', note: 'Liquorice, and something stronger. Puts people to sleep' },
  rennet: { name: 'Rennet and a ledger', note: 'Evidence: the Witchfinder curdles the milk himself' },
  seal: { name: 'Master Seal of the Exchequer', value: 300, note: 'Approves anything. The Thieves’ Guild pays 300GP' },
  windingkey: { name: 'Ezra Tock’s winding key', value: 60, note: 'Brass, as long as your arm. Worth 60GP to a collector' },
  phylactery: { name: 'World’s Best Dark Lord mug', value: 500, note: 'An archlich’s phylactery, with a false bottom. Faintly green' },
  scythe: { name: 'Death’s scythe', note: 'Weighs nothing. Hums. Nobody can die while you hold it' },
  harp: { name: 'Golden harp', slots: 3, value: 400, note: 'Sings, sulkily. Worth 400GP to a music lover; takes 3 slots' },
  savings: { name: 'Kobold savings jar', slots: 2, value: 150, note: 'The kobolds’ deposit for a new home: 150GP; takes 2 slots' },
};
export const SIGNIFICANT_LIMIT = 12;
export const GP_PER_SLOT = 50;

// Spells the gamebook uses: level 1 of each list (rulebook). dd = spell difficulty die.
export const SPELLS = {
  light: { name: 'Divine light', list: 'divine', align: 'law', lvl: 1, dd: 4, text: 'Target object glows for 1 hr' },
  abundance: { name: 'Abundance', list: 'divine', align: 'law', lvl: 1, dd: 4, text: 'Summon 1 day’s rations' },
  bless: { name: 'Bless', list: 'divine', align: 'law', lvl: 1, dd: 4, text: 'Target water becomes holy water' },
  shroud: { name: 'Shroud', list: 'divine', align: 'chaos', lvl: 1, dd: 4, text: 'Target object emits darkness for 1 hr' },
  famine: { name: 'Famine', list: 'divine', align: 'chaos', lvl: 1, dd: 4, text: 'Summon swarm of locusts' },
  pollute: { name: 'Pollute', list: 'divine', align: 'chaos', lvl: 1, dd: 4, text: 'Target water becomes oil' },
  bolt: { name: 'Arcane bolt', list: 'arcane', lvl: 1, dd: 4, text: '2 per level damage to one target; long range' },
  ward: { name: 'Ward', list: 'arcane', lvl: 1, dd: 4, text: 'Loud alarm whenever something enters target space' },
  voice: { name: 'Throw voice', list: 'arcane', lvl: 1, dd: 4, text: 'Target object emits your voice for 10 mins' },
};

// Monster level -> difficulty die (rulebook "Monsters")
export const MONSTER_DD = (lvl) => (lvl <= 2 ? 4 : lvl <= 4 ? 6 : lvl <= 6 ? 8 : lvl <= 8 ? 10 : 12);
