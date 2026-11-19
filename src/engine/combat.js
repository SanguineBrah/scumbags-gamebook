// Fights, following the rulebook's "Combat rules". One scumbag against one or more monsters.
// The UI calls act(fight, action); every roll is written to fight.log so the player can see the dice.
import { statTest } from '../rules/tests.js';
import { rollExpr } from '../rules/dice.js';
import { MONSTER_DD, MELEE_DIE, RANGED_DIE, DARK_DIE, BANDS, SPELLS, MUNDANE_LIMIT } from '../rules/data.js';
import { isSkilled, hasFeature, weaponPenalty, armourPenalty, weaponDamageDie, maxAp, makeItem, magicType } from '../rules/character.js';
import { hasItem, check, canCast } from './conditions.js';

let uid = 1;
export function makeMonster(rng, def) {
  const lvl = def.lvl;
  const brute = (def.feats || []).includes('brute');
  const hp = def.hp != null ? def.hp : brute ? 8 * lvl : Math.max(1, rng.roll(lvl, 8));
  return {
    uid: uid++, name: def.name, lvl, dd: MONSTER_DD(lvl), range: def.range || 'engaged', feats: [...(def.feats || [])],
    hp, maxHp: hp, ap: def.ap || 0, dmg: def.dmg || null, onHit: def.onHit || null, note: def.note || '', regen: def.regen || 0, regenStop: def.regenStop || null,
    proper: def.proper ?? (/^(?!The )\S+ [A-Z]/.test(def.name) || /^\S+’s /.test(def.name)), plural: !!def.plural,
    unaware: false, prone: false, stunned: 0, dormant: 0, fled: false, obeys: false, tick: 0, revealed: !!(def.revealed),
  };
}
const has = (m, f) => m.feats.includes(f);
/** How to refer to a monster mid-sentence: "the Filthy footman", "the baby" (from "The baby"), "Rex". */
export const the = (m) => m.proper ? m.name : /^The /.test(m.name) ? `the ${m.name.slice(4)}` : `the ${m.name}`;
const The = (m) => { const r = the(m); return r[0].toUpperCase() + r.slice(1); };
const verb = (m, one, many) => (m.plural ? many : one);
const alive = (m) => m.hp > 0 && !m.fled && !m.obeys;
/** Make a monster lose turns, remembering why (the fight screen shows it). */
const stun = (m, n, why) => { if (n >= m.stunned) { m.stunned = n; m.stunWhy = why; } };
const active = (f) => f.monsters.filter((m) => alive(m) || m.dormant > 0);
const attacksOf = (m) => (has(m, 'brute') ? Math.min(3, Math.ceil(m.lvl / 2)) : 1);

/** Start a fight from a section's fight definition. */
export function startFight(g, def) {
  const { rng, c } = g;
  const f = {
    def, round: 1, monsters: def.monsters.map((m) => makeMonster(rng, m)), distance: def.distance || 0,
    log: [], over: false, won: false, lost: false, fired: false, dark: g.dark && !def.lit,
  };
  // Number lookalikes, so you can tell which goblin you're hitting.
  const count = {}, seen = {};
  for (const m of f.monsters) count[m.name] = (count[m.name] || 0) + 1;
  for (const m of f.monsters) if (count[m.name] > 1) m.name = `${m.name} ${seen[m.name] = (seen[m.name] || 0) + 1}`;
  if (def.surprise) for (const m of f.monsters) m.unaware = true;
  note(f, def.intro || 'Fight!');
  if (def.surprise) note(f, 'They haven’t noticed you. Every success on your first attack is a critical success.');
  else {
    // Initiative: a d4 Dex saving throw
    const t = test(g, f, { stat: 'Dex', dd: 4, skill: 'save:Dex', label: 'Initiative (Dex save)' });
    if (!t.success) { note(f, 'Too slow. They go first.'); monstersTurn(g, f); if (!f.over && !active(f).length) { f.over = true; f.won = true; finish(g, f); } }
    else note(f, 'You go first.');
  }
  return f;
}

function note(f, text, kind = 'info') { f.log.push({ kind, text }); }
function rollText(r) {
  if (r.trivial) return 'automatic';
  const one = (x) => `${x.skill}+${x.ddRoll}=${x.total}`;
  return r.rolls.map(one).join(r.skilled ? ' / ' : '');
}

/** A stat test inside a fight, logged. o: { stat, dd, skill, label, modifier, critRange, reroll } */
function test(g, f, o) {
  const { rng, c } = g;
  let dd = o.dd;
  if (f.dark && !o.noDark) dd = Math.max(dd, DARK_DIE);
  if (o.weaponTest && weaponPenalty(c, o.weapon)) dd = 20;
  if (armourPenalty(c)) dd = 20;
  const skilled = isSkilled(c, o.skill);
  const roll = () => statTest(rng, { stat: c.stats[o.stat] + (o.statBonus || 0), dd, skilled, forceRoll: true, modifier: o.modifier || 0, critRange: o.critRange || 1, critFailFrom: o.critFailFrom || (f.def.unlucky ? 19 : 20) });
  let r = roll();
  const line = (r, extra = '') => note(f, `${o.label}: ${o.stat} ${c.stats[o.stat]}${skilled ? ' (skilled)' : ''} vs d20+d${dd}${o.modifier ? `+${o.modifier}` : ''} → ${rollText(r)} ${r.critSuccess ? 'CRITICAL!' : r.critFail ? 'critical failure' : r.success ? 'success' : 'fail'}${extra}`, 'roll');
  line(r);
  if (!r.success && o.reroll && hasFeature(c, o.reroll) && c.daily.reroll) {
    c.daily.reroll = false; r = roll(); line(r, ' (rerolled — once per day)');
  }
  return r;
}

