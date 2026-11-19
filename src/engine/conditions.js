// Conditions on choices ("If you have a rope, turn to 12") and the light/fire helpers they use.
import { isSkilled, magicType, knownSpells, hasFeature } from '../rules/character.js';
import { MUNDANE, SIGNIFICANT, SPELLS } from '../rules/data.js';

export const hasItem = (c, id) => c.mundane.some((i) => i.id === id && (i.tokens === undefined || i.tokens > 0) && (i.uses === undefined || i.uses > 0))
  || c.significant.some((i) => i.id === id && (i.tokens === undefined || i.tokens > 0) && (i.uses === undefined || i.uses > 0));
export const itemName = (id) => (MUNDANE[id] || SIGNIFICANT[id] || { name: id }).name;
/** An item mid-sentence: "the old map", "the healer’s kit", "Ezra Tock’s winding key" (items can set `ref`). */
export function itemRef(id) {
  const d = MUNDANE[id] || SIGNIFICANT[id]; const n = d ? d.name : id;
  if (d && d.ref) return d.ref;
  return /^The /.test(n) ? `the ${n.slice(4)}` : `the ${n[0].toLowerCase()}${n.slice(1)}`;
}

/** Something that gives light right now (without spending it). */
export function lightSource(c) {
  if ((c.flags.lightCharges || 0) > 0) return 'divine light';
  if (hasItem(c, 'torches')) return 'torch';
  if (hasItem(c, 'lantern') && hasItem(c, 'oil')) return 'lantern';
  if (hasItem(c, 'ipad')) return 'glowing slate';
  return null;
}
/** Something that can set things on fire. */
export const fireTool = (c) => (hasItem(c, 'flint') ? 'flint' : hasItem(c, 'torches') ? 'torch' : hasItem(c, 'lantern') && hasItem(c, 'oil') ? 'lantern' : hasItem(c, 'fire') ? 'fire' : null);
export const fireSource = (c) => !!fireTool(c);

export function canCast(c, spellId) {
  const s = SPELLS[spellId]; if (!s) return false;
  if (!knownSpells(c).some((k) => k.id === spellId)) return false;
  if (!c.slots[s.lvl]) return false;
  if (s.list === 'divine' && !hasItem(c, 'holysymbol')) return false;
  return true;
}

/** Something the scumbag did in an earlier adventure: a flag that was set when they finished it. */
export const pastFlag = (c, adventureId, flag) => !!(c.past && c.past[adventureId] && c.past[adventureId][flag]);
/** Whether the scumbag finished an adventure (even before past flags were recorded). */
export const didAdventure = (c, adventureId) => (c.done || []).includes(adventureId);

/** Evaluate a condition object. Returns { ok, reason } where reason is shown on a locked choice. */
export function check(c, cond) {
  if (!cond) return { ok: true };
  const fails = [];
  const need = (ok, reason) => { if (!ok) fails.push(reason); };
  if (cond.item) need(hasItem(c, cond.item), itemName(cond.item));
  if (cond.anyItem) need(cond.anyItem.some((id) => hasItem(c, id)), cond.anyItem.map(itemName).join(' or '));
  if (cond.notItem) need(!hasItem(c, cond.notItem), `no ${itemName(cond.notItem)}`);
  if (cond.flag) need(!!c.flags[cond.flag], cond.flagText || 'something you haven’t learned');
  if (cond.notFlag) need(!c.flags[cond.notFlag], cond.notFlagText || 'already done');
  if (cond.gold) need(c.gold >= cond.gold, `${cond.gold}GP`);
  if (cond.past) need(pastFlag(c, cond.past[0], cond.past[1]), cond.pastText || 'something you did before');
  if (cond.notPast) need(!pastFlag(c, cond.notPast[0], cond.notPast[1]), cond.notPastText || 'something you didn’t do before');
  if (cond.atLeast) need((c.flags[cond.atLeast[0]] || 0) >= cond.atLeast[1], cond.atLeastText || 'more of something');
  if (cond.below) need((c.flags[cond.below[0]] || 0) < cond.below[1], cond.belowText || 'less of something');
  if (cond.level) need(c.level >= cond.level, `level ${cond.level}`);
  if (cond.magic) need(magicType(c) === cond.magic, cond.magic === 'divine' ? 'a divine magician' : 'an arcane magician');
  if (cond.alignment) need(c.alignment === cond.alignment, `serving ${cond.alignment}`);
  if (cond.skill) need(isSkilled(c, cond.skill), `the ${cond.skill} skill`);
  if (cond.spell) need(canCast(c, cond.spell), `${SPELLS[cond.spell].name} and a spell slot`);
  if (cond.light) need(!!lightSource(c), 'a light');
  if (cond.fire) need(fireSource(c), 'something to start a fire');
  if (cond.feature) need(hasFeature(c, cond.feature), cond.featureText || 'a particular knack');
  if (cond.ranged) need(!!(c.weapon && c.weapon.ranged), 'a ranged weapon');
  if (cond.none) need(!cond.none.some((x) => check(c, x).ok), 'none of that');
  if (cond.any) {
    const r = cond.any.map((x) => check(c, x));
    need(r.some((x) => x.ok), r.map((x) => x.reason).join(' or '));
  }
  return fails.length ? { ok: false, reason: `needs ${fails.join(', ')}` } : { ok: true };
}
