// Each fight in the book, fought from full health by fresh level 1 bots. Usage: node tools/duels.mjs [n=2000] [heroBonus]
import { buildAdventure } from '../src/adventure/index.js';
import { Game } from '../src/engine/game.js';
import { Rng } from '../src/rules/dice.js';
import { setHeroBonus } from '../src/rules/character.js';
import { botCharacter, fightMove } from './bot.mjs';

const N = +(process.argv[2] || 2000); if (process.argv[3]) setHeroBonus(+process.argv[3]);
const adv = buildAdventure(); const rng = new Rng(7);
for (const [k, s] of Object.entries(adv.sections)) {
  if (!s.fight) continue;
  let won = 0, lost = 0, hpLeft = 0;
  for (let i = 0; i < N; i++) {
    const g = new Game(adv, rng.int(1, 1e9)); g.c = botCharacter(rng); g.goto(k);
    const f = g.fight; let n = 0;
    while (!f.over && n++ < 200) g.fightAct(fightMove(g, rng));
    if (f.won) { won++; hpLeft += g.c.hp / g.c.maxHp; } else if (f.lost) lost++;
  }
  console.log(`${k.padEnd(18)} win ${(100 * won / N).toFixed(0).padStart(3)}%  die ${(100 * lost / N).toFixed(0).padStart(3)}%  HP left when won ${(100 * hpLeft / Math.max(1, won)).toFixed(0)}%`);
}
