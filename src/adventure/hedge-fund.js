// HEDGE FUND — the secret last job: catch up with Snoad, the hedge-wizard behind half your career.
// Only on the board for a scumbag who has noticed enough of his handiwork (`snoadClue` in six adventures).
// Like Final Demand, whoever finishes it retires. For a level 10 scumbag, or more.
import { pastFlag, didAdventure } from '../engine/conditions.js';

/** Where Snoad has left a mark, and how you'd put it on your list. */
const CLUES = [
  ['legging-it', 'Forty pairs of legs, walking out of a cobbler’s in Little Hobbling.'],
  ['wrong-way-round', 'A pencilled apology on a reverse centaur’s race card.'],
  ['going-bananas', 'A banana golem at a harvest festival. “I only said it once this time.”'],
  ['detention', 'A boy called Snoad, still a byword at the Collegium Arcana.'],
  ['out-of-the-cot', 'A sleeping charm that kept a giant baby in its cot for nearly an hour.'],
  ['taking-the-waters', 'A pointed hat in a blob, with the stars sewn on crooked.'],
  ['unsolved', 'A receipt for a cut-price summoning circle. No refunds.'],
  ['clockwork-cathedral', 'SERVICED. S., chalked beside the wheel that jammed.'],
  ['standard-dragon', 'Ned, who used to have cabbages.'],
];
const found = (c) => CLUES.filter(([id]) => pastFlag(c, id, 'snoadClue'));
export const SNOAD_CLUES_NEEDED = 6;

export const META = {
  tier: 11, id: 'hedge-fund', title: 'Hedge Fund', levels: '10', final: 'wartleby', finale: true,
  unlock: (c) => found(c).length >= SNOAD_CLUES_NEEDED,
  blurb: 'A card has gone up on the notice board, in a shaky hand: HEDGE-WIZARD. REASONABLE RATES. NO JOB TOO SMALL. ENQUIRE AT THE HOBBLING ARMS. You know that handwriting. Pinned over it is a second card, in several angrier hands: WANTED, BY HIS CLIENTS. A thousand gold. Whatever you do about it, this job ends your career.',
};

const clients = { name: 'The aggrieved clients', plural: true, lvl: 9, hp: 44, range: 'engaged', dmg: '2d8', note: 'A mob of furious customers with torches, pitchforks and grievances (44 HP, 2d8)' };
const botch = { name: 'The Grand Botch', proper: true, lvl: 10, hp: 56, range: 'engaged', dmg: '2d8', note: 'Every spell Snoad ever cast, all at once: legs, bananas, slime and a slug (56 HP, 2d8)' };

/** Who has turned up with a torch: everyone whose trouble you've seen. */
const MOB = (c) => [
  didAdventure(c, 'legging-it') && 'Mr Welt the cobbler',
  didAdventure(c, 'going-bananas') && 'the Master of the Greengrocers’ Guild, with a marrow',
  didAdventure(c, 'wrong-way-round') && 'Honest Sid, taking bets on the outcome',
  didAdventure(c, 'out-of-the-cot') && 'Captain Snare, with his harpoon gun',
  didAdventure(c, 'taking-the-waters') && 'Mr Bubbleby, in his bathing costume',
  didAdventure(c, 'unsolved') && 'the Bursar of Lesser Wisdom, with an invoice',
  didAdventure(c, 'clockwork-cathedral') && 'the Dean of Cogsbury',
  didAdventure(c, 'standard-dragon') && 'Ned, who used to have cabbages',
  didAdventure(c, 'detention') && 'Headmistress Grimble, in her spire of a hat',
].filter(Boolean);
const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const grimble = (c) => didAdventure(c, 'detention');

