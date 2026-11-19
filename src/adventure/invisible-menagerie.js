// THE INVISIBLE MENAGERIE — steal an invisible egg from a travelling show of invisible animals. For a level 6–7 scumbag.
// Invisible monsters are hard to hit (d20) until something shows their outline: sand, flour, water, a ward, a sharp nose.

export const META = {
  tier: 7, id: 'invisible-menagerie', title: 'The Invisible Menagerie', levels: '6–7', final: 'collector',
  blurb: 'Professor Peculius’s Invisible Menagerie charges five gold to look at empty cages. Everyone assumes it’s a swindle. Lady Vellum, a collector of rare and impossible things, knows better, and will pay 400 gold for the egg of the invisible ostrich. Someone else is after the animals too. Someone from a very long way away.',
};

const porcupine = { name: 'Invisible porcupine', lvl: 3, range: 'engaged', feats: ['invisible'], note: 'Invisible (attacks against it use a d20 until you can see it); very, very spiky' };
const ape = { name: 'Invisible ape', lvl: 6, hp: 20, range: 'short', feats: ['invisible'], onHit: { stat: 'Con', dd: 8, label: 'keep your lunch down', text: 'Invisible faeces. You fall to your knees, retching.', effect: 'prone' }, note: 'Invisible; detected by smell; throws invisible faeces (on hit, d8 Con save or retch on the floor)' };
const visitor = { name: 'The Visitor', lvl: 6, range: 'medium', onHit: { stat: 'Dex', dd: 8, label: 'dodge the ray', text: 'The ray clips you.', effect: 'disintegrate' }, note: 'Ray gun: on hit, d8 Dex save or something non-magical and non-organic you’re wearing turns to dust' };

