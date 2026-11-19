// The gamebook's user interface: plain DOM, re-rendered from game state after every action.
import { buildAdventure, ADVENTURES, availableFor, revealedFor } from '../adventure/index.js';
import { INN_PRICE, SHOP, weaponPrice, armourPrice, shieldPrice, restAtInn, sleepRough, restock, addMundane, dropMundane, buy, sellPrice, sell, weaponsFor, buyWeapon, buyArmour, buyShield } from '../engine/town.js';
const town = { INN_PRICE, SHOP, weaponPrice, armourPrice, shieldPrice, restAtInn, sleepRough, restock, addMundane, dropMundane, buy, sellPrice, sell, weaponsFor, buyWeapon, buyArmour, buyShield };
import { Game } from '../engine/game.js';
import { Rng } from '../rules/dice.js';
import { QUALITIES, PROFESSIONS, STATS, STAT_NAMES, MUNDANE, SIGNIFICANT, SKILL_NAMES, ENDEAVOURS, LEVEL_COST, WEIGHT_NAME, WEAPON_DIE, ARMOURS, SHIELDS, MUNDANE_LIMIT, SIGNIFICANT_LIMIT, BANDS, WEAPONS } from '../rules/data.js';
import { rollOrigins, createCharacter, startingWeapons, randomName, profOf, qualityOf, isSkilled, knownSpells, magicType, slotsUsed, wasteForLevel, resetDay, maxAp, hasFeature, HERO_HP_BONUS, STARTING_EXTRAS, recordAdventure } from '../rules/character.js';
import { alive } from '../engine/combat.js';

const SAVE_KEY = 'scumbags-gamebook-v2';
const ROSTER_KEY = 'scumbags-gamebook-roster';
let adv = buildAdventure(ADVENTURES[0].id);
const root = document.getElementById('app');
const rng = new Rng();

const ui = { screen: 'title', game: null, create: null, sheetOpen: false, sheetMsg: '', ending: null, char: null, townMsg: '' };

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
          : ui.screen === 'town' ? townScreen()
          : playScreen(),
  );
  save();
}

