// HEADS YOU LOSE — get a hydra out of a town's reservoir. For a level 8–9 scumbag.
// Cut off a head and two grow back, unless the stump is burnt: the hydra regenerates until `cauterised` is set.

export const META = {
  tier: 9, id: 'heads-you-lose', title: 'Heads You Lose', levels: '8–9', final: 'council',
  blurb: 'A hydra has moved into the reservoir above Floodmouth. It started with five heads. Then the town guard had a go at it, and now it has eleven. The water tastes of hydra, and the heads argue all night. The town council will pay 500 gold to anyone who can get rid of it, provided they don’t make it any bigger.',
};

const hydra = { name: 'The hydra', lvl: 8, hp: 28, range: 'engaged', regen: 3, regenStop: 'cauterised', note: 'Eleven heads (28 HP); grows back 3 HP a round unless the stumps are burnt' };

export const SECTIONS = {
  start: {
    text: [
      'The mayor of Floodmouth meets you at the foot of the reservoir dam, with the town guard, all of whom have bandages. “Five heads,” he says. “It had five heads. Sergeant Bodge cut one off. It grew two. So he cut those off.” He points up at the dam. Something on the far side is singing, in eleven voices, none of them in tune. “Don’t cut anything off.”',
      'The reservoir lies behind the dam, with a sluice house at one end, and a boathouse at the other. A path runs round the top.',
    ],
    choices: [
      { text: 'Climb up to the top of the dam and have a look', to: 'dam' },
      { text: 'Talk to Sergeant Bodge', to: 'bodge', show: { notFlag: 'bodgeTalked' } },
    ],
  },
  bodge: {
    on: [{ flag: 'bodgeTalked' }, { flag: 'knowsFire' }],
    text: ['Sergeant Bodge has his arm in a sling and his pride in pieces. “Every time I cut one off, two came back,” he says. “Except the one I cut off near the brazier. That stump fell in the coals, and it never grew back at all.” He thinks. “And they don’t like each other. The heads. You should hear them. Arguing all night about who’s in charge.”'],
    choices: [{ text: 'Climb up to the dam', to: 'dam' }],
  },
  dam: {
    text: (c) => [
      'From the top of the dam, you can see it: a great green bulk in the middle of the reservoir, and eleven long necks rising out of the water like reeds, each with a head on, each head with a different expression. Two are singing. Three are arguing. One is reading a book somebody dropped. The rest are asleep, or pretending to be.',
      c.flags.drained ? 'The reservoir is half empty, and the hydra is stranded in the mud at the bottom, furious.' : '',
      c.flags.quarrel ? 'The heads are tangled in a furious knot, all eleven of them, and the body is going round in circles.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Go to the sluice house', to: 'sluice', show: { notFlag: 'drained' } },
      { text: 'Go to the boathouse', to: 'boathouse', show: { notFlag: 'boatDone' } },
      { text: 'Shout up to the heads and start an argument', test: { stat: 'Cha', dd: 10, skill: ['social', 'lying'], profs: ['Envoy'], why: 'divide and rule is your trade' }, pass: 'quarrel', fail: 'heads_notice', show: { notFlag: 'quarrel' } },
      { text: 'Talk to the head that’s reading', to: 'reader', show: { notFlag: 'readerTalked' } },
      { text: 'Cast Pollute on the reservoir, and then set it alight', cast: 'pollute', pass: 'oil_lake', fail: 'heads_notice', critFail: 'holy_lake', if: { fire: true }, show: { notFlag: 'cauterised' } },
      { text: 'Go down and fight it', to: 'hydra_fight' },
      { text: 'Cast Fireball at the heads from the top of the dam', cast: 'fireball', pass: 'fireballed', fail: 'heads_notice', show: { notFlag: 'cauterised' } },
      { text: 'Cast Hellfire on the water where it lies', cast: 'hellfire', pass: 'hellfired', fail: 'heads_notice', critFail: 'hydra_sanctuary', show: { notFlag: 'cauterised' } },
      { text: 'Cast Humble on the hydra, then go down and fight it', cast: 'humble', pass: 'hydra_small', fail: 'heads_notice', critFail: 'hydra_big' },
      { text: 'Go down and finish it', to: 'hydra_weak', show: { any: [{ flag: 'drained' }, { flag: 'quarrel' }] } },
      { text: 'Give up and report to the council', to: 'council' },
    ],
  },
  reader: {
    on: [{ flag: 'readerTalked' }],
    text: ['The reading head looks up from its book, which is a collection of sonnets, and sighs. “I didn’t ask for the others,” it says. “I was the original. One of five. Now I share a neck with a head that thinks it’s funny to sing sea shanties at three in the morning.” It looks at you with great sad eyes. “If you could see your way to getting rid of the rest of them, I would go quietly. I’d go to the sea. I just want to read.”'],
    choices: [
      { text: 'Agree to help it', to: 'dam', effects: [{ flag: 'readerDeal' }] },
      { text: 'Give it your quill, and suggest it write its own poems', to: 'poet', if: { item: 'quill' } },
      { text: 'Back to the dam', to: 'dam' },
    ],
  },
  poet: {
    on: [{ flag: 'poet' }, { lose: 'quill' }],
    text: ['The reading head takes your quill in its teeth, very delicately, and begins to write on the flyleaf of its book. All around it, the other ten heads stop arguing to read over its shoulder. One by one, they start to suggest rhymes. Within an hour, all eleven heads are writing a poem together, and arguing about the second verse, quietly.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  quarrel: {
    on: [{ flag: 'quarrel' }],
    text: ['You shout up that the head on the left says it’s in charge. The head on the left says it never said that. The head on the right says it did. Within a minute, all eleven heads are arguing, and then biting, and then tying themselves in a knot, and the great body underneath goes round and round in circles, splashing.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  heads_notice: {
    text: ['All eleven heads turn and look at you at once. It is very unpleasant. One of them spits.'],
    on: [{ damage: '2d6', from: 'Hydra spit' }],
    choices: [{ text: 'Back off along the dam', to: 'dam' }],
  },
  sluice: {
    text: ['The sluice house holds the gates that let water out of the reservoir into the river. A great iron wheel works them. It hasn’t been turned in years, and the hydra has been sleeping on the gates.'],
    choices: [
      { text: 'Turn the wheel', test: { stat: 'Str', dd: 10, skill: ['bruteforce'], mods: [{ if: { anyItem: ['prybar', 'pick'] }, dd: 6 }, { if: { item: 'oil' }, dd: 6 }] }, pass: 'drain', fail: 'wheel_stuck' },
      { text: 'Cast Telekinesis on the wheel', cast: 'telekinesis', pass: 'drain', fail: 'wheel_stuck' },
      { text: 'Dig out the old overflow channel with your shovel', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'drain', fail: 'wheel_stuck', if: { anyItem: ['shovel', 'pick'] } },
      { text: 'Back to the dam', to: 'dam' },
    ],
  },
  wheel_stuck: {
    on: [{ damage: 'd6', from: 'The wheel' }],
    text: ['The wheel doesn’t move. Your shoulder does, in a direction it wasn’t designed for.'],
    choices: [{ text: 'Try again', to: 'sluice' }],
  },
  drain: {
    on: [{ flag: 'drained' }],
    text: ['With a groan, the sluice gates open, and half the reservoir goes thundering down into the river. The hydra wakes up in a hurry, in the mud, without enough water to swim in, and lies there flapping, eleven heads shouting at once.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  boathouse: {
    text: ['The boathouse holds a rowing boat, oars, and the town’s supply of lamp oil for the dam lights: six barrels of it.'],
    choices: [
      { text: 'Load the boat with oil, row it out, and set it alight', to: 'fireship', if: { fire: true } },
      { text: 'Take a barrel of oil for later', to: 'barrel', show: { notFlag: 'barrel' } },
      { text: 'Back to the dam', to: 'dam' },
    ],
  },
  barrel: {
    on: [{ flag: 'barrel' }],
    text: ['You roll a barrel of lamp oil out of the boathouse. It’s heavy, but a barrel of oil and something to light it with seems likely to be useful against something that grows back.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  oil_lake: {
    on: [{ flag: 'cauterised' }, { flag: 'drained' }],
    text: ['The reservoir turns black and thick and smells of lamps. The hydra’s heads all stop arguing at once, and look at the water, and then at you, holding a light. You throw it. The whole reservoir goes up. When the smoke clears, the hydra is lying in the burnt mud at the bottom, singed all over, every stump black. Nothing on it will grow back now.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  fireship: {
    on: [{ flag: 'boatDone' }, { flag: 'cauterised' }],
    text: ['You load the boat with oil, row it out towards the hydra, light it and dive over the side. The heads watch the burning boat come, interested, and then very interested. It hits the body, and the whole reservoir lights up. The hydra screams in eleven voices. Every head that burns, stays burnt.'],
    choices: [{ text: 'Swim back to the dam', to: 'dam' }],
  },
  hydra_fight: {
    text: (c) => [c.flags.cauterised ? 'The hydra, scorched and smoking, comes up out of the water at you with every head it has left.' : 'The hydra comes up out of the water at you, eleven heads at once.'],
    fight: { key: 'hydra', outdoors: true,
      monsters: [hydra], win: 'hydra_dead', flee: { to: 'dam', label: 'Run back up the dam' },
      special: [
        { label: 'Burn the stumps as you cut', if: { fire: true }, flag: 'cauterised', text: 'You press fire to the stump of a head. It hisses, blackens, and doesn’t grow back.' },
        { label: 'Throw a barrel of oil over it and light it', if: { flag: 'barrel' }, flag: 'barrelUsed', text: 'The oil goes up in a sheet of flame. Heads shriek. Stumps blacken.', dmg: '4d6' },
      ],
    },
  },
  hydra_weak: {
    text: (c) => [c.flags.drained ? 'You go down into the mud after it. The hydra, stranded, slow and furious, turns every head it has on you.' : 'You go down to the water’s edge. The hydra is so tangled up in itself that it can only spare three heads to fight you.'],
    fight: { key: 'hydra', outdoors: true,
      monsters: [{ ...hydra, hp: 20, regen: 2, note: 'Weakened hydra (20 HP); grows back 2 HP a round unless the stumps are burnt' }], win: 'hydra_dead', flee: { to: 'dam', label: 'Back off' },
      special: [{ label: 'Burn the stumps as you cut', if: { fire: true }, flag: 'cauterised', text: 'You press fire to a stump. It hisses, and doesn’t grow back.' }],
    },
  },
  hydra_dead: {
    on: [{ flag: 'hydraDead' }],
    text: (c) => [c.flags.readerDeal
      ? 'The hydra goes still. All but one head: the reader, which looks at the others, and at you, and bites through its own neck with great dignity. It slithers off down the river towards the sea, with its book.'
      : 'The hydra sinks into the reservoir, and doesn’t come up. Eleven heads. Nobody counts the stumps.'],
    choices: [{ text: 'Report to the council', to: 'council' }],
  },
  council: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'hydraDead' }, { flag: 'poet' }] }, gold: 500, uncapped: true, msg: 'The town council pays 500GP.' },
    ],
    text: (c) => [
      c.flags.poet ? 'The hydra stays in the reservoir. But it’s quiet now, and it publishes a collection of poems called ELEVEN VOICES, which sells very well. The council decides it’s a tourist attraction, and pays you anyway. The water still tastes of hydra.'
        : c.flags.hydraDead ? `Floodmouth celebrates with a feast and a firework, carefully. ${c.flags.readerDeal ? 'Years later, sailors tell stories of a sea serpent with one head that reads aloud to them in storms.' : 'The reservoir is drained, cleaned and refilled, and the water stops tasting of hydra by the spring.'}`
          : 'The hydra is still in the reservoir. The council doesn’t pay you. On calm nights, you can hear eleven voices singing all the way down in Floodmouth.',
      `You leave Floodmouth with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  holy_lake: {
    text: ['Your god scorns you. Instead of oil, the reservoir turns to holy water, faintly glowing. The hydra dips all eleven heads and drinks deeply, and comes up shining, refreshed, and looking at you.'],
    choices: [{ text: 'Back off along the dam', to: 'heads_notice' }],
  },
  fireballed: {
    on: [{ flag: 'cauterised' }],
    text: ['A bead of fire floats down from the dam towards the heads, which watch it come with great interest, all eleven of them leaning together for a better look. It blooms. When the smoke clears, every stump on the hydra is black and sealed, and the heads that are left are arguing about whose idea it was to look.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  hellfired: {
    on: [{ flag: 'cauterised' }],
    text: ['The water round the hydra bursts into flame and goes on burning, which water shouldn’t. The hydra thrashes in it for a long time. When the fire goes out, it lies in the shallows, steaming, every stump seared shut.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  hydra_sanctuary: {
    text: ['Your god scorns you. Instead of fire, shining walls of law rise round the hydra, and it settles down inside them for a nap, perfectly safe. The heads look out at you through the walls, smug, all eleven of them.'],
    choices: [{ text: 'Back to the dam', to: 'dam' }],
  },
  hydra_small: {
    text: ['The hydra shrinks to a quarter of its size, which is still the size of a cart horse, with eleven heads the size of a dog’s. They look at each other in alarm. You go down to the water’s edge to meet them.'],
    fight: { key: 'hydra', monsters: [{ ...hydra, hp: 10, regen: 1, note: 'A shrunken hydra (10 HP); grows back 1 HP a round unless the stumps are burnt' }], win: 'hydra_dead', flee: { to: 'dam', label: 'Run back up the dam' }, outdoors: true },
  },
  hydra_big: {
    text: ['Your god scorns you. Instead of shrinking, the hydra grows to twice its size. The reservoir is suddenly much too small for it. It climbs out.'],
    choices: [{ text: 'Brace yourself', to: 'hydra_fight' }],
  },
};

export const DEATH_TEXT = [
  'You die in the reservoir at Floodmouth. The hydra’s heads argue for a week about which of them did it.',
  'Your adventure ends here.',
];
