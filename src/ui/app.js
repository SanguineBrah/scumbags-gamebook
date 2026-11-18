// The gamebook's user interface: plain DOM, re-rendered from game state after every action.
import { buildAdventure, ADVENTURES } from '../adventure/index.js';
import { Game } from '../engine/game.js';
import { Rng } from '../rules/dice.js';
import { QUALITIES, PROFESSIONS, STATS, STAT_NAMES, MUNDANE, SIGNIFICANT, SKILL_NAMES, ENDEAVOURS, LEVEL_COST, WEIGHT_NAME, WEAPON_DIE, ARMOURS, SHIELDS, MUNDANE_LIMIT, SIGNIFICANT_LIMIT, BANDS } from '../rules/data.js';
import { rollOrigins, createCharacter, startingWeapons, randomName, profOf, qualityOf, isSkilled, knownSpells, magicType, slotsUsed, wasteForLevel, resetDay, maxAp, hasFeature, HERO_HP_BONUS, STARTING_EXTRAS } from '../rules/character.js';
import { alive } from '../engine/combat.js';

const SAVE_KEY = 'scumbags-gamebook-v2';
const ROSTER_KEY = 'scumbags-gamebook-roster';
let adv = buildAdventure(ADVENTURES[0].id);
const root = document.getElementById('app');
const rng = new Rng();

const ui = { screen: 'title', game: null, create: null, sheetOpen: false, sheetMsg: '', ending: null, pickFor: null };

// ---------- tiny DOM helper
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
  return el;
}
const dice = (...ns) => h('span', { class: 'dice' }, ns.map((n) => h('span', { class: 'die' }, n)));

// ---------- saving (one viewer's convenience; the game works without it)
function save() {
  try {
    if (ui.screen === 'play' && ui.game) localStorage.setItem(SAVE_KEY, JSON.stringify({ adv: adv.id, game: ui.game.save(), ending: ui.ending }));
  } catch { /* storage unavailable */ }
}
function loadSave() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }
// Surviving scumbags, kept between adventures.
function roster() { try { return JSON.parse(localStorage.getItem(ROSTER_KEY) || '[]'); } catch { return []; } }
function setRoster(list) { try { localStorage.setItem(ROSTER_KEY, JSON.stringify(list.slice(0, 12))); } catch { /* ignore */ } }
function keepScumbag(c) { setRoster([JSON.parse(JSON.stringify(c)), ...roster().filter((x) => x.id !== c.id)]); }
function dropScumbag(c) { setRoster(roster().filter((x) => x.id !== c.id)); }

function go(screen) { ui.screen = screen; ui.sheetOpen = false; render(); window.scrollTo(0, 0); }

// ---------- screens
function render() {
  root.replaceChildren(
    ui.screen === 'title' ? titleScreen()
      : ui.screen === 'howto' ? howToScreen()
        : ui.screen === 'create' ? createScreen()
          : ui.screen === 'pick' ? pickScreen()
          : playScreen(),
  );
  save();
}

function topbar(extra) {
  const g = ui.game; const c = g && g.c;
  return h('header', { class: 'topbar' },
    h('span', { class: 'brand' }, adv.title),
    c && h('span', { class: `chip hp${c.hp <= c.maxHp / 3 ? ' low' : ''}`, title: 'Hit points' }, 'HP ', h('b', null, `${Math.max(0, c.hp)}/${c.maxHp}`)),
    c && c.armour && h('span', { class: 'chip', title: 'Armour points' }, 'AP ', h('b', null, `${c.ap}`)),
    c && h('span', { class: 'chip', title: 'Gold pieces' }, 'GP ', h('b', null, c.gold)),
    extra,
    c && h('button', { class: 'sheet-toggle', onclick: () => { ui.sheetOpen = true; render(); } }, 'Sheet'),
  );
}

