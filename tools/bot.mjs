// Shared bot logic for tools/simulate.mjs and tools/duels.mjs.
import { rollOrigins, createCharacter, startingWeapons, levelUp } from '../src/rules/character.js';
import { MUNDANE, SPELLS } from '../src/rules/data.js';

const POOL = Object.keys(MUNDANE);

export function botCharacter(r, level = 1) {
  const o = rollOrigins(r);
  const tmp = createCharacter(r, o, { mundane: [] });
  const weapons = startingWeapons(tmp);
  const ranged = tmp.profession && ['Assassin', 'Hunter', 'Missionary'].includes(tmp.profession);
  const w = weapons.filter((x) => x.ranged === ranged).at(-1) || weapons.at(-1);
  const kit = new Set(['torches', 'healerskit']);
  if (w.ranged) kit.add('ammo');
  if (['Cleric', 'Missionary'].includes(tmp.profession)) kit.add('holysymbol');
  while (kit.size < 6) kit.add(r.pick(POOL));
  const caster = ['Cleric', 'Missionary', 'Alchemist', 'Sorcerer'].includes(tmp.profession);
  const c = createCharacter(r, o, { weapon: w.id, protection: r.chance(1, 3) ? 'shield' : 'armour', mundane: [...kit], alignment: r.pick(['law', 'chaos']), extra: caster ? 'fire' : 'potion' });
  while (c.level < level) levelUp(r, c);
  c.gold = 40 * (level - 1);
  return c;
}

export function fightMove(g, rng) {
  const acts = g.fightActions(); const c = g.c;
  const pick = (id) => acts.find((a) => a.id === id);
  if (c.hp < c.maxHp * 0.4 && pick('potion')) return pick('potion');
  if (pick('special')) return pick('special');
  const fire = acts.find((a) => a.id === 'fire');
  if (fire && g.fight.monsters.some((m) => m.lvl >= 2 || m.dormant)) return fire;
  if (pick('turn')) return pick('turn');
  if (c.hp < c.maxHp * 0.25 && pick('flee') && rng.chance(1, 2)) return pick('flee');
  const casts = acts.filter((a) => a.id === 'cast');
  const healing = casts.filter((a) => ['heal', 'vivify', 'hysteria'].includes(a.spell));
  if (c.hp < c.maxHp * 0.4 && healing.length) return healing[healing.length - 1];
  const immune = (a) => a.target && g.fight.monsters.find((m) => m.uid === a.target).feats.includes('magicImmune');
  const attacking = casts.filter((a) => !['heal', 'vivify', 'hysteria', 'sanctuary', 'chosen', 'consecrate', 'banish'].includes(a.spell) && !(a.spell === 'fireball' && g.fight.distance === 0) && !immune(a));
  if (attacking.length) { const best = Math.max(...attacking.map((a) => SPELLS[a.spell].lvl)); return rng.pick(attacking.filter((a) => SPELLS[a.spell].lvl === best)); }
  return pick('attack') || pick('fallback') || pick('shoot') || pick('sidearm') || pick('advance') || pick('block') || pick('flee') || acts[0];
}


/** Between sections: patch yourself up like a sensible player would. */
export function tidyUp(g) {
  const c = g.c;
  for (const id of ['vivify', 'heal', 'hysteria']) if (c.hp < c.maxHp * 0.6 && g.sheetSpells().some((s) => s.id === id)) g.castFromSheet(id);
  if (c.hp < c.maxHp * 0.6 && g.canHeal()) g.useHealersKit();
  if (c.hp < c.maxHp * 0.4 && g.canDrink()) g.drinkPotion();
}
