// DETENTION — get a stolen grimoire back from a gang of delinquent wizards. For a level 5–6 scumbag.

export const META = {
  tier: 6, id: 'detention', title: 'Detention', levels: '5–6', final: 'headmistress',
  blurb: 'The worst pupils at the Collegium Arcana have stolen the Headmistress’s grimoire and set up as a gang in the town of Muttering, selling protection from themselves. The school inspectors arrive on Friday. Headmistress Grimble will pay 300 gold to have the book back on her desk by then, and its thieves in detention.',
};

const delinquent = { name: 'Delinquent wizard', lvl: 3, hp: 10, range: 'medium', dmg: '6', onHit: { stat: 'Dex', dd: 6, label: 'keep your footing', text: 'A gob of Grease lands at your feet.', effect: 'prone' }, note: 'Casts Arcane bolt (6 damage) and Grease (on hit, d6 Dex save or fall over); no melee; bad attitude' };
const spike = { name: 'Spike', lvl: 5, hp: 18, range: 'medium', dmg: '8', onHit: { stat: 'Dex', dd: 8, label: 'keep your footing', text: 'He greases the floor under you.', effect: 'prone' }, note: 'Gang leader; Arcane bolt (8 damage) and Grease (d8 Dex save or fall over); stolen grimoire; no melee' };

