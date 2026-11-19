// TORCHES AND PITCHFORKS — escort Lord Grimsby across Blackmire Moor, through a mob of ghostly tenants. For a level 8–9 scumbag.
// The mob is ghostly: ordinary weapons pass through it. Holy water, magic, a blessed weapon, turning or paperwork all work.

import { pastFlag, didAdventure, lightSource } from '../engine/conditions.js';

// A scumbag who played Eviction Notice has met Lord Grimsby before, at Middle Whelping.
const REUNION = (c) => {
  const p = (f) => pastFlag(c, 'eviction-notice', f);
  if (p('burnt')) return 'He brightens when he sees you. “The one who burnt the kobolds out! Splendid. I asked for you specifically. Nobody else would come.”';
  if (p('kobsStay')) return 'He goes pale when he sees you. “You,” he says. “The one with the deed. The commoner-lover. I’d sooner hire a kobold.” He looks round the empty inn. “I have asked every kobold.”';
  if (p('kobsLeave') || p('kobsBeaten')) return '“Ah. The eviction specialist,” he says, when he sees you. “You got rid of my kobolds. Now get me past my tenants. It’s practically the same job.”';
  if (didAdventure(c, 'eviction-notice')) return 'He squints at you. “Middle Whelping,” he says. “You were the one who did nothing whatsoever about my kobolds. Well, you’re cheap, at least. Everyone else has said no.”';
  return '';
};

export const META = {
  tier: 9, id: 'torches-and-pitchforks', title: 'Torches and Pitchforks', levels: '8–9', final: 'grimsby_hall',
  blurb: 'Lord Grimsby has inherited Grimsby Hall, on the far side of Blackmire Moor. So have three hundred years of Grimsbys’ evicted tenants, who rise every night with torches and pitchforks and are, technically, still owed their deposits. He’ll pay 400 gold for an escort. He has asked everyone else.',
};

const ghostTraits = { feats: ['ghostly', 'undead'], note: 'Ghostly (ordinary weapons pass through it; magic, holy water and blessed weapons don’t); undead' };
const mob = { name: 'Spectral mob', lvl: 7, hp: 28, range: 'short', ...ghostTraits, note: 'Three hundred years of evicted tenants. ' + ghostTraits.note };
const blob = { name: 'Bog blob', lvl: 6, hp: 36, range: 'engaged', onHit: { stat: 'Str', dd: 8, label: 'pull free', text: 'It closes over your legs and starts to digest your boots.', effect: 'damage', amount: 'd6' }, note: 'A great wobbling heap of moor; on hit, d8 Str save or take d6 more; full of marsh gas' };

