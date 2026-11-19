// Narrative-consistency aid: for each section, which flags are always / sometimes set on arrival,
// and which sections lead there. Read each section's text against its "sometimes" flags.
// Usage: node tools/states.mjs <adventure-id> [games=4000]
import { buildAdventure, ADVENTURES } from '../src/adventure/index.js';
import { Game } from '../src/engine/game.js';
import { Rng } from '../src/rules/dice.js';
import { botCharacter, fightMove, tidyUp } from './bot.mjs';

const id = process.argv[2]; const N = +(process.argv[3] || 4000);
const meta = ADVENTURES.find((a) => a.id === id); const adv = buildAdventure(id);
const rng = new Rng(7); const seen = {};
const errors = new Set();
const note = (g, from) => {
  try { const t = g.text(); if (!Array.isArray(t) || t.some((x) => typeof x !== 'string' || /undefined|NaN|\[object/.test(x))) errors.add(`${g.at}: bad text ${JSON.stringify(t).slice(0, 200)}`); } catch (e) { errors.add(`${g.at}: ${e.message}`); }
  const s = (seen[g.at] ||= { n: 0, flags: {}, from: new Set() });
  s.n++; if (from) s.from.add(from);
  for (const [k, v] of Object.entries(g.c.flags)) if (v) s.flags[k] = (s.flags[k] || 0) + 1;
};
for (let n = 0; n < N; n++) {
  const lvl = parseInt(meta.levels, 10) + rng.int(0, 1);
  const g = new Game(adv, rng.int(1, 1e9)); g.begin(botCharacter(rng, lvl)); note(g);
  let steps = 0, last = g.at;
  while (!g.isOver() && steps++ < 300) {
    if (g.fight && !g.fight.over) { while (!g.fight.over) g.fightAct(fightMove(g, rng)); }
    else {
      tidyUp(g);
      const ch = g.choices().filter((x) => x.ok); if (!ch.length) break;
      let opts = ch.filter((x) => !((g.visits[x.to] || 0) >= 3));
      if (!opts.length) opts = ch;
      g.choose(rng.pick(opts).i);
    }
    if (g.at !== last) { note(g, last); last = g.at; }
  }
}
const boring = (f) => /^on:|^lit$|^lightCharges$|^homeGold$/.test(f);
const blank = { flags: new Proxy({}, { get: () => 0 }), done: [], level: 5, gold: 0, mundane: [], significant: [], name: 'X' };
for (const [k, sec] of Object.entries(adv.sections)) {
  const s = seen[k];
  if (!s) { console.log(`\n## ${k}: NEVER REACHED`); continue; }
  const always = Object.entries(s.flags).filter(([f, v]) => v === s.n && !boring(f)).map(([f]) => f);
  const some = Object.entries(s.flags).filter(([f, v]) => v < s.n && !boring(f)).map(([f, v]) => `${f}${Math.round(100 * v / s.n)}%`);
  let t; try { t = typeof sec.text === 'function' ? '[fn] ' + sec.text(blank).join(' ') : sec.text.join(' '); } catch { t = '[fn]'; }
  console.log(`\n## ${k} (${s.n}) <- ${[...s.from].join(',')}\n   always: ${always.join(' ')}\n   sometimes: ${some.join(' ')}\n   ${t.slice(0, 400)}`);
}
if (errors.size) { console.log('\nTEXT ERRORS:'); for (const e of errors) console.log('  ' + e); process.exitCode = 1; }
