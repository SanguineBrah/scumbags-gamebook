// Character creation and advancement, following "Creating characters" and "Experience and levelling up".
import { STATS, QUALITIES, PROFESSIONS, WEAPONS, ARMOURS, SHIELDS, WEAPON_DIE, LEVEL_COST, MUNDANE, SIGNIFICANT, SPELLS, GP_PER_SLOT, SIGNIFICANT_LIMIT } from './data.js';

// (gamebook) The rulebook assumes a party sharing the monsters' attention. A gamebook hero fights alone,
// so starts with extra HP. See docs/ADAPTATION.md.
export let HERO_HP_BONUS = 10;
export function setHeroBonus(n) { HERO_HP_BONUS = n; }

const PROF_SHIFT = [-3, -2, -1, 0, null, 1, 2, 3]; // d8: move up 3 ... reroll ... move down 3

const FIRST = ['Grisk', 'Mabel', 'Odo', 'Hilde', 'Barnaby', 'Wat', 'Agnes', 'Tobias', 'Gudrun', 'Piers', 'Nell', 'Fulk', 'Edwy', 'Maud', 'Osric', 'Bertha', 'Cuthbert', 'Joan'];
const LAST = ['the Unwashed', 'Two-Teeth', 'of the Ditch', 'Mudd', 'the Lesser', 'Ratcliffe', 'No-Nose', 'Crumb', 'the Damp', 'Bodge', 'Grubb', 'the Unready', 'Turnip', 'Shank'];
export function randomName(rng) { return `${rng.pick(FIRST)} ${rng.pick(LAST)}`; }

/** Roll quality (d12) and profession (d8 shift on the professions table). Returns indices plus the rolls, for display. */
export function rollOrigins(rng) {
  const qRoll = rng.die(12); const qi = qRoll - 1;
  const shifts = [];
  for (;;) {
    const r = rng.die(8); shifts.push(r);
    const shift = PROF_SHIFT[r - 1];
    if (shift === null) continue;
    return { qi, qRoll, pi: (((qi + shift) % 12) + 12) % 12, shifts };
  }
}

export const qualityOf = (c) => QUALITIES.find((q) => q.name === c.quality);
export const profOf = (c) => PROFESSIONS.find((p) => p.name === c.profession);
export const prof = (c) => profOf(c).prof;
export const magicType = (c) => (['divine', 'arcane'].includes(profOf(c).key) ? profOf(c).key : null);
export const hasFeature = (c, key) => qualityOf(c).key === key || profOf(c).key === key;

/** Build a level-1 scumbag. choices: { name, weapon, protection ('armour'|'shield'), mundane: [ids], alignment } */
export function createCharacter(rng, origins, choices) {
  const quality = QUALITIES[origins.qi];
  const profession = PROFESSIONS[origins.pi];
  const stats = Object.fromEntries(STATS.map((s) => [s, 9]));
  stats[quality.core] += 2; stats[quality.anc] += 1;
  stats[profession.core] += 3; stats[profession.anc] += 1;
  const c = {
    name: choices.name || randomName(rng), level: 1, quality: quality.name, profession: profession.name, stats,
    maxHp: 0, hp: 0, ap: 0, gold: 0, wasted: 0, wasteBank: 0,
    alignment: profession.key === 'divine' ? (choices.alignment || 'law') : null,
    weapon: null, sidearm: null, armour: null, shield: null, mundane: [], significant: [],
    slots: {}, daily: {}, flags: {}, hpRoll: 0,
  };
  c.hpRoll = rng.die(6);
  c.maxHp = c.hpRoll + 5 + HERO_HP_BONUS + (quality.key === 'hardened' ? 1 : 0);
  c.hp = c.maxHp;
  const w = WEAPONS.find((x) => x.id === choices.weapon) || startingWeapons(c)[0];
  c.weapon = { ...w };
  if (w.ranged) c.sidearm = { ...WEAPONS[0] };   // (gamebook) ranged scumbags keep a knife for close quarters
  if (choices.protection === 'shield') c.shield = { ...SHIELDS[profession.prof - 1] };
  else c.armour = { ...ARMOURS[profession.prof - 1] };
  for (const id of choices.mundane || []) c.mundane.push(makeItem(id));
  if (choices.extra) c.significant.push(makeItem(choices.extra));   // (gamebook) one starting significant item
  c.ap = maxAp(c);
  resetDay(c);
  return c;
}

// (gamebook) Like the potion choice in a classic gamebook: one significant item to start with.
export const STARTING_EXTRAS = ['potion', 'fire', 'salve', 'acid'];

export function startingWeapons(c) {
  return WEAPONS.filter((w) => w.weight <= prof(c));
}

export function makeItem(id) {
  const def = MUNDANE[id] || SIGNIFICANT[id];
  if (!def) throw new Error(`unknown item ${id}`);
  const it = { id, name: def.name };
  if (def.tokens) it.tokens = def.tokens;
  if (def.uses) it.uses = def.uses;
  return it;
}

export function maxAp(c) { return c.armour ? c.armour.ap : 0; }

// Skills come from the profession; saving throws are skilled for core and ancillary stats.
export function isSkilled(c, skill) {
  if (!skill) return false;
  if (profOf(c).skills.includes(skill)) return true;
  if (skill === 'lying') return hasFeature(c, 'liar') || profOf(c).skills.includes('social');
  if (skill.startsWith('save:')) {
    const stat = skill.slice(5); const q = qualityOf(c); const p = profOf(c);
    return [q.core, q.anc, p.core, p.anc].includes(stat);
  }
  return false;
}

export function armourPenalty(c) { return !!(c.armour && c.armour.weight > prof(c)); }
export function weaponPenalty(c, w = c.weapon) {
  return !!((w && w.weight > prof(c)) || (c.shield && c.shield.weight > prof(c)));
}
export function weaponDamageDie(w) { return w ? WEAPON_DIE[w.weight] : 4; }

export function knownSpells(c) {
  const t = magicType(c); if (!t) return [];
  return Object.entries(SPELLS).filter(([, s]) => s.list === t && (t === 'arcane' || s.align === c.alignment) && s.lvl <= c.level)
    .map(([id, s]) => ({ id, ...s }));
}

export function resetDay(c) {
  c.daily = { reroll: true, healed: false, versatile: true };
  c.slots = {};
  if (magicType(c)) for (let l = 1; l <= Math.min(10, c.level); l++) c.slots[l] = true;
}

export function slotsUsed(c) { return c.significant.length + Math.ceil(c.gold / GP_PER_SLOT); }
/** How much more coin fits in the remaining significant-item slots (each 50GP takes a slot). */
export function goldRoom(c) {
  const freeSlots = SIGNIFICANT_LIMIT - c.significant.length;
  return Math.max(0, freeSlots * GP_PER_SLOT - c.gold);
}

/** Waste exactly LEVEL_COST on a pointless endeavour; returns the level-up report. */
export function wasteForLevel(rng, c) {
  c.gold -= LEVEL_COST; c.wasted += LEVEL_COST;
  return levelUp(rng, c);
}

export function levelUp(rng, c) {
  const hpRoll = rng.die(6) + (hasFeature(c, 'hardened') ? 1 : 0);
  c.level += 1; c.maxHp += hpRoll; c.hp = c.maxHp;
  const statRolls = {};
  for (const s of STATS) {
    const r = rng.die(20);
    statRolls[s] = { roll: r, up: r > c.stats[s] };
    if (r > c.stats[s]) c.stats[s] += 1;
  }
  resetDay(c);
  return { level: c.level, hpRoll, statRolls };
}
