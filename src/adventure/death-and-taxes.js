// DEATH AND TAXES — a Scumbags! gamebook adventure for one level 1 scumbag.
// Sections are written against keys; numbering.js shuffles them into numbered paragraphs, in the traditional gamebook way.
//
// Section fields:
//   text: string[] (or (c) => string[])     on: effects applied on entry     onceOnly: apply `on` only the first time
//   dark: uses up light on entry            rest: a night's rest              end: 'death' | 'quit' | 'victory'
//   fight: { monsters, win, flee: { to, label }, surprise, distance, special, intro }
//   choices: [{ text, to } | { text, test: { stat, dd, skill, save, mods }, pass, fail } | { text, cast, pass, fail }
//             | { text, turn: { dd }, pass, chaos, fail }]  with optional `if` (shown but locked) / `show` (listed only when true).

const peasant = (name, note) => ({ name, lvl: 1, range: 'engaged', note: note || 'Never bathes' });

export const META = {
  id: 'death-and-taxes', title: 'Death and Taxes', levels: '1', final: 'town',
  blurb: 'Usurer Vane died owing nobody anything. Everybody owed him. His counting house under Gallows Hill has been shut for twenty years, and the old map in your hand says the vault is still full.',
};

export const SECTIONS = {
  start: {
    on: [{ gold: 50 }], onceOnly: true,
    text: [
      'The Drowned Rat is the worst tavern in Scumbag Town, which is saying something, because Scumbag Town has a tavern that is literally on fire. You are here for one reason: Old Nobby is selling a map. In your pocket is fifty gold, the proceeds of selling a goat. Your neighbour’s goat.',
      '“The Counting House of Usurer Vane,” he wheezes, tapping the parchment with a finger like a burnt sausage. “Vault’s still full. Fifty gold, and I’ll throw in the directions.” The directions are on the map.',
    ],
    choices: [
      { text: 'Pay him 50GP', to: 'paid', if: { gold: 50 } },
      { text: 'Haggle', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cutpurse'], why: 'a cutpurse knows what stolen goods are worth' }, pass: 'haggle_win', fail: 'haggle_lose' },
      { text: 'Pick his pocket while he’s talking', test: { stat: 'Dex', dd: 8, skill: 'skulduggery' }, pass: 'steal_win', fail: 'steal_caught' },
      { text: 'Go home and live a long, sensible life', to: 'go_home' },
    ],
  },
  go_home: {
    end: 'quit',
    text: ['You go home. Nothing much happens to you, ever. You die aged ninety-four, surrounded by people who never really knew you.', 'This is the most sensible ending in the book. THE END.'],
  },
  paid: {
    on: [{ gold: -50 }, { item: 'map' }],
    text: ['Nobby bites each coin, pockets the lot and slides the map across the table. “Pleasure doing business,” he says, and leaves through the window.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  haggle_win: {
    on: [{ gold: -20 }, { item: 'map' }],
    text: ['You point out the coffee ring, the mouse droppings and the fact that the map is signed “Nobby”. He accepts twenty gold and a promise never to speak of this.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  haggle_lose: {
    on: [{ gold: -50 }, { item: 'map' }],
    text: ['Nobby listens politely, then raises the price to sixty. You end up paying fifty and thanking him for it. You are not sure how.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  steal_win: {
    on: [{ item: 'map' }],
    text: ['While Nobby describes the vault in loving detail, the map migrates from his coat to yours. He is still describing it as you leave.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  steal_caught: {
    text: ['Nobby’s hand clamps on your wrist. “Terry,” he says mildly. Something the size of a wardrobe stands up at the next table. Big Terry is Nobby’s nephew. He has never bathed, and he is not going to start now.'],
    fight: { monsters: [peasant('Big Terry', 'Never bathes; Nobby’s nephew')], win: 'steal_after', flee: { to: 'steal_fled', label: 'Grab the map and run' } },
  },
  steal_after: {
    on: [{ item: 'map' }, { gold: 5, msg: 'Terry’s pockets contain 5GP and a boiled egg. You leave the egg.' }], onceOnly: true,
    text: ['Nobby sighs, hands over the map and steps over his nephew on the way to the bar. “Kids,” he says.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  steal_fled: {
    on: [{ item: 'map' }],
    text: ['You snatch the map and dive through the door, with Terry’s fist arriving where your head used to be. Nobody follows. Nobody at the Drowned Rat ever follows anyone.'],
    choices: [{ text: 'Set off for Gallows Hill', to: 'road' }],
  },
  road: {
    text: [
      'Gallows Hill is half a day’s walk, most of it uphill and all of it muddy. At the crossroads beneath the old gibbet stands a man in very tight trousers, holding a glowing slate up to the sky and turning slowly on the spot.',
      '“Do you have any signal?” he asks. “I need to be back by 2023. I have a board meeting.”',
    ],
    choices: [
      { text: 'Talk to him', to: 'traveller_talk' },
      { text: 'Rob him', to: 'traveller_fight' },
      { text: 'Walk past, quickly', to: 'hill' },
    ],
  },
  traveller_talk: {
    text: ['He introduces himself as a disruptor. You aren’t sure what he disrupts, but it seems to be mostly his own life. He wants to know where the nearest “hub” is.'],
    choices: [
      { text: 'Explain, kindly, that there is no signal and never will be', test: { stat: 'Cha', dd: 4, skill: ['social', 'languages'] }, pass: 'traveller_friend', fail: 'traveller_bored' },
      { text: 'Rob him after all', to: 'traveller_fight' },
      { text: 'Leave him to it', to: 'hill' },
    ],
  },
  traveller_friend: {
    on: [{ item: 'ipad' }, { item: 'card' }], onceOnly: true,
    text: ['He takes it surprisingly well. “No signal. No board meeting.” He presses the glowing slate and a little card into your hands. “Take it. It still glows, sort of. It’s at three per cent. That’s all of us, really, isn’t it?” He walks off into the fields to found a commune.'],
    choices: [{ text: 'Climb Gallows Hill', to: 'hill' }],
  },
  traveller_bored: {
    text: ['He tells you about his company for an hour. It is a company that sells nothing to nobody, and it is worth a billion of something. When you finally escape, the sun has moved noticeably.'],
    choices: [{ text: 'Climb Gallows Hill', to: 'hill' }],
  },
  traveller_fight: {
    text: ['He backs away, fumbling at his belt, and produces a small black crossbow with no string. “I don’t want to use this,” he says, and then uses it. It goes BANG.'],
    fight: {
      monsters: [{ name: 'Clueless time-traveller', lvl: 1, range: 'long', feats: ['handgun'], dmg: '2d6+lvl', note: 'Venture-capitalist; iPad; handgun (2d6+lvl damage)' }],
      distance: 2, win: 'traveller_loot', flee: { to: 'hill', label: 'Run up the hill' },
    },
  },
  traveller_loot: {
    on: [{ gold: 25 }, { item: 'ipad' }], onceOnly: true,
    text: ['His purse holds 25 gold and some very small, very thin coins with a woman’s head on them. The bang-crossbow is jammed for good. The glowing slate still glows.'],
    choices: [{ text: 'Climb Gallows Hill', to: 'hill' }],
  },
  hill: {
    text: [
      'The Counting House of Usurer Vane is built into the side of Gallows Hill like a tick into a dog. Its iron front door has a brass plaque. Above, a crooked chimney leaks a thin line of smoke, which is odd for a building shut for twenty years. Lower down the slope, a sewer outflow drips into a ditch.',
    ],
    choices: [
      { text: 'Knock at the front door', to: 'front_door' },
      { text: 'Climb down the chimney', to: 'chimney' },
      { text: 'Try the sewer grate', to: 'sewer' },
      { text: 'Cast Divine light on your holy symbol', cast: 'light', pass: 'hill_lit', fail: 'hill_fizzle', show: { notFlag: 'lit' } },
    ],
  },
  hill_lit: {
    on: [{ flag: 'lit' }, { lightCharges: 4, msg: 'Your holy symbol glows like a lantern. It will light the next four dark places you enter.' }],
    text: ['Law smiles on you, briefly and without enthusiasm.'],
    choices: [{ text: 'Back to the hillside', to: 'hill' }],
  },
  hill_fizzle: {
    on: [{ flag: 'lit' }],
    text: ['Your god is busy. The holy symbol stays resolutely dull.'],
    choices: [{ text: 'Back to the hillside', to: 'hill' }],
  },
  front_door: {
    text: (c) => [
      'The brass plaque reads: VANE & NOBODY, MONEYLENDERS. STRICTLY BY APPOINTMENT.',
      c.flags.bureaucratDead ? 'The hatch hangs open. Nobody is home, because you killed him.' : 'A hatch slides open at eye level. A pair of spectacles and a moustache regard you. “Name? Appointment? Form 7B?” says the moustache.',
    ],
    choices: [
      { text: 'Go in', to: 'hall', show: { flag: 'bureaucratDead' } },
      { text: 'Fill in Form 7B', to: 'front_form', if: { item: 'quill' }, show: { notFlag: 'bureaucratDead' } },
      { text: 'Tell him you’re the new auditor', test: { stat: 'Cha', dd: 8, skill: 'lying' }, pass: 'front_lie_win', fail: 'front_lie_fail', show: { notFlag: 'bureaucratDead' } },
      { text: 'Hand him the time-traveller’s business card', to: 'front_card', if: { item: 'card' }, show: { notFlag: 'bureaucratDead' } },
      { text: 'Pick the lock while he looks for a form', test: { stat: 'Dex', dd: 8, skill: 'skulduggery' }, pass: 'front_picked', fail: 'front_fight', if: { item: 'tools' }, show: { notFlag: 'bureaucratDead' } },
      { text: 'Cast Shroud and slip in under a cloak of darkness', cast: 'shroud', pass: 'front_shroud', fail: 'front_door', show: { notFlag: 'bureaucratDead' } },
      { text: 'Kick the door in', test: { stat: 'Str', dd: 12, skill: 'bruteforce' }, pass: 'front_fight', fail: 'front_kick_fail', show: { notFlag: 'bureaucratDead' } },
      { text: 'Go round the back', to: 'hill' },
    ],
  },
  front_form: {
    on: [{ flag: 'appointment' }],
    text: ['You fill in all eleven pages of Form 7B, including the bit marked OFFICE USE ONLY. He stamps it with a stamp that says APPROVED, then with a second stamp that says APPROVAL PENDING, and then lets you in. “Mind the ghost,” he says, and returns to his crossword.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  front_card: {
    on: [{ flag: 'appointment' }],
    text: ['“Thought leader,” he reads. “Disruptor.” His moustache quivers with something like awe. “Of course, sir. Madam. Leader.” The door opens. He bows you through and goes back to pretending to work, which is his real job.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  front_lie_win: {
    on: [{ flag: 'auditor' }],
    text: ['The moustache goes white. The door flies open. “Everything’s in order,” he squeaks. “Everything is in order. Take as long as you like. Take anything you like.” He shuts himself in a cupboard.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  front_lie_fail: {
    text: ['“The auditor,” he says flatly, “is me.” He takes off his spectacles, folds them, and produces a rubber stamp the size of a brick.'],
    choices: [{ text: 'Defend yourself', to: 'front_fight' }],
  },
  front_picked: {
    on: [{ flag: 'sneaked' }],
    text: ['The lock gives with a click. By the time the moustache comes back with Form 7B, the doorstep is empty and he assumes you were never there. Fair enough.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  front_shroud: {
    on: [{ flag: 'sneaked' }],
    text: ['Darkness pours out of your sleeves like smoke. The moustache says “Who turned the lights off?” and goes to fill in a form about it. You walk straight past him.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  front_kick_fail: {
    on: [{ damage: 'd4', from: 'Your foot' }],
    text: ['The iron door doesn’t notice. Your foot does. The moustache writes something down.'],
    choices: [{ text: 'Try something else', to: 'front_door' }],
  },
  front_fight: {
    text: ['The door bangs open, and the moustache turns out to be attached to a militant bureaucrat: cardigan, sleeve garters and a look of absolute procedural fury. He hurls rubber stamps with terrifying accuracy.'],
    fight: {
      monsters: [{ name: 'Militant bureaucrat', lvl: 2, range: 'medium', feats: ['dealD6', 'approval'], note: 'Deals +d6 damage; actions take 1 round to be approved' }],
      distance: 1, win: 'front_win', flee: { to: 'hill', label: 'Retreat down the hill' },
    },
  },
  front_win: {
    on: [{ flag: 'bureaucratDead' }, { gold: 15, msg: 'In his cardigan: 15GP of petty cash, receipted.' }], onceOnly: true,
    text: ['The bureaucrat signs one last form, in his own blood, and expires. It is a resignation letter.'],
    choices: [{ text: 'Go inside', to: 'hall' }],
  },
  chimney: {
    text: ['The chimney is wide, crooked and warm. Somebody below is cooking.'],
    choices: [{
      text: 'Climb down', test: { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Woodcutter'], why: 'woodcutters climb for a living', mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'kitchen_arrive', fail: 'chimney_fall',
    }, { text: 'Think better of it', to: 'hill' }],
  },
  chimney_fall: {
    on: [{ damage: 'd6', from: 'The fall' }],
    text: ['You arrive in the kitchen faster than you planned, bottom first, in a cloud of soot.'],
    choices: [{ text: 'Dust yourself off', to: 'kitchen' }],
  },
  kitchen_arrive: {
    text: ['You drop neatly into the hearth beside a bubbling pot. The cook was not expecting you, and neither was the soup.'],
    choices: [{ text: 'Look around', to: 'kitchen' }],
  },
  kitchen: {
    text: (c) => c.flags.chefDead
      ? ['The kitchen is quiet now. The soup has gone cold. You feel bad about the chef, which is unusual for you.']
      : ['A homunculus stands on a stool, stirring a pot almost as big as he is. He is about a foot tall, round as a turnip and wearing a tiny chef’s hat. He is, unfortunately, adorable. “Soup?” he asks.'],
    choices: [
      { text: 'Chat with the chef', test: { stat: 'Cha', dd: 4, skill: 'social' }, pass: 'chef_talk', fail: 'chef_snub', show: { notFlag: 'chefDead' } },
      { text: 'Have some soup', test: { stat: 'Con', dd: 8, save: true, skill: ['medicine'], why: 'medicine covers identifying poisons', mods: [{ if: { feature: 'noPoison' }, auto: true, text: 'Sottish: you ignore simple poisons. And this is a simple poison.' }] }, pass: 'soup_good', fail: 'soup_bad', show: { notFlag: 'chefDead' } },
      { text: 'Attack the chef', to: 'chef_fight', show: { notFlag: 'chefDead' } },
      { text: 'Go through to the great hall', to: 'hall' },
    ],
  },
  chef_talk: {
    on: [{ flag: 'hintLedger' }],
    text: ['He has cooked for the master for fifty years, the last twenty of them since the master died. “He still comes up for soup. Well, he doesn’t eat it. He just counts the croutons.” He lowers his voice. “He can’t stop counting while that ledger of his is whole. Burn it and he’ll have nothing left to count.”'],
    choices: [{ text: 'Thank him and go through to the great hall', to: 'hall' }],
  },
  chef_snub: {
    text: ['He takes against you, as small creatures sometimes do. “Hall’s through there,” he says, and turns his back. He has a very small back.'],
    choices: [{ text: 'Go through to the great hall', to: 'hall' }],
  },
  soup_good: {
    on: [{ heal: '2d6' }],
    text: ['It is the best soup you’ve ever had. There are bits in it. You don’t ask.'],
    choices: [{ text: 'Go through to the great hall', to: 'hall' }],
  },
  soup_bad: {
    on: [{ damage: 'd4', from: 'The soup' }],
    text: ['“Oh,” says the chef. “That was the master’s. It’s for ghosts. Should’ve said.” You spend some time in the corner.'],
    choices: [{ text: 'Stagger into the great hall', to: 'hall' }],
  },
  chef_fight: {
    text: ['He looks at you with enormous, wet eyes and picks up a ladle.'],
    fight: { monsters: [{ name: 'Homunculus', lvl: 1, range: 'short', feats: ['magicImmune'], note: 'Adorable; immune to magic' }], win: 'chef_win' },
  },
  chef_win: {
    on: [{ flag: 'chefDead' }, { gold: 5, msg: 'His tiny savings: 5GP, in a tiny sock.' }], onceOnly: true,
    text: ['It’s done. You wipe the ladle and put it back. You were going to be a monster eventually; you didn’t think it would be today.'],
    choices: [{ text: 'Go through to the great hall', to: 'hall' }],
  },
  sewer: {
    text: ['The grate is rusted into its frame. Behind it, a tunnel leads up into the hill and smells exactly how you’d expect.'],
    choices: [
      { text: 'Lever it open with your pry bar', to: 'sewer_in', if: { item: 'prybar' } },
      { text: 'Wrench it open', test: { stat: 'Str', dd: 8, skill: 'bruteforce' }, pass: 'sewer_in', fail: 'sewer_strain' },
      { text: 'Go back up the slope', to: 'hill' },
    ],
  },
  sewer_strain: {
    on: [{ damage: '1', from: 'Something in your back' }],
    text: ['Something goes ping. It isn’t the grate.'],
    choices: [{ text: 'Try again', to: 'sewer' }],
  },
  sewer_in: {
    dark: true,
    text: ['The tunnel opens into a cistern. Squatting at the edge of the black water, gutting a rat with her teeth, is a fishwife: gills, scales, an apron and arms like hams. She smells of the sea, which is eighty miles away.'],
    choices: [
      { text: 'Offer her some of your rations', to: 'fishwife_fed', if: { item: 'rations' } },
      { text: 'Sneak along the wall', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], profs: ['Hunter'], why: 'a hunter knows how to stalk' }, pass: 'cellar', fail: 'fishwife_fight' },
      { text: 'Cast Abundance and offer her the food', cast: 'abundance', pass: 'fishwife_fed', fail: 'fishwife_fight' },
      { text: 'Cast Pollute and turn her cistern to oil', cast: 'pollute', pass: 'pollute_win', fail: 'fishwife_fight' },
      { text: 'Attack her while she’s busy', to: 'fishwife_ambush' },
      { text: 'Back out of the tunnel', to: 'hill' },
    ],
  },
  fishwife_fed: {
    on: [{ flag: 'hintLedger' }, { item: 'potion', msg: 'She gives you a jar of pickled eels. They are, she insists, medicinal. (Healing potion.)' }], onceOnly: true,
    text: ['She eats the food, the wrapping and very nearly your hand, and decides she likes you. “Old Vane’s still down there, you know. Counting. Can’t stop while his ledger’s whole.” She taps her nose, which falls off. She puts it back.'],
    choices: [{ text: 'Climb the steps out of the cistern', to: 'cellar' }],
  },
  pollute_win: {
    on: [{ item: 'oil', msg: 'You fill a flask from the edge of the cistern. (Flask of oil.)' }], onceOnly: true,
    text: ['The black water turns blacker and thicker. The fishwife surfaces, gasping, coated head to tail, and flees down the tunnel making a noise like a blocked drain. You feel slightly bad. Only slightly.'],
    choices: [{ text: 'Climb the steps out of the cistern', to: 'cellar' }],
  },
  fishwife_ambush: {
    text: ['You creep up behind her, weapon raised.'],
    fight: { monsters: [{ name: 'Fishwife', lvl: 2, range: 'short', feats: ['vomit'], note: 'Gills; on hit, d4 Dex save or fall prone (slippery vomit attack)' }], surprise: true, win: 'fishwife_win', flee: { to: 'hill', label: 'Run back out of the tunnel' } },
  },
  fishwife_fight: {
    text: ['She turns, sees you, and opens her mouth far wider than a mouth should go.'],
    fight: { monsters: [{ name: 'Fishwife', lvl: 2, range: 'short', feats: ['vomit'], note: 'Gills; on hit, d4 Dex save or fall prone (slippery vomit attack)' }], win: 'fishwife_win', flee: { to: 'hill', label: 'Run back out of the tunnel' } },
  },
  fishwife_win: {
    on: [{ gold: 10, msg: 'Her apron pocket holds 10GP and a lot of scales.' }], onceOnly: true,
    text: ['The fishwife slides back into the black water with a sound like a dropped haddock.'],
    choices: [{ text: 'Climb the steps out of the cistern', to: 'cellar' }],
  },
  cellar: {
    text: ['Steps climb from the cistern into a wine cellar. Every dusty bottle is labelled TAX, in Vane’s spidery hand. At the far end, a staircase leads up into the house.'],
    choices: [
      { text: 'Help yourself to the tax wine', test: { stat: 'Con', dd: 6, save: true, mods: [{ if: { feature: 'noPoison' }, auto: true, text: 'Sottish: you could drink this all day. You very nearly do.' }] }, pass: 'wine_good', fail: 'wine_bad', show: { notFlag: 'wine' } },
      { text: 'Go upstairs', to: 'hall' },
    ],
  },
  wine_good: {
    on: [{ flag: 'wine' }, { heal: 'd6' }],
    text: ['A full-bodied red with notes of other people’s money. You feel tremendous.'],
    choices: [{ text: 'Go upstairs', to: 'hall' }],
  },
  wine_bad: {
    on: [{ flag: 'wine' }, { damage: '2', from: 'The wine' }],
    text: ['It has turned to vinegar, and then to something beyond vinegar. You see colours.'],
    choices: [{ text: 'Go upstairs, carefully', to: 'hall' }],
  },
  hall: {
    text: (c) => [
      'The great hall of the Counting House is thick with dust and silence. Moth-eaten tapestries show Vane foreclosing on things: farms, families, a small church. From the ceiling hangs a chandelier made entirely of coins.',
      'Doors lead west to a library and east to a long gallery. A narrow door to the north is marked CHIEF CLERK. A stone stair spirals down into the dark.',
      c.flags.chandelier ? 'The chandelier is somewhat less golden than it was.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Climb up and pick coins off the chandelier', test: { stat: 'Dex', dd: 12, skill: ['athletics'], profs: ['Cutpurse', 'Woodcutter'], mods: [{ if: { anyItem: ['rope', 'climbing', 'pole'] }, dd: 8 }] }, pass: 'chandelier_win', fail: 'chandelier_fall', show: { notFlag: 'chandelier' } },
      { text: 'Go into the library', to: 'library' },
      { text: 'Go into the gallery', to: 'gallery' },
      { text: 'Open the Chief Clerk’s door', to: 'office' },
      { text: 'Take the stair down', to: 'vault_stairs' },
      { text: 'Cast Bless on the water in your rations', cast: 'bless', pass: 'hall_bless', fail: 'hall', if: { item: 'rations' }, show: { notFlag: 'blessed' } },
      { text: 'Leave with what you’ve got', to: 'town' },
    ],
  },
  hall_bless: {
    on: [{ flag: 'blessed' }, { item: 'holywater' }],
    text: ['The water in your flask begins to glow faintly and taste of church. It is now holy water, which ought to make a ghost think twice.'],
    choices: [{ text: 'Back to the great hall', to: 'hall' }],
  },
  chandelier_win: {
    on: [{ flag: 'chandelier' }, { gold: 40 }],
    text: ['You hang off the chandelier like a greedy monkey, prising coins out of their sockets with your teeth. It sways alarmingly, but holds.'],
    choices: [{ text: 'Climb down', to: 'hall' }],
  },
  chandelier_fall: {
    on: [{ flag: 'chandelier' }, { damage: 'd6', from: 'The floor' }, { gold: 10, msg: 'You keep the handful you were holding: 10GP.' }],
    text: ['The chain snaps. You and the chandelier reach the floor together. The chandelier comes off better.'],
    choices: [{ text: 'Pick yourself up', to: 'hall' }],
  },
  library: {
    dark: true,
    text: ['Ledgers fill the shelves from floor to ceiling: every debt Vane ever owned, and he owned all of them. One shelf is different. A single fat book with a gilt spine reads TOME RAIDER, and it is breathing.'],
    choices: [
      { text: 'Search the shelves for anything useful', test: { stat: 'Int', dd: 8, skill: ['analysis', 'languages'], why: 'reading old ledgers' }, pass: 'library_found', fail: 'mimic_fight', show: { notFlag: 'combo' } },
      { text: 'Stab the suspicious book', to: 'mimic_ambush', show: { notFlag: 'mimicDead' } },
      { text: 'Leave the library', to: 'hall' },
    ],
  },
  mimic_ambush: {
    text: ['You drive your weapon into the spine. It shrieks, and its pages turn out to be teeth.'],
    fight: { monsters: [{ name: 'Book-mimic', lvl: 2, range: 'engaged', note: 'Can fly; title is a pun' }], surprise: true, win: 'mimic_win', flee: { to: 'hall', label: 'Slam the library door' } },
  },
  mimic_fight: {
    text: ['As you reach for the shelf, TOME RAIDER flaps open and launches itself at your face.'],
    fight: { monsters: [{ name: 'Book-mimic', lvl: 2, range: 'engaged', note: 'Can fly; title is a pun' }], win: 'mimic_win', flee: { to: 'hall', label: 'Slam the library door' } },
  },
  mimic_win: {
    on: [{ flag: 'mimicDead' }, { gold: 20, msg: 'Pressed between its pages: 20GP, and a bookmark.' }], onceOnly: true,
    text: ['The book-mimic flops shut for the last time. Its sequel, TOME RAIDER II: THE CRADLE OF BITE, is on the shelf next to it, but it seems to be just a book.'],
    choices: [
      { text: 'Search the shelves', test: { stat: 'Int', dd: 8, skill: ['analysis', 'languages'], why: 'reading old ledgers' }, pass: 'library_found', fail: 'library_nothing', show: { notFlag: 'combo' } },
      { text: 'Leave the library', to: 'hall' },
    ],
  },
  library_nothing: {
    text: ['You read about four thousand debts. None of them are useful, though you do find out who in town owes money to a ghost.'],
    choices: [{ text: 'Leave the library', to: 'hall' }],
  },
  library_found: {
    on: [{ flag: 'combo' }, { flag: 'hintLedger' }],
    text: ['Behind the ledgers is a little notebook in Vane’s hand: VAULT — DIAL TO THE NUMBER OF DEBTS FORGIVEN. Under that, three zeroes. Under that, a note to self: “Ledger must never be burnt. If ledger is burnt I will have nothing to count and must REST.” He underlined REST four times.'],
    choices: [{ text: 'Leave the library', to: 'hall' }],
  },
  gallery: {
    text: (c) => c.flags.knightGone
      ? ['The gallery is quiet. The portraits of debtors look down at you, and the empty plinth at the end looks down at nothing.']
      : [
        'Portraits of debtors line the gallery, each labelled with what they owed and what Vane took instead. At the far end, on a plinth marked COLLATERAL, stands a knight in full armour, rusted solid. A fat purse hangs on the wall behind him.',
        'The visor squeaks open. “Sir Reginald Overdraft,” says a hollow voice. “Pledged against a loan of twenty gold, in the year of the wet harvest. I am to guard this gallery until the debt is paid.” He has been standing there for forty-one years.',
      ],
    choices: [
      { text: 'Pay off his debt', to: 'knight_paid', if: { gold: 20 }, effects: [{ gold: -20 }], show: { notFlag: 'knightGone' } },
      { text: 'Point out that his creditor is dead', test: { stat: 'Cha', dd: 8, skill: ['social', 'languages'], profs: ['Cleric', 'Missionary'], why: 'clerics and missionaries are good at telling people they are free' }, pass: 'knight_freed', fail: 'knight_fight', show: { notFlag: 'knightGone' } },
      { text: 'Creep past him to the purse', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'gallery_purse', fail: 'knight_fight', show: { notFlag: 'knightGone' } },
      { text: 'Fight him', to: 'knight_fight', show: { notFlag: 'knightGone' } },
      { text: 'Take the purse', to: 'gallery_purse', show: { flag: 'knightGone' } },
      { text: 'Go back to the great hall', to: 'hall' },
    ],
  },
  knight_paid: {
    on: [{ flag: 'knightGone' }],
    text: ['You count twenty gold into his gauntlet. He looks at it for a long time. “Paid,” he says, and climbs down off the plinth with a noise like a dropped kitchen. “I am free. I shall go home.” He bows, takes the purse off the wall, hands it to you, and clanks away to find out what year it is.'],
    choices: [{ text: 'Open the purse', to: 'gallery_purse' }],
  },
  knight_freed: {
    on: [{ flag: 'knightGone' }],
    text: ['You explain, gently, that Vane has been dead for twenty years and that a contract with a dead man is a contract with nobody. Sir Reginald thinks about this for a full minute. Then he weeps, loudly, inside his helmet, thanks you, and clanks off into the dark to find his wife, who has remarried twice.'],
    choices: [{ text: 'Take the purse', to: 'gallery_purse' }],
  },
  knight_fight: {
    text: ['“Theft from the collateral,” booms Sir Reginald, “is a breach of contract.” He steps down from the plinth and draws a sword that has rusted into a sort of club.'],
    fight: {
      monsters: [{ name: 'Sir Reginald Overdraft', lvl: 2, hp: 6, range: 'engaged', ap: 6, note: 'Defaulted knight, forty-one years without lunch (6 HP); repossessed plate armour (6 AP)' }],
      win: 'knight_win', flee: { to: 'hall', label: 'Run back to the hall' },
    },
  },
  knight_win: {
    on: [{ flag: 'knightGone' }],
    text: ['Sir Reginald topples off his plinth with a final clang. “Default,” he whispers, “at last.” His armour is too rusty to sell, which is the only reason you don’t.'],
    choices: [{ text: 'Take the purse', to: 'gallery_purse' }],
  },
  gallery_purse: {
    on: [{ gold: 30 }, { item: 'salve', msg: 'There’s a pot of clotting salve in the purse too. Someone here was planning ahead.' }], onceOnly: true,
    text: ['The purse is heavy and the leather is good. You have no idea whose it was, and you plan to keep it that way.'],
    choices: [{ text: 'Go back to the great hall', to: 'hall' }],
  },
  office: {
    text: (c) => [
      'The Chief Clerk’s office holds a desk, a chair, a coat stand and a framed certificate for Most Punctual Clerk, 1,000 Years Running. The desk has one drawer and one lock.',
      c.flags.auditor ? 'There’s a note on the desk in a shaky hand: “For the Auditor. With compliments. Please don’t.”' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Read the note for the auditor', to: 'office_drawer', show: { flag: 'auditor' } },
      { text: 'Pick the lock', test: { stat: 'Dex', dd: 8, skill: 'skulduggery' }, pass: 'office_drawer', fail: 'office_jam', if: { item: 'tools' }, show: { notFlag: 'drawer' } },
      { text: 'Lever it open', test: { stat: 'Str', dd: 4, skill: 'bruteforce' }, pass: 'office_drawer', fail: 'office_noise', if: { item: 'prybar' }, show: { notFlag: 'drawer' } },
      { text: 'Smash it open', test: { stat: 'Str', dd: 12, skill: 'bruteforce' }, pass: 'office_drawer', fail: 'office_noise', show: { notFlag: 'drawer' } },
      { text: 'Melt the lock with acid', to: 'office_drawer', if: { item: 'acid' }, effects: [{ lose: 'acid' }], show: { notFlag: 'drawer' } },
      { text: 'Go back to the great hall', to: 'hall' },
    ],
  },
  office_jam: {
    text: ['Your pick snaps off in the lock. Well. That’s that, then, unless you’d like to hit it.'],
    choices: [
      { text: 'Smash it open', test: { stat: 'Str', dd: 12, skill: 'bruteforce' }, pass: 'office_drawer', fail: 'office_noise' },
      { text: 'Go back to the great hall', to: 'hall' },
    ],
  },
  office_noise: {
    on: [{ damage: 'd4', from: 'The desk' }],
    text: (c) => c.flags.impDead
      ? ['The desk wins. Something in your hand goes crunch, and the drawer doesn’t move.']
      : ['The desk wins. Something in your hand goes crunch, and the drawer doesn’t move. The racket wakes something in the inkwell. A small black shape climbs out, dripping, holding a quill like a spear and a contract like a shield. It is an inkwell imp, and it would very much like your signature.'],
    fight: {
      unless: { flag: 'impDead' },
      monsters: [{ name: 'Inkwell imp', lvl: 1, range: 'short', feats: ['contract'], note: 'Flicks ink from short range; on hit, d4 Cha save or you’ve signed something (lose 10GP)' }],
      win: 'imp_win', flee: { to: 'hall', label: 'Run back to the hall' },
    },
    choices: [{ text: 'Try again', to: 'office' }, { text: 'Go back to the great hall', to: 'hall' }],
  },
  imp_win: {
    on: [{ flag: 'impDead' }],
    text: ['The imp bursts into a puddle of ink and a smell of sealing wax. Among the splashes is a contract with your name on it, which you eat, to be safe.'],
    choices: [{ text: 'Try the drawer again', to: 'office' }, { text: 'Go back to the great hall', to: 'hall' }],
  },
  office_drawer: {
    on: [{ flag: 'drawer' }, { item: 'vaultkey' }, { gold: 25, msg: 'Under the key: 25GP in a tin marked BRIBES (INCOMING).' }], onceOnly: true,
    text: ['The drawer slides open. Inside, on a velvet cushion, lies an iron key stamped VAULT. Vane trusted nobody, but he did trust his clerk, and his clerk trusted cushions.'],
    choices: [{ text: 'Go back to the great hall', to: 'hall' }],
  },
  vault_stairs: {
    dark: true,
    text: (c) => c.flags.assessorsGone
      ? ['The stair winds down to the antechamber and the round iron door. Nobody is collecting tolls now.']
      : ['The stair winds down a long way. At the bottom, in front of a round iron door, two tiny men in tiny armour stand guard, each about a foot tall. One holds a spear like a knitting needle; the other, a bow like a wishbone. “Halt,” says one. “Toll,” says the other. “Ten gold.”'],
    choices: [
      { text: 'Show them your approved Form 7B', to: 'vault_door', if: { flag: 'appointment' }, show: { notFlag: 'assessorsGone' }, effects: [{ flag: 'assessorsGone' }] },
      { text: 'Pay the toll', to: 'vault_door', if: { gold: 10 }, effects: [{ gold: -10 }, { flag: 'assessorsGone' }], show: { notFlag: 'assessorsGone' } },
      { text: 'Throw your voice back up the stair: “Toll-dodger!”', cast: 'voice', pass: 'voice_win', fail: 'assessors_fight', show: { notFlag: 'assessorsGone' } },
      { text: 'Refuse', to: 'assessors_fight', show: { notFlag: 'assessorsGone' } },
      { text: 'Go on to the vault door', to: 'vault_door', show: { flag: 'assessorsGone' } },
      { text: 'Go back up', to: 'hall' },
    ],
  },
  voice_win: {
    on: [{ flag: 'assessorsGone' }],
    text: ['“TOLL-DODGER!” cries a voice from the top of the stairs, which sounds a lot like yours. The little assessors look at each other, then charge up the stairs at shin height, shouting about penalties. They do not come back.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  assessors_fight: {
    text: ['“Then you’re assessed,” says the spearman, and they charge, roughly at shin height.'],
    fight: {
      monsters: [
        { name: '1ft warrior', lvl: 1, hp: 3, range: 'engaged', feats: ['tiny'], note: '+2 to tests when being attacked; 3 HP' },
        { name: '1ft archer', lvl: 1, hp: 3, range: 'short', feats: ['tiny'], note: '+2 to tests when being attacked; 3 HP' },
      ],
      win: 'assessors_win', flee: { to: 'hall', label: 'Run back up the stair' },
    },
  },
  assessors_win: {
    on: [{ flag: 'assessorsGone' }, { gold: 2, msg: 'Their combined wages: 2GP, in tiny coins.' }], onceOnly: true,
    text: ['You stand over the little assessors, feeling enormous in every sense.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  vault_door: {
    text: ['The vault door is a disc of black iron as tall as two men, with a dial in the middle and a keyhole beneath it. Someone has scratched NO REFUNDS into the metal.'],
    choices: [
      { text: 'Use the iron key', to: 'vault', if: { item: 'vaultkey' } },
      { text: 'Turn the dial to zero, zero, zero', to: 'vault', if: { flag: 'combo', flagText: 'the combination' } },
      { text: 'Melt the lock with acid', to: 'vault', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Pick the lock', test: { stat: 'Dex', dd: 12, skill: 'skulduggery' }, pass: 'vault', fail: 'vault_needle', if: { item: 'tools' } },
      { text: 'Try to force it', test: { stat: 'Str', dd: 20, skill: 'bruteforce' }, pass: 'vault', fail: 'vault_strain' },
      { text: 'Go back up', to: 'hall' },
    ],
  },
  vault_needle: {
    on: [{ damage: 'd4', from: 'A poisoned needle' }],
    text: ['A little needle springs out of the keyhole and into your thumb. You suck it. It tastes of ink.'],
    choices: [{ text: 'Back to the door', to: 'vault_door' }],
  },
  vault_strain: {
    on: [{ damage: 'd4', from: 'The door' }],
    text: ['You heave until your vision goes red. The door remains a door.'],
    choices: [{ text: 'Back to the door', to: 'vault_door' }],
  },
  vault: {
    text: ['The door swings open on a room full of gold: chests of it, sacks of it, heaps of it on the floor like snowdrifts. At a desk in the middle sits Usurer Vane, or what’s left of him. He is grey, translucent and counting. An enormous ledger lies open in front of him, and he moves a finger down it, line by line, forever.', 'He hasn’t looked up. Yet.'],
    choices: [
      { text: 'Introduce yourself as the auditor', test: { stat: 'Cha', dd: 12, skill: 'lying' }, pass: 'vault_bluffed', fail: 'vault_fight', if: { flag: 'auditor' } },
      { text: 'Pay your taxes', to: 'vault_taxes', if: { gold: 50 }, effects: [{ gold: -50 }] },
      { text: 'Turn him', turn: { dd: 6 }, pass: 'vault_turned', chaos: 'vault_obeys', fail: 'vault_fight', if: { magic: 'divine' } },
      { text: 'Sneak over and set fire to the ledger', test: { stat: 'Dex', dd: 8, skill: 'skulduggery' }, pass: 'vault_burnt', fail: 'vault_fight', if: { fire: true } },
      { text: 'Attack him while he counts', to: 'vault_ambush' },
    ],
  },
  vault_fight: {
    text: ['The ghost looks up. His eyes are two copper pennies. “You,” he whispers, “are in ARREARS.” He rises, and his hands are cold enough to burn.'],
    fight: {
      monsters: [{ name: 'Ghost of Usurer Vane', lvl: 3, range: 'engaged', feats: ['undead'], regen: 1, regenStop: 'ledgerBurnt', note: 'Undead; heals 1 HP a round while his ledger is whole' }],
      win: 'vault_won', flee: { to: 'hall', label: 'Run for the stairs' },
      special: [{ flag: 'ledgerBurnt', label: 'Set fire to the ledger', if: { fire: true }, text: 'The ledger goes up like a bonfire of receipts. Vane screams. He has nothing left to count.' }],
    },
  },
  vault_ambush: {
    text: ['You come at him from behind while he’s mid-column.'],
    fight: {
      monsters: [{ name: 'Ghost of Usurer Vane', lvl: 3, range: 'engaged', feats: ['undead'], regen: 1, regenStop: 'ledgerBurnt', note: 'Undead; heals 1 HP a round while his ledger is whole' }],
      surprise: true, win: 'vault_won', flee: { to: 'hall', label: 'Run for the stairs' },
      special: [{ flag: 'ledgerBurnt', label: 'Set fire to the ledger', if: { fire: true }, text: 'The ledger goes up like a bonfire of receipts. Vane screams. He has nothing left to count.' }],
    },
  },
  vault_burnt: {
    on: [{ flag: 'ledgerBurnt' }],
    text: ['The ledger catches, curls and blazes. Vane leaps up, clutching at the burning pages. “My accounts! My beautiful accounts!” With nothing left to count, he begins to fade, but he is not going quietly.'],
    fight: {
      monsters: [{ name: 'Ghost of Usurer Vane', lvl: 3, range: 'engaged', feats: ['undead'], hp: 8, note: 'Undead; fading fast' }],
      win: 'vault_won', flee: { to: 'hall', label: 'Run for the stairs' },
    },
  },
  vault_bluffed: {
    text: ['“The auditor,” breathes Vane. “At last.” He pushes the ledger towards you with trembling hands. “Everything is accounted for. Everything.” You sign at the bottom. With a sigh of the deepest satisfaction, Usurer Vane fades away, his books finally closed.'],
    choices: [{ text: 'Fill your pockets', to: 'treasure' }],
  },
  vault_taxes: {
    text: ['You place fifty gold on the desk. Vane stops counting. He looks at the coins, then at you, for a long moment. “Paid,” he whispers. “In full.” He stamps the ledger and fades away, at peace. Nobody has ever paid him willingly before.'],
    choices: [{ text: 'Take the rest', to: 'treasure' }],
  },
  vault_turned: {
    text: ['You thrust out your holy symbol. Vane shrieks and flees through the wall, leaving the ledger and every coin he ever stole behind him. He will be back, but not tonight.'],
    choices: [{ text: 'Fill your pockets', to: 'treasure' }],
  },
  vault_obeys: {
    on: [{ gold: 50, msg: 'He shows you a secret drawer with another 50GP in it. “For your trouble, master.”' }], onceOnly: true,
    text: ['You present your symbol of glorious entropy. Vane’s copper eyes glaze over and he bows. “Master,” he whispers. “What would you have me count?” You tell him to count the gold into sacks for you. He is very, very good at it.'],
    choices: [{ text: 'Fill your pockets', to: 'treasure' }],
  },
  vault_won: {
    text: ['Usurer Vane comes apart like wet paper, still muttering figures, and is gone.'],
    choices: [{ text: 'Fill your pockets', to: 'treasure' }],
  },
  treasure: {
    on: [{ item: 'abacus' }, { gold: 600, msg: 'You stuff your pockets, your pack, your boots and your hat with gold.' }], onceOnly: true,
    text: ['There is more here than you could ever carry. That doesn’t stop you trying. Every 50 gold fills one of your significant item slots, so you take all you have room for and leave the rest, weeping a little.'],
    choices: [{ text: 'Head back up the stairs', to: 'escape' }],
  },
  escape: {
    text: (c) => (c.flags.bureaucratDead || c.flags.appointment || c.flags.auditor || c.flags.sneaked)
      ? ['You stagger up the spiral stair, clinking like a cutlery drawer, and out through the front door into the evening air. Nobody stops you. Nobody is left to.']
      : ['You stagger up the spiral stair, clinking like a cutlery drawer. At the front door, a militant bureaucrat stands with his arms folded and a form in his hand. “Exit tax,” he says. “Ten per cent. Fifty gold. Form 9C.”'],
    choices: [
      { text: 'Walk out', to: 'town', show: { any: [{ flag: 'bureaucratDead' }, { flag: 'appointment' }, { flag: 'auditor' }, { flag: 'sneaked' }] } },
      { text: 'Pay the exit tax', to: 'town', if: { gold: 50 }, effects: [{ gold: -50 }], show: { none: [{ flag: 'bureaucratDead' }, { flag: 'appointment' }, { flag: 'auditor' }, { flag: 'sneaked' }] } },
      { text: 'Pay with the time-traveller’s business card', to: 'town', if: { item: 'card' }, show: { none: [{ flag: 'bureaucratDead' }, { flag: 'appointment' }, { flag: 'auditor' }, { flag: 'sneaked' }] } },
      { text: 'Refuse', to: 'exit_fight', show: { none: [{ flag: 'bureaucratDead' }, { flag: 'appointment' }, { flag: 'auditor' }, { flag: 'sneaked' }] } },
    ],
  },
  exit_fight: {
    text: ['“Refusal noted,” he says, and reaches for his stamps.'],
    fight: {
      monsters: [{ name: 'Militant bureaucrat', lvl: 2, range: 'medium', feats: ['dealD6', 'approval'], note: 'Deals +d6 damage; actions take 1 round to be approved' }],
      distance: 1, win: 'town',
    },
  },
  town: {
    end: 'victory',
    text: (c) => [
      'Scumbag Town has never looked so lovely, mostly because it’s dark. You come back with ' + (c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but your life, which is worth less') + ' and a story nobody will believe.',
      'But gold in your pocket is no use to a scumbag. To become a better, more experienced scumbag, you must squander it. Every 200GP you waste on a pointless endeavour gains you a level.',
    ],
  },
};

// Full-screen texts for deaths that happen in the middle of a section.
export const DEATH_TEXT = [
  'You bleed out on the floor of a place nobody will ever look for you. Somebody else will buy the map from Nobby next week.',
  'Your adventure ends here.',
];
