// A scumbag's career, written up when they retire: a line for every job, from what they did in it.
import { ADVENTURES } from './index.js';

// One line per adventure, from the flags it ended with. p(flag) reads them; n(flag) reads counters.
const LINES = {
  'death-and-taxes': (p) => p('vaneServes') ? 'You robbed a dead moneylender’s vault, and kept the moneylender.'
    : p('vaneTurned') ? 'You chased a dead moneylender out of his own vault with a holy symbol.'
      : p('vaneGone') ? 'You closed a dead moneylender’s books for him, and helped yourself to the vault.'
        : 'You got out of a dead moneylender’s counting house alive, which is more than he managed.',
  'tall-order': (p) => p('sold_hat') ? 'You stole a lord’s Lofty Hat at his own birthday party, on stilts.' : 'You went to a lord’s birthday party on stilts, and came away with a tab.',
  'fortunes-fang': (p, n) => p('countDead') ? 'You put a vampire’s casino out of business, permanently.'
    : p('banked') ? 'You broke the bank at a vampire’s casino, and let him find out in the morning.'
      : n('hour') >= 4 ? 'You kept a vampire up past his bedtime.' : 'You played at a vampire’s casino and left with your neck.',
  'mothers-kitchen': (p) => p('sold_turnip') ? 'You stole a golden turnip back out of a giant’s kitchen.' : 'You crossed a giant’s kitchen, and came back without the turnip.',
  'eviction-notice': (p) => p('kobsLeave') ? 'You rehoused thirty kobolds in a dead moneylender’s counting house.'
    : p('kobsStay') ? 'You took the kobolds’ side, and the landlord never paid you.'
      : p('burnt') ? 'You burnt down a kobold siege-pyramid, for a fee.'
        : p('kobsBeaten') ? 'You evicted a kobold siege-pyramid by force.' : 'You failed to evict a kobold siege-pyramid.',
  'last-ride': (p) => p('gloriousDeath') || (p('dead') && p('propped')) ? 'You gave an old knight the glorious death his pension required.'
    : p('dead') ? 'You let an old knight die in his bed, which the Pension Office would not pay for.' : 'You kept an old knight alive, out of spite, mostly his.',
  'invisible-menagerie': (p) => p('egg') ? 'You stole an egg nobody could see, for a collector who couldn’t see it either.' : 'You went to the Invisible Menagerie, and saw nothing.',
  unsolved: (p) => p('solved') || p('midTurn') ? 'You solved a murderous puzzle box that had beaten every professor.'
    : p('cubeBroken') ? 'You broke a murderous puzzle box instead of solving it. It is a lectern now.' : 'You failed to solve a murderous puzzle box.',
  'torches-and-pitchforks': (p) => p('delivered') ? 'You walked a landlord across a moor full of the ghosts of his tenants.'
    : p('betrayed') ? 'You handed a landlord over to the ghosts of his tenants.' : 'You left a landlord to the mob.',
  'standard-dragon': (p) => p('wished') ? 'You made a dragon disappear, officially.'
    : p('retired') ? 'You talked a dragon into retirement. It sends postcards.'
      : p('dragonDead') ? 'You slew a dragon. The statue looks nothing like you.' : 'You went up a mountain after a dragon.',
  'legging-it': (p, n) => n('boots') ? `You rounded up ${n('boots')} pair${n('boots') === 1 ? '' : 's'} of runaway legs.` : 'You chased runaway legs round a fair, and caught none.',
  'bath-night': (p) => p('clean') ? 'You bathed a lord who hadn’t washed since he was a boy.'
    : p('halfClean') ? 'You half-washed a lord, which was enough to get him married.'
      : p('moated') ? 'You threw a filthy lord in his own moat. It didn’t help.' : 'You failed to get a lord into the bath.',
  'wrong-way-round': (p) => p('nevilleWon') ? 'You helped a pantomime horse win a race, the wrong way round.' : 'You saw to it that the favourite won a horse race.',
  'now-you-see-him': (p, n) => p('biscuit') && n('time') < 4 ? 'You brought a blink dog back in time to win Best in Show.'
    : p('grudgeDeal') ? 'You took a bribe to lose a duke’s dog.' : 'You lost a duke’s dog, which is easy with a blink dog.',
  'vow-of-silence': (p) => p('recipe') ? 'You stole a secret recipe from monks who couldn’t shout for help.' : 'You visited a silent monastery, and kept quiet about it.',
  knightmare: (p) => p('retired') ? 'You retired a haunted warhorse to an almshouse garden.'
    : p('beaten') ? 'You beat a haunted warhorse at the joust.' : p('horseDown') || p('roped') ? 'You brought down a haunted warhorse.' : 'You lost a joust to a horse.',
  'splitting-heirs': (p) => p('cured') ? 'You put a professor back together out of thirty.'
    : p('found') ? 'You found the real professor among thirty copies. He was a blob.'
      : p('noGlibb') ? 'You left no professor at all, and the nephew inherited.' : 'You left thirty professors arguing about the slippers.',
  'going-bananas': (p) => p('saved') ? 'You saved a banana golem, and the greengrocers’ charter.'
    : p('dragged') ? 'You tied a banana golem to a lamp post.' : p('golemDead') ? 'You destroyed a banana golem. There was custard.' : 'You let a banana golem loose on a festival.',
  detention: (p) => p('mumDone') ? 'You sent a baker to sort out five delinquent wizards, and she did.'
    : p('surrendered') ? 'You got a stolen grimoire back from five delinquent wizards.'
      : p('grimoireSold') ? 'You sold a stolen grimoire, and a school closed.' : 'You failed to get a grimoire back.',
  'out-of-the-cot': (p) => p('sold') ? 'You sold a giant’s baby to a menagerie.'
    : p('trampled') ? 'You got a giant baby home, through most of a town.'
      : p('delivered') ? 'You took a giant baby home to its mother.' : 'You left a giant baby sitting in a town square.',
  'taking-the-waters': (p) => p('blobGone') ? 'You got the monster out of the Royal Spa.'
    : p('drained') || p('dropped') || p('salted') || p('polluted') ? 'You shrank a spa’s monster to the size of a sulky dog.' : 'You left a monster in the Royal Spa. The Duchess loved it.',
  'trial-by-ducking': (p) => p('exposed') ? 'You ran a witchfinder out of a village.'
    : p('miracle') ? 'You got an old woman declared a saint.'
      : p('nanFree') ? 'You smuggled an old woman away from a ducking.'
        : p('jammed') ? 'You sabotaged a ducking stool.' : p('gallDown') ? 'You put a witchfinder in his own pond.' : 'You watched them duck an old woman.',
  'more-taxes': (p) => p('struckOut') ? 'You broke into the Royal Exchequer and erased yourself from the Great Ledger.'
    : p('settled') ? 'You broke into the Royal Exchequer, and came out on a payment plan.' : 'You broke into the Royal Exchequer. Your name is still in the Great Ledger.',
  'clockwork-cathedral': (p) => p('zombieEzra') ? 'You raised a dead clockmaker to mend a mechanical bishop.'
    : p('ezra') ? 'You brought a clockmaker back from the dead to mend a mechanical bishop.'
      : p('fixed') ? 'You mended a mechanical bishop.'
        : p('woundDown') ? 'You let a mechanical bishop run down.' : p('spiked') ? 'You stopped a mechanical bishop with a spike.'
          : p('smashed') ? 'You smashed a mechanical bishop to scrap.' : 'You were excommunicated by a clock.',
  'leaving-do': (p) => p('vexWon') ? 'You helped a young necromancer become the new Dark Lord.'
    : p('sold_phylactery') ? 'You stole a lich’s soul at his own leaving do, and sold it.'
      : p('oath') ? 'You made a lich swear off conquering.' : 'You waited tables at a Dark Lord’s leaving do.',
  'heads-you-lose': (p) => p('poet') ? 'You turned an eleven-headed hydra into a poet.' : p('hydraDead') ? 'You killed an eleven-headed hydra.' : 'You left a hydra in a reservoir.',
  'death-takes-a-holiday': (p) => p('returned') ? 'You found Death’s stolen scythe, and gave it back.'
    : p('soldScythe') ? 'You found Death’s stolen scythe, and sold it to a necromancer.' : 'You went looking for Death’s scythe.',
  'higher-still': (p) => p('longshanksFree') ? 'You rescued a lord from giants in the clouds.' : 'You climbed into the clouds, and left a lord in a birdcage.',
};