function playerAttack(g, f, m, opts = {}) {
  const { rng, c } = g;
  const w = opts.weapon === 'sidearm' ? c.sidearm : opts.weapon === 'unarmed' ? null : c.weapon;
  const ranged = !!(w && w.ranged);
  let dd = MELEE_DIE;
  if (ranged) {
    dd = RANGED_DIE[hasFeature(c, 'hunter') ? 1 : f.distance];
    f.fired = true;
  }
  const label = opts.label || `Attack ${the(m)}${w ? ` (${w.name.toLowerCase()})` : ' (unarmed)'}`;
  if (has(m, 'invisible') && !m.revealed) { dd = 20; note(f, `You can’t see ${the(m)}. You swing at where you think it is (d20).`); }
  const t = test(g, f, {
    stat: ranged ? 'Dex' : 'Str', dd, skill: opts.unskilled ? null : ranged ? 'attack:ranged' : 'attack:melee', label,
    modifier: has(m, 'tiny') ? 2 : 0, critRange: hasFeature(c, 'wideCrit') ? 3 : 1, reroll: 'rerollAttack', weaponTest: true, weapon: w,
  });
  let hit = t.success, crit = t.critSuccess;
  if (m.unaware && hit) crit = true;
  if (has(m, 'exposed') && f.distance === 0 && hit && !ranged) { crit = true; note(f, `${The(m)}’s back is exposed: a critical hit.`); }
  if (!ranged && (m.prone || m.dormant > 0) && !hit) { hit = true; note(f, `${The(m)} ${verb(m, 'is', 'are')} down: melee attacks against prone opponents always hit.`); }
  if (!hit) { note(f, 'You miss.'); return false; }
  let dmg = rng.die(weaponDamageDie(w)) + c.level + ((w && w.plus) || 0);
  if (f.galv > 0) { const x = rng.die(6); dmg += x; note(f, `Galvanised: +${x} damage.`); }
  if (crit) dmg *= hasFeature(c, 'tripleCrit') ? 3 : 2;
  hurtMonster(g, f, m, dmg, { crit, pulp: m.dormant > 0, magicWeapon: !!(w && w.magic) });
  if (!alive(m) && !m.dormant && hasFeature(c, 'cleave') && !opts.free) {
    const next = f.monsters.find(alive);
    if (next) { note(f, 'Sellsword: a free attack after slaying an opponent.'); playerAttack(g, f, next, { ...opts, free: true }); }
  }
  if (alive(m) && !ranged && hasFeature(c, 'fell') && !opts.free && rng.chance(1, 6)) {
    m.prone = true; note(f, `Woodcutter: you knock ${the(m)} flat and swing again.`);
    playerAttack(g, f, m, { ...opts, free: true });
  }
  return true;
}

export function hurtMonster(g, f, m, dmg, o = {}) {
  if (o.magic && has(m, 'magicImmune')) { note(f, `${The(m)} ${verb(m, 'is', 'are')} immune to magic.`); return; }
  if (f.sanctMon > 0) { note(f, `It stops dead against the wall of the sanctuary around ${the(m)}.`); return; }
  if (has(m, 'ghostly') && !o.magic && !o.holy && !o.magicWeapon && !g.c.flags.blessedWeapon) { note(f, `It passes straight through ${the(m)}. Only magic will do.`); return; }
  if (has(m, 'takeD6') && !o.noBonus) { const x = g.rng.die(6); dmg += x; note(f, `${The(m)} ${verb(m, 'receives', 'receive')} +${x} damage.`); }
  if (m.enfeebled) { const x = g.rng.die(8); dmg += x; note(f, `Enfeebled: ${the(m)} receives +${x} damage.`); }
  if (m.ap > 0) { const a = Math.min(m.ap, dmg); m.ap -= a; dmg -= a; note(f, `Armour soaks up ${a}${m.ap ? ` (${m.ap} AP left)` : ' — the armour is wrecked'}.`); }
  m.hp -= dmg;
  note(f, `${dmg} damage to ${the(m)}${m.hp > 0 ? ` (${m.hp}/${m.maxHp} HP)` : ''}.`, 'hit');
  if (m.hp <= 0) {
    if (m.dormant > 0 || o.pulp) { m.dormant = 0; note(f, `You pulp ${the(m)}. This time, ${verb(m, 'it stays', 'they stay')} down.`, 'good'); return; }
    if (has(m, 'relentless') && !o.fire && !o.crit) {
      m.hp = 0; m.dormant = 2; m.prone = true;
      note(f, `${The(m)} ${verb(m, 'collapses… and twitches', 'collapse… and twitch')}. Burn or pulp what’s left, or ${verb(m, 'it', 'they')}’ll get back up.`, 'bad');
      return;
    }
    note(f, `${The(m)} ${verb(m, 'is', 'are')} dead.`, 'good');
    if (has(m, 'burst') && g.c.hp > 0) {
      const s = test(g, f, { stat: 'Dex', dd: 6, skill: 'save:Dex', label: `Dex save: ${the(m)} explodes`, reroll: 'rerollSave' });
      if (!s.success) hurtPlayer(g, f, rollExpr(g.rng, '2d6'), 'explosion');
      else note(f, 'You dive clear of the blast.');
    }
  } else if (has(m, 'coward') && m.hp < m.maxHp / 2) {
    m.fled = true; note(f, `${The(m)} ${verb(m, 'bursts', 'burst')} into tears and gives up.`, 'good');
  }
}

