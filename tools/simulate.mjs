// Bot playthroughs: random scumbags making random (but not suicidal) choices.
// Catches crashes and soft locks, and shows how deadly each fight is.
// Usage: node tools/simulate.mjs [games=2000] [seed=1]
import { buildAdventure } from '../src/adventure/index.js';
import { Game } from '../src/engine/game.js';
import { Rng } from '../src/rules/dice.js';
import { setHeroBonus } from '../src/rules/character.js';
import { botCharacter, fightMove, tidyUp } from './bot.mjs';

const N = +(process.argv[2] || 2000), SEED = +(process.argv[3] || 1);
if (process.argv[4]) setHeroBonus(+process.argv[4]);
const adv = buildAdventure();
const rng = new Rng(SEED);

const stats = { victory: 0, death: 0, quit: 0, stuck: 0, gold: 0, deaths: {}, fights: {} };
for (let n = 0; n < N; n++) {
  const g = new Game(adv, rng.int(1, 1e9));
  g.begin(botCharacter(rng));
  let steps = 0;
  while (!g.isOver() && steps++ < 400) {
    if (g.fight && !g.fight.over) {
      const key = g.at; const f = g.fight;
      (stats.fights[key] ||= { n: 0, won: 0, lost: 0, fled: 0 });
      while (!f.over) { const a = fightMove(g, rng); if (!a) throw new Error(`no fight action at ${key}`); g.fightAct(a); }
      const fs = stats.fights[key]; fs.n++; if (f.won) fs.won++; else if (f.lost) fs.lost++; else fs.fled++;
      continue;
    }
    tidyUp(g);
    const ch = g.choices().filter((x) => x.ok);
    if (!ch.length) { if (!g.isOver()) { stats.stuck++; console.error('stuck at', g.at); } break; }
    // bots don't go home, and only leave early sometimes
    let opts = ch.filter((x) => x.to !== 'go_home' && !(x.to === 'town' && g.at === 'hall' && rng.chance(4, 5)) && !((g.visits[x.to] || 0) >= 3 && x.kind !== 'go'));
    if (!opts.length) opts = ch;
    g.choose(rng.pick(opts).i);
  }
  const end = g.ending();
  if (end === 'death') { stats.death++; stats.deaths[g.at] = (stats.deaths[g.at] || 0) + 1; }
  else if (end === 'victory') { stats.victory++; stats.gold += g.c.gold; }
  else if (end === 'quit') stats.quit++;
  else stats.stuck++;
}
console.log(`${N} games: ${(100 * stats.victory / N).toFixed(0)}% back in town (avg ${(stats.gold / Math.max(1, stats.victory)).toFixed(0)}GP), ${(100 * stats.death / N).toFixed(0)}% dead, ${stats.stuck} stuck`);
console.log('deaths by section:', Object.entries(stats.deaths).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
console.log('fights (won/lost/fled):');
for (const [k, v] of Object.entries(stats.fights)) console.log(`  ${k.padEnd(18)} ${String(v.n).padStart(5)}  ${(100 * v.won / v.n).toFixed(0)}% / ${(100 * v.lost / v.n).toFixed(0)}% / ${(100 * v.fled / v.n).toFixed(0)}%`);
if (stats.stuck) process.exit(1);
