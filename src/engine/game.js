// The gamebook engine: numbered sections, choices, stat tests, fights and effects.
// State is plain data so it can be saved and restored (see save()/load()).
import { Rng, rollExpr } from '../rules/dice.js';
import { statTest, successChance } from '../rules/tests.js';
import { DARK_DIE, SPELLS, MUNDANE, SIGNIFICANT, MUNDANE_LIMIT, SIGNIFICANT_LIMIT } from '../rules/data.js';
import { isSkilled, hasFeature, armourPenalty, makeItem, goldRoom, resetDay, maxAp, magicType, itemSlots } from '../rules/character.js';
import { check, hasItem, lightSource, itemName } from './conditions.js';
import { startFight, act, actions } from './combat.js';

const OPPOSITE = { light: 'Shroud', shroud: 'Divine light', abundance: 'Famine', famine: 'Abundance', bless: 'Pollute', pollute: 'Bless' };

export class Game {
  constructor(adventure, seed) {
    this.adv = adventure;
    this.rng = new Rng(seed);
    this.c = null;
    this.at = null;           // current section key
    this.fight = null;        // fight in progress
    this.result = null;       // last test result: { lines, success, to }
    this.messages = [];       // effect messages for the current section
    this.dark = false;
    this.visits = {};
  }

  section(key = this.at) { return this.adv.sections[key]; }
  /** A section's text. Text functions get the character and how many times this section has been visited (1 = first time). */
  text(key = this.at) { const t = this.section(key).text || []; return typeof t === 'function' ? t(this.c, this.visits[key] || 1) : t; }
  number(key = this.at) { return this.adv.numbers[key]; }

  begin(character) { this.c = character; this.goto(this.adv.start); }

  goto(key) {
    const s = this.adv.sections[key];
    if (!s) throw new Error(`No section "${key}"`);
    this.at = key; this.result = null; this.fight = null; this.messages = [];
    const c = this.c;
    for (const r of s.redirect || []) if (check(c, r.if).ok) { if (r.effects) this.apply(r.effects); return this.goto(r.to); }   // events that interrupt
    this.visits[key] = (this.visits[key] || 0) + 1;
    // Darkness: entering a dark place uses up light.
    this.dark = false;
    if (s.dark) {
      const src = lightSource(c);
      if (!src) { this.dark = true; this.say('You have no light. Until you leave, your tests use at least a d12 difficulty die.', 'bad'); }
      else this.spendLight(src);
    }
    if (s.rest) this.rest();
    if (s.on) this.apply(s.on, s.onceOnly ? `on:${key}` : null);
    if (s.end === 'victory') c.flags.homeGold = c.gold;
    if (s.fight && !(s.fight.unless && check(c, s.fight.unless).ok)) {
      this.fight = startFight(this, s.fight);
      if (this.fight.lost) this.dead = true;   // killed before you could act
    }
  }

  say(text, kind = 'info') { this.messages.push({ text, kind }); }

  spendLight(src) {
    const c = this.c;
    if (src === 'divine light') { c.flags.lightCharges--; this.say(`Your divine light glows on (${c.flags.lightCharges} more dark places).`); return; }
    const id = src === 'torch' ? 'torches' : src === 'lantern' ? 'oil' : 'ipad';
    const list = c.mundane.some((i) => i.id === id) ? 'mundane' : 'significant';
    const it = c[list].find((i) => i.id === id);
    it.tokens -= 1;
    this.say(`You light the way with your ${src}. (${itemName(id)}: ${it.tokens} left.)`);
    if (it.tokens <= 0) { c[list] = c[list].filter((x) => x !== it); this.say(`That was the last of your ${itemName(id).toLowerCase()}.`, 'bad'); }
  }

  rest() {
    const c = this.c;
    const h = rollExpr(this.rng, `${c.level}d4`);
    c.hp = Math.min(c.maxHp, c.hp + h); c.ap = maxAp(c); resetDay(c);
    this.say(`A night’s rest: +${h} HP, AP restored${magicType(c) ? ', spell slots renewed' : ''}.`, 'good');
  }