function hurtPlayer(g, f, dmg, src) {
  const { c, rng } = g;
  if (c.blocking && c.shield) {
    const b = Math.min(dmg, rng.roll(c.shield.block[0], c.shield.block[1]));
    dmg -= b; c.blocking = false; note(f, `Your ${c.shield.name.toLowerCase()} blocks ${b}.`);
  }
  const toAp = Math.min(c.ap, dmg); c.ap -= toAp; dmg -= toAp;
  const toHp = Math.min(c.hp, dmg); c.hp -= toHp;
  const who = !src ? 'That hurts' : typeof src === 'object' ? `${The(src)} ${verb(src, 'hits', 'hit')} you` : `The ${src} hits you`;
  note(f, `${who}: ${toAp ? `${toAp} to AP, ` : ''}${toHp} to HP. (${c.hp}/${c.maxHp} HP, ${c.ap} AP)`, 'bad');
  if (c.hp <= 0) {
    const salve = c.significant.find((i) => i.id === 'salve' && i.uses > 0);
    if (salve) { salve.uses = 0; c.significant = c.significant.filter((i) => i !== salve); c.hp = 1; note(f, 'You fall, bleeding out, and slap clotting salve on the wound. Back up, on 1 HP.', 'good'); }
    else { f.over = true; f.lost = true; note(f, 'You fall to the floor and bleed out. Your adventure ends here.', 'bad'); }
  }
}

function monsterAttack(g, f, m) {
  const { c, rng } = g;
  if (has(m, 'handgun') && rng.chance(1, 3)) { note(f, `${The(m)} ${verb(m, 'fumbles', 'fumble')} with the safety catch.`); return; }
  if (has(m, 'noEngaged') && f.distance === 0) { note(f, `You’re too close for ${the(m)} to do anything but shout.`); return; }
  const melee = m.range === 'engaged';
  if (!melee && f.chosen > 0) { note(f, `${The(m)}’s attack swerves round you. You are Chosen.`); return; }
  let crit = false;
  if (c.prone && melee) { note(f, 'You’re on the floor: the attack can’t miss.'); }
  else {
    const t = test(g, f, { stat: c.stats.Dex > c.stats.Str ? 'Dex' : 'Str', dd: m.dd, skill: melee ? 'defend:melee' : 'defend:ranged', label: `Defend against ${the(m)}`, reroll: 'rerollDefend', weaponTest: true, critFailFrom: has(m, 'critWide') ? 17 : undefined });
    if (t.success) {
      note(f, 'It misses.');
      if (melee && hasFeature(c, 'counter') && alive(m)) { note(f, 'Pit fighter: you counterattack.'); playerAttack(g, f, m, { free: true }); }
      return;
    }
    if (t.critFail) note(f, 'Critical failure: double damage!', 'bad');
    crit = t.critFail;
  }
  let dmg = m.dmg ? rollExpr(rng, m.dmg, { lvl: m.lvl }) : rng.die(m.dd) + m.lvl;
  if (has(m, 'dealD6')) dmg += rng.die(6);
  if (m.galv > 0) { const x = rng.die(6); dmg += x; note(f, `Galvanised, ${the(m)} deals +${x} damage.`, 'bad'); }
  if (crit) dmg *= 2;
  hurtPlayer(g, f, dmg, m);
  if (m.onHit && c.hp > 0) {
    const o = m.onHit;
    const s = test(g, f, { stat: o.stat, dd: o.dd, skill: `save:${o.stat}`, label: `${o.stat} save: ${o.label}`, reroll: 'rerollSave' });
    if (!s.success) {
      note(f, o.text, 'bad');
      if (o.effect === 'prone' && !hasFeature(c, 'noProne')) c.prone = true;
      if (o.effect === 'gold') { const lost = Math.min(o.amount, c.gold); c.gold -= lost; note(f, `−${lost}GP.`, 'bad'); }
      if (o.effect === 'damage') hurtPlayer(g, f, rollExpr(rng, o.amount), null);
      if (o.effect === 'disintegrate') {
        if (c.armour) { note(f, `Your ${c.armour.name.toLowerCase()} turns to dust.`, 'bad'); c.armour = null; c.ap = 0; }
        else if (c.shield) { note(f, `Your ${c.shield.name.toLowerCase()} turns to dust.`, 'bad'); c.shield = null; }
        else if (c.weapon && !['dagger', 'sling', 'bow'].includes(c.weapon.id)) { note(f, `Your ${c.weapon.name.toLowerCase()} turns to dust. You draw your dagger.`, 'bad'); c.weapon = { id: 'dagger', name: 'Dagger', weight: 1, ranged: false }; }
        else note(f, 'Everything you’re carrying that could turn to dust already has. The ray tickles.');
      }
    }
  }
  if (has(m, 'contract') && c.hp > 0) {
    const s = test(g, f, { stat: 'Cha', dd: 4, skill: 'save:Cha', label: 'Cha save against the contract', reroll: 'rerollSave' });
    if (!s.success) { const lost = Math.min(10, c.gold); c.gold -= lost; note(f, `Ink everywhere, and somehow you’ve signed something. −${lost}GP.`, 'bad'); }
  }
  if (has(m, 'vomit') && c.hp > 0 && !hasFeature(c, 'noProne')) {
    const s = test(g, f, { stat: 'Dex', dd: 4, skill: 'save:Dex', label: 'Dex save against the slippery vomit', reroll: 'rerollSave' });
    if (!s.success) { c.prone = true; note(f, 'You slip and fall prone.', 'bad'); }
  }
}