function titleScreen() {
  const saved = loadSave();
  const savedAdv = saved && ADVENTURES.find((x) => x.id === saved.adv);
  return h('div', null,
    h('main', { class: 'page title-page' },
      h('div', { class: 'muted small' }, 'SCUMBAGS! GAMEBOOKS'),
      h('h1', null, 'Five Bad Ideas'),
      h('p', { class: 'blurb' }, 'Five short adventures for one contemptible opportunist. Survive one, squander the takings, and take your scumbag on to the next.'),
      h('div', { class: 'row' },
        saved && savedAdv && h('button', { class: 'btn', onclick: () => resume(saved) }, `Continue ${savedAdv.title}`),
        h('button', { class: 'btn ghost', onclick: () => go('howto') }, 'How to play')),
    ),
    h('main', { class: 'page' }, ADVENTURES.map((a) => h('div', { class: 'card adv' },
      h('h2', null, a.title), h('div', { class: 'muted small' }, `For a level ${a.levels} scumbag`),
      h('p', null, a.blurb),
      h('button', { class: 'btn', onclick: () => chooseAdventure(a.id) }, 'Play')))));
}

function chooseAdventure(id) { adv = buildAdventure(id); go('pick'); }

function pickScreen() {
  const list = roster();
  return h('div', null,
    h('header', { class: 'topbar' }, h('span', { class: 'brand' }, adv.title)),
    h('main', { class: 'page' },
      h('h2', null, 'Who’s going?'),
      h('p', { class: 'muted' }, `${adv.title} is for a level ${adv.levels} scumbag.`),
      h('button', { class: 'btn', onclick: newScumbag }, 'A new scumbag'),
      list.length > 0 && [h('h3', null, 'Survivors'), h('div', { class: 'opts' }, list.map((c) => h('button', { class: 'opt', onclick: () => takeScumbag(c) },
        h('span', null, h('b', null, c.name), h('span', { class: 'note' }, `Level ${c.level} ${c.profession.toLowerCase()} · ${c.gold}GP · ${c.maxHp} HP`)))))],
      h('p', null, h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Back')),
    ));
}

function takeScumbag(saved) {
  const c = JSON.parse(JSON.stringify(saved));
  c.flags = {}; c.hp = c.maxHp; c.ap = maxAp(c); resetDay(c);
  const g = new Game(adv, rng.int(1, 2 ** 31));
  g.begin(c); ui.game = g; ui.ending = null; ui.sheetMsg = '';
  go('play');
}

function resume(saved) {
  try { adv = buildAdventure(saved.adv); ui.game = Game.load(adv, saved.game); ui.ending = saved.ending || null; go('play'); }
  catch { clearSave(); go('title'); }
}

function howToScreen() {
  return h('div', null, h('main', { class: 'page' },
    h('h2', null, 'How to play'),
    h('p', null, 'You are a scumbag: a contemptible opportunist in search of riches. Read each numbered section and choose what to do. Some choices need an item or a skill; some ask you to test your luck.'),
    h('h3', null, 'Stat tests'),
    h('p', null, 'Roll a d20 skill die plus a difficulty die (DD). You succeed if the total is less than the stat being tested. A 1 on the skill die is always a critical success; a 20 is always a critical failure. If you are skilled, you roll twice and use the better result. Your profession decides your skills, and you are skilled in saving throws for your core and ancillary stats.'),
    h('h3', null, 'Fighting'),
    h('p', null, 'Melee attacks test Str with a d8; ranged attacks test Dex with a die for the distance (d4 at short range, d8 at medium, d12 at long, d20 if you shoot while engaged — which also gives everyone in reach a free attack). You deal your weapon’s damage plus your level. When a monster attacks, you test your Str or Dex, whichever is higher, using the monster’s difficulty die; if you fail, it hits you. Damage comes off your AP (armour) first, then your HP. AP comes back after a short rest. At 0 HP you bleed out, and your adventure ends.'),
    h('h3', null, 'Light'),
    h('p', null, 'Dark places use up a torch, a flask of oil for a lantern, or some other light. Without one, every test uses at least a d12.'),
    h('h3', null, 'Treasure'),
    h('p', null, 'Every 50GP takes up one of your 12 significant item slots. When you get home, every 200GP you squander on a pointless endeavour gains you a level.'),
    h('p', { class: 'muted small' }, `The gamebook uses the Scumbags! rules as written, except that a lone hero starts with ${HERO_HP_BONUS} extra HP and one significant item of their choice.`),
    h('button', { class: 'btn', onclick: () => go('title') }, 'Back'),
  ));
}

// ---------- character creation
function newScumbag() {
  const origins = rollOrigins(rng);
  ui.create = { origins, name: randomName(rng), weapon: null, protection: 'armour', alignment: 'law', mundane: new Set(['torches', 'healerskit']), extra: 'potion' };
  const c = preview();
  const ws = startingWeapons(c);
  const ranged = profOf(c).skills.includes('attack:ranged') && !profOf(c).skills.includes('attack:melee');
  ui.create.weapon = (ws.filter((w) => w.ranged === ranged).at(-1) || ws.at(-1)).id;
  if (ranged) ui.create.mundane.add('ammo');
  if (magicType(c) === 'divine') ui.create.mundane.add('holysymbol');
  go('create');
}
function preview() { const k = ui.create; return createCharacter(new Rng(1), k.origins, { name: k.name, weapon: k.weapon, protection: k.protection, alignment: k.alignment, mundane: [...k.mundane] }); }

function createScreen() {
  const k = ui.create; const c = preview();
  const q = QUALITIES[k.origins.qi]; const p = PROFESSIONS[k.origins.pi];
  const set = (field, v) => { k[field] = v; render(); };
  const option = (type, name, value, checked, label, note, onchange, disabled) => h('label', { class: `opt${checked ? ' on' : ''}` },
    h('input', { type, name, value, checked, disabled, onchange }), h('span', null, label, note && h('span', { class: 'note' }, note)));
  const shift = (r) => ['up 3', 'up 2', 'up 1', 'same row', 'reroll', 'down 1', 'down 2', 'down 3'][r - 1];
  const mundaneCount = k.mundane.size;
  return h('div', null,
    h('header', { class: 'topbar' }, h('span', { class: 'brand' }, 'New scumbag')),
    h('main', { class: 'page' },
      h('h2', null, 'Who are you?'),
      h('div', { class: 'card' },
        h('p', null, 'Quality (d12): ', dice(k.origins.qRoll), ' ', h('b', null, q.name), ' — ', q.feature, '. ', h('span', { class: 'muted' }, `Core ${q.core} +2, ancillary ${q.anc} +1.`)),
        h('p', null, 'Profession (d8 on the table): ', dice(...k.origins.shifts), ' ', h('span', { class: 'muted' }, k.origins.shifts.map(shift).join(', then ')), ' → ', h('b', null, p.name), ' — ', p.feature, '. ', h('span', { class: 'muted' }, `Core ${p.core} +3, ancillary ${p.anc} +1. Proficiency: ${WEIGHT_NAME[p.prof]}.`)),
        h('p', null, 'Skills: ', p.skills.map((s) => SKILL_NAMES[s]).join(', '), '.'),
        h('div', { class: 'stats' }, STATS.map((s) => h('div', { class: `stat${[q.core, p.core].includes(s) ? ' core' : ''}`, title: STAT_NAMES[s] }, h('span', { class: 'k' }, s), h('span', { class: 'v' }, c.stats[s])))),
        h('p', { class: 'small muted' }, `HP: d6+5, plus ${HERO_HP_BONUS} for a lone hero — rolled when you set off.`),
        h('button', { class: 'btn ghost', onclick: newScumbag }, 'Roll a different scumbag'),
      ),
      h('div', { class: 'card' },
        h('h3', null, 'Name'),
        h('div', { class: 'row' }, h('input', { type: 'text', value: k.name, maxlength: 40, oninput: (e) => { k.name = e.target.value; }, 'aria-label': 'Name' }),
          h('button', { class: 'btn ghost', onclick: () => set('name', randomName(rng)) }, 'Another name')),
      ),
      h('div', { class: 'card' },
        h('h3', null, 'Weapon'),
        h('div', { class: 'opts' }, startingWeapons(c).map((w) => option('radio', 'weapon', w.id, k.weapon === w.id, w.name, `${WEIGHT_NAME[w.weight]}, d${WEAPON_DIE[w.weight]} damage${w.ranged ? ', ranged (you keep a dagger too)' : ''}`, () => set('weapon', w.id)))),
        h('h3', null, 'Armour or shield'),
        h('div', { class: 'opts' },
          option('radio', 'prot', 'armour', k.protection === 'armour', ARMOURS[p.prof - 1].name, `${ARMOURS[p.prof - 1].ap} AP`, () => set('protection', 'armour')),
          option('radio', 'prot', 'shield', k.protection === 'shield', SHIELDS[p.prof - 1].name, `spend an action to block ${SHIELDS[p.prof - 1].block.join('d')}`, () => set('protection', 'shield'))),
        magicType(c) === 'divine' && [h('h3', null, 'Whom do you serve?'), h('div', { class: 'opts' },
          option('radio', 'align', 'law', k.alignment === 'law', 'Law', 'Divine light, Abundance, Bless', () => set('alignment', 'law')),
          option('radio', 'align', 'chaos', k.alignment === 'chaos', 'Chaos', 'Shroud, Famine, Pollute', () => set('alignment', 'chaos')))],
      ),
      h('div', { class: 'card' },
        h('h3', null, `Mundane items (${mundaneCount}/${MUNDANE_LIMIT})`),
        h('p', { class: 'small muted' }, 'Choose six. You will want something to see by.' + (c.weapon && c.weapon.ranged ? ' You’ll need ammunition for your ' + c.weapon.name.toLowerCase() + '.' : '') + (magicType(c) === 'divine' ? ' Divine spellcasting needs a holy symbol.' : '')),
        h('div', { class: 'opts' }, Object.entries(MUNDANE).map(([id, m]) => {
          const on = k.mundane.has(id);
          return option('checkbox', 'm', id, on, m.name, m.note, () => { on ? k.mundane.delete(id) : k.mundane.add(id); render(); }, !on && mundaneCount >= MUNDANE_LIMIT);
        })),
        h('h3', null, 'One significant item'),
        h('div', { class: 'opts' }, STARTING_EXTRAS.map((id) => option('radio', 'extra', id, k.extra === id, SIGNIFICANT[id].name, SIGNIFICANT[id].note, () => set('extra', id)))),
      ),
      h('div', { class: 'row' },
        h('button', { class: 'btn', disabled: mundaneCount !== MUNDANE_LIMIT, onclick: begin }, mundaneCount === MUNDANE_LIMIT ? 'Begin your adventure' : `Choose ${MUNDANE_LIMIT - mundaneCount} more item${MUNDANE_LIMIT - mundaneCount === 1 ? '' : 's'}`),
        h('button', { class: 'btn ghost', onclick: () => go('pick') }, 'Back')),
    ));
}

function begin() {
  const k = ui.create;
  const g = new Game(adv, rng.int(1, 2 ** 31));
  const c = createCharacter(g.rng, k.origins, { name: (k.name || '').trim() || randomName(rng), weapon: k.weapon, protection: k.protection, alignment: k.alignment, mundane: [...k.mundane], extra: k.extra });
  c.id = `${Date.now().toString(36)}${rng.int(0, 1e6).toString(36)}`;
  g.begin(c); ui.game = g; ui.ending = null; ui.sheetMsg = '';
  go('play');
}

// ---------- playing
function playScreen() {
  const g = ui.game; const c = g.c;
  const sheet = sheetView();
  return h('div', null,
    topbar(),
    h('div', { class: 'layout with-sheet' },
      h('main', { class: 'page' }, g.isOver() ? endingView() : sectionView()),
      h('aside', { class: 'sheet', 'aria-label': 'Adventure sheet' }, sheet),
    ),
    ui.sheetOpen && [h('div', { class: 'drawer-backdrop', onclick: () => { ui.sheetOpen = false; render(); } }),
      h('div', { class: 'drawer', role: 'dialog', 'aria-label': 'Adventure sheet' },
        h('div', { class: 'close' }, 'Adventure sheet', h('button', { onclick: () => { ui.sheetOpen = false; render(); } }, 'Close')),
        sheetView())],
  );
}

function messages(g) { return g.messages.map((m) => h('div', { class: `msg ${m.kind}` }, m.text)); }

function sectionView() {
  const g = ui.game; const c = g.c;
  const out = [h('div', { class: 'num', 'aria-label': `Section ${g.number()}` }, g.number()),
    h('div', { class: 'story' }, g.text().map((p) => h('p', null, p))), messages(g)];
  if (g.result) out.push(h('div', { class: 'roll' }, g.result.lines.map((l) => h('div', { class: 'line' }, l)),
    h('div', { class: g.result.success ? 'ok' : 'no' }, g.result.success ? 'Success.' : 'Failure.')));
  if (g.fight) out.push(fightView());
  const choices = g.choices();
  if (choices.length) out.push(h('div', { class: 'choices' }, choices.map((ch) => {
    const versatile = ch.kind === 'test' && ch.ok && hasFeature(c, 'versatile') && c.daily.versatile && ch.detail && !/, skilled|automatic/.test(ch.detail);
    const btn = h('button', { class: `choice${ch.kind === 'test' || ch.kind === 'cast' ? ' test' : ''}`, disabled: !ch.ok, onclick: () => pick(ch.i) },
      h('span', null, ch.label, (ch.detail || ch.reason) && h('span', { class: 'sub' }, [ch.detail && `Test: ${ch.detail}`, !ch.ok && ch.reason].filter(Boolean).join(' — '))),
      h('span', { class: 'turn' }, ch.num ? `Turn to ${ch.num}` : 'Roll'));
    return versatile ? h('div', null, btn, h('button', { class: 'btn ghost small', style: 'margin-top:.3rem', onclick: () => pick(ch.i, { versatile: true }) }, 'Roll as though skilled (Versatile, once per day)')) : btn;
  })));
  return out;
}

function pick(i, opts) {
  const g = ui.game; const before = g.at;
  g.choose(i, opts);
  render();
  if (g.at !== before || g.isOver()) window.scrollTo(0, 0);
}

function fightView() {
  const g = ui.game; const f = g.fight; const c = g.c;
  const foes = f.monsters.map((m) => {
    const dead = !alive(m) && !m.dormant;
    const status = [m.fled && 'fled', m.obeys && 'obeys you', m.dormant && 'twitching on the floor', m.prone && !m.dormant && 'prone', m.stunned && 'blinded by sand', m.unaware && 'unaware'].filter(Boolean).join(', ');
    return h('div', { class: `foe${dead ? ' dead' : ''}` },
      h('div', { class: 'name' }, m.name),
      h('div', { class: 'stats' }, `Level ${m.lvl} · DD d${m.dd} · ${m.range}${m.ap ? ` · ${m.ap} AP` : ''}${status ? ` · ${status}` : ''}`),
      h('div', { class: 'bar' }, h('i', { style: `width:${Math.max(0, 100 * m.hp / m.maxHp)}%` })),
      h('div', { class: 'stats' }, `${Math.max(0, m.hp)}/${m.maxHp} HP${m.note ? ` — ${m.note}` : ''}`));
  });
  const acts = g.fightActions();
  return h('section', { class: 'fight', 'aria-live': 'polite' },
    h('h3', null, h('span', null, f.over ? (f.won ? 'Victory' : f.fled ? 'You got away' : 'Defeat') : `Round ${f.round}`),
      h('span', { class: 'small muted' }, `Range: ${BANDS[f.distance].toLowerCase()}${f.dark ? ' · in the dark (d12)' : ''}`)),
    h('div', { class: 'foes' }, foes),
    h('div', { class: 'small' }, `You: ${Math.max(0, c.hp)}/${c.maxHp} HP${c.armour ? `, ${c.ap} AP` : ''}${c.blocking ? ', blocking' : ''}${c.prone ? ', prone' : ''}`),
    h('div', { class: 'bar you' }, h('i', { style: `width:${Math.max(0, 100 * c.hp / c.maxHp)}%` })),
    h('div', { class: 'log' }, f.log.map((l) => h('div', { class: l.kind === 'roll' ? 'roll-l' : l.kind }, l.text))),
    acts.length > 0 && h('div', { class: 'actions' }, acts.map((a, i) => h('button', { class: `btn${i === 0 ? ' primary' : ' ghost'}`, onclick: () => { g.fightAct(a); render(); } }, a.label))),
  );
}

function endingView() {
  const g = ui.game; const c = g.c; const end = g.ending();
  if (end === 'death') {
    clearSaveSoon(); dropScumbag(c);
    return [h('div', { class: 'num' }, g.number()),
      h('div', { class: 'story' }, g.text().map((p) => h('p', null, p))), messages(g),
      g.fight && fightView(),
      h('div', { class: 'banner dead' }, 'Your adventure ends here'),
      adv.deathText.map((p) => h('p', { class: 'muted' }, p)),
      h('p', null, `${c.name}, level ${c.level} ${c.profession.toLowerCase()}, died with ${c.gold}GP and ${c.wasted ? `${c.wasted}GP already squandered` : 'nothing to show for it'}.`),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => go('pick') }, 'Try again'), h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title'))];
  }
  if (end === 'quit') {
    clearSaveSoon();
    return [h('div', { class: 'num' }, g.number()), h('div', { class: 'story' }, g.text().map((p) => h('p', null, p))),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => go('pick') }, 'Try again'), h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title'))];
  }
  // victory: squander your gold
  const e = (ui.ending ||= { wasted: [], done: false });
  const out = [h('div', { class: 'num' }, g.number()), h('div', { class: 'story' }, g.text().map((p) => h('p', null, p))), messages(g)];
  out.push(h('h2', null, 'Pointless endeavours'));
  for (const w of e.wasted) {
    out.push(h('div', { class: 'endeavour' }, h('div', null, dice(w.roll), ' ', h('b', null, ENDEAVOURS[w.roll - 1])),
      h('div', { class: 'small' }, `200GP squandered. Level ${w.report.level}! +${w.report.hpRoll} max HP. `,
        (() => { const up = Object.entries(w.report.statRolls).filter(([, r]) => r.up).map(([s]) => s); return up.length ? `+1 ${up.join(', ')}. ` : 'No stats go up. '; })(),
        h('span', { class: 'muted' }, '(d20 per stat, up if it beats the stat: ', Object.entries(w.report.statRolls).map(([s, r]) => `${s} ${r.roll}`).join(', '), ')'))));
  }
  if (!e.done) {
    out.push(h('p', null, `You have ${c.gold}GP.`),
      h('div', { class: 'row' },
        h('button', { class: 'btn', disabled: c.gold < LEVEL_COST, onclick: () => { const roll = g.rng.die(20); const report = wasteForLevel(g.rng, c); e.wasted.push({ roll, report }); render(); } }, `Waste ${LEVEL_COST}GP`),
        h('button', { class: 'btn ghost', onclick: () => { e.done = true; keepScumbag(c); render(); } }, c.gold >= LEVEL_COST ? 'Keep the rest' : 'Finish')));
  } else {
    out.push(h('div', { class: 'banner' }, 'The End'),
      h('p', null, `${c.name} the level ${c.level} ${c.profession.toLowerCase()} has squandered ${c.wasted}GP in total, and has ${c.gold}GP left over.`),
      h('p', { class: 'muted small' }, `${c.name} is waiting among the survivors for the next adventure.`),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { clearSave(); go('title'); } }, 'Choose the next adventure'),
        h('button', { class: 'btn ghost', onclick: again }, 'Play this one again')));
  }
  return out;
}
let clearTimer = null;
function clearSaveSoon() { clearTimeout(clearTimer); clearTimer = setTimeout(clearSave, 0); }