function topbar(extra) {
  const g = ui.game; const c = g && g.c;
  return h('header', { class: 'topbar' },
    h('span', { class: 'brand' }, h('span', { class: 'mark' }, 'Scumbags!'), adv.title),
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
  const list = roster();
  return h('div', null,
    h('main', { class: 'page title-page' },
      h('h1', { class: 'logo', 'aria-label': 'Scumbags!' }, 'Scumbags!'),
      h('div', { class: 'titlebar' }, 'A Book of Bad Ideas'),
      h('div', { class: 'strap' }, 'GAMEBOOKS'),
      h('p', { class: 'blurb' }, 'Short adventures for one contemptible opportunist. Survive one, squander the takings, and see what else turns up. Most of them you’ll have to find first.'),
      h('div', { class: 'row' },
        saved && savedAdv && h('button', { class: 'btn', onclick: () => resume(saved) }, `Continue ${savedAdv.title}`),
        h('button', { class: saved ? 'btn ghost' : 'btn', onclick: newScumbag }, 'New scumbag'),
        h('button', { class: 'btn ghost', onclick: () => go('howto') }, 'How to play')),
    ),
    list.length > 0 && h('main', { class: 'page' }, h('h2', null, 'Survivors'),
      h('div', { class: 'opts' }, list.map((c) => h('button', { class: 'opt', onclick: () => { ui.char = c; ui.townMsg = ''; go('town'); } },
        h('span', null, h('b', null, c.name), h('span', { class: 'note' }, `Level ${c.level} ${c.profession.toLowerCase()} · ${c.gold}GP · ${(c.done || []).length} of ${ADVENTURES.length} adventures done`)))))));
}

function charBar(c) {
  return h('header', { class: 'topbar' }, h('span', { class: 'brand' }, h('span', { class: 'mark' }, 'Scumbags!'), 'Scumbag Town'),
    h('span', { class: `chip hp${c.hp <= c.maxHp / 3 ? ' low' : ''}` }, 'HP ', h('b', null, `${c.hp}/${c.maxHp}`)),
    h('span', { class: 'chip' }, 'GP ', h('b', null, c.gold)));
}

// ---------- Scumbag Town: the inn, the market, the fence, and the notice board
function townScreen() {
  const c = ui.char;
  const act = (msg) => { if (msg) { ui.townMsg = msg; keepScumbag(c); } render(); };
  const left = MUNDANE_LIMIT - c.mundane.length;
  const avail = availableFor(c).slice().sort((a, b) => b.tier - a.tier);   // newest band first
  return h('div', null, charBar(c), h('main', { class: 'page' },
    h('h2', null, `${c.name} in Scumbag Town`),
    h('p', { class: 'muted' }, `Level ${c.level} ${c.profession.toLowerCase()}. ${c.hp}/${c.maxHp} HP, ${c.gold}GP, ${(c.done || []).length} adventure${(c.done || []).length === 1 ? '' : 's'} behind you.`),
    ui.townMsg && h('div', { class: 'msg good' }, ui.townMsg),
    h('div', { class: 'card' }, h('h3', null, 'The Drowned Rat'),
      h('p', { class: 'small' }, 'Adventures don’t heal you. Beds do.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', disabled: c.gold < town.INN_PRICE || c.hp >= c.maxHp, onclick: () => act(town.restAtInn(c)) }, `Rent a bed (${town.INN_PRICE}GP): full HP`),
        h('button', { class: 'btn ghost', disabled: c.hp >= c.maxHp, onclick: () => act(town.sleepRough(c, rng)) }, 'Sleep in a ditch (free)'))),
    h('div', { class: 'card' }, h('h3', null, 'The market'),
      h('p', { class: 'small' }, 'Mundane items cost next to nothing in town. Restock, or swap what you carry.'),
      h('button', { class: 'btn ghost', onclick: () => { town.restock(c); act('You top up your torches, oil, ammunition and everything else that runs out.'); } }, 'Restock everything'),
      h('h3', null, `Your mundane items (${c.mundane.length}/${MUNDANE_LIMIT})`),
      h('div', { class: 'opts' }, c.mundane.map((i) => h('button', { class: 'opt', onclick: () => { town.dropMundane(c, i.id); act(`You leave the ${i.name.toLowerCase()} at home.`); } },
        h('span', null, i.name, i.tokens !== undefined ? ` (${i.tokens})` : '', h('span', { class: 'note' }, 'Tap to leave it at home'))))),
      left > 0 && [h('h3', null, `Pick up (${left} free)`), h('div', { class: 'opts' }, Object.entries(MUNDANE).filter(([id, m]) => !m.hidden && !c.mundane.some((i) => i.id === id)).map(([id, m]) =>
        h('button', { class: 'opt', onclick: () => { town.addMundane(c, id); act(`You pick up ${m.name.toLowerCase()}.`); } }, h('span', null, m.name, m.note && h('span', { class: 'note' }, m.note)))))]),
    h('div', { class: 'card' }, h('h3', null, 'The apothecary'),
      h('div', { class: 'opts' }, town.SHOP.map((id) => { const d = SIGNIFICANT[id]; return h('button', { class: 'opt', disabled: c.gold < d.cost, onclick: () => act(town.buy(c, id)) }, h('span', null, `${d.name} — ${d.cost}GP`, h('span', { class: 'note' }, d.note))); }))),
    h('div', { class: 'card' }, h('h3', null, 'The armourer'),
      h('p', { class: 'small' }, `You have: ${c.weapon.name}${c.armour ? `, ${c.armour.name}` : ''}${c.shield ? `, ${c.shield.name}` : ''}. Buying replaces what you have.`),
      h('div', { class: 'opts' },
        town.weaponsFor(c).filter((w) => w.id !== c.weapon.id).map((w) => h('button', { class: 'opt', disabled: c.gold < town.weaponPrice(w), onclick: () => act(town.buyWeapon(c, w.id)) }, h('span', null, `${w.name} — ${town.weaponPrice(w)}GP`, h('span', { class: 'note' }, `d${WEAPON_DIE[w.weight]}${w.ranged ? ', ranged' : ''}`)))),
        ARMOURS.filter((a) => a.weight <= profOf(c).prof && (!c.armour || a.id !== c.armour.id)).map((a) => h('button', { class: 'opt', disabled: c.gold < town.armourPrice(a), onclick: () => act(town.buyArmour(c, a.id)) }, h('span', null, `${a.name} — ${town.armourPrice(a)}GP`, h('span', { class: 'note' }, `${a.ap} AP; replaces a shield`)))),
        SHIELDS.filter((x) => x.weight <= profOf(c).prof && (!c.shield || x.id !== c.shield.id)).map((x) => h('button', { class: 'opt', disabled: c.gold < town.shieldPrice(x), onclick: () => act(town.buyShield(c, x.id)) }, h('span', null, `${x.name} — ${town.shieldPrice(x)}GP`, h('span', { class: 'note' }, `blocks ${x.block.join('d')}; replaces armour`)))))),
    c.significant.some((i) => town.sellPrice(i.id)) && h('div', { class: 'card' }, h('h3', null, 'The fence'),
      h('div', { class: 'opts' }, c.significant.map((i, n) => town.sellPrice(i.id) ? h('button', { class: 'opt', onclick: () => act(town.sell(c, n)) }, h('span', null, `Sell ${i.name.toLowerCase()} — ${town.sellPrice(i.id)}GP`)) : null))),
    c.gold >= LEVEL_COST && h('div', { class: 'card' }, h('h3', null, 'Squander your gold'),
      h('p', { class: 'small' }, `Every ${LEVEL_COST}GP you waste on a pointless endeavour gains you a level.`),
      h('button', { class: 'btn', onclick: () => { const roll = rng.die(20); const r = wasteForLevel(rng, c); const up = Object.entries(r.statRolls).filter(([, x]) => x.up).map(([k]) => k); act(`${ENDEAVOURS[roll - 1]} Level ${r.level}! +${r.hpRoll} max HP${up.length ? `, +1 ${up.join(', ')}` : ''}.`); } }, `Waste ${LEVEL_COST}GP`)),
    h('div', { class: 'card' }, h('h3', null, 'The notice board'),
      avail.length ? h('p', { class: 'small' }, 'Jobs for people with no scruples:') : h('p', { class: 'small' }, 'There’s nothing on the board for you. You’ve done it all. Retire, or find something worse to do.'),
      avail.map((a) => h('div', { class: 'card adv' }, h('h2', null, a.title), h('div', { class: 'muted small' }, `For a level ${a.levels} scumbag`), h('p', null, a.blurb),
        h('button', { class: 'btn', onclick: () => startAdventure(a.id) }, 'Take the job'))),
      h('p', { class: 'muted small' }, `${revealedFor(c).length} of ${ADVENTURES.length} adventures discovered. Finish jobs to hear about more.`)),
    h('p', null, h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title screen')),
  ));
}