export const SECTIONS = {
  start: {
    text: [
      'Headmistress Grimble of the Collegium Arcana is a tall woman with a short temper and a hat like a church spire. “My grimoire,” she says. “Three hundred years of spells, and a pressed flower from my first teaching post. Taken by Spike Wimbledon and his gang, who were supposed to be in detention. They are in Muttering, extorting shopkeepers.” She sniffs. “The inspectors come on Friday. If they find the school’s grimoire is missing, they will close us down. Bring it back. Bring them back, if you can. I have a detention room waiting.”',
    ],
    on: [{ gold: 40, msg: 'She gives you 40GP for expenses, and a detention slip, signed.' }, { item: 'slip' }], onceOnly: true,
    choices: [{ text: 'Go to Muttering', to: 'muttering' }],
  },
  muttering: {
    text: (c) => [
      'Muttering is a nervous little market town. Every shop window has a scorch mark in it, and a sign that says PAID. The shopkeepers look at you, and then at the old bell foundry at the end of the high street, where green sparks fly from the chimney.',
      c.flags.knowsMum ? 'The baker’s, where Mrs Wimbledon works, is on the corner.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Talk to the shopkeepers', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'shopkeepers', fail: 'shopkeepers_scared', show: { notFlag: 'askedShops' } },
      { text: 'Go to the baker’s', to: 'baker', show: { flag: 'knowsMum', notFlag: 'mumComing' } },
      { text: 'Go to the bell foundry', to: 'foundry' },
      { text: 'Give up and go back to the Collegium', to: 'headmistress' },
    ],
  },
  shopkeepers: {
    on: [{ flag: 'askedShops' }, { flag: 'knowsMum' }],
    text: ['The ironmonger tells you there are five of them, and that they don’t like to get close: wizards never do. The greengrocer tells you they’re just kids, really, and bored. The baker’s boy, very quietly, tells you that Spike Wimbledon’s mother works at the bakery on the corner, and doesn’t know what her son is up to. “She thinks he’s at school,” he says. “Doing well.”'],
    choices: [{ text: 'Back to the high street', to: 'muttering' }],
  },
  shopkeepers_scared: {
    on: [{ flag: 'askedShops' }],
    text: ['The shopkeepers won’t talk. They look at the foundry, and then at their scorched windows, and shut their doors.'],
    choices: [{ text: 'Back to the high street', to: 'muttering' }],
  },
  baker: {
    text: ['Mrs Wimbledon is a small, floury woman who could knead a cow into a loaf. She is very proud of her son. “Top of his class, my Simon,” she says. “Studying hard at the Collegium. He doesn’t get home much.” She beams at you. Behind her, through the window, green sparks fly from the foundry chimney.'],
    choices: [
      { text: 'Tell her what her son is really doing, and take her to see', test: { stat: 'Cha', dd: 6, skill: ['social'], profs: ['Cleric', 'Missionary', 'Envoy'], why: 'you know how to break bad news' }, pass: 'mum_coming', fail: 'mum_denies' },
      { text: 'Leave her be', to: 'muttering' },
    ],
  },
  mum_denies: {
    text: ['Mrs Wimbledon won’t hear a word of it. Her Simon? Never. She throws you out of the shop with a stale baguette, which hurts.'],
    on: [{ damage: '1', from: 'A baguette' }],
    choices: [{ text: 'Back to the high street', to: 'muttering' }],
  },
  mum_coming: {
    on: [{ flag: 'mumComing' }],
    text: ['Mrs Wimbledon goes quiet. She takes off her apron, folds it, and picks up her rolling pin. “Show me,” she says.'],
    choices: [{ text: 'Go to the foundry together', to: 'foundry' }],
  },
  foundry: {
    text: (c) => [
      'The old bell foundry is a tall brick barn with a chimney and a broken bell lying in the yard. A lookout in a pointed hat sits on the bell, practising sparks.',
      c.flags.lookoutGone ? 'The lookout has gone.' : 'He sees you, and slides off the bell with his wand out. “Protection money,” he says. “Twenty gold. Or you’ll need protecting.”',
      c.flags.mumComing ? 'Mrs Wimbledon stands beside you, holding her rolling pin.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Let Mrs Wimbledon go in first', to: 'mum', show: { flag: 'mumComing' } },
      { text: 'Pay him (20GP)', to: 'inside', if: { gold: 20 }, effects: [{ gold: -20 }, { flag: 'lookoutGone' }], show: { notFlag: 'lookoutGone' } },
      { text: 'Hand him the Headmistress’s detention slip', to: 'slip', if: { item: 'slip' }, show: { notFlag: 'lookoutGone' } },
      { text: 'Blow your watchman’s whistle like a truant officer', to: 'whistle', if: { item: 'whistle' }, show: { notFlag: 'lookoutGone' } },
      { text: 'Deal with him', to: 'lookout_fight', show: { notFlag: 'lookoutGone' } },
      { text: 'Go in', to: 'inside', show: { flag: 'lookoutGone' } },
    ],
  },
  slip: {
    on: [{ flag: 'lookoutGone' }, { lose: 'slip' }, { flag: 'oneInDetention' }],
    text: ['The lookout reads the detention slip, and the colour drains out of him. It has the Headmistress’s signature on it, and it has his name on it, because she wrote it in advance. He hands you his wand and walks off towards the Collegium without a word, dragging his feet.'],
    choices: [{ text: 'Go in', to: 'inside' }],
  },
  whistle: {
    on: [{ flag: 'whistled' }, { flag: 'lookoutGone' }, { flag: 'gangThinned' }],
    text: ['You blow a long blast on your whistle and shout “TRUANCY!” The lookout drops his wand and runs. So, through the back door, do two more pointed hats. That leaves three inside, and they are very nervous.'],
    choices: [{ text: 'Go in', to: 'inside' }],
  },
  lookout_fight: {
    text: ['The lookout raises his wand and grins, which is a mistake, because it means you know exactly when he’s going to cast.'],
    fight: { monsters: [{ ...delinquent, name: 'Lookout' }], distance: 1, win: 'lookout_down', flee: { to: 'muttering', label: 'Back off down the high street' } },
  },
  lookout_down: {
    on: [{ flag: 'lookoutGone' }],
    text: ['The lookout sits down on the broken bell and starts to cry. He is about fourteen.'],
    choices: [{ text: 'Go in', to: 'inside' }],
  },
  inside: {
    text: (c, visits) => visits > 1 ? [
      'The gang are waiting for you this time, wands out, with the grimoire chained on the workbench behind them. “The grown-up’s back,” says Spike. “Brave. Or thick.”',
    ] : [
      `Inside the foundry, ${c.flags.gangThinned ? 'three' : 'five'} teenage wizards in pointed hats lounge on piles of stolen goods, making things float and setting fire to them. On a workbench at the back, chained shut and glowing, lies a fat leather book: the grimoire. Leaning on it is their leader, Spike, who has a wand in each hand and a moustache he is trying very hard to grow.`,
      '“Oh, look,” says Spike. “A grown-up.”',
    ],
    choices: [
      { text: 'Tell them they’re all in detention', test: { stat: 'Cha', dd: 10, skill: ['social'], profs: ['Cleric', 'Missionary'], why: 'you have an air of authority', mods: [{ if: { flag: 'oneInDetention' }, dd: 8 }] }, pass: 'surrender', fail: 'gang_fight' },
      { text: 'Offer them something better to do', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'], profs: ['Envoy'], why: 'you know what bored people want' }, pass: 'better_offer', fail: 'gang_fight' },
      { text: 'Throw your voice so it sounds like the Headmistress outside', cast: 'voice', pass: 'surrender', fail: 'gang_fight' },
      { text: 'Fight', to: 'gang_fight' },
    ],
  },
  better_offer: {
    on: [{ flag: 'offered' }],
    text: ['You tell them that extortion is small-time, and that the real money is in exams: sitting them for other people. Spike thinks about it. “That’s actually clever,” he says. “But we’d need the grimoire for that.” He looks at you. “Prove you’re serious. Beat me.”'],
    choices: [{ text: 'Fight Spike alone', to: 'spike_fight' }],
  },
  mum: {
    on: [{ flag: 'mumDone' }],
    text: (c) => [`Mrs Wimbledon walks into the foundry. The sparks stop. ${c.flags.gangThinned ? 'Three' : 'Five'} teenage wizards freeze. Spike drops both wands. “SIMON WIMBLEDON,” says his mother, in a voice that has kneaded ten thousand loaves. “WHAT. IS. THIS.”`, 'It is all over in less than a minute. They go quietly, in a line, holding hands, with Mrs Wimbledon at the back with her rolling pin. Spike carries the grimoire himself.'],
    choices: [{ text: 'Follow them to the Collegium', to: 'headmistress' }],
  },
  surrender: {
    on: [{ flag: 'surrendered' }],
    text: ['Something in your voice reminds them of every teacher they ever had. They look at each other. They look at the floor. One by one, the wands go down, and Spike unchains the grimoire and hands it to you without looking at you. “Can we at least walk back on our own?” he says. “Not in a line?”'],
    choices: [{ text: 'March them back to the Collegium, in a line', to: 'headmistress' }],
  },
  gang_fight: {
    text: ['Two of the gang step forward with their wands up, while the rest hang back and jeer. The floor goes slick with Grease, and the air fills with bolts.'],
    fight: {
      monsters: [delinquent, delinquent],
      distance: 1, win: 'spike_fight', flee: { to: 'muttering', label: 'Run for it' },
      special: [
        { label: 'Hold up your hand mirror and bounce a bolt back', if: { item: 'mirror' }, flag: 'mirrorBolt', test: { stat: 'Dex', dd: 6, skill: 'defend:ranged' }, text: 'The bolt hits your mirror and comes straight back at the wizard who cast it.', failText: 'You get the angle wrong, and the bolt takes the mirror out of your hand.', dmg: '6' },
        { label: 'Throw a bucket of water on the Grease', if: { item: 'bucket' }, flag: 'degreased', text: 'The Grease turns to soapy foam. Two wizards slip in it themselves.', stun: 1 },
      ],
    },
  },
  spike_fight: {
    text: (c) => [c.flags.offered ? 'Spike rolls up his sleeves. “No hard feelings,” he says, and greases the floor under you.' : 'Spike steps over his gang, both wands raised. “Right,” he says. “My turn.”'],
    fight: {
      monsters: [spike], distance: 1, win: 'spike_down', flee: { to: 'muttering', label: 'Run for it' },
      special: [{ label: 'Hold up your hand mirror and bounce a bolt back', if: { item: 'mirror' }, flag: 'mirrorSpike', test: { stat: 'Dex', dd: 6, skill: 'defend:ranged' }, text: 'The bolt hits your mirror and goes straight back into Spike’s moustache.', failText: 'You get the angle wrong, and the bolt takes the mirror out of your hand.', dmg: '8' }],
    },
  },
  spike_down: {
    on: [{ flag: 'spikeDown' }],
    text: ['Spike sits down on the floor, holding his singed moustache. The gang look at him, and at you, and put their wands away. The grimoire sits on the workbench, chained and glowing.'],
    choices: [
      { text: 'Take the grimoire and march them all back to the Collegium', to: 'headmistress', effects: [{ flag: 'surrendered' }] },
      { text: 'Take the grimoire and sell it to the highest bidder instead', to: 'sold', show: { flag: 'offered' } },
    ],
  },
  sold: {
    on: [{ flag: 'grimoireSold' }],
    text: ['There’s a man in the next town who buys books with chains on them and doesn’t ask why. He pays very well. Spike watches you go, with something like respect.'],
    choices: [{ text: 'Leave town', to: 'headmistress' }],
  },
  headmistress: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'mumDone' }, { flag: 'surrendered' }] }, gold: 300, uncapped: true, msg: 'Headmistress Grimble pays 300GP, and puts the grimoire back on her desk.' },
      { if: { flag: 'grimoireSold' }, gold: 450, uncapped: true, msg: 'The man in the next town pays 450GP for the grimoire.' },
    ],
    text: (c) => [
      c.flags.mumDone ? 'The inspectors arrive on Friday to find the Collegium spotless, the grimoire on the Headmistress’s desk, and five delinquent wizards writing lines under the eye of a small floury woman with a rolling pin. The Headmistress gives Mrs Wimbledon a job.'
        : c.flags.surrendered ? 'The inspectors arrive on Friday to find the grimoire on the Headmistress’s desk and five delinquent wizards in detention. They are very impressed. The Headmistress takes all the credit.'
          : c.flags.grimoireSold ? 'The inspectors arrive on Friday, find no grimoire, and close the Collegium. Its pupils are sent home. In Muttering, a gang of five young wizards starts a new business sitting other people’s exams.'
            : 'The inspectors arrive on Friday, find no grimoire, and close the Collegium. Headmistress Grimble does not pay you, and puts you on a list.',
      `You leave Muttering with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'You are killed by a teenager. The teenager is very sorry, and gets detention for it.',
  'Your adventure ends here.',
];