// How it ended, from the finale's flags; or a plain retirement from the town.
const ENDING = (p) => p('immortal') ? 'Wished never to die, and didn’t. Still pays tax.'
  : p('auditedDeath') ? 'Set the taxman on Death, and walked out while they were busy.'
    : p('partied') ? 'Took Death and the taxman to a kobold party. Death danced.'
      : p('deferred') ? 'Asked Death for more time, and got it, for services rendered.'
        : p('bargained') ? 'Talked Death into twenty more years.'
          : p('cards') ? 'Beat Death at cards.'
            : p('vaneTaken') ? 'Sent a dead moneylender to Death in their place. One’s one.'
              : p('beatDeath') ? 'Beat Death in a fair fight. Nobody believes it.'
                : 'Ran from Death for forty years.';

/** The write-up: a heading, how it ended, and a line for each job in the order they were done. */
export function careerWriteUp(c, how) {
  const past = c.past || {};
  const lines = (c.done || []).filter((id) => LINES[id]).map((id) => {
    const f = past[id] || {};
    return LINES[id]((k) => !!f[k], (k) => f[k] || 0);
  });
  const fin = past['final-demand'] || {};
  const ending = how === 'finale' ? ENDING((k) => !!fin[k])
    : how === 'died' ? 'Went with Death at midnight, under Gallows Hill, where it all began.'
      : 'Retired from scumbaggery before anything could stop them.';
  const titles = (c.done || []).length;
  return {
    name: c.name,
    title: `Level ${c.level} ${c.quality ? `${c.quality.toLowerCase()} ` : ''}${c.profession.toLowerCase()}`,
    ending,
    lines,
    tally: `${titles} job${titles === 1 ? '' : 's'} of ${ADVENTURES.length}. ${c.wasted ? `${c.wasted}GP squandered on pointless endeavours.` : 'Nothing squandered, somehow.'} ${how === 'died' ? 'Died' : 'Retired'} with ${c.gold}GP.`,
    died: how === 'died',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
