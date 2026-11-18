import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildAdventure } from '../src/adventure/index.js';
import { Game } from '../src/engine/game.js';
import { Rng } from '../src/rules/dice.js';
import { rollOrigins, createCharacter } from '../src/rules/character.js';
import { botCharacter, fightMove, tidyUp } from '../tools/bot.mjs';

const adv = buildAdventure();
const make = (seed, mundane = ['torches', 'healerskit', 'rope', 'tools', 'quill', 'flint']) => {
  const r = new Rng(seed); return createCharacter(r, rollOrigins(r), { mundane, extra: 'potion' });
};

test('the adventure graph is complete', () => {
  execFileSync(process.execPath, ['tools/check.mjs']);
});

test('sections are numbered 1..N with the start first and the ending last', () => {
  assert.equal(adv.numbers.start, 1);
  assert.equal(adv.numbers.town, adv.count);
  assert.equal(new Set(Object.values(adv.numbers)).size, adv.count);
});

test('locked choices say what they need', () => {
  const g = new Game(adv, 1); g.begin(make(1, ['torches']));
  g.goto('hill'); g.goto('front_door');
  const form = g.choices().find((c) => c.label.startsWith('Fill in Form 7B'));
  assert.equal(form.ok, false); assert.match(form.reason, /Quill/);
});

test('dark places use up light, and without it tests get harder', () => {
  const g = new Game(adv, 2); g.begin(make(2, ['torches']));
  g.goto('library');
  assert.equal(g.c.mundane.find((i) => i.id === 'torches').tokens, 4);
  const h = new Game(adv, 3); h.begin(make(3, ['rope'])); h.goto('library');
  assert.equal(h.dark, true);
  assert.match(h.choices()[0].detail, /d20\+d12/);
});

test('gold beyond what you can carry stays behind', () => {
  const g = new Game(adv, 4); g.begin(make(4)); g.goto('treasure');
  assert.ok(g.c.gold <= 12 * 50);
  assert.ok(g.messages.some((m) => /can’t carry/.test(m.text)));
});

test('save and load round-trip', () => {
  const g = new Game(adv, 5); g.begin(make(5)); g.goto('hall');
  const h = Game.load(adv, g.save());
  assert.equal(h.at, 'hall'); assert.deepEqual(h.c, g.c);
});

test('hundreds of bot playthroughs finish without crashing or getting stuck', () => {
  const rng = new Rng(9);
  for (let n = 0; n < 300; n++) {
    const g = new Game(adv, n + 1); g.begin(botCharacter(rng));
    let steps = 0;
    while (!g.isOver() && steps++ < 400) {
      if (g.fight && !g.fight.over) { while (!g.fight.over) g.fightAct(fightMove(g, rng)); continue; }
      tidyUp(g);
      const ch = g.choices().filter((c) => c.ok);
      assert.ok(ch.length, `stuck at ${g.at}`);
      g.choose(rng.pick(ch.filter((c) => c.to !== 'go_home')).i ?? ch[0].i);
    }
    assert.ok(g.isOver() || steps >= 400);
  }
});

test('tests count as skilled when the profession justifies it', () => {
  const g = new Game(adv, 6); g.begin(make(6));
  const climb = { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Woodcutter'] };
  g.c.profession = 'Woodcutter'; assert.equal(g.testSkilled(climb), true);
  g.c.profession = 'Sellsword'; assert.equal(g.testSkilled(climb), true);   // athletics
  g.c.profession = 'Sorcerer'; assert.equal(g.testSkilled(climb), false);
  g.c.profession = 'Alchemist';
  assert.equal(g.testSkilled({ stat: 'Con', dd: 8, save: true, skill: ['medicine'] }), true);
});

test('monster armour soaks damage before HP', async () => {
  const { makeMonster, hurtMonster } = await import('../src/engine/combat.js');
  const g = new Game(adv, 7); g.begin(make(7));
  const m = makeMonster(g.rng, { name: 'knight', lvl: 2, hp: 6, ap: 6 });
  const f = { log: [] };
  hurtMonster(g, f, m, 8);
  assert.equal(m.ap, 0); assert.equal(m.hp, 4);
});

test('a big item makes room by leaving coins behind', () => {
  const g = new Game(adv, 8); g.begin(make(8));
  g.c.gold = 550;   // 11 slots of coin + the starting potion = 12
  g.give('hat');    // 4 slots
  assert.ok(g.c.significant.some((i) => i.id === 'hat'));
  assert.ok(g.c.gold <= 350 && g.c.gold >= 300);
});

test('every adventure is complete and its final section is a victory', async () => {
  const { ADVENTURES, buildAdventure } = await import('../src/adventure/index.js');
  assert.equal(ADVENTURES.length, 10);
  for (const a of ADVENTURES) {
    const b = buildAdventure(a.id);
    assert.equal(b.numbers.start, 1);
    assert.equal(b.numbers[a.final], b.count);
    assert.equal(b.sections[a.final].end, 'victory');
  }
});

test('adventures are revealed one by one, and none can be repeated', async () => {
  const { ADVENTURES, availableFor, revealedFor } = await import('../src/adventure/index.js');
  const c = make(21);
  assert.deepEqual(availableFor(c).map((a) => a.id), ['death-and-taxes']);
  c.done.push('death-and-taxes');
  const next = availableFor(c).map((a) => a.id);
  assert.ok(!next.includes('death-and-taxes'));
  assert.deepEqual(next.sort(), ['fortunes-fang', 'tall-order']);
  // every adventure is reachable by doing them in order, and the last leaves nothing to do
  const d = make(22);
  for (let i = 0; i < ADVENTURES.length; i++) {
    const a = availableFor(d); assert.ok(a.length, `nothing available after ${d.done.length}`);
    d.done.push(a[0].id);
  }
  assert.equal(availableFor(d).length, 0);
  assert.equal(revealedFor(d).length, ADVENTURES.length);
});

test('the town: inn, market, apothecary and fence', async () => {
  const town = await import('../src/engine/town.js');
  const c = make(23); c.gold = 100; c.hp = 1;
  assert.ok(town.restAtInn(c)); assert.equal(c.hp, c.maxHp); assert.equal(c.gold, 95);
  const torch = c.mundane.find((i) => i.id === 'torches'); torch.tokens = 1;
  town.restock(c); assert.equal(torch.tokens, 5);
  assert.ok(town.buy(c, 'potion')); assert.equal(c.gold, 85);
  const idx = c.significant.findIndex((i) => i.id === 'potion');
  assert.ok(town.sell(c, idx)); assert.equal(c.gold, 90);
  assert.equal(town.sellPrice('hat'), 370);
  c.gold = 0; assert.equal(town.restAtInn(c), null);
});