function monstersTurn(g, f) {
  const { c, rng } = g;
  if (f.fireMon > 0) { f.fireMon--; for (const m of f.monsters) if (alive(m)) { note(f, `Hellfire burns ${the(m)}.`); hurtMonster(g, f, m, rng.die(8), { magic: true, fire: true, noBonus: true }); } }
  if (f.fireSelf > 0) { f.fireSelf--; hurtPlayer(g, f, rng.die(8), 'hellfire around you'); if (f.over) return; }
  if (!active(f).length) return;
  if (f.sanctMon > 0) { f.sanctMon--; note(f, `The monsters sit inside their sanctuary${f.sanctMon ? '' : ', and then the walls fade'}.`); return; }
  if (f.sanctSelf > 0) { f.sanctSelf--; note(f, `Nothing can reach you inside your sanctuary${f.sanctSelf ? '' : '. Then its walls fade'}.`); return; }
  if (f.chosen > 0) f.chosen--;
  for (const m of f.monsters) {
    if (f.over) return;
    if (m.dormant > 0) {
      if (--m.dormant === 0) { m.hp = Math.ceil(m.maxHp / 2); m.prone = false; note(f, `${The(m)} ${verb(m, 'gets', 'get')} back up (${m.hp} HP).`, 'bad'); }
      continue;
    }
    if (!alive(m)) continue;
    if (m.unaware) continue;
    if (m.stunned > 0) { m.stunned--; note(f, m.dancing ? `${The(m)} ${verb(m, 'dances', 'dance')}.` : `${The(m)} ${verb(m, 'loses a turn', 'lose a turn')} (${m.stunWhy || 'stunned'}).`); if (!m.stunned) { m.dancing = false; m.stunWhy = null; } continue; }
    if (m.prone) { m.prone = false; }
    if (has(m, 'approval')) { m.tick ^= 1; if (m.tick) { note(f, `${The(m)} ${verb(m, 'waits', 'wait')} for the action to be approved.`); continue; } }
    if (m.range === 'engaged' && f.distance > 0) {
      f.distance -= 1;
      if (f.distance > 0) { note(f, `${The(m)} ${verb(m, 'advances', 'advance')} (${BANDS[f.distance].toLowerCase()} range).`); continue; }
      note(f, `${The(m)} ${verb(m, 'closes', 'close')} in.`);
    }
    if (has(m, 'breath') && g.rng.chance(1, 3)) {
      const s = test(g, f, { stat: 'Dex', dd: m.dd, skill: 'save:Dex', label: `Dex save: ${the(m)} breathes fire`, reroll: 'rerollSave' });
      const d = rollExpr(g.rng, `${Math.ceil(m.lvl / 2)}d6`);
      hurtPlayer(g, f, s.success ? Math.floor(d / 2) : d, 'fire');
      continue;
    }
    for (let i = 0; i < attacksOf(m) && !f.over; i++) monsterAttack(g, f, m);
    if (m.galv > 0) m.galv--;
    if (has(m, 'topple')) { m.prone = true; note(f, `${The(m)} ${verb(m, 'falls', 'fall')} over.`); }
    if (m.greased > 0 && alive(m)) { m.greased--; if (!has(m, 'flies') && rng.chance(1, 2)) { m.prone = true; note(f, `${The(m)} ${verb(m, 'slips', 'slip')} on the grease and falls over.`, 'good'); } }
  }
  for (const m of f.monsters) if (alive(m) && m.regen && !(m.regenStop && c.flags[m.regenStop])) {
    const h = Math.min(m.regen, m.maxHp - m.hp); if (h > 0) { m.hp += h; note(f, `${The(m)} ${verb(m, 'heals', 'heal')} ${h} HP.`, 'bad'); }
  }
}

/** Actions available to the player this turn. */
export function actions(g, f) {
  const { c } = g;
  if (f.over) return [];
  const out = [];
  const targets = active(f);
  const melee = c.weapon && !c.weapon.ranged;
  const canMelee = f.distance <= 1;
  for (const m of targets) {
    if (c.weapon.ranged) {
      if (hasItem(c, 'ammo')) out.push({ id: 'shoot', target: m.uid, label: `Shoot ${the(m)} (${BANDS[f.distance]}: d${RANGED_DIE[hasFeature(c, 'hunter') ? 1 : f.distance]})${f.distance === 0 ? ' — gives free attacks' : ''}` });
      if (canMelee && c.sidearm) out.push({ id: 'sidearm', target: m.uid, label: `Stab ${the(m)} with your dagger` });
    } else if (canMelee) out.push({ id: 'attack', target: m.uid, label: m.dormant > 0 ? `Pulp ${the(m)} while ${verb(m, 'it’s', 'they’re')} down` : `Attack ${the(m)}` });
  }
  if (f.distance === 0 && c.weapon.ranged && hasItem(c, 'ammo') && !f.def.cornered) out.push({ id: 'fallback', target: targets[0] && targets[0].uid, label: 'Fall back a little, then shoot' });
  if (!canMelee && !out.some((a) => a.id === 'shoot')) out.push({ id: 'advance', label: 'Advance' });
  // nothing to hit them with: fists
  if (canMelee && !out.some((a) => ['attack', 'sidearm', 'shoot'].includes(a.id))) for (const m of targets) out.push({ id: 'unarmed', target: m.uid, label: `Punch ${the(m)} (unarmed, d4)` });
  out.push(...spellActions(g, f, targets));
  if (magicType(c) === 'divine') for (const m of targets) if (has(m, 'undead') && alive(m)) out.push({ id: 'turn', target: m.uid, label: `Turn ${the(m)}` });
  if (hasItem(c, 'potion') && c.hp < c.maxHp) out.push({ id: 'potion', label: 'Drink a healing potion' });
  if (hasItem(c, 'caltrops')) out.push({ id: 'caltrops', label: 'Scatter caltrops' });
  for (const [id, verb] of [['fire', 'Throw alchemist’s fire at'], ['acid', 'Throw acid at'], ['holywater', 'Splash holy water on'], ['pocketsand', 'Throw pocket sand at']]) {
    if (hasItem(c, id)) for (const m of targets) if (alive(m) || (id === 'fire' && m.dormant)) out.push({ id, target: m.uid, label: `${verb} ${the(m)}` });
  }
  if (c.shield && !c.blocking) out.push({ id: 'block', label: `Block with your ${c.shield.name.toLowerCase()}` });
  for (const sp of f.def.special || []) if (!(sp.flag && c.flags[sp.flag]) && check(c, sp.if).ok) out.push({ id: 'special', sp, label: sp.label });
  if (f.def.flee) out.push({ id: 'flee', label: f.def.flee.label || 'Run for it' });
  // Pacified, or shut in a sanctuary: no fighting, only waiting, healing, blocking or running.
  const calm = f.pacified > 0 || f.sanctSelf > 0;
  const kept = calm ? out.filter((a) => PEACEFUL.has(a.id) || (a.id === 'cast' && FIGHT_SPELLS[a.spell].t === 'self' && FIGHT_SPELLS[a.spell].heal)) : out;
  if (calm || !kept.length) kept.push({ id: 'wait', label: f.sanctSelf > 0 ? 'Wait inside your sanctuary' : 'Wait' });
  return kept;
}
const PEACEFUL = new Set(['potion', 'block', 'flee', 'turn']);

