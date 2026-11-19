// Validate the adventure graph: every target exists, every section is reachable from the start,
// and every non-ending section has a way out that doesn't depend on items or luck you might not have.
import { buildAdventure, ADVENTURES } from '../src/adventure/index.js';
import { readFileSync } from 'node:fs';
import { MUNDANE, SIGNIFICANT, SPELLS, PROFESSIONS, QUALITIES, SKILL_NAMES } from '../src/rules/data.js';

// Everything a section can name: items, spells, professions, skills, monster and character features.
const ITEMS = new Set([...Object.keys(MUNDANE), ...Object.keys(SIGNIFICANT)]);
const PROFS = new Set(PROFESSIONS.map((p) => p.name));
const FEATURES = new Set([...PROFESSIONS, ...QUALITIES].map((x) => x.key));
const SKILLS = new Set([...Object.keys(SKILL_NAMES), 'lying']);
const combatSrc = readFileSync(new URL('../src/engine/combat.js', import.meta.url), 'utf8');
const FEATS = new Set([...combatSrc.matchAll(/has\(\w+, '(\w+)'\)/g)].map((m) => m[1]));
function lint(node, where, errors) {
  if (Array.isArray(node)) { node.forEach((x) => lint(x, where, errors)); return; }
  if (!node || typeof node !== 'object') return;
  const bad = (what, v) => errors.push(`${where}: unknown ${what} "${v}"`);
  for (const k of ['item', 'lose', 'notItem']) if (typeof node[k] === 'string' && !ITEMS.has(node[k])) bad('item', node[k]);
  if (node.sell && !ITEMS.has(node.sell.item)) bad('item', node.sell.item);
  for (const v of node.anyItem || []) if (!ITEMS.has(v)) bad('item', v);
  for (const k of ['cast', 'spell']) if (typeof node[k] === 'string' && !SPELLS[node[k]]) bad('spell', node[k]);
  for (const v of node.profs || []) if (!PROFS.has(v)) bad('profession', v);
  if (typeof node.feature === 'string' && !FEATURES.has(node.feature)) bad('feature', node.feature);
  for (const v of node.feats || []) if (!FEATS.has(v)) bad('monster feature', v);
  for (const v of [].concat(node.skill || [])) if (typeof v === 'string' && !SKILLS.has(v) && !/^(save|cast):/.test(v)) bad('skill', v);
  for (const [k, v] of Object.entries(node)) if (typeof v === 'object' && k !== 'text') lint(v, where, errors);
}

let failed = false;
for (const { id } of ADVENTURES) {
const adv = buildAdventure(id);
const S = adv.sections;
const errors = [];
const exits = (k) => {
  const s = S[k]; const out = [];
  for (const ch of s.choices || []) for (const t of [ch.to, ch.pass, ch.fail, ch.chaos, ch.critFail]) if (t) out.push(t);
  if (s.fight) { out.push(s.fight.win); if (s.fight.flee) out.push(s.fight.flee.to); }
  for (const r of s.redirect || []) out.push(r.to);
  return out;
};
for (const k of Object.keys(S)) {
  const s = S[k];
  for (const t of exits(k)) if (!S[t]) errors.push(`${k}: goes to missing section "${t}"`);
  if (!s.end && !exits(k).length) errors.push(`${k}: dead end`);
  for (const ch of s.choices || []) if (ch.cast && SPELLS[ch.cast] && SPELLS[ch.cast].list === 'divine' && !ch.critFail) errors.push(`${k}: divine spell "${ch.cast}" has no critFail section for its backfire`);
  if (!s.end && !s.fight && !(s.choices || []).some((ch) => !ch.if && !ch.show && !ch.cast)) {
    // every exit is conditional: make sure the conditions can't all fail together (spells are hidden from those who don't know them)
    const free = (s.choices || []).filter((ch) => !ch.if && !ch.cast);
    if (!free.length) errors.push(`${k}: every choice needs something (possible soft lock)`);
  }
  const SECTION_KEYS = new Set(['text', 'on', 'redirect', 'fight', 'choices', 'onceOnly', 'dark', 'litIf', 'end']);
  for (const key of Object.keys(s)) if (!SECTION_KEYS.has(key)) errors.push(`${k}: unknown section field "${key}" (does it belong inside fight?)`);
  if (!s.text) errors.push(`${k}: no text`);
  lint(s, k, errors);
}
const seen = new Set(['start']); const queue = ['start'];
while (queue.length) for (const t of exits(queue.shift())) if (S[t] && !seen.has(t)) { seen.add(t); queue.push(t); }
for (const k of Object.keys(S)) if (!seen.has(k)) errors.push(`${k}: unreachable`);
if (!S[adv.final] || S[adv.final].end !== 'victory') errors.push(`final section "${adv.final}" is not a victory ending`);
if (errors.length) { failed = true; console.error(`${adv.title}:\n  ` + errors.join('\n  ')); }
else console.log(`ok: ${adv.title}: ${adv.count} sections, all reachable, no dead ends`);
}
if (failed) process.exit(1);
