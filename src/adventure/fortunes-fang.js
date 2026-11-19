// FORTUNE'S FANG — break the bank at a casino run by a luck vampire. For a level 2–3 scumbag.
// The `hour` counter moves on with every game you play; at 4, dawn sends the Count to his coffin.

export const META = {
  tier: 3, id: 'fortunes-fang', title: 'Fortune’s Fang', levels: '2–3', final: 'dawn_out',
  blurb: 'Under the town of Lesser Wager, in a crypt full of candles and card tables, Count Fortunato runs the only casino where the house always wins. He is a luck vampire: he feeds on yours. Tonight, you’re going to take his bank.',
};

// Rex is half of a fighting duo. His brother Tex, who used to guard his back and finish his sentences, is missing.
const rex = { name: 'Rex', proper: true, lvl: 2, hp: 10, range: 'engaged', feats: ['exposed'], note: 'Half of a fighting duo; back always exposed (critical hits while engaged); unfinished sentences' };
const count = { name: 'Count Fortunato', lvl: 7, range: 'engaged', feats: ['undead', 'unluckyAura', 'critWide'], note: 'Luck vampire; each turn, 2/6 chance you fall prone; you critically fail defending on 17–20' };
const HOUR = (c) => `The candles say it is ${['eleven o’clock', 'midnight', 'one in the morning', 'two in the morning. Not long till dawn', 'nearly dawn'][Math.min(4, c.flags.hour || 0)]}.`;
const GAME = { add: ['hour', 1] };

