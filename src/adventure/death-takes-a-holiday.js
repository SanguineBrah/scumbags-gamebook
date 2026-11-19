// DEATH TAKES A HOLIDAY — find Death's stolen scythe at the seaside. For a level 9–10 scumbag.
// While the scythe is missing, nothing in Brinemouth can die: some monsters here are relentless.

export const META = {
  tier: 10, id: 'death-takes-a-holiday', title: 'Death Takes a Holiday', levels: '9–10', final: 'season_ends',
  blurb: 'Death is on holiday at Brinemouth-on-Sea, and somebody has stolen his scythe from his beach hut. Nobody in Brinemouth has died for a week. The hospital is full, the undertakers are bankrupt, and the seagulls have become a problem. Death would like his scythe back before his fortnight is up. He has been saving for a long time, and he is prepared to be generous.',
};

const gull = { name: 'Undying seagulls', plural: true, lvl: 6, hp: 14, range: 'engaged', feats: ['relentless', 'flies'], note: 'A flock that will not die while the scythe is missing; relentless (must be burned or pulped); flies; wants your chips' };
const mortimer = { name: 'Old Mortimer, with a scythe', lvl: 9, hp: 30, range: 'engaged', dmg: '3d6', feats: ['relentless'], note: 'A hundred and four; Death’s scythe (3d6); can’t die while he holds it (relentless)' };

