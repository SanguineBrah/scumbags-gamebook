// VOW OF SILENCE — steal a liqueur recipe from an abbey where nobody may make a sound. For a level 3–4 scumbag.
// The `noise` counter rises with every noisy act; at 3, Brother Octavius comes to find you.

export const META = {
  tier: 4, id: 'vow-of-silence', title: 'Vow of Silence', levels: '3–4', final: 'clatter',
  blurb: 'The monks of St Shush brew the finest liqueur in the kingdom, and have sworn never to speak a word, which keeps the recipe safe. Madame Clatter, distiller, will pay 250 gold for a copy. The monks don’t fight. Except one. He has eight arms, and they say he’s never once broken his vow, or anybody’s nose more than twice.',
};

const NOISE = (n = 1) => ({ add: ['noise', n] });
const octavius = { name: 'Brother Octavius', lvl: 4, hp: 16, range: 'engaged', feats: ['tiny'], dmg: '8', note: 'Eight-armed monk; slaps eight times a turn (8 damage); hard to hit (+2 to tests when being attacked); silent' };

export const SECTIONS = {
  start: {
    text: [
      'Madame Clatter is the loudest woman in the county. She runs a distillery that makes a liqueur called Clatter’s Cordial, which tastes of varnish. “St Shush!” she bellows, across a table three feet wide. “Their Shushing Liqueur outsells mine ten to one! Because nobody can find out what’s in it! Because they won’t SAY!” She slams down a purse. “Fifty now. Two hundred more for the recipe. They keep it in the abbey somewhere. In writing, I suppose. They can’t keep it any other way.”',
    ],
    on: [{ gold: 50 }], onceOnly: true,
    choices: [{ text: 'Go to the abbey', to: 'gate' }],
  },
  gate: {
    text: (c) => [
      c.flags.inside ? 'The gatehouse of St Shush is quiet. The porter has gone back to his cell.' : 'The Abbey of St Shush sits in a hollow, wrapped in a silence so thick you can feel it on your ears. At the gate, an old monk sits on a stool. He looks at you, and raises one eyebrow. That is the whole conversation.',
      'A notice on the gate reads: SILENCE. Underneath, in smaller letters: PLEASE.',
    ],
    choices: [
      { text: 'Write him a note asking to come in, with your quill', to: 'gate_note', if: { item: 'quill' }, show: { notFlag: 'inside' } },
      { text: 'Mime that you have come to take holy orders', test: { stat: 'Cha', dd: 6, skill: ['social', 'lying'], profs: ['Cleric', 'Missionary'], why: 'you know how monks think' }, pass: 'gate_in', fail: 'gate_shut', show: { notFlag: 'inside' } },
      { text: 'Climb the wall round the back', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'cloister', fail: 'wall_fall', show: { notFlag: 'inside' } },
      { text: 'Go in', to: 'cloister', show: { flag: 'inside' } },
    ],
  },
  gate_note: {
    on: [{ flag: 'inside' }, { flag: 'novice' }],
    text: ['You write: I WISH TO JOIN YOU. The porter reads it, writes WHY? underneath, and passes it back. You write: PEACE AND QUIET. He nods slowly, approvingly, and hands you a grey habit and a slate. A novice, for the afternoon.'],
    choices: [{ text: 'Put on the habit and go in', to: 'cloister' }],
  },
  gate_in: {
    on: [{ flag: 'inside' }, { flag: 'novice' }],
    text: ['You kneel, clasp your hands, and look holy. The porter watches you for a long time. Then he hands you a grey habit, which smells of other people, and opens the gate.'],
    choices: [{ text: 'Put on the habit and go in', to: 'cloister' }],
  },
  gate_shut: {
    text: ['Your mime is mistaken for a request to use the privy. The porter points down the hill, firmly, to the village.'],
    choices: [{ text: 'Try the wall round the back', to: 'wall' }],
  },
  wall: {
    text: ['The back wall of the abbey is old stone, ten feet high, mossy and quiet.'],
    choices: [
      { text: 'Climb it', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'cloister', fail: 'wall_fall' },
      { text: 'Cast Step, and appear on the other side', cast: 'step', pass: 'cloister', fail: 'wall' },
      { text: 'Cast Perambulate, and walk up it and over', cast: 'perambulate', pass: 'cloister', fail: 'wall' },
    ],
  },
  wall_fall: {
    on: [{ damage: 'd4', from: 'The wall' }, NOISE()],
    text: ['You fall off the wall into a compost heap with a noise like a dropped tray. Somewhere inside, a door opens and closes.'],
    choices: [{ text: 'Try again', to: 'wall' }],
  },
  cloister: {
    redirect: [{ if: { atLeast: ['noise', 3], notFlag: 'octaviusCame' }, to: 'octavius_comes' }],
    on: [{ flag: 'inside' }],
    text: (c) => [
      'The cloister is a square of grass with a gravel path round it. Monks in grey glide along the path without a crunch, which takes years of practice. Doors lead to the refectory, the scriptorium, the bell tower, and a heavy oak door marked CELLAR with a sign on it: A HAND SIGNAL IS REQUIRED.',
      c.flags.novice ? 'In your grey habit, nobody looks at you twice.' : 'Nobody has seen you yet.',
      (c.flags.noise || 0) ? 'Every monk in the cloister is very carefully not looking at you. They are listening.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Go to the refectory', to: 'refectory', show: { notFlag: 'refectoryDone' } },
      { text: 'Go to the scriptorium', to: 'scriptorium', show: { notFlag: 'scriptoriumDone' } },
      { text: 'Climb the bell tower', to: 'tower', show: { notFlag: 'bellRung' } },
      { text: 'Try the cellar door', to: 'cellar_door' },
      { text: 'Leave the abbey', to: 'clatter' },
    ],
  },
  refectory: {
    text: ['In the refectory, sixty monks eat soup in perfect silence. Not a slurp. Not a clink. A place is laid for you at the end of the bench. Next to it sits a very old monk who keeps looking at you, and then at the cellar door, and then at you, and winking.'],
    choices: [
      { text: 'Eat your soup without a sound', test: { stat: 'Dex', dd: 8, save: true }, pass: 'soup_quiet', fail: 'soup_slurp' },
      { text: 'Cast Silence on yourself, then eat your soup', cast: 'silence', pass: 'soup_quiet', fail: 'soup_slurp', critFail: 'soup_tongues' },
      { text: 'Pass the old monk a note with your quill', to: 'old_monk', if: { item: 'quill' } },
      { text: 'Back to the cloister', to: 'cloister' },
    ],
  },
  soup_quiet: {
    text: ['You eat the whole bowl without a sound. The old monk beside you looks impressed, and taps the back of his hand with four fingers, then points at the cellar door. Four fingers, flat. You file that away.'],
    on: [{ flag: 'refectoryDone' }, { flag: 'knowsSignal' }],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  soup_slurp: {
    on: [NOISE(), { flag: 'refectoryDone' }],
    text: ['You slurp. Sixty spoons stop halfway to sixty mouths. Sixty heads turn. The old monk beside you puts his face in his hands.'],
    choices: [{ text: 'Back to the cloister, quickly', to: 'cloister' }],
  },
  old_monk: {
    on: [{ flag: 'refectoryDone' }, { flag: 'knowsSignal' }, { flag: 'knowsSecret' }],
    text: ['You write: WHAT IS IN THE LIQUEUR? The old monk reads it, and his shoulders shake with silent laughter. He writes back: TO OPEN THE CELLAR, FOUR FINGERS FLAT ON THE BACK OF THE HAND. THE RECIPE IS ON THE BIG CASK. YOU WILL BE DISAPPOINTED. Then he eats the note.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  scriptorium: {
    text: ['In the scriptorium, monks bend over desks, copying out books in beautiful lettering. The only sound is the scratch of quills. A shelf of finished copies stands by the door: psalms, herbals, and a slim book bound in green called BREWING FOR BEGINNERS.'],
    choices: [
      { text: 'Slip the green book under your habit', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'green_book', fail: 'book_dropped' },
      { text: 'Back to the cloister', to: 'cloister' },
    ],
  },
  green_book: {
    on: [{ flag: 'scriptoriumDone' }, { flag: 'knowsSignal' }],
    text: ['You read the green book behind a pillar. It is a beginner’s guide to brewing, and very dull, except for a note in the margin of the last page: CELLAR SIGN: FOUR FINGERS, FLAT, ON THE BACK OF THE HAND. DO NOT FORGET AGAIN, BROTHER ANSELM.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  book_dropped: {
    on: [NOISE(), { flag: 'scriptoriumDone' }],
    text: ['The green book slips out of your habit and lands on the stone floor with a slap like a thunderclap. Twenty quills stop scratching. You leave, walking backwards, smiling.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  tower: {
    text: ['At the top of the bell tower hangs a great bronze bell, with its clapper tied up in a sock. It hasn’t rung in two hundred years. A rope hangs down beside it.'],
    choices: [
      { text: 'Untie the sock and ring the bell, to bring every monk running', to: 'bell', show: { notFlag: 'bellRung' } },
      { text: 'Go back down', to: 'cloister' },
    ],
  },
  bell: {
    on: [{ flag: 'bellRung' }, { flag: 'monksAway' }],
    text: ['BONG. The whole abbey shakes. Down in the cloister, sixty monks rush out of every door with their hands over their ears and mouths open in silent horror, and stream towards the tower. Including, you notice, one with eight arms, coming up the stairs very fast.'],
    choices: [
      { text: 'Slide down the bell rope and run for the cellar', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'cellar', fail: 'octavius_fight' },
      { text: 'Wait for him', to: 'octavius_fight' },
    ],
  },
  cellar_door: {
    text: (c) => [
      'A monk stands at the cellar door with his hands folded. He looks at you, and waits for the sign.',
      c.flags.knowsSignal ? 'You know the sign.' : 'You have no idea what the sign is.',
    ],
    choices: [
      { text: 'Four fingers, flat, on the back of the hand', to: 'cellar', show: { flag: 'knowsSignal' } },
      { text: 'Guess a sign', test: { stat: 'Int', dd: 12, skill: ['languages'], profs: ['Envoy'], why: 'you know a lot of gestures' }, pass: 'cellar', fail: 'wrong_sign', show: { notFlag: 'knowsSignal' } },
      { text: 'Cast Tongues on yourself, and read the monks’ sign language like a book', cast: 'tongues', pass: 'signs_read', fail: 'wrong_sign', critFail: 'signs_silent', show: { notFlag: 'knowsSignal' } },
      { text: 'Throw your voice into the refectory, where nobody has spoken for forty years', cast: 'voice', pass: 'voice_lure', fail: 'door_noticed' },
      { text: 'Wait till he dozes, oil the hinges with your flask of oil, and slip in without a creak', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'cellar', fail: 'door_noticed', if: { item: 'oil' }, effects: [{ lose: 'oil' }], show: { notFlag: 'knowsSignal' } },
      { text: 'Back to the cloister', to: 'cloister' },
    ],
  },
  wrong_sign: {
    on: [NOISE()],
    text: ['The monk looks at your hand, and his eyebrows go up very slowly. Whatever you just said in sign, it was not polite. He turns, very deliberately, and goes to fetch somebody.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  door_noticed: {
    on: [NOISE()],
    text: ['The monk at the door turns round and looks at you, and his eyebrows go up very slowly. He doesn’t need to say anything. He couldn’t if he wanted to. He goes, very deliberately, to fetch somebody.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  octavius_comes: {
    on: [{ flag: 'octaviusCame' }],
    text: ['A door at the end of the cloister opens, and Brother Octavius comes out. He is very tall, very calm, and has eight arms, folded in four pairs. He looks at you. He unfolds them one pair at a time.'],
    choices: [
      { text: 'Fall to your knees and beg forgiveness in mime', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cleric', 'Missionary'], why: 'you know how to repent' }, pass: 'forgiven', fail: 'octavius_fight' },
      { text: 'Write him an apology with your quill', to: 'forgiven', if: { item: 'quill' } },
      { text: 'Cast Wipe on him, so he forgets the noise', cast: 'wipe', pass: 'octavius_wiped', fail: 'octavius_fight', critFail: 'octavius_confesses' },
      { text: 'Fight', to: 'octavius_fight' },
      { text: 'Run for the gate', to: 'clatter' },
    ],
  },
  forgiven: {
    text: ['Brother Octavius considers your apology. Then he slaps you, once, very lightly, with each hand in turn: a penance, not a punishment. He points at the cloister. Carry on, the finger says. Quietly.'],
    on: [{ damage: '2', from: 'A penance' }],
    choices: [{ text: 'Carry on, quietly', to: 'cloister' }],
  },
  octavius_fight: {
    on: [{ flag: 'octaviusCame' }],
    text: ['Brother Octavius comes at you without a sound, all eight hands open, and the air fills with slaps.'],
    fight: { outdoors: true,
      monsters: [octavius], win: 'octavius_down', flee: { to: 'clatter', label: 'Run for the gate' },
      special: [{ label: 'Glue two of his hands together', if: { item: 'glue' }, flag: 'octavusGlued', text: 'You slap a dollop of glue into his nearest palm while he slaps you. Two hands stick together. He looks at them, appalled, and spends a whole turn trying to pull them apart.', stun: 1 }],
    },
  },
  octavius_down: {
    text: ['Brother Octavius sits down on the gravel, all eight arms folded again, and closes his eyes. He has not made a sound, and you realise, with some respect, that he never will. Across the cloister, the monk at the cellar door looks at him, then at you, and steps aside.'],
    choices: [{ text: 'Go down to the cellar', to: 'cellar' }],
  },
  cellar: {
    dark: 'cellar',
    text: ['The cellar is full of casks, and smells like a cathedral of cough syrup. On the biggest cask, burnt into the wood in letters a foot high, is the recipe for Shushing Liqueur. It is four lines long. The first three are: GIN. SUGAR. MORE GIN.'],
    choices: [
      { text: 'Copy it out with your quill', to: 'recipe', if: { item: 'quill' } },
      { text: 'Learn it by heart', to: 'recipe' },
      { text: 'Take a bottle of the liqueur as well', to: 'bottle', show: { notFlag: 'bottle' } },
    ],
  },
  bottle: {
    dark: 'cellar',
    on: [{ flag: 'bottle' }, { item: 'liqueur' }],
    text: ['You tuck a bottle of Shushing Liqueur under your habit. It is worth a good deal more than it costs to make.'],
    choices: [{ text: 'Read the recipe', to: 'cellar' }],
  },
  recipe: {
    dark: 'cellar',
    on: [{ flag: 'recipe' }],
    text: ['The fourth line says: AND DON’T TELL ANYONE. That’s the secret. That’s all of it. Two hundred years of silence to protect a bottle of sweetened gin.'],
    choices: [{ text: 'Leave the abbey', to: 'clatter' }],
  },
  clatter: {
    end: 'victory',
    on: [
      { if: { flag: 'recipe' }, gold: 200, uncapped: true, msg: 'Madame Clatter pays 200GP, very loudly.' },
      { sell: { item: 'liqueur', gold: 40, text: 'A tavern keeper in the village buys the bottle of Shushing Liqueur' } },
    ],
    text: (c) => [
      c.flags.recipe
        ? 'You tell Madame Clatter the recipe. She is silent for the first time in her life. Then she laughs until the windows rattle, and pours her own stock down the drain. By spring, Clatter’s Cordial tastes exactly like Shushing Liqueur, and costs half as much. The monks of St Shush say nothing about it. They can’t.'
        : 'You come back to Madame Clatter empty-handed. She has a great deal to say about it, at length, and at volume.',
      `You leave St Shush with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  soup_tongues: {
    on: [NOISE(), { flag: 'refectoryDone' }],
    text: ['Your god scorns you. Instead of falling silent, you find you can speak every language in the world, and to your horror you begin to, loudly, in all of them at once. Sixty spoons stop halfway to sixty mouths. The old monk beside you puts his face in his hands.'],
    choices: [{ text: 'Back to the cloister, quickly', to: 'cloister' }],
  },
  signs_read: {
    on: [{ flag: 'knowsSignal' }],
    text: ['Suddenly the monks’ fingers make sense. The doorkeeper is telling the monk beside him that his feet hurt. Across the cloister, two novices are arguing about turnips. And the sign for the cellar, which the doorkeeper is waiting for, is four fingers, flat, on the back of the hand. You give it.'],
    choices: [{ text: 'Go down to the cellar', to: 'cellar' }],
  },
  signs_silent: {
    text: ['Your god scorns you. Instead of speaking every language, you can’t make a sound at all for five minutes. In the Abbey of St Shush, nobody notices the difference.'],
    choices: [{ text: 'Back to the cloister', to: 'cloister' }],
  },
  voice_lure: {
    text: ['“Pass the salt,” says a voice in the refectory, clear as a bell. For a moment the whole abbey holds its breath. Then the doorkeeper is off across the cloister at a run, with every other monk in the place, to find out who spoke. You go down the cellar stairs alone.'],
    choices: [{ text: 'Go down to the cellar', to: 'cellar' }],
  },
  octavius_wiped: {
    on: [{ flag: 'octaviusCame' }],
    text: ['Brother Octavius stops. He looks round the cloister, frowning, like a man who has walked into a room and forgotten why. Whatever he came out to do, it has gone. He shrugs, very quietly, and goes back inside.'],
    choices: [{ text: 'Carry on, quietly', to: 'cloister' }],
  },
  octavius_confesses: {
    text: ['Your god scorns you. Instead of forgetting, Brother Octavius relives his most recent sin, and you see it with him: forty years ago, he sneezed in chapel. He has never forgiven himself. He has never forgiven anyone. He comes at you in perfect silence.'],
    choices: [{ text: 'Fight', to: 'octavius_fight' }],
  },
};

export const DEATH_TEXT = [
  'You are slapped to death in a monastery, in total silence. The monks bury you without a word.',
  'Your adventure ends here.',
];