  /** Apply a list of effects. once = a key so loot is only collected the first time. */
  apply(effects, once = null) {
    const c = this.c;
    if (once) { if (c.flags[once]) return; c.flags[once] = true; }
    for (const e of [].concat(effects)) {
      if (e.if && !check(c, e.if).ok) continue;
      if (e.chance) { if (this.rng.chance(e.chance[0], e.chance[1])) this.apply(e.then || []); else if (e.otherwise) this.apply(e.otherwise); continue; }
      if (e.msg) this.say(e.msg, e.kind || 'info');
      if (e.sell) {
        if (!hasItem(c, e.sell.item)) continue;
        this.take(e.sell.item); c.gold += e.sell.gold; c.flags[`sold_${e.sell.item}`] = true;
        this.say(`${e.sell.text || `You sell the ${itemName(e.sell.item).toLowerCase()}`}: +${e.sell.gold}GP.`, 'good');
        continue;
      }
      if (e.add) { const [k, n] = e.add; c.flags[k] = (c.flags[k] || 0) + n; }
      if (e.goldPer) {   // { goldPer: ['counter', GP each], uncapped, text }: pay for every one of something
        const [k, each] = e.goldPer; const n = c.flags[k] || 0;
        if (n > 0) { const g = n * each; c.gold += g; this.say(`${e.text ? `${e.text}: ` : ''}+${g}GP.`, 'good'); }
        continue;
      }
      if (e.gold > 0 && e.uncapped) { c.gold += e.gold; this.say(`+${e.gold}GP.`, 'good'); }
      else if (e.gold > 0) {
        const room = goldRoom(c); const got = Math.min(room, e.gold);
        c.gold += got;
        this.say(`+${got}GP${got < e.gold ? ` (you can’t carry the other ${e.gold - got}GP: every 50GP takes a significant item slot)` : ''}.`, 'good');
      }
      if (e.gold < 0) { const lost = Math.min(c.gold, -e.gold); c.gold -= lost; this.say(`−${lost}GP.`, 'bad'); }
      if (e.item) this.give(e.item);
      if (e.lose) this.take(e.lose);
      if (e.damage) this.damage(rollExpr(this.rng, e.damage, { lvl: c.level }), e.from || 'That');
      if (e.heal) { const h = rollExpr(this.rng, e.heal, { lvl: c.level }) + (hasFeature(c, 'favoured') ? c.level : 0); c.hp = Math.min(c.maxHp, c.hp + h); this.say(`+${h} HP (${c.hp}/${c.maxHp}).`, 'good'); }
      if (e.flag) c.flags[e.flag] = true;
      if (e.unflag) delete c.flags[e.unflag];
      if (e.lightCharges) { c.flags.lightCharges = (c.flags.lightCharges || 0) + e.lightCharges; }
      if (e.spendSlot) c.slots[e.spendSlot] = false;
    }
  }

  give(id) {
    const c = this.c;
    const mundane = !!MUNDANE[id];
    const list = mundane ? c.mundane : c.significant;
    const limit = mundane ? MUNDANE_LIMIT : SIGNIFICANT_LIMIT;
    const size = mundane ? 1 : (SIGNIFICANT[id].slots || 1);
    let used = mundane ? list.length : itemSlots(c) + Math.ceil(c.gold / 50);
    // Coins are the easiest thing to leave behind: drop enough of them to make room for the item.
    if (!mundane && used + size > limit && itemSlots(c) + size <= limit) {
      const keep = (limit - itemSlots(c) - size) * 50;
      const dropped = c.gold - keep; c.gold = keep;
      this.say(`To make room, you leave ${dropped}GP behind.`, 'bad');
      used = itemSlots(c) + Math.ceil(c.gold / 50);
    }
    if (used + size > limit) { this.say(`No room for the ${itemName(id).toLowerCase()}: you’re carrying all you can.`, 'bad'); return false; }
    list.push(makeItem(id)); this.say(`You take the ${itemName(id).toLowerCase()}.`, 'good');
    return true;
  }
  take(id) {
    const c = this.c;
    for (const l of ['mundane', 'significant']) {
      const i = c[l].findIndex((x) => x.id === id);
      if (i >= 0) {
        const it = c[l][i];
        if (it.uses > 1) it.uses -= 1; else c[l].splice(i, 1);
        return true;
      }
    }
    return false;
  }

  damage(n, from) {
    const c = this.c;
    c.hp -= n;
    this.say(`${from} costs you ${n} HP (${Math.max(0, c.hp)}/${c.maxHp}).`, 'bad');
    if (c.hp <= 0) {
      const salve = c.significant.find((i) => i.id === 'salve');
      if (salve) { this.take('salve'); c.hp = 1; this.say('Bleeding out, you slap on your clotting salve. Back up on 1 HP.', 'good'); }
      else { c.hp = 0; this.dead = true; }
    }
  }

