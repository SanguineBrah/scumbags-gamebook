// The adventures, and how each one is assembled: section keys are shuffled into numbered
// paragraphs, in the traditional gamebook way, with the start as 1 and the adventure's last ending as the last number.
import { Rng } from '../rules/dice.js';
import { META as M1, SECTIONS as S1, DEATH_TEXT as D1 } from './death-and-taxes.js';
import { META as M2, SECTIONS as S2, DEATH_TEXT as D2 } from './the-tall-order.js';
import { META as M3, SECTIONS as S3, DEATH_TEXT as D3 } from './fortunes-fang.js';
import { META as M4, SECTIONS as S4, DEATH_TEXT as D4 } from './mothers-kitchen.js';
import { META as M5, SECTIONS as S5, DEATH_TEXT as D5 } from './eviction-notice.js';

const SOURCES = [[M1, S1, D1], [M2, S2, D2], [M3, S3, D3], [M4, S4, D4], [M5, S5, D5]];
export const ADVENTURES = SOURCES.map(([m]) => m);

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