// Spells with a use in a fight. t: 'one' (a monster), 'all' (every monster in the target space) or 'self'.
// heal: only offered when you're hurt. Opposites cast on a divine critical failure use the same target.
const FIGHT_SPELLS = {
  bolt: { t: 'one' }, trip: { t: 'one' }, grease: { t: 'all' }, shock: { t: 'one', engaged: true }, command: { t: 'one' },
  choreomania: { t: 'all' }, lightning: { t: 'all', outdoors: true }, freeze: { t: 'all' }, fireball: { t: 'all' },
  famine: { t: 'all' }, harm: { t: 'one' }, heal: { t: 'self', heal: true }, banish: { t: 'all', undead: true }, pacify: { t: 'one' },
  galvanise: { t: 'self' }, sanctuary: { t: 'self' }, hellfire: { t: 'all' }, vivify: { t: 'self', heal: true }, afflict: { t: 'one' },
  enfeeble: { t: 'one' }, chosen: { t: 'self', ranged: true }, consecrate: { t: 'self', weapon: true }, hysteria: { t: 'self', heal: true },
  dirge: { t: 'all' }, descend: { t: 'one' }, pillar: { t: 'one' }, judgement: { t: 'all' }, deluge: { t: 'all' },
};
const DIVINE_RANGE = 2;   // divine spells are medium range

function spellActions(g, f, targets) {
  const { c } = g; const out = [];
  const known = Object.keys(FIGHT_SPELLS).filter((id) => canCast(c, id));
  for (const id of known) {
    const sp = SPELLS[id]; const fs = FIGHT_SPELLS[id];
    const name = `Cast ${sp.name}`;
    if (sp.list === 'divine' && fs.t !== 'self' && f.distance > DIVINE_RANGE) continue;
    if (fs.engaged && f.distance > 0) continue;
    if (fs.outdoors && !f.def.outdoors) continue;
    if (fs.heal && c.hp >= c.maxHp) continue;
    if (fs.undead && !targets.some((m) => has(m, 'undead'))) continue;
    if (fs.ranged && !targets.some((m) => m.range !== 'engaged')) continue;
    if (fs.weapon && c.weapon.magic) continue;
    if (fs.t === 'one') { for (const m of targets) if (alive(m)) out.push({ id: 'cast', spell: id, target: m.uid, label: `${name} on ${the(m)} (level ${sp.lvl})` }); }
    else out.push({ id: 'cast', spell: id, label: `${name} (level ${sp.lvl}: ${sp.text.charAt(0).toLowerCase()}${sp.text.slice(1)})${id === 'fireball' && f.distance === 0 ? ' — you’re standing in it' : ''}` });
  }
  return out;
}

function castInFight(g, f, id, m) {
  const { c, rng } = g; const sp = SPELLS[id];
  const stat = sp.list === 'divine' ? 'Wis' : 'Int';
  const t = test(g, f, { stat, dd: sp.dd, skill: `cast:${sp.list}`, label: `Cast ${sp.name} (${stat})` });
  if (t.success) {
    if (t.ddRoll >= 4) { c.slots[sp.lvl] = false; note(f, `You rolled 4 or more on the difficulty die: your level ${sp.lvl} spell slot is spent.`); }
    else note(f, `You rolled under 4 on the difficulty die: you keep your level ${sp.lvl} spell slot.`);
    spellEffect(g, f, id, m);
  } else if (t.critFail && sp.list === 'divine') {
    note(f, `Your god scorns you, and casts ${SPELLS[sp.opp].name} instead.`, 'bad');
    spellEffect(g, f, sp.opp, m);
  } else if (t.critFail) {
    const d = rng.roll(sp.lvl, 4); note(f, `Overwhelmed by ætheric currents, you take ${sp.lvl}d4 damage.`, 'bad'); hurtPlayer(g, f, d, 'backlash');
  } else note(f, 'The spell fizzles. Nothing happens.');
}

