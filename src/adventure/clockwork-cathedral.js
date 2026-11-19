// THE CLOCKWORK CATHEDRAL — stop a mechanical bishop before the Archbishop arrives. For a level 7–8 scumbag.

export const META = {
  tier: 8, id: 'clockwork-cathedral', title: 'The Clockwork Cathedral', levels: '7–8', final: 'easter',
  blurb: 'Two hundred years ago, the clockmaker Ezra Tock built Cogsbury Cathedral a bishop: brass, wind-up and word-perfect. Last week it started excommunicating people. Then the brass gargoyles came down off the roof. The Archbishop arrives on Sunday. The Dean will pay 350 gold to have His Mechanical Grace stopped, or at least made to behave.',
};

const gargoyle = { name: 'Brass gargoyle', lvl: 5, hp: 8, ap: 4, range: 'engaged', note: 'Clockwork; wings and teeth (8 HP, 4 AP); ticks loudly' };
const bishop = { name: 'His Mechanical Grace', lvl: 8, hp: 28, ap: 8, range: 'engaged', dmg: '2d8', note: 'Clockwork bishop (28 HP, 8 AP); brass crozier (2d8); excommunicates' };

export const SECTIONS = {
  start: {
    text: (c, visits) => visits > 1 ? ['You’re back on the cathedral steps, which are still shaking with the bells. The Dean looks at you hopefully, holding his hat on.'] : [
      'The Dean of Cogsbury Cathedral meets you on the steps, holding his hat on with both hands, because the bells are ringing so hard the steps shake. “It’s rung every bell in the tower for six days,” he says. “It’s excommunicated the choir, the verger, two dukes and a dog. It’s locked itself in the clock tower with the gargoyles.”',
      '“Ezra Tock built it. His tomb is in the crypt. His workshop’s in the tower. If anyone knew how it works, it was him, and he’s dead.” The Dean presses 50 gold into your hand. “Three hundred more when it’s stopped. Gently, if you can. It’s two hundred years old. It’s a treasure.”',
    ],
    on: [{ gold: 50 }], onceOnly: true,
    choices: [
      { text: 'Go into the nave', to: 'nave' },
      { text: 'Go down to the crypt', to: 'crypt' },
    ],
  },
  nave: {
    text: (c) => [
      'Inside, the cathedral roars with bells. Pews lie overturned. At the far end, a spiral stair climbs into the clock tower.',
      c.flags.gargoylesGone ? 'The nave is quiet now, apart from the bells.' : 'Two brass gargoyles stalk the nave on clicking feet, wings half-open, looking for sinners.',
    ],
    choices: [
      { text: 'Creep past the gargoyles to the tower stair', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'stair', fail: 'gargoyle_fight', show: { notFlag: 'gargoylesGone' } },
      { text: 'Jam their joints with iron spikes as they pass', test: { stat: 'Dex', dd: 8, skill: ['skulduggery', 'athletics'] }, pass: 'jammed', fail: 'gargoyle_fight', if: { item: 'spikes' }, show: { notFlag: 'gargoylesGone' } },
      { text: 'Pour glue in their joints', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'jammed', fail: 'gargoyle_fight', if: { item: 'glue' }, show: { notFlag: 'gargoylesGone' } },
      { text: 'Fight them', to: 'gargoyle_fight', show: { notFlag: 'gargoylesGone' } },
      { text: 'Climb the tower stair', to: 'stair', show: { flag: 'gargoylesGone' } },
      { text: 'Go down to the crypt', to: 'crypt' },
      { text: 'Give up and leave', to: 'easter' },
    ],
  },
  jammed: {
    on: [{ flag: 'gargoylesGone' }],
    text: ['You get in close as they click past and jam their knee joints. Both gargoyles lock up mid-stride and stand there, ticking furiously, like very angry ornaments.'],
    choices: [{ text: 'Climb the tower stair', to: 'stair' }],
  },
  gargoyle_fight: {
    text: ['The gargoyles see you, and come at you on clicking brass feet.'],
    fight: {
      monsters: [gargoyle, gargoyle], win: 'gargoyles_down', flee: { to: 'start', label: 'Run out of the cathedral' },
      special: [{ label: 'Pour your oil on the flagstones under them', if: { item: 'oil' }, flag: 'slicked', text: 'Brass feet on oiled stone. They skid, crash into each other and go down in a heap of springs.', stun: 1 }],
    },
  },
  gargoyles_down: {
    on: [{ flag: 'gargoylesGone' }],
    text: ['The gargoyles lie on the flagstones in a spray of springs and cogs, still ticking faintly.'],
    choices: [{ text: 'Climb the tower stair', to: 'stair' }],
  },
  crypt: {
    dark: true,
    text: (c) => [
      'The crypt is quiet, the bells muffled to a hum. Among the bishops’ tombs is a plain one with a clock carved on the lid instead of a face: EZRA TOCK, CLOCKMAKER. HE KEPT GOOD TIME.',
      c.flags.tombOpen ? 'The lid stands open.' : 'The lid has a keyhole in it, shaped like a winding key.',
    ],
    choices: [
      { text: 'Pick the tomb’s lock', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'tomb', fail: 'tomb_trap', if: { item: 'tools' }, show: { notFlag: 'tombOpen' } },
      { text: 'Lever the lid off', test: { stat: 'Str', dd: 10, skill: ['bruteforce'] }, pass: 'tomb', fail: 'tomb_trap', if: { anyItem: ['prybar', 'pick'] }, show: { notFlag: 'tombOpen' } },
      { text: 'Read the inscriptions round the tomb', test: { stat: 'Int', dd: 8, skill: ['analysis', 'languages'] }, pass: 'inscription', fail: 'worn', show: { none: [{ flag: 'readTomb' }, { flag: 'triedTomb' }] } },
      { text: 'Go up to the nave', to: 'nave' },
    ],
  },
  worn: {
    on: [{ flag: 'triedTomb' }],
    text: ['The inscription round the tomb is tiny and worn, and in a clockmaker’s shorthand. You make out WHEEL, and SUNDAY, and nothing else.'],
    choices: [{ text: 'Back to the tomb', to: 'crypt' }],
  },
  inscription: {
    on: [{ flag: 'readTomb' }],
    text: ['Round the base of the tomb, in tiny letters: MY GRACE RUNS TRUE WHILE HIS FOURTH WHEEL TURNS. IF HE STRAYS, LOOK TO THE FOURTH WHEEL. AND OIL HIM ON A SUNDAY. Somebody, you suspect, has not been oiling him on Sundays.'],
    choices: [{ text: 'Back to the tomb', to: 'crypt' }],
  },
  tomb_trap: {
    on: [{ damage: '2d6', from: 'A clockwork trap' }],
    text: ['Something inside the tomb goes TICK, and a spring-loaded spike comes out of the lid. Ezra Tock didn’t trust anyone.'],
    choices: [{ text: 'Try again', to: 'crypt' }],
  },
  tomb: {
    on: [{ flag: 'tombOpen' }, { item: 'windingkey', msg: 'Ezra Tock’s winding key: brass, as long as your arm.' }],
    text: ['Inside the tomb lies Ezra Tock, small and neat, holding a brass winding key as long as your arm, the way other people are buried holding a sword. He doesn’t object when you take it.'],
    choices: [{ text: 'Go up to the nave', to: 'nave' }],
  },
  stair: {
    text: ['The tower stair winds up and up, past ropes thrashing in the bell chamber, to a door at the top that ticks.'],
    choices: [
      { text: 'Climb on up', test: { stat: 'Str', dd: 6, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'clock_room', fail: 'bell_rope' },
    ],
  },
  bell_rope: {
    on: [{ damage: 'd6', from: 'A bell rope' }],
    text: ['A thrashing bell rope catches you round the middle, hauls you up to the ceiling, and drops you on the stair. You keep going, a bit more carefully.'],
    choices: [{ text: 'Keep climbing', to: 'clock_room' }],
  },
  clock_room: {
    text: (c) => [
      'The clock room is a cathedral of its own: wheels as big as millstones, turning; pendulums swinging; and in the middle of it all, His Mechanical Grace, the clockwork bishop, seven feet of brass in a mitre, pulling bell ropes with every one of its six arms. It turns its head, with a click, and looks at you with glass eyes.',
      '“SINNER,” it says, in a voice like a music box. “YOU ARE EXCOMMUNICATED. KNEEL.”',
      c.flags.readTomb ? 'In the wall of gears behind it, you count the wheels: the fourth one is stuck, a broken tooth jammed in its teeth.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Look for what’s gone wrong, with your jeweller’s loupe', to: 'loupe', if: { item: 'loupe' }, show: { notFlag: 'readTomb' } },
      { text: 'Free the fourth wheel', test: { stat: 'Dex', dd: 8, skill: ['skulduggery', 'analysis'], mods: [{ if: { anyItem: ['tools', 'prybar'] }, dd: 4 }] }, pass: 'fixed', fail: 'bishop_fight', show: { flag: 'readTomb' } },
      { text: 'Oil the works with your flask of oil', to: 'oiled', if: { item: 'oil' }, show: { flag: 'readTomb' } },
      { text: 'Wind it down with Ezra Tock’s key', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'wound_down', fail: 'bishop_fight', if: { item: 'windingkey' } },
      { text: 'Kneel and confess, and hope it listens', test: { stat: 'Cha', dd: 10, skill: ['social'], profs: ['Cleric', 'Missionary'], why: 'you know the words' }, pass: 'confession', fail: 'bishop_fight' },
      { text: 'Jam the gears with an iron spike', to: 'spiked', if: { item: 'spikes' } },
      { text: 'Fight it', to: 'bishop_fight' },
    ],
  },
  loupe: {
    on: [{ flag: 'readTomb' }],
    text: ['Through your loupe, among a thousand wheels, you find it: the fourth wheel from the top, stuck, with a broken tooth jammed between its cogs. Every other wheel is straining against it. That’s what’s wrong with him.'],
    choices: [{ text: 'Back to the bishop', to: 'clock_room' }],
  },
  confession: {
    on: [{ flag: 'confessed' }],
    text: ['You kneel, and confess. It takes a while. The bishop listens, head on one side, clicking. Then it lifts one brass hand and blesses you, and stops ringing the bells, for exactly as long as it takes to say “GO IN PEACE”, and starts again. It needs more than a confession.'],
    choices: [{ text: 'Back to the bishop', to: 'clock_room' }],
  },
  fixed: {
    on: [{ flag: 'fixed' }],
    text: ['You get your hand in among the wheels, find the broken tooth and work it free. The fourth wheel turns. Every wheel in the tower shudders, and settles. The bells stop. His Mechanical Grace lowers its six arms, looks round the clock room, and says, in a perfectly reasonable voice: “GOOD AFTERNOON. I APPEAR TO HAVE BEEN UNWELL.”'],
    choices: [{ text: 'Go and tell the Dean', to: 'easter' }],
  },
  oiled: {
    on: [{ flag: 'fixed' }, { lose: 'oil' }],
    text: ['You oil the fourth wheel, and it slides round, and the broken tooth falls out on its own. The bells stop. His Mechanical Grace lowers its six arms and says: “THANK YOU. NOBODY HAS OILED ME ON A SUNDAY FOR FORTY YEARS.”'],
    choices: [{ text: 'Go and tell the Dean', to: 'easter' }],
  },
  wound_down: {
    on: [{ flag: 'woundDown' }],
    text: ['You get the key into the hole in its back and turn it the wrong way. The bishop slows. Its arms droop. The bells ring slower, and slower, and stop. His Mechanical Grace stands quite still, with its head bowed, as if it were praying. It isn’t doing anything at all.'],
    choices: [{ text: 'Go and tell the Dean', to: 'easter' }],
  },
  spiked: {
    on: [{ flag: 'spiked' }, { lose: 'spikes' }],
    text: ['You jam a spike into the great wheels. Everything in the tower shrieks to a stop, and the bishop with it, frozen mid-gesture. Then something goes PING, and something else goes CRACK. You have stopped it. You have also, quite possibly, broken it for ever.'],
    choices: [{ text: 'Go and tell the Dean', to: 'easter' }],
  },
  bishop_fight: {
    text: ['“HERETIC,” says His Mechanical Grace, and lets go of the bell ropes, all six of them, and picks up its crozier.'],
    fight: {
      monsters: [bishop], win: 'bishop_down', flee: { to: 'nave', label: 'Run down the stairs' },
      special: [{ label: 'Wind it down with Ezra Tock’s key', if: { item: 'windingkey' }, test: { stat: 'Dex', dd: 8, skill: 'athletics' }, flag: 'keyFight', text: 'You get round behind it and turn the key. It slows, and stops.', failText: 'It turns faster than you, and the key slips.', win: true }],
    },
  },
  bishop_down: {
    on: [{ flag: 'smashed' }],
    text: ['His Mechanical Grace crashes to the floor in a fountain of springs. Its glass eyes look up at you. “FORGIVE THEM,” it says, slowly, winding down, “FOR THEY KNOW NOT…” And stops.'],
    choices: [{ text: 'Go and tell the Dean', to: 'easter' }],
  },
  easter: {
    end: 'victory',
    on: [
      { if: { flag: 'fixed' }, gold: 350, uncapped: true, msg: 'The Dean pays you 350GP, in tears of joy.' },
      { if: { any: [{ flag: 'woundDown' }, { flag: 'spiked' }] }, gold: 300, uncapped: true, msg: 'The Dean pays you 300GP.' },
      { if: { flag: 'smashed' }, gold: 200, uncapped: true, msg: 'The Dean pays you 200GP, looking at the springs.' },
      { sell: { item: 'windingkey', gold: 60, text: 'A clock collector buys Ezra Tock’s winding key' } },
    ],
    text: (c) => [
      c.flags.fixed ? 'On Sunday, the Archbishop arrives at Cogsbury to find His Mechanical Grace saying Mass, word-perfect, in a fine baritone. It has no memory of the excommunications, but it apologises to the dog anyway.'
        : c.flags.woundDown ? 'On Sunday, the Archbishop arrives to find His Mechanical Grace standing in the chancel, quite still, head bowed. He takes it for an act of great humility, and is very moved.'
          : c.flags.spiked ? 'On Sunday, the Archbishop arrives to find the cathedral clock stopped at a quarter past three, and the bishop frozen in the tower with one arm raised. The tourists love it.'
            : c.flags.smashed ? 'On Sunday, the Archbishop arrives to find a heap of brass in the chancel, with a mitre on top. The Dean tells him it’s modern art.'
              : 'On Sunday, the Archbishop arrives, and is excommunicated on the steps. He goes home.',
      `You leave Cogsbury with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'His Mechanical Grace buries you in the crypt, word-perfect, and rings every bell in the tower for you, for a week.',
  'Your adventure ends here.',
];