export const SECTIONS = {
  start: {
    text: [
      'Death sits in a deckchair on Brinemouth beach, in a knotted handkerchief and a black bathing costume, with his robe folded neatly beside him. He is quite sunburnt, for a skeleton. “Hello,” he says, in a voice like a door closing quietly in another room. “I was hoping you’d come. Not for the usual reason.”',
      '“My scythe,” he says, “was taken from my beach hut on Tuesday. I haven’t had a holiday in four thousand years, and I’d rather not spend this one looking for it.” He looks out to sea. “It’s very dangerous in the wrong hands. It’s quite dangerous in mine.”',
    ],
    choices: [
      { text: 'Look at his beach hut', to: 'hut' },
      { text: 'Walk along the promenade', to: 'prom' },
    ],
  },
  hut: {
    text: (c) => [
      'Death’s beach hut is painted black, with a sign: OCCUPIED. ETERNALLY. The lock has been forced with something blunt. Inside: a towel, a bucket and spade, a novel about a lighthouse keeper, and an empty hook where a scythe would go.',
      c.flags.hutClue ? 'You know what you’re looking for: a very old man with sand in his slippers.' : 'There are footprints in the sand on the floor.',
    ],
    choices: [
      { text: 'Study the footprints with your jeweller’s loupe', to: 'prints', if: { item: 'loupe' }, show: { notFlag: 'hutClue' } },
      { text: 'Follow the footprints', test: { stat: 'Wis', dd: 10, skill: ['survival'], profs: ['Hunter'], why: 'you can track anything' }, pass: 'prints', fail: 'prints_lost', show: { notFlag: 'hutClue' } },
      { text: 'Cast Scry, and look for the scythe wherever it is now', cast: 'scry', pass: 'scried', fail: 'hut', show: { notFlag: 'hutClue' } },
      { text: 'Back to the beach', to: 'prom' },
    ],
  },
  prints: {
    on: [{ flag: 'hutClue' }],
    text: ['The footprints are slippers, very old ones, worn through at the heel, dragging the left foot. Whoever it was is very old, and was in a hurry. Then there are tyre marks. A bath chair.'],
    choices: [{ text: 'Back to the beach', to: 'prom' }],
  },
  prints_lost: {
    text: ['The footprints go off across the sand and mix with every other footprint on Brinemouth beach, which, this week, is everybody’s.'],
    choices: [{ text: 'Back to the beach', to: 'prom' }],
  },
  prom: {
    text: (c) => [
      'Brinemouth promenade is crowded with people who ought to be dead and are delighted not to be. A man who fell off the pier on Wednesday is eating an ice cream with a broken neck. The hospital has put beds on the beach. The seagulls, unable to die, have become bold and enormous.',
      'At one end of the promenade is the Rest Home for Retired Gentlemen. At the other, the pier, with a ghost train at the end of it.',
      c.flags.gullsGone ? '' : 'A flock of undying seagulls watches you from the railings.',
    ].filter(Boolean),
    choices: [
      { text: 'Visit the rest home', to: 'rest_home', show: { notFlag: 'restDone' } },
      { text: 'Walk out along the pier', to: 'pier' },
      { text: 'Throw your rations to the seagulls to keep them busy', to: 'gulls_fed', if: { item: 'rations' }, show: { notFlag: 'gullsGone' } },
      { text: 'Give up, and go back to Death’s deckchair', to: 'season_ends' },
    ],
  },
  gulls_fed: {
    on: [{ flag: 'gullsGone' }, { lose: 'rations' }],
    text: ['You throw your rations into the sea. The seagulls go after them in a screaming cloud. They’ll be busy for hours, fighting over them, endlessly, since none of them can lose.'],
    choices: [{ text: 'Back to the promenade', to: 'prom' }],
  },
  rest_home: {
    text: ['The Rest Home for Retired Gentlemen is having a wonderful week. The residents are playing croquet, dancing, and arguing about who is oldest. The matron tells you that one of them is missing: Old Mortimer, a hundred and four, who went out on Tuesday in his bath chair and came back with something long wrapped in a blanket, and then went out again. “He’s terrified of dying,” she says. “Always has been. He’s been very cheerful this week.”'],
    on: [{ flag: 'restDone' }, { flag: 'knowsMortimer' }],
    choices: [{ text: 'Back to the promenade', to: 'prom' }],
  },
  pier: {
    text: (c) => [
      'The pier runs out over the sea, all slot machines and candyfloss. At the end of it is the ghost train: HAUNTED HOLLOW, THE MOST TERRIFYING RIDE IN BRINEMOUTH. It has been shut all week, because the ghosts have been too cheerful.',
      c.flags.gullsGone ? '' : 'The seagulls follow you out along the pier, getting closer.',
      c.flags.knowsMortimer || c.flags.hutClue ? 'Parked by the entrance to the ghost train is an empty bath chair.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Deal with the seagulls', to: 'gull_fight', show: { notFlag: 'gullsGone' } },
      { text: 'Go into the ghost train', to: 'ghost_train', show: { flag: 'gullsGone' } },
      { text: 'Make a run for the ghost train', test: { stat: 'Dex', dd: 10, skill: ['athletics'] }, pass: 'ghost_train', fail: 'gull_fight', show: { notFlag: 'gullsGone' } },
      { text: 'Back to the promenade', to: 'prom' },
    ],
  },
  gull_fight: { outdoors: true,
    text: ['The seagulls come down on you in a shrieking cloud, and they don’t stop coming, because they can’t.'],
    fight: {
      monsters: [gull], win: 'gulls_down', flee: { to: 'prom', label: 'Run back along the pier' },
      special: [{ label: 'Throw them your rations', if: { item: 'rations' }, flag: 'gullFood', text: 'The gulls go after your rations into the sea, fighting over them.', win: true }],
    },
  },
  gulls_down: {
    redirect: [{ if: { flag: 'gullFood' }, to: 'gulls_away' }],
    on: [{ flag: 'gullsGone' }],
    text: ['The seagulls lie on the pier, battered and burnt and pulped, and do not die, and do not get up either. They glare at you.'],
    choices: [{ text: 'Go into the ghost train', to: 'ghost_train' }],
  },
  gulls_away: {
    on: [{ flag: 'gullsGone' }, { lose: 'rations' }],
    text: ['The seagulls go off after your rations in a screaming cloud, out over the sea, fighting over them. None of them can lose, so they’ll be at it for hours.'],
    choices: [{ text: 'Go into the ghost train', to: 'ghost_train' }],
  },
  ghost_train: {
    dark: true,
    text: (c) => [
      'Inside the ghost train, the little cars sit on their rails. Painted skeletons leer from the walls. At the far end, in the last car, wrapped in a tartan blanket, sits a tiny old man in slippers, holding a scythe that is far too big for him. Its blade shines black, and the dark around it is darker.',
      '“Go away,” says Old Mortimer. “I’m not going. Not now. Not ever. I’ve got it, and while I’ve got it, nobody goes.”',
    ].filter(Boolean),
    choices: [
      { text: 'Talk to him about what he’s afraid of', test: { stat: 'Cha', dd: 10, skill: ['social', 'medicine'], profs: ['Cleric', 'Missionary'], why: 'you’ve sat with the dying before' }, pass: 'mortimer_talks', fail: 'mortimer_fight' },
      { text: 'Tell him Death is a nice chap, really, and sunburnt', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'mortimer_talks', fail: 'mortimer_fight', show: { flag: 'hutClue' } },
      { text: 'Wave your smelling salts under his nose, and grab the scythe while he sneezes', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'scythe_got', fail: 'mortimer_fight', if: { item: 'salts' } },
      { text: 'Hook the scythe out of his hands with your pole', test: { stat: 'Dex', dd: 10, skill: ['skulduggery', 'athletics'] }, pass: 'scythe_got', fail: 'mortimer_fight', if: { item: 'pole' } },
      { text: 'Cast Telekinesis, and draw the scythe gently out of his hands', cast: 'telekinesis', pass: 'scythe_got', fail: 'mortimer_fight' },
      { text: 'Cast Vivify on him, and ease that heart of his', cast: 'vivify', pass: 'mortimer_eased', fail: 'mortimer_fight', critFail: 'mortimer_afflicted' },
      { text: 'Cast Wipe on him, so he forgets what frightened him', cast: 'wipe', pass: 'mortimer_wiped', fail: 'mortimer_fight', critFail: 'mortimer_confesses' },
      { text: 'Check his heart with your healer’s kit, and tell him the truth about it', test: { stat: 'Wis', dd: 6, skill: ['medicine'], profs: ['Bodyguard', 'Alchemist'], why: 'you know your way round a patient' }, pass: 'mortimer_talks', fail: 'mortimer_fight', if: { item: 'healerskit' } },
      { text: 'Take it from him', to: 'mortimer_fight' },
    ],
  },
  mortimer_talks: {
    text: ['You sit in the car next to him. You talk. He tells you about his wife, who died in the spring, and his brother, who died in the war, and how he has outlived everybody, and how he doesn’t want to be the last one to go, and then, it turns out, he doesn’t want to be the last one left either. After a long time, he holds out the scythe to you. “Tell him,” he says, “not yet. But not never. Just… let him come and say hello first.”'],
    on: [{ flag: 'gaveUp' }],
    choices: [{ text: 'Take the scythe', to: 'scythe_got' }],
  },
  mortimer_fight: {
    text: ['Old Mortimer stands up in the ghost train car, which takes him a while, and swings the scythe. It goes through the car in front of him like paper. It goes through the painted skeleton on the wall. He is a hundred and four, and he is holding Death.'],
    fight: {
      monsters: [mortimer], win: 'scythe_got', flee: { to: 'pier', label: 'Run back out onto the pier' },
      special: [
        { label: 'Prise the scythe out of his hands', test: { stat: 'Str', dd: 10, skill: 'bruteforce' }, flag: 'prised', text: 'You get both hands on the haft, and twist, and the scythe comes free. Mortimer sits down, suddenly very old again.', failText: 'His grip is a hundred and four years strong.', win: true },
        { label: 'Hold up your hand mirror', if: { item: 'mirror' }, flag: 'mirrored', text: 'Mortimer sees himself in your mirror: a tiny, frightened old man holding a scythe. He stops, and stares.', stun: 1 },
      ],
    },
  },
  scythe_got: {
    on: [{ flag: 'scythe' }, { item: 'scythe' }],
    text: ['You have Death’s scythe. It weighs nothing at all, and it hums, very quietly, a note so low it’s mostly in your teeth. Somewhere along the coast, a bell starts to toll, for the first time in a week.'],
    choices: [
      { text: 'Take it back to Death', to: 'returned' },
      { text: 'Keep it', to: 'kept' },
    ],
  },
  kept: {
    text: ['You keep it. Nobody can die while you hold it. Not you. Not anybody. You hold it a little longer. Down on the beach, Death has turned round in his deckchair, and is looking at the pier, and at you. He doesn’t get up. He doesn’t need to. He has all the time in the world.'],
    choices: [
      { text: 'Think better of it, and take it back', to: 'returned' },
      { text: 'Sell it to the necromancer who’s been sniffing round the pier', to: 'sold_scythe' },
    ],
  },
  sold_scythe: {
    on: [{ flag: 'soldScythe' }],
    text: ['The necromancer pays a fortune, in old coins, and walks off down the pier with the scythe over his shoulder, whistling. Down on the beach, Death watches him go, and then looks at you. “See you later,” he says, pleasantly. You know exactly what he means.'],
    choices: [{ text: 'Leave Brinemouth, quickly', to: 'season_ends' }],
  },
  returned: {
    on: [{ lose: 'scythe' }, { flag: 'returned' }],
    text: (c) => [
      'You give Death his scythe. He weighs it in his hand, and sighs, a sound like wind in a churchyard. “Thank you,” he says. “It’s good to have it back. And it isn’t.”',
      c.flags.gaveUp ? 'You tell him what Old Mortimer said. Death is quiet for a while. “Tell him I’ll come and say hello first,” he says. “I always do. People just don’t notice.”' : 'He looks along the pier towards the ghost train. “Mortimer,” he says. “I know. I’ll be gentle.”',
    ],
    choices: [{ text: 'Sit with him a while', to: 'season_ends' }],
  },
  season_ends: {
    end: 'victory',
    on: [
      { if: { flag: 'returned' }, gold: 600, uncapped: true, msg: 'Death pays you in pennies from the eyes of four thousand years of the dead: 600GP.' },
      { if: { flag: 'soldScythe' }, gold: 1200, uncapped: true, msg: 'The necromancer’s fortune: 1200GP.' },
    ],
    text: (c) => [
      c.flags.returned ? 'Death finishes his holiday, and reads his novel, and builds a sandcastle on the last day, which is not very good. Then he puts on his robe, picks up his scythe, and goes back to work. Brinemouth has a very busy week. Old Mortimer goes last, at the end of it, smiling, holding the hand of somebody nobody else can see.'
        : c.flags.soldScythe ? 'You leave Brinemouth rich. You will be rich for a very long time, because the necromancer is now in charge of who dies, and he has other plans. But one day, you know, you will see Death again. He said so. He always keeps his appointments.'
          : 'You leave Brinemouth without the scythe. Nobody dies there for a year. It is the most popular resort in the kingdom, until it isn’t.',
      `You leave Brinemouth-on-Sea with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  scried: {
    on: [{ flag: 'hutClue' }],
    text: ['You see the scythe, far off and small, as if through the wrong end of a telescope: propped in the front car of a ghost train at the end of a pier, in the bony hands of a very old man in slippers, who is holding on to it as if it were the last thing in the world.'],
    choices: [{ text: 'Back to the beach', to: 'prom' }],
  },
  mortimer_eased: {
    on: [{ flag: 'gaveUp' }],
    text: ['You lay a hand on Old Mortimer’s chest and pray. His breathing eases. Colour comes into his face. He looks at you, astonished. “I haven’t felt this well in twenty years,” he says. He looks at the scythe across his knees, and then, after a long time, he holds it out to you. “I suppose I’ve got a bit longer now,” he says. “I’d rather spend it outside.”'],
    choices: [{ text: 'Take the scythe', to: 'scythe_got' }],
  },
  mortimer_afflicted: {
    text: ['Your god scorns you. Instead of easing his heart, your prayer squeezes it. Old Mortimer goes grey and clutches his chest, and would certainly have died, except that nobody can die while he holds the scythe. He just feels dreadful, and he knows exactly whose fault it is.'],
    choices: [{ text: 'Brace yourself', to: 'mortimer_fight' }],
  },
  mortimer_wiped: {
    text: ['Old Mortimer blinks, and forgets the last day: the fear, the beach hut, the long walk out along the pier in his slippers. He looks down at the scythe in his lap with mild surprise. “I don’t know what I’m doing with this,” he says, and hands it to you. “Is it yours?”'],
    choices: [{ text: 'Take the scythe', to: 'scythe_got' }],
  },
  mortimer_confesses: {
    text: ['Your god scorns you. Instead of forgetting, Old Mortimer relives his most recent sins: the beach hut, the scythe, the long walk out along the pier, and the moment he realised that nobody in the world could die while he held it, and how glad he was. He stands up in the car with the scythe in both hands.'],
    choices: [{ text: 'Brace yourself', to: 'mortimer_fight' }],
  },
};

export const DEATH_TEXT = [
  'You don’t die. Nobody can, this week. You just lie there on the pier, unable to get up, until Death gets his scythe back. Then you die. He is very kind about it.',
  'Your adventure ends here.',
];