/** What a spell does in a fight. m is the monster targeted (if any); self-targeted spells (and their opposites) hit you. */
function spellEffect(g, f, id, m) {
  const { c, rng } = g;
  const all = () => f.monsters.filter(alive);
  const resist = (x) => { if (has(x, 'magicImmune')) { note(f, `${The(x)} ${verb(x, 'is', 'are')} immune to magic.`); return true; } return false; };
  const healYou = (h) => { c.hp = Math.min(c.maxHp, c.hp + h); note(f, `You heal ${h} HP (${c.hp}/${c.maxHp}).`, 'good'); };
  const healIt = (x, h) => { if (resist(x)) return; x.hp = Math.min(x.maxHp, x.hp + h); note(f, `${The(x)} ${verb(x, 'heals', 'heal')} ${h} HP (${x.hp}/${x.maxHp}).`, 'bad'); };
  const lvl = c.level;
  switch (id) {
    // ----- arcane
    case 'bolt': hurtMonster(g, f, m, 2 * lvl, { magic: true }); break;
    case 'trip': if (resist(m)) break; if (has(m, 'flies')) note(f, `${The(m)} ${verb(m, 'is', 'are')} flying. There is nothing to trip over.`); else { m.prone = true; note(f, `${The(m)} ${verb(m, 'goes', 'go')} flat on the floor.`, 'good'); } break;
    case 'grease': note(f, 'The floor under them turns slick as a fishmonger’s slab.', 'good'); for (const x of all()) if (!resist(x)) x.greased = 5; break;
    case 'shock': { const ts = [m, ...all().filter((x) => x !== m)].slice(0, 2); for (const x of ts) if (alive(x)) hurtMonster(g, f, x, rng.roll(lvl, 4), { magic: true }); break; }
    case 'command': if (resist(m)) break; stun(m, 1, 'sitting down'); note(f, `“Sit down,” you say. ${The(m)} ${verb(m, 'sits', 'sit')} down.`, 'good'); break;
    case 'choreomania': for (const x of all()) if (!resist(x)) { stun(x, rng.die(4), 'dancing'); x.dancing = true; note(f, `${The(x)} ${verb(x, 'starts', 'start')} to dance (${x.stunned} round${x.stunned === 1 ? '' : 's'}).`, 'good'); } break;
    case 'lightning': { const n = rng.die(4); const ts = [...all()].sort(() => rng.die(2) - 1.5).slice(0, n); note(f, `The sky splits. ${n} bolt${n === 1 ? '' : 's'} of lightning come down.`, 'good'); for (const x of ts) hurtMonster(g, f, x, rng.roll(lvl, 6), { magic: true }); break; }
    case 'freeze': note(f, 'Time stops. Everything but you hangs in the air like dust in a sunbeam.', 'good'); for (const x of all()) stun(x, 1, 'frozen in time'); break;
    case 'fireball': note(f, 'A bead of fire floats over to them and blooms.', 'good'); for (const x of all()) hurtMonster(g, f, x, rng.roll(lvl, 8), { magic: true, fire: true }); if (f.distance === 0 && !f.over) hurtPlayer(g, f, rng.roll(lvl, 8), 'fireball you were standing in'); break;
    // ----- divine
    case 'famine': note(f, 'A swarm of locusts pours out of your sleeves.', 'good'); for (const x of all()) hurtMonster(g, f, x, rng.die(6), { magic: true, noBonus: true }); break;
    case 'abundance': {
      if (c.mundane.length < MUNDANE_LIMIT) { c.mundane.push(makeItem('rations')); note(f, 'A day’s rations appear in your arms, neatly wrapped. Lovely.', 'bad'); }
      else note(f, 'A day’s rations appear in the air, and fall on the floor. Lovely.', 'bad');
      break;
    }
    case 'harm': if (m) hurtMonster(g, f, m, rollExpr(rng, '2d8') + lvl, { magic: true, noBonus: true }); else hurtPlayer(g, f, rollExpr(rng, '2d8') + lvl, 'Harm spell'); break;
    case 'heal': if (m) healIt(m, rollExpr(rng, '2d8') + lvl); else healYou(rollExpr(rng, '2d8') + lvl); break;
    case 'afflict': if (m) hurtMonster(g, f, m, rollExpr(rng, '3d8') + lvl, { magic: true, noBonus: true }); else hurtPlayer(g, f, rollExpr(rng, '3d8') + lvl, 'Afflict spell'); break;
    case 'vivify': if (m) healIt(m, rollExpr(rng, '3d8') + lvl); else healYou(rollExpr(rng, '3d8') + lvl); break;
    case 'dirge': if (m === 'all' || !m) { if (m === 'all') for (const x of all()) hurtMonster(g, f, x, rollExpr(rng, '2d6') + lvl, { magic: true, noBonus: true }); else hurtPlayer(g, f, rollExpr(rng, '2d6') + lvl, 'Dirge'); } break;
    case 'hysteria': if (m === 'all') for (const x of all()) healIt(x, rollExpr(rng, '2d6') + lvl); else healYou(rollExpr(rng, '2d6') + lvl); break;
    case 'banish': { const u = all().filter((x) => has(x, 'undead')); for (const x of u) { x.fled = true; c.flags.undeadFled = true; note(f, `${The(x)} ${verb(x, 'flees', 'flee')} from the light of law.`, 'good'); } if (!u.length) note(f, 'Nothing here is dead enough to care.'); break; }
    case 'entreat': { const u = all().filter((x) => has(x, 'undead')); if (u.length) { f.distance = 0; note(f, 'Every dead thing in the place turns towards you, interested.', 'bad'); } else note(f, 'Somewhere far off, something dead sits up and takes an interest.', 'bad'); break; }
    case 'pacify': if (m) { if (resist(m)) break; stun(m, 3, 'pacified'); note(f, `A great calm comes over ${the(m)}. No fighting for 3 rounds.`, 'good'); } else { f.pacified = 3; note(f, 'A great calm comes over you. You won’t fight for 3 rounds.', 'bad'); } break;
    case 'galvanise': if (m) { if (resist(m)) break; m.galv = 6; note(f, `${The(m)} ${verb(m, 'swells', 'swell')} with unholy vigour: +d6 damage for 6 rounds.`, 'bad'); } else { f.galv = 6; note(f, 'Unholy vigour floods your arms: +d6 damage for 6 rounds.', 'good'); } break;
    case 'sanctuary': { const n = rollExpr(rng, '2d6'); if (m) { f.sanctMon = n; note(f, `Shining walls rise around them. For ${n} rounds nothing gets in or out.`, 'bad'); } else { f.sanctSelf = n; note(f, `Shining walls rise around you. For ${n} rounds nothing gets in or out.`, 'good'); } break; }
    case 'hellfire': { const n = rollExpr(rng, '2d6'); if (m) { f.fireMon = n; note(f, `The ground under them bursts into flame, for ${n} rounds.`, 'good'); } else { f.fireSelf = n; note(f, `The ground under you bursts into flame, for ${n} rounds.`, 'bad'); } break; }
    case 'enfeeble': if (resist(m)) break; m.enfeebled = true; note(f, `${The(m)} ${verb(m, 'looks', 'look')} suddenly fragile: +d8 damage from every hit.`, 'good'); break;
    case 'insubstantiate': if (resist(m)) break; if (!has(m, 'ghostly')) { m.feats.push('ghostly'); m.misted = true; } note(f, `${The(m)} ${verb(m, 'turns', 'turn')} to mist. Ordinary weapons pass straight through now.`, 'bad'); break;
    case 'chosen': f.chosen = 5; note(f, 'You are Chosen: for 5 rounds, ranged attacks can’t touch you.', 'good'); break;
    case 'pariah': note(f, 'You are a Pariah: every arrow for a mile around takes an interest in you.', 'bad'); break;
    case 'consecrate': c.weapon = { ...c.weapon, magic: true, plus: 1, name: c.weapon.name.startsWith('Consecrated') ? c.weapon.name : `Consecrated ${c.weapon.name.toLowerCase()}` }; note(f, `Your ${c.weapon.name.toLowerCase()} shines: it is magic now (+1).`, 'good'); break;
    case 'ophidia': {
      note(f, `Your ${c.weapon.name.toLowerCase()} turns into a snake (level 3), and it does not like you. You draw your dagger.`, 'bad');
      c.weapon = { id: 'dagger', name: 'Dagger', weight: 1, ranged: false };
      f.monsters.push(makeMonster(rng, { name: 'Snake that was your weapon', lvl: 3, range: 'engaged' }));
      break;
    }
    case 'descend': if (resist(m)) break; if (has(m, 'flies')) { note(f, `${The(m)} ${verb(m, 'goes', 'go')} up, and ${verb(m, 'stays', 'stay')} up. ${verb(m, 'It flies', 'They fly')}.`); break; } note(f, `${The(m)} ${verb(m, 'is', 'are')} flung into the sky, and comes down again.`, 'good'); hurtMonster(g, f, m, rollExpr(rng, '6d6'), { noBonus: true, crit: true }); break;
    case 'ascend': if (resist(m)) break; if (!has(m, 'flies')) { m.feats.push('flies'); m.floating = true; } note(f, `${The(m)} ${verb(m, 'floats', 'float')} gently up off the ground, and ${verb(m, 'flies', 'fly')} now.`, 'bad'); break;
    case 'pillar': if (resist(m)) break; m.hp = 0; m.dormant = 0; note(f, `${The(m)} ${verb(m, 'turns', 'turn')} into a pillar of salt.`, 'good'); break;
    case 'immortalise': if (resist(m)) break; m.maxHp *= 2; m.hp *= 2; note(f, `${The(m)}’s skin turns to stone (${m.hp}/${m.maxHp} HP).`, 'bad'); break;
    case 'judgement': for (const x of all()) { const d = rollExpr(rng, '8d8'); if (has(x, 'magicImmune')) { resist(x); continue; } if (d >= x.hp) { x.obeys = true; note(f, `${The(x)} ${verb(x, 'kneels', 'kneel')}, ${verb(x, 'converts', 'convert')} to law, and won’t fight you now.`, 'good'); } else hurtMonster(g, f, x, d, { magic: true, noBonus: true }); } break;
    case 'deluge': note(f, 'A flood comes out of nowhere.', 'good'); for (const x of all()) { if (resist(x)) continue; stun(x, 3, 'tumbled about by the flood'); if (!has(x, 'flies') && rng.chance(1, 4)) { x.fled = true; note(f, `${The(x)} ${verb(x, 'is', 'are')} washed away.`, 'good'); } else note(f, `${The(x)} ${verb(x, 'is', 'are')} tumbled about, and can’t act for 3 rounds.`, 'good'); } break;
    default: note(f, 'Nothing obvious happens.');
  }
}

