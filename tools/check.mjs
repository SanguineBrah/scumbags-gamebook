// Validate the adventure graph: every target exists, every section is reachable from the start,
// and every non-ending section has a way out that doesn't depend on items or luck you might not have.
import { buildAdventure } from '../src/adventure/index.js';

const adv = buildAdventure();
const S = adv.sections;
const errors = [];
const exits = (k) => {
  const s = S[k]; const out = [];
  for (const ch of s.choices || []) for (const t of [ch.to, ch.pass, ch.fail, ch.chaos, ch.critFail]) if (t) out.push(t);
  if (s.fight) { out.push(s.fight.win); if (s.fight.flee) out.push(s.fight.flee.to); }
  return out;
};
for (const k of Object.keys(S)) {
  const s = S[k];
  for (const t of exits(k)) if (!S[t]) errors.push(`${k}: goes to missing section "${t}"`);
  if (!s.end && !exits(k).length) errors.push(`${k}: dead end`);
  if (!s.end && !s.fight && !(s.choices || []).some((ch) => !ch.if && !ch.show)) {
    // every exit is conditional: make sure the conditions can't all fail together
    const free = (s.choices || []).filter((ch) => !ch.if);
    if (!free.length) errors.push(`${k}: every choice needs something (possible soft lock)`);
  }
  if (!s.text) errors.push(`${k}: no text`);
}
const seen = new Set(['start']); const queue = ['start'];
while (queue.length) for (const t of exits(queue.shift())) if (S[t] && !seen.has(t)) { seen.add(t); queue.push(t); }
for (const k of Object.keys(S)) if (!seen.has(k)) errors.push(`${k}: unreachable`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`ok: ${adv.count} sections, all reachable, no dead ends`);
