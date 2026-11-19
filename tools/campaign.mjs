// Whole careers: one bot scumbag plays adventure after adventure until it dies or runs out.
// Compares a "rusher", who always takes the newest band on offer, with a "farmer", who
// clears every lower adventure first. Shows level on arrival and death rate in each band.
// Usage: node tools/campaign.mjs [careers=400] [seed=1] [rule=none|taper|cost|cap|close]
//   taper: an adventure pays half for each level you are above its band
//   cost:  each level costs 100GP times your current level
//   cap:   you can't level past the top of the band after the highest one you've finished
//   close: adventures whose band tops out more than a level below yours aren't offered
import { buildAdventure, ADVENTURES, availableFor, bandFor } from '../src/adventure/index.js';
import { Game } from '../src/engine/game.js';
import { Rng } from '../src/rules/dice.js';
import { recordAdventure, wasteForLevel } from '../src/rules/character.js';
import { LEVEL_COST, SIGNIFICANT } from '../src/rules/data.js';
import * as town from '../src/engine/town.js';
import { botCharacter, fightMove, tidyUp } from './bot.mjs';

const N = +(process.argv[2] || 400), SEED = +(process.argv[3] || 1), RULE = process.argv[4] || 'none';
const built = Object.fromEntries(ADVENTURES.map((a) => [a.id, buildAdventure(a.id)]));
const topOf = (a) => parseInt(String(a.levels).split('–').at(-1), 10);

function play(c, adv, rng) {
  const g = new Game(adv, rng.int(1, 1e9));
  g.begin(c);
  let steps = 0;
  while (!g.isOver() && steps++ < 400) {
    if (g.fight && !g.fight.over) { const f = g.fight; while (!f.over) g.fightAct(fightMove(g, rng)); continue; }
    tidyUp(g);
    const ch = g.choices().filter((x) => x.ok);
    if (!ch.length) break;
    let opts = ch.filter((x) => x.to !== 'go_home' && !(x.to === 'town' && g.at === 'hall' && rng.chance(4, 5)) && !((g.visits[x.to] || 0) >= 3 && x.kind !== 'go'));
    if (!opts.length) opts = ch;
    g.choose(rng.pick(opts).i);
  }
  return g.ending() || 'stuck';
}

function inTown(c, rng) {
  if (!town.restAtInn(c)) town.sleepRough(c, rng);
  town.restock(c);
  const cost = () => RULE === 'cost' ? 100 * c.level : LEVEL_COST;
  const cap = RULE === 'cap' ? bandFor(c) : Infinity;   // band N's top level is N
  while (c.gold >= cost() && c.level < cap) { c.gold -= cost() - LEVEL_COST; wasteForLevel(rng, c); }
  const potions = () => c.significant.filter((i) => i.id === 'potion').length;
  while (potions() < 3 && c.gold >= SIGNIFICANT.potion.cost && town.buy(c, 'potion'));
}

function career(strategy, rng) {
  const c = botCharacter(rng, 1);
  const log = [];
  for (;;) {
    const avail = availableFor(c).filter((a) => RULE !== 'close' || c.level <= topOf(a) + 1);
    if (!avail.length) return { log, alive: true, c };
    const tiers = avail.map((a) => a.tier);
    const tier = strategy === 'rush' ? Math.max(...tiers) : Math.min(...tiers);
    const meta = rng.pick(avail.filter((a) => a.tier === tier));
    const lvl = c.level, gold = c.gold;
    const back = log.some((e) => e.tier > tier);   // a rusher mopping up once the top band is done
    const end = play(c, built[meta.id], rng);
    log.push({ tier, lvl, over: lvl - topOf(meta), end, back, gold: c.gold - gold });
    if (end !== 'victory') return { log, alive: false, c };
    const over = lvl - topOf(meta);
    if (RULE === 'taper' && over > 0 && c.gold > gold) c.gold = gold + Math.floor((c.gold - gold) / 2 ** over);
    recordAdventure(c, meta.id);
    inTown(c, rng);
  }
}

const rng = new Rng(SEED);
for (const strategy of ['rush', 'farm']) {
  const per = {}, ends = {}; let finished = 0, attempts = 0;
  for (let n = 0; n < N; n++) {
    const r = career(strategy, rng);
    if (r.alive) finished++;
    attempts += r.log.length;
    for (const e of r.log.filter((x) => !x.back)) {
      const t = (per[e.tier] ||= { n: 0, died: 0, lvl: 0, first: 0, firstLvl: 0, seen: new Set() });
      t.n++; t.lvl += e.lvl; if (e.end === 'death') t.died++; if (e.end === 'victory') { t.won = (t.won || 0) + 1; t.gold = (t.gold || 0) + e.gold; } ends[e.end] = (ends[e.end] || 0) + 1;
    }
    const firsts = new Map(); for (const e of r.log) if (!firsts.has(e.tier)) firsts.set(e.tier, e.lvl);
    for (const [tier, lvl] of firsts) { per[tier].first++; per[tier].firstLvl += lvl; }
  }
  console.log(`\n[${RULE}] ${strategy === 'rush' ? 'RUSHER (newest band first)' : 'FARMER (clears lower bands first)'}: ${N} careers, ${(attempts / N).toFixed(1)} adventures each, ${(100 * finished / N).toFixed(0)}% run out of adventures alive`);
  console.log('endings:', JSON.stringify(ends));
  console.log('band  levels  reached  level on arrival  avg level  deaths  GP per win');
  for (const tier of Object.keys(per).map(Number).sort((a, b) => a - b)) {
    const t = per[tier]; const meta = ADVENTURES.find((a) => a.tier === tier);
    console.log(`${String(tier).padStart(4)}  ${String(meta.levels).padEnd(6)}  ${(100 * t.first / N).toFixed(0).padStart(6)}%  ${(t.firstLvl / t.first).toFixed(1).padStart(16)}  ${(t.lvl / t.n).toFixed(1).padStart(9)}  ${(100 * t.died / t.n).toFixed(0).padStart(6)}%  ${(t.gold / Math.max(1, t.won)).toFixed(0).padStart(9)}`);
  }
}
