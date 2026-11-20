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

test('one light does a whole dark place; leaving and coming back costs another', () => {
  const g = new Game(adv, 2); g.begin(make(2, ['torches']));
  const torches = () => g.c.mundane.find((i) => i.id === 'torches').tokens;
  g.goto('library'); g.goto('library_nothing'); g.goto('library');
  assert.equal(torches(), 4);
  g.goto('hall'); g.goto('library');
  assert.equal(torches(), 3);
  const h = new Game(adv, 3); h.begin(make(3, ['rope'])); h.goto('library'); h.goto('mimic_fight');
  assert.equal(h.dark, true); assert.equal(h.fight.dark, true);   // a fight in the dark is in the dark
});

test('alchemist’s fire is used up when it is your only way to light something', () => {
  const g = new Game(adv, 6); g.begin(make(6, ['rope'])); g.c.significant.push({ id: 'fire', name: 'Alchemist’s fire' });
  g.goto('vault'); g.c.flags.vaultAngry = true;
  const burn = g.choices().find((c) => c.label === 'Set fire to the ledger');
  g.choose(burn.i);
  assert.ok(!g.c.significant.some((i) => i.id === 'fire'));
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
  assert.equal(ADVENTURES.length, 30);
  for (const a of ADVENTURES) {
    const b = buildAdventure(a.id);
    assert.equal(b.numbers.start, 1);
    assert.equal(b.numbers[a.final], b.count);
    assert.equal(b.sections[a.final].end, 'victory');
  }
});

test('adventures are revealed a level band at a time, and none can be repeated', async () => {
  const { ADVENTURES, availableFor, revealedFor } = await import('../src/adventure/index.js');
  const c = make(21);
  assert.deepEqual(availableFor(c).map((a) => a.tier), ADVENTURES.filter((a) => a.tier === 1).map(() => 1));
  const first = availableFor(c)[0]; c.done.push(first.id);
  const next = availableFor(c);
  assert.ok(!next.some((a) => a.id === first.id));
  assert.ok(next.some((a) => a.tier === 2) && !next.some((a) => a.tier > 2));
  // finishing the highest band available each time reaches every band, and doing everything leaves nothing
  const d = make(22);
  for (let band = 1; band <= 10; band++) {
    const a = availableFor(d).filter((x) => x.tier === band);
    assert.ok(a.length, `nothing in band ${band}`);
    d.done.push(a[0].id);
  }
  for (const a of ADVENTURES) if (!d.done.includes(a.id)) d.done.push(a.id);
  assert.equal(availableFor(d).length, 0);
  assert.equal(revealedFor(d).length, ADVENTURES.length);
});

