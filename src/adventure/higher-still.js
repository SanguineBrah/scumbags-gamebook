// HIGHER STILL — Lord Longshanks built his spire into the clouds, and the clouds had people in. For a level 9–10 scumbag.
import { pastFlag, didAdventure } from '../engine/conditions.js';

export const META = {
  tier: 10, id: 'higher-still', title: 'Higher Still', levels: '9–10', final: 'down',
  blurb: 'Lord Longshanks kept building Highmore Spire until it went through the clouds. Up there he found a castle full of cloud giants, who are very tall indeed. He has not been seen since, and the giants are throwing his furniture at the town. His brother, Lord Shortshanks, will pay 500 gold to have him brought down. The giants have a golden harp, too, if you’re going anyway.',
};

const hound = { name: 'Cloud hound', lvl: 8, hp: 24, range: 'engaged', note: 'A giant’s dog, made of grey fog and teeth (24 HP)' };
const nimbus = { name: 'Lord Nimbus', lvl: 10, hp: 40, range: 'engaged', dmg: '2d10', note: 'A cloud giant, ninety feet tall (40 HP); fists like falling houses (2d10)' };

const REUNION = (c) => {
  const p = (f) => pastFlag(c, 'tall-order', f);
  if (p('sold_hat')) return 'Lord Shortshanks looks at you closely. “You’re the one who stole the Lofty Hat,” he says. “My brother described you very carefully. He has offered a reward for you for years.” He smiles. “I paid half of it. Best money I ever spent.”';
  if (p('sold_diary')) return '“I bought my brother’s diary, you know,” says Lord Shortshanks. “Five foot two. I had it read out at Christmas.” He sighs. “He’s still my brother.”';
  if (didAdventure(c, 'tall-order')) return '“You’ve been to the Spire before,” says Lord Shortshanks, looking at you shrewdly. “I can tell. You’ve got the look of somebody who’s been looked down on.”';
  return '';
};

