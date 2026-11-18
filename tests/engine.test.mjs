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