export const SECTIONS = {
  start: {
    text: (c, visits) => visits > 1 ? ['Back in the bar of the Tumbledown Inn, Lord Grimsby is watching the clock, and the innkeeper is polishing the same glass. Outside, it is getting dark.'] : [
      'The Tumbledown Inn is the last building before Blackmire Moor, and Lord Grimsby is its only guest. He’s wrapped in three coats and a scarf with his family crest on it, and he still hasn’t bathed.',
      REUNION(c),
      '“Four hundred gold,” he says, “to see me to Grimsby Hall by midnight. Once I’m over the threshold, the hall is legally mine, and the tenants can’t touch me. If I’m not there by midnight, it’s theirs, and so am I.”',
      'The innkeeper, polishing a glass, adds: “Sword goes straight through ’em. Chaplain does blessings in the back, mind. Twenty gold.”',
    ].filter(Boolean),
    choices: [
      { text: 'Have the chaplain bless your weapon (20GP)', to: 'blessed', if: { gold: 20 }, show: { notFlag: 'blessedWeapon' } },
      { text: 'Fill your bucket at the trough and bless the water', cast: 'bless', pass: 'bucket_blessed', fail: 'bucket_fizzle', critFail: 'bucket_oil', if: { item: 'bucket' }, show: { notFlag: 'holyBucket' } },
      { text: 'Ask Grimsby exactly what the tenants want', to: 'grimsby_talk', show: { notFlag: 'knowsDeposits' } },
      { text: 'Set out across the moor', to: 'moor' },
    ],
  },
  blessed: {
    on: [{ gold: -20 }, { flag: 'blessedWeapon' }],
    text: ['The chaplain blesses your weapon, then charges you for the holy water, then blesses the receipt. Your weapon hums faintly. Ghosts won’t like it.'],
    choices: [{ text: 'Back to the bar', to: 'start' }],
  },
  bucket_blessed: {
    on: [{ flag: 'holyBucket' }],
    text: ['The water in your bucket goes clear and still and very slightly smug. A whole bucket of holy water. That’s a lot of ghost.'],
    choices: [{ text: 'Back to the bar', to: 'start' }],
  },
  bucket_oil: {
    text: ['Your god scorns you. The water in your bucket goes thick and black and starts to smell of lamps. It’s oil, now.'],
    choices: [{ text: 'Back to the bar', to: 'start' }],
  },
  grimsby_talk: {
    on: [{ flag: 'knowsDeposits' }],
    text: (c) => [`${didAdventure(c, 'eviction-notice') ? 'You’ve heard Grimsby on the subject of deposits before. ' : ''}“Their deposits,” says Grimsby, as if it’s a disease. “My family kept every tenant’s deposit for three hundred years. Damp, wear and tear, that sort of thing. Now they want it back. All of it. With an apology. In writing.” He shudders. “A Grimsby has never written an apology. We don’t own the right sort of ink.”`],
    choices: [{ text: 'Back to the bar', to: 'start' }],
  },
  moor: {
    text: (c) => [
      'Blackmire Moor is flat, black and soaked. The road wanders off to the left around the bog, past a crossroads with a gibbet on it. The old causeway goes straight across the bog, half sunk, and would save an hour. Grimsby looks at the causeway, then at his shoes.',
      lightSource(c) ? 'Your light makes a small, brave circle in the dark.' : 'It is very dark.',
    ].filter(Boolean),
    choices: [
      { text: 'Take the causeway across the bog', to: 'bog' },
      { text: 'Take the road, past the crossroads', to: 'gibbet' },
    ],
  },
  bog: {
    text: ['Halfway across, the causeway disappears under black water. Somewhere ahead it comes back. Somewhere around you, the bog belches.'],
    choices: [
      { text: 'Feel ahead for the stones with your pole', to: 'bog_far', if: { item: 'pole' } },
      { text: 'Rope yourself to Grimsby and go first, so whoever sinks gets pulled out', to: 'bog_far', if: { item: 'rope' } },
      { text: 'Find the way across by eye', test: { stat: 'Wis', dd: 10, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know wet ground', mods: [{ if: { light: true }, dd: 6 }] }, pass: 'bog_far', fail: 'blob' },
      { text: 'Cast Waterwalk on yourself and Grimsby, and walk across the top of the bog', cast: 'waterwalk', pass: 'bog_far', fail: 'bog', critFail: 'bog_burden' },
      { text: 'Turn back and take the road', to: 'gibbet' },
    ],
  },
  blob: {
    text: ['The bog in front of you stands up. It is the size of a haycart, it wobbles, and it has a boot inside it that isn’t yours. Grimsby screams in a very aristocratic register.'],
    fight: { outdoors: true,
      monsters: [blob], win: 'bog_far', flee: { to: 'moor', label: 'Drag Grimsby back the way you came' },
      special: [{ label: 'Set light to the marsh gas', if: { fire: true }, flag: 'gasLit', text: 'WHUMP. A ball of blue fire rolls up off the blob, and it boils and shrinks.', dmg: '3d6' }],
    },
  },
  bog_far: {
    on: [{ flag: 'shortcut' }],
    text: ['You come out of the bog on the far side, wet to the waist. Grimsby has lost a shoe. You’ve saved an hour, and the mob is still out on the road, looking for you. Far behind, a long line of ghostly torches turns towards you.'],
    choices: [{ text: 'Hurry on to the hall', to: 'gates' }],
  },
  gibbet: {
    text: (c) => c.flags.mobAngry ? [
      'The mob is still at the crossroads, waiting, torches high, pitchforks levelled. The skeleton in the gibbet points at Grimsby. “DEPOOOSIT,” moans the mob, angrier now.',
      c.flags.knowsDeposits ? 'They want their deposits back, with an apology. In writing.' : '',
    ].filter(Boolean) : [
      'At the crossroads, a skeleton sways in the gibbet. As you pass, it turns its head. All around you, the fog lights up: torches, a hundred of them, carried by grey, see-through villagers in the clothes of three centuries, every one of them holding a pitchfork. “GRIIIMSBYYYY,” they moan. “DEPOOOSIT.”',
      c.flags.knowsDeposits ? 'They want their deposits back, with an apology. In writing.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Write out an apology and three hundred years of receipts, and make Grimsby sign it', to: 'apology', if: { item: 'quill' }, show: { flag: 'knowsDeposits' } },
      { text: 'Talk to them', test: { stat: 'Cha', dd: 10, skill: ['social', 'languages'], profs: ['Envoy', 'Missionary'], why: 'you know how to talk to a crowd' }, pass: 'demands', fail: 'mob_fight' },
      { text: 'Turn them', turn: { dd: 10 }, pass: 'mob_flees', chaos: 'mob_obeys', fail: 'mob_fight', if: { magic: 'divine' } },
      { text: 'Cast Banish, and clear the road of the dead', cast: 'banish', pass: 'mob_flees', fail: 'mob_fight', critFail: 'mob_entreated' },
      { text: 'Cast Labyrinth, and lose them in a maze', cast: 'labyrinth', pass: 'maze', fail: 'mob_fight', critFail: 'sundered' },
      { text: 'Cast Shroud over yourself and Grimsby and sneak past', cast: 'shroud', pass: 'sneak', fail: 'mob_fight', critFail: 'mob_lit' },
      { text: 'Hand Grimsby over', to: 'betrayal' },
      { text: 'Pick up Grimsby and run', test: { stat: 'Str', dd: 10, skill: ['athletics'], profs: ['Bodyguard'], why: 'carrying clients out of trouble is your job' }, pass: 'gates', fail: 'mob_fight' },
      { text: 'Fight', to: 'mob_fight' },
    ],
  },
  demands: {
    on: [{ flag: 'knowsDeposits' }],
    text: ['The mob stops. The skeleton in the gibbet clears what’s left of its throat. “We want,” it says, “our deposits back. And an apology. In writing.” Grimsby, behind you, makes a noise like a cat being sat on.'],
    choices: [
      { text: 'Write out the apology and receipts, and make Grimsby sign', to: 'apology', if: { item: 'quill' } },
      { text: 'Persuade Grimsby to apologise out loud', test: { stat: 'Cha', dd: 12, skill: ['social', 'lying'] }, pass: 'spoken', fail: 'mob_fight' },
      { text: 'Hand Grimsby over', to: 'betrayal' },
      { text: 'Fight', to: 'mob_fight' },
    ],
  },
  apology: {
    on: [{ flag: 'peace' }],
    text: ['By torchlight, on your knee, you write it all out: I, the undersigned Grimsby, am sorry. Then three hundred years of receipts, one for every tenant, all marked PAID IN FULL. Grimsby signs it with his eyes shut. The skeleton reads it, nods, and the torches go out one by one, until there’s only fog and a very quiet moor.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  spoken: {
    on: [{ flag: 'peace' }],
    text: ['Grimsby says sorry. It takes him four goes, and on the third he gets as far as “sor-” before he has to sit down. The ghosts are not entirely satisfied, it not being in writing, but they’ve never heard a Grimsby say it before. They drift off into the fog to talk about it.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  sneak: {
    text: ['A patch of darkness settles over you both, and you creep through the mob with Grimsby holding his breath. A ghost bumps into you, apologises, and moves on. Tenants are like that.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  mob_flees: {
    on: [{ flag: 'turned' }],
    text: ['You raise your holy symbol, and the mob falls back, torches guttering, until the road is clear. They’ll be back tomorrow night. Grimsby will be safe inside by then.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  mob_obeys: {
    on: [{ flag: 'turned' }, { flag: 'ghostArmy' }],
    text: ['The mob kneels. A hundred ghosts with torches and pitchforks now take their orders from you. You march Grimsby to his own front door at the head of a spectral army, which he does not enjoy at all.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  betrayal: {
    on: [{ flag: 'betrayed' }, { item: 'strongkey' }],
    text: (c) => [`${c.flags.thrown ? 'Grimsby is carried off into the fog on a hundred pitchforks, still explaining about wear and tear, and the fight goes out of the mob at once.' : 'You step aside. Grimsby is carried off into the fog on a hundred pitchforks, still explaining about wear and tear.'} The skeleton in the gibbet drops a heavy iron key at your feet. “His strongroom,” it says. “Our deposits are in there. We can’t carry gold any more. Spend it on something stupid.”`],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  mob_fight: {
    on: [{ flag: 'mobAngry' }],
    text: (c) => [
      'The mob surges. Pitchforks you can see through still go into you.',
      c.flags.blessedWeapon ? 'Your blessed weapon hums.' : 'Your weapon will pass right through them. You need magic, holy water, or something better.',
    ],
    fight: { outdoors: true,
      monsters: [mob], distance: 1, win: 'mob_gone', flee: { to: 'moor', label: 'Drag Grimsby back into the fog' },
      special: [
        { label: 'Throw the bucket of holy water over them', if: { flag: 'holyBucket' }, flag: 'bucketThrown', text: 'A whole bucket of holy water goes through the front rank of the mob like a scream.', dmg: '4d8' },
        { label: 'Use your mirror to show the ghosts what they look like', if: { item: 'mirror' }, flag: 'mirrored', text: 'The front rank sees itself in your mirror and stops, horrified. Three hundred years without a mirror. Some of them are wearing the same shirt.', stun: 1 },
        { label: 'Throw Grimsby to them', flag: 'thrown', text: 'You shove Lord Grimsby into the mob. They forget all about you.', win: true },
      ],
    },
  },
  mob_gone: {
    redirect: [{ if: { flag: 'thrown' }, to: 'betrayal' }],
    on: [{ flag: 'mobGone' }],
    text: ['The last ghost dissolves into the fog, dropping its pitchfork, which dissolves too. The skeleton in the gibbet shakes its head at you and goes back to swaying.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  gates: {
    text: (c) => [
      'Grimsby Hall stands on a rise at the end of the moor: tall, black and in need of a roof. The gates are locked, and the bell rope has rotted through. It is a quarter to midnight.',
      c.flags.betrayed ? 'You have the key to the strongroom, but not the gates.' : '“I lost the key,” says Grimsby, “in 1704.”',
    ],
    choices: [
      { text: 'Pick the lock', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'inside', fail: 'late', if: { item: 'tools' } },
      { text: 'Climb the wall and open it from inside', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'inside', fail: 'late', if: { item: 'climbing' } },
      { text: 'Melt the lock with acid', to: 'inside', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Cast Knock on the lock', cast: 'knock', pass: 'inside', fail: 'late' },
      { text: 'Cast Sundering horn, and bring down the wall', cast: 'sundering', pass: 'walls_down', fail: 'late', critFail: 'maze_hall' },
      { text: 'Lever the gate off its hinges', to: 'inside', if: { anyItem: ['prybar', 'pick'] } },
      { text: 'Throw your rope over the gatepost and climb', test: { stat: 'Str', dd: 8, skill: ['athletics'] }, pass: 'inside', fail: 'late', if: { item: 'rope' } },
      { text: 'Have your ghost army open it for you', to: 'inside', if: { flag: 'ghostArmy' } },
      { text: 'Break it down', test: { stat: 'Str', dd: 12, skill: ['bruteforce'] }, pass: 'inside', fail: 'late' },
    ],
  },
  late: {
    redirect: [{ if: { flag: 'shortcut' }, to: 'late_spare' }, { if: { any: [{ flag: 'peace' }, { flag: 'betrayed' }, { flag: 'mobGone' }] }, to: 'late_safe' }],
    on: [{ flag: 'late' }],
    text: ['Midnight strikes while you’re still struggling with the gate. Behind you, the torches come over the rise.'],
    choices: [{ text: 'Get through the gate however you can', to: 'last_stand' }],
  },
  late_spare: {
    text: ['It takes far too long, but you saved an hour in the bog, and you need most of it. The gate groans open with minutes to spare.'],
    choices: [{ text: 'Inside', to: 'inside' }],
  },
  late_safe: {
    on: [{ flag: 'late' }],
    text: (c) => [c.flags.betrayed ? 'Midnight strikes while you’re still at the gate. It doesn’t matter now. Eventually, the gate groans open.' : 'Midnight strikes while you’re still at the gate, and Grimsby whimpers, but nothing comes out of the fog. There’s nobody left out there to come. Eventually, the gate groans open.'],
    choices: [{ text: 'Inside', to: 'inside' }],
  },
  last_stand: {
    text: ['The mob catches you at the gate. There’s no talking now.'],
    fight: { outdoors: true,
      monsters: [{ ...mob, hp: 24 }], distance: 1, win: 'inside', flee: { to: 'grimsby_hall', label: 'Leave Grimsby to them and run' },
      special: [{ label: 'Throw the bucket of holy water over them', if: { flag: 'holyBucket' }, flag: 'bucketThrown', text: 'A bucket of holy water goes through the front rank of the mob like a scream.', dmg: '4d8' }],
    },
  },
  inside: {
    on: [{ if: { notFlag: 'betrayed' }, flag: 'delivered' }],
    text: (c) => [
      c.flags.betrayed
        ? 'Grimsby Hall is cold and empty, and nobody will ever live in it again. The strongroom is under the stairs.'
        : c.flags.late ? 'It is well past midnight when Grimsby crosses the threshold. “Mine,” he says anyway, without much conviction, and kisses the floor, which is a mistake. The strongroom is under the stairs.'
          : 'The clock in the hall strikes midnight as Grimsby crosses the threshold. “Mine,” he says, and kisses the floor, which is a mistake. The strongroom is under the stairs.',
    ],
    choices: [
      { text: 'Open the strongroom with the skeleton’s key', to: 'strongroom', if: { item: 'strongkey' } },
      { text: 'Pick the strongroom lock while Grimsby is busy kissing the floor', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'strongroom', fail: 'strongroom_caught', if: { item: 'tools' }, show: { notItem: 'strongkey', notFlag: 'betrayed' } },
      { text: 'Cast Knock on the strongroom while Grimsby is busy kissing the floor', cast: 'knock', pass: 'strongroom', fail: 'strongroom_caught', show: { notItem: 'strongkey', notFlag: 'betrayed' } },
      { text: 'Collect your fee and leave', to: 'grimsby_hall', show: { notFlag: 'betrayed' } },
      { text: 'Leave', to: 'grimsby_hall', show: { flag: 'betrayed' } },
    ],
  },
  strongroom_caught: {
    text: ['Your pick snaps in the lock with a ping. Grimsby looks up from the floor. “That,” he says, “is a deduction.” He takes the price of the lock out of your fee, then the price of the pick, then a charge for the inconvenience.'],
    on: [{ flag: 'deducted' }],
    choices: [{ text: 'Take what’s left of your fee', to: 'grimsby_hall' }],
  },
  strongroom: {
    on: [{ lose: 'strongkey' }, { flag: 'deposits' }, { gold: 300, uncapped: true, msg: 'Three hundred years of deposits: 300GP in old coin.' }], onceOnly: true,
    text: ['The strongroom holds three hundred years of other people’s deposits, in labelled bags, with notes about the damp.'],
    choices: [{ text: 'Leave', to: 'grimsby_hall' }],
  },
  grimsby_hall: {
    end: 'victory',
    on: [
      { if: { flag: 'delivered', notFlag: 'deducted' }, gold: 400, uncapped: true, msg: 'Lord Grimsby pays your fee, minus a deduction for wear and tear. Then he puts the deduction back.' },
      { if: { flag: 'delivered', any: [{ flag: 'deducted' }] }, gold: 250, uncapped: true, msg: 'Lord Grimsby pays your fee, minus deductions: 250GP.' },
    ],
    text: (c) => [
      c.flags.delivered
        ? (c.flags.peace ? 'Grimsby Hall is quiet that night, and every night after. The tenants don’t come back. Grimsby frames the apology and hangs it in the hall, where it unsettles visitors.'
          : c.flags.mobGone ? 'Grimsby Hall is quiet that night, and every night after. The tenants are gone for good, and so is the last claim on their deposits. Grimsby is delighted. He never thanks you.'
            : c.flags.ghostArmy ? 'The ghosts stand guard round Grimsby Hall all night on your orders, torches high. Grimsby sits up with a candle, finding this no comfort at all.'
              : c.flags.late ? 'The hall isn’t legally his, and the tenants know it. Grimsby locks every door and sits up all night with a candle while the torches circle the hall till dawn. He’ll be fine. Probably.'
                : 'The hall is legally his now, and the tenants know it. They circle it once with their torches, out of habit, and go back to the moor to wait for the next Grimsby.')
        : c.flags.betrayed ? 'Out on the moor, the torches have gone out. Somewhere in the fog, a lord is still explaining about wear and tear.'
          : 'You leave Grimsby to the mob. He has three hundred years of explaining to do.',
      c.flags.deposits && !c.flags.betrayed ? 'You may not have mentioned the strongroom.' : '',
      `You leave Blackmire Moor with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ].filter(Boolean),
  },
  bucket_fizzle: {
    text: ['You pray over the bucket. The water stays water. Your god is busy.'],
    choices: [{ text: 'Back to the bar', to: 'start' }],
  },
  mob_lit: {
    text: ['Your god scorns you. Instead of darkness, light pours out over you and Grimsby, and you stand in the middle of the road glowing like a pair of lanterns. A hundred ghosts turn to look. “That’s him,” says the skeleton in the gibbet.'],
    choices: [{ text: 'Fight', to: 'mob_fight' }],
  },
  bog_burden: {
    text: ['Your god scorns you. Instead of walking on the bog, you weigh twice what you did, and go into it up to the chest. While Grimsby is pulling you out, by the hair, the bog in front of you stands up.'],
    choices: [{ text: 'Fight it', to: 'blob' }],
  },
  mob_entreated: {
    text: ['Your god scorns you. Instead of fleeing, every dead thing on Blackmire Moor is drawn to the crossroads. The mob turns round. Behind it, more come over the bog: older tenants, and some that were never tenants of anybody.'],
    choices: [{ text: 'Fight', to: 'mob_fight' }],
  },
  maze: {
    on: [{ flag: 'turned' }],
    text: ['The moor folds itself up into a maze of hedges that weren’t there a moment ago. The mob goes into it, torches bobbing, and doesn’t come out. You can hear them for a long time, arguing about left and right. You and Grimsby walk on up the road, which is the only straight line for a mile.'],
    choices: [{ text: 'On to the hall', to: 'gates' }],
  },
  sundered: {
    text: ['Your god scorns you. Instead of a maze, a great horn sounds across the moor and every wall for a mile falls down, including the back of the Tumbledown Inn. There are no walls at the crossroads to speak of. The mob, which has no walls either, comes on.'],
    choices: [{ text: 'Fight', to: 'mob_fight' }],
  },
  walls_down: {
    text: ['A horn sounds from nowhere, and the wall of Grimsby Hall falls down flat, all the way round, like the sides of a box. The gate stands on its own in the middle of nothing, still locked. You walk round it.'],
    choices: [{ text: 'Inside', to: 'inside' }],
  },
  maze_hall: {
    text: ['Your god scorns you. Instead of falling, the walls multiply. The grounds of Grimsby Hall fold into a maze, and it takes you a long time to find your way out of it, on the wrong side.'],
    choices: [{ text: 'Find the gate again', to: 'late' }],
  },
};

export const DEATH_TEXT = [
  'You join the mob. Every night, you rise with a torch and a pitchfork and a grievance, and every night, you want your deposit back.',
  'Your adventure ends here.',
];