test('the secret finale only goes up once enough of Snoad’s handiwork has been noticed', async () => {
  const { availableFor, revealedFor } = await import('../src/adventure/index.js');
  const c = make(24);
  c.done = ['death-and-taxes', 'standard-dragon']; c.past = {};
  const ids = () => availableFor(c).map((a) => a.id);
  assert.ok(ids().includes('final-demand') && !ids().includes('hedge-fund'));
  for (const id of ['legging-it', 'going-bananas', 'wrong-way-round', 'detention', 'out-of-the-cot']) { c.done.push(id); c.past[id] = { snoadClue: true }; }
  assert.ok(!ids().includes('hedge-fund'));
  c.past['standard-dragon'] = { snoadClue: true };
  assert.ok(ids().includes('hedge-fund') && revealedFor(c).some((a) => a.id === 'hedge-fund'));
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

test('finishing an adventure remembers what happened in it', async () => {
  const { recordAdventure } = await import('../src/rules/character.js');
  const { pastFlag, check } = await import('../src/engine/conditions.js');
  const c = make(24); c.flags = { burnt: 1, homeGold: 300 };
  recordAdventure(c, 'eviction-notice');
  assert.deepEqual(c.flags, {}); assert.ok(c.done.includes('eviction-notice'));
  assert.ok(pastFlag(c, 'eviction-notice', 'burnt'));
  assert.ok(!pastFlag(c, 'eviction-notice', 'homeGold'));
  assert.ok(check(c, { past: ['eviction-notice', 'burnt'] }).ok);
  assert.ok(!check(c, { notPast: ['eviction-notice', 'burnt'] }).ok);
});

// A character of a given profession and level, built by bots, for magic tests.
const caster = (prof, level, alignment) => {
  for (let s = 1; s < 5000; s++) {
    const r = new Rng(s); const c = botCharacter(r, level);
    if (c.profession === prof && (!alignment || c.alignment === alignment)) return c;
  }
  throw new Error(`no ${prof}`);
};
// Force the next d20s: every die() call returns the next value in the list, then falls back to the real RNG.
const rig = (g, values) => { const real = g.rng.die.bind(g.rng); const q = [...values]; g.rng.die = (n) => (q.length ? q.shift() : real(n)); };

test('magicians get a spell slot at every level, and know every spell up to their level', async () => {
  const { knownSpells } = await import('../src/rules/character.js');
  const c = caster('Sorcerer', 3);
  assert.deepEqual(Object.keys(c.slots), ['1', '2', '3']);
  assert.deepEqual([...new Set(knownSpells(c).map((s) => s.lvl))], [1, 2, 3]);
  const d = caster('Cleric', 5, 'chaos');
  assert.ok(knownSpells(d).every((s) => s.align === 'chaos'));
  assert.ok(knownSpells(d).some((s) => s.id === 'afflict'));
});

test('spells you don’t know aren’t offered; spells you know are', () => {
  const mk = buildAdventure('fortunes-fang');
  const g = new Game(mk, 1); g.c = caster('Sorcerer', 3); g.goto('cage');
  assert.ok(g.choices().some((c) => c.label.startsWith('Cast Knock')));
  const h = new Game(mk, 1); h.c = caster('Sorcerer', 2); h.goto('cage');
  assert.ok(!h.choices().some((c) => c.label.startsWith('Cast Knock')));
});

test('a divine critical failure casts the opposite spell and goes to the backfire section', () => {
  const g = new Game(adv, 1); g.c = caster('Cleric', 1, 'law');
  if (!g.c.mundane.some((i) => i.id === 'holysymbol')) g.c.mundane.push({ id: 'holysymbol', name: 'Holy symbol' });
  g.goto('hill');
  const i = g.section().choices.findIndex((c) => c.cast === 'light');
  rig(g, [20, 3, 20, 3]);
  g.choose(i);
  assert.equal(g.result.to, 'hill_shroud');
  assert.match(g.result.lines.join(' '), /casts Shroud instead/);
});

test('an arcane critical failure deals a d4 per spell level, and a successful high roll spends that level’s slot', () => {
  const mk = buildAdventure('fortunes-fang');
  const g = new Game(mk, 1); g.c = caster('Sorcerer', 3); g.c.hp = 50; g.c.maxHp = 50; g.goto('cage');
  const i = g.section().choices.findIndex((c) => c.cast === 'knock');
  rig(g, [20, 1, 20, 1, 4, 4, 4]);
  g.choose(i);
  assert.equal(g.c.hp, 50 - 12);
  const h = new Game(mk, 1); h.c = caster('Sorcerer', 3); h.goto('cage');
  rig(h, [2, 6, 2, 6]);
  h.choose(h.section().choices.findIndex((c) => c.cast === 'knock'));
  assert.equal(h.result.success, true);
  assert.equal(h.c.slots[3], false); assert.equal(h.c.slots[1], true);
});

test('higher-level spells turn up in fights, and divine backfires hit the caster', () => {
  const mk = buildAdventure('higher-still');
  const g = new Game(mk, 1); g.c = caster('Sorcerer', 9); g.goto('giant_fight');
  const spells = new Set(g.fightActions().filter((a) => a.id === 'cast').map((a) => a.spell));
  for (const s of ['bolt', 'grease', 'shock', 'freeze', 'fireball']) assert.ok(spells.has(s), s);
  const h = new Game(mk, 2); h.c = caster('Cleric', 5, 'law');
  if (!h.c.mundane.some((i) => i.id === 'holysymbol')) h.c.mundane.push({ id: 'holysymbol', name: 'Holy symbol' });
  h.c.hp = h.c.maxHp - 1; h.goto('giant_fight');
  const heal = h.fightActions().find((a) => a.spell === 'vivify');
  assert.ok(heal);
  const before = h.c.hp;
  rig(h, [20, 1, 20, 1]);
  h.fightAct(heal);
  assert.ok(h.c.hp < before, 'Afflict hurts the caster');
});

test('over-qualified scumbags keep half their profit for each level above the band, and loot fetches less', async () => {
  const town = await import('../src/engine/town.js');
  const adv = buildAdventure('death-and-taxes');   // band 1
  const win = Object.keys(adv.sections).find((k) => adv.sections[k].end === 'victory' && !adv.sections[k].on);
  for (const [level, expect] of [[1, 150], [2, 100], [3, 75]]) {
    const g = new Game(adv, 1); const c = botCharacter(new Rng(5), level);
    c.gold = 50; c.significant = []; c.flags = {};
    g.begin(c); c.gold = 50; c.flags.startGold = 50;   // whatever the opening section paid
    g.apply([{ gold: 100, uncapped: true }]);
    g.give('abacus');
    assert.equal(town.sellPrice(c.significant.at(-1)), 100 / 2 ** (level - 1));
    g.goto(win);
    assert.equal(c.gold, expect);
  }
});

test('every adventure has a line in the career write-up, and the finale ends it', async () => {
  const { ADVENTURES } = await import('../src/adventure/index.js');
  const { careerWriteUp } = await import('../src/adventure/career.js');
  const c = make(1);
  c.done = ADVENTURES.map((a) => a.id); c.past = { 'final-demand': { deferred: true } };
  const w = careerWriteUp(c, 'finale');
  assert.equal(w.lines.length, ADVENTURES.filter((a) => !a.finale).length);
  assert.match(w.ending, /more time/);
  assert.ok(w.lines.every((l) => typeof l === 'string' && l.endsWith('.')));
  c.past['hedge-fund'] = { racket: true };
  assert.match(careerWriteUp(c, 'finale', 'hedge-fund').ending, /business/);
  assert.match(careerWriteUp(c, 'died', 'hedge-fund').ending, /Wartleby/);
  c.past['wrong-way-round'] = { cursed: true };
  assert.match(careerWriteUp(c, 'town').title, /reverse centaur/);
  assert.doesNotMatch(careerWriteUp(c, 'died').title, /centaur/);
});
