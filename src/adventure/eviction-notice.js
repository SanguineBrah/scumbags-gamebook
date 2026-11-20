// EVICTION NOTICE — evict a kobold siege-pyramid from the town square. For a level 4–5 scumbag.
import { pastFlag, didAdventure } from '../engine/conditions.js';

// What the scumbag left behind at Usurer Vane's counting house, in Death and Taxes.
const COUNTING_HOUSE = (c) => {
  const p = (f) => pastFlag(c, 'death-and-taxes', f);
  const ghost = p('vaneGone') ? 'and no ghost at all: you saw to that'
    : p('vaneServes') ? 'and one ghost, who does exactly what he’s told and loves counting things'
      : p('vaneTurned') ? 'and one ghost, who runs away from holy symbols and comes back when nobody’s looking'
        : 'and only one ghost, possibly none';
  const gold = p('looted') ? ', a vault you emptied yourself' : '';
  const chef = c.past && c.past['death-and-taxes'] && !p('chefDead') ? ', a kitchen with a homunculus who makes excellent soup' : '';
  return `dry, deep, quiet, with a wine cellar, a library${chef}${gold}, ${ghost}`;
};

export const META = {
  tier: 5, id: 'eviction-notice', title: 'Eviction Notice', levels: '4–5', final: 'payday',
  blurb: 'A kobold siege-pyramid has parked itself in the square at Middle Whelping and refuses to move. Lord Grimsby, who owns the square, owns the town and has never once bathed, will pay 300 gold to have it evicted. Nobody has asked the kobolds why they’re there.',
};

const slinger = { name: 'Kobold slinger', lvl: 1, range: 'short', note: 'Recently evicted; very good aim' };
const sapper = { name: 'Kobold sapper', lvl: 2, range: 'engaged', feats: ['burst'], note: 'Carries a lit fuse; explodes when slain (d6 Dex save or 2d6 damage)' };