function again() {
  const old = ui.game.c;
  const g = new Game(adv, rng.int(1, 2 ** 31));
  old.flags = {}; old.hp = old.maxHp; old.ap = maxAp(old); resetDay(old);
  g.begin(old); ui.game = g; ui.ending = null; go('play');
}

// ---------- adventure sheet
function sheetView() {
  const g = ui.game; const c = g.c; const q = qualityOf(c); const p = profOf(c);
  const item = (i, def) => h('li', null, i.name, i.tokens !== undefined ? ` (${i.tokens} left)` : '', def && def.note && h('span', { class: 'muted small' }, ` — ${def.note}`));
  const spells = knownSpells(c);
  const skills = [...p.skills.map((s) => SKILL_NAMES[s]), ...(hasFeature(c, 'liar') ? ['Lying'] : [])];
  const saves = STATS.filter((s) => isSkilled(c, `save:${s}`));
  return h('div', { class: 'sheet-inner' },
    h('h2', null, c.name),
    h('div', { class: 'muted' }, `Level ${c.level} ${q.name.toLowerCase()} ${p.name.toLowerCase()}${c.alignment ? `, serving ${c.alignment}` : ''}`),
    h('div', { class: 'stats' }, STATS.map((s) => h('div', { class: `stat${[q.core, p.core].includes(s) ? ' core' : ''}`, title: STAT_NAMES[s] }, h('span', { class: 'k' }, s), h('span', { class: 'v' }, c.stats[s])))),
    h('div', { class: 'small' }, `HP ${Math.max(0, c.hp)}/${c.maxHp}`), h('div', { class: 'bar you' }, h('i', { style: `width:${Math.max(0, 100 * c.hp / c.maxHp)}%` })),
    h('dl', { class: 'kv' },
      h('dt', null, 'Weapon'), h('dd', null, `${c.weapon.name} (d${WEAPON_DIE[c.weapon.weight]}+${c.level})${c.sidearm ? `; dagger (d4+${c.level})` : ''}`),
      c.armour && [h('dt', null, 'Armour'), h('dd', null, `${c.armour.name}: ${c.ap}/${maxAp(c)} AP`)],
      c.shield && [h('dt', null, 'Shield'), h('dd', null, `${c.shield.name}: block ${c.shield.block.join('d')}`)],
      h('dt', null, 'Gold'), h('dd', null, `${c.gold}GP`),
      h('dt', null, 'Slots'), h('dd', null, `${slotsUsed(c)}/${SIGNIFICANT_LIMIT} significant (50GP each)`),
    ),
    h('h3', null, 'Features'),
    h('div', { class: 'small' }, h('b', null, q.name), ': ', q.feature, '.'),
    h('div', { class: 'small' }, h('b', null, p.name), ': ', p.feature, '.'),
    h('h3', null, 'Skills'),
    h('div', { class: 'small' }, skills.join(', '), '. ', h('span', { class: 'muted' }, `Saving throws: ${saves.join(', ')}.`)),
    spells.length > 0 && [h('h3', null, 'Spells'), h('div', { class: 'small' }, spells.map((s) => `${s.name} (level ${s.lvl}, d${s.dd}) — ${s.text}`).map((t) => h('div', null, t)),
      h('div', { class: 'muted' }, `Level 1 slot: ${c.slots[1] ? 'ready' : 'spent'}`))],
    h('h3', null, `Mundane items (${c.mundane.length}/${MUNDANE_LIMIT})`),
    h('ul', { class: 'items small' }, c.mundane.map((i) => item(i, MUNDANE[i.id]))),
    h('h3', null, 'Significant items'),
    c.significant.length ? h('ul', { class: 'items small' }, c.significant.map((i) => item(i, SIGNIFICANT[i.id]))) : h('div', { class: 'small muted' }, 'None.'),
    (g.canHeal() || g.canDrink()) && h('div', { class: 'row', style: 'margin-top:.8rem' },
      g.canHeal() && h('button', { class: 'btn', onclick: () => { ui.sheetMsg = g.useHealersKit(); render(); } }, 'Use healer’s kit'),
      g.canDrink() && h('button', { class: 'btn', onclick: () => { ui.sheetMsg = g.drinkPotion(); render(); } }, 'Drink healing potion')),
    ui.sheetMsg && h('div', { class: 'msg', style: 'margin-top:.6rem' }, ui.sheetMsg),
    h('hr', { class: 'rule' }),
    h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title screen'),
  );
}

export function start() { render(); }
