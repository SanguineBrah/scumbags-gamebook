// Fights, following the rulebook's "Combat rules". One scumbag against one or more monsters.
// The UI calls act(fight, action); every roll is written to fight.log so the player can see the dice.
import { statTest } from '../rules/tests.js';
import { rollExpr } from '../rules/dice.js';
import { MONSTER_DD, MELEE_DIE, RANGED_DIE, DARK_DIE, BANDS } from '../rules/data.js';
import { isSkilled, hasFeature, weaponPenalty, armourPenalty, weaponDamageDie, maxAp, magicType } from '../rules/character.js';
import { hasItem, check } from './conditions.js';

let uid = 1;
export function makeMonster(rng, def) {
  const lvl = def.lvl;
  const brute = (def.feats || []).includes('brute');
  const hp = def.hp != null ? def.hp : brute ? 8 * lvl : Math.max(1, rng.roll(lvl, 8));
  return {
    uid: uid++, name: def.name, lvl, dd: MONSTER_DD(lvl), range: def.range || 'engaged', feats: [...(def.feats || [])],
    hp, maxHp: hp, dmg: def.dmg || null, note: def.note || '', regen: def.regen || 0, regenStop: def.regenStop || null,
    unaware: false, prone: false, stunned: 0, dormant: 0, fled: false, obeys: false, tick: 0,
  };
}
const has = (m, f) => m.feats.includes(f);
const alive = (m) => m.hp > 0 && !m.fled && !m.obeys;
const active = (f) => f.monsters.filter((m) => alive(m) || m.dormant > 0);
const attacksOf = (m) => (has(m, 'brute') ? Math.min(3, Math.ceil(m.lvl / 2)) : 1);