  /** Build the list of choices for the current section, with lock reasons. */
  choices() {
    const s = this.section(); const c = this.c;
    if (this.dead || s.end) return [];
    if (this.fight && !this.fight.over) return [];
    if (this.fight && this.fight.over) {
      if (this.fight.lost) return [];
      const to = this.fight.fled ? s.fight.flee.to : s.fight.win;
      return [{ i: 'fight', label: this.fight.fled ? 'Get away' : 'Carry on', to, num: this.number(to), ok: true }];
    }
    if (this.result) return [{ i: 'result', label: 'Carry on', to: this.result.to, num: this.number(this.result.to), ok: true }];
    return (s.choices || []).map((ch, i) => {
      if (ch.show && !check(c, ch.show).ok) return null;   // `show`: only listed when the condition holds
      const r = check(c, ch.cast ? { ...ch.if, spell: ch.cast } : ch.if);
      let to = ch.to;
      const num = to ? this.number(to) : null;
      return { i, label: ch.text, num, to, ok: r.ok, reason: r.reason, kind: ch.test ? 'test' : ch.cast ? 'cast' : ch.turn ? 'test' : 'go', detail: this.describeTest(ch) };
    }).filter(Boolean);
  }

  describeTest(ch) {
    const t = ch.test || (ch.cast && { stat: SPELLS[ch.cast].list === 'divine' ? 'Wis' : 'Int', dd: SPELLS[ch.cast].dd, skill: `cast:${SPELLS[ch.cast].list}` }) || (ch.turn && { stat: 'Wis', dd: ch.turn.dd, skill: 'cast:divine' });
    if (!t) return null;
    const dd = this.testDie(t);
    const skilled = this.testSkilled(t);
    const auto = (t.mods || []).some((m) => m.auto && check(this.c, m.if).ok) || (t.knowledge && hasFeature(this.c, 'canny'));
    if (auto) return 'automatic success';
    const listed = [].concat(t.skill || []).some((s) => isSkilled(this.c, s)) || (t.save && isSkilled(this.c, `save:${t.stat}`));
    const why = skilled && !listed && t.why ? ` (${t.why})` : '';
    return `${t.stat} ${this.c.stats[t.stat]} vs d20+d${dd}${skilled ? `, skilled${why}` : ''} — ${Math.round(100 * successChance(this.c.stats[t.stat], dd, skilled))}%`;
  }
  testDie(t) {
    let dd = t.dd;
    for (const m of t.mods || []) if (m.dd && check(this.c, m.if).ok) dd = m.dd;
    if (this.dark && !t.noDark) dd = Math.max(dd, DARK_DIE);
    if (armourPenalty(this.c)) dd = 20;
    return dd;
  }
  /** Skilled if any listed skill applies, if the character's profession justifies it (t.profs),
   *  or for a saving throw on a core or ancillary stat. */
  testSkilled(t) {
    const c = this.c;
    return [].concat(t.skill || []).some((s) => isSkilled(c, s))
      || (t.profs || []).includes(c.profession)
      || (!!t.save && isSkilled(c, `save:${t.stat}`));
  }

  /** Choose option i. Tests resolve immediately and leave a result to show before moving on. */
  choose(i, opts = {}) {
    const c = this.c;
    if (i === 'fight') return this.goto(this.fight.fled ? this.section().fight.flee.to : this.section().fight.win);
    if (i === 'result') return this.goto(this.result.to);
    const ch = this.section().choices[i];
    if (!check(c, ch.cast ? { ...ch.if, spell: ch.cast } : ch.if).ok) return;
    if (ch.effects) this.apply(ch.effects);
    if (this.dead) return;
    if (ch.test || ch.cast || ch.turn) return this.runTest(ch, opts);
    this.goto(ch.to);
  }

