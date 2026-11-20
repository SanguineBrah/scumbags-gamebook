// FINAL DEMAND — Death and the taxman come to collect, at the counting house where it all began.
// The last adventure of a career: whoever finishes it retires. For a level 10 scumbag, or more.
import { pastFlag, didAdventure } from '../engine/conditions.js';

export const META = {
  tier: 11, id: 'final-demand', title: 'Final Demand', levels: '10', final: 'retirement', finale: true,
  blurb: 'Two letters arrive at the Drowned Rat on the same morning. One has a black border. The other has a red seal. Both are addressed to you, both want to see you at the Counting House under Gallows Hill at midnight, and neither of them is the kind of thing you can put off. Nothing in this world is certain, as the saying goes, except two things. Whatever happens, it’s the end of your career.',
};

const auditor = { name: 'The Auditor-General', lvl: 8, hp: 30, range: 'engaged', feats: ['dealD6', 'approval'], note: 'Seven feet of black wool and spectacles; deals +d6 damage; acts every other turn, but very hard' };
const death = { name: 'Death', proper: true, lvl: 10, hp: 80, range: 'engaged', dmg: '3d8', note: 'Four thousand years in the job (80 HP, 3d8). He can’t be killed, but he can be beaten' };

const dt = (c, f) => pastFlag(c, 'death-and-taxes', f);
const mt = (c, f) => pastFlag(c, 'more-taxes', f);
const hol = (c, f) => pastFlag(c, 'death-takes-a-holiday', f);
const kobolds = (c) => pastFlag(c, 'eviction-notice', 'kobsLeave');
const vaneHere = (c) => dt(c, 'vaneServes') || dt(c, 'vaneTurned');
const owed = (c) => Math.max(200, c.wasted || 0);

/** The Auditor-General, as you left him (or as you've never met him). */
const AUDITOR = (c) => mt(c, 'struckOut') ? 'He is carrying a file with nothing in it, which bothers him more than anything has ever bothered him.'
  : mt(c, 'auditorOut') ? 'There is a dent in his spectacles, about the size of your fist. He hasn’t had them mended. He wanted to show you.'
    : mt(c, 'settled') ? 'He has your payment book under his arm. You have been paying at a very reasonable rate. He has come about the rest.'
      : didAdventure(c, 'more-taxes') ? 'Your name is still in the Great Ledger. He has brought the page.'
        : 'You have never met him. He has a file on you as thick as a door.';

/** Death, as you left him (or as you've never met him). */
const DEATH = (c) => hol(c, 'returned') ? 'He still has the tan from Brinemouth, and the look of somebody who took a fortnight off and came back to everything. He nods to you like a colleague.'
  : hol(c, 'soldScythe') ? 'He has his scythe back. “The necromancer,” he says, when he sees you looking at it. “Last Tuesday. Took me a week to catch up on the paperwork.” He looks at you. “I said I’d see you later.”'
    : didAdventure(c, 'death-takes-a-holiday') ? 'He has his scythe back, no thanks to you. He doesn’t hold it against you. He doesn’t hold anything against anyone. It isn’t in his job description.'
      : 'You have never met. He has your name on his list anyway, near the top, after a man in Sludgeby who argued and before a shipwreck.';

