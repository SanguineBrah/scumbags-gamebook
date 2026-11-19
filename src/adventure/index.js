// The adventures, and how each one is assembled: section keys are shuffled into numbered
// paragraphs, in the traditional gamebook way, with the start as 1 and the adventure's last ending as the last number.
import { Rng } from '../rules/dice.js';
import { META as M1, SECTIONS as S1, DEATH_TEXT as D1 } from './death-and-taxes.js';
import { META as M2, SECTIONS as S2, DEATH_TEXT as D2 } from './the-tall-order.js';
import { META as M3, SECTIONS as S3, DEATH_TEXT as D3 } from './fortunes-fang.js';
import { META as M4, SECTIONS as S4, DEATH_TEXT as D4 } from './mothers-kitchen.js';
import { META as M5, SECTIONS as S5, DEATH_TEXT as D5 } from './eviction-notice.js';
import { META as M6, SECTIONS as S6, DEATH_TEXT as D6 } from './last-ride.js';
import { META as M7, SECTIONS as S7, DEATH_TEXT as D7 } from './invisible-menagerie.js';
import { META as M8, SECTIONS as S8, DEATH_TEXT as D8 } from './unsolved.js';
import { META as M9, SECTIONS as S9, DEATH_TEXT as D9 } from './torches-and-pitchforks.js';
import { META as M10, SECTIONS as S10, DEATH_TEXT as D10 } from './standard-dragon.js';
import { META as M11, SECTIONS as S11, DEATH_TEXT as D11 } from './legging-it.js';
import { META as M12, SECTIONS as S12, DEATH_TEXT as D12 } from './bath-night.js';
import { META as M13, SECTIONS as S13, DEATH_TEXT as D13 } from './wrong-way-round.js';
import { META as M14, SECTIONS as S14, DEATH_TEXT as D14 } from './now-you-see-him.js';
import { META as M15, SECTIONS as S15, DEATH_TEXT as D15 } from './vow-of-silence.js';
import { META as M16, SECTIONS as S16, DEATH_TEXT as D16 } from './knightmare.js';
import { META as M17, SECTIONS as S17, DEATH_TEXT as D17 } from './splitting-heirs.js';
import { META as M18, SECTIONS as S18, DEATH_TEXT as D18 } from './going-bananas.js';
import { META as M19, SECTIONS as S19, DEATH_TEXT as D19 } from './detention.js';
import { META as M20, SECTIONS as S20, DEATH_TEXT as D20 } from './out-of-the-cot.js';
import { META as M21, SECTIONS as S21, DEATH_TEXT as D21 } from './taking-the-waters.js';
import { META as M22, SECTIONS as S22, DEATH_TEXT as D22 } from './trial-by-ducking.js';
import { META as M23, SECTIONS as S23, DEATH_TEXT as D23 } from './more-taxes.js';
import { META as M24, SECTIONS as S24, DEATH_TEXT as D24 } from './clockwork-cathedral.js';
import { META as M25, SECTIONS as S25, DEATH_TEXT as D25 } from './leaving-do.js';
import { META as M26, SECTIONS as S26, DEATH_TEXT as D26 } from './heads-you-lose.js';
import { META as M27, SECTIONS as S27, DEATH_TEXT as D27 } from './death-takes-a-holiday.js';
import { META as M28, SECTIONS as S28, DEATH_TEXT as D28 } from './higher-still.js';
import { META as M29, SECTIONS as S29, DEATH_TEXT as D29 } from './final-demand.js';

const SOURCES = [[M1, S1, D1], [M2, S2, D2], [M3, S3, D3], [M4, S4, D4], [M5, S5, D5], [M6, S6, D6], [M7, S7, D7], [M8, S8, D8], [M9, S9, D9], [M10, S10, D10], [M11, S11, D11], [M12, S12, D12], [M13, S13, D13], [M14, S14, D14], [M15, S15, D15], [M16, S16, D16], [M17, S17, D17], [M18, S18, D18], [M19, S19, D19], [M20, S20, D20], [M21, S21, D21], [M22, S22, D22], [M23, S23, D23], [M24, S24, D24], [M25, S25, D25], [M26, S26, D26], [M27, S27, D27], [M28, S28, D28], [M29, S29, D29]];
export const ADVENTURES = SOURCES.map(([m]) => m);

/** The highest level band a scumbag has opened: band 1 always, and each band finished opens the next. */
export function bandFor(c) {
  const done = new Set(c.done || []);
  return 1 + Math.max(0, ...ADVENTURES.filter((a) => done.has(a.id)).map((a) => a.tier));
}
/** Adventures a scumbag can take on now: every one not done yet, in any band they have opened. */
export function availableFor(c) {
  const done = c.done || []; const band = bandFor(c);
  return ADVENTURES.filter((a) => !done.includes(a.id) && a.tier <= band).sort((a, b) => a.tier - b.tier);
}
/** Adventures this scumbag has revealed (done or available); the rest are hidden. */
export function revealedFor(c) {
  const band = bandFor(c);
  return ADVENTURES.filter((a) => (c.done || []).includes(a.id) || a.tier <= band);
}

const cache = {};
export function buildAdventure(id = ADVENTURES[0].id) {
  if (cache[id]) return cache[id];
  const i = SOURCES.findIndex(([m]) => m.id === id);
  if (i < 0) throw new Error(`No adventure "${id}"`);
  const [meta, sections, deathText] = SOURCES[i];
  const keys = Object.keys(sections);
  const middle = keys.filter((k) => k !== 'start' && k !== meta.final);
  new Rng(1918 + i).shuffle(middle);
  const order = ['start', ...middle, meta.final];
  const numbers = Object.fromEntries(order.map((k, n) => [k, n + 1]));
  return (cache[id] = { ...meta, deathText, start: 'start', sections, numbers, count: order.length });
}
