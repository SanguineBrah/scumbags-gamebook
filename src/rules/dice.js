// Dice and random numbers. All randomness goes through an Rng so games can be seeded and replayed.

export class Rng {
  constructor(seed = (Date.now() ^ 0x5bd1e995) >>> 0) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }
  // mulberry32
  next() {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  die(sides) { return sides > 0 ? this.int(1, sides) : 0; }
  roll(n, sides) { let t = 0; for (let i = 0; i < n; i++) t += this.die(sides); return t; }
  chance(inN, outOf) { return this.die(outOf) <= inN; } // e.g. chance(1, 6) = "1/6 chance"
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
}

// Parse and roll dice notation such as "d8", "2d6+1", "3d8+lvl" (lvl substituted by caller).
export function rollExpr(rng, expr, vars = {}) {
  let total = 0;
  const parts = String(expr).replace(/\s+/g, '').replace(/-/g, '+-').split('+').filter(Boolean);
  for (let p of parts) {
    let sign = 1;
    if (p.startsWith('-')) { sign = -1; p = p.slice(1); }
    const m = p.match(/^(\d*)d(\d+)$/);
    if (m) total += sign * rng.roll(m[1] ? +m[1] : 1, +m[2]);
    else if (p in vars) total += sign * vars[p];
    else total += sign * (+p || 0);
  }
  return total;
}

export const dieName = (sides) => (sides ? `d${sides}` : 'none');