export const SECTIONS = {
  start: {
    text: [
      'Professor Peculius’s Invisible Menagerie has pitched its tent on the common outside Upper Gloaming. Posters show a lot of empty space, beautifully drawn. SEE THE INVISIBLE APE! SEE THE INVISIBLE OSTRICH! SEE NOTHING AT ALL, FOR FIVE GOLD!',
      'Lady Vellum meets you at the gate in a veil and a great many furs. “The ostrich is real,” she says. “It has laid an egg. Invisible, naturally. Four hundred gold, and I shan’t ask how.” As she leaves, something whooshes overhead with no noise at all and lands in the field behind the tent with a soft green glow.',
    ],
    choices: [
      { text: 'Pay 5GP and go in like everyone else', to: 'big_top', if: { gold: 5 }, effects: [{ gold: -5 }] },
      { text: 'Slip under the canvas', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'big_top', fail: 'strongman' },
      { text: 'Go and see what landed in the field', to: 'saucer' },
    ],
  },
  gate: {
    text: (c) => [
      c.flags.brunoAngry ? 'You’re back at the menagerie gate. Bruno stands in front of it with his arms folded, watching you, and every so often he cracks his knuckles.' : 'You’re back at the menagerie gate. The posters flap in the wind. Inside, a crowd laughs at nothing.',
      c.flags.visitorGone ? 'The field behind the tent is empty, apart from a scorched circle in the grass.' : 'In the field behind the tent, something silver hums.',
    ],
    choices: [
      { text: 'Pay 5GP and go in like everyone else', to: 'big_top', if: { gold: 5 }, effects: [{ gold: -5 }] },
      { text: 'Slip under the canvas', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'big_top', fail: 'strongman', show: { notFlag: 'brunoAngry' } },
      { text: 'Fight Bruno for the gate', to: 'bruno_fight', show: { flag: 'brunoAngry' } },
      { text: 'Go back to the field', to: 'saucer', show: { notFlag: 'visitorGone' } },
    ],
  },
  strongman: {
    text: ['A hand like a ham lifts you out from under the canvas by your collar. It belongs to Bruno, the menagerie’s strongman, who is also its ticket inspector, cook and vet. “Five gold,” he says, “or I fold you.”'],
    choices: [
      { text: 'Pay up (5GP)', to: 'big_top', if: { gold: 5 }, effects: [{ gold: -5 }] },
      { text: 'Challenge him to arm-wrestle for free entry', test: { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Pit fighter', 'Sellsword'], why: 'you’ve done this in taverns' }, pass: 'bruno_beaten', fail: 'bruno_fight' },
      { text: 'Fight him', to: 'bruno_fight' },
    ],
  },
  bruno_beaten: {
    on: [{ flag: 'bruno' }],
    text: ['Bruno’s arm goes down with a crash that shakes the tent. He looks at it, then at you, with deep respect. “Free entry,” he says. “And a tip. The ape hates the smell of onions. Never stand downwind of the ape.”'],
    choices: [{ text: 'Go into the big top', to: 'big_top' }],
  },
  bruno_fight: {
    on: [{ flag: 'brunoAngry' }],
    text: ['Bruno rolls up his sleeves. He has a tattoo of his own name on each arm, in case he forgets.'],
    fight: { monsters: [{ name: 'Bruno', lvl: 4, range: 'engaged', onHit: { stat: 'Str', dd: 6, label: 'stay upright', text: 'He folds you.', effect: 'prone' }, note: 'Strongman, ticket inspector, cook and vet; on hit, d6 Str save or be folded (prone)' }], win: 'bruno_down', flee: { to: 'gate', label: 'Back off' } },
  },
  bruno_down: {
    text: ['Bruno sits down in the sawdust and decides you can go in for free.'],
    choices: [{ text: 'Go into the big top', to: 'big_top' }],
  },
  saucer: {
    text: (c) => c.flags.visitorAngry ? [
      'The Visitor is waiting by its craft with its hairdryer raised. “YOU AGAIN,” it says. “HOSTILE SPECIMEN. I HAVE RECALIBRATED.”',
    ] : c.flags.visitorDeal ? [
      'The Visitor is still by its craft, studying the tent through its tube. It waves at you with three fingers. “BRING THE APE,” it says. “I HAVE PREPARED A SMALL CAGE AND A VERY LARGE BANANA.”',
    ] : c.flags.visitorFriend ? [
      'The Visitor is still by its craft, studying the tent through its tube. It nods at you, politely, as one rare thing to another.',
    ] : [
      'In the field behind the tent sits a silver disc the size of a haystack, humming. Beside it stands a small grey person in a silver suit, holding a pistol shaped like a hairdryer. It is studying the menagerie tent through a tube. It turns its enormous black eyes on you.',
      '“GREETINGS,” it says, in a voice like a wet finger on glass. “I AM COLLECTING SPECIMENS. YOUR PLANET’S INVISIBLE APE IS VERY RARE. ARE YOU RARE?”',
    ],
    choices: [
      { text: 'Show it the glowing slate', to: 'visitor_trade', if: { item: 'ipad' }, show: { notFlag: 'visitorAngry' } },
      { text: 'Hand it the time-traveller’s business card', to: 'visitor_card', if: { item: 'card' }, show: { notFlag: 'visitorAngry' } },
      { text: 'Say you’re very common, and offer to help it catch the ape', test: { stat: 'Cha', dd: 8, skill: ['social', 'languages', 'lying'], profs: ['Envoy'], why: 'diplomacy is your trade' }, pass: 'visitor_deal', fail: 'visitor_fight', show: { none: [{ flag: 'visitorAngry' }, { flag: 'visitorDeal' }, { flag: 'visitorFriend' }] } },
      { text: 'Offer to help it catch the ape', to: 'visitor_deal', show: { flag: 'visitorFriend', notFlag: 'visitorDeal' } },
      { text: 'Attack it', to: 'visitor_fight' },
      { text: 'Back away to the tent', to: 'gate' },
    ],
  },
  visitor_trade: {
    on: [{ lose: 'ipad' }, { gold: 150, msg: 'It pays you in small heavy coins with no faces. A fence will take them as 150GP.' }, { flag: 'visitorFriend' }], onceOnly: true,
    text: ['The Visitor takes the slate in both hands and makes a sound like a kettle. “PRIMITIVE,” it says reverently. “WONDERFULLY PRIMITIVE. IT IS AT ONE PER CENT.” It pays you handsomely and promises not to disintegrate you.'],
    choices: [{ text: 'Offer to help it catch the ape', to: 'visitor_deal' }, { text: 'Go back to the tent', to: 'gate' }],
  },
  visitor_card: {
    on: [{ lose: 'card' }, { flag: 'visitorFriend' }],
    text: ['The Visitor reads the card. “DISRUPTOR,” it says. “THOUGHT LEADER.” It looks at you with something like fear. “YOU ARE FROM THE SAME SPECIES AS THAT ONE. HE TRIED TO SELL ME A TIMESHARE.” It decides you are too dangerous to disintegrate.'],
    choices: [{ text: 'Offer to help it catch the ape', to: 'visitor_deal' }, { text: 'Go back to the tent', to: 'gate' }],
  },
  visitor_deal: {
    on: [{ flag: 'visitorDeal' }],
    text: ['“ACCEPTABLE,” says the Visitor. “BRING THE APE TO MY CRAFT. I SHALL PAY YOU IN ANY QUANTITY OF YOUR YELLOW METAL. I HAVE A GREAT DEAL OF IT. IT IS USELESS.”'],
    choices: [{ text: 'Go back to the tent', to: 'gate' }],
  },
  visitor_fight: {
    on: [{ flag: 'visitorAngry' }, { unflag: 'visitorDeal' }],
    text: ['The Visitor raises its hairdryer. “HOSTILE,” it says sadly. “AS PREDICTED.”'],
    fight: { monsters: [visitor], distance: 2, win: 'visitor_down', flee: { to: 'gate', label: 'Dive behind the tent' } },
  },
  visitor_down: {
    on: [{ flag: 'visitorGone' }, { gold: 100, msg: 'Inside the craft: a sack of useless yellow metal. 100GP.' }], onceOnly: true,
    text: ['The Visitor retreats into its craft, which takes off silently and vanishes into the clouds. It leaves behind a sack of gold and a very bad review of your planet.'],
    choices: [{ text: 'Go back to the tent', to: 'gate' }],
  },
  big_top: {
    text: (c) => [
      c.flags.profDown
        ? 'Inside the big top, a crowd of villagers stares at a ring of empty cages. With nobody to describe what they can’t see, they are starting to suspect they have been had.'
        : `Inside the big top, a crowd of villagers stares at a ring of empty cages while Professor Peculius, in a top hat and a cape covered in eyes, describes what they can’t see. ${c.flags.apeSold || c.flags.apeDown ? '“And here,” he cries, “the INVISIBLE APE!” Nothing happens. He taps the cage. Nothing happens again. The crowd applauds the best bit yet.' : '“And here,” he cries, “the INVISIBLE APE!” A cage door rattles. The crowd laughs. Something in the cage grunts, and the smell reaches the back row.'}`,
      'There’s a food stall selling flour cakes, the professor’s caravan behind a curtain, an aviary roped off at the back, and a pen of straw marked DO NOT TOUCH.',
      c.flags.flour ? 'Your pockets are full of flour.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Buy a sack of flour from the food stall (2GP)', to: 'flour', if: { gold: 2 }, show: { notFlag: 'flour' } },
      { text: 'Go to the aviary', to: 'aviary', show: { notFlag: 'egg' } },
      { text: 'Step into the pen marked DO NOT TOUCH', to: 'porcupine', show: { notFlag: 'keys' } },
      { text: 'Get a closer look at the ape', to: 'ape_cage', show: { none: [{ flag: 'apeSold' }, { flag: 'apeDown' }] } },
      { text: 'Walk into the professor’s caravan', to: 'caravan', show: { flag: 'profDown' } },
      { text: 'Slip behind the curtain to the professor’s caravan', show: { notFlag: 'profDown' }, test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'caravan', fail: 'professor' },
      { text: 'Leave', to: 'collector' },
    ],
  },
  flour: {
    on: [{ flag: 'flour' }, { gold: -2 }],
    text: ['The woman at the stall sells you a sack of flour and a knowing look. “For the porcupine?” she says. “Throw it before you step, love, not after.”'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  porcupine: {
    text: ['The pen looks empty: straw, a water trough, a sign. The straw near the trough is flattened in a shape about the size of a pig. The shape breathes.'],
    choices: [
      { text: 'Throw flour over it first', to: 'porcupine_seen', if: { flag: 'flour', flagText: 'flour' } },
      { text: 'Throw pocket sand over it', to: 'porcupine_seen', if: { item: 'pocketsand' }, effects: [{ lose: 'pocketsand' }] },
      { text: 'Splash it with a bucket of trough water', to: 'porcupine_seen', if: { item: 'bucket' } },
      { text: 'Walk across carefully', test: { stat: 'Dex', dd: 8, save: true }, pass: 'porcupine_past', fail: 'porcupine_fight' },
      { text: 'Back to the ring', to: 'big_top' },
    ],
  },
  porcupine_seen: {
    on: [{ flag: 'porcupineSeen' }],
    text: ['A white, dusty, extremely annoyed porcupine appears in the straw, every quill outlined. It is the size of a pig. Now you can see it, you can walk round it. Underneath it, where it was sitting, is a ring of keys.'],
    choices: [
      { text: 'Hook the keys out from under it with your pole', to: 'keys', if: { item: 'pole' } },
      { text: 'Lure it off the keys with your rations', to: 'keys', if: { item: 'rations' }, effects: [{ lose: 'rations' }] },
      { text: 'Shoo it off the keys', test: { stat: 'Wis', dd: 8, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know animals' }, pass: 'keys', fail: 'porcupine_fight' },
      { text: 'Back to the ring', to: 'big_top' },
    ],
  },
  porcupine_past: {
    text: ['You cross the pen without touching anything you can’t see. Under a pile of straw by the far fence, something jingles: a ring of keys, dropped by someone less careful.'],
    choices: [{ text: 'Take the keys', to: 'keys' }],
  },
  porcupine_fight: {
    text: ['Your foot finds the porcupine. The porcupine finds your foot.'],
    fight: { monsters: [porcupine], win: 'keys', flee: { to: 'big_top', label: 'Hop back into the ring' }, special: [{ label: 'Throw flour over it', if: { flag: 'flour' }, flag: 'porcFloured', text: 'A cloud of flour, and there it is, every quill outlined.', reveal: true }] },
  },
  keys: {
    on: [{ flag: 'keys' }],
    text: ['The keys are labelled APE, OSTRICH, CARAVAN and DO NOT LOSE.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  aviary: {
    text: ['Behind a rope at the back of the tent, a tall cage stands empty. On a platform twelve feet up sits a large, invisible bird. You know it’s there because the platform creaks and every so often an invisible beak snaps at a passing fly. Below it, the straw is churned by enormous invisible feet.'],
    choices: [
      { text: 'Unlock the cage with the keys', to: 'aviary_in', if: { flag: 'keys', flagText: 'the keys' } },
      { text: 'Pick the lock', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'aviary_in', fail: 'aviary_noise', if: { item: 'tools' } },
      { text: 'Burn through the lock with acid', to: 'aviary_in', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Back to the ring', to: 'big_top' },
    ],
  },
  aviary_noise: {
    text: ['Your pick snaps with a ping. On its platform, the invisible ostrich stands up, which you can tell because the platform sighs with relief.'],
    choices: [{ text: 'Back to the ring before anyone comes', to: 'big_top' }],
  },
  aviary_in: {
    text: ['Inside the cage, the ostrich is up on its platform, and it is not happy to see you. The egg must be up there with it. Somewhere. Invisible.'],
    choices: [
      { text: 'Feel around the platform for the egg', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'], mods: [{ if: { anyItem: ['pocketsand'] }, dd: 8 }, { if: { flag: 'flour' }, dd: 8 }] }, pass: 'egg', fail: 'ostrich_fight' },
      { text: 'Cast Throw voice to call it down, like a lady ostrich', cast: 'voice', pass: 'ostrich_lured', fail: 'ostrich_fight' },
      { text: 'Cast Ward on the platform, so it rings when the ostrich moves', cast: 'ward', pass: 'ostrich_lured', fail: 'ostrich_fight' },
      { text: 'Tempt it down with your rations', to: 'ostrich_lured', if: { item: 'rations' }, effects: [{ lose: 'rations' }] },
      { text: 'Sweep the platform with your pole until something egg-shaped rolls off into your arms', test: { stat: 'Dex', dd: 6, save: true }, pass: 'egg', fail: 'ostrich_fight', if: { item: 'pole' } },
      { text: 'Climb up and take the egg by force', to: 'ostrich_fight' },
    ],
  },
  ostrich_lured: {
    text: ['The ostrich comes down off its platform with a thump and stalks off to the far end of the cage, where it pecks at nothing. You climb up and pat the platform until your hand finds something smooth, warm and the size of your head.'],
    choices: [{ text: 'Take the egg', to: 'egg' }],
  },
  ostrich_fight: {
    text: ['Something invisible and seven feet tall comes down off the platform at you, kicking.'],
    fight: {
      monsters: [{ name: 'Invisible ostrich', lvl: 4, range: 'engaged', feats: ['invisible'], note: 'Invisible; kicks like a horse; very protective of its egg' }],
      win: 'egg', flee: { to: 'big_top', label: 'Run for it' },
      special: [
        { label: 'Throw flour at the noise', if: { flag: 'flour' }, flag: 'ostFloured', text: 'A white ostrich appears, coughing.', reveal: true },
        { label: 'Splash it with a bucket of water', if: { item: 'bucket' }, flag: 'ostWet', text: 'Water runs off an ostrich-shaped nothing, and for a moment, you can see its outline.', reveal: true },
      ],
    },
  },
  egg: {
    on: [{ flag: 'egg' }, { msg: 'The egg weighs as much as a small dog and is perfectly invisible. You keep it under your arm, where you can feel it.' }],
    text: ['You tuck the egg into your coat. Your coat now has a large, egg-shaped bulge that nobody can see the cause of.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  ape_cage: {
    text: (c) => [
      'The ape’s cage is the size of a cottage and seems to be empty, apart from the smell. The bars are bent outwards in two places. Invisible bananas lie peeled on the floor.',
      c.flags.bruno ? 'You make sure you’re standing upwind.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Open the cage with the keys and lead it out to the Visitor', test: { stat: 'Wis', dd: 8, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know animals', mods: [{ if: { any: [{ flag: 'bruno' }, { item: 'rations' }, { item: 'rope' }, { item: 'chain' }] }, dd: 4 }] }, pass: 'ape_led', fail: 'ape_fight', if: { flag: 'keys', flagText: 'the keys' }, show: { flag: 'visitorDeal' } },
      { text: 'Rattle the bars', to: 'ape_fight' },
      { text: 'Back away', to: 'big_top' },
    ],
  },
  ape_led: {
    on: [{ flag: 'apeSold' }, { gold: 250, msg: 'The Visitor pays in useless yellow metal: 250GP.' }], onceOnly: true,
    text: ['You walk an invisible ape out of the back of the tent, holding an invisible banana in front of it, which is harder than it sounds. The Visitor greets it with a squeal of joy, and the craft takes off with the ape inside, both of them waving.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  ape_fight: {
    text: ['Something huge and invisible hits the bars from the inside, and the cage door bursts open. You smell it before anything else.'],
    fight: {
      monsters: [ape], distance: 1, win: 'ape_down', flee: { to: 'big_top', label: 'Run into the crowd' },
      special: [
        { label: 'Throw flour at the smell', if: { flag: 'flour' }, flag: 'apeFloured', text: 'A white, ape-shaped cloud appears, roaring. Now you can see what you’re hitting.', reveal: true },
        { label: 'Follow it by smell', if: { any: [{ skill: 'survival' }, { feature: 'hunter' }] }, flag: 'apeSniffed', text: 'You close your eyes and track it by its stink. There.', reveal: true },
      ],
    },
  },
  ape_down: {
    on: [{ flag: 'apeDown' }],
    text: ['The invisible ape lies down in the sawdust and sulks, invisibly. The crowd, who saw a scumbag fighting nothing for five minutes, give you a round of applause.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  caravan: {
    text: ['The professor’s caravan is a cramped wooden box full of velvet, posters and a small iron safe. On the desk lies an open ledger of takings: SEE NOTHING, five gold, a thousand times over.'],
    choices: [
      { text: 'Open the safe with the keys', to: 'safe', if: { flag: 'keys', flagText: 'the keys' }, show: { notFlag: 'safe' } },
      { text: 'Pick the safe', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'safe', fail: 'professor', if: { item: 'tools' }, show: { notFlag: 'safe' } },
      { text: 'Back to the ring', to: 'big_top' },
    ],
  },
  safe: {
    on: [{ flag: 'safe' }, { gold: 180 }],
    text: ['The safe holds a season’s takings from people paying to see nothing. You leave him the nothing.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  professor: {
    redirect: [{ if: { flag: 'profDown' }, to: 'safe_jam' }],
    text: ['Professor Peculius catches you in the act. He doesn’t shout. He sweeps back his cape, and his hands start to glow. “My animals,” he says, “are invisible. I am merely very hard to see coming.”'],
    fight: {
      monsters: [{ name: 'Professor Peculius', lvl: 5, range: 'medium', dmg: '10', note: 'Showman and wizard; casts arcane bolt (10 damage)' }],
      distance: 1, win: 'professor_down', flee: { to: 'big_top', label: 'Lose yourself in the crowd' },
    },
  },
  safe_jam: {
    text: ['Your pick snaps off in the lock. The safe stays shut. The professor’s empty cape watches you from the floor.'],
    choices: [{ text: 'Back to the ring', to: 'big_top' }],
  },
  professor_down: {
    on: [{ flag: 'profDown' }],
    text: ['The professor collapses into his cape. When you look again, the cape is empty. He was never very easy to see.'],
    choices: [{ text: 'Search the caravan', to: 'caravan' }],
  },
  collector: {
    end: 'victory',
    on: [{ if: { flag: 'egg' }, gold: 400, uncapped: true, msg: 'Lady Vellum pays 400GP for the invisible egg.' }],
    text: (c) => [
      c.flags.egg
        ? 'Lady Vellum takes the invisible egg with trembling hands and puts it in a glass case, where it sits in pride of place, looking exactly like an empty glass case.'
        : 'Lady Vellum is not pleased to see you empty-handed. “Next time,” she says, “bring me nothing I can’t see.”',
      c.flags.apeSold ? 'Far overhead, a silent green light crosses the stars. Somewhere up there, an invisible ape is having the time of its life.' : '',
      `You leave Upper Gloaming with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ].filter(Boolean),
  },
};

export const DEATH_TEXT = [
  'They put you in an empty cage with a sign that says SCUMBAG. Everybody pays five gold to see it.',
  'Your adventure ends here.',
];
