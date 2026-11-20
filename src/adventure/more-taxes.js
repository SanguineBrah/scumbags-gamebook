// DEATH AND MORE TAXES — break into the Royal Exchequer to get your name out of the Great Ledger. For a level 7–8 scumbag.
import { pastFlag, didAdventure } from '../engine/conditions.js';

export const META = {
  tier: 8, id: 'more-taxes', title: 'Death and More Taxes', levels: '7–8', final: 'free',
  blurb: 'A letter arrives at the Drowned Rat with a red seal on it. The Royal Exchequer has noticed your income. You owe a thousand gold in tax, and the Auditor-General is coming to collect. There’s another way: the Great Ledger in the Exchequer at Grimchester. If your name isn’t in it, you don’t owe anything. And the Thieves’ Guild will pay well for the Master Seal while you’re there.',
};

const bureaucrat = { name: 'Militant bureaucrat', lvl: 5, hp: 16, range: 'medium', feats: ['dealD6', 'approval'], note: 'Deals +d6 damage; every action has to be approved first (it acts every other turn)' };
const cabinet = { name: 'Filing cabinet', lvl: 6, hp: 20, ap: 6, range: 'engaged', note: 'A mimic in the shape of a filing cabinet; four drawers of teeth (20 HP, 6 AP)' };
const auditor = { name: 'The Auditor-General', lvl: 8, hp: 30, range: 'engaged', feats: ['dealD6', 'approval'], note: 'Seven feet of black wool and spectacles; deals +d6 damage; acts every other turn, but very hard' };

const HISTORY = (c) => {
  const lines = [];
  if (pastFlag(c, 'death-and-taxes', 'bureaucratDead')) lines.push('A clerk in a cardigan, the image of the one you killed under Gallows Hill. His brother, it turns out. He has been waiting.');
  if (pastFlag(c, 'death-and-taxes', 'vaneGone') || pastFlag(c, 'death-and-taxes', 'looted')) lines.push('Under your name, a note: “Proceeds of the Vane estate. Unreported.”');
  if (pastFlag(c, 'eviction-notice', 'burnt')) lines.push('And another: “Fee from Lord Grimsby, for arson. Taxable.”');
  return lines;
};

