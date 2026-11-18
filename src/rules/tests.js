// Stat tests: roll d20 (skill die) + difficulty die; succeed if the total is less than the stat.
// A 1 on the skill die is always a critical success, a 20 always a critical failure.
// Skilled tests roll twice and use the better result.

function single(rng, stat, dd, opts) {
  const skill = rng.die(20);
  const ddRoll = dd ? rng.die(dd) : 0;
  const total = skill + ddRoll + (opts.modifier || 0);
  const critLow = opts.critRange || 1;
  const critSuccess = skill <= critLow;
  const critFail = skill >= (opts.critFailFrom || 20);
  const success = critSuccess || (!critFail && total < stat);
  return { skill, ddRoll, total, success, critSuccess: critSuccess && success, critFail, dd };
}

// better of two results: success beats failure; crit success beats success; among successes the lower total
function better(a, b) {
  const score = (r) => (r.critSuccess ? 3 : r.success ? 2 : r.critFail ? 0 : 1);
  if (score(a) !== score(b)) return score(a) > score(b) ? a : b;
  return a.total <= b.total ? a : b;
}

/**
 * statTest(rng, { stat, dd, skilled, modifier, critRange, critFailFrom })
 * dd = 0 means trivial: no roll, automatic success (rulebook: "Trivial: No roll").
 */
export function statTest(rng, o) {
  if (!o.dd && !o.forceRoll) {
    return { success: true, critSuccess: false, critFail: false, trivial: true, total: 0, skill: 0, ddRoll: 0, dd: 0, rolls: [] };
  }
  const a = single(rng, o.stat, o.dd, o);
  if (!o.skilled) return { ...a, rolls: [a], skilled: false };
  const b = single(rng, o.stat, o.dd, o);
  return { ...better(a, b), rolls: [a, b], skilled: true };
}

// Short human-readable summary, e.g. "Str 12 vs d20+d8: 7+3=10 hit"
export function describeTest(label, stat, r) {
  if (r.trivial) return `${label}: trivial`;
  const show = (x) => `${x.skill}+${x.ddRoll}=${x.total}`;
  const rolls = r.rolls.map(show).join(r.skilled ? ' / ' : '');
  const tag = r.critSuccess ? 'CRITICAL!' : r.critFail ? 'CRITICAL FAIL' : r.success ? 'success' : 'fail';
  return `${label} ${stat} vs d20+d${r.dd}: ${rolls} ${tag}`;
}

// Probability helper used by tests/balancing: chance that d20 + dd < stat (no crits considered except 1/20).
export function successChance(stat, dd, skilled = false) {
  let ok = 0, n = 0;
  for (let s = 1; s <= 20; s++) for (let d = 1; d <= Math.max(dd, 1); d++) {
    const total = s + (dd ? d : 0);
    n++; if (s === 1 || (s !== 20 && total < stat)) ok++;
  }
  const p = ok / n;
  return skilled ? 1 - (1 - p) * (1 - p) : p;
}

// Contests (rulebook "Contests"): both test; if one succeeds they win; if both, highest total wins;
// otherwise (or tie) the instigator fails. A critical success beats any other result.
export function contest(rng, instigator, defender) {
  const a = statTest(rng, { ...instigator, forceRoll: true });
  const b = statTest(rng, { ...defender, forceRoll: true });
  let winner = 'defender';
  if (a.critSuccess && !b.critSuccess) winner = 'instigator';
  else if (b.critSuccess && !a.critSuccess) winner = 'defender';
  else if (a.success && !b.success) winner = 'instigator';
  else if (a.success && b.success && a.total > b.total) winner = 'instigator';
  return { winner, a, b };
}
