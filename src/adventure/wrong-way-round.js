// THE WRONG WAY ROUND — fix a horse race with a reverse centaur in it. For a level 2–3 scumbag.
// Who wins is worked out from what you did before the off: see `race`.

export const META = {
  tier: 3, id: 'wrong-way-round', title: 'The Wrong Way Round', levels: '2–3', final: 'payout',
  blurb: 'Honest Sid, the bookmaker, has taken a great deal of money on the favourite in the Muckmarket Derby. He will pay you 150 gold to make sure she wins. There is a late entry at twenty to one: a reverse centaur called Neville. Nobody knows how fast a reverse centaur is. Sid would very much like it to stay that way.',
};

const heavy = { name: 'Sid’s heavy', lvl: 2, hp: 6, range: 'engaged', note: 'Never bathes; knuckles like walnuts' };
const neville = { name: 'Neville', proper: true, lvl: 3, range: 'engaged', onHit: { stat: 'Cha', dd: 4, label: 'shake off the curse', text: 'He bites you, and you feel your luck curdle.', effect: 'damage', amount: 'd4' }, note: 'Reverse centaur: horse on top, man underneath; on bite, d4 Cha save or take d4 more (cursed)' };

export const SECTIONS = {
  start: {
    text: [
      'Honest Sid takes bets from a box at the back of the grandstand at Muckmarket racecourse. He wears a checked suit you could play draughts on. “The Duchess,” he says, “is the favourite. Everybody’s backed her. If she wins, I pay out a little. If she loses, I pay out nothing at all, and everybody is very upset with me.” He leans closer. “You’d think I’d want her to lose. But I’ve backed her myself. Heavily. Make sure she wins, and there’s 150 in it for you.”',
      '“There’s one other runner worth worrying about.” He jerks a thumb at the paddock. “Late entry. Neville. Twenty to one. Nobody’s ever raced one before. Keep an eye on him.”',
    ],
    choices: [
      { text: 'Take the job', to: 'paddock', effects: [{ flag: 'sidJob' }] },
      { text: 'Tell him you’ll think about it, and go and look at the runners', to: 'paddock' },
    ],
  },
  paddock: {
    text: (c) => [
      'In the paddock, the runners are being walked round before the big race. The favourite, Duchess, is a tall grey mare with a jockey like a twig and nerves to match. She shies at every flag.',
      'At the back walks Neville: a horse’s head, neck and barrel, with a waistcoat on, perched on a pair of human legs in running shorts. He is a reverse centaur. He is jogging on the spot, and stretching his hamstrings.',
      c.flags.betPlaced ? 'Your bet is placed.' : 'The bookmakers’ ring is shouting odds by the rail.',
      'The race starts when the starter blows his whistle.',
    ],
    choices: [
      { text: 'Look in on the Duchess’s stable', to: 'duchess', show: { notFlag: 'duchessDone' } },
      { text: 'Talk to Neville', to: 'neville', show: { notFlag: 'nevilleDone' } },
      { text: 'Place a bet in the ring', to: 'ring', show: { notFlag: 'betPlaced' } },
      { text: 'Go to the starting line', to: 'start_line' },
    ],
  },
  ring: {
    text: ['The bookmakers’ ring is a mob of men in hats shouting numbers. The odds are chalked up: DUCHESS, EVENS. NEVILLE, 20-1. The stake is 10 gold or 20.'],
    choices: [
      { text: 'Bet 10GP on the Duchess', to: 'paddock', if: { gold: 10 }, effects: [{ gold: -10 }, { flag: 'betDuchess' }, { flag: 'betPlaced' }, { msg: 'Ten gold on the Duchess, at evens.' }] },
      { text: 'Bet 10GP on Neville', to: 'paddock', if: { gold: 10 }, effects: [{ gold: -10 }, { flag: 'betNeville' }, { flag: 'betPlaced' }, { msg: 'Ten gold on Neville, at twenty to one. The bookmaker laughs as he takes it.' }] },
      { text: 'Bet 20GP on Neville', to: 'paddock', if: { gold: 20 }, effects: [{ gold: -20 }, { flag: 'betNevilleBig' }, { flag: 'betPlaced' }, { msg: 'Twenty gold on Neville. The bookmaker stops laughing and looks at you with something like pity.' }] },
      { text: 'Back to the paddock', to: 'paddock' },
    ],
  },
  duchess: {
    text: (c) => [
      'The Duchess’s stable is quiet. The mare stamps and rolls her eyes at every noise. Her stable lad, a boy of about twelve, is asleep on a hay bale with a bucket of oats beside him.',
      c.flags.sidJob ? 'You’re here to make sure she wins.' : 'Nobody is watching her except you.',
    ],
    choices: [
      { text: 'Calm her down for the race', test: { stat: 'Wis', dd: 6, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know animals' }, pass: 'duchess_calm', fail: 'duchess_kick' },
      { text: 'Cast Wipe on her, so she forgets whatever’s frightening her', cast: 'wipe', pass: 'duchess_wiped', fail: 'duchess_kick', critFail: 'duchess_confesses' },
      { text: 'Hide your hand mirror in her stall, so she sees a strange horse every time she turns', to: 'duchess_nobbled', if: { item: 'mirror' }, effects: [{ lose: 'mirror' }] },
      { text: 'Let your rat loose in her stall', to: 'duchess_nobbled', if: { item: 'rat' }, effects: [{ lose: 'rat' }] },
      { text: 'Glue her shoes to the floor', to: 'duchess_nobbled', if: { item: 'glue' }, effects: [{ lose: 'glue' }] },
      { text: 'Put Famine on her oats', cast: 'famine', pass: 'duchess_nobbled', fail: 'duchess_kick', critFail: 'duchess_oats' },
      { text: 'Back to the paddock', to: 'paddock' },
    ],
  },
  duchess_calm: {
    on: [{ flag: 'duchessCalm' }, { flag: 'duchessDone' }],
    text: ['You stand with her a while, and talk nonsense to her in a low voice, the way you’d talk to a frightened dog or a drunk. She lowers her head and stops shaking. She’ll run straight today.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  duchess_kick: {
    on: [{ damage: 'd6', from: 'The Duchess' }],
    text: ['The Duchess decides you are a flag, and kicks you out of the stable. The stable lad wakes up, sees you on the ground, and goes back to sleep.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  duchess_nobbled: {
    on: [{ flag: 'duchessNobbled' }, { flag: 'duchessDone' }],
    text: ['The Duchess is going to have a very bad afternoon. You slip out before the stable lad wakes up.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville: {
    text: (c) => [
      c.flags.nevilleAngry
        ? 'Neville stops jogging when he sees you and lays his ears back. “You again,” he says. “Come to try your luck? I’ve got teeth at this end, you know.”'
        : '“Hello,” says Neville. His voice comes out of the horse end, deep and anxious. “Are you a fan? I haven’t got any fans. Everybody laughs. They think I’ll fall over. I won’t fall over. I’ve got the best legs in the race. They’re just the wrong way round.”',
    ],
    choices: [
      { text: 'Give him a pep talk', test: { stat: 'Cha', dd: 6, skill: ['social'], profs: ['Bodyguard', 'Pit fighter'], why: 'you’ve been in a corner before' }, pass: 'neville_ready', fail: 'neville_nervous', show: { notFlag: 'nevilleAngry' } },
      { text: 'Give him your rations: he’s not been fed', to: 'neville_ready', if: { item: 'rations' }, effects: [{ lose: 'rations' }], show: { notFlag: 'nevilleAngry' } },
      { text: 'Tie his shoelaces together while he stretches', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'neville_nobbled', fail: 'neville_fight' },
      { text: 'Cast Pestilence on him, and give him a streaming cold', cast: 'pestilence', pass: 'neville_sneezing', fail: 'neville', critFail: 'neville_cured' },
      { text: 'Back to the paddock', to: 'paddock' },
    ],
  },
  neville_ready: {
    on: [{ flag: 'nevilleReady' }, { flag: 'nevilleDone' }],
    text: ['Neville stands a little taller, which is quite tall. “Nobody’s ever said that to me before,” he says. He does a few high knees. “Right. Watch this.”'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville_nervous: {
    text: ['Your pep talk is mostly about how it doesn’t matter if he loses. Neville takes it the wrong way, and goes off to be sick behind the grandstand, which for a horse takes some doing.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville_nobbled: {
    on: [{ flag: 'nevilleNobbled' }, { flag: 'nevilleDone' }],
    text: ['You tie his laces together in a double knot while he’s touching his toes. He doesn’t notice. He has a very long way to look down.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville_fight: {
    on: [{ flag: 'nevilleAngry' }],
    text: ['Neville feels a tug on his laces, looks down the length of himself, and bites you.'],
    fight: { outdoors: true, monsters: [neville], win: 'neville_beaten', flee: { to: 'paddock', label: 'Run back to the paddock' } },
  },
  neville_beaten: {
    on: [{ flag: 'nevilleNobbled' }, { flag: 'nevilleDone' }],
    text: ['Neville sits down on the grass, winded, which is an alarming thing to watch. He’ll run, but he won’t run well.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  start_line: {
    text: ['The runners line up at the start. The crowd goes quiet. The starter, a fat man on a box, raises his whistle to his lips.'],
    choices: [
      { text: 'Blow your own whistle first, so the Duchess bolts early and leaves the field behind', to: 'race', if: { item: 'whistle' }, effects: [{ flag: 'falseStart' }] },
      { text: 'Scatter caltrops across the start, behind the Duchess', to: 'race', if: { item: 'caltrops' }, effects: [{ lose: 'caltrops' }, { flag: 'caltropsStart' }] },
      { text: 'Cast Grease on the turf in Neville’s lane', cast: 'grease', pass: 'greased_start', fail: 'race' },
      { text: 'Watch the race', to: 'race' },
    ],
  },
  race: {
    redirect: [
      { if: { any: [{ flag: 'nevilleNobbled' }, { flag: 'falseStart' }, { flag: 'nevilleGreased' }] }, to: 'race_duchess' },
      { if: { any: [{ flag: 'duchessNobbled' }, { flag: 'nevilleReady' }] }, to: 'race_neville' },
      { if: { flag: 'caltropsStart', notFlag: 'duchessCalm' }, to: 'race_neville' },
      { if: {}, to: 'race_duchess' },
    ],
    text: ['The whistle goes.'],
    choices: [{ text: 'Watch', to: 'race_duchess' }],
  },
  race_neville: {
    on: [{ flag: 'nevilleWon' }],
    text: (c) => [
      c.flags.caltropsStart ? 'The field goes off over your caltrops. The Duchess hears the first one crunch under a hoof behind her, decides it is a flag, and spends the race going sideways. Neville picks his way through them with his knees up, like a man crossing a pebble beach, and then he’s away.' : 'The whistle goes. The field thunders off.',
      c.flags.duchessNobbled ? 'The Duchess has had a very bad afternoon, and runs like it, sideways.' : 'The Duchess goes off in front, as favourites do.',
      'Down the home straight, a strange shape comes through the field: legs pumping, knees high, a horse’s head bobbing on top like a figurehead. Neville wins by four lengths, at twenty to one. There is a terrible silence from the stands, and then, from the bookmakers’ ring, a sound like a man being sick.',
    ],
    choices: [{ text: 'Go round the back of the grandstand', to: 'collect' }],
  },
  race_duchess: {
    text: (c) => [
      c.flags.falseStart ? 'Your whistle shrieks a second early. The Duchess, nervous as a kitten, bolts at the sound and is three lengths clear before the starter has blown his. Nobody catches her after that.' : c.flags.caltropsStart ? 'The field goes off over your caltrops. The horses behind the Duchess bunch and stumble. The Duchess, calm as a cow, doesn’t even look round.' : 'The whistle goes. The field thunders off.',
      c.flags.nevilleSick ? 'Neville sneezes at the start, sneezes at the first bend and sneezes all the way down the back straight, and finishes last, damp and miserable.' : c.flags.nevilleGreased ? 'Neville’s first stride lands on the grease. His legs go one way and his horse’s head goes the other, and he spends the race sliding gently down the course on his back, waving.' : c.flags.nevilleNobbled ? 'Neville takes one stride and falls flat on his face, to a roar of laughter from the stands. He gets up, and finishes, last, to a smaller roar.' : 'Neville runs well, for a reverse centaur, and comes in a respectable third, waving.',
      'The Duchess wins it, by a nose, at evens. The crowd cheers, and goes to collect very small winnings.',
    ],
    choices: [{ text: 'Go round the back of the grandstand', to: 'collect' }],
  },
  collect: {
    text: (c) => [c.flags.nevilleWon
      ? (c.flags.sidJob ? 'Honest Sid is waiting for you behind the grandstand, with two large men and no money. “You were supposed to make her win,” he says.' : 'Behind the grandstand, Honest Sid is packing up his box in a hurry, with two large men to help him. He pays the few winning tickets with a face like a funeral.')
      : (c.flags.sidJob ? 'Honest Sid is all smiles behind the grandstand. “Lovely work,” he says, counting out your fee.' : 'Honest Sid is all smiles behind the grandstand, counting his money.')],
    choices: [
      { text: 'Take what’s yours', to: 'payout', show: { notFlag: 'nevilleWon' } },
      { text: 'Collect any winnings and leave', to: 'payout', show: { flag: 'nevilleWon', notFlag: 'sidJob' } },
      { text: 'Explain that it wasn’t your fault', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'] }, pass: 'sid_shrugs', fail: 'heavies', show: { flag: 'nevilleWon', any: [{ flag: 'sidJob' }] } },
      { text: 'Run for it', to: 'heavies', show: { flag: 'nevilleWon', any: [{ flag: 'sidJob' }] } },
    ],
  },
  sid_shrugs: {
    text: ['“Nobody could have known,” you say. “A reverse centaur. It’s never been done.” Sid thinks about it, and sighs, and waves the large men away. “No fee,” he says. “But no broken legs either. Call it even.”'],
    choices: [{ text: 'Leave while it’s even', to: 'payout' }],
  },
  heavies: {
    text: ['Sid’s two large men step forward. One of them cracks his knuckles. The other cracks his.'],
    fight: { outdoors: true, monsters: [heavy, heavy], win: 'heavies_down', flee: { to: 'payout', label: 'Lose them in the crowd' } },
  },
  heavies_down: {
    text: ['The large men lie on the grass behind the grandstand. Honest Sid has gone, box and all, without paying anybody.'],
    choices: [{ text: 'Leave', to: 'payout' }],
  },
  payout: {
    end: 'victory',
    on: [
      { if: { flag: 'sidJob', notFlag: 'nevilleWon' }, gold: 150, uncapped: true, msg: 'Honest Sid pays your fee: 150GP.' },
      { if: { flag: 'betDuchess', notFlag: 'nevilleWon' }, gold: 20, uncapped: true, msg: 'Your bet on the Duchess pays evens: 20GP back.' },
      { if: { flag: 'betNeville', any: [{ flag: 'nevilleWon' }] }, gold: 210, uncapped: true, msg: 'Your bet on Neville pays twenty to one: 210GP.' },
      { if: { flag: 'betNevilleBig', any: [{ flag: 'nevilleWon' }] }, gold: 420, uncapped: true, msg: 'Your bet on Neville pays twenty to one: 420GP.' },
    ],
    text: (c) => [
      c.flags.nevilleWon
        ? 'That evening, Neville is carried round the town on the shoulders of everyone who backed him. He gives a speech from the horse end. Nobody can hear it, but everybody cheers.'
        : 'That evening, the Duchess is retired to a field full of buttercups, and Honest Sid buys a new suit, even louder than the last one.',
      `You leave Muckmarket with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  duchess_oats: {
    on: [{ flag: 'duchessCalm' }, { flag: 'duchessDone' }],
    text: ['Your god scorns you. Instead of a swarm of locusts, a nosebag of the very best oats appears on the Duchess’s head. She eats the lot, sighs, and stops shaking. You have never seen a horse look so well.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  duchess_confesses: {
    on: [{ damage: 'd6', from: 'The Duchess' }],
    text: ['Your god scorns you. Instead of forgetting, the Duchess relives her most recent sins: two stable lads, a farrier and a small dog, all kicked. Remembering them puts her in the mood, and she kicks you as well.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville_sneezing: {
    on: [{ flag: 'nevilleSick' }, { flag: 'nevilleNobbled' }, { flag: 'nevilleDone' }],
    text: ['Neville sneezes. It is a horse’s sneeze, which comes out of a horse’s head on top of a man, and goes everywhere. “Oh dear,” he says thickly. “I think I’m coming down with something.”'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  neville_cured: {
    on: [{ flag: 'nevilleReady' }, { flag: 'nevilleDone' }],
    text: ['Your god scorns you, and cures Neville of the sniffle he didn’t know he had. He takes a deep breath through both sets of nostrils, and his eyes light up. “I feel marvellous,” he says. “I feel like I could run all day.”'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
  greased_start: {
    on: [{ flag: 'nevilleGreased' }],
    text: ['The turf in Neville’s lane goes dark and shiny, like a fishmonger’s slab. Nobody notices but you.'],
    choices: [{ text: 'Watch the race', to: 'race' }],
  },
  duchess_wiped: {
    on: [{ flag: 'duchessCalm' }, { flag: 'duchessDone' }],
    text: ['The Duchess forgets the last day: the crowds, the flags, the brass band. She lowers her head, looks round her stall as if she has just woken up in it, and starts to eat her hay. She’ll run straight today.'],
    choices: [{ text: 'Back to the paddock', to: 'paddock' }],
  },
};

export const DEATH_TEXT = [
  'You die behind the grandstand at Muckmarket. Honest Sid lays odds on how long before anyone finds you. He wins.',
  'Your adventure ends here.',
];