/** Start a fight from a section's fight definition. */
export function startFight(g, def) {
  const { rng, c } = g;
  const f = {
    def, round: 1, monsters: def.monsters.map((m) => makeMonster(rng, m)), distance: def.distance || 0,
    log: [], over: false, won: false, lost: false, fired: false, dark: g.dark && !def.lit,
  };
  if (def.surprise) for (const m of f.monsters) m.unaware = true;
  note(f, def.intro || 'Fight!');
  if (def.surprise) note(f, 'They haven’t noticed you. Every success on your first attack is a critical success.');
  else {
    // Initiative: a d4 Dex saving throw
    const t = test(g, f, { stat: 'Dex', dd: 4, skill: 'save:Dex', label: 'Initiative (Dex save)' });
    if (!t.success) { note(f, 'Too slow. They go first.'); monstersTurn(g, f); }
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
  const roll = () => statTest(rng, { stat: c.stats[o.stat] + (o.statBonus || 0), dd, skilled, forceRoll: true, modifier: o.modifier || 0, critRange: o.critRange || 1 });
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
  const label = opts.label || `Attack the ${m.name}${w ? ` (${w.name.toLowerCase()})` : ' (unarmed)'}`;
  const t = test(g, f, {
    stat: ranged ? 'Dex' : 'Str', dd, skill: opts.unskilled ? null : ranged ? 'attack:ranged' : 'attack:melee', label,
    modifier: has(m, 'tiny') ? 2 : 0, critRange: hasFeature(c, 'wideCrit') ? 3 : 1, reroll: 'rerollAttack', weaponTest: true, weapon: w,
  });
  let hit = t.success, crit = t.critSuccess;
  if (m.unaware && hit) crit = true;
  if (!ranged && (m.prone || m.dormant > 0) && !hit) { hit = true; note(f, `The ${m.name} is down: melee attacks against prone opponents always hit.`); }
  if (!hit) { note(f, 'You miss.'); return false; }
  let dmg = rng.die(weaponDamageDie(w)) + c.level;
  if (crit) dmg *= hasFeature(c, 'tripleCrit') ? 3 : 2;
  hurtMonster(g, f, m, dmg, { crit, pulp: m.dormant > 0 });
  if (!alive(m) && !m.dormant && hasFeature(c, 'cleave') && !opts.free) {
    const next = f.monsters.find(alive);
    if (next) { note(f, 'Sellsword: a free attack after slaying an opponent.'); playerAttack(g, f, next, { ...opts, free: true }); }
  }
  if (alive(m) && !ranged && hasFeature(c, 'fell') && !opts.free && rng.chance(1, 6)) {
    m.prone = true; note(f, `Woodcutter: you knock the ${m.name} flat and swing again.`);
    playerAttack(g, f, m, { ...opts, free: true });
  }
  return true;
}

export function hurtMonster(g, f, m, dmg, o = {}) {
  if (o.magic && has(m, 'magicImmune')) { note(f, `The ${m.name} is immune to magic.`); return; }
  if (has(m, 'takeD6') && !o.noBonus) { const x = g.rng.die(6); dmg += x; note(f, `The ${m.name} receives +${x} damage.`); }
  m.hp -= dmg;
  note(f, `${dmg} damage to the ${m.name}${m.hp > 0 ? ` (${m.hp}/${m.maxHp} HP)` : ''}.`, 'hit');
  if (m.hp <= 0) {
    if (m.dormant > 0 || o.pulp) { m.dormant = 0; note(f, `You pulp the ${m.name}. They stay down this time.`, 'good'); return; }
    if (has(m, 'relentless') && !o.fire && !o.crit) {
      m.hp = 0; m.dormant = 2; m.prone = true;
      note(f, `The ${m.name} collapse… and twitch. They must be burned or pulped, or they’ll get back up.`, 'bad');
      return;
    }
    note(f, `The ${m.name} is dead.`, 'good');
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
  note(f, `The ${src} hits you: ${toAp ? `${toAp} to AP, ` : ''}${toHp} to HP. (${c.hp}/${c.maxHp} HP, ${c.ap} AP)`, 'bad');
  if (c.hp <= 0) {
    const salve = c.significant.find((i) => i.id === 'salve' && i.uses > 0);
    if (salve) { salve.uses = 0; c.significant = c.significant.filter((i) => i !== salve); c.hp = 1; note(f, 'You fall, bleeding out, and slap clotting salve on the wound. Back up, on 1 HP.', 'good'); }
    else { f.over = true; f.lost = true; note(f, 'You fall to the floor and bleed out. Your adventure ends here.', 'bad'); }
  }
}

function monsterAttack(g, f, m) {
  const { c, rng } = g;
  if (has(m, 'handgun') && rng.chance(1, 3)) { note(f, `The ${m.name} fumbles with the safety catch.`); return; }
  const melee = m.range === 'engaged';
  let crit = false;
  if (c.prone && melee) { note(f, 'You’re on the floor: the attack can’t miss.'); }
  else {
    const t = test(g, f, { stat: c.stats.Dex > c.stats.Str ? 'Dex' : 'Str', dd: m.dd, skill: melee ? 'defend:melee' : 'defend:ranged', label: `Defend against the ${m.name}`, reroll: 'rerollDefend', weaponTest: true });
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
  if (crit) dmg *= 2;
  hurtPlayer(g, f, dmg, m.name);
  if (has(m, 'vomit') && c.hp > 0 && !hasFeature(c, 'noProne')) {
    const s = test(g, f, { stat: 'Dex', dd: 4, skill: 'save:Dex', label: 'Dex save against the slippery vomit', reroll: 'rerollSave' });
    if (!s.success) { c.prone = true; note(f, 'You slip and fall prone.', 'bad'); }
  }
}

function monstersTurn(g, f) {
  const { c } = g;
  for (const m of f.monsters) {
    if (f.over) return;
    if (m.dormant > 0) {
      if (--m.dormant === 0) { m.hp = Math.ceil(m.maxHp / 2); m.prone = false; note(f, `The ${m.name} get back up (${m.hp} HP).`, 'bad'); }
      continue;
    }
    if (!alive(m)) continue;
    if (m.unaware) continue;
    if (m.stunned > 0) { m.stunned--; note(f, `The ${m.name} is still rubbing sand out of its eyes.`); continue; }
    if (m.prone) { m.prone = false; }
    if (has(m, 'approval')) { m.tick ^= 1; if (m.tick) { note(f, `The ${m.name} waits for the action to be approved.`); continue; } }
    if (m.range === 'engaged' && f.distance > 0) {
      f.distance -= 1;
      if (f.distance > 0) { note(f, `The ${m.name} advances (${BANDS[f.distance].toLowerCase()} range).`); continue; }
      note(f, `The ${m.name} closes in.`);
    }
    for (let i = 0; i < attacksOf(m) && !f.over; i++) monsterAttack(g, f, m);
  }
  for (const m of f.monsters) if (alive(m) && m.regen && !(m.regenStop && c.flags[m.regenStop])) {
    const h = Math.min(m.regen, m.maxHp - m.hp); if (h > 0) { m.hp += h; note(f, `The ${m.name} heals ${h} HP.`, 'bad'); }
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
      if (hasItem(c, 'ammo')) out.push({ id: 'shoot', target: m.uid, label: `Shoot the ${m.name} (${BANDS[f.distance]}: d${RANGED_DIE[hasFeature(c, 'hunter') ? 1 : f.distance]})${f.distance === 0 ? ' — gives free attacks' : ''}` });
      if (canMelee && c.sidearm) out.push({ id: 'sidearm', target: m.uid, label: `Stab the ${m.name} with your dagger` });
    } else if (canMelee) out.push({ id: 'attack', target: m.uid, label: m.dormant > 0 ? `Pulp the ${m.name} while they’re down` : `Attack the ${m.name}` });
  }
  if (f.distance === 0 && c.weapon.ranged && hasItem(c, 'ammo') && !f.def.cornered) out.push({ id: 'fallback', target: targets[0] && targets[0].uid, label: 'Fall back a little, then shoot' });
  if (!canMelee && melee) out.push({ id: 'advance', label: 'Advance' });
  if (c.slots[1]) {
    if (magicType(c) === 'arcane') for (const m of targets) if (alive(m)) out.push({ id: 'bolt', target: m.uid, label: `Cast Arcane bolt at the ${m.name}` });
    if (magicType(c) === 'divine' && c.alignment === 'chaos' && hasItem(c, 'holysymbol')) out.push({ id: 'famine', label: 'Cast Famine (summon a swarm of locusts)' });
  }
  if (magicType(c) === 'divine') for (const m of targets) if (has(m, 'undead') && alive(m)) out.push({ id: 'turn', target: m.uid, label: `Turn the ${m.name}` });
  if (hasItem(c, 'potion') && c.hp < c.maxHp) out.push({ id: 'potion', label: 'Drink a healing potion' });
  for (const [id, verb] of [['fire', 'Throw alchemist’s fire at'], ['acid', 'Throw acid at'], ['holywater', 'Splash holy water on'], ['pocketsand', 'Throw pocket sand at']]) {
    if (hasItem(c, id)) for (const m of targets) if (alive(m) || (id === 'fire' && m.dormant)) out.push({ id, target: m.uid, label: `${verb} the ${m.name}` });
  }
  if (c.shield && !c.blocking) out.push({ id: 'block', label: `Block with your ${c.shield.name.toLowerCase()}` });
  for (const sp of f.def.special || []) if (!c.flags[sp.flag] && check(c, sp.if).ok) out.push({ id: 'special', sp, label: sp.label });
  if (f.def.flee) out.push({ id: 'flee', label: f.def.flee.label || 'Run for it' });
  return out;
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
    case 'attack': case 'sidearm': {
      if (f.distance > 0) { f.distance = 0; note(f, 'You close in.'); }
      playerAttack(g, f, m, { weapon: a.id === 'sidearm' ? 'sidearm' : 'main' });
      if (hasFeature(c, 'extraAttack') && !f.over) {
        const t = alive(m) || m.dormant ? m : f.monsters.find(alive);
        if (t) playerAttack(g, f, t, { weapon: a.id === 'sidearm' ? 'sidearm' : 'main', unskilled: true, free: true, label: `Envoy: an extra attack on the ${t.name} (unskilled)` });
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
    case 'bolt': {
      const t = test(g, f, { stat: 'Int', dd: 4, skill: 'cast:arcane', label: 'Cast Arcane bolt (Int)' });
      if (t.success) { if (t.ddRoll >= 4) { c.slots[1] = false; note(f, 'You rolled 4 on the difficulty die: the spell slot is spent.'); } hurtMonster(g, f, m, 2 * c.level, { magic: true }); }
      else if (t.critFail) { const d = rng.die(4); note(f, `Overwhelmed by ætheric currents, you take ${d} damage.`, 'bad'); hurtPlayer(g, f, d, 'backlash'); }
      else note(f, 'The spell fizzles.');
      break;
    }
    case 'famine': {
      const t = test(g, f, { stat: 'Wis', dd: 4, skill: 'cast:divine', label: 'Cast Famine (Wis)' });
      if (t.success) {
        if (t.ddRoll >= 4) { c.slots[1] = false; note(f, 'The spell slot is spent.'); }
        note(f, 'A swarm of locusts pours out of your sleeves.', 'good');
        for (const x of f.monsters) if (alive(x)) hurtMonster(g, f, x, rng.die(6), { magic: true, noBonus: true });
      } else if (t.critFail) { note(f, 'Your god scorns you: the locusts turn into a single day’s rations. Abundance. Lovely.', 'bad'); }
      else note(f, 'Nothing happens.');
      break;
    }
    case 'turn': {
      const t = test(g, f, { stat: 'Wis', dd: m.dd, skill: 'cast:divine', label: `Turn the ${m.name} (Wis)` });
      if (t.success) {
        if (c.alignment === 'chaos') { m.obeys = true; c.flags.undeadObeys = true; note(f, `The ${m.name} bows to you. It obeys you now.`, 'good'); }
        else { m.fled = true; c.flags.undeadFled = true; note(f, `The ${m.name} flees from your holy symbol.`, 'good'); }
      } else note(f, `The ${m.name} is unimpressed.`);
      break;
    }
    case 'potion': { useUp(c, 'potion'); const h = rollExpr(rng, '2d6') + (hasFeature(c, 'favoured') ? c.level : 0); c.hp = Math.min(c.maxHp, c.hp + h); note(f, `You drink a healing potion: +${h} HP (${c.hp}/${c.maxHp}).`, 'good'); break; }
    case 'fire': useUp(c, 'fire'); note(f, 'You throw the alchemist’s fire.'); hurtMonster(g, f, m, rollExpr(rng, '2d8'), { fire: true, pulp: m.dormant > 0 }); break;
    case 'acid': useUp(c, 'acid'); note(f, 'You throw the vial of acid.'); hurtMonster(g, f, m, rollExpr(rng, '2d4')); break;
    case 'holywater': useUp(c, 'holywater');
      if (has(m, 'undead')) hurtMonster(g, f, m, rollExpr(rng, '2d8'), { magic: false }); else note(f, `The ${m.name} is now slightly damp and blessed.`);
      break;
    case 'pocketsand': useUp(c, 'pocketsand'); m.stunned = 1; note(f, `Pocket sand! The ${m.name} can’t act until after its next turn.`, 'good'); break;
    case 'special': {
      const sp = a.sp;
      if (sp.test) {
        const t = test(g, f, { ...sp.test, label: sp.label });
        if (!t.success) { note(f, sp.failText || 'It doesn’t work.'); break; }
      }
      c.flags[sp.flag] = true; note(f, sp.text, 'good');
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
  if (!f.over) monstersTurn(g, f);
  if (!f.over && !active(f).length) { f.over = true; f.won = true; }
  f.round++;
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
