// KNIGHTMARE — get a riderless armoured warhorse out of a tournament it keeps winning. For a level 3–4 scumbag.

export const META = {
  tier: 4, id: 'knightmare', title: 'Knightmare', levels: '3–4', final: 'prize',
  blurb: 'For three years running, the Grand Tourney at Clatterby has been won by a horse. A big black warhorse in full armour, with nobody on its back, which bows to the crowd, charges like an avalanche and is impeccably polite about it. The rules don’t say a knight has to be riding. Lord Clatterby will pay 250 gold to whoever gets it out of his tournament.',
};

const knightmare = { name: 'The Knightmare', lvl: 4, hp: 16, ap: 4, range: 'engaged', note: 'Riderless armoured warhorse (16 HP, 4 AP); charges like an avalanche; bows first' };

export const SECTIONS = {
  start: {
    text: [
      'Lord Clatterby watches the lists from his pavilion with his head in his hands. Out on the field, a great black horse in black plate armour trots back to its end of the tilt, having knocked another knight clean out of the saddle. It stops, turns to the royal box, and bows, one foreleg forward. The crowd, who have seen this for three years, groan.',
      '“Nobody’s riding it,” says Lord Clatterby. “Nobody’s ever riding it. It turned up three years ago with an empty saddle and a lance strapped on, and it entered itself. It’s won every joust since. It’s polite. It’s unbeatable. The knights won’t come any more. Two hundred and fifty gold, and I don’t care how.”',
    ],
    choices: [
      { text: 'Go and look at the horse in the stables', to: 'stable' },
      { text: 'Ask around the tourney about where it came from', to: 'tents' },
      { text: 'Enter the joust yourself', to: 'lists' },
    ],
  },
  tents: {
    text: (c) => [
      'Among the tents, squires polish armour and old knights drink to forget. Everybody has a theory about the black horse. A farrier says its shoes are the old pattern, forty years out of date. An old herald squints at its caparison and says the faded crest is a broken lance on blue.',
      c.flags.knowsDunstan ? '' : 'Nobody knows whose crest that is.',
    ].filter(Boolean),
    choices: [
      { text: 'Look up the crest in the herald’s roll', test: { stat: 'Int', dd: 6, skill: ['analysis', 'languages'], profs: ['Envoy'], why: 'you know your heraldry' }, pass: 'herald', fail: 'herald_lost', show: { notFlag: 'knowsDunstan' } },
      { text: 'Buy the old knights a round and ask them (5GP)', to: 'herald', if: { gold: 5 }, effects: [{ gold: -5 }], show: { notFlag: 'knowsDunstan' } },
      { text: 'Go to the almshouse in the village', to: 'almshouse', show: { flag: 'knowsDunstan' } },
      { text: 'Go to the stables', to: 'stable' },
      { text: 'Go to the lists', to: 'lists' },
    ],
  },
  herald_lost: {
    text: ['The herald’s roll is three hundred years of crests, most of them lions. You find nineteen broken lances, all on red. Your eyes give out before you find one on blue.'],
    choices: [{ text: 'Back to the tents', to: 'tents' }],
  },
  herald: {
    on: [{ flag: 'knowsDunstan' }],
    text: ['A broken lance on blue: Sir Dunstan Fairweather, champion of this very tourney forty years ago. “Fell off his horse in the last joust he ever rode,” says an old knight, “and never got back on. The horse ran off. Dunstan’s in the almshouse down the village now. Ninety. Can’t walk. Still asks after his horse.”'],
    choices: [{ text: 'Go to the almshouse', to: 'almshouse' }, { text: 'Back to the tents', to: 'tents' }],
  },
  almshouse: {
    text: (c) => [
      c.flags.dunstanComing
        ? 'Sir Dunstan is waiting at the almshouse door in his chair, in his old surcoat, ready.'
        : 'In the almshouse, in a chair by the window, sits a very old man in a blue surcoat with a broken lance on it, moth-eaten. Sir Dunstan Fairweather. He is watching the tourney flags flying over the hill. “Is he still there?” he says, before you can say anything. “My Thunderclap? I hear things. I hear he’s still riding.”',
    ],
    choices: [
      { text: 'Offer to take him to the tourney', test: { stat: 'Str', dd: 6, skill: ['athletics', 'medicine'], profs: ['Bodyguard'], why: 'you know how to move people' }, pass: 'dunstan_comes', fail: 'dunstan_tired', show: { notFlag: 'dunstanComing' } },
      { text: 'Rig up a litter with your pole and a blanket, and carry him', to: 'dunstan_comes', if: { item: 'pole' }, show: { notFlag: 'dunstanComing' } },
      { text: 'Go back to the tourney', to: 'stable' },
    ],
  },
  dunstan_tired: {
    on: [{ damage: 'd4', from: 'Your back' }],
    text: ['Sir Dunstan is heavier than he looks, and his chair has one wheel that goes the other way. You get him as far as the door. He’s exhausted. So are you. “Again,” he says. “We’ll go again.”'],
    choices: [{ text: 'Try again', to: 'almshouse' }],
  },
  dunstan_comes: {
    on: [{ flag: 'dunstanComing' }],
    text: ['You get Sir Dunstan up the hill to the tourney, in his chair, with a blanket over his knees and his old helm in his lap. He says nothing the whole way. When the tourney comes into sight he grips the arms of the chair very tightly.'],
    choices: [{ text: 'Take him to the lists', to: 'reunion' }],
  },
  reunion: {
    on: [{ flag: 'retired' }],
    text: ['The black horse is waiting at its end of the lists for the next challenger. It sees the old man in the chair. It drops its lance. It walks across the field, slowly, through the barrier, which it doesn’t notice, and puts its great armoured head down in Sir Dunstan’s lap. The crowd goes silent. Then somebody starts to clap, and everybody does, and Lord Clatterby blows his nose for a long time.'],
    choices: [{ text: 'Go and collect your fee', to: 'prize' }],
  },
  stable: {
    text: (c) => [
      'In the stables, the black horse stands in the end stall in its armour. It never takes it off. It turns its head to look at you through the eye-holes of its chanfron, and dips its head, politely.',
      c.flags.armourOff ? 'Its armour hangs on the wall, and it looks smaller and older without it.' : 'Its armour is held on by forty-year-old straps and rust.',
    ],
    choices: [
      { text: 'Give it your rations', to: 'oats', if: { item: 'rations' }, show: { notFlag: 'fed' } },
      { text: 'Dress the old wound under its armour with your healer’s kit', to: 'dressed', if: { item: 'healerskit' }, show: { notFlag: 'fed' } },
      { text: 'Unbuckle its armour while it eats', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], mods: [{ if: { anyItem: ['tools', 'prybar'] }, dd: 4 }] }, pass: 'armour_off', fail: 'stable_kick', show: { flag: 'fed', notFlag: 'armourOff' } },
      { text: 'Show it its reflection in your hand mirror', to: 'mirror', if: { item: 'mirror' }, show: { notFlag: 'mirrored' } },
      { text: 'Glue its shoes to the stable floor', to: 'glued', if: { item: 'glue' }, show: { notFlag: 'glued' } },
      { text: 'Back to the tents', to: 'tents' },
      { text: 'Go to the lists', to: 'lists' },
    ],
  },
  oats: {
    on: [{ flag: 'fed' }, { lose: 'rations' }],
    text: ['The horse lowers its head and eats your rations through the visor, delicately, without dropping a crumb. It nods its thanks.'],
    choices: [{ text: 'Back to the stall', to: 'stable' }],
  },
  dressed: {
    on: [{ flag: 'fed' }],
    text: ['Under the edge of its shoulder plate, the black horse has an old wound that has never healed properly, rubbed raw by forty years of armour. You clean it and dress it. The horse stands very still while you do it, and afterwards it lowers its head and lets you scratch its ears.'],
    choices: [{ text: 'Back to the stall', to: 'stable' }],
  },
  armour_off: {
    on: [{ flag: 'armourOff' }],
    text: ['Strap by strap, plate by plate, the armour comes off. Underneath is an old horse, grey round the muzzle, with a scar across its shoulder. It looks at its armour on the floor, and at you, and seems, for a moment, very tired.'],
    choices: [{ text: 'Back to the stall', to: 'stable' }],
  },
  stable_kick: {
    on: [{ damage: 'd6', from: 'The horse' }],
    text: ['A strap snaps. The horse kicks, once, apologetically, and you go across the stable into a hay bale.'],
    choices: [{ text: 'Get up', to: 'stable' }],
  },
  mirror: {
    on: [{ flag: 'mirrored' }],
    text: ['You hold up the mirror. The black horse looks at itself: the armour, the lance-rest, the empty saddle. It looks for a long time at the empty saddle. Then it looks away.'],
    choices: [{ text: 'Back to the stall', to: 'stable' }],
  },
  glued: {
    on: [{ flag: 'glued' }, { lose: 'glue' }],
    text: ['You glue all four of its shoes to the stable floor. The horse doesn’t seem to notice. When the trumpet blows for its next joust, it walks out of the stall, leaving four horseshoes and most of the floor behind.'],
    choices: [{ text: 'Back to the stall', to: 'stable' }],
  },
  lists: {
    text: (c) => [
      'Out on the lists, the black horse waits at the far end of the tilt for its next challenger. A squire holds a lance and a spare horse, a moth-eaten nag called Bramble, for anybody foolish enough to try.',
      c.flags.armourOff ? 'Without its armour, the black horse looks almost beatable.' : 'In its armour, it looks like a siege engine.',
    ],
    choices: [
      { text: 'Joust', to: 'joust' },
      { text: 'Strew caltrops along its side of the tilt', to: 'caltrops', if: { item: 'caltrops' } },
      { text: 'Blow the cavalry retreat on your whistle as it charges', to: 'retreat', if: { item: 'whistle' }, show: { notFlag: 'retreated' } },
      { text: 'Lasso it from the barrier and bring it down', test: { stat: 'Str', dd: 10, skill: ['athletics'], profs: ['Hunter'], why: 'you’ve roped animals before' }, pass: 'roped', fail: 'trampled', if: { anyItem: ['rope', 'chain'] } },
      { text: 'Back to the stables', to: 'stable' },
      { text: 'Give up and leave', to: 'prize' },
    ],
  },
  joust: {
    text: (c) => [`You mount Bramble, take the lance and lower your visor, which doesn’t fit. The black horse bows. Then it charges${c.flags.armourOff ? ', without its armour, a little slower than you expected' : ''}.`],
    choices: [{ text: 'Charge', test: { stat: 'Str', dd: 12, skill: ['attack:melee'], profs: ['Sellsword', 'Pit fighter', 'Bodyguard'], why: 'you know how to hit something coming at you', mods: [{ if: { flag: 'armourOff' }, dd: 8 }, { if: { flag: 'retreated' }, dd: 8 }] }, pass: 'joust_won', fail: 'unhorsed' }],
  },
  unhorsed: {
    on: [{ damage: '2d6', from: 'The lance' }],
    text: ['The lance takes you square in the chest. You leave Bramble at the speed of a cannonball and arrive in the crowd. The black horse trots back to its end and bows.'],
    choices: [{ text: 'Get up', to: 'lists' }, { text: 'Fight it on foot', to: 'fight' }],
  },
  joust_won: {
    on: [{ flag: 'beaten' }],
    text: ['Your lance catches the black horse on the shoulder plate and it staggers, and stops. For the first time in three years, it has lost. It stands quite still at the end of the lists while the crowd goes wild, and then it bows to you, very low, and walks off the field.'],
    choices: [{ text: 'Collect your prize', to: 'prize' }],
  },
  retreat: {
    on: [{ flag: 'retreated' }],
    text: ['You blow the cavalry retreat as the black horse thunders down the tilt. It is an old, old horse, and it was trained in the old way. It wheels, and gallops back to its end, and stands there, confused, waiting for orders.'],
    choices: [{ text: 'Joust while it’s confused', to: 'joust' }],
  },
  caltrops: {
    on: [{ lose: 'caltrops' }, { flag: 'caltropsLaid' }],
    text: ['You scatter caltrops along the black horse’s side of the tilt. It charges, treads on them, and stops dead. It looks down at its feet. It looks at you. It is not angry. It is disappointed. Then it charges anyway, limping.'],
    choices: [{ text: 'Fight it', to: 'fight' }],
  },
  roped: {
    on: [{ flag: 'roped' }],
    text: ['Your rope goes over its head and you dig in your heels. The black horse goes down on its knees in a crash of plate. It doesn’t get up. It lies there, breathing hard, an old horse in heavy armour.'],
    choices: [{ text: 'Get it out of the tourney', to: 'prize' }],
  },
  trampled: {
    on: [{ damage: '2d6', from: 'A warhorse' }],
    text: ['The rope tightens, and the black horse drags you the length of the lists, through the barrier and into the pie stall.'],
    choices: [{ text: 'Get up', to: 'lists' }],
  },
  fight: {
    text: ['The black horse squares up to you, bows, and charges.'],
    fight: {
      monsters: [{ ...knightmare }], win: 'horse_down', flee: { to: 'lists', label: 'Dive over the barrier' },
      special: [{ label: 'Hold up your hand mirror', if: { item: 'mirror' }, flag: 'mirrorFight', text: 'It sees the empty saddle in the mirror and stops, mid-charge, head down.', stun: 1 }],
    },
  },
  horse_down: {
    on: [{ flag: 'horseDown' }],
    text: ['The black horse goes down on its knees and stays there. It doesn’t get up. After a while, two grooms come out and lead it away, very gently, limping.'],
    choices: [{ text: 'Collect your fee', to: 'prize' }],
  },
  prize: {
    end: 'victory',
    on: [{ if: { any: [{ flag: 'retired' }, { flag: 'beaten' }, { flag: 'horseDown' }, { flag: 'roped' }] }, gold: 250, uncapped: true, msg: 'Lord Clatterby pays you 250GP.' }],
    text: (c) => [
      c.flags.retired ? 'Thunderclap goes home with Sir Dunstan to the almshouse, where they let him stand in the garden. Every morning the old knight is wheeled out to sit with him, and they watch the tourney flags together.'
        : c.flags.beaten ? 'The black horse never enters the tourney again. It stands in a field at Clatterby, in its armour, and bows to everybody who passes.'
          : c.flags.horseDown || c.flags.roped ? 'The black horse is taken to the knacker’s, and then, because Lord Clatterby can’t bring himself to do it, to a field. It never jousts again.'
            : 'You leave the tourney with nothing. Behind you, the black horse wins again.',
      `You leave Clatterby with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'The black horse bows over your body, very politely, and goes back to its end of the lists.',
  'Your adventure ends here.',
];
