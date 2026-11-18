// Assemble the adventure: shuffle section keys into numbered paragraphs, in the traditional gamebook way.
// The first section is always 1 and the ending in town is always the last number.
import { Rng } from '../rules/dice.js';
import { SECTIONS, TITLE, BLURB, DEATH_TEXT } from './death-and-taxes.js';

export function buildAdventure(seed = 1918) {
  const keys = Object.keys(SECTIONS);
  const middle = keys.filter((k) => k !== 'start' && k !== 'town');
  new Rng(seed).shuffle(middle);
  const order = ['start', ...middle, 'town'];
  const numbers = Object.fromEntries(order.map((k, i) => [k, i + 1]));
  const byNumber = Object.fromEntries(order.map((k, i) => [i + 1, k]));
  return { title: TITLE, blurb: BLURB, deathText: DEATH_TEXT, start: 'start', sections: SECTIONS, numbers, byNumber, count: order.length };
}
