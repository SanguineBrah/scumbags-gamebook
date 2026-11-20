// LEGGING IT — round up forty pairs of animated legs that walked out of a cobbler's shop. For a level 1–2 scumbag.
// The `boots` counter is how many pairs you've brought back; Welt pays 15GP a pair, and 250 for the seven-league boots.
import { didAdventure } from '../engine/conditions.js';

export const META = {
  tier: 2, id: 'legging-it', title: 'Legging It', levels: '1–2', final: 'welt_pays',
  blurb: 'Mr Welt the cobbler hired a hedge-wizard to animate a pair of legs, to break in new boots. The hedge-wizard was generous. Forty pairs of legs walked out of the shop this morning, wearing the whole season’s stock, and one of them is wearing the mayor’s seven-league boots. Welt will pay for every pair you bring back.',
};

const legs = { name: 'Animated legs', plural: true, lvl: 1, hp: 4, range: 'engaged', feats: ['relentless'], note: 'Relentless (get back up unless burned or pulped); kick like a mule; ticklish' };
const BOOTS = (n = 1) => ({ add: ['boots', n] });

export const SECTIONS = {
  start: {
    on: [{ gold: 20, msg: 'Welt pays you 20GP up front, in very small coins, counted twice.' }], onceOnly: true,
    text: [
      'Mr Welt’s shop in Little Hobbling smells of leather and despair. Every shelf is empty. A trail of muddy footprints, no two the same size, leads out of the door and down the lane towards the village green, where today is the Hobbling Fair.',
      '“Forty pairs,” says Welt, wringing his hands. “The whole season. And the seven-league boots, the mayor’s, for the race this afternoon.” He shudders. “Fifteen gold a pair, brought back. Two hundred and fifty for the seven-leaguers. The hedge-wizard who did it is drinking in the Hobbling Arms, if you want to complain to him. I have.”',
    ],
    choices: [
      { text: 'Go to the fair', to: 'fair' },
      { text: 'Find the hedge-wizard in the Hobbling Arms', to: 'pub' },
    ],
  },
  pub: {
    on: [{ flag: 'snoadClue' }],
    text: (c) => c.flags.snoadTalked
      ? ['Snoad the hedge-wizard is still under his table in the Hobbling Arms, with his pint. He waves at you with his feet, which he keeps a close eye on now.']
      : [`The Hobbling Arms is empty except for a man under a table, holding his pint above his head to keep it out of reach of his own feet. ${didAdventure(c, 'going-bananas') ? 'It’s Snoad, the banana man from Pippin-on-Wye, warts, beard and all. He sees you, and groans.' : 'This is Snoad, hedge-wizard, warts, beard and all.'} “Are they still out there?” he whispers. “I only meant one pair. I said the spell forty times. I was nervous.”`],
    choices: [
      { text: 'Ask him how to stop them', test: { stat: 'Cha', dd: 6, skill: ['social', 'arcana'], profs: ['Sorcerer', 'Alchemist'], why: 'one spellcaster to another' }, pass: 'snoad_tells', fail: 'snoad_mumbles', show: { notFlag: 'snoadTalked' } },
      { text: 'Buy him a drink first (2GP)', to: 'snoad_tells', if: { gold: 2 }, effects: [{ gold: -2 }], show: { notFlag: 'snoadTalked' } },
      { text: 'Wave your smelling salts under his nose', to: 'snoad_tells', if: { item: 'salts' }, show: { notFlag: 'snoadTalked' } },
      { text: 'Go to the fair', to: 'fair' },
    ],
  },
  snoad_mumbles: {
    text: ['Snoad mumbles into his pint about feet, and nerves, and his mother. You learn nothing, except that he has a mother, and that she was right about him.'],
    choices: [{ text: 'Try again', to: 'pub' }, { text: 'Go to the fair', to: 'fair' }],
  },
  snoad_tells: {
    on: [{ flag: 'snoadTalked' }, { flag: 'knowsLaces' }],
    text: ['Snoad sits up and hits his head on the table. “The spell’s in the boots,” he says. “Not the legs. Get the boots off and the legs just sit down and go back to being legs. Unlace them, mind, don’t pull. And they’re ticklish. Terribly ticklish. I made them ticklish so I could stop them, and then I forgot.”'],
    choices: [{ text: 'Go to the fair', to: 'fair' }, { text: 'Leave him to it', to: 'fair' }],
  },
  fair: {
    text: (c) => [
      'The Hobbling Fair is chaos. Legs are everywhere: running the egg-and-spoon race without the egg, kicking down the coconut shy, high-stepping round the maypole and tangling the ribbons. Villagers stand on tables, holding their skirts. A cattle pen stands empty at the edge of the green, next to the mill pond.',
      c.flags.penned ? 'The legs you rounded up are standing in the cattle pen, shuffling, and the fair is calmer.' : '',
      c.flags.leaderGone ? 'The seven-league boots are safely in your pack.' : 'Every few seconds, something goes past in a blur and a gust of wind: a pair of legs in shining boots, lapping the whole village in a single stride.',
      ['You haven’t recovered any boots yet.', 'You’ve recovered one pair of boots.'][c.flags.boots || 0] || `You’ve recovered ${c.flags.boots} pairs of boots.`,
    ].filter(Boolean),
    choices: [
      { text: 'Scatter caltrops across the green', to: 'caltrops', if: { item: 'caltrops' }, show: { notFlag: 'penned' } },
      { text: 'Pour a ring of glue round the maypole', to: 'glued', if: { item: 'glue' }, show: { notFlag: 'glued' } },
      { text: 'Herd them into the cattle pen', test: { stat: 'Wis', dd: 8, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you’ve herded worse', mods: [{ if: { anyItem: ['rope', 'pole', 'whistle'] }, dd: 4 }] }, pass: 'penned', fail: 'stampede', show: { notFlag: 'penned' } },
      { text: 'Tackle the nearest pair and unlace its boots', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], mods: [{ if: { flag: 'knowsLaces' }, dd: 4 }] }, pass: 'unlaced', fail: 'legs_fight', show: { below: ['tackled', 3] } },
      { text: 'Cast Trip on the nearest pair, and unlace it while it’s down', cast: 'trip', pass: 'unlaced', fail: 'legs_fight', show: { below: ['tackled', 3] } },
      { text: 'Tickle the nearest pair with your quill', to: 'tickled', if: { item: 'quill' }, show: { flag: 'knowsLaces', notFlag: 'tickled' } },
      { text: 'Go after the legs in the seven-league boots', to: 'chase', show: { notFlag: 'leaderGone' } },
      { text: 'Go to the Hobbling Arms', to: 'pub' },
      { text: 'Take what you’ve got back to Welt', to: 'welt_pays' },
    ],
  },
  caltrops: {
    on: [{ lose: 'caltrops' }, { flag: 'penned' }, BOOTS(8)],
    text: ['You scatter caltrops across the green. Forty pairs of legs come high-stepping round the maypole, tread on them all at once, and sit down hard. By the time they’re up, hopping, you’ve unlaced eight pairs of boots and herded the rest into the cattle pen, where they stand on one foot each, sulking.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  glued: {
    on: [{ lose: 'glue' }, { flag: 'glued' }, BOOTS(5)],
    text: ['You pour a ring of glue round the maypole and wait. The next five pairs of legs to come skipping round it stop dead, mid-skip, stuck fast. You unlace their boots one by one. The legs sit down in the glue, which, legs being legs, they don’t seem to mind.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  penned: {
    on: [{ flag: 'penned' }, BOOTS(6)],
    text: ['It takes an hour, a lot of shouting and a wheelbarrow, but you get most of them into the cattle pen and shut the gate. Six pairs are calm enough to let you unlace their boots. The rest kick the fence, but the fence was built for cows.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  stampede: {
    on: [{ damage: 'd4', from: 'A stampede of legs' }],
    text: ['The legs don’t want to go in the pen. They go over you instead, in a stampede of every shoe size in the county.'],
    choices: [{ text: 'Get up', to: 'fair' }],
  },
  tickled: {
    on: [{ flag: 'tickled' }, { flag: 'penned' }, BOOTS(10)],
    text: ['You run the feather end of your quill along the sole of the nearest boot. The legs collapse, kicking helplessly, laughing in the only way legs can. You go round the whole fair like this. Ten pairs give up their boots without a struggle, and the rest are so worried about the quill that they go into the cattle pen of their own accord.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  unlaced: {
    on: [{ add: ['tackled', 1] }, BOOTS()],
    text: (c) => [c.flags.knowsLaces
      ? 'You bring a pair of legs down and unlace its boots, carefully, not pulling. The moment the boots come off, the legs sit down in the grass with a sigh and stop.'
      : 'You bring a pair of legs down and get the boots off, which takes a lot of pulling. The legs sit down in the grass and stop, as if somebody had cut their strings.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  legs_fight: {
    on: [{ add: ['tackled', 1] }],
    text: ['You grab a pair of legs in hobnail boots. They do not want to be grabbed.'],
    fight: { outdoors: true, monsters: [legs], win: 'legs_down', flee: { to: 'fair', label: 'Let go and back off' } },
  },
  legs_down: {
    on: [BOOTS()],
    text: ['The legs lie in the grass, still at last. You take their boots. Nobody at the fair looks very upset.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  chase: {
    text: (c) => [
      c.flags.chased
        ? 'The legs in the seven-league boots are still lapping the village, a shining blur. One stride takes them from the green to the mill and back. They have been doing this all day, and they seem to be enjoying it.'
        : 'You stand at the edge of the green and watch for the seven-league boots. They come past in a blur and a gust of wind, from the church to the mill pond in one stride, then back past the green in the next. Every lap is the same: green, church, mill, green.',
    ],
    choices: [
      { text: 'Stretch your rope across their path at ankle height', test: { stat: 'Str', dd: 6, skill: ['athletics'] }, pass: 'leader_tripped', fail: 'rope_burn', if: { anyItem: ['rope', 'chain'] } },
      { text: 'Stick your pole out as they pass', test: { stat: 'Dex', dd: 8, skill: ['athletics'], profs: ['Hunter'], why: 'timing is your trade' }, pass: 'leader_tripped', fail: 'pole_snapped', if: { item: 'pole' } },
      { text: 'Dig a hole where they land by the mill', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'leader_tripped', fail: 'chase_miss', if: { anyItem: ['shovel', 'pick'] } },
      { text: 'Ask the fiddler to play a jig: no pair of legs can resist a jig', to: 'jig', show: { notFlag: 'jigTried' } },
      { text: 'Throw yourself at them', test: { stat: 'Dex', dd: 12, skill: ['athletics'] }, pass: 'leader_fight', fail: 'chase_miss' },
      { text: 'Cast Trip as they land', cast: 'trip', pass: 'leader_tripped', fail: 'chase_miss' },
      { text: 'Cast Haste on yourself and run them down', cast: 'haste', pass: 'hasted', fail: 'chase_miss' },
      { text: 'Cast Burden on the boots as they land by the mill', cast: 'burden', pass: 'boots_sink', fail: 'chase_miss', critFail: 'boots_skip' },
      { text: 'Cast Waterwalk on yourself and cut them off across the millpond', cast: 'waterwalk', pass: 'pond_walk', fail: 'chase_miss', critFail: 'pond_sink' },
      { text: 'Back to the fair', to: 'fair' },
    ],
  },
  rope_burn: {
    on: [{ flag: 'chased' }, { damage: 'd4', from: 'Your rope' }],
    text: ['The legs hit the rope at fourteen miles an hour. So, briefly, do you. They hurdle it on the next lap.'],
    choices: [{ text: 'Try something else', to: 'chase' }],
  },
  pole_snapped: {
    on: [{ flag: 'chased' }, { lose: 'pole' }],
    text: ['The legs hit your pole and snap it in two, without breaking stride. You are left holding five feet of pole and a strong sense of having been outrun.'],
    choices: [{ text: 'Try something else', to: 'chase' }],
  },
  chase_miss: {
    on: [{ flag: 'chased' }, { damage: 'd4', from: 'A gust of wind' }],
    text: ['They’re gone before you’ve moved. The gust of wind they leave behind knocks you into a haystall.'],
    choices: [{ text: 'Try something else', to: 'chase' }],
  },
  jig: {
    on: [{ flag: 'jigTried' }],
    text: ['The fiddler, standing on a barrel, strikes up a jig. All over the green, legs stop and dance: heel, toe, heel, toe. The seven-league boots come past, try to dance, and with one hop are in the next county. A minute later, they hop back. They can’t do a small step. Every time they try, they end up somewhere else.'],
    choices: [
      { text: 'Wait where they land and grab them mid-hop', test: { stat: 'Dex', dd: 8, skill: ['athletics', 'skulduggery'] }, pass: 'leader_tripped', fail: 'chase_miss' },
      { text: 'Unlace a few dancing pairs on the green while the music lasts', to: 'jig_boots' },
    ],
  },
  jig_boots: {
    on: [BOOTS(4)],
    text: ['A pair of legs that’s dancing a jig can’t run away. You unlace four pairs before the fiddler’s arm gives out.'],
    choices: [{ text: 'Back to the chase', to: 'chase' }, { text: 'Back to the fair', to: 'fair' }],
  },
  leader_tripped: {
    text: ['The seven-league boots go down at full stride. Legs, boots and a great deal of village green go somersaulting across the mill pond, skimming like a stone: one, two, three, and splash. The legs come up out of the water kicking, angry and wet.'],
    choices: [
      { text: 'Get the boots off before they find their feet', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'], mods: [{ if: { flag: 'knowsLaces' }, dd: 4 }] }, pass: 'seven_league', fail: 'leader_fight' },
    ],
  },
  leader_fight: {
    text: ['The legs in the seven-league boots turn on you. They don’t run away. They kick, and every kick lands like a falling cart.'],
    fight: { outdoors: true,
      monsters: [{ name: 'Legs in seven-league boots', plural: true, lvl: 2, hp: 12, range: 'engaged', feats: ['relentless'], note: 'Relentless; seven-league boots (kicks hard, 12 HP)' }],
      win: 'seven_league', flee: { to: 'fair', label: 'Run back to the fair' },
      special: [{ label: 'Tickle them with your quill', if: { item: 'quill' }, flag: 'leaderTickled', text: 'They collapse, kicking with laughter. You get both boots off.', win: true }],
    },
  },
  seven_league: {
    on: [{ flag: 'leaderGone' }, { item: 'sevenleague', msg: 'The seven-league boots take up two significant item slots, and you have to sit on them to stop them going anywhere.' }],
    text: ['The boots come off. The legs sit down in the shallows and stay there, as legs should. The boots, even empty, keep twitching towards the horizon.'],
    choices: [{ text: 'Back to the fair', to: 'fair' }],
  },
  welt_pays: {
    end: 'victory',
    on: [
      { goldPer: ['boots', 15], text: 'Welt pays 15GP a pair' },
      { sell: { item: 'sevenleague', gold: 250, text: 'Welt takes the seven-league boots back, holding them very tightly' } },
    ],
    text: (c) => {
      const n = c.flags.boots || 0;
      return [
        n >= 20 ? `You bring back ${n} pairs of boots. Welt counts them, and keeps counting, and then sits down on his empty counter and cries.`
          : n ? `You bring back ${n} pair${n === 1 ? '' : 's'} of boots. Welt counts them and sighs. “It’s a start,” he says.` : 'You bring back no boots at all. Welt looks at your hands, then at your feet, which have boots on, and narrows his eyes.',
        c.flags.sold_sevenleague ? 'The mayor runs the race that afternoon in his seven-league boots. He wins it before it starts, and then has to be fetched back from the coast.' : 'The mayor runs the race that afternoon in his ordinary shoes, and comes last.',
        c.flags.penned ? 'The legs stand in the cattle pen for a week, until somebody thinks to sell them to a dance school.' : 'Pairs of legs are seen running wild on the moors for years afterwards. Some of them are still in boots.',
        `You leave Little Hobbling with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
      ];
    },
  },
  hasted: {
    text: ['You set off after the seven-league boots at a speed you have only ever seen in greyhounds. You can’t catch them, quite, but you can be there when they land, and you are, puffing.'],
    choices: [{ text: 'Grab them mid-hop', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'leader_tripped', fail: 'chase_miss' }],
  },
  boots_sink: {
    text: ['The seven-league boots come down by the mill weighing twice what they did, and go into the soft bank up to the ankles, then the shins, then the knees. The legs flail like a man in a bog.'],
    choices: [{ text: 'Get the boots off before they find their feet', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'seven_league', fail: 'leader_fight' }],
  },
  boots_skip: {
    on: [{ flag: 'chased' }],
    text: ['Your god scorns you. Instead of growing heavy, the legs can walk on water. They land on the millpond, skip across it like a stone, and are gone over the far hedge before the ducks have noticed.'],
    choices: [{ text: 'Try something else', to: 'chase' }],
  },
  pond_walk: {
    text: ['You step out onto the millpond and walk across the top of it, which the legs, coming down on the far bank, were not expecting. You are standing right where they land.'],
    choices: [{ text: 'Grab them mid-hop', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'leader_tripped', fail: 'chase_miss' }],
  },
  pond_sink: {
    on: [{ flag: 'chased' }],
    text: ['Your god scorns you. Instead of walking on water, you weigh twice what you did, and the bank of the millpond takes you to the knees. You stand there, stuck, and watch the seven-league boots go by.'],
    choices: [{ text: 'Pull yourself out and try something else', to: 'chase' }],
  },
};

export const DEATH_TEXT = [
  'You are kicked to death at a village fair. The legs don’t mean anything by it. They don’t mean anything by anything.',
  'Your adventure ends here.',
];