function startAdventure(id) {
  adv = buildAdventure(id);
  const c = JSON.parse(JSON.stringify(ui.char));
  c.flags = {}; c.ap = maxAp(c); resetDay(c);   // HP carries over: rest in town first
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
    h('h3', null, 'Between adventures'),
    h('p', null, 'Survivors come back to Scumbag Town, still carrying their wounds. Pay for a bed at the Drowned Rat or sleep in a ditch, swap and restock mundane items at the market, buy potions at the apothecary, change your weapon or armour, and sell your loot to the fence. Then check the notice board. Jobs come in levels: finish any job at one level and every job at the next level turns up on the board. You can’t do the same job twice, but the old ones stay up if you want them. Live long enough, and you might get through all of them.'),
    h('p', null, 'Look at what you’re carrying before every choice. Nearly everything in your pack is useful somewhere, and a rope, a rat or a pot of glue can get you past things a sword can’t.'),
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
    h('header', { class: 'topbar' }, h('span', { class: 'brand' }, h('span', { class: 'mark' }, 'Scumbags!'), 'New scumbag')),
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
        h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Back')),
    ));
}

function begin() {
  const k = ui.create;
  const g = new Game(adv, rng.int(1, 2 ** 31));
  const c = createCharacter(g.rng, k.origins, { name: (k.name || '').trim() || randomName(rng), weapon: k.weapon, protection: k.protection, alignment: k.alignment, mundane: [...k.mundane], extra: k.extra });
  c.id = `${Date.now().toString(36)}${rng.int(0, 1e6).toString(36)}`;
  keepScumbag(c); ui.char = c; ui.townMsg = 'You arrive in Scumbag Town with nothing but your kit and your lack of scruples. Check the notice board.';
  go('town');
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
    const insight = ch.kind === 'test' && ch.ok && ch.detail && /^(Wis|Int) /.test(ch.detail) && !/, skilled|automatic/.test(ch.detail) && c.significant.some((i) => i.id === 'insight');
    const extras = [
      versatile && h('button', { class: 'btn ghost small', style: 'margin:.3rem .3rem 0 0', onclick: () => pick(ch.i, { versatile: true }) }, 'Roll as though skilled (Versatile, once per day)'),
      insight && h('button', { class: 'btn ghost small', style: 'margin:.3rem .3rem 0 0', onclick: () => pick(ch.i, { insight: true }) }, 'Drink your elixir of insight first'),
    ].filter(Boolean);
    return extras.length ? h('div', null, btn, extras) : btn;
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
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: newScumbag }, 'New scumbag'), h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title'))];
  }
  if (end === 'quit') {
    clearSaveSoon();
    return [h('div', { class: 'num' }, g.number()), h('div', { class: 'story' }, g.text().map((p) => h('p', null, p))),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: newScumbag }, 'New scumbag'), h('button', { class: 'btn ghost', onclick: () => go('title') }, 'Title'))];
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
        h('button', { class: 'btn ghost', onclick: () => finishAdventure(c) }, c.gold >= LEVEL_COST ? 'Keep the rest' : 'Finish')));
  }
  return out;
}
let clearTimer = null;
function clearSaveSoon() { clearTimeout(clearTimer); clearTimer = setTimeout(clearSave, 0); }

function finishAdventure(c) {
  recordAdventure(c, adv.id);
  c.prone = false; c.blocking = false;
  keepScumbag(c); clearSave();
  const before = new Set(revealedFor({ ...c, done: (c.done || []).filter((x) => x !== adv.id) }).map((a) => a.id));
  const fresh = availableFor(c).filter((a) => !before.has(a.id)).map((a) => a.title);
  ui.char = c; ui.townMsg = `${adv.title}: done.${fresh.length ? ` Word gets round, and new work turns up on the notice board: ${fresh.join(' and ')}.` : ''}`;
  go('town');
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
