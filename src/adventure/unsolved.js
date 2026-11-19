// UNSOLVED — solve the transdimensional murdercube haunting a university. For a level 7–8 scumbag.
// Each clue you gather (the `clues` counter) makes the final puzzle easier: d20, d12, d8, then d4.

export const META = {
  tier: 8, id: 'unsolved', title: 'Unsolved', levels: '7–8', final: 'dean',
  blurb: 'Six weeks ago, a professor at the University of Lesser Wisdom summoned something from the fourth dimension to settle an argument. It is a cube. It hovers. It asks a question, and it murders anyone who gets it wrong. The Dean will pay 500 gold to whoever solves it, and nobody has been to a lecture since.',
};

const CLUE = { add: ['clues', 1] };
const cube = { name: 'Transdimensional murdercube', lvl: 8, hp: 40, range: 'short', note: 'Unsolved puzzle; hovers; folds space at you' };

export const SECTIONS = {
  start: {
    text: [
      'The Dean of the University of Lesser Wisdom is a tiny, frightened man who hasn’t slept in six weeks. “It’s in the Great Hall,” he whispers. “It hovers. It asks. Nobody understands the question. Twelve students, two porters and the professor of logic, who should have known better.” He presses a purse into your hand. “Fifty now. Five hundred if you solve it.”',
      'The campus is deserted. A tower with a telescope, an alchemy laboratory, a library chained shut, and the Bursar’s office all stand around a quad, and in the middle of it all, the Great Hall hums.',
    ],
    on: [{ gold: 50 }], onceOnly: true,
    choices: [{ text: 'Into the quad', to: 'quad' }],
  },
  quad: {
    text: (c) => [
      'The quad is silent except for the hum. The university’s doors stand around you.',
      ['You don’t know anything about the cube yet.', 'You’ve found one clue to the cube.', 'You’ve found two clues to the cube.', 'You’ve found three clues to the cube. That should be enough.'][Math.min(3, c.flags.clues || 0)],
    ],
    choices: [
      { text: 'Climb the observatory tower', to: 'tower', show: { notFlag: 'starClue' } },
      { text: 'Go into the alchemy laboratory', to: 'lab', show: { notFlag: 'labClue' } },
      { text: 'Try the library', to: 'library', show: { notFlag: 'bookClue' } },
      { text: 'Visit the Bursar’s office', to: 'bursar', show: { notFlag: 'bursar' } },
      { text: 'Enter the Great Hall', to: 'hall' },
      { text: 'Give up and leave', to: 'dean' },
    ],
  },
  tower: {
    text: ['At the top of two hundred steps, the astronomer is asleep across his telescope, as he has been since the cube arrived. On his desk, a chart of the stars is covered in sums, and in the margin, in tiny writing, are notes about the cube.'],
    choices: [
      { text: 'Wake him with smelling salts', to: 'astronomer', if: { item: 'salts' } },
      { text: 'Shake him awake', test: { stat: 'Cha', dd: 8, skill: ['social', 'medicine'] }, pass: 'astronomer', fail: 'astro_asleep' },
      { text: 'Read the tiny writing with your jeweller’s loupe', to: 'loupe_clue', if: { item: 'loupe' } },
      { text: 'Try to read the tiny writing anyway', test: { stat: 'Int', dd: 12, skill: ['analysis', 'languages'] }, pass: 'loupe_clue', fail: 'astro_asleep' },
      { text: 'Back down to the quad', to: 'quad' },
    ],
  },
  astro_asleep: {
    text: ['The astronomer snores. The writing stays tiny.'],
    choices: [{ text: 'Back down to the quad', to: 'quad' }],
  },
  astronomer: {
    on: [{ flag: 'starClue' }, CLUE],
    text: ['The astronomer sits up with a snort. “The cube!” he says. “It’s not a cube. It’s the shadow of something with more sides than we have. Turn it the right way and it folds up into nothing. Look at it from above. Always from above.” Then he falls asleep again, satisfied.'],
    choices: [{ text: 'Back down to the quad', to: 'quad' }],
  },
  loupe_clue: {
    on: [{ flag: 'starClue' }, CLUE],
    text: ['Magnified, the tiny writing reads: “NOT A CUBE. A SHADOW. VIEW FROM ABOVE AND IT WILL FOLD.” And underneath, in much bigger writing: “I AM SO TIRED.”'],
    choices: [{ text: 'Back down to the quad', to: 'quad' }],
  },
  lab: {
    text: (c) => [
      'The alchemy laboratory is cold. The great furnace has gone out, and without it the professor’s experiments have curdled.',
      c.flags.pagesTorn
        ? 'The lab homunculi glare at you from the top of a cupboard, test tubes ready. The professor’s notebook lies in pieces on the floor, where you tore it.'
        : 'Three lab homunculi, each about a foot high and in tiny goggles, sit on the bench looking miserable. A notebook lies open beside the furnace, its pages stuck together with something green.',
    ],
    choices: [
      { text: 'Get the furnace going with your bellows', to: 'furnace', if: { item: 'bellows' } },
      { text: 'Light the furnace', test: { stat: 'Int', dd: 8, skill: ['analysis', 'arcana'], profs: ['Alchemist'], why: 'this is your trade' }, pass: 'furnace', fail: 'lab_bang', if: { fire: true } },
      { text: 'Dissolve the green stuff with acid and read the notebook', to: 'notebook', if: { item: 'acid' }, effects: [{ lose: 'acid' }], show: { notFlag: 'pagesTorn' } },
      { text: 'Prise the pages apart', test: { stat: 'Dex', dd: 12, skill: ['skulduggery', 'medicine'], why: 'delicate work' }, pass: 'notebook', fail: 'homunculi', show: { notFlag: 'pagesTorn' } },
      { text: 'Grab the one legible piece of the notebook while they aim', to: 'homunculi_again', show: { flag: 'pagesTorn' } },
      { text: 'Back to the quad', to: 'quad' },
    ],
  },
  lab_bang: {
    on: [{ damage: '2d6', from: 'The furnace' }],
    text: ['The furnace catches with a WHUMP that takes your eyebrows and puts the homunculi on the ceiling. They come down angry.'],
    fight: { monsters: [{ name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }, { name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }], win: 'furnace', flee: { to: 'quad', label: 'Back to the quad' } },
  },
  homunculi: {
    on: [{ flag: 'pagesTorn' }],
    text: ['The pages tear. The homunculi gasp in horror. That was the professor’s notebook. They pick up test tubes.'],
    fight: { monsters: [{ name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }, { name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }], win: 'lab_after', flee: { to: 'quad', label: 'Back to the quad' } },
  },
  homunculi_again: {
    text: ['A volley of test tubes comes down off the cupboard.'],
    fight: { monsters: [{ name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }, { name: 'Lab homunculus', lvl: 2, range: 'short', feats: ['magicImmune'], note: 'Tiny goggles; immune to magic; throws test tubes' }], win: 'lab_after', flee: { to: 'quad', label: 'Back to the quad' } },
  },
  lab_after: {
    text: ['The homunculi retreat into a cupboard and slam the door. The notebook is in pieces on the floor, but one piece is legible.'],
    choices: [{ text: 'Read it', to: 'notebook' }],
  },
  furnace: {
    on: [{ flag: 'labClue' }, CLUE, { item: 'potion', msg: 'The grateful homunculi give you a fresh healing potion from the warm vats.' }],
    text: ['The furnace roars into life, the vats begin to bubble, and the homunculi cheer and dance on the bench. When the green stuff on the notebook melts, it opens on the professor’s last entry: “It asks the same question every time. The answer is a movement, not a word. It must be turned. Turned by hand. It will try to kill you while you do it.”'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  notebook: {
    on: [{ flag: 'labClue' }, CLUE],
    text: ['The professor’s last entry: “It asks the same question every time. The answer is a movement, not a word. It must be turned. Turned by hand. It will try to kill you while you do it.” Below it, a smear of something, and nothing else.'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  library: {
    redirect: [{ if: { flag: 'libraryOpen' }, to: 'reading_room' }, { if: { flag: 'invigAngry' }, to: 'library_open' }],
    text: ['The library doors are chained and padlocked, and a notice reads CLOSED FOR EXAMS. Through the keyhole you can see the invigilator: a tall, grey woman in a gown, standing perfectly still in the middle of the reading room, watching nothing. Exams have been suspended for six weeks. She hasn’t been told.'],
    choices: [
      { text: 'Pick the padlock', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'reading_room', fail: 'invigilator', if: { item: 'tools' } },
      { text: 'Melt the padlock with acid', to: 'reading_room', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Break the chain', test: { stat: 'Str', dd: 12, skill: ['bruteforce'], mods: [{ if: { anyItem: ['prybar', 'pick'] }, dd: 8 }] }, pass: 'invigilator', fail: 'chain_holds' },
      { text: 'Blow your watchman’s whistle: it sounds exactly like the end of an exam', to: 'whistle', if: { item: 'whistle' } },
      { text: 'Back to the quad', to: 'quad' },
    ],
  },
  whistle: {
    text: ['You blow the whistle through the keyhole. The invigilator straightens, looks at a clock that stopped six weeks ago, says “PENS DOWN,” opens the door from the inside, and walks out of the library and across the quad and away, very fast. She has been waiting for that sound for a long time.'],
    choices: [{ text: 'Into the library', to: 'reading_room' }],
  },
  library_open: {
    text: ['The library door hangs open where you left it. The invigilator is back in the middle of the reading room, perfectly still, facing the door. Facing you.'],
    choices: [
      { text: 'Blow your watchman’s whistle: it sounds exactly like the end of an exam', to: 'whistle', if: { item: 'whistle' } },
      { text: 'Go in anyway', to: 'invigilator' },
      { text: 'Back to the quad', to: 'quad' },
    ],
  },
  invigilator: {
    on: [{ flag: 'invigAngry' }],
    text: ['The invigilator turns, slowly. She puts a finger to her lips. “Silence,” she says, “in the examination room.” She comes at you without a sound.'],
    fight: { monsters: [{ name: 'The invigilator', lvl: 6, range: 'engaged', onHit: { stat: 'Wis', dd: 8, label: 'keep your nerve', text: 'Her stare makes you forget everything you ever knew.', effect: 'prone' }, note: 'Total silence; on hit, d8 Wis save or freeze, as in every exam you ever sat' }], win: 'reading_room', flee: { to: 'quad', label: 'Leave the examination room' } },
  },
  chain_holds: {
    on: [{ damage: 'd4', from: 'The chain' }],
    text: ['You heave on the chain until something in your shoulder gives. The chain doesn’t. Inside, the invigilator hasn’t moved, but she is somehow looking at you now.'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  reading_room: {
    on: [{ flag: 'libraryOpen' }],
    text: ['The reading room is full of chained books. One shelf is labelled GEOMETRY (FORBIDDEN). On it, a slim volume with a cube on the spine: ON SHAPES WITH TOO MANY SIDES. It is written in a language nobody has spoken for a thousand years.'],
    choices: [
      { text: 'Read it', test: { stat: 'Int', dd: 8, skill: ['languages', 'arcana', 'analysis'], profs: ['Missionary', 'Envoy'], why: 'you read difficult things for a living' }, pass: 'book_clue', fail: 'book_copy' },
      { text: 'Copy out the diagrams with your quill to puzzle over later', to: 'book_clue', if: { item: 'quill' } },
      { text: 'Back to the quad', to: 'quad' },
    ],
  },
  book_copy: {
    text: ['The words swim. You get the gist, which is: there are diagrams, and they are important, and you don’t understand them.'],
    choices: [{ text: 'Try again', to: 'reading_room' }, { text: 'Back to the quad', to: 'quad' }],
  },
  book_clue: {
    on: [{ flag: 'bookClue' }, CLUE],
    text: ['Between the impossible words are diagrams, and the diagrams are simple: a cube, viewed from above, with an arrow. Turn it like this, they say, and the corners go somewhere else. The last diagram shows a hand doing it. The hand has four fingers missing.'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  bursar: {
    text: ['The Bursar is still at his desk, because the Bursar is always at his desk. He is counting the university’s money, which is in a locked iron chest beside him. He looks up. “The cube,” he says, “has cost us a great deal in lost fees. Its removal would be… financially advisable.”'],
    choices: [
      { text: 'Ask for an advance on the fee', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'advance', fail: 'bursar_no' },
      { text: 'Ask him what he knows about the cube', to: 'bursar_clue', show: { notFlag: 'bursarClue' } },
      { text: 'Back to the quad', to: 'quad' },
    ],
  },
  advance: {
    on: [{ flag: 'bursar' }, { flag: 'advance' }, { gold: 100 }],
    text: ['The Bursar counts out a hundred gold with the face of a man pulling his own teeth, and writes it down twice.'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  bursar_no: {
    on: [{ flag: 'bursar' }],
    text: ['“No,” says the Bursar, and writes that down as well.'],
    choices: [{ text: 'Back to the quad', to: 'quad' }],
  },
  bursar_clue: {
    on: [{ flag: 'bursarClue' }],
    text: ['“It has a price,” says the Bursar. “Everything has a price. The professor of logic paid it in full.” He shows you a receipt, written in a hand that isn’t human, for one professor of logic, received with thanks. It says nothing useful, but you can’t stop looking at it.'],
    choices: [{ text: 'Back to the bursar', to: 'bursar' }],
  },
  hall: {
    text: (c) => [
      c.flags.cubeAngry
        ? 'The murdercube has gone back to hanging in the middle of the Great Hall and turning slowly, as if nothing had happened. The floor where you were standing last time is creased like paper. It notices you, and the hum becomes a voice in your teeth again.'
        : 'In the middle of the Great Hall, six feet off the floor, hangs the murdercube: a block of something that isn’t quite black, about the size of a wardrobe. It turns slowly. When you look at it, its edges don’t meet where they should. It notices you, and the hum becomes a voice that you hear in your teeth.',
      '“A QUESTION,” it says, and then asks one. It is not in words. It is a shape. You feel your brain trying to fold itself to answer it.',
      ['You know nothing that could help.', 'You know one thing that could help.', 'You know two things that could help.', 'You know everything you need.'][Math.min(3, c.flags.clues || 0)],
    ],
    choices: [
      { text: 'Look at it in your hand mirror', to: 'mirror', if: { item: 'mirror' }, show: { notFlag: 'mirrorClue' } },
      { text: 'Climb up and look at it from above, as the astronomer said', to: 'above', if: { flag: 'starClue', flagText: 'the astronomer’s clue' }, show: { notFlag: 'above' } },
      { text: 'Turn it', test: { stat: 'Int', dd: 20, skill: ['analysis', 'arcana'], profs: ['Sorcerer', 'Alchemist'], why: 'you’ve read about shapes like this', mods: [{ if: { atLeast: ['clues', 1] }, dd: 12 }, { if: { atLeast: ['clues', 2] }, dd: 8 }, { if: { atLeast: ['clues', 3] }, dd: 4 }] }, pass: 'solved', fail: 'cube_fight' },
      { text: 'Back out of the hall', to: 'quad' },
    ],
  },
  mirror: {
    on: [{ flag: 'mirrorClue' }, CLUE],
    text: ['In your mirror, the cube is the wrong way round, and the wrong way round it makes sense: you can see, for just a moment, that it isn’t a cube at all but a shadow of something else, and which way it would fold if someone turned it.'],
    choices: [{ text: 'Back', to: 'hall' }],
  },
  above: {
    on: [{ flag: 'above' }, CLUE],
    text: ['You climb the gallery stairs and look down on the cube from above. From up here, for a moment, it isn’t a cube at all, but something with a great many corners, all of them pointing slightly away from you. You see, now, which way it wants to turn.'],
    choices: [{ text: 'Back down', to: 'hall' }],
  },
  cube_fight: {
    on: [{ flag: 'cubeAngry' }],
    text: ['You get it wrong. The cube stops turning. Space around you creases like paper, and a corner that isn’t there comes at you very fast.'],
    fight: {
      monsters: [cube], distance: 1, win: 'cube_broken', flee: { to: 'quad', label: 'Run out of the hall' },
      special: [{ label: 'Try to turn it again, mid-fight', test: { stat: 'Int', dd: 8, skill: 'analysis' }, flag: 'midTurn', text: 'Your hand finds the edge that isn’t there, and turns. The cube folds up into a point and vanishes.', failText: 'It slips through your fingers, laughing in your teeth.', win: true }],
    },
  },
  cube_broken: {
    redirect: [{ if: { flag: 'midTurn' }, to: 'turned' }],
    on: [{ flag: 'cubeBroken' }],
    text: ['The cube cracks, and every crack goes somewhere else. Then it falls to the floor, a block of dull grey stone, quite dead. Nobody will ever know what the question was.'],
    choices: [{ text: 'Go and tell the Dean', to: 'dean' }],
  },
  turned: {
    on: [{ item: 'tesseract', msg: 'Where the cube was, a small, heavy, impossible object hangs in the air: the cube’s shadow, folded. You put it in your pocket. It is also in your other pocket.' }],
    text: ['The hum stops. Somewhere very far away, something says “CORRECT,” a little grudgingly.'],
    choices: [{ text: 'Go and tell the Dean', to: 'dean' }],
  },
  solved: {
    on: [{ flag: 'solved' }, { item: 'tesseract', msg: 'Where the cube was, a small, heavy, impossible object hangs in the air: the cube’s shadow, folded. You put it in your pocket. It is also in your other pocket.' }],
    text: ['You reach up, take hold of a corner that isn’t there, and turn. The cube folds up into itself, smaller and smaller, until it is the size of a die, and then smaller, and then gone. The hum stops. Somewhere, very far away, something says “CORRECT.”'],
    choices: [{ text: 'Go and tell the Dean', to: 'dean' }],
  },
  dean: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'solved' }, { flag: 'midTurn' }] }, gold: 500, uncapped: true, msg: 'The Dean pays the full 500GP, weeping with relief.' },
      { if: { flag: 'cubeBroken' }, gold: 300, uncapped: true, msg: 'The Dean pays you 300GP. “For removal,” he says. “Not for solving. The professor of logic would have wanted that distinction made.”' },
      { if: { flag: 'advance', any: [{ flag: 'solved' }, { flag: 'midTurn' }, { flag: 'cubeBroken' }] }, gold: -100, msg: 'The Bursar deducts his advance. He has written it down twice, so he tries to deduct it twice. You stop him.' },
      { sell: { item: 'tesseract', gold: 200, text: 'The university’s professor of geometry buys the folded tesseract' } },
    ],
    text: (c) => [
      c.flags.solved || c.flags.midTurn
        ? 'The University of Lesser Wisdom reopens the next day. Lectures resume. Nobody attends them, because it’s a university, but at least nobody is murdered by a shape.'
        : c.flags.cubeBroken ? 'The dead cube lies in the Great Hall, a block of dull grey stone. The university turns it into a lectern. Lectures resume, and every so often a student swears the lectern asked them something.'
          : 'The cube still hums in the Great Hall. The Dean thanks you for trying, and starts sleeping in the Bursar’s office.',
      `You leave the university with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'The cube folds you up and puts you somewhere else. The Bursar writes you a receipt.',
  'Your adventure ends here.',
];