  runTest(ch, opts) {
    const c = this.c; const rng = this.rng;
    let t = ch.test, label = (ch.test && ch.test.label) || ch.text;
    if (ch.cast) { const sp = SPELLS[ch.cast]; t = { stat: sp.list === 'divine' ? 'Wis' : 'Int', dd: sp.dd, skill: `cast:${sp.list}` }; label = `Cast ${sp.name}`; }
    if (ch.turn) { t = { stat: 'Wis', dd: ch.turn.dd, skill: 'cast:divine' }; label = 'Turn undead'; }
    const lines = [];
    const auto = (t.mods || []).find((m) => m.auto && check(c, m.if).ok);
    if (auto) {
      lines.push(auto.text || 'No roll needed.');
      this.result = { lines, success: true, to: ch.pass };
      return;
    }
    if (t.knowledge && hasFeature(c, 'canny')) {
      lines.push('Canny: you automatically succeed in common knowledge tests.');
      this.result = { lines, success: true, to: ch.pass };
      return;
    }
    const dd = this.testDie(t);
    let skilled = this.testSkilled(t);
    if (!skilled && opts.versatile && hasFeature(c, 'versatile') && c.daily.versatile) { c.daily.versatile = false; skilled = true; lines.push('Versatile: once per day, you test as though skilled.'); }
    if (!skilled && opts.insight && ['Wis', 'Int'].includes(t.stat) && hasItem(c, 'insight')) { this.take('insight'); skilled = true; lines.push('You drink the elixir of insight, and roll as though skilled.'); }
    const roll = () => statTest(rng, { stat: c.stats[t.stat], dd, skilled, forceRoll: true });
    let r = roll();
    const show = (r) => r.rolls.map((x) => `${x.skill}+${x.ddRoll}=${x.total}`).join(' / ');
    lines.push(`${label || `${t.stat} test`}: ${t.stat} ${c.stats[t.stat]}${skilled ? ' (skilled)' : ''} vs d20+d${dd} → ${show(r)} ${r.critSuccess ? 'CRITICAL SUCCESS' : r.critFail ? 'CRITICAL FAILURE' : r.success ? 'success' : 'fail'}`);
    if (!r.success && t.save && hasFeature(c, 'rerollSave') && c.daily.reroll) {
      c.daily.reroll = false; r = roll();
      lines.push(`Lucky: you reroll the saving throw → ${show(r)} ${r.success ? 'success' : 'fail'}`);
    }
    let to = r.success ? ch.pass : ch.fail;
    if (ch.cast) {
      const sp = SPELLS[ch.cast];
      if (r.success && r.ddRoll >= 4) { c.slots[sp.lvl] = false; lines.push('You rolled 4 or more on the difficulty die: the spell slot is spent.'); }
      if (r.critFail) {
        if (sp.list === 'divine') lines.push(`Your god scorns you and casts ${OPPOSITE[ch.cast]} instead.`);
        else { const d = rng.die(4); lines.push(`Overwhelmed by ætheric currents, you take ${d} damage.`); this.damage(d, 'The backlash'); }
      }
    }
    if (ch.turn && r.success && c.alignment === 'chaos' && ch.chaos) to = ch.chaos;
    if (r.critFail && ch.critFail) to = ch.critFail;
    this.result = { lines, success: r.success, to };
  }

  // ----- fights
  fightActions() { return this.fight ? actions(this, this.fight) : []; }
  fightAct(a) { act(this, this.fight, a); if (this.fight.lost) this.dead = true; }

  // ----- adventure sheet actions outside fights
  canHeal() { const c = this.c; return !this.fight && hasItem(c, 'healerskit') && !c.daily.healed && c.hp < c.maxHp && !this.dead; }
  useHealersKit() {
    const c = this.c; if (!this.canHeal()) return null;
    c.daily.healed = true;
    const r = statTest(this.rng, { stat: c.stats.Wis, dd: 6, skilled: isSkilled(c, 'medicine'), forceRoll: true });
    const h = r.success ? 2 * c.level + (hasFeature(c, 'favoured') ? c.level : 0) : 0;
    c.hp = Math.min(c.maxHp, c.hp + h);
    return `Healer’s kit (d6 Wis test${isSkilled(c, 'medicine') ? ', skilled' : ''}): ${r.rolls.map((x) => `${x.skill}+${x.ddRoll}=${x.total}`).join(' / ')} — ${r.success ? `+${h} HP` : 'you only make it worse-looking'}. Once per day.`;
  }
  canDrink() { return !this.fight && hasItem(this.c, 'potion') && this.c.hp < this.c.maxHp && !this.dead; }
  drinkPotion() {
    const c = this.c; if (!this.canDrink()) return null;
    this.take('potion');
    const h = rollExpr(this.rng, '2d6') + (hasFeature(c, 'favoured') ? c.level : 0);
    c.hp = Math.min(c.maxHp, c.hp + h);
    return `You drink a healing potion: +${h} HP.`;
  }

  isOver() { return this.dead || !!this.section().end; }
  ending() { return this.dead ? 'death' : this.section().end || null; }

  save() { return JSON.stringify({ c: this.c, at: this.at, visits: this.visits, rng: this.rng.state, dark: this.dark, dead: !!this.dead, result: this.result, messages: this.messages }); }
  static load(adventure, json) {
    const d = JSON.parse(json);
    const g = new Game(adventure, 1);
    g.c = d.c; g.at = d.at; g.visits = d.visits; g.rng.state = d.rng; g.dark = d.dark; g.dead = d.dead; g.result = d.result || null; g.messages = d.messages || [];
    // A fight in progress restarts from the top of its section (a FF tradition: no saving mid-fight).
    const s = g.section();
    if (s.fight && !g.dead && !(s.fight.unless && check(g.c, s.fight.unless).ok)) g.fight = startFight(g, s.fight);
    return g;
  }
}