export const SECTIONS = {
  start: {
    text: (c) => [
      'Two letters come for you at the Drowned Rat, on the same tray. The landlord puts them down and backs away.',
      'The first has a black border. Inside is a small printed card, like one from a dentist: YOU HAVE AN APPOINTMENT. Somebody has filled in the blanks in a neat, tired hand: The Counting House, Gallows Hill. Midnight. At the bottom, in print: If you are unable to attend, you will attend anyway. Please bring nothing.',
      `The second has a red seal. FINAL DEMAND. Tax on a lifetime of pointless endeavours: ${owed(c)} gold, plus interest, to be collected in person at your registered address, the Counting House, Gallows Hill, at midnight. It is signed by the Auditor-General.`,
      `You have never registered an address in your life. Somebody has done it for you, because of ${dt(c, 'looted') ? 'a vault you emptied' : 'a vault you visited'} under Gallows Hill, a long time ago, when you were level 1 and didn’t know any better.`,
    ],
    choices: [
      { text: 'Go to Gallows Hill', to: 'hill' },
      { text: 'Take the night coach out of the country', to: 'coach' },
      { text: 'Stay where you are and order another drink', to: 'stay' },
    ],
  },
  coach: {
    on: [{ add: ['quarters', 1] }],
    text: ['You buy a seat on the night coach to the coast. Sitting opposite you is a tall, thin passenger in a black robe, eating a sandwich out of a tin box and going through a list with a pencil. On the roof, with the luggage, somebody in black wool is doing sums. At the first crossroads, the coach turns, for no reason the driver can explain, towards Gallows Hill.'],
    choices: [{ text: 'Get out at the bottom of the hill', to: 'hill' }],
  },
  stay: {
    text: ['You order another drink. Then another. At a quarter to midnight, a black carriage draws up outside the Drowned Rat, with nobody driving it, and the door swings open. The landlord looks at you. Everyone looks at you. You finish your drink, and get in.'],
    choices: [{ text: 'Ride to Gallows Hill', to: 'clock' }],
  },
  hill: {
    text: (c) => [
      'The Counting House of Usurer Vane is still built into the side of Gallows Hill like a tick into a dog, and the brass plaque on the door is still polished, though nobody has asked anyone to.',
      kobolds(c) ? 'Parked beside it, where the gallows used to be, is a kobold siege-pyramid with bunting on it. Every window in the house is lit, and you can hear a fiddle. Grandmother Snik’s kobolds have made themselves at home.'
        : 'The windows are dark. Nobody has lived here since you left, except whatever was here before.',
      c.flags.quarters ? 'A church clock down in the valley strikes a quarter past eleven. You have less than an hour.' : 'A church clock down in the valley strikes eleven. You have an hour.',
    ],
    choices: [{ text: 'Go in', to: 'house' }],
  },
  house: {
    redirect: [{ if: { atLeast: ['quarters', 3] }, to: 'clock' }],
    text: (c) => [
      kobolds(c) ? 'The great hall is warm, noisy and full of kobolds, who have hung their washing from the coin chandelier. The tapestries of Vane foreclosing on things have been turned round to face the wall.'
        : 'The great hall is thick with dust and silence, as it was. The chandelier of coins still hangs from the ceiling. The tapestries still show Vane foreclosing on things.',
      dt(c, 'bureaucratDead') ? 'The hatch by the door, where the clerk used to sit, is boarded up.' : 'The hatch by the door slides open. A moustache looks at you, says “Ah,” and slides it shut again.',
      (c.flags.quarters || 0) ? 'Time is getting on.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Look in the library for Vane’s tax affairs', to: 'library', show: { notFlag: 'libraryDone' } },
      { text: 'Go down to the vault', to: 'vault_stairs', show: { notFlag: 'vaultDone' } },
      { text: 'Find Grandmother Snik', to: 'snik', show: { past: ['eviction-notice', 'kobsLeave'], notFlag: 'snikDone' } },
      { text: 'See if the homunculus is still in the kitchen', to: 'kitchen', show: { notPast: ['death-and-taxes', 'chefDead'], notFlag: 'soupDone' } },
      { text: 'Wait in the hall for midnight', to: 'clock' },
    ],
  },
  library: {
    dark: 'library',
    on: [{ add: ['quarters', 1] }, { flag: 'libraryDone' }],
    text: (c) => [
      'The library is as you left it: shelves from floor to ceiling, every debt Vane ever owned.',
      dt(c, 'mimicDead') ? 'TOME RAIDER is still lying on the floor where you left it, closed for good. Somebody has used it as a doorstop.'
        : 'TOME RAIDER is still on its shelf, breathing. It has had a litter. Three little paperbacks snap at you from the bottom shelf, and you leave them alone.',
      'Somewhere in here, among the ledgers, will be everything Vane ever knew about not paying tax. He never paid a penny in his life. Or his death.',
    ],
    choices: [
      { text: 'Search for it', test: { stat: 'Int', dd: 10, skill: ['analysis'], mods: [{ if: { item: 'loupe' }, dd: 6 }] }, pass: 'loophole', fail: 'library_lost' },
      { text: 'Back to the hall', to: 'house' },
    ],
  },
  loophole: {
    dark: 'library',
    on: [{ flag: 'loophole' }],
    text: ['Behind the ledgers is a slim black book in Vane’s hand: A HUNDRED WAYS NOT TO PAY. Number one: “Squandering is a charitable donation, if you squander it on others.” Number two: “Nobody is taxed for what they gave away.” You read it twice. You have, technically, given away a fortune.'],
    choices: [{ text: 'Back to the hall', to: 'house' }],
  },
  library_lost: {
    dark: 'library',
    text: ['Four thousand debts later, you find a recipe for soup and a pressed flower. Vane was a deeper man than anyone knew, and none of it is any use to you.'],
    choices: [{ text: 'Back to the hall', to: 'house' }],
  },
  vault_stairs: {
    dark: 'vault',
    on: [{ add: ['quarters', 1] }, { flag: 'vaultDone' }],
    text: (c) => [
      'The stair winds down a long way, as it always did.',
      dt(c, 'assessorsGone') ? 'The antechamber is empty. Nobody collects tolls down here any more.'
        : 'At the bottom, the two tiny assessors are still on guard, in front of the round iron door. They have aged. One has a little white beard. “Toll,” he says, out of habit, and then sees who it is, and lets you through for nothing.',
    ],
    choices: [{ text: 'Open the vault', to: 'vault' }],
  },
  vault: {
    dark: 'vault', litIf: { any: [{ past: ['death-and-taxes', 'vaneServes'] }, { past: ['death-and-taxes', 'vaneTurned'] }] },
    text: (c) => [
      dt(c, 'looted') ? 'The vault still has more gold in it than anyone could carry. You know, because you tried.' : 'The vault is full of gold, as it was the first time: chests of it, sacks of it, heaps of it on the floor like snowdrifts.',
      kobolds(c) ? 'The kobolds haven’t touched it. Grandmother Snik doesn’t hold with usury.' : '',
      dt(c, 'vaneServes') ? `At the desk, by the light of one candle, sits Usurer Vane, counting${dt(c, 'ledgerBurnt') ? ' on his fingers, since there is nothing else left to count' : ''}. He looks up and bows. “Master,” he whispers. “I have kept everything in order.”`
        : dt(c, 'vaneTurned') ? `At the desk, by the light of one candle, sits Usurer Vane, counting${dt(c, 'ledgerBurnt') ? ' on his fingers' : ''}. He sees your face, and the memory of a holy symbol, and slides behind his chair. He doesn’t leave. It’s his vault.`
          : 'The desk in the middle is empty. Usurer Vane closed his books a long time ago.',
      dt(c, 'ledgerBurnt') ? 'Where his ledger was, there is a little heap of ash.' : 'His ledger lies open on the desk: every debt in the kingdom, in his spidery hand.',
    ].filter(Boolean),
    choices: [
      { text: 'Look up the Crown in the ledger', to: 'crown', show: { notPast: ['death-and-taxes', 'ledgerBurnt'] } },
      { text: 'Ask Vane what he would do', to: 'vane_advice', show: { past: ['death-and-taxes', 'vaneServes'] } },
      { text: 'Back up the stairs', to: 'house' },
    ],
  },
  crown: {
    dark: 'vault', litIf: { any: [{ past: ['death-and-taxes', 'vaneServes'] }, { past: ['death-and-taxes', 'vaneTurned'] }] },
    on: [{ flag: 'crownDebt' }],
    text: ['Under C, between CLATTERBY, LORD (BOOTS) and CRUMB, MRS (ALL OF IT), is an entry that takes up two pages: THE CROWN. Borrowed: one war, two weddings and a cathedral. Repaid: nothing. Interest: compound, for sixty years. The total at the bottom is a number you can’t read out loud. Whoever owns Vane’s estate is owed it. According to the Exchequer, that’s you.'],
    choices: [
      { text: 'Tear out the pages, and go back to the vault', to: 'vault' },
    ],
  },
  vane_advice: {
    dark: 'vault', litIf: true,
    on: [{ flag: 'vaneOffer' }],
    text: (c) => [`Vane listens, nodding, his copper-penny eyes far away. “Death,” he whispers. “He came for me twenty years ago. I told him I was busy. I have been busy ever since.” He looks at ${dt(c, 'ledgerBurnt') ? 'the ash where his ledger was' : 'his ledger'}, and at you. “I am very tired, master. If he must take somebody, he may take me. I am overdue.”`],
    choices: [{ text: 'Back to the vault', to: 'vault' }],
  },
  snik: {
    on: [{ add: ['quarters', 1] }, { flag: 'snikDone' }, { flag: 'party' }],
    text: ['Grandmother Snik is in the kitchen, in her spectacles, rolling pastry for two hundred. “The one who found us a home,” she says, and gives you a pie. “You’ll stay for the party. Housewarming. We have one every year, at midnight, in the hall.” She hears about your letters, and sniffs. “Bring them both,” she says. “There’s plenty.”'],
    choices: [{ text: 'Back to the hall', to: 'house' }],
  },
  kitchen: {
    on: [{ add: ['quarters', 1] }, { flag: 'soupDone' }, { heal: '3d6' }],
    text: ['The homunculus is still there, on his stool, stirring. His tiny chef’s hat has gone grey. “Soup?” he asks. “Not the master’s,” he adds, quickly. It is the best soup you have ever had. He is, unfortunately, still adorable.'],
    choices: [{ text: 'Back to the hall', to: 'house' }],
  },
  clock: {
    text: (c) => [
      'You are standing in the great hall of the Counting House when, down in the valley, the church clock strikes twelve.',
      `On the last stroke, the front door opens, and two visitors come in at once, and stop, and look at each other. One is seven feet of black wool and spectacles. ${AUDITOR(c)}`,
      `The other is a skeleton in a black robe, with a scythe in one hand and a clipboard in the other. ${DEATH(c)}`,
      'They know each other, the way two people in the collecting business do. “After you,” says Death. “No,” says the Auditor-General. “After you.” They both look at you, and then at their watches.',
    ],
    choices: [{ text: 'Step forward', to: 'midnight' }],
  },
  midnight: {
    text: (c) => [
      'The Auditor-General opens his file. Death checks his clipboard. He has eleven more after you tonight, and a shipwreck. The Auditor-General charges by the hour.',
      c.flags.party ? 'Behind them, the kobolds are bringing out the pies, and a fiddler is tuning up.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Deal with the Auditor-General first', to: 'auditor_talk', show: { notFlag: 'taxDone' } },
      { text: 'Go and talk to Death', to: 'death_talk' },
      { text: 'Point out to the Auditor-General that Death has never paid tax', to: 'audit_death', if: { any: [{ past: ['death-takes-a-holiday', 'returned'] }, { flag: 'knowsDeathTax' }], flagText: 'something you know about Death' }, show: { notFlag: 'taxDone' } },
      { text: 'Invite them both to the kobolds’ party', to: 'party', show: { flag: 'party' } },
      { text: 'Cast Petition, and ask your god what to do', cast: 'petition', pass: 'petitioned', fail: 'midnight_fizzle', critFail: 'intervened', show: { notFlag: 'knowsDeathTax' } },
      { text: 'Cast Wish, and wish never to die', cast: 'wish', pass: 'wished', fail: 'midnight_fizzle' },
    ],
  },
  midnight_fizzle: {
    text: ['The spell fizzles. Death waits politely, the way he waits for everything. The Auditor-General makes a note.'],
    choices: [{ text: 'Try something else', to: 'midnight' }],
  },
  petitioned: {
    on: [{ flag: 'knowsDeathTax' }],
    text: ['You ask your god what to do about Death and taxes. Your god, who has been asked this before, answers at once: “Ask the taxman how Death gets paid.” Death, who heard, looks at the ceiling and becomes very interested in his clipboard.'],
    choices: [{ text: 'Back to your visitors', to: 'midnight' }],
  },
  intervened: {
    on: [{ gold: -100 }],
    text: ['Your god scorns you. Instead of an answer, you get action. A purse of a hundred gold flies out of your pocket, across the hall and into the Auditor-General’s hand. “A voluntary contribution,” he says, writing a receipt. “Most kind. It doesn’t count.”'],
    choices: [{ text: 'Back to your visitors', to: 'midnight' }],
  },
  wished: {
    on: [{ flag: 'immortal' }],
    text: ['You wish never to die. The air goes still. Death lowers his scythe, looks at you for a long moment, and crosses you off his clipboard. “Well,” he says. “That’s one fewer. I won’t pretend I’m sorry.” He leaves. The Auditor-General doesn’t. He sits down, takes out a fresh ledger, and opens it at page one. Nothing is certain except death and taxes. You only got rid of one of them.'],
    choices: [{ text: 'Go on living', to: 'retirement' }],
  },
  auditor_talk: {
    text: (c) => [
      `“${owed(c)} gold,” says the Auditor-General, “on a lifetime of pointless endeavours. Plus interest. Plus a fine, for the endeavours.”`,
      mt(c, 'struckOut') ? 'His file is empty. He has written the figure on the outside, from memory, and underlined it.'
        : 'He turns the file round so you can see it. Every one of them is there: the bets, the boats, the hats.',
    ],
    choices: [
      { text: 'Show him what the Crown owes Vane’s estate', to: 'crown_paid', if: { flag: 'crownDebt', flagText: 'Vane’s ledger page' } },
      { text: 'Argue every penny', test: { stat: 'Int', dd: 12, skill: ['analysis', 'lying'], mods: [{ if: { item: 'quill' }, dd: 10 }, { if: { flag: 'loophole' }, dd: 6 }] }, pass: 'argued', fail: 'auditor_fight' },
      { text: 'Remind him that you aren’t in the Great Ledger', to: 'nobody', show: { past: ['more-taxes', 'struckOut'] } },
      { text: 'Pay what you have', to: 'paid', if: { gold: 1 } },
      { text: 'Cast Clone, and let your copy deal with him', cast: 'clone', pass: 'cloned', fail: 'auditor_talk' },
      { text: 'Cast Confession on him', cast: 'confession', pass: 'auditor_confesses', fail: 'auditor_talk', critFail: 'auditor_wiped' },
      { text: 'Refuse, and see what he does about it', to: 'auditor_fight' },
    ],
  },
  crown_paid: {
    on: [{ flag: 'taxDone' }, { gold: 1000, uncapped: true, msg: 'The Crown’s first instalment: 1000GP.' }],
    text: ['You hand the Auditor-General the two pages from Vane’s ledger. He reads them, and goes the colour of old porridge. He reads them again. Then he closes your file, takes out a cheque book with the royal arms on it, and writes in it for a long time, sweating. “The first instalment,” he says. “Of several thousand.” He leaves without looking back. Death is laughing, which sounds like dominoes falling over.'],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  argued: {
    on: [{ flag: 'taxDone' }],
    text: (c) => [c.flags.loophole
      ? 'You quote Vane at him: squandering is a charitable donation, if you squander it on others, and you have squandered everything on everybody. The Auditor-General opens his mouth, and closes it, and checks the regulations. It’s true. He has to give you a receipt. “Nobody,” he says, “has ever done that to me with my own rules.”'
      : 'You argue for an hour. The bets were investments. The boats were a loss. The hats were a uniform. At the end, the Auditor-General takes off his spectacles, rubs his eyes, and closes your file. “Nobody,” he says, “has ever wasted my time so thoroughly. It is very nearly admirable.”'],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  nobody: {
    on: [{ flag: 'taxDone' }],
    text: ['“You can’t tax me,” you say. “I’m not in the Great Ledger. I don’t exist.” The Auditor-General opens his empty file and looks into it for a long time. Then he closes it, folds it in half, and puts it in his pocket. “Then I am talking to nobody,” he says, “and I don’t do that.” He leaves. Death looks at you, interested. “I use a different book,” he says.'],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  paid: {
    on: [{ flag: 'taxDone' }, { gold: -100000 }],
    text: (c) => [`You empty your pockets onto his file. The Auditor-General counts it, twice, and writes it in. “A down-payment,” he says. “The rest, forever, at a very reasonable rate.” ${mt(c, 'settled') ? 'You are already on that rate. Now you are on it twice.' : 'Most people are.'} He tips his hat to Death, and leaves.`],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  cloned: {
    on: [{ flag: 'taxDone' }],
    text: ['A second you steps out of you, a little slower. You hand it the file. It reads it, nods, signs everything, and dissolves into a puddle, as clones do. The Auditor-General stares at the puddle. “Deceased,” he says, at last, writing. “Estate: nil.” He closes the file and leaves. Death looks at the puddle, and at you, and doesn’t say anything, which is worse.'],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  auditor_confesses: {
    on: [{ flag: 'taxDone' }],
    text: ['The Auditor-General relives his sins, all of them, in order, standing in the hall. Fourteen years of claiming his spectacles as a business expense. A biscuit tin of undeclared pennies. A bicycle. He goes pale, then grey, then he takes out a blank form and sits on the stairs, filling in his own tax return, very fast. He doesn’t look up again.'],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  auditor_wiped: {
    text: ['Your god scorns you. Instead of reliving his sins, the Auditor-General forgets the last day entirely. He blinks at the file in his hand. “Final demand,” he reads, with great interest, and starts again from the beginning, out loud, with the interest worked out afresh. It has gone up.'],
    choices: [{ text: 'Listen to all of it', to: 'auditor_talk' }],
  },
  auditor_fight: {
    text: ['The Auditor-General takes off his spectacles, folds them, and puts them in his top pocket. “Non-payment,” he says, “is also taxable.” He takes a ruler out of his file.'],
    fight: {
      monsters: [auditor], win: 'auditor_down', flee: { to: 'death_talk', label: 'Hide behind Death' },
      special: [{ label: 'Blow your bellows at his file', if: { item: 'bellows' }, flag: 'blown', text: 'A blizzard of paperwork fills the hall. He drops everything to catch it. He has to. It’s filed.', stun: 1 }],
    },
  },
  auditor_down: {
    on: [{ flag: 'taxDone' }],
    text: (c) => [`The Auditor-General folds up like a deckchair${mt(c, 'auditorOut') ? ', for the second time in his career and the second time at your hands,' : ''} and lies on the floor of the hall, holding his ruler. Death steps over him, carefully. “He’ll be fine,” he says. “I’d know.”`],
    choices: [{ text: 'Turn to Death', to: 'death_talk' }],
  },
  audit_death: {
    on: [{ flag: 'taxDone' }, { flag: 'auditedDeath' }],
    text: (c) => [
      hol(c, 'returned') ? '“He pays in pennies,” you say. “From the eyes of the dead. He paid me six hundred gold in them, in Brinemouth. Four thousand years of pennies, and has he ever filed a return?”'
        : '“How does Death get paid?” you ask the Auditor-General. He opens his mouth to answer, and stops, and turns, very slowly, to look at Death.',
      '“I’m self-employed,” says Death, too quickly. The Auditor-General’s eyes light up behind his spectacles. He takes out a new file, a very large one, and a pen. “Four thousand years,” he says. “Self-employed. Expenses?” “The scythe,” says Death. “Receipts?” Death sits down on the stairs with a sigh like a closing coffin. You leave them to it.',
    ],
    choices: [{ text: 'Walk out into the night', to: 'retirement' }],
  },
  party: {
    on: [{ flag: 'partied' }],
    text: ['“Party,” you say. Grandmother Snik puts a plate of pie in the Auditor-General’s hands and a cup of something in Death’s, and the fiddler strikes up. Death says he can only stay for one. Then the kobolds start a game of musical chairs, and he wins every round, because he always knows exactly when the music is going to stop. It’s the job. Meanwhile the Auditor-General goes through the kobolds’ accounts and pronounces them, for the first time in his career, in perfect order.', 'At dawn, Death looks at his clipboard, and sighs, and moves you to the bottom of it. “Another time,” he says. “Not soon. I’m behind as it is.” The Auditor-General takes a second pie for the road.'],
    choices: [{ text: 'Go home to bed', to: 'retirement' }],
  },
  death_talk: {
    text: (c) => [
      c.flags.taxDone ? 'Death is sitting on the bottom step of the stairs with his scythe across his knees and his clipboard on top of it.' : 'Death is sitting on the bottom step of the stairs with his scythe across his knees and his clipboard on top of it. Behind you, the Auditor-General waits too, writing down how long you take.',
      hol(c, 'returned') ? '“I don’t forget a kindness,” he says. “I don’t forget anything. It’s the job. Name?” He knows your name. He asks anyway. It’s procedure.'
        : hol(c, 'soldScythe') ? '“A necromancer,” he says. “Of all the people to sell it to.” He sounds more disappointed than angry, which is worse.'
          : '“Name?” he says, not unkindly. He knows it. It’s procedure. He finds you on his list and puts his pencil next to you. “Right. Here we are, then.”',
    ],
    choices: [
      { text: 'Ask him for more time', to: 'more_time', show: { past: ['death-takes-a-holiday', 'returned'] } },
      { text: 'Bargain with him', test: { stat: 'Cha', dd: 12, skill: ['social', 'lying'], mods: [{ if: { item: 'rations' }, dd: 10, text: 'You offer him a sandwich. Nobody has done that in four thousand years.' }, { if: { item: 'mirror' }, dd: 8 }] }, pass: 'bargained', fail: 'death_no', show: { notFlag: 'refused' } },
      { text: 'Offer him Usurer Vane instead', to: 'vane_goes', show: { flag: 'vaneOffer' } },
      { text: 'Play him at cards for your life: one hand, winner takes all', test: { stat: 'Wis', dd: 12, skill: ['lying'], mods: [{ if: { item: 'chips' }, dd: 8 }] }, pass: 'cards_won', fail: 'taken' },
      { text: 'Run', test: { stat: 'Dex', dd: 12, skill: ['athletics'] }, pass: 'ran', fail: 'death_waits', show: { notFlag: 'chased' } },
      { text: 'Fight him', to: 'death_fight' },
      { text: 'Go quietly', to: 'taken' },
      { text: 'Go back to the Auditor-General', to: 'midnight', show: { notFlag: 'taxDone' } },
    ],
  },
  more_time: {
    on: [{ flag: 'deferred' }],
    text: ['“More time,” says Death. He takes a small black diary out of his robe, licks his thumb, and turns the pages forward, and forward, and forward. “You gave me back my holiday,” he says. “I can do you in fifty years. A Tuesday. Morning or afternoon?” You say afternoon. He pencils you in. “I’ll bring a deckchair,” he says.'],
    choices: [{ text: 'Shake his hand', to: 'retirement' }],
  },
  bargained: {
    on: [{ flag: 'bargained' }],
    text: [`You talk. Death listens. Nobody has ever made him an offer he hadn’t heard before, and you don’t either, but you make the old ones very well. At the end, he sighs and takes a form out from under his clipboard: DEFERRAL, GROUNDS FOR. “Twenty years,” he says, filling it in. “Not a day more. And you’ll stop doing this sort of thing. Sign there, and there.” You sign. He gives you the pink copy.`],
    choices: [{ text: 'Retire', to: 'retirement' }],
  },
  death_no: {
    on: [{ flag: 'refused' }],
    text: ['Death hears you out, all of it, nodding. Then he shakes his head, kindly. “It’s not up to me,” he says. “Rules are rules. But it was a good try. Most people just cry.”'],
    choices: [{ text: 'Try something else', to: 'death_talk' }],
  },
  death_waits: {
    on: [{ flag: 'chased' }],
    text: ['You run. Out of the door, down the hill, through the town, across three counties. At dawn you stop, gasping, at a crossroads. Death is sitting on the milestone, eating a sandwich. “I walk,” he says. “It’s quicker, in the end.” He finishes the sandwich, and walks you back to Gallows Hill.'],
    choices: [{ text: 'Sit down beside him', to: 'death_talk' }],
  },
  ran: {
    on: [{ flag: 'ran' }],
    text: ['You run. Out of the door, down the hill, through the town and out of the kingdom. Death doesn’t run after you. He makes a note, and moves on to the shipwreck. You keep running, on and off, for forty years, and you see a great deal of the world, mostly over your shoulder.'],
    choices: [{ text: 'Keep running', to: 'retirement' }],
  },
  cards_won: {
    on: [{ flag: 'cards' }],
    text: ['Death shuffles. He plays every lunchtime with the gravediggers, and he never loses. You don’t either. He looks at your cards for a long time, then lays his own face down on the stairs, and smiles, which is the only thing his face does. “The gravediggers will never believe this,” he says. “Keep your life. I’ll want a rematch.”'],
    choices: [{ text: 'Pocket your winnings', to: 'retirement' }],
  },
  vane_goes: {
    on: [{ flag: 'vaneTaken' }],
    text: (c) => [`Usurer Vane comes up the stairs from the vault, faint as smoke, and stands in front of Death${dt(c, 'ledgerBurnt') ? '' : ' with his ledger under his arm'}. “Twenty years overdue,” he whispers. “I believe that’s me.” Death looks at him, and at you, and at his clipboard. He crosses something out and writes something in. “One’s one,” he says. “It balances.” He takes Vane’s arm, and they go out into the night together, and Vane doesn’t look back once. The books are closed.`],
    choices: [{ text: 'Close the door behind them', to: 'retirement' }],
  },
  death_fight: {
    text: ['Death sighs, puts down his clipboard, and shrugs off his robe. Underneath, he is all elbows. “Everybody tries this,” he says. “They don’t pay me enough for it.”'],
    fight: { monsters: [death], win: 'death_beaten', flee: { to: 'death_waits', label: 'Run' } },
  },
  death_beaten: {
    on: [{ flag: 'beatDeath' }],
    text: ['Death goes down on the flagstones of the hall with a clatter, like a coat stand. He lies there, looking at the ceiling. Then he laughs. “Nobody has ever done that,” he says, and gets up, which you can’t stop him doing. He picks up his clipboard and starts filling in an incident report. “Later, then,” he says, without looking up. “Much later. I’ll have to move you to the bottom.”'],
    choices: [{ text: 'Sit down before you fall down', to: 'retirement' }],
  },
  taken: {
    end: 'death',
    text: ['Death ticks you off his list, stands, and holds out his hand, and you take it. It isn’t cold at all. You walk out of the Counting House together, past the hatch by the door, into the night. “Not bad,” says Death, “for a scumbag.” It’s the nicest thing anyone has ever said to you.'],
  },
  retirement: {
    end: 'victory',
    text: (c) => [
      c.flags.immortal ? 'You live forever. The Auditor-General visits every spring, with your bill, and the interest. You are, in the end, the most taxed person who ever lived.'
        : c.flags.auditedDeath ? 'Death is still at the Counting House, as far as anyone knows, filling in forms. Nobody dies for a while. You retire to the coast, and live to a great age, and nobody comes for you, because he is still on page four.'
          : c.flags.partied ? 'The kobolds have a party every year after that, at midnight, and Death comes to every one, and wins at musical chairs, and leaves early because he’s working. You go too, until one year, a long time later, he saves you a chair.'
            : c.flags.deferred ? 'You retire to Brinemouth-on-Sea, and buy a beach hut, and paint it black. Fifty years later, on a Tuesday afternoon, Death turns up on time to the minute, with a deckchair, as promised, and you watch the sea together for a while before you go.'
              : c.flags.bargained ? 'You keep your word, more or less. Twenty years to the day later, Death knocks, with the pink copy of your form, and you open the door in your slippers, and you are, to your surprise, ready.'
                : c.flags.cards ? 'Death comes back for a rematch every few years, in his lunch hour, and tells you how the gravediggers are. You let him win, eventually, when you’re ready. He knows. He doesn’t mind.'
                  : c.flags.vaneTaken ? 'You never see Usurer Vane again. You keep his candle, and you sit by it sometimes, counting, out of respect.'
                    : c.flags.beatDeath ? 'You are the scumbag who beat Death in a fair fight. Nobody believes you, so you tell everybody, at length, for the rest of a very long life.'
                      : 'You run until you can’t, and then you sit down on a bench at the end of the world, and Death sits down next to you. “Good run,” he says.',
      c.flags.taxDone || c.flags.partied || c.flags.immortal ? '' : 'The Auditor-General is still waiting in the hall at Gallows Hill, as far as anyone knows. He can wait. He’s good at it.',
      'Your career is over. You have, against all the odds, retired.',
    ].filter(Boolean),
  },
};

export const DEATH_TEXT = [
  'Death walks you down Gallows Hill, where it all started, briskly, because he has eleven more tonight. Somewhere behind you, the Auditor-General closes your file, and writes DECEASED across it, and underlines it twice.',
];
