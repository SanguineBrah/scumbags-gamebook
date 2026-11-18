// Which items, spells and professions each adventure gives a use to. Helps spot kit that's never useful.
// Usage: node tools/affordances.mjs
import { buildAdventure, ADVENTURES } from '../src/adventure/index.js';
import { MUNDANE, SIGNIFICANT, SPELLS, PROFESSIONS } from '../src/rules/data.js';

const KIT = [...Object.keys(MUNDANE).filter((k) => !MUNDANE[k].hidden), 'fire', 'acid', 'caltrops', 'potion', 'insight'];
const COMBAT = { pocketsand: 1, fire: 1, acid: 1, caltrops: 1, holywater: 1, potion: 1, insight: 1 };   // always usable in a fight
const total = Object.fromEntries([...KIT, ...Object.keys(SPELLS)].map((k) => [k, 0]));
for (const { id } of ADVENTURES) {
  const adv = buildAdventure(id); const used = new Set(); const profs = new Set();
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;
    for (const k of ['item', 'lose', 'notItem']) if (typeof n[k] === 'string') used.add(n[k]);
    for (const v of n.anyItem || []) used.add(v);
    if (typeof n.cast === 'string') used.add(n.cast); if (typeof n.spell === 'string') used.add(n.spell);
    if (n.light) ['torches', 'lantern', 'light'].forEach((x) => used.add(x));
    if (n.fire === true) ['flint', 'torches'].forEach((x) => used.add(x));
    for (const p of n.profs || []) profs.add(p);
    for (const [k, v] of Object.entries(n)) if (typeof v === 'object' && k !== 'text') walk(v);
  };
  walk(adv.sections);
  const unused = KIT.filter((k) => !used.has(k) && !COMBAT[k]);
  for (const k of used) if (k in total) total[k]++;
  console.log(`\n${adv.title}\n  uses: ${[...used].filter((k) => k in total).sort().join(', ')}\n  never: ${unused.join(', ')}\n  professions: ${[...profs].join(', ') || '-'}`);
}
console.log('\nAdventures that use each item or spell:');
console.log(Object.entries(total).sort((a, b) => a[1] - b[1]).map(([k, v]) => `${k} ${v}`).join(', '));