function useUp(c, id) {
  for (const list of ['mundane', 'significant']) {
    const it = c[list].find((i) => i.id === id && (i.uses === undefined || i.uses > 0));
    if (it) { if (it.uses !== undefined) it.uses -= 1; if (!it.uses) c[list] = c[list].filter((x) => x !== it); return; }
  }
}

/** Perform a player action, then the monsters act. */
export function act(g, f, a) {
  const { c, rng } = g;
  if (f.over) return;
  f.log = [];
  const m = f.monsters.find((x) => x.uid === a.target);
  if (c.prone) { c.prone = false; note(f, 'You get up (standing is free).'); }
  switch (a.id) {
    case 'unarmed': if (f.distance > 0) f.distance = 0; playerAttack(g, f, m, { weapon: 'unarmed' }); break;
    case 'attack': case 'sidearm': {
      if (f.distance > 0) { f.distance = 0; note(f, 'You close in.'); }
      playerAttack(g, f, m, { weapon: a.id === 'sidearm' ? 'sidearm' : 'main' });
      if (hasFeature(c, 'extraAttack') && !f.over) {
        const t = alive(m) || m.dormant ? m : f.monsters.find(alive);
        if (t) playerAttack(g, f, t, { weapon: a.id === 'sidearm' ? 'sidearm' : 'main', unskilled: true, free: true, label: `Envoy: an extra attack on ${the(t)} (unskilled)` });
      }
      break;
    }
    case 'shoot': case 'fallback': {
      if (a.id === 'fallback') { f.distance = 1; note(f, 'You back off to short range.'); }
      else if (f.distance === 0) {
        note(f, 'Shooting while engaged: everyone in reach gets a free attack.');
        for (const x of f.monsters) if (alive(x) && x.range === 'engaged' && !x.unaware && !f.over) monsterAttack(g, f, x);
      }
      if (!f.over) playerAttack(g, f, m || f.monsters.find(alive), { weapon: 'main' });
      break;
    }
    case 'advance': f.distance = Math.max(0, f.distance - 1); note(f, `You advance (${BANDS[f.distance].toLowerCase()} range).`); break;
    case 'cast': castInFight(g, f, a.spell, FIGHT_SPELLS[a.spell].t === 'one' ? m : FIGHT_SPELLS[a.spell].t === 'all' ? 'all' : null); break;
    case 'wait': note(f, 'You wait.'); break;
    case 'turn': {
      const t = test(g, f, { stat: 'Wis', dd: m.dd, skill: 'cast:divine', label: `Turn ${the(m)} (Wis)` });
      if (t.success) {
        if (c.alignment === 'chaos') { m.obeys = true; c.flags.undeadObeys = true; note(f, `${The(m)} ${verb(m, 'bows', 'bow')} to you, and ${verb(m, 'obeys', 'obey')} you now.`, 'good'); }
        else { m.fled = true; c.flags.undeadFled = true; note(f, `${The(m)} ${verb(m, 'flees', 'flee')} from your holy symbol.`, 'good'); }
      } else note(f, `${The(m)} ${verb(m, 'is', 'are')} unimpressed.`);
      break;
    }
    case 'potion': { useUp(c, 'potion'); const h = rollExpr(rng, '2d6') + (hasFeature(c, 'favoured') ? c.level : 0); c.hp = Math.min(c.maxHp, c.hp + h); note(f, `You drink a healing potion: +${h} HP (${c.hp}/${c.maxHp}).`, 'good'); break; }
    case 'fire': useUp(c, 'fire'); note(f, 'You throw the alchemist’s fire.'); hurtMonster(g, f, m, rollExpr(rng, '2d8'), { fire: true, pulp: m.dormant > 0 }); break;
    case 'acid': useUp(c, 'acid'); note(f, 'You throw the vial of acid.'); hurtMonster(g, f, m, rollExpr(rng, '2d4')); break;
    case 'holywater': useUp(c, 'holywater');
      if (has(m, 'undead') || has(m, 'ghostly')) hurtMonster(g, f, m, rollExpr(rng, '2d8'), { holy: true }); else note(f, `${The(m)} ${verb(m, 'is', 'are')} now slightly damp and blessed.`);
      break;
    case 'caltrops': {
      useUp(c, 'caltrops'); note(f, 'You scatter caltrops.');
      for (const x of f.monsters) if (alive(x) && x.range === 'engaged' && !has(x, 'flies')) {
        hurtMonster(g, f, x, rng.die(4), { noBonus: true });
        if (alive(x) && f.distance > 0) { stun(x, 1, 'picking out spikes'); note(f, `${The(x)} ${verb(x, 'stops', 'stop')} to pick spikes out of ${verb(x, 'its', 'their')} feet.`); }
      }
      break;
    }
    case 'pocketsand': useUp(c, 'pocketsand'); stun(m, 1, 'blinded by sand'); if (has(m, 'invisible')) { m.revealed = true; note(f, `The sand sticks to ${the(m)}, and now you can see its outline.`, 'good'); } note(f, `Pocket sand! ${The(m)} can’t do anything for a turn.`, 'good'); break;
    case 'special': {
      const sp = a.sp;
      if (sp.test) {
        const t = test(g, f, { ...sp.test, label: sp.label });
        if (!t.success) { note(f, sp.failText || 'It doesn’t work.'); break; }
      }
      if (sp.flag) c.flags[sp.flag] = true;
      note(f, sp.text, 'good');
      if (sp.dmg) { const t = f.monsters.find(alive); if (t) hurtMonster(g, f, t, rollExpr(rng, sp.dmg), { noBonus: true }); }
      if (sp.win) { for (const x of f.monsters) if (alive(x)) x.fled = true; }
      if (sp.reveal) { for (const x of f.monsters) x.revealed = true; }
      if (sp.stun) { for (const x of f.monsters) if (alive(x)) stun(x, sp.stun, 'stunned'); }
      break;
    }
    case 'block': c.blocking = true; note(f, `You raise your ${c.shield.name.toLowerCase()}.`); break;
    case 'flee': {
      note(f, 'You run. Everyone in reach takes a parting swing.');
      for (const x of f.monsters) if (alive(x) && !x.unaware && (x.range !== 'engaged' || f.distance === 0) && !f.over) monsterAttack(g, f, x);
      if (!f.over) { f.over = true; f.fled = true; }
      return finish(g, f);
    }
  }
  for (const x of f.monsters) x.unaware = false;
  if (!f.over && !active(f).length) { f.over = true; f.won = true; return finish(g, f); }
  if (!f.over && f.monsters.some((x) => alive(x) && has(x, 'unluckyAura')) && !hasFeature(c, 'noProne') && rng.chance(2, 6)) { c.prone = true; note(f, 'Your luck runs out, along with your footing. You fall prone.', 'bad'); }
  if (!f.over) monstersTurn(g, f);
  if (!f.over && !active(f).length) { f.over = true; f.won = true; }
  f.round++;
  if (f.galv > 0) f.galv--;
  if (f.pacified > 0) f.pacified--;
  return finish(g, f);
}

function finish(g, f) {
  const { c } = g;
  if (!f.over) return;
  c.blocking = false; c.prone = false;
  if (f.fired) { const ammo = c.mundane.find((i) => i.id === 'ammo'); if (ammo) { ammo.tokens -= 1; note(f, `Ammunition: ${ammo.tokens} left.`); if (ammo.tokens <= 0) c.mundane = c.mundane.filter((i) => i !== ammo); } }
  if (f.won) { note(f, 'Victory. Ten minutes’ rest restores your AP.', 'good'); c.ap = maxAp(c); }
  if (f.fled) { c.ap = maxAp(c); }
}

export { alive, active };