export const SECTIONS = {
  start: {
    text: (c) => [
      'Highmore Spire no longer has a top. It goes up through the clouds and doesn’t come back. Every so often, something comes down out of the cloud: a wardrobe, a chaise longue, a portrait of Lord Longshanks forty feet high, which flattens a cow.',
      'Lord Shortshanks, the Lord’s younger brother, is six foot four, and has never let his brother forget it. He stands at the foot of the Spire with his hands behind his back.',
      REUNION(c),
      '“The giants have him,” he says. “Five hundred gold to bring him down. Alive. Mostly alive. He’s family.”',
    ].filter(Boolean),
    choices: [{ text: 'Start climbing', to: 'climb' }],
  },
  climb: {
    text: ['The scaffolding goes up three miles. Halfway, there’s a builders’ hoist, a platform on a rope and pulley, abandoned when the builders saw what was at the top. The rest is ladders, wind and wardrobes falling past.'],
    choices: [
      { text: 'Climb with your climbing gear', test: { stat: 'Str', dd: 6, skill: ['athletics'] }, pass: 'clouds', fail: 'climb_fall', if: { item: 'climbing' } },
      { text: 'Haul yourself up on the builders’ hoist', test: { stat: 'Str', dd: 10, skill: ['athletics', 'bruteforce'], mods: [{ if: { item: 'rope' }, dd: 6 }] }, pass: 'clouds', fail: 'climb_fall' },
      { text: 'Hammer in iron spikes as footholds where the ladders are missing', test: { stat: 'Str', dd: 8, skill: ['athletics'] }, pass: 'clouds', fail: 'climb_fall', if: { item: 'spikes' } },
      { text: 'Just climb', test: { stat: 'Str', dd: 12, skill: ['athletics'], profs: ['Woodcutter'], why: 'you climb for a living' }, pass: 'clouds', fail: 'climb_fall' },
    ],
  },
  climb_fall: {
    on: [{ damage: '3d6', from: 'The Spire' }],
    text: ['A falling sideboard takes you off a ladder a mile up. You land on scaffolding two hundred feet below, which is lucky, considering.'],
    choices: [{ text: 'Climb again', to: 'climb' }],
  },
  clouds: {
    text: (c) => [
      'You come up through the cloud into blinding sunshine. The cloud is solid, more or less, like walking on a mattress. Ahead stands a castle of white stone, so big that you can’t see the top of the door. Lord Longshanks’ unfinished spire sticks up through the cloud beside its moat, like a toothpick.',
      c.flags.houndGone ? '' : 'Between you and the door, a grey shape the size of a barn lifts its head out of the fog: a cloud hound, made of mist and teeth.',
    ].filter(Boolean),
    choices: [
      { text: 'Throw it your rations', to: 'hound_fed', if: { item: 'rations' }, show: { notFlag: 'houndGone' } },
      { text: 'Blow it away with your bellows', to: 'hound_blown', if: { item: 'bellows' }, show: { notFlag: 'houndGone' } },
      { text: 'Creep past it in the fog', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'], profs: ['Hunter'], why: 'you know how to stalk past a dog' }, pass: 'castle', fail: 'hound_fight', show: { notFlag: 'houndGone' } },
      { text: 'Cast Shroud and walk past it in your own darkness', cast: 'shroud', pass: 'castle', fail: 'hound_fight', show: { notFlag: 'houndGone' } },
      { text: 'Fight it', to: 'hound_fight', show: { notFlag: 'houndGone' } },
      { text: 'Go into the castle', to: 'castle', show: { flag: 'houndGone' } },
    ],
  },
  hound_fed: {
    on: [{ flag: 'houndGone' }, { lose: 'rations' }],
    text: ['The cloud hound sniffs your rations, eats them, and rolls over on its back to have its belly scratched, which is like scratching a fog bank. It doesn’t bother you again.'],
    choices: [{ text: 'Go into the castle', to: 'castle' }],
  },
  hound_blown: {
    on: [{ flag: 'houndGone' }],
    text: ['You pump your bellows at it. It is made of cloud. It comes apart in a long grey streamer and blows away over the castle wall, whimpering.'],
    choices: [{ text: 'Go into the castle', to: 'castle' }],
  },
  hound_fight: {
    text: ['The cloud hound comes at you out of the fog, all teeth.'],
    fight: { monsters: [hound], win: 'hound_down', flee: { to: 'climb', label: 'Drop back down through the cloud' } },
  },
  hound_down: {
    on: [{ flag: 'houndGone' }],
    text: ['The cloud hound comes apart into mist and drifts away, and you are alone in the sunshine.'],
    choices: [{ text: 'Go into the castle', to: 'castle' }],
  },
  castle: {
    text: (c) => [
      'You go under the door. The hall of the cloud giants is a valley with a roof. A fire burns in a hearth the size of a church. In an armchair by the fire, ninety feet tall, sleeps Lord Nimbus, cloud giant, with a newspaper over his face.',
      c.flags.longshanksFree ? 'Lord Longshanks is with you, clinging to your arm, very quiet.' : 'On the mantelpiece, in a birdcage, sits a small, furious man in an enormous coat: Lord Altimus Longshanks. Beside the cage, on a velvet cushion, a golden harp plays to itself, softly.',
    ],
    choices: [
      { text: 'Climb the mantelpiece', test: { stat: 'Str', dd: 10, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing', 'spikes'] }, dd: 6 }] }, pass: 'mantel', fail: 'mantel_fall', show: { notFlag: 'longshanksFree' } },
      { text: 'Throw your voice so the giant thinks someone’s at the door', cast: 'voice', pass: 'giant_out', fail: 'giant_wakes', show: { notFlag: 'giantOut' } },
      { text: 'Get out, with Lord Longshanks', to: 'escape', show: { flag: 'longshanksFree' } },
      { text: 'Give up and go back down', to: 'escape', show: { notFlag: 'longshanksFree' } },
    ],
  },
  giant_out: {
    on: [{ flag: 'giantOut' }],
    text: ['“Delivery,” says a voice at the door, in the general direction of the giant. Lord Nimbus snorts awake, puts down his newspaper, and goes to see, which takes a while, as the door is a quarter of a mile away.'],
    choices: [{ text: 'Climb the mantelpiece while he’s gone', to: 'mantel' }],
  },
  mantel_fall: {
    on: [{ damage: '2d6', from: 'The mantelpiece' }],
    text: ['You fall off the mantelpiece into the giant’s slipper. It is warm, and it smells terrible. In the armchair above you, Lord Nimbus stirs.'],
    choices: [{ text: 'Try again, very quietly', to: 'castle' }],
  },
  mantel: {
    text: (c) => [
      'On the mantelpiece, Lord Longshanks stands up in his birdcage, appalled to see you.',
      pastFlag(c, 'tall-order', 'sold_hat') ? '“YOU,” he says. “The hat thief. Of all the people.” He thinks about it. “Get me out, and I’ll drop the charges.”' : '“Get me out,” he hisses. “They feed me crumbs. They call me Tiny. TINY.”',
      'The birdcage has a little brass padlock on the door. The golden harp, on its cushion, has stopped playing, and is watching you.',
    ],
    choices: [
      { text: 'Pick the birdcage lock', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'freed', fail: 'harp_screams', if: { item: 'tools' } },
      { text: 'Melt the birdcage lock with acid', to: 'freed', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Bend the bars apart', test: { stat: 'Str', dd: 10, skill: ['bruteforce'], mods: [{ if: { item: 'prybar' }, dd: 6 }] }, pass: 'freed', fail: 'harp_screams' },
      { text: 'Steal the harp as well', to: 'harp', show: { notFlag: 'harp' } },
    ],
  },
  harp: {
    text: ['The golden harp sees your hand coming, and draws breath to scream. A singing harp makes a very loud scream.'],
    choices: [
      { text: 'Stuff your glue in its strings', to: 'harp_got', if: { item: 'glue' }, effects: [{ lose: 'glue' }] },
      { text: 'Wrap it in your tent before it can scream', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'harp_got', fail: 'harp_screams', if: { item: 'tent' } },
      { text: 'Grab it and hope', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'harp_got', fail: 'harp_screams' },
      { text: 'Leave it', to: 'mantel' },
    ],
  },
  harp_got: {
    on: [{ flag: 'harp' }, { item: 'harp', msg: 'The golden harp takes three significant item slots, and it hums sulkily.' }],
    text: ['The harp makes a muffled noise like a choir with its mouth full, and gives up. It’s yours.'],
    choices: [{ text: 'Back to the birdcage', to: 'mantel' }],
  },
  harp_screams: {
    text: ['The harp screams: a chord like every church bell in the world dropped down a well. In the armchair, Lord Nimbus sits up, and the newspaper slides off his face.'],
    choices: [{ text: 'Face him', to: 'giant_wakes' }],
  },
  freed: {
    on: [{ flag: 'longshanksFree' }],
    text: ['The birdcage door swings open. Lord Longshanks climbs out, brushes himself down, and looks up at the sleeping giant with an expression of profound personal grievance. “Ninety feet,” he says. “It isn’t fair.” He takes your arm.'],
    choices: [{ text: 'Get down and get out', to: 'escape' }],
  },
  giant_wakes: {
    text: ['Lord Nimbus looks down at you from ninety feet up, rubbing his eyes. “ANOTHER TINY,” he says, delighted, and reaches for you.'],
    choices: [
      { text: 'Tell him you’ve come to buy Lord Longshanks', test: { stat: 'Cha', dd: 10, skill: ['social', 'lying'], profs: ['Envoy'], why: 'you can deal with anybody' }, pass: 'bought', fail: 'giant_fight' },
      { text: 'Throw pocket sand in his eyes and run', to: 'escape', if: { item: 'pocketsand' }, effects: [{ lose: 'pocketsand' }] },
      { text: 'Fight him', to: 'giant_fight' },
      { text: 'Run', to: 'escape' },
    ],
  },
  bought: {
    on: [{ flag: 'longshanksFree' }, { flag: 'bought' }],
    text: ['Lord Nimbus considers your offer, and then Lord Longshanks, and then your offer. “HE IS VERY RUDE,” he says at last. “AND HE KEEPS MEASURING THINGS. TAKE HIM.” He opens the birdcage with one finger and drops the Lord into your arms. “NO CHARGE.”'],
    choices: [{ text: 'Get down and get out', to: 'escape' }],
  },
  giant_fight: {
    text: ['Lord Nimbus gets up out of his chair, which takes a while, and is very bad news.'],
    fight: {
      monsters: [nimbus], win: 'giant_down', flee: { to: 'escape', label: 'Run for the door' },
      special: [{ label: 'Throw caltrops under his bare feet', if: { item: 'caltrops' }, flag: 'caltropsGiant', text: 'A ninety-foot giant in his socks treads on your caltrops, hops, and sits down on his own fire.', dmg: '3d6', stun: 1 }],
    },
  },
  giant_down: {
    on: [{ flag: 'giantDown' }],
    text: ['Lord Nimbus sits down on the floor of his hall, very hard, and the whole castle shakes. Clouds fall off it. He looks at you, and decides you are not a tiny after all. “ALL RIGHT,” he says. “TAKE WHAT YOU WANT.”'],
    choices: [{ text: 'Back to the mantelpiece', to: 'mantel' }],
  },
  escape: {
    text: (c) => [
      c.flags.longshanksFree ? 'You run for the door with Lord Longshanks under one arm, and dive back down through the cloud onto the scaffolding.' : 'You run for the door, and dive back down through the cloud onto the scaffolding, alone.',
      c.flags.bought || c.flags.giantDown || c.flags.giantOut ? '' : 'Above you, a great hand comes down through the cloud, feeling for you along the scaffold.',
    ].filter(Boolean),
    choices: [
      { text: 'Hack through the top of the scaffolding behind you', test: { stat: 'Str', dd: 8, skill: ['bruteforce'], mods: [{ if: { anyItem: ['pick', 'prybar'] }, dd: 4 }] }, pass: 'down', fail: 'hand', show: { none: [{ flag: 'bought' }, { flag: 'giantDown' }, { flag: 'giantOut' }] } },
      { text: 'Slide down the hoist rope', test: { stat: 'Dex', dd: 8, save: true }, pass: 'down', fail: 'hand', show: { none: [{ flag: 'bought' }, { flag: 'giantDown' }, { flag: 'giantOut' }] } },
      { text: 'Climb down', to: 'down', show: { any: [{ flag: 'bought' }, { flag: 'giantDown' }, { flag: 'giantOut' }] } },
    ],
  },
  hand: {
    on: [{ damage: '3d6', from: 'A giant’s hand' }],
    text: ['The hand catches you a glancing blow that sends you halfway down the Spire, bouncing off scaffolding. But it doesn’t catch you. Above, the cloud closes, and a voice like thunder says “BOTHER.”'],
    choices: [{ text: 'Climb the rest of the way down', to: 'down' }],
  },
  down: {
    end: 'victory',
    on: [
      { if: { flag: 'longshanksFree' }, gold: 500, uncapped: true, msg: 'Lord Shortshanks pays 500GP, and doesn’t let his brother forget it.' },
      { sell: { item: 'harp', gold: 400, text: 'A music-loving duke buys the golden harp, sight unseen and sound very much heard' } },
    ],
    text: (c) => [
      c.flags.longshanksFree ? 'Lord Longshanks reaches the ground and kisses it, and then demands that the Spire be pulled down, immediately, all of it. It is. He spends the rest of his days in a bungalow.'
        : 'Lord Longshanks stays in the clouds, in his birdcage. The giants stop throwing his furniture, because they’ve run out, and start throwing the giants’ own, which is worse.',
      c.flags.sold_harp ? 'The golden harp sings for the duke every night, and every night it sings about you, and none of it is complimentary.' : '',
      `You come down from the clouds with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ].filter(Boolean),
  },
};

export const DEATH_TEXT = [
  'You fall three miles from the clouds. It takes a long time, and you have plenty of time to think about it. Lord Longshanks, watching from his birdcage, measures how far.',
  'Your adventure ends here.',
];