export const SECTIONS = {
  start: {
    on: [{ gold: 40, msg: 'You won 40GP in a raffle you didn’t enter. You keep it anyway.' }], onceOnly: true,
    text: (c, visits) => visits > 1 ? ['You climb back up into the churchyard of Lesser Wager to catch your breath. Down the steps, the crypt door waits, with its painted sign: WHERE LUCK GOES TO DIE.'] : [
      'A painted sign above a crypt door in the churchyard of Lesser Wager reads FORTUNE’S FANG: WHERE LUCK GOES TO DIE. Below it, smaller: NO PAUPERS. NO GARLIC. NO REFUNDS.',
      'Everyone in Lesser Wager owes the Count money. Everyone in Lesser Wager is pale and tired and keeps tripping over things. Somewhere below your feet is the bank: every coin the town has lost in thirty years.',
    ],
    choices: [{ text: 'Go down the steps', to: 'doors' }],
  },
  doors: {
    text: (c) => c.flags.rexAngry ? [
      'Rex is still at the door, alone, rubbing his knuckles. He sees you coming back down the steps. “You again. If you think I’m—” He waits. Nobody finishes it. “—letting you in,” he says, eventually, by himself.',
    ] : [
      'At the bottom of the steps, one enormous man in a waistcoat blocks the door. Beside him is a gap exactly his size, where somebody else in a matching waistcoat ought to be standing.',
      '“Evening,” he says. “Dress code. No paupers, no—” He stops, and looks to his left, and waits. Nobody finishes the sentence. His face falls. This is Rex, of the Bouncer Twins. His brother Tex hasn’t been seen for a week, and Rex hasn’t finished a sentence since.',
    ],
    choices: [
      { text: 'Flash your purse (needs 30GP)', to: 'floor', if: { gold: 30 } },
      { text: 'Tell him you’re a high roller from out of town', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'] }, pass: 'floor', fail: 'rex_fight' },
      { text: 'Finish his sentence for him', test: { stat: 'Cha', dd: 6, skill: ['social', 'languages'], profs: ['Cleric', 'Missionary', 'Bodyguard'], why: 'you know how to look after people' }, pass: 'rex_finished', fail: 'rex_fight' },
      { text: 'Fight him', to: 'rex_fight' },
      { text: 'Cast Shroud and slip past him in your own darkness', cast: 'shroud', pass: 'floor', fail: 'rex_fight', critFail: 'rex_lit' },
    ],
  },
  rex_finished: {
    on: [{ flag: 'rexFriend' }],
    text: ['“—garlic,” you say. Rex turns to you with tears in his eyes. “That’s—” “—exactly what Tex would have said,” you say. He lets you in, and tells you, in halves of sentences, that Tex went downstairs to play the Count at double or nothing, and never came back up.'],
    choices: [{ text: 'Go in', to: 'floor' }],
  },
  rex_fight: {
    on: [{ flag: 'rexAngry' }],
    text: ['“Then you’ll—” says Rex, and waits for a brother who isn’t there, and then just hits you. He fights like half of a team: brilliantly at the front, with nobody at all watching his back.'],
    fight: { monsters: [rex], win: 'rex_win', flee: { to: 'start', label: 'Run back up the steps' } },
  },
  rex_win: {
    on: [{ flag: 'rexDown' }, { gold: 20, msg: 'His tips jar: 20GP.' }], onceOnly: true,
    text: ['Rex sits down against the wall. “That was—” he says, and nobody finishes it for him, so he falls asleep instead.'],
    choices: [{ text: 'Go in', to: 'floor' }],
  },
  floor: {
    text: (c) => [
      'The gaming floor is a crypt lined with coffins stood on end, each one a booth. Candles drip onto green baize. Pale gamblers lose quietly at the tables. Every so often one of them trips over nothing at all and doesn’t get up for a while.',
      'There is a dice table, a great brass wheel, a card table run by a crab in a bow tie, a bar, and a cashier’s cage. A door marked STAFF ONLY stands in the corner, and a velvet rope guards a stair going down.',
      HOUR(c),
      (c.flags.hour || 0) >= 4 ? 'The croupiers are covering the tables for the day. Nobody is taking any more bets.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Play the Bones (dice)', to: 'bones', show: { below: ['hour', 4] } },
      { text: 'Play the Wheel', to: 'wheel', show: { below: ['hour', 4] } },
      { text: 'Play Liar’s Dice with the crab', to: 'crab_table', show: { below: ['hour', 4] } },
      { text: 'Get a drink at the bar', to: 'bar', show: { notFlag: 'drank' } },
      { text: 'Visit the cashier’s cage', to: 'cage' },
      { text: 'Try the STAFF ONLY door', to: 'office' },
      { text: 'Step over the velvet rope and go downstairs', to: 'crypt' },
      { text: 'Cash out and leave', to: 'dawn_out' },
    ],
  },
  bones: {
    text: ['At the Bones, you bet on two dice made from the knucklebones of the Count’s previous accountant. The croupier is a skeleton. The minimum stake is 20GP.'],
    choices: [
      { text: 'Bet 20GP and trust your luck', test: { stat: 'Cha', dd: 8, save: true }, pass: 'bones_win', fail: 'bones_lose', if: { gold: 20 }, effects: [GAME] },
      { text: 'Study the dice through your jeweller’s loupe, then bet 20GP on the heavy side', test: { stat: 'Int', dd: 4, skill: ['analysis'] }, pass: 'bones_win', fail: 'bones_lose', if: { gold: 20, item: 'loupe' }, effects: [GAME] },
      { text: 'Bet 20GP and palm a loaded die', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'bones_cheat', fail: 'caught', if: { gold: 20 }, effects: [GAME] },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  bones_win: {
    on: [{ gold: 20 }],
    text: ['Double sixes. The skeleton pays out with a rattle that might be disappointment.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  bones_lose: {
    on: [{ gold: -20 }],
    text: ['Snake eyes. Somewhere below, you’re sure you hear somebody laugh.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  bones_cheat: {
    on: [{ gold: 60 }],
    text: ['Your die comes up six. So does the other one, by coincidence. The skeleton pays three times your stake and looks at you for a long moment out of its empty eye sockets.'],
    choices: [{ text: 'Back to the floor, quickly', to: 'floor' }],
  },
  caught: {
    on: [{ gold: -20 }],
    text: ['A bony hand closes on your wrist. “Cheat,” says the croupier, in a voice like a dropped bag of cutlery. Rex looks up from the door.'],
    fight: {
      unless: { any: [{ flag: 'rexDown' }, { flag: 'rexFriend' }] },
      monsters: [rex], win: 'rex_win_floor', flee: { to: 'floor', label: 'Lose yourself in the crowd' },
    },
    choices: [{ text: 'Back to the floor, before anyone else notices', to: 'floor' }],
  },
  rex_win_floor: {
    on: [{ flag: 'rexDown' }],
    text: ['Rex goes down, looking over his shoulder for somebody who isn’t there. The gamblers barely look up.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  wheel: {
    text: (c) => [
      'The Wheel is a great brass disc spun by a hunchback who is paid by the spin. Red pays double.',
      c.flags.magnet ? 'Now you know where the magnet is, you know exactly when to bet.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Bet 20GP on red', test: { stat: 'Cha', dd: 12, save: true }, pass: 'wheel_win', fail: 'wheel_lose', if: { gold: 20 }, effects: [GAME], show: { notFlag: 'magnet' } },
      { text: 'Watch how the wheel stops', test: { stat: 'Int', dd: 8, skill: ['analysis'], knowledge: false }, pass: 'magnet', fail: 'wheel_watch', effects: [GAME], show: { notFlag: 'magnet' } },
      { text: 'Bet 40GP, just before the magnet clicks', to: 'wheel_rig', if: { gold: 40 }, effects: [GAME], show: { flag: 'magnet', notFlag: 'wheelRigged' } },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  wheel_win: { on: [{ gold: 20 }], text: ['Red. The hunchback looks genuinely shocked.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  wheel_lose: { on: [{ gold: -20 }], text: ['Black. It’s always black. It’s been black since the Count opened.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  wheel_watch: { text: ['You watch the wheel for an hour and learn nothing, except that the hunchback hums.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  magnet: {
    on: [{ flag: 'magnet' }],
    text: ['There: a tiny click, and the wheel slows just before red. There’s a magnet under the baize, and the hunchback works it with his knee. Bet at the right moment, before he’s noticed you’ve noticed, and you can’t lose.'],
    choices: [{ text: 'Back to the wheel', to: 'wheel' }],
  },
  wheel_rig: {
    on: [{ flag: 'wheelRigged' }, { gold: 80 }],
    text: ['You bet just as his knee twitches. Red. The hunchback looks at his knee as if it has betrayed him, and pays out double. He won’t take your bets again.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  crab_table: {
    text: (c) => c.flags.pinchDown
      ? ['The card table is empty. Somebody has put a lemon where the croupier used to be.']
      : c.flags.pinchAngry ? ['Mr Pinch is back behind his table, and he clacks a claw at you as you come near. He won’t deal you in again.']
      : ['The Liar’s Dice table is run by Mr Pinch, a croupier-crab the size of an armchair, in a bow tie. He deals with one claw and takes your money with the other. You each roll under a cup and bid on what’s underneath. The trick is lying, and not blinking.'],
    choices: [
      { text: 'Play a hand (stake 20GP)', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'] }, pass: 'crab_win', fail: 'crab_lose', if: { gold: 20 }, effects: [GAME], show: { none: [{ flag: 'pinchDown' }, { flag: 'pinchAngry' }] } },
      { text: 'Play a hand with your hand mirror propped against the candlestick, angled under his cup (20GP)', test: { stat: 'Dex', dd: 4, skill: ['skulduggery'] }, pass: 'crab_win', fail: 'pinch_fight', if: { gold: 20, item: 'mirror' }, effects: [GAME], show: { none: [{ flag: 'pinchDown' }, { flag: 'pinchAngry' }] } },
      { text: 'Accuse him of cheating', to: 'pinch_fight', show: { none: [{ flag: 'pinchDown' }, { flag: 'pinchAngry' }] } },
      { text: 'Cast Confession on Mr Pinch, so the whole table watches him relive his sins', cast: 'confession', pass: 'pinch_confesses', fail: 'pinch_fight', critFail: 'pinch_wiped', show: { none: [{ flag: 'pinchDown' }, { flag: 'pinchAngry' }, { flag: 'pinchConfessed' }] } },
      { text: 'Settle things with him', to: 'pinch_fight', show: { flag: 'pinchAngry', notFlag: 'pinchDown' } },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  crab_win: {
    on: [{ item: 'chips', msg: 'He pays in a single gold chip, worth 100GP at the cage.' }],
    text: ['You bid five sixes with a face like a closed door. Mr Pinch looks at you, looks at his cup, and folds. His mandibles click in a way that suggests he will remember you.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  crab_lose: {
    on: [{ gold: -20 }],
    text: ['You blink. Mr Pinch sees it. The money vanishes into his shell.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  pinch_fight: {
    on: [{ flag: 'pinchAngry' }],
    text: ['“Cheating,” says Mr Pinch, “is my job.” He comes across the table claws first.'],
    fight: {
      monsters: [{ name: 'Mr Pinch', lvl: 2, range: 'engaged', ap: 4, onHit: { stat: 'Dex', dd: 4, label: 'keep hold of your purse', text: 'He pinches your purse with his other claw.', effect: 'gold', amount: 10 }, note: 'Croupier-crab; shell (4 AP); on hit, d4 Dex save or he pinches 10GP' }],
      win: 'pinch_win', flee: { to: 'floor', label: 'Back away from the table' },
    },
  },
  pinch_win: {
    on: [{ flag: 'pinchDown' }, { item: 'chips', msg: 'Inside his shell: a gold chip, worth 100GP at the cage.' }], onceOnly: true,
    text: ['Mr Pinch flips onto his back and waves his legs. The gamblers at the next table order him with garlic butter.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  bar: {
    text: ['The barman serves a drink called a Bloody Count. It’s made with tomato juice, he says. He says it twice.'],
    choices: [
      { text: 'Drink it', test: { stat: 'Con', dd: 6, save: true, mods: [{ if: { feature: 'noPoison' }, auto: true, text: 'Sottish: you have drunk worse. Recently.' }] }, pass: 'bar_good', fail: 'bar_bad', effects: [{ flag: 'drank' }, GAME] },
      { text: 'Ask him about the Count', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'bar_gossip', fail: 'bar_shrug', effects: [{ flag: 'drank' }, GAME] },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  bar_good: { on: [{ heal: '2d6' }], text: ['It is not tomato juice. You feel wonderful.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  bar_bad: { on: [{ damage: 'd4', from: 'The Bloody Count' }], text: ['It is not tomato juice. You feel dreadful.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  bar_gossip: {
    on: [{ flag: 'gossip' }],
    text: ['The barman leans closer. “Terrified of mirrors, the Count. Won’t have one down here. And come dawn he’s in his coffin, out like a light, till dusk. Keeps the coffin key in the office. Not that I told you.”'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  bar_shrug: { text: ['“Never heard of him,” says the barman, polishing a glass with a shaking hand.'], choices: [{ text: 'Back to the floor', to: 'floor' }] },
  cage: {
    text: (c) => [
      c.flags.cashierDown ? 'The cashier’s cage stands open. What’s left of the cashier lies in a heap on the floor, still holding a coin.' : 'A skeleton sits in the cashier’s cage behind iron bars, counting coins with bony fingers.',
      c.flags.cageRobbed ? 'The strongbox behind it is empty.' : 'Behind it, through a small door, you can see the edge of a strongbox.',
    ],
    choices: [
      { text: 'Cash in your gold chips', to: 'cash_in', if: { item: 'chips' }, show: { notFlag: 'cashierDown' } },
      { text: 'Pick the cage lock while it counts', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'cage_robbed', fail: 'cashier_fight', if: { item: 'tools' }, show: { none: [{ flag: 'cageRobbed' }, { flag: 'cashierDown' }] } },
      { text: 'Melt the cage lock with acid while it counts', to: 'cage_robbed', if: { item: 'acid' }, effects: [{ lose: 'acid' }], show: { none: [{ flag: 'cageRobbed' }, { flag: 'cashierDown' }] } },
      { text: 'Cast Knock on the cage lock while it counts', cast: 'knock', pass: 'cage_robbed', fail: 'cashier_fight', show: { none: [{ flag: 'cageRobbed' }, { flag: 'cashierDown' }] } },
      { text: 'Lever the bars apart while it counts', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'cage_robbed', fail: 'cashier_fight', if: { anyItem: ['prybar', 'pick'] }, show: { none: [{ flag: 'cageRobbed' }, { flag: 'cashierDown' }] } },
      { text: 'Help yourself to the strongbox', to: 'cage_robbed', show: { flag: 'cashierDown', notFlag: 'cageRobbed' } },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  cash_in: {
    on: [{ sell: { item: 'chips', gold: 100, text: 'The skeleton pays out for a gold chip' } }, { sell: { item: 'chips', gold: 100, text: 'And another' } }, { sell: { item: 'chips', gold: 100, text: 'And another' } }, { sell: { item: 'chips', gold: 100, text: 'And another' } }],
    text: ['The skeleton bites each chip, which is a waste of time, as it has no tongue.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  cage_robbed: {
    on: [{ flag: 'cageRobbed' }, { gold: 120 }],
    text: (c) => [c.flags.cashierDown
      ? 'You step over the cashier and empty the strongbox into your pockets.'
      : 'The cage opens. The skeleton keeps counting. You help yourself to the strongbox, and it doesn’t look up once. When it finishes counting, it will be very surprised.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  cashier_fight: {
    text: ['The skeleton stops counting. It reaches under the counter and comes up with a cashbox, which it swings at your head.'],
    fight: {
      monsters: [{ name: 'Cashier skeleton', lvl: 2, range: 'engaged', feats: ['undead'], note: 'Undead; counts everything, including your teeth' }],
      win: 'cashier_down', flee: { to: 'floor', label: 'Back to the floor' },
    },
  },
  cashier_down: {
    on: [{ flag: 'cashierDown' }],
    text: ['The cashier comes apart in a clatter of bones and coins. Nobody on the gaming floor looks round. Bones fall over in here all the time.'],
    choices: [{ text: 'Help yourself to the strongbox', to: 'cage_robbed' }],
  },
  office: {
    text: (c) => [
      c.flags.coffinKey ? 'The staff room is a crypt with a desk in it. On the wall hangs a calendar with every sunrise circled in red, and an empty hook labelled COFFIN.' : 'The staff room is a crypt with a desk in it. On the wall hangs a calendar with every sunrise circled in red, and a hook with a small silver key on it, labelled COFFIN.',
      c.flags.gossip ? 'The barman was right: there isn’t a mirror anywhere.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Take the coffin key', to: 'office_key', show: { notFlag: 'coffinKey' } },
      { text: 'Back to the floor', to: 'floor' },
    ],
  },
  office_key: {
    on: [{ flag: 'coffinKey' }, { item: 'coffin' }],
    text: ['You pocket the key. Somewhere below, something in a velvet-lined box is going to have a very bad morning.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  crypt: {
    text: (c) => c.flags.countAwake
      ? ['Grey light leaks into the private crypt. Count Fortunato is up, hunched beside his coffin with his cloak over his head, hissing at the dawn. He is weak, and furious, and between you and THE BANK.']
      : (c.flags.hour || 0) >= 4
      ? ['Down the stair, the private crypt is quiet. Grey light leaks through a grating high in the wall: dawn. In the middle of the room, on a velvet dais, stands a black coffin. From inside comes a gentle snoring. Behind it, a great iron door is marked THE BANK.']
      : c.flags.countWon ? ['Count Fortunato is still at his card table, shuffling your money into his. He doesn’t look up. “Back for more?” he says. “Nobody ever isn’t.”', 'Behind him, a great iron door is marked THE BANK. Behind that, a black coffin stands on a velvet dais.']
      : c.flags.countAngry ? ['Count Fortunato is waiting for you this time, standing, with the candles leaning away from him. “You ran,” he says. “Nobody leaves a table of mine in the middle of a hand.”', 'Behind him, a great iron door is marked THE BANK. Behind that, a black coffin stands on a velvet dais.']
      : ['Down the stair, in a private crypt lit by a hundred candles, a tall pale man in evening dress sits alone at a card table, shuffling. Count Fortunato looks up and smiles with too many teeth. “A guest,” he says. “How lucky. For me.”', 'Behind him, a great iron door is marked THE BANK. Behind that, a black coffin stands on a velvet dais.'],
    choices: [
      { text: 'Lock him in his coffin', to: 'coffin_locked', if: { item: 'coffin' }, show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Padlock the coffin shut', to: 'coffin_sealed', if: { item: 'padlock' }, show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Nail the coffin shut with your iron spikes', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'], why: 'quiet hammering' }, pass: 'coffin_sealed', fail: 'count_wakes', if: { item: 'spikes' }, show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Glue the coffin lid shut', to: 'coffin_sealed', if: { item: 'glue' }, effects: [{ lose: 'glue' }], show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Tiptoe past the coffin to the bank', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'bank', fail: 'count_wakes', show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Cast Step, and teleport past the coffin into the bank', cast: 'step', pass: 'bank', fail: 'count_wakes', show: { atLeast: ['hour', 4], notFlag: 'countAwake' } },
      { text: 'Show him his reflection in your hand mirror', to: 'mirror', if: { item: 'mirror' }, show: { flag: 'countAwake' } },
      { text: 'Fight him while he’s weak', to: 'count_weak', show: { flag: 'countAwake' } },
      { text: 'Play him for the bank: double or nothing', test: { stat: 'Cha', dd: 12, save: true }, pass: 'count_lost', fail: 'count_won', show: { below: ['hour', 4], notFlag: 'countAngry' } },
      { text: 'Show him his reflection in your hand mirror', to: 'mirror', if: { item: 'mirror' }, show: { below: ['hour', 4] } },
      { text: 'Turn him', turn: { dd: 10 }, pass: 'count_flees', chaos: 'count_obeys', fail: 'count_fight', if: { magic: 'divine' }, show: { below: ['hour', 4] } },
      { text: 'Cast Banish, so every undead thing flees the crypt', cast: 'banish', pass: 'count_flees', fail: 'count_fight', critFail: 'count_entreated', show: { below: ['hour', 4] } },
      { text: 'Cast Divine light on the table: the nearest thing to dawn he’s seen in three hundred years', cast: 'light', pass: 'count_dazzled', fail: 'count_fight', critFail: 'count_shrouded', show: { below: ['hour', 4] } },
      { text: 'Attack him', to: 'count_fight', show: { below: ['hour', 4] } },
      { text: 'Go back upstairs', to: 'floor' },
    ],
  },
  coffin_locked: {
    on: [{ flag: 'countLocked' }],
    text: ['The key turns with a satisfying click. Inside, the snoring stops, then starts again, slightly worried. You have until dusk.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  count_wakes: {
    text: ['A floorboard creaks. The coffin lid creaks back. Count Fortunato sits up, squints at the grey light from the grating, and hisses. Dawn has made him weak and furious.'],
    on: [{ flag: 'countAwake' }],
    fight: {
      monsters: [{ ...count, lvl: 3, name: 'Count Fortunato (half asleep)', note: 'Luck vampire, weakened by dawn (level 3); each turn, 2/6 chance you fall prone; you critically fail defending on 17–20' }],
      win: 'count_dead', flee: { to: 'floor', label: 'Run upstairs' },
    },
  },
  count_weak: {
    text: ['Count Fortunato throws off his cloak and comes at you, squinting, through the grey light.'],
    fight: {
      monsters: [{ ...count, lvl: 3, name: 'Count Fortunato (half asleep)', note: 'Luck vampire, weakened by dawn (level 3); each turn, 2/6 chance you fall prone; you critically fail defending on 17–20' }],
      win: 'count_dead', flee: { to: 'floor', label: 'Run upstairs' },
    },
  },
  count_lost: {
    text: ['You cut the deck. Ace. He cuts. Two. For the first time in three hundred years, Count Fortunato has lost. He stares at the card. He stares at you. “That,” he says quietly, “is impossible.” He stands, bows stiffly, and walks into his coffin and closes the lid. You hear him weeping. The bank is yours.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  count_won: {
    on: [{ gold: -1000, msg: 'You lose everything you have.' }, { flag: 'countWon' }],
    text: ['You cut the deck. Ace. He cuts. Another ace, of a suit you’re fairly sure doesn’t exist. “Double,” he says gently, “or nothing. And you chose nothing.” He sweeps your gold off the table, and you feel your luck drain out through your feet.'],
    choices: [{ text: 'Attack him, since you’ve nothing left to lose', to: 'count_fight' }, { text: 'Crawl back upstairs', to: 'floor' }],
  },
  mirror: {
    text: ['You hold up the mirror. Count Fortunato looks into it and sees the room, the candles, the table, and no Count Fortunato at all. “No,” he whispers. “I’m… I’m not even here.” He sits down on the floor with his head in his hands and refuses to talk to anyone about anything. He’ll be like that for days.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  coffin_sealed: {
    on: [{ flag: 'countLocked' }],
    text: ['Inside the coffin, the snoring stops, then starts again, slightly worried. The lid isn’t opening before dusk, and possibly not after.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  count_dazzled: {
    text: ['The deck of cards begins to glow, then the table, then the whole crypt, warm and gold as a summer morning. Count Fortunato throws his cloak over his face, screams something about the time, and dives into his coffin. The lid slams. He won’t be out till dusk.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  count_flees: {
    text: ['You raise your holy symbol and Count Fortunato recoils as if it were the sun. He flees into his coffin and slams the lid. You hear him locking it from the inside.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  count_obeys: {
    on: [{ gold: 100, msg: 'He hands you his personal winnings: 100GP. “Master.”' }], onceOnly: true,
    text: ['You present your symbol of glorious entropy. The Count’s eyes cloud. He bows low. “Master,” he says. “What is mine is yours.” He opens the bank for you himself.'],
    choices: [{ text: 'Into the bank', to: 'bank' }],
  },
  count_fight: {
    on: [{ flag: 'countAngry' }],
    text: ['The Count rises from his chair, and the candles gutter. You feel your luck draining away like warm water out of a bath.'],
    fight: {
      monsters: [count], win: 'count_dead', flee: { to: 'floor', label: 'Run upstairs' },
      special: [
        { flag: 'mirrored', label: 'Show him your hand mirror', if: { item: 'mirror' }, text: 'He sees no reflection, screams, and sits down on the floor with his head in his hands.', win: true },
      ],
    },
  },
  count_dead: {
    on: [{ flag: 'countDead' }],
    text: ['Count Fortunato dissolves into a heap of dust and losing lottery tickets. Upstairs, every gambler in Fortune’s Fang suddenly feels much better, and three of them win at once.'],
    choices: [{ text: 'Open the bank', to: 'bank' }],
  },
  bank: {
    on: [{ flag: 'banked' }, { gold: 400, msg: 'Thirty years of Lesser Wager’s losses. You take what you can carry.' }], onceOnly: true,
    text: ['The bank is a vault full of coins, IOUs, deeds, wedding rings, false teeth and a surprising number of goats’ bells. It is everything the town ever lost.', 'In the corner, tied up with a pink ribbon and a label reading LOT 4,117, sits an enormous man in a waistcoat. He looks up hopefully. “Is that—” he says.'],
    choices: [
      { text: 'Untie him', to: 'tex' },
      { text: 'Leave him, and go upstairs', to: 'exit' },
    ],
  },
  tex: {
    on: [{ flag: 'texFree' }],
    text: ['“—Rex?” he finishes, hopefully. “No,” you say, untying the ribbon. “But he’s upstairs.” Tex, the other Bouncer Twin, lost himself to the Count at double or nothing a week ago, and has been sitting in the bank ever since, waiting for somebody to start a sentence.'],
    choices: [{ text: 'Take him upstairs', to: 'exit' }],
  },
  exit: {
    text: (c) => c.flags.texFree && c.flags.rexDown
      ? ['Rex is still out cold where you left him. Tex sits down beside him, back to back, as is their custom, and gently slaps him awake. “Who—” says Rex. “—hit you? This one,” says Tex. They watch you leave in a silence they finish together.']
      : c.flags.texFree
      ? ['At the door, Rex turns, sees his brother, and drops the money he was counting. “Tex! I thought—” “—you’d never see me again?” “—exactly!” They hug, back to back, as is their custom. Nobody asks you for anything on the way out.']
      : c.flags.rexDown
        ? ['You walk back through the gaming floor, clinking. Rex is still out cold where you left him. Nobody stops you.']
        : c.flags.rexFriend
          ? ['At the door, Rex looks at your bulging pockets, then past you, down the steps, hopefully. “Did you—” You shake your head. He sighs, and waves you out without a word, because he can only manage half of one.']
          : ['At the door, Rex looks at your bulging pockets. “Leaving so—” He waits. “Exit fee,” he says miserably.'],
    choices: [
      { text: 'Walk out', to: 'dawn_out', show: { any: [{ flag: 'rexDown' }, { flag: 'texFree' }, { flag: 'rexFriend' }] } },
      { text: 'Pay the exit fee (40GP)', to: 'dawn_out', if: { gold: 40 }, effects: [{ gold: -40 }], show: { none: [{ flag: 'rexDown' }, { flag: 'texFree' }, { flag: 'rexFriend' }] } },
      { text: 'Fight your way out', to: 'exit_fight', show: { none: [{ flag: 'rexDown' }, { flag: 'texFree' }, { flag: 'rexFriend' }] } },
    ],
  },
  exit_fight: {
    text: ['“Then you’ll—” says Rex, and there’s nobody to finish it.'],
    fight: { monsters: [rex], win: 'dawn_out' },
  },
  dawn_out: {
    end: 'victory',
    text: (c) => [
      c.flags.countDead ? 'You climb the steps into the churchyard. Behind you, with the Count gone, the gamblers of Lesser Wager have started winning, and they are finding out that the house has nothing left to pay them with.'
        : c.flags.hour >= 4 ? 'You climb the steps into a grey dawn. In the churchyard, the townsfolk of Lesser Wager are stretching and blinking, and none of them have tripped over anything for minutes. By dusk the Count will be awake again, and hungry.'
          : c.flags.banked ? 'You climb the steps into the night air. Behind you, Fortune’s Fang carries on taking money from people who can’t afford it, from a bank that is now empty. Somebody will notice in the morning.'
            : 'You climb the steps into the night air. Behind you, Fortune’s Fang carries on taking money from people who can’t afford it. That is none of your business.',
      `You leave with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}. Every 200GP you squander on a pointless endeavour gains you a level.`,
    ],
  },
  rex_lit: {
    text: ['Your god scorns you. Instead of darkness, light pours out of your sleeves, and you walk up to Rex glowing like a shop window. “You’re—” says Rex, and doesn’t need anyone to finish it.'],
    choices: [{ text: 'Fight him', to: 'rex_fight' }],
  },
  pinch_confesses: {
    on: [{ flag: 'pinchConfessed' }, { gold: 60 }],
    text: ['Mr Pinch freezes, claws raised, and relives his most recent sins in front of the whole table, which can see them as clearly as you can: the cup with the false bottom, the dice in his shell, the extra claw under the table. The punters stand up. Mr Pinch pays out every bet on the table, very fast, to keep them sitting down. You were on the table.'],
    choices: [{ text: 'Back to the floor', to: 'floor' }],
  },
  pinch_wiped: {
    on: [{ flag: 'pinchConfessed' }],
    text: ['Your god scorns you, and wipes Mr Pinch’s memory of the last twenty-four hours, including everything that stressed him. He looks around the table, relaxed and happy, a crab without a care in the world, and goes on cheating out of pure habit.'],
    choices: [{ text: 'Back to the table', to: 'crab_table' }],
  },
  count_shrouded: {
    text: ['Your god scorns you. Instead of light, darkness pours out over the card table and puts out every candle in the crypt. Count Fortunato sighs with pleasure. “Ah,” he says, in the dark, very close. “That’s better.”'],
    choices: [{ text: 'Fight him', to: 'count_fight' }],
  },
  count_entreated: {
    text: ['Your god scorns you. Instead of fleeing the crypt, every undead thing in Fortune’s Fang is drawn to it. Count Fortunato looks round in surprise as the skeleton croupiers file down the stairs and stand behind his chair. He smiles. He likes a crowd.'],
    choices: [{ text: 'Fight him', to: 'count_fight' }],
  },
};

export const DEATH_TEXT = [
  'Your luck runs out, and so do you. The Count adds your purse to the bank, and your name to the ledger of the unlucky.',
  'Your adventure ends here.',
];