export const SECTIONS = {
  start: {
    text: (c, visits) => visits > 1 ? ['You fall back across the square to where Lord Grimsby is standing, at a safe distance, with his handkerchief. “Well?” he says. “They’re still there. I can see them. I can smell them, which is saying something.”'] : [
      'Lord Grimsby receives you in the town square of Middle Whelping, holding a scented handkerchief to his nose, which does nothing for anyone else’s. Behind him squats a wooden pyramid thirty feet high, bristling with arrow slits and painted with slogans: WE SHALL NOT BE MOVED. FAIR RENTS NOW. GRIMSBY IS A SMELL.',
      '“Kobolds,” says Lord Grimsby. “Arrived on Tuesday. Squatting on my square. Three hundred gold to get them out, I don’t care how.” He hands you a formal eviction notice. It is spelled wrong.',
    ],
    choices: [
      { text: 'Ask him why the kobolds are here', test: { stat: 'Cha', dd: 8, skill: ['social'] }, pass: 'grimsby_talks', fail: 'grimsby_huffs' },
      { text: 'Cast Confession on Lord Grimsby, here in the square', cast: 'confession', pass: 'grimsby_confesses', fail: 'grimsby_huffs', critFail: 'grimsby_wiped' },
      { text: 'Walk up to the pyramid', to: 'pyramid' },
      { text: 'Ask around the square', to: 'square' },
    ],
  },
  grimsby_talks: {
    on: [{ flag: 'knowsWarren' }],
    text: ['Grimsby waves a hand. “Oh, they lived in a warren under Grimsby Common. I filled it in. I’m building a hunting lodge. Perfectly legal. Practically.”'],
    choices: [{ text: 'Walk up to the pyramid', to: 'pyramid' }, { text: 'Ask around the square', to: 'square' }],
  },
  grimsby_huffs: {
    text: ['“None of your business,” says Grimsby, and walks off with his handkerchief, trailing flies.'],
    choices: [{ text: 'Walk up to the pyramid', to: 'pyramid' }, { text: 'Ask around the square', to: 'square' }],
  },
  square: {
    text: ['The townsfolk of Middle Whelping are on the kobolds’ side, mostly because Lord Grimsby is their landlord too. A baker tells you the kobolds pay cash for bread. A toothless crone on a bench tells you the square has always been common land. “There was a deed,” she says, “in the town hall. Grimsby had it taken away. Said he was having it framed.”'],
    on: [{ flag: 'heardDeed' }],
    choices: [
      { text: 'Search Grimsby’s carriage for the deed', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'deed', fail: 'bailiffs', show: { notFlag: 'deed' } },
      { text: 'Visit the town hall', to: 'town_hall', show: { notFlag: 'deed' } },
      { text: 'Buy a pie from the baker who feeds the kobolds (5GP)', to: 'baker', if: { gold: 5 }, show: { notFlag: 'pie' } },
      { text: 'Walk up to the pyramid', to: 'pyramid' },
    ],
  },
  town_hall: {
    text: ['The town hall is one room, one clerk and one enormous dog asleep on the records. The clerk confirms that the deed to the square was “borrowed for framing” by Lord Grimsby twelve years ago. “I’ve got a copy,” he says. “Somewhere. Under the dog.”'],
    choices: [
      { text: 'Tempt the dog off the records with your rations', to: 'dog_moved', if: { item: 'rations' }, effects: [{ lose: 'rations' }] },
      { text: 'Move the dog', test: { stat: 'Str', dd: 8, skill: ['bruteforce', 'survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know animals' }, pass: 'dog_moved', fail: 'dog_bite' },
      { text: 'Cast Command on the dog: “Move”', cast: 'command', pass: 'dog_moved', fail: 'dog_bite' },
      { text: 'Cast Telekinesis, and slide the copy out from under the dog', cast: 'telekinesis', pass: 'dog_moved', fail: 'dog_bite' },
      { text: 'Forge a new copy with your quill', test: { stat: 'Int', dd: 8, skill: ['skulduggery', 'analysis'], why: 'forgery is a kind of skulduggery' }, pass: 'deed_forged', fail: 'forge_smudge', if: { item: 'quill' } },
      { text: 'Back to the square', to: 'square' },
    ],
  },
  dog_moved: {
    on: [{ flag: 'deedCopy' }],
    text: ['The dog is the size of a pony and the temperament of a cushion. Under it, warm and slightly damp, is the town’s copy of the deed.'],
    choices: [{ text: 'Take the copy', to: 'deed' }],
  },
  dog_bite: {
    on: [{ damage: 'd6', from: 'The dog' }],
    text: ['The dog wakes up, briefly, and expresses an opinion. Then it goes back to sleep, on the records, harder than before.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  deed_forged: {
    on: [{ flag: 'deedCopy' }],
    text: ['With the clerk’s help and an old seal from a drawer, you produce a copy of the deed so good that the clerk files it and forgets it was ever a forgery.'],
    choices: [{ text: 'Take the copy', to: 'deed' }],
  },
  forge_smudge: {
    text: ['Your forgery reads: THIS SQUARE BELONGS TO THE PEPOLE. The clerk winces and puts it in the stove.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  baker: {
    on: [{ flag: 'pie' }, { gold: -5 }, { heal: '2d6' }],
    text: ['The pie costs five gold and is worth it. The baker leans over the counter. “The wrinkly one, Grandmother Snik, she’s fair. Pays on time. Talk to her straight and she’ll listen. Lie to her and she’ll know.”'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  deed: {
    on: [{ flag: 'deed' }, { item: 'deed' }],
    text: (c) => [c.flags.deedCopy
      ? 'The deed grants the square to the people of Middle Whelping forever. Grimsby doesn’t own it at all. He’s been charging the market rent on it for twelve years.'
      : 'Under a pile of scented handkerchiefs in Grimsby’s carriage is a framed parchment: the deed to the square, granting it to the people of Middle Whelping forever. Grimsby doesn’t own the square at all. He’s been charging the market rent on it for twelve years.'],
    choices: [{ text: 'Walk up to the pyramid', to: 'pyramid' }],
  },
  bailiffs: {
    text: ['“Oi!” Two of Grimsby’s bailiffs, built like coal sheds and smelling worse, drag you out of the carriage by your ankles.'],
    fight: { outdoors: true,
      monsters: [{ name: 'Bailiff', lvl: 2, range: 'engaged', note: 'Never bathes; takes things that aren’t his' }, { name: 'Bailiff', lvl: 2, range: 'engaged', note: 'Never bathes; takes things that aren’t his' }],
      win: 'bailiffs_win', flee: { to: 'pyramid', label: 'Run for the pyramid' },
    },
  },
  bailiffs_win: {
    text: ['The bailiffs lie in the gutter, where they are comfortable. You go back to the carriage.'],
    choices: [{ text: 'Search the carriage', to: 'deed' }],
  },
  pyramid: {
    text: (c) => [
      'Up close, the siege-pyramid is a marvel of kobold engineering: planks, barrel staves, cartwheels and stolen doors nailed together on a giant set of wheels. It smells strongly of lamp oil. A sign on the door reads: DANGEROUSLY FLAMMABLE. NO NAKED FLAMES. NO LANDLORDS.',
      c.flags.slingersDown ? 'The arrow slits are quiet.' : 'From the arrow slits, small scaly faces watch you, and small scaly hands hold slings.',
    ],
    choices: [
      { text: 'Knock on the door', to: 'door' },
      { text: 'Climb the outside to the top', test: { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Woodcutter', 'Cutpurse'], why: 'you climb for a living', mods: [{ if: { anyItem: ['climbing', 'rope', 'spikes'] }, dd: 4 }] }, pass: 'apex', fail: 'slingers' },
      { text: 'Cast Chosen on yourself, then climb the outside while the sling stones swerve', cast: 'chosen', pass: 'apex', fail: 'slingers', critFail: 'pariah_climb' },
      { text: 'Cast Hellfire on it', cast: 'hellfire', pass: 'hellfire', fail: 'pyramid', critFail: 'pyramid_sanctuary', show: { none: [{ flag: 'kobsLeave' }, { flag: 'kobsStay' }] } },
      { text: 'Set fire to it', to: 'burn', if: { fire: true }, show: { none: [{ flag: 'kobsLeave' }, { flag: 'kobsStay' }] } },
      { text: 'Shoot back at the slingers', to: 'slingers', if: { ranged: true }, show: { notFlag: 'slingersDown' } },
    ],
  },
  slingers: {
    text: ['A volley of sling stones rattles off the cobbles around you. Three kobolds pop up along the slits, reloading.'],
    fight: { outdoors: true,
      monsters: [slinger, slinger, slinger], distance: 1, cornered: true,
      win: 'slingers_win', flee: { to: 'start', label: 'Retreat across the square' },
    },
  },
  slingers_win: {
    on: [{ flag: 'slingersDown' }],
    text: ['The last slinger ducks down out of sight, and you hear a lot of small feet running upstairs.'],
    choices: [{ text: 'Knock on the door', to: 'door' }],
  },
  door: {
    text: ['A hatch opens at knee height. A kobold in a hard hat looks up at you. “If you’re from Grimsby,” it says, “you can tell him we’re not moving until we’ve got somewhere to move to. And we want our deposit back.”'],
    choices: [
      { text: 'Tell it you’re here to help', test: { stat: 'Cha', dd: 8, skill: ['lying', 'social'] }, pass: 'inside', fail: 'sapper_fight' },
      { text: 'Cast Tongues, and talk to it in perfect Kobold', cast: 'tongues', pass: 'inside', fail: 'sapper_fight', critFail: 'door_silent' },
      { text: 'Cast Command on it: “Open the door”', cast: 'command', pass: 'inside', fail: 'sapper_fight' },
      { text: 'Show it the deed to the square', to: 'deed_shown', if: { item: 'deed' } },
      { text: 'Kick the door in', test: { stat: 'Str', dd: 8, skill: ['bruteforce'], mods: [{ if: { anyItem: ['prybar', 'pick'] }, dd: 4 }] }, pass: 'sapper_fight', fail: 'door_ouch' },
    ],
  },
  door_ouch: {
    on: [{ damage: 'd4', from: 'The door' }],
    text: ['The door is made from six other doors. It is very solid.'],
    choices: [{ text: 'Try something else', to: 'door' }],
  },
  deed_shown: {
    on: [{ flag: 'trusted' }],
    text: ['The kobold reads the deed, very slowly, with a claw under each word. Then it opens the door wide. “Grandmother will want to see this,” it says.'],
    choices: [{ text: 'Go inside', to: 'inside' }],
  },
  sapper_fight: {
    text: ['The door swings open on a kobold sapper with a barrel of black powder on its back and a lit fuse in its teeth. It charges.'],
    fight: {
      monsters: [sapper], win: 'inside', flee: { to: 'pyramid', label: 'Back away from the fuse' },
      special: [{ label: 'Throw your bucket of water over its fuse', if: { item: 'bucket' }, flag: 'fuseOut', text: 'Fssst. The sapper looks at its soggy fuse, then at you, and runs upstairs to tell somebody.', win: true }],
    },
  },
  inside: {
    text: (c) => [
      'Inside, the pyramid is three floors of ladders, hammocks, cooking pots and drying washing. The ground floor is the engine room: a treadmill the size of a millwheel that turns the pyramid’s wheels.',
      c.flags.trollGone ? 'The treadmill stands still.' : 'Inside the treadmill, plodding patiently, is a troll called Gnasher. He is the engine. He looks at you, then at his wheel, then at you.',
      'A ladder leads up to the middle floor, where you can hear arguing.',
    ],
    choices: [
      { text: 'Share your rations with Gnasher', to: 'troll_fed', if: { item: 'rations' }, show: { notFlag: 'trollGone' } },
      { text: 'Ask Gnasher what he gets paid', test: { stat: 'Cha', dd: 8, skill: ['social', 'languages'] }, pass: 'troll_strike', fail: 'troll_fight', show: { notFlag: 'trollGone' } },
      { text: 'Jam the treadmill with your iron spikes', to: 'troll_jam', if: { item: 'spikes' }, show: { notFlag: 'trollGone' } },
      { text: 'Climb the ladder', to: 'council' },
      { text: 'Look into the hatch marked NURSERY', to: 'kobold_nursery', show: { notFlag: 'storyTold' } },
      { text: 'Go back outside', to: 'pyramid' },
    ],
  },
  kobold_nursery: {
    text: ['Behind the hatch, a dozen kobold children in hammocks look up at you with enormous yellow eyes. “Are you the landlord?” asks the smallest. “Mum says the landlord eats kobolds.” “Tell us a story,” says another. “A story where the landlord loses.”'],
    choices: [
      { text: 'Tell them a story', test: { stat: 'Cha', dd: 6, skill: ['social', 'languages'], profs: ['Missionary', 'Cleric'], why: 'you tell stories for a living' }, pass: 'story_good', fail: 'story_bad' },
      { text: 'Back to the engine room', to: 'inside' },
    ],
  },
  story_good: {
    on: [{ flag: 'storyTold' }, { flag: 'kidsLikeYou' }],
    text: ['You tell them about a landlord who never washed, and who was eaten by his own fleas. They shriek with delight. By the end, they’re chanting your name, or at least the bits of it they can pronounce. Word will reach Grandmother Snik.'],
    choices: [{ text: 'Back to the engine room', to: 'inside' }],
  },
  story_bad: {
    on: [{ flag: 'storyTold' }],
    text: ['Your story has a moral, which kobold children can smell a mile off. They boo you out of the nursery.'],
    choices: [{ text: 'Back to the engine room', to: 'inside' }],
  },
  troll_fed: {
    on: [{ flag: 'trollGone' }, { flag: 'trollFriend' }, { lose: 'rations' }],
    text: ['Gnasher stops walking to eat. It’s the first time he’s stopped walking in a month. He eats five days of rations in one bite, and then sits down in his wheel to think about how nice that was, and doesn’t get up again.'],
    choices: [{ text: 'Climb the ladder', to: 'council' }],
  },
  troll_strike: {
    on: [{ flag: 'trollGone' }, { flag: 'trollFriend' }],
    text: ['“Gets paid?” says Gnasher slowly. “Gets… paid?” He stops walking. The treadmill stops turning. “Nobody said nothing about getting paid.” He sits down in his wheel and folds his arms. The pyramid is going nowhere now, which, you realise, was also true before.'],
    choices: [{ text: 'Climb the ladder', to: 'council' }],
  },
  troll_jam: {
    on: [{ flag: 'trollGone' }, { flag: 'trollJammed' }, { lose: 'spikes' }],
    text: ['You hammer the spikes into the treadmill’s gears. It lurches, groans and locks solid. Gnasher, mid-stride, falls over, decides this is a sign, and goes to sleep.'],
    choices: [{ text: 'Climb the ladder', to: 'council' }],
  },
  troll_fight: {
    text: ['“No visitors in the engine room,” says Gnasher, climbing out of his wheel. He is twelve feet tall, mostly knuckles.'],
    fight: {
      monsters: [{ name: 'Gnasher', proper: true, lvl: 5, hp: 20, range: 'engaged', onHit: { stat: 'Str', dd: 6, label: 'stay standing', text: 'He knocks you flat.', effect: 'prone' }, note: 'Treadmill troll (20 HP); on hit, d6 Str save or be knocked prone' }],
      win: 'troll_win', flee: { to: 'pyramid', label: 'Dive out of the door' },
    },
  },
  troll_win: {
    on: [{ flag: 'trollGone' }],
    text: ['Gnasher sits down heavily in his treadmill and says he’s had enough of this job anyway.'],
    choices: [{ text: 'Climb the ladder', to: 'council' }],
  },
  council: {
    text: (c) => c.flags.councilDone
      ? [c.flags.kobsStay ? 'The council floor is loud now. The kobolds are planning a party.' : c.flags.kobsBeaten ? 'The council floor is empty. The kobolds have gone.' : 'The council floor is quiet now. The kobolds are packing.']
      : c.flags.snikAngry ? ['Grandmother Snik is waiting for you at the head of the table, ladle in hand. Thirty kobolds turn round on their buckets. “Back again,” she says. “Say your piece, then. Quickly.”']
      : [
        'The middle floor is a meeting hall. Thirty kobolds sit on upturned buckets, arguing about the rent. At the head of the table, in a shawl and spectacles, sits Grandmother Snik, the oldest kobold anyone has ever seen. She raps the table with a ladle, and the room goes silent.',
        '“Well,” she says. “Grimsby’s errand-runner. Say your piece.”',
      ],
    choices: [
      { text: 'Show her the deed to the square', to: 'deed_council', if: { item: 'deed' }, show: { notFlag: 'councilDone' } },
      { text: 'Offer them a new home: an empty counting house under Gallows Hill', test: { stat: 'Cha', dd: 8, skill: ['social', 'languages'], profs: ['Envoy'], why: 'negotiation is your trade', mods: [{ if: { flag: 'kidsLikeYou' }, dd: 4 }] }, pass: 'new_home', fail: 'snik_angry', show: { notFlag: 'councilDone' } },
      { text: 'Read out Grimsby’s eviction notice', to: 'snik_angry', show: { notFlag: 'councilDone' } },
      { text: 'Climb up to the top floor', to: 'apex' },
      { text: 'Go back down', to: 'inside' },
    ],
  },
  deed_council: {
    on: [{ flag: 'councilDone' }, { flag: 'kobsStay' }],
    text: ['Grandmother Snik reads the deed, and starts to laugh: a dry, cackling sound like a kettle with a cold. “Common land,” she says. “Common land! Then we’re not squatting. We’re commoners.” Thirty kobolds cheer. “You’ve done us a service, errand-runner. Take something from the top floor. Not the jar.”'],
    choices: [{ text: 'Climb up to the top floor', to: 'apex' }],
  },
  new_home: {
    on: [{ flag: 'councilDone' }, { flag: 'kobsLeave' }],
    text: (c) => [`You describe the Counting House: ${COUNTING_HOUSE(c)}. Grandmother Snik’s eyes gleam behind her spectacles. “How much?” she asks. “Free,” you say. ${pastFlag(c, 'death-and-taxes', 'vaneServes') ? '“The last owner works for me now.”' : '“The last owner is beyond collecting.”'} The room erupts. Kobolds begin packing at once. Snik pats your hand. “Take what you want from upstairs,” she says. “Except the jar.”`],
    choices: [{ text: 'Climb up to the top floor', to: 'apex' }],
  },
  snik_angry: {
    on: [{ flag: 'snikAngry' }],
    text: ['Grandmother Snik’s ladle comes down on the table like a gavel. “Then you’re no better than him,” she says. Around the room, thirty kobolds pick up thirty buckets.'],
    fight: {
      monsters: [{ name: 'Grandmother Snik', lvl: 4, hp: 16, range: 'short', note: 'Kobold matriarch (16 HP); hurls her ladle and catches it again' }, slinger],
      win: 'council_won', flee: { to: 'pyramid', label: 'Jump out of a window' },
    },
  },
  council_won: {
    on: [{ flag: 'councilDone' }, { flag: 'kobsBeaten' }],
    text: ['Grandmother Snik lowers her ladle. “Fine,” she says. “We’ll go. We always go. That’s what being a kobold is.” The pyramid empties around you, quietly, as the kobolds file out into the night with their buckets.'],
    choices: [{ text: 'Climb up to the top floor', to: 'apex' }],
  },
  apex: {
    text: (c) => [
      'The top floor is the kobolds’ treasury: a single room under the point of the pyramid, with a window on each side and a jar on a shelf. The jar is full of coins, and labelled, in careful kobold letters, DEPOSIT FOR NEW HOME. A pile of odds and ends lies in the corner: the kobolds’ belongings, salvaged from the warren.',
      c.flags.councilDone ? '' : 'Down below, you can hear the kobolds arguing.',
    ].filter(Boolean),
    choices: [
      { text: 'Take the savings jar', to: 'jar', show: { notFlag: 'jar' } },
      { text: 'Search the salvage pile', to: 'salvage', show: { notFlag: 'salvage' } },
      { text: 'Go down to the council', to: 'council', show: { notFlag: 'councilDone' } },
      { text: 'Climb out and down to the square', to: 'payday' },
    ],
  },
  jar: {
    on: [{ flag: 'jar' }, { item: 'savings' }],
    text: (c) => [c.flags.kobsBeaten ? 'You take the jar. The kobolds left without it. They left in a hurry, because of you.'
      : c.flags.councilDone ? 'You take the jar. Nobody stops you. Somewhere below, Grandmother Snik will notice soon, and she will not be surprised. That’s worse, somehow.' : 'You take the jar. It is very heavy, and nobody sees.'],
    choices: [{ text: 'Back to the room', to: 'apex' }],
  },
  salvage: {
    on: [{ flag: 'salvage' }, { item: 'potion' }, { item: 'fire' }, { gold: 30 }],
    text: ['Among the broken teacups and lucky stones you find a healing potion, a jar of alchemist’s fire labelled DO NOT, and a purse of tarnished coins the kobolds dug up in the warren.'],
    choices: [{ text: 'Back to the room', to: 'apex' }],
  },
  burn: {
    text: (c) => [c.flags.kobsBeaten
      ? `${c.flags.hellfire ? 'Hellfire takes hold.' : 'You strike a light.'} The empty pyramid goes up like a haystack. The kobolds, trudging out of town with their buckets, stop on the hill to watch their home burn, and then keep walking. In a few minutes there is nothing left in the square but a heap of glowing cartwheels${c.flags.jar ? '' : ' and a melted jar that used to hold their savings'}.`
      : `${c.flags.hellfire ? 'Hellfire takes hold.' : 'You strike a light.'} The lamp-oil-soaked planks catch at once, and the pyramid goes up like a haystack. Kobolds pour out of every hatch, carrying children, buckets and furniture, and run screaming into the night. In a few minutes there is nothing left in the square but a heap of glowing cartwheels${c.flags.jar ? '' : ' and a melted jar that used to hold their savings'}.`],
    on: [{ flag: 'burnt' }],
    choices: [{ text: 'Go and collect your fee', to: 'payday' }],
  },
  payday: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'kobsLeave' }, { flag: 'kobsBeaten' }, { flag: 'burnt' }] }, gold: 300, uncapped: true, msg: 'Lord Grimsby pays your fee, holding the purse at arm’s length.' },
      { if: { notFlag: 'kobsStay' }, sell: { item: 'deed', gold: 150, text: 'Grimsby buys the deed back from you, in a hurry, before anyone else sees it' } },
      { sell: { item: 'savings', gold: 150, text: 'You break open the kobolds’ savings jar' } },
    ],
    text: (c) => [
      c.flags.burnt
        ? `Lord Grimsby surveys the smoking ruin of his square with satisfaction and pays you in full. Somewhere out in the dark, thirty homeless kobolds are telling each other a story about you. It isn’t a nice one.`
        : c.flags.kobsStay
          ? 'You tell Lord Grimsby that the square is common land, the kobolds are commoners, and he has been charging illegal rent for twelve years. He goes a colour you’ve never seen on a human face and refuses to pay you. The kobolds throw a party in the square that lasts three days.'
          : c.flags.kobsLeave
            ? `The pyramid rolls out of Middle Whelping at dawn, heading for Gallows Hill, ${c.flags.trollJammed ? 'pulled on ropes by thirty kobolds, since the treadmill is full of your spikes,' : c.flags.trollFriend ? 'with Gnasher, now on a proper wage, at the wheel,' : 'with Gnasher at the wheel,'} and Grandmother Snik waving from the top. Lord Grimsby pays you, and never finds out where they went.`
            : c.flags.kobsBeaten
              ? 'The kobolds are gone. Lord Grimsby pays you, eventually, after counting it twice.'
              : 'The pyramid is still in the square, and the kobolds are still in it. Lord Grimsby pays you nothing, and says so, loudly, from a safe distance.',
      `You walk away from Middle Whelping with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}. Every 200GP you squander on a pointless endeavour gains you a level.`,
    ],
  },
  grimsby_confesses: {
    on: [{ flag: 'heardDeed' }, { flag: 'knowsWarren' }],
    text: ['Lord Grimsby stops in the middle of the square, handkerchief raised, and relives his most recent sins where everybody can see them: filling in the kobolds’ warren, raising the rents, and, twelve years ago, taking the deed to the square out of the town hall “for framing” and hiding it in his carriage, under the scented handkerchiefs. The crowd turns to look at the carriage. So does Grimsby.'],
    choices: [{ text: 'Get to the carriage before he does', to: 'deed' }, { text: 'Walk up to the pyramid', to: 'pyramid' }],
  },
  grimsby_wiped: {
    on: [{ flag: 'knowsWarren' }],
    text: ['Your god scorns you, and wipes the last day’s worries from Lord Grimsby’s mind. He beams at you, relaxed. “Kobolds? Oh, they lived in a warren under Grimsby Common. I filled it in. I’m building a hunting lodge. Lovely day, isn’t it?”'],
    choices: [{ text: 'Walk up to the pyramid', to: 'pyramid' }, { text: 'Ask around the square', to: 'square' }],
  },
  pariah_climb: {
    text: ['Your god scorns you. Instead of being Chosen, you become a Pariah: for five rounds, every ranged attack in the square comes to you. Every kobold slinger on the pyramid stands up to see why.'],
    choices: [{ text: 'Defend yourself', to: 'slingers' }],
  },
  pyramid_sanctuary: {
    text: ['Your god scorns you. Instead of fire, the pyramid is enclosed in shining walls of law. For a few minutes it is the safest building in the county. A kobold looks out of a window and waves.'],
    choices: [{ text: 'Try something else', to: 'pyramid' }],
  },
  door_silent: {
    text: ['Your god scorns you. Instead of speaking Kobold, you can’t make a sound at all. You open and shut your mouth at the hatch like a fish. The kobold watches with interest, then closes the hatch.'],
    choices: [{ text: 'Try something else', to: 'door' }],
  },
  hellfire: {
    on: [{ flag: 'hellfire' }],
    text: ['The ground under the pyramid bursts into flame, and the flames start to climb.'],
    choices: [{ text: 'Watch', to: 'burn' }],
  },
};

export const DEATH_TEXT = [
  'They bury you on the common land, which, it turns out, belongs to everyone. The kobolds leave flowers. Grimsby sends the bill.',
  'Your adventure ends here.',
];
