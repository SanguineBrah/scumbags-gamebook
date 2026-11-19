// TAKING THE WATERS — get a giant blob out of a fashionable spa before the season starts. For a level 6–7 scumbag.

export const META = {
  tier: 7, id: 'taking-the-waters', title: 'Taking the Waters', levels: '6–7', final: 'season',
  blurb: 'The Royal Spa at Sludgeby has the finest hot spring in the land, and since last winter, something living in it. Guests come out lighter: lighter of rings, necklaces and, in one case, a husband. Mr Bubbleby, the manager, will pay 300 gold to have it gone, quietly, before the season opens on Saturday. Whatever it has swallowed is presumably still in there.',
};

const blob = { name: 'The blob', lvl: 7, hp: 22, range: 'engaged', onHit: { stat: 'Str', dd: 8, label: 'pull yourself free', text: 'It closes over you, and starts to digest.', effect: 'damage', amount: '2d4' }, note: 'A giant blob, warm and clear as soup (22 HP); on hit, d8 Str save or take 2d4 more' };
const leeches = { name: 'Therapeutic leeches', lvl: 4, hp: 12, range: 'engaged', feats: ['tiny'], note: 'A tank of medical leeches, very keen (+2 to tests when being attacked)' };

export const SECTIONS = {
  start: {
    text: [
      'Mr Bubbleby, manager of the Royal Spa, is a damp, anxious man in a striped bathing costume, which he wears to work. “It’s in the Great Bath,” he says. “It looks just like the water. You only notice it when it notices you. We’ve lost three wedding rings, a tiara, Lord Whitlow’s teeth and Lord Whitlow.”',
      '“The season opens on Saturday. The Duchess of Fenwick is coming. If she gets eaten, nobody will ever come again.” He wrings his hands. “Three hundred gold. Quietly. And I’d be grateful if you could fish out Lord Whitlow, if there’s any of him left. His wife’s been asking.”',
    ],
    choices: [{ text: 'Go to the Great Bath', to: 'great_bath' }],
  },
  great_bath: {
    text: (c) => [
      c.flags.blobGone ? 'The Great Bath is a Roman pool the size of a ballroom, with stone steps and pillars. The blob has gone down the drain, and it is just a bath again.'
        : c.flags.dropped ? 'The Great Bath is a Roman pool the size of a ballroom, steaming, with a hole in the glass roof above it. The blob lies on the tiles beside it where it fell, a great quivering heap, shrinking.'
        : c.flags.drained ? 'The Great Bath is a Roman pool the size of a ballroom, with stone steps and pillars. It is empty of water now, and the blob lies on the tiles at the bottom, a great quivering heap the size of a haycart, shrinking.'
        : c.flags.salted ? 'The Great Bath is a Roman pool the size of a ballroom, steaming. The water is cloudy with salt, and the blob is in trouble: a milky, shrinking lump at the deep end.'
        : `The Great Bath is a Roman pool the size of a ballroom, steaming, with stone steps and pillars. The water is perfectly clear, and perfectly still. At the bottom, among the tiles, lie three wedding rings, ${c.flags.tiaraTaken ? '' : 'a tiara, '}a set of false teeth and a pair of boots. They are not at the bottom. They are floating, very slowly, three feet up, inside something you can’t see.`,
    ].filter(Boolean),
    choices: [
      { text: 'Go to the pump room, to see about draining it', to: 'pump_room', show: { notFlag: 'drained' } },
      { text: 'Look in the treatment rooms', to: 'treatments', show: { notFlag: 'saltsFound' } },
      { text: 'Pour the Epsom salts into the bath', to: 'salt_bath', if: { flag: 'saltsFound', flagText: 'the Epsom salts' }, show: { notFlag: 'salted' } },
      { text: 'Fish for the jewels with your pole', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'fished', fail: 'blob_fight', if: { item: 'pole' }, show: { none: [{ flag: 'fished' }, { flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }, { flag: 'blobGone' }] } },
      { text: 'Cast Telekinesis, and lift the tiara out of the blob from the side of the bath', cast: 'telekinesis', pass: 'fished_tk', fail: 'blob_fight', show: { none: [{ flag: 'fished' }, { flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }, { flag: 'blobGone' }] } },
      { text: 'Cast Aqualung on yourself, and swim into the blob after Lord Whitlow', cast: 'aqualung', pass: 'blob_swim', fail: 'blob_fight', show: { none: [{ flag: 'whitlow' }, { flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }, { flag: 'blobGone' }] } },
      { text: 'Cast Descend on the blob', cast: 'descend', pass: 'blob_dropped', fail: 'blob_fight', critFail: 'blob_ascends', show: { none: [{ flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }, { flag: 'blobGone' }] } },
      { text: 'Cast Pollute on the Great Bath', cast: 'pollute', pass: 'polluted', fail: 'blob_fight', critFail: 'blob_blessed', show: { none: [{ flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }, { flag: 'polluted' }] } },
      { text: 'Wade in and fight it', to: 'blob_fight', show: { notFlag: 'blobGone' } },
      { text: 'Finish it off', to: 'blob_weak', show: { any: [{ flag: 'drained' }, { flag: 'dropped' }, { flag: 'salted' }], notFlag: 'blobGone' } },
      { text: 'Report to Mr Bubbleby', to: 'season' },
    ],
  },
  pump_room: {
    text: ['The pump room is full of pipes, wheels and a great brass valve marked DRAIN, rusted solid. Beside it, a notice: IN CASE OF EMERGENCY, OPEN SLOWLY. In the corner, an elderly pump-man is asleep in a deckchair.'],
    choices: [
      { text: 'Wake the pump-man with your smelling salts', to: 'pumpman', if: { item: 'salts' } },
      { text: 'Wake the pump-man', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'pumpman', fail: 'pumpman_snores' },
      { text: 'Lever the valve open with your pry bar', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'drain', fail: 'valve_stuck', if: { item: 'prybar' } },
      { text: 'Oil the valve with your flask of oil, then turn it', to: 'drain', if: { item: 'oil' }, effects: [{ lose: 'oil' }] },
      { text: 'Heave on the wheel', test: { stat: 'Str', dd: 12, skill: ['bruteforce'] }, pass: 'drain', fail: 'valve_stuck' },
      { text: 'Back to the Great Bath', to: 'great_bath' },
    ],
  },
  pumpman_snores: {
    text: ['The pump-man opens one eye, says “Saturday,” and closes it again.'],
    choices: [{ text: 'Back to the valve', to: 'pump_room' }],
  },
  pumpman: {
    text: ['The pump-man sits up with a snort. “The drain? Rusted up since the Romans,” he says. “Needs a drop of oil, or a good lever. Or both.” He looks at you shrewdly. “It’s that thing in the bath, isn’t it? It hates salt, you know. Spat out a pickled egg once.” He goes back to sleep.'],
    on: [{ flag: 'knowsSalt' }],
    choices: [{ text: 'Back to the valve', to: 'pump_room' }],
  },
  valve_stuck: {
    on: [{ damage: 'd4', from: 'The valve' }],
    text: ['The wheel doesn’t turn. Your back does, a little.'],
    choices: [{ text: 'Try something else', to: 'pump_room' }],
  },
  drain: {
    on: [{ flag: 'drained' }],
    text: ['The valve groans open. Somewhere under your feet, two thousand years of bathwater roars away down a Roman drain. Back in the Great Bath, the water level drops, and drops, and there it is: a great clear lump of jelly, the size of a haycart, quivering on the tiles, with a tiara in the middle of it, and Lord Whitlow’s teeth, and a pair of boots that might be Lord Whitlow.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  treatments: {
    text: (c) => [
      'The treatment rooms are a warren of tiled cubicles: a mud room, a steam room, a leech room and a salt room. The salt room is full of sacks of Epsom salts, for the gout.',
      c.flags.knowsSalt ? 'You remember what the pump-man said about salt.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Take the sacks of Epsom salts', to: 'salts', show: { notFlag: 'saltsFound' } },
      { text: 'Look in the leech room', to: 'leech_fight', show: { notFlag: 'leechesDone' } },
      { text: 'Back to the Great Bath', to: 'great_bath' },
    ],
  },
  salts: {
    on: [{ flag: 'saltsFound' }],
    text: ['You drag out four sacks of Epsom salts. You’re not sure yet what they’re for, but anything that comes out of the bath and won’t go back in seems worth keeping.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  leech_fight: {
    text: ['The leech tank has cracked, and the leeches are out and very keen. They come across the tiles at you like a dropped plate of liquorice.'],
    fight: {
      monsters: [leeches], win: 'leeches_done', flee: { to: 'treatments', label: 'Back out of the leech room' },
      special: [{ label: 'Pour salt from your rations on them', if: { item: 'rations' }, flag: 'leechSalt', text: 'The leeches curl up and drop off everything.', win: true }],
    },
  },
  leeches_done: {
    on: [{ flag: 'leechesDone' }, { gold: 30, msg: 'Stuck to the bottom of the tank: a guest’s purse, 30GP.' }], onceOnly: true,
    text: ['The leech room is quiet. You check yourself for leeches, and find two, and take them off, and check again.'],
    choices: [{ text: 'Back to the treatment rooms', to: 'treatments' }],
  },
  salt_bath: {
    on: [{ flag: 'salted' }, { if: { notFlag: 'tiaraTaken' }, item: 'tiara', msg: 'You fish the tiara out of the salty water: 120GP of diamonds.' }, { flag: 'tiaraTaken' }],
    text: ['You slit the sacks and pour the salt into the Great Bath. For a moment, nothing. Then the water starts to heave. The blob writhes, shrinks and turns milky. It spits out a wedding ring. Then another. Then a tiara. Then, with a noise like a drain clearing, Lord Whitlow, who is alive, furious and very clean.'],
    choices: [{ text: 'Help Lord Whitlow out of the bath', to: 'whitlow' }],
  },
  whitlow: {
    on: [{ flag: 'whitlow' }],
    text: ['Lord Whitlow sits on the steps of the bath, wrapped in a towel, wrinkled as a walnut. “Six months,” he says. “Six months in there. It was very relaxing, actually.” He looks at the shrinking blob with something like regret.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  polluted: {
    on: [{ flag: 'polluted' }, { flag: 'drained' }],
    text: ['The Great Bath turns thick and black and smells of lamps. The blob, which lives on warm clean water, does not like oil at all. It heaves itself out of the bath onto the tiles in a hurry, coughing up jewellery, and lies there, quivering, a great clear lump the size of a haycart.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  fished: {
    on: [{ flag: 'fished' }, { flag: 'tiaraTaken' }, { item: 'tiara', msg: 'You hook the tiara out of the blob. It’s worth 120GP, and covered in jelly.' }],
    text: ['You lower your pole into the bath, slowly, and hook the tiara out of the middle of something invisible. The water shivers, but doesn’t notice. Not yet.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  blob_fight: {
    text: ['The water stands up. The blob rises out of the Great Bath like a wave that has decided not to come down, and comes for you.'],
    fight: {
      monsters: [blob], win: 'blob_dead', flee: { to: 'great_bath', label: 'Scramble out of the bath' },
      special: [
        { label: 'Throw salt from your rations into it', if: { item: 'rations' }, flag: 'blobSalt', text: 'The blob flinches from the salt and shrinks back.', dmg: '2d6' },
        { label: 'Throw burning oil on it', if: { fire: true }, flag: 'blobFire', text: 'It boils, hissing, where the fire hits.', dmg: '3d6' },
      ],
    },
  },
  blob_weak: {
    text: ['What’s left of the blob heaves itself up off the tiles at you, sluggish and shrinking.'],
    fight: { monsters: [{ ...blob, hp: 12, note: 'A giant blob, drying out (12 HP); on hit, d8 Str save or take 2d4 more' }], win: 'blob_dead', flee: { to: 'great_bath', label: 'Back off' } },
  },
  blob_dead: {
    on: [{ flag: 'blobGone' }, { if: { notFlag: 'tiaraTaken' }, item: 'tiara', msg: 'In what’s left of the blob: a tiara worth 120GP.' }, { gold: 60, msg: 'And three wedding rings: 60GP.' }],
    text: (c) => [
      'The blob slumps, goes cloudy and runs away down the drain, leaving behind everything it ever swallowed.',
      c.flags.whitlow ? '' : 'That includes Lord Whitlow, who sits up, gasping, wrinkled as a walnut and clean as a whistle. “Six months,” he says. “It was very relaxing, actually.”',
    ].filter(Boolean),
    choices: [{ text: 'Report to Mr Bubbleby', to: 'season' }],
  },
  season: {
    end: 'victory',
    on: [
      { if: { flag: 'blobGone' }, gold: 300, uncapped: true, msg: 'Mr Bubbleby pays 300GP, and gives you a season ticket.' },
      { if: { any: [{ flag: 'whitlow' }, { flag: 'blobGone' }] }, gold: 50, uncapped: true, msg: 'Lady Whitlow gives you 50GP for her husband. She seems undecided about whether it’s a reward.' },
      { sell: { item: 'tiara', gold: 120, text: 'A jeweller in Sludgeby buys the tiara, no questions asked' } },
    ],
    text: (c) => [
      c.flags.blobGone ? 'The season opens on Saturday. The Duchess of Fenwick takes the waters, and comes out with everything she went in with. The Royal Spa has its best year ever. Lord Whitlow takes a bath there every day, and stays in it for hours, looking wistful.'
        : 'The season opens on Saturday with the blob still in the bath. The Duchess of Fenwick goes in, and does not come out for six months. When she does, she says it was the best rest she’s ever had, and the Royal Spa becomes the most fashionable place in the land.',
      `You leave Sludgeby with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  blob_blessed: {
    text: ['Your god scorns you. Instead of oil, the Great Bath turns to holy water, faintly glowing. The blob has never been so clean. It rises out of the bath, sparkling, refreshed, and in the mood for company.'],
    choices: [{ text: 'Brace yourself', to: 'blob_fight' }],
  },
  fished_tk: {
    on: [{ flag: 'fished' }, { flag: 'tiaraTaken' }, { item: 'tiara', msg: 'The tiara floats into your hand. It’s worth 120GP, and covered in jelly.' }],
    text: ['You point at the tiara, and it slides slowly up through the middle of something invisible, out of the water, and across the bath to your hand. The water shivers, but doesn’t notice. Not yet.'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  blob_swim: {
    on: [{ flag: 'whitlow' }, { flag: 'fished' }, { if: { notFlag: 'tiaraTaken' }, item: 'tiara', msg: 'You bring out the tiara too: 120GP of diamonds.' }, { flag: 'tiaraTaken' }],
    text: ['You take a breath you don’t need, and wade in. Inside the blob it is warm, and green, and very quiet, like being inside a gooseberry. Lord Whitlow is floating in the middle, asleep, with a smile on his face. You take him by the collar and tow him out, and the blob, which has never been entered on purpose before, lets you go out of sheer surprise.', 'Lord Whitlow sits on the steps of the bath, wrapped in a towel, wrinkled as a walnut. “Six months,” he says. “It was very relaxing, actually.”'],
    choices: [{ text: 'Back to the Great Bath', to: 'great_bath' }],
  },
  blob_dropped: {
    on: [{ flag: 'dropped' }],
    text: ['The blob is launched straight up out of the Great Bath, through the glass roof of the spa and into the sky over the town, where it hangs for a moment, glittering in the sun. Then it comes down again, onto the tiles, from a great height. It spreads. It is a great deal smaller when it pulls itself together, and it is very cross.'],
    choices: [{ text: 'Finish it off', to: 'blob_weak' }],
  },
  blob_ascends: {
    text: ['Your god scorns you. Instead of being flung into the sky and dropped, the blob can fly. It lifts out of the bath, dripping, and floats over to you, like a jellyfish the size of a haycart, with a thoughtful air.'],
    choices: [{ text: 'Brace yourself', to: 'blob_fight' }],
  },
};

export const DEATH_TEXT = [
  'The blob closes over you, warm and quiet, and you stop worrying about anything. Six months later, they fish out your boots.',
  'Your adventure ends here.',
];