export const SECTIONS = {
  start: {
    text: (c, visits) => visits > 1 ? ['You’re back outside the Royal Exchequer at Grimchester. The queue hasn’t moved. The letter in your pocket hasn’t changed its mind.'] : [
      'The Royal Exchequer at Grimchester is a building the size of a cathedral, made entirely of paperwork. Its front steps are a queue. The queue goes round the building three times and into the river. At the top of the steps, carved over the door: EVERYTHING IS TAXABLE.',
      `In your pocket is the letter. It says you owe a thousand gold, “for income from ${didAdventure(c, 'death-and-taxes') ? 'a vault under Gallows Hill, among other things' : 'various activities'}”, and it is signed by the Auditor-General himself. Somewhere inside is the Great Ledger, with your name in it, and the Master Seal, which the Thieves’ Guild will pay 300 gold for.`,
    ],
    choices: [
      { text: 'Join the queue', to: 'queue' },
      { text: 'Go round to the delivery entrance', to: 'delivery' },
      { text: 'Climb in through a window', test: { stat: 'Str', dd: 10, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 6 }] }, pass: 'archive', fail: 'window_fall' },
    ],
  },
  window_fall: {
    on: [{ damage: '2d6', from: 'The Exchequer' }],
    text: ['You get halfway up the wall, and then a clerk opens the window you were climbing towards, and hands you a form for falling off, and you fall off.'],
    choices: [{ text: 'Try something else', to: 'start' }],
  },
  queue: {
    text: ['The queue takes four hours. At the front, a clerk at a high desk stamps your letter without reading it and gives you a ticket: 9,412. A board above him says NOW SERVING: 12. Beyond him, a door marked STAFF ONLY.'],
    choices: [
      { text: 'Forge yourself a staff pass with your quill', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'], profs: ['Envoy'], why: 'you know your way round paperwork' }, pass: 'forms', fail: 'caught', if: { item: 'quill' } },
      { text: 'Tell the clerk you’re from the Auditor-General’s office', test: { stat: 'Cha', dd: 10, skill: ['lying'] }, pass: 'forms', fail: 'caught' },
      { text: 'Cast Invisibility on yourself, and walk past the clerk', cast: 'invisibility', pass: 'forms', fail: 'caught' },
      { text: 'Wait your turn', to: 'wait' },
    ],
  },
  wait: {
    on: [{ damage: 'd4', from: 'Despair' }],
    text: ['You wait. Night falls. The board says NOW SERVING: 13. You decide to try something else.'],
    choices: [{ text: 'Go round to the delivery entrance', to: 'delivery' }],
  },
  caught: {
    text: ['The clerk peers at you over his spectacles. “Irregular,” he says, and rings a little bell. A door opens, and a bureaucrat in a cardigan comes out with an armful of rubber stamps.'],
    fight: { key: 'bureaucrat', monsters: [bureaucrat], distance: 1, win: 'forms', flee: { to: 'start', label: 'Back out into the queue' } },
  },
  delivery: {
    text: ['At the delivery entrance, porters unload cartloads of paper. A foreman checks every cart against a list.'],
    choices: [
      { text: 'Hide in a cart of blank forms', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'archive', fail: 'caught' },
      { text: 'Blow your whistle and shout “FIRE DRILL!”', to: 'fire_drill', if: { item: 'whistle' } },
      { text: 'Back to the front', to: 'start' },
    ],
  },
  fire_drill: {
    on: [{ flag: 'drill' }],
    text: ['You blow your whistle and shout “FIRE DRILL!” Within a minute, eight hundred clerks have filed out of every door in perfect order, with their in-trays, and are lining up on the lawn to be counted. The building is empty. It will take them hours to count themselves.'],
    choices: [{ text: 'Walk in', to: 'forms' }],
  },
  forms: {
    text: (c) => [
      c.flags.drill ? 'The Hall of Forms is empty, with papers still drifting down from where the clerks dropped them.' : 'Inside, the Hall of Forms stretches away into the gloom: desk after desk after desk, and at every one a clerk stamping, filing and not looking up.',
      'Signposts point to the ARCHIVE, the VAULT, and up a grand staircase to the AUDITOR-GENERAL.',
    ],
    choices: [
      { text: 'Go to the Archive', to: 'archive' },
      { text: 'Go to the Vault', to: 'vault', show: { notFlag: 'vaultDone' } },
      { text: 'Climb the stairs to the Auditor-General', to: 'auditor_door' },
      { text: 'Cast Create portal, and step through any door into the vault you marked', cast: 'portal', pass: 'vault_in', fail: 'forms', show: { flag: 'vaultSeen', notFlag: 'vaultDone' } },
    ],
  },
  archive: {
    text: (c) => [
      'The Archive is a forest of filing cabinets, forty feet high, with ladders on rails. Somewhere in here is a copy of every tax return ever filed, and a few that weren’t.',
      c.flags.cabinetDone ? '' : 'One of the cabinets, in the middle of the aisle, is breathing.',
    ].filter(Boolean),
    choices: [
      { text: 'Look up your own file', test: { stat: 'Int', dd: 8, skill: ['analysis'] }, pass: 'your_file', fail: 'cabinet_fight', show: { none: [{ flag: 'fileFound' }, { flag: 'cabinetDone' }] } },
      { text: 'Look up your own file', test: { stat: 'Int', dd: 8, skill: ['analysis'] }, pass: 'your_file', fail: 'file_lost', show: { flag: 'cabinetDone', notFlag: 'fileFound' } },
      { text: 'Padlock the breathing cabinet’s drawers shut', to: 'cabinet_locked', if: { item: 'padlock' }, show: { notFlag: 'cabinetDone' } },
      { text: 'Glue its drawers shut', to: 'cabinet_locked', if: { item: 'glue' }, show: { notFlag: 'cabinetDone' } },
      { text: 'Go to the Hall of Forms', to: 'forms' },
    ],
  },
  file_lost: {
    text: ['You spend an hour on a ladder, in the wrong decade. You come down dusty and none the wiser.'],
    choices: [{ text: 'Back to the Archive', to: 'archive' }],
  },
  cabinet_locked: {
    on: [{ flag: 'cabinetDone' }],
    text: ['You seal its drawers shut. The cabinet heaves and rattles, and makes a muffled sound like a dog with its mouth full. It isn’t going anywhere now. Neither are its teeth.'],
    choices: [{ text: 'Back to the Archive', to: 'archive' }],
  },
  cabinet_fight: {
    text: ['You open the wrong drawer. It has teeth. So do the other three. The filing cabinet comes at you, drawers snapping.'],
    fight: { monsters: [cabinet], win: 'cabinet_down', flee: { to: 'forms', label: 'Run for the Hall of Forms' } },
  },
  cabinet_down: {
    on: [{ flag: 'cabinetDone' }],
    text: ['The filing cabinet topples over with a crash that echoes through the Archive, and its drawers fall open, empty of everything but teeth. Your file was in the one next to it.'],
    choices: [{ text: 'Read your file', to: 'your_file' }],
  },
  your_file: {
    on: [{ flag: 'fileFound' }],
    text: (c) => [
      'Your file is very thick. Somebody at the Exchequer has been following your career with interest.',
      ...HISTORY(c),
      'At the bottom: “Liability entered in the Great Ledger. Collection: the Auditor-General, in person.” The file itself means nothing. It’s the Ledger you need.',
    ],
    choices: [
      { text: 'Burn the file anyway', to: 'archive', if: { fire: true }, effects: [{ flag: 'fileBurnt' }, { msg: 'Your file goes up. Nobody notices. Nobody ever reads them.' }] },
      { text: 'Back to the Hall of Forms', to: 'forms' },
    ],
  },
  vault: {
    on: [{ flag: 'vaultSeen' }],
    text: ['The Exchequer vault is behind a steel door with three locks and a clerk. The clerk is asleep. The locks are not.'],
    choices: [
      { text: 'Pick the locks', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'vault_in', fail: 'vault_alarm', if: { item: 'tools' } },
      { text: 'Cast Insubstantiate on yourself, and walk through the vault wall', cast: 'insubstantiate', pass: 'vault_in', fail: 'vault', critFail: 'enfeebled_self', show: { notFlag: 'vaultDone' } },
      { text: 'Melt the locks with acid', to: 'vault_in', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Show the clerk Vane’s golden abacus, and say you’ve come to make a deposit', to: 'abacus', if: { item: 'abacus' } },
      { text: 'Back to the Hall of Forms', to: 'forms' },
    ],
  },
  abacus: {
    text: ['The clerk wakes up at the click of golden beads. He stares at the abacus. “Usurer Vane’s,” he whispers. “The Exchequer has been after that for twenty years. Taxable. Highly taxable.” He unlocks all three locks to take it from you, and doesn’t notice you follow him in.'],
    on: [{ lose: 'abacus' }],
    choices: [{ text: 'Into the vault', to: 'vault_in' }],
  },
  vault_alarm: {
    on: [{ damage: 'd6', from: 'A trap' }],
    text: ['The second lock fires a dart into your thumb, and a bell rings somewhere. The clerk wakes up, sees you, and goes for help.'],
    fight: { key: 'bureaucrat', monsters: [bureaucrat], distance: 1, win: 'vault_in', flee: { to: 'forms', label: 'Run' } },
  },
  vault_in: {
    on: [{ flag: 'vaultDone' }, { gold: 250, msg: 'The Exchequer’s petty cash. You take what you can carry.' }], onceOnly: true,
    text: ['The vault holds the kingdom’s taxes, in sacks, labelled by county. You take a sack from a county you don’t like.'],
    choices: [{ text: 'Back to the Hall of Forms', to: 'forms' }],
  },
  auditor_door: {
    text: (c) => [
      'At the top of the grand staircase is a door of black oak with a brass plate: THE AUDITOR-GENERAL. KNOCK AND WAIT.',
      c.flags.auditorOut ? 'It stands open. Nobody is inside.' : c.flags.drill ? 'Through the keyhole, you can see him: he has not gone to the fire drill. He doesn’t believe in them.' : 'Through the keyhole, you can see a tall, thin shape at a desk, writing.',
    ],
    choices: [
      { text: 'Go in', to: 'office', show: { flag: 'auditorOut' } },
      { text: 'Knock and wait', to: 'office', show: { notFlag: 'auditorOut' } },
      { text: 'Slip a forged summons under the door, calling him to the King', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'summoned', fail: 'office', if: { item: 'quill' }, show: { notFlag: 'auditorOut' } },
      { text: 'Back down to the Hall of Forms', to: 'forms' },
    ],
  },
  summoned: {
    on: [{ flag: 'auditorOut' }],
    text: ['A long hand takes the summons from under the door. There is a pause. Then the door opens, and the Auditor-General walks past you without looking down, putting on his coat, and goes off down the stairs at the speed of a man summoned by a king. The door is open.'],
    choices: [{ text: 'Go in', to: 'office' }],
  },
  office: {
    text: (c) => [
      'The Auditor-General’s office holds a desk, a chair and, on a lectern by the window, the Great Ledger: a book as big as a door, chained to the floor, with every debt in the kingdom in it. The Master Seal sits on the desk in a velvet box.',
      c.flags.auditorOut ? '' : 'Behind the desk sits the Auditor-General: seven feet of black wool and spectacles. He looks up. “You,” he says, and turns a page in the ledger to your name without looking. “In arrears.”',
    ].filter(Boolean),
    choices: [
      { text: 'Strike out your name with your quill', to: 'struck', if: { item: 'quill' }, show: { flag: 'auditorOut' } },
      { text: 'Tear out your page', to: 'struck', show: { flag: 'auditorOut' } },
      { text: 'Take the Master Seal', to: 'seal', show: { flag: 'auditorOut', notFlag: 'seal' } },
      { text: 'Offer to pay him', to: 'pay', if: { gold: 200 }, show: { notFlag: 'auditorOut' } },
      { text: 'Argue that your income was not taxable', test: { stat: 'Int', dd: 12, skill: ['analysis', 'languages'], profs: ['Envoy'], why: 'you know your way round a regulation' }, pass: 'argued', fail: 'auditor_fight', show: { notFlag: 'auditorOut' } },
      { text: 'Cast Freeze time, and strike out your name while he sits there, mid-blink', cast: 'freeze', pass: 'frozen', fail: 'auditor_fight', show: { notFlag: 'auditorOut' } },
      { text: 'Cast Clone, and leave your copy arguing with him while you see to the ledger', cast: 'clone', pass: 'cloned', fail: 'auditor_fight', show: { notFlag: 'auditorOut' } },
      { text: 'Cast Confession on the Auditor-General', cast: 'confession', pass: 'auditor_confesses', fail: 'auditor_fight', critFail: 'auditor_wiped', show: { notFlag: 'auditorOut' } },
      { text: 'Fight him', to: 'auditor_fight', show: { notFlag: 'auditorOut' } },
      { text: 'Leave', to: 'free' },
    ],
  },
  pay: {
    on: [{ gold: -200 }, { flag: 'settled' }],
    text: ['You offer him two hundred. He looks at it. “A down-payment,” he says. “Acceptable.” He writes it in the Ledger. You will owe the rest forever, at a very reasonable rate. But not today.'],
    choices: [{ text: 'Leave', to: 'free' }],
  },
  argued: {
    on: [{ flag: 'struckOut' }, { flag: 'settled' }],
    text: ['You argue for an hour. Income from a vault under a hill is treasure trove. Fees are expenses. Squandering is a charitable donation. The Auditor-General listens, writing. At the end, he sighs, takes off his spectacles, and draws a line through your name. “Nobody,” he says, “has ever read the regulations before.”'],
    choices: [{ text: 'Leave', to: 'free' }],
  },
  auditor_fight: {
    text: ['The Auditor-General rises, and rises, and keeps rising. He takes a ruler from his desk. “Obstruction,” he says, “is also taxable.”'],
    fight: {
      monsters: [auditor], win: 'auditor_down', flee: { to: 'forms', label: 'Run down the stairs' },
      special: [{ label: 'Blow your bellows at his papers', if: { item: 'bellows' }, flag: 'blown', text: 'A blizzard of paperwork fills the room. He drops everything to catch it. He has to. It’s filed.', stun: 1 }],
    },
  },
  auditor_down: {
    on: [{ flag: 'auditorOut' }],
    text: ['The Auditor-General folds up like a deckchair, and lies on the floor, still holding his ruler. His spectacles have come off. Without them, he looks quite young.'],
    choices: [{ text: 'Look at the Ledger', to: 'office' }],
  },
  struck: {
    on: [{ flag: 'struckOut' }],
    text: ['You find your name in the Great Ledger and remove it. A thousand gold of debt goes with it. As far as the kingdom is concerned, you have never earned a penny in your life, which, morally, may even be true.'],
    choices: [{ text: 'Back to the office', to: 'office_after' }],
  },
  office_after: {
    text: ['The Great Ledger lies open on its lectern, one page lighter.'],
    choices: [
      { text: 'Take the Master Seal', to: 'seal', show: { notFlag: 'seal' } },
      { text: 'Leave', to: 'free' },
    ],
  },
  seal: {
    on: [{ flag: 'seal' }, { item: 'seal' }],
    text: ['The Master Seal of the Exchequer is a heavy silver stamp. With it, anybody could approve anything. The Thieves’ Guild is going to be very pleased.'],
    choices: [{ text: 'Leave', to: 'free' }],
  },
  free: {
    end: 'victory',
    on: [{ sell: { item: 'seal', gold: 300, text: 'The Thieves’ Guild buys the Master Seal' } }],
    text: (c) => [
      c.flags.struckOut ? 'You walk out of the Royal Exchequer a free scumbag. No tax. No debt. No record of you at all.'
        : c.flags.settled ? 'You walk out of the Royal Exchequer in debt to the Crown forever, at a very reasonable rate. Most people are.'
          : 'You walk out of the Royal Exchequer with your name still in the Great Ledger. A thousand gold. The Auditor-General will be in touch, sooner or later. He always is.',
      c.flags.sold_seal ? 'Within a week, every thief in Grimchester has a stamped licence to steal, approved.' : '',
      `You leave Grimchester with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ].filter(Boolean),
  },
  enfeebled_self: {
    text: ['Your god scorns you. Instead of turning to mist, you turn fragile: for five minutes, everything that hits you will hurt more than usual. Nothing does. You stand by the vault door, feeling breakable, until it wears off.'],
    choices: [{ text: 'Back to the vault door', to: 'vault' }],
  },
  cloned: {
    on: [{ flag: 'struckOut' }],
    text: ['A copy of you appears beside you, a little vaguer around the eyes, and launches into an argument with the Auditor-General about whether a turnip is income. He is drawn in at once; it is a very stupid argument. While they shout, you walk round behind him, find your name in the Great Ledger and remove it. Three minutes later, your copy dissolves mid-sentence. He keeps arguing with the chair.'],
    choices: [{ text: 'Leave', to: 'free' }],
  },
  auditor_confesses: {
    on: [{ flag: 'struckOut' }, { flag: 'settled' }],
    text: ['The Auditor-General goes rigid, and relives his most recent sins, which you watch with him: an expense claim for a second desk, a third desk and a horse, and forty years of never once paying his own taxes. When it’s over he takes off his spectacles. Without a word, he draws a line through your name in the Great Ledger. “We will say no more about it,” he says.'],
    choices: [{ text: 'Leave', to: 'free' }],
  },
  auditor_wiped: {
    text: ['Your god scorns you, and wipes the last day’s worries from the Auditor-General’s mind. He doesn’t have any. He has never had a worry in his life. He looks at you exactly as he did before. “In arrears,” he says.'],
    choices: [{ text: 'Back to the office', to: 'office' }],
  },
  frozen: {
    on: [{ flag: 'struckOut' }],
    text: ['Time stops. The Auditor-General hangs over his desk in mid-blink, a speck of dust stopped in the air beside his ear. You walk round him, find your name in the Great Ledger and remove it. A thousand gold of debt goes with it. Time is coming back; you can feel it, like a tide.'],
    choices: [
      { text: 'Take the Master Seal on your way past', to: 'seal' },
      { text: 'Leave while you can', to: 'free' },
    ],
  },
};

export const DEATH_TEXT = [
  'You die in the Royal Exchequer. They tax your estate at a hundred per cent, and file you under D.',
  'Your adventure ends here.',
];