/** What the Grand Undoing puts right, in the places you've been. */
const UNDONE = (c) => [
  didAdventure(c, 'legging-it') && 'In Little Hobbling, every pair of legs still out on the hills sits down in the heather and goes back to being legs.',
  didAdventure(c, 'going-bananas') && 'In Pippin-on-Wye, whatever is left of a nine-foot man made of bananas lies down, quite peacefully, and becomes a bunch.',
  didAdventure(c, 'wrong-way-round') && 'At Muckmarket, Neville feels the spell coming, and says, very firmly, no thank you. He likes his legs where they are.',
  didAdventure(c, 'taking-the-waters') && 'In Sludgeby, whatever is left of the blob in the Great Bath goes back to being bathwater.',
  didAdventure(c, 'unsolved') && 'At Lesser Wisdom, if anything is still hovering in the Great Hall, it folds itself up and goes home.',
  didAdventure(c, 'standard-dragon') && 'Up the lane at Much Smallness, Ned finds a row of cabbages where there weren’t any.',
].filter(Boolean);

export const SECTIONS = {
  start: {
    text: (c) => [
      'The card on the notice board is written in a hand that shakes even when its owner isn’t frightened, which isn’t often. You know it. You get out a pencil and make a list.',
      ...found(c).map(([, line]) => `• ${line}`),
      'You look at the list for a long time. Everywhere you’ve been, something had already gone wrong, and a nervous little man with warts had just left.',
      'The second card says his clients are meeting tonight. They have torches. You have a head start.',
    ],
    choices: [{ text: 'Go to the Hobbling Arms', to: 'hobbling' }],
  },
  hobbling: {
    text: (c) => [
      'The Hobbling Arms in Little Hobbling is empty, except for the landlord, who is wiping a glass that will never be clean.',
      didAdventure(c, 'legging-it')
        ? '“You,” he says. “You were after those legs.” He nods at the table in the corner. “He sat under there for a week. Gone now. Everybody wants him.”'
        : '“He’s gone,” he says, before you can ask. “Everybody wants him. Some of them were in this morning with torches, and it was only breakfast.”',
    ],
    choices: [
      { text: 'Ask where Snoad has gone', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'told', fail: 'not_told' },
      { text: 'Buy a drink, and leave the change on the bar (5GP)', to: 'told', if: { gold: 5 }, effects: [{ gold: -5 }] },
      { text: 'Cast Scry, and look for Snoad', cast: 'scry', pass: 'scried', fail: 'not_told' },
    ],
  },
  told: {
    text: ['The landlord puts the glass down. “Home to his mother’s,” he says. “Wartleby. Same as always, when it goes wrong. Last cottage, crooked chimney.” He picks the glass up again. “It goes wrong a lot.”'],
    choices: [{ text: 'Go to Wartleby', to: 'cottage' }],
  },
  scried: {
    text: ['You see him, small and far off: a nervous little man with warts and a beard, at a kitchen table, in a cottage with a crooked chimney, reading a very large book by candlelight. Behind him, a tiny woman in curlers is ironing a pointed hat. You know the road. Everybody knows the road to their mother’s.'],
    choices: [{ text: 'Go to Wartleby', to: 'cottage' }],
  },
  not_told: {
    on: [{ flag: 'late' }],
    text: ['The landlord says nothing, very firmly. You ask round the town instead. It takes hours. Everybody knows where Snoad’s mother lives, in Wartleby, and nobody wants to be the one who told you.'],
    choices: [{ text: 'Go to Wartleby', to: 'cottage' }],
  },
  cottage: {
    text: (c, visits) => [
      'Wartleby is one street, a green, a horse trough and a church. At the end of the street is a cottage with a crooked chimney and very clean steps.',
      c.flags.late ? 'Torches are already coming up the street.' : 'Down the lane, a long way off, you can see torches.',
      visits > 1 ? 'Mrs Snoad is still on the step, with her rolling pin, coughing.' : 'The door opens before you knock. A tiny woman in curlers looks up at you, and coughs. She is holding a rolling pin the way other people hold a sword. “He’s not in,” she says. Behind her, in the kitchen, a pair of feet is sticking out from under the table.',
    ],
    choices: [
      { text: 'Tell her you’ve come to help him', test: { stat: 'Cha', dd: 10, skill: ['social'], profs: ['Missionary', 'Envoy'], why: 'mothers trust you' }, pass: 'let_in', fail: 'rolling_pin' },
      { text: 'Offer her one of Old Nan’s cough sweets for that cough', to: 'mrs_asleep', if: { item: 'sweets' }, effects: [{ lose: 'sweets' }] },
      { text: 'Offer her a bottle of the Shushing Liqueur', to: 'let_in', if: { item: 'liqueur' }, effects: [{ lose: 'liqueur' }] },
      { text: 'Go round and pick the back door', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'kitchen', fail: 'rolling_pin', if: { item: 'tools' } },
      { text: 'Cast Knock on the back door', cast: 'knock', pass: 'kitchen', fail: 'rolling_pin' },
      { text: 'Throw your voice into the coal shed: “Mum! Help!”', cast: 'voice', pass: 'decoyed', fail: 'rolling_pin' },
      { text: 'Push past her', test: { stat: 'Str', dd: 10, skill: ['bruteforce'] }, pass: 'kitchen', fail: 'rolling_pin' },
    ],
  },
  rolling_pin: {
    on: [{ damage: 'd6', from: 'Mrs Snoad' }],
    text: ['Mrs Snoad is four foot ten and has been seeing off salesmen for sixty years. The rolling pin catches you just above the ear. “He’s not in,” she says again.'],
    choices: [{ text: 'Try something else', to: 'cottage' }],
  },
  mrs_asleep: {
    on: [{ flag: 'mrsAsleep' }],
    text: ['Mrs Snoad sucks the cough sweet suspiciously, says it’s very nice, sits down on the step to finish it, and is asleep before she gets to the liquorice. You put a shawl over her and step past.'],
    choices: [{ text: 'Into the kitchen', to: 'kitchen' }],
  },
  decoyed: {
    on: [{ flag: 'decoyed' }],
    text: ['“Mum! Help!” says the coal shed, in a voice very like her son’s. Mrs Snoad goes round the side of the house at a run, rolling pin first. You step in at the front.'],
    choices: [{ text: 'Into the kitchen', to: 'kitchen' }],
  },
  let_in: {
    on: [{ flag: 'mumOnSide' }],
    text: ['Mrs Snoad looks at you for a long time. Then she lowers the rolling pin. “Somebody has to,” she says. “I’ve tried. His father tried. The Collegium tried for nine years.” She steps aside. “Wipe your feet.”'],
    choices: [{ text: 'Into the kitchen', to: 'kitchen' }],
  },
  kitchen: {
    text: (c, visits) => [
      c.flags.mrsAsleep ? 'Mrs Snoad snores on the step.' : c.flags.decoyed ? 'Out in the coal shed, Mrs Snoad is turning over the coal, looking for her son.' : c.flags.mumOnSide ? 'Mrs Snoad puts the kettle on, and watches you both.' : 'Somewhere at the front of the house, Mrs Snoad is shouting that he’s not in.',
      visits > 1 ? 'Snoad is back at the table with his book, reading it with his finger.'
        : 'Snoad comes out from under the table, warts, beard and all, and sits down at it as if he had been there all along. In front of him is the biggest book you have ever seen: THE GRAND UNDOING. “Undoes every spell the caster ever cast,” he says. “All of them. At once. I bought it off a pedlar.” He is very pale. “At midnight, on the green, I’m going to say it. Then it’s all put back, and everyone can stop being cross with me. I’ve invited them. To watch. As an apology.”',
    ],
    choices: [
      { text: 'Show him your list', to: 'confronted', show: { notFlag: 'confronted' } },
      { text: 'Read the small print in the book', test: { stat: 'Int', dd: 10, skill: ['arcana', 'analysis'], profs: ['Sorcerer'], why: 'you know how spellbooks are worded', mods: [{ if: { item: 'loupe' }, dd: 6 }] }, pass: 'small_print', fail: 'small_print_lost', show: { notFlag: 'printTried' } },
      { text: 'Cast True sight on the book', cast: 'truesight', pass: 'small_print', fail: 'small_print_lost', show: { notFlag: 'printTried' } },
      { text: 'Offer him a partnership: he makes the messes, you get paid to clear them up', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'], mods: [{ if: { item: 'quill' }, dd: 6, text: 'You write it out properly, in two copies. He has never been offered a contract before.' }] }, pass: 'partners', fail: 'partner_no', show: { flag: 'confronted', notFlag: 'partnerTried' } },
      { text: 'Tie him up for his clients', test: { stat: 'Dex', dd: 6, skill: ['skulduggery', 'bruteforce'] }, pass: 'bagged', fail: 'bolted', if: { anyItem: ['rope', 'chain', 'manacles'] }, show: { notFlag: 'partners' } },
      { text: 'Grab him for his clients', test: { stat: 'Str', dd: 10, skill: ['bruteforce', 'athletics'] }, pass: 'bagged', fail: 'bolted', show: { notFlag: 'partners' } },
      { text: 'Walk him down to the green', to: 'green' },
    ],
  },
  confronted: {
    on: [{ flag: 'confronted' }],
    text: (c) => [
      'You put your list on the table. Snoad reads it, moving his lips. He goes from pale to grey to a sort of green.',
      pastFlag(c, 'standard-dragon', 'snoadClue') ? '“Ned’s cabbages?” he says. “He told me they were coming on lovely.”' : '“I only meant to help,” he says.',
      '“Every time,” he says. “Every single time. I said it too many times, or not enough, or to the wrong thing.” He puts his head on the book. “Mum always said.”',
    ],
    choices: [{ text: 'Back to business', to: 'kitchen' }],
  },
  small_print: {
    on: [{ flag: 'knowsOnce' }, { flag: 'printTried' }],
    text: ['At the bottom of the last page, in letters the size of fleas: TO BE SPOKEN ONCE ONLY, CLEARLY, WITHOUT STOPPING. SPOKEN TWICE, IT DOES THE OPPOSITE, AND ALL AT ONCE. THE PUBLISHER ACCEPTS NO RESPONSIBILITY. You look at Snoad. Snoad looks at the floor.'],
    choices: [{ text: 'Back to business', to: 'kitchen' }],
  },
  small_print_lost: {
    on: [{ flag: 'printTried' }],
    text: ['There is some small print at the bottom of the last page, but it is very small, and the candle is very low, and it might just be a pressed fly.'],
    choices: [{ text: 'Back to business', to: 'kitchen' }],
  },
  partners: {
    on: [{ flag: 'partners' }, { flag: 'partnerTried' }],
    text: ['Snoad listens with his mouth open. “So I just carry on,” he says slowly, “and things go wrong, and you put them right, and people pay you.” “And I pay you,” you say. “A share.” He has never been paid for a spell going wrong before. He has usually been chased. He shakes your hand with both of his. They are clammy.'],
    choices: [{ text: 'Back to business', to: 'kitchen' }],
  },
  partner_no: {
    on: [{ flag: 'partnerTried' }],
    text: ['Snoad listens, and shakes his head. “No,” he says, and for once it comes out firmly. “I want to put it right. Just once, I want something to go right.”'],
    choices: [{ text: 'Back to business', to: 'kitchen' }],
  },
  bolted: {
    text: ['Snoad is out of the back door before you can get hold of him, with the book under his arm, running for the green with his knees up. “It’ll be all right!” he shouts. “I’ll say it now!”'],
    choices: [{ text: 'Go after him', to: 'green' }],
  },
  bagged: {
    on: [{ flag: 'bagged' }],
    text: ['You get Snoad trussed up on the kitchen floor without much trouble. He doesn’t struggle. He has been tied up before. “It’s fair,” he says, to the floor. The book lies beside him, closed. Outside, the torches are coming up the street.'],
    choices: [{ text: 'Carry him out to his clients', to: 'mob' }],
  },
  green: {
    redirect: [{ if: { flag: 'partners' }, to: 'green_partners' }],
    text: (c) => [
      'Midnight on Wartleby green. Snoad climbs onto the horse trough with the book open in his arms, and the torches come up the street and stop in a ring round him: ' + list(MOB(c)) + '.',
      '“I’ve asked you all here,” says Snoad, in a small voice, “to say sorry.” He licks his finger and finds the page. He takes a deep breath. He begins.',
    ],
    choices: [
      { text: 'Stand beside him and get him to say it once, clearly, without stopping', test: { stat: 'Wis', dd: 8, skill: ['arcana', 'social'], profs: ['Sorcerer', 'Cleric'], why: 'you know what a spell needs' }, pass: 'undone', fail: 'botched', show: { flag: 'knowsOnce' } },
      { text: 'Let him get on with it', to: 'botched' },
      { text: 'Snatch the book out of his hands', test: { stat: 'Dex', dd: 10, skill: ['skulduggery', 'athletics'] }, pass: 'book_stopped', fail: 'botched' },
      { text: 'Set fire to the book', to: 'book_burnt', if: { fire: true } },
      { text: 'Glue the pages together before he can turn them', to: 'book_stopped', if: { item: 'glue' }, effects: [{ lose: 'glue' }] },
      { text: 'Cast Dispel magic on the book', cast: 'dispel', pass: 'book_dispelled', fail: 'botched' },
      { text: 'Cast Silence on Snoad', cast: 'silence', pass: 'book_silenced', fail: 'botched', critFail: 'tongues' },
      { text: 'Cast Freeze time, and take the book while the world stands still', cast: 'freeze', pass: 'book_stopped', fail: 'botched' },
    ],
  },
  green_partners: {
    text: (c) => [
      'Snoad leaves the Grand Undoing on the kitchen table. “Business is business,” he says, a little sadly. You walk him down to the green together.',
      `At midnight the torches come up the street and stop in a ring round you both: ${list(MOB(c))}.`,
    ],
    choices: [{ text: 'Do business', to: 'mob' }],
  },
  undone: {
    on: [{ flag: 'undoneRight' }, { flag: 'spellDone' }],
    text: (c) => [
      'You stand beside him with a hand on his shoulder. Every time he speeds up, you squeeze. Every time he goes back to check a word, you shake your head. He says it once, clearly, all the way through, and closes the book, and opens his eyes.',
      'For a moment, nothing happens. Then, all over the kingdom, very quietly, things go back to how they were.',
      ...UNDONE(c),
      'Snoad stands on the horse trough with tears running into his beard. “It worked,” he says. “It worked. I said it once.” The torches go out, one by one. Nobody quite knows what to be cross about any more.',
    ],
    choices: [{ text: 'Help him down', to: 'wartleby' }],
  },
  botched: {
    on: [{ flag: 'spellDone' }],
    text: ['Snoad gets to the end of the spell, and hesitates, and in a very small voice, to be on the safe side, says it again. The book slams shut. The air over the green goes the colour of a bruise, and everything Snoad ever cast arrives at once, from all over the kingdom, and piles itself up into one thing: legs, and bananas, and slime, and a sad grey slug the size of a barn, and a great many feet in other people’s boots. It looks down at the green. The clients drop their torches and run. Snoad falls off the horse trough.'],
    choices: [{ text: 'Somebody has to', to: 'botch_fight' }],
  },
  tongues: {
    on: [{ flag: 'spellDone' }],
    text: ['Your god scorns you. Instead of falling silent, Snoad can suddenly speak every language in the world, and does, all at once, and says the Grand Undoing in all of them: four hundred times, with feeling. The air over the green goes the colour of a bruise.'],
    choices: [{ text: 'Brace yourself', to: 'botch_fight' }],
  },
  botch_fight: {
    text: ['The Grand Botch comes across the green at you on forty pairs of legs, dripping slime and swinging a fist made of bananas, and smelling very strongly of both.'],
    fight: { key: 'botch', outdoors: true,
      monsters: [botch], win: 'botch_down', flee: { to: 'botch_fled', label: 'Run for it' },
      special: [
        { label: 'Unlace its boots, the way Snoad said', test: { stat: 'Dex', dd: 10, skill: 'skulduggery' }, flag: 'unlaced', text: 'You get a bootlace free, and then another. A dozen pairs of legs sit down on the green and stop. The Grand Botch lurches.', failText: 'A boot kicks you in the face. It has been wanting to for some time.', dmg: '3d6' },
        { label: 'Throw salt from your rations on the slimy bits', if: { item: 'rations' }, flag: 'salted', text: 'The slug in it shrinks, steaming. The Grand Botch loses its footing in its own slime.', dmg: '2d6', stun: 1 },
      ],
    },
  },
  botch_down: {
    on: [{ flag: 'botchBeaten' }],
    text: ['The Grand Botch comes apart on the green into everything it was made of: a heap of boots, a great many bananas, a sad grey slug, a puddle of something that used to live in a bath. The legs walk off in forty directions. Snoad sits on the horse trough among the bananas and looks at it all for a long time. Then he takes out his wand, and snaps it, and hands you both halves.'],
    choices: [{ text: 'Go and find the clients', to: 'wartleby' }],
  },
  botch_fled: {
    on: [{ flag: 'botchFled' }],
    text: ['You run, and you don’t stop until Wartleby is three hills behind you. Behind you, something enormous and banana-scented is walking off towards the coast, slowly, on forty pairs of legs, with Snoad sitting on top of it, steering, more or less.'],
    choices: [{ text: 'Keep going', to: 'wartleby' }],
  },
  book_stopped: {
    on: [{ flag: 'stopped' }],
    text: ['The Grand Undoing stops halfway through a word. The air over the green, which had begun to go the colour of a bruise, thinks better of it. Snoad looks at his empty hands, and at the book, and at you. “I was going to put it right,” he says.'],
    choices: [{ text: 'Turn round', to: 'mob' }],
  },
  book_burnt: {
    on: [{ flag: 'stopped' }],
    text: ['The Grand Undoing goes up like a haystack. Snoad drops it, and stands on the horse trough watching it burn, with his mouth still open on the next word. “That was eleven gold,” he says.'],
    choices: [{ text: 'Turn round', to: 'mob' }],
  },
  book_dispelled: {
    on: [{ flag: 'stopped' }],
    text: ['The Grand Undoing goes on being a book, but stops being anything else. Snoad reads the next line out loud, and nothing happens, and he reads it again, and nothing happens again. He has never had a spell do nothing before. He seems almost relieved.'],
    choices: [{ text: 'Turn round', to: 'mob' }],
  },
  book_silenced: {
    on: [{ flag: 'stopped' }],
    text: ['Snoad’s mouth goes on moving, but nothing comes out. He finishes the whole spell like that, very carefully, without a sound, and closes the book, and looks around, hopeful. Nothing has happened. For once, it is exactly the right thing.'],
    choices: [{ text: 'Turn round', to: 'mob' }],
  },
  mob: {
    text: (c) => [
      `The clients close in round the horse trough with their torches: ${list(MOB(c))}.`,
      c.flags.bagged ? '“Him,” they say, looking at the bundle on your shoulder. “That’s him.”' : '“Him,” they say. “That’s him.” Snoad tries to hide behind you, which works about as well as all his other spells.',
      'There is a thousand gold in it, they remind you. And if you’re not going to hand him over, they have torches.',
    ],
    choices: [
      { text: 'Hand him over', to: 'sold_out' },
      { text: 'Tell them Snoad works for you now, and so, from now on, will they', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'], profs: ['Envoy'], why: 'you can sell anything' }, pass: 'racket', fail: 'mob_fight', show: { flag: 'partners' } },
      { text: 'Give Headmistress Grimble a detention slip, with Snoad’s name written over the old one', to: 'detention_end', if: { item: 'slip' }, show: { did: 'detention', notPast: ['detention', 'grimoireSold'] } },
      { text: 'Stamp him a royal pardon with the Master Seal of the Exchequer', to: 'pardoned', if: { item: 'seal' }, effects: [{ lose: 'seal' }] },
      { text: 'Talk them down', test: { stat: 'Cha', dd: 12, skill: ['social'], profs: ['Missionary', 'Envoy'], why: 'you can talk a mob round' }, pass: 'dispersed', fail: 'mob_fight' },
      { text: 'Cast Wipe on the crowd, so they forget why they came', cast: 'wipe', pass: 'wiped', fail: 'mob_fight', critFail: 'mob_confess' },
      { text: 'Cast Choreomania on the crowd, and leave while they dance', cast: 'choreomania', pass: 'ran_off', fail: 'mob_fight' },
      { text: 'Throw caltrops in front of them and run, with Snoad', to: 'ran_off', if: { item: 'caltrops' }, effects: [{ lose: 'caltrops' }] },
      { text: 'Run for it, with Snoad', test: { stat: 'Dex', dd: 10, skill: ['athletics'] }, pass: 'ran_off', fail: 'mob_fight' },
      { text: 'Fight them', to: 'mob_fight' },
    ],
  },
  mob_fight: {
    text: ['The clients come at you all at once, with torches, and a marrow, and a great deal of pent-up feeling about bootlaces.'],
    fight: { key: 'mob', outdoors: true,
      monsters: [clients], win: 'mob_down', flee: { to: 'ran_off', label: 'Run for it, dragging Snoad' },
      special: [{ label: 'Throw pocket sand at the front row', if: { item: 'pocketsand' }, flag: 'sanded', text: 'The front row stops to rub its eyes, and the back row walks into it.', stun: 1 }],
    },
  },
  mob_down: {
    on: [{ flag: 'mobBeaten' }],
    text: (c) => [`The last of the clients sits down in the horse trough, and stays there. The torches hiss out in the wet grass. ${c.flags.bagged ? 'Snoad, still tied up on the grass, lifts his head.' : 'Snoad comes out from behind you.'} “Nobody’s ever done that for me before,” he says. “Mostly they do it to me.”`],
    choices: [{ text: 'Go home', to: 'wartleby' }],
  },
  mob_confess: {
    text: ['Your god scorns you. Instead of forgetting, the clients relive their sins, all at once, on the green: every one of them hired the cheapest wizard they could find. They look at each other. Then, because it is easier, they look at you.'],
    choices: [{ text: 'Brace yourself', to: 'mob_fight' }],
  },
  wiped: {
    on: [{ flag: 'wiped' }],
    text: ['The clients blink. They look at their torches, and at each other, and at the little man behind you, whom none of them has ever seen before. “Nice night for it,” says somebody, and they wander off home in twos and threes, with no idea what it was for.'],
    choices: [{ text: 'Go home', to: 'wartleby' }],
  },
  dispersed: {
    on: [{ flag: 'dispersed' }],
    text: ['You tell them the truth: that every one of them hired the cheapest wizard they could find, and got exactly what they paid for. It goes very quiet round the horse trough. One by one, the torches go out, and the clients go home, not looking at each other.'],
    choices: [{ text: 'Go home', to: 'wartleby' }],
  },
  racket: {
    on: [{ flag: 'racket' }],
    text: ['You explain. Every time something goes wrong, they will call you. You will put it right, at very reasonable rates. And things will go wrong, you promise them, regularly. They look at Snoad. Snoad waves. Slowly, the clients begin to understand that they are not a mob any more. They are a customer base.'],
    choices: [{ text: 'Shake on it', to: 'wartleby' }],
  },
  sold_out: {
    on: [{ flag: 'soldOut' }],
    text: ['You hand him over. Snoad doesn’t struggle. “It’s fair,” he says. The clients carry him off down the street shoulder high, which is the first time anybody has ever done that for him, and he seems, in an odd way, quite pleased.'],
    choices: [{ text: 'Count your money', to: 'wartleby' }],
  },
  detention_end: {
    on: [{ flag: 'detained' }, { lose: 'slip' }],
    text: ['Headmistress Grimble reads the slip, and then reads Snoad. “Snoad,” she says. “You never finished your detention.” Snoad goes white. “It was twenty-six years ago, Miss.” “Then it’s overdue.” She takes him by the ear, and the clients part for her as if she were a ship.'],
    choices: [{ text: 'Watch them go', to: 'wartleby' }],
  },
  pardoned: {
    on: [{ flag: 'pardoned' }],
    text: ['You write out a pardon for everything Snoad has ever done, and stamp it with the Master Seal, which approves anything. The clients read it, one by one, and hand it on. You cannot argue with the Crown. Snoad asks if he can keep it. He wants to have it framed.'],
    choices: [{ text: 'Go home', to: 'wartleby' }],
  },
  ran_off: {
    on: [{ flag: 'ranOff' }],
    text: ['You run with Snoad out of Wartleby and into the night, with torches bobbing behind you for three miles and then giving up. At dawn, on a hill, he lights a fire with a spell. It goes wrong, and burns down a hedge, and the hedge is very warm.'],
    choices: [{ text: 'Keep going', to: 'wartleby' }],
  },
  wartleby: {
    end: 'victory',
    on: [
      { if: { flag: 'soldOut' }, gold: 1000, uncapped: true, msg: 'His clients pay you 1000GP, in a great many small coins.' },
      { if: { flag: 'racket' }, gold: 500, uncapped: true, msg: 'Your first customers pay 500GP in advance.' },
      { if: { flag: 'undoneRight' }, gold: 200, uncapped: true, msg: 'Mrs Snoad gives you 200GP out of a sock. She has been saving it for when he finally got something right.' },
      { if: { flag: 'botchBeaten' }, gold: 400, uncapped: true, msg: 'The clients take up a collection: 400GP, and the bananas.' },
    ],
    text: (c) => [
      c.flags.undoneRight ? 'Snoad never casts another spell. He doesn’t need to. He got one right, once, and he tells everybody, every day, in the tea room he opens in Wartleby. The cakes are very good. His mother makes them.'
        : c.flags.botchBeaten ? 'Snoad takes up gardening. Cabbages, mostly. They grow to a perfectly ordinary size, and he is prouder of them than of anything he ever did. The broken wand hangs over your fireplace.'
          : c.flags.botchFled ? 'Nobody ever finds out where the Grand Botch went. Sailors say there is an island now, off the coast, that walks about at night and smells of bananas. A small man with warts lives on it, and seems very happy.'
            : c.flags.racket ? 'Snoad & Partner, Disasters Resolved, opens on the high street in Little Hobbling. Snoad goes out every morning with his wand, and every afternoon you send somebody to put it right. It is the most profitable business in the kingdom, and entirely self-sustaining.'
              : c.flags.soldOut ? 'Snoad’s clients put him in the stocks at Little Hobbling for a week. On the third day, somebody asks him to make the stocks more comfortable, and he does his best, and the stocks get up and walk off over the hills with him still in them, waving.'
                : c.flags.detained ? 'Snoad sits his detention at the Collegium Arcana, twenty-six years late, writing I MUST SAY IT ONCE a thousand times. He gets it right on the nine hundred and ninety-ninth. Grimble lets him retake his exams. He fails them, but by a much smaller margin.'
                  : c.flags.pardoned ? 'Snoad hangs his royal pardon in his mother’s front room, over the mantelpiece. People come from miles to look at it. He charges a penny, and for once nothing goes wrong.'
                    : c.flags.mobBeaten ? 'Snoad’s clients go home with their torches out and their grievances intact. None of them ever hires a hedge-wizard again. Snoad doesn’t mind. He goes back to his mother’s, and stays there, and for a while nothing goes wrong anywhere at all.'
                      : c.flags.ranOff ? 'You and Snoad take the long road south, and keep going. Wherever you stop, something goes wrong. Wherever something goes wrong, you leave quickly. It is, all things considered, the same career you always had, only with somebody to talk to.'
                      : 'Snoad goes home to his mother’s. His clients go home to theirs. Nobody gets what they wanted, which in Wartleby is the usual arrangement.',
      c.flags.mumOnSide && !c.flags.undoneRight ? 'Mrs Snoad sends you a cake every Christmas. It is always slightly too big, and you never ask why.' : '',
      'Your career is over. Of all the ways it could have ended, this was the most avoidable.',
    ].filter(Boolean),
  },
};

export const DEATH_TEXT = [
  'You die on Wartleby green, at midnight, in a smell of bananas. Snoad tries to bring you back. He says it three times, to be sure. It goes about as well as you would expect.',
];
