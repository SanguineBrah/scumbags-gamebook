// Gallowsford, between adventures: the inn, the market and the fence (rulebook prices).
import { itemRef } from './conditions.js';
import { MUNDANE, SIGNIFICANT, WEAPONS, ARMOURS, SHIELDS, MUNDANE_LIMIT, SIGNIFICANT_LIMIT, WEAPON_DIE } from '../rules/data.js';
import { makeItem, maxAp, resetDay, prof, itemSlots, hasFeature } from '../rules/character.js';

export const INN_PRICE = 5;
export const SHOP = ['potion', 'fire', 'salve', 'antidote', 'acid', 'caltrops', 'insight'];
export const weaponPrice = (w) => 10 * w.weight;
export const armourPrice = (a) => 10 * a.weight;
export const shieldPrice = (s) => 5 * s.weight;

const roomFor = (c, size = 1) => itemSlots(c) + Math.ceil(c.gold / 50) + size <= SIGNIFICANT_LIMIT
  || itemSlots(c) + size <= SIGNIFICANT_LIMIT;   // coins can always be spent first

/** A paid bed at the Drowned Rat: full HP and AP, spells and once-per-day features back. */
export function restAtInn(c) {
  if (c.gold < INN_PRICE) return null;
  c.gold -= INN_PRICE; c.hp = c.maxHp; c.ap = maxAp(c); resetDay(c);
  return `A bed at the Drowned Rat (${INN_PRICE}GP). You wake up rested: ${c.hp}/${c.maxHp} HP.`;
}
/** A free night in a ditch: the rulebook's night's rest (d4 per level). */
export function sleepRough(c, rng) {
  const h = rng.roll(c.level, 4) + (hasFeature(c, 'favoured') ? c.level : 0);
  c.hp = Math.min(c.maxHp, c.hp + h); c.ap = maxAp(c); resetDay(c);
  return `A night in a ditch: +${h} HP (${c.hp}/${c.maxHp}).`;
}

/** Mundane items are trivial to acquire in town: swap them freely and top up anything running low. */
export function restock(c) {
  for (const it of c.mundane) {
    const def = MUNDANE[it.id];
    if (def.tokens) it.tokens = def.tokens;
    if (def.uses) it.uses = def.uses;
  }
}
export function addMundane(c, id) { if (c.mundane.length >= MUNDANE_LIMIT || c.mundane.some((i) => i.id === id)) return false; c.mundane.push(makeItem(id)); return true; }
export function dropMundane(c, id) { c.mundane = c.mundane.filter((i) => i.id !== id); }

export function buy(c, id) {
  const def = SIGNIFICANT[id];
  if (!def || !def.cost || c.gold < def.cost) return null;
  c.gold -= def.cost;
  if (itemSlots(c) + (def.slots || 1) > SIGNIFICANT_LIMIT) { c.gold += def.cost; return null; }
  c.significant.push(makeItem(id));
  return `You buy ${itemRef(id)} for ${def.cost}GP.`;
}
/** The fence pays the item's value; things you could buy are taken back at half price.
 *  (gamebook) Loot an over-qualified scumbag picked up is worth half for each level over (`cut`). */
export function sellPrice(item) {
  const it = typeof item === 'string' ? { id: item } : item; const d = SIGNIFICANT[it.id];
  return d.value ? Math.floor(d.value / 2 ** (it.cut || 0)) : d.cost ? Math.floor(d.cost / 2) : 0;
}
export function sell(c, idx) {
  const it = c.significant[idx]; if (!it) return null;
  const p = sellPrice(it); if (!p) return null;
  c.significant.splice(idx, 1); c.gold += p;
  return `The fence gives you ${p}GP for ${itemRef(it.id)}.`;
}

export function weaponsFor(c) { return WEAPONS.filter((w) => w.weight <= prof(c)); }
export function buyWeapon(c, id) {
  const w = WEAPONS.find((x) => x.id === id); if (!w || c.gold < weaponPrice(w)) return null;
  c.gold -= weaponPrice(w); c.weapon = { ...w };
  c.sidearm = w.ranged ? { ...WEAPONS[0] } : null;
  return `You buy a ${w.name.toLowerCase()} (d${WEAPON_DIE[w.weight]}) for ${weaponPrice(w)}GP.`;
}
export function buyArmour(c, id) {
  const a = ARMOURS.find((x) => x.id === id); if (!a || c.gold < armourPrice(a)) return null;
  c.gold -= armourPrice(a); c.armour = { ...a }; c.shield = null; c.ap = maxAp(c);
  return `You buy ${a.name.toLowerCase()} (${a.ap} AP) for ${armourPrice(a)}GP.`;
}
export function buyShield(c, id) {
  const s = SHIELDS.find((x) => x.id === id); if (!s || c.gold < shieldPrice(s)) return null;
  c.gold -= shieldPrice(s); c.shield = { ...s }; c.armour = null; c.ap = 0;
  return `You buy a ${s.name.toLowerCase()} for ${shieldPrice(s)}GP.`;
}
