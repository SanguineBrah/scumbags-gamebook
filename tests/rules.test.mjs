import test from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/rules/dice.js';
import { statTest, successChance } from '../src/rules/tests.js';
import { rollOrigins, createCharacter, isSkilled, goldRoom, HERO_HP_BONUS } from '../src/rules/character.js';
import { STATS, QUALITIES, PROFESSIONS } from '../src/rules/data.js';

test('a stat test succeeds when d20 + DD is less than the stat', () => {
  assert.equal(successChance(12, 8).toFixed(3), '0.325');
  const r = new Rng(3);
  for (let i = 0; i < 2000; i++) {
    const t = statTest(r, { stat: 12, dd: 8, forceRoll: true });
    if (t.skill !== 1 && t.skill !== 20) assert.equal(t.success, t.total < 12);
  }
});

test('character creation follows the rulebook (plus the lone-hero bonus)', () => {
  for (let s = 1; s < 300; s++) {
    const r = new Rng(s); const o = rollOrigins(r);
    const c = createCharacter(r, o, { mundane: ['torches'] });
    const total = STATS.reduce((a, k) => a + c.stats[k], 0);
    assert.equal(total, 6 * 9 + 2 + 1 + 3 + 1);
    const hardened = QUALITIES[o.qi].key === 'hardened' ? 1 : 0;
    assert.ok(c.maxHp >= 6 + HERO_HP_BONUS + hardened && c.maxHp <= 11 + HERO_HP_BONUS + hardened);
    assert.ok(c.weapon.weight <= PROFESSIONS[o.pi].prof);
    assert.ok(isSkilled(c, `save:${QUALITIES[o.qi].core}`));
  }
});

test('every 50GP takes a significant item slot', () => {
  const r = new Rng(1); const c = createCharacter(r, rollOrigins(r), { mundane: [], extra: 'potion' });
  assert.equal(goldRoom(c), 11 * 50);
  c.gold = 120; assert.equal(goldRoom(c), 11 * 50 - 120);
});
