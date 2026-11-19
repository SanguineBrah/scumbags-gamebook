// THE TALL ORDER — steal the Lofty Hat from Lord Longshanks' birthday party. For a level 1–2 scumbag.
// Section format: see docs/WRITING.md.

export const META = {
  tier: 2, id: 'tall-order', title: 'The Tall Order', levels: '1–2', final: 'grubb',
  blurb: 'Lord Altimus Longshanks believes greatness is measured vertically. Tonight, at the top of the tallest house in the county, he unveils the Lofty Hat: nine feet of velvet and rubies. Mother Grubb will pay 400 gold for it, if you can get it home.',
};

const pikeman = { name: 'Pikeman', lvl: 2, range: 'medium', feats: ['noEngaged'], note: '20ft pike; can’t attack anyone he’s engaged with' };
const STILTS = { item: 'stilts' };

export const SECTIONS = {
  start: {
    on: [{ gold: 30, msg: 'Mother Grubb lends you 30GP “against the hat”. You don’t ask what happens if there is no hat.' }], onceOnly: true,
    text: [
      'Mother Grubb is a fence of no fixed abode. Today her abode is a barrow outside the Drowned Rat, and she is selling stolen invitations to Lord Longshanks’ birthday party. They are genuine, which is more than can be said for the guests.',
      'Printed on the back, in very tall letters: NO GUEST UNDER SIX FEET WILL BE ADMITTED. “That’s why I sell these as well,” she says, and pats a heap of stilts. “Long coat to hide ’em in. Invitation’s twenty, stilts are five.”',
    ],
    choices: [
      { text: 'Buy an invitation and stilts (25GP)', to: 'bought_both', if: { gold: 25 } },
      { text: 'Buy just the stilts (5GP)', to: 'bought_stilts', if: { gold: 5 } },
      { text: 'Ask about another way in', to: 'grubb_tip' },
    ],
  },
  bought_both: {
    on: [{ gold: -25 }, { item: 'invitation' }, { item: 'stilts' }],
    text: ['You practise on the stilts behind the barrow until you can walk the length of the alley without screaming. Mother Grubb applauds, once.'],
    choices: [{ text: 'Walk to Highmore Spire', to: 'spire' }],
  },
  bought_stilts: {
    on: [{ gold: -5 }, { item: 'stilts' }],
    text: ['“Stilts but no invitation,” says Mother Grubb. “Bold. I like it. You’ll die.”'],
    choices: [{ text: 'Walk to Highmore Spire', to: 'spire' }],
  },
  grubb_tip: {
    text: ['“There’s a kitchen door round the back,” she says. “Four foot high. Only short thing on the whole estate. Mrs Stump the cook uses it, and she’s bitter about it. Very bitter. Bring her sympathy, or money. Same thing, to most people.”'],
    choices: [
      { text: 'Buy an invitation and stilts after all (25GP)', to: 'bought_both', if: { gold: 25 } },
      { text: 'Walk to Highmore Spire', to: 'spire' },
    ],
  },
  spire: {
    text: [
      'Highmore Spire is the tallest building in the county, and the Lord is still adding to it. Its front door is thirty feet high, with a knocker at the top that the doorman reaches by ladder. Torches blaze, music plays, and enormously tall guests totter up the steps on legs that bend in places legs don’t.',
      'Round the side, a little door four feet high is propped open by a bucket of potato peelings.',
    ],
    choices: [
      { text: 'Join the queue at the front door', to: 'doorman' },
      { text: 'Try the kitchen door', to: 'kitchen_door' },
      { text: 'Climb the builders’ scaffolding to the roof', test: { stat: 'Str', dd: 12, skill: ['athletics'], profs: ['Woodcutter', 'Cutpurse'], why: 'you climb for a living', mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 8 }] }, pass: 'roof', fail: 'scaffold_fall' },
    ],
  },
  scaffold_fall: {
    on: [{ damage: 'd6', from: 'The scaffolding' }],
    text: ['Halfway up, a plank decides it would rather be on the ground, and takes you with it.'],
    choices: [{ text: 'Get up and think again', to: 'spire' }],
  },
  doorman: {
    text: (c) => c.flags.doormanAngry
      ? ['The doorman sees you coming back and raises his measuring stick like a sword. “YOU,” he says. Behind him, the pikemen start turning round again.']
      : [
        'The doorman measures every guest with a long stick marked in feet. He is tall himself, and makes sure everybody knows it.',
        c.mundane.some((i) => i.id === 'stilts') ? 'You totter up the steps on your stilts, coat flapping round your ankles, which are somewhere near his chest.' : 'He looks down at you. A long way down.',
      ],
    choices: [
      { text: 'Hand over your invitation and stand very still', test: { stat: 'Dex', dd: 4, save: true }, pass: 'admitted', fail: 'wobble', if: { item: 'invitation' }, show: { item: 'stilts', notFlag: 'doormanAngry' } },
      { text: 'Compliment his height', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'admitted', fail: 'doorman_angry', show: { notFlag: 'doormanAngry' } },
      { text: 'Bribe him (10GP)', to: 'admitted', if: { gold: 10 }, effects: [{ gold: -10 }], show: { notFlag: 'doormanAngry' } },
      { text: 'Throw your voice down from the balcony: “Let that one in, Doorman. He’s my cousin.”', cast: 'voice', pass: 'cousin', fail: 'doorman_angry', show: { notFlag: 'doormanAngry' } },
      { text: 'Have it out with him', to: 'doorman_angry', show: { flag: 'doormanAngry' } },
      { text: 'Go round to the kitchen door', to: 'kitchen_door' },
    ],
  },
  glued: {
    on: [{ lose: 'glue' }, { flag: 'guest' }],
    text: ['You dab glue on your soles and plant your feet. The wind blows. You don’t. The doorman measures you, finds nothing to object to, and waves you in. You will be getting off these stilts with a chisel.'],
    choices: [{ text: 'Go inside', to: 'long_hall' }],
  },
  wobble: {
    text: ['As the stick comes up, so does a gust of wind. You sway. You sway the other way. The doorman narrows his eyes.'],
    choices: [
      { text: 'Glue your feet to your stilts', to: 'glued', if: { item: 'glue' } },
      { text: 'Compliment his height, quickly', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'admitted', fail: 'doorman_angry' },
      { text: 'Bribe him (10GP)', to: 'admitted', if: { gold: 10 }, effects: [{ gold: -10 }] },
    ],
  },
  doorman_angry: {
    on: [{ flag: 'doormanAngry' }],
    text: ['“Short,” he announces to the queue. “SHORT!” The guests gasp. Two pikemen turn, very slowly, because their pikes are twenty feet long.'],
    fight: { outdoors: true, monsters: [{ name: 'Doorman', lvl: 1, range: 'engaged', note: 'Measuring stick; very tall; very offended' }, pikeman], distance: 1, win: 'doorman_win', flee: { to: 'kitchen_door', label: 'Run round the side of the house' } },
  },
  doorman_win: {
    on: [{ gold: 8, msg: 'The doorman’s tips: 8GP.' }], onceOnly: true,
    text: ['You leave the doorman measuring the steps with his face. The guests step over him. Nobody is looking at anything below six feet.'],
    choices: [{ text: 'Go inside', to: 'long_hall' }],
  },
  admitted: {
    on: [{ flag: 'guest' }],
    text: ['The doorman sniffs and waves you through. “Enjoy the party,” he says, “sir or madam or whatever you are up there.”'],
    choices: [{ text: 'Go inside', to: 'long_hall' }],
  },
  kitchen_door: {
    text: (c) => c.flags.stumpCross
      ? ['Mrs Stump is still beating her pudding, and still bitter. She sees you in the doorway and points the whisk at you without turning round.']
      : ['The kitchen door is exactly your height. Behind it, Mrs Stump, the cook, is beating a pudding as if it owes her money. She is four foot three and has worked here for thirty years, and in all that time nobody has once looked her in the eye without kneeling.'],
    choices: [
      { text: 'Sympathise with her', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'stump_friend', fail: 'stump_cross', show: { notFlag: 'stumpCross' } },
      { text: 'Offer her a cut of the takings', to: 'stump_friend', effects: [{ flag: 'stumpCut' }] },
      { text: 'Sneak in behind her', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'kitchen', fail: 'stump_cross' },
      { text: 'Go back round the front', to: 'doorman' },
    ],
  },
  stump_friend: {
    on: [{ flag: 'stump' }],
    text: ['“Thirty years,” says Mrs Stump, “making nine-foot cakes.” She puts down the whisk. “The hat’s in the vault till the unveiling. There’s a dumbwaiter from this kitchen straight up to it. Rope’s sound. Dumbwaiter isn’t. And watch out for Big Ned.” She doesn’t say who Big Ned is. She doesn’t have to.'],
    choices: [{ text: 'Step into the kitchen', to: 'kitchen' }],
  },
  stump_cross: {
    on: [{ flag: 'stumpCross' }],
    text: ['Mrs Stump turns round with the whisk raised. “Another one,” she says. “Out.” She is surprisingly strong for a pudding-beater, and you find yourself back in the yard with batter in your hair.'],
    choices: [{ text: 'Go round the front', to: 'doorman' }, { text: 'Try the scaffolding', to: 'spire' }],
  },
  kitchen: {
    text: ['The kitchen is the only room in Highmore Spire with a normal ceiling. In the corner, a dumbwaiter hangs in a dark shaft that runs eighty feet straight up. A narrow servants’ stair leads to the Long Hall.'],
    choices: [
      { text: 'Climb the dumbwaiter rope', test: { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Woodcutter'], why: 'you climb for a living', mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'vault_shaft', fail: 'shaft_fall' },
      { text: 'Take the servants’ stair to the Long Hall', to: 'long_hall' },
    ],
  },
  shaft_fall: {
    on: [{ damage: 'd4', from: 'The dumbwaiter' }],
    text: ['Halfway up, the dumbwaiter overtakes you on the way down. You both arrive at the bottom.'],
    choices: [{ text: 'Try again', to: 'kitchen' }],
  },
  long_hall: {
    text: (c) => [
      'The Long Hall is ninety feet long and sixty high, and the party fills it from the floor to about nine feet up. Guests on stilts drink from three-foot glasses. Six pikemen stand along the walls, their pikes vanishing into the gloom above.',
      c.flags.speech ? 'Up on the balcony, Lord Altimus Longshanks has finished his speech and is accepting compliments on it. The guests have gone back to drinking.' : 'Up on a balcony, a small man in an enormous coat waits to make a speech: Lord Altimus Longshanks himself.',
    ],
    choices: [
      { text: 'Pick some pockets', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], mods: [{ if: STILTS, dd: 12 }] }, pass: 'pockets', fail: 'pocket_topple', show: { notFlag: 'pockets' } },
      { text: 'Drink from a three-foot glass', test: { stat: 'Con', dd: 6, save: true }, pass: 'drink_good', fail: 'drink_truth', show: { notFlag: 'drank' } },
      { text: 'Wait for the speech, when everyone looks up', to: 'speech', show: { notFlag: 'speech' } },
      { text: 'Climb the Grand Staircase', to: 'staircase' },
      { text: 'Slip down to the kitchen', to: 'kitchen' },
    ],
  },
  pockets: {
    on: [{ flag: 'pockets' }, { gold: 30, msg: 'Three purses, at roughly knee height: 30GP.' }],
    text: ['Nobody up there is looking down here. You work your way along the hall, lightening purses as you go.'],
    choices: [{ text: 'Back to the party', to: 'long_hall' }],
  },
  pocket_topple: {
    on: [{ flag: 'pockets' }],
    text: ['Your mark feels the tug, turns round in surprise and topples off her stilts, taking three other guests with her. Everyone looks. A pikeman starts turning round.'],
    fight: { ceiling: 'high', monsters: [pikeman], distance: 1, win: 'long_hall_after', flee: { to: 'staircase', label: 'Lose yourself on the staircase' } },
  },
  long_hall_after: {
    text: ['The pikeman lies on the floor, his pike still upright and swaying, like a flagpole without a flag. The guests decide it is part of the entertainment and applaud.'],
    choices: [{ text: 'Back to the party', to: 'long_hall' }],
  },
  drink_good: {
    on: [{ flag: 'drank' }, { heal: 'd6' }],
    text: ['It takes a while to drink three feet of wine. You manage it, and feel taller.'],
    choices: [{ text: 'Back to the party', to: 'long_hall' }],
  },
  drink_truth: {
    on: [{ flag: 'drank' }, { flag: 'truthful' }],
    text: ['Halfway down the glass you turn to the guest beside you and tell her, at length, that you are here to steal the hat. She laughs. Everyone laughs. You can’t seem to stop telling the truth, which is going to make lying difficult for the rest of the night.'],
    choices: [{ text: 'Back to the party', to: 'long_hall' }],
  },
  speech: {
    on: [{ flag: 'speech' }],
    text: ['A trumpet sounds. The Lord steps up to the balcony rail, and every guest and every guard in the hall tilts their head back to look at him. “Friends,” he says. “Tall friends.” Nobody is looking at anything else.'],
    choices: [
      { text: 'Slip up the Grand Staircase while nobody’s watching', to: 'staircase_quiet' },
      { text: 'Pick pockets while nobody’s watching', to: 'pockets', show: { notFlag: 'pockets' } },
      { text: 'Listen to the speech', to: 'speech_listen' },
    ],
  },
  speech_listen: {
    text: ['The speech is about height. It goes on for some time. The Lord announces that the Lofty Hat will be unveiled at midnight. “Until then it stays in the vault, whose key is somewhere very high up, ha ha.” Nobody laughs, because he is the Lord, and then everybody does.'],
    on: [{ flag: 'keyHigh' }],
    choices: [{ text: 'Back to the party', to: 'long_hall' }],
  },
  staircase: {
    text: (c) => [
      'Each step of the Grand Staircase is three feet high. The guests are carried up in sedan chairs. You are not a guest, or not that kind.',
      c.mundane.some((i) => i.id === 'stilts') ? 'On stilts, it’s like climbing a ladder with your legs tied together.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Hail a sedan chair, like the guest you are', to: 'sedan', show: { flag: 'guest' } },
      { text: 'Climb', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: STILTS, dd: 12 }] }, pass: 'gallery', fail: 'stair_fall' },
      { text: 'Take off your stilts first', to: 'staircase_quiet', show: STILTS, effects: [{ lose: 'stilts' }, { msg: 'You leave the stilts behind a pillar.' }] },
      { text: 'Back to the party', to: 'long_hall' },
    ],
  },
  sedan: {
    text: (c) => [`Two footmen lift you, chair${c.mundane.some((i) => i.id === 'stilts') ? ', stilts' : ''} and all, and carry you up the Grand Staircase while you wave graciously at the people below. At the top, they set you down and hold out their hands. You shake them both.`],
    choices: [{ text: 'Into the gallery', to: 'gallery' }],
  },
  staircase_quiet: {
    text: ['You haul yourself up the giant steps one at a time, like a toddler climbing into bed.'],
    choices: [{ text: 'Keep climbing', test: { stat: 'Str', dd: 8, skill: ['athletics'] }, pass: 'gallery', fail: 'stair_fall' }],
  },
  stair_fall: {
    on: [{ damage: 'd3', from: 'The stairs' }],
    text: ['You miss a step and bounce down three of them. A guest above you remarks that the entertainment is very physical this year.'],
    choices: [{ text: 'Try again', to: 'staircase' }],
  },
  gallery: {
    text: (c) => [
      'The gallery holds portraits of the Lord, each one taller than the last. The newest is forty feet high and unfinished.',
      c.flags.painterDown ? 'The painter’s ladder still leans against it. Signor Vertigo has gone home to lie down on something flat.' : 'Halfway up a very long ladder beside it, a painter in a beret is clinging on for dear life. “Help,” he says faintly. “I have been up here three days. I am Signor Vertigo. It is not a stage name.”',
      'Further along, a corridor leads to the Lord’s bedroom, and a landing beyond that leads up to the vault.',
    ],
    choices: [
      { text: 'Talk the painter down', test: { stat: 'Cha', dd: 6, skill: ['social', 'medicine'], why: 'calming people down' }, pass: 'painter_down', fail: 'painter_stuck', show: { notFlag: 'painterDown' } },
      { text: 'Lower him on your rope', to: 'painter_down', if: { item: 'rope' }, show: { notFlag: 'painterDown' } },
      { text: 'Climb the painter’s ladder to the top of the frame', to: 'frame_top', show: { flag: 'painterDown', notFlag: 'gotKey' } },
      { text: 'Climb to the top of the frame', test: { stat: 'Dex', dd: 12, skill: ['athletics'] }, pass: 'frame_top', fail: 'frame_fall', show: { none: [{ flag: 'gotKey' }, { flag: 'painterDown' }] } },
      { text: 'Go to the Lord’s bedroom', to: 'bedroom' },
      { text: 'Go up to the vault', to: 'hounds' },
      { text: 'Go back down to the party', to: 'long_hall' },
    ],
  },
  painter_stuck: {
    text: ['“I can’t,” he whimpers. “Not yet. Come back later. Come back with a rope.”'],
    choices: [{ text: 'Back to the gallery', to: 'gallery' }],
  },
  painter_down: {
    on: [{ flag: 'painterDown' }, { flag: 'keyHigh' }],
    text: (c) => [c.flags.gotKey
      ? 'Signor Vertigo reaches the floor and kisses it. “I owe you my life,” he says. “And a secret. The key to the vault: his Lordship hides it on top of his newest portrait.” He sees it in your hand. “Ah. You knew.” He leaves the ladder where it is.'
      : 'Signor Vertigo reaches the floor and kisses it. “I owe you my life,” he says. “And a secret. The key to the vault: his Lordship hides it on top of his newest portrait. I painted around it for three days.” He leaves the ladder where it is.'],
    choices: [{ text: 'Climb the ladder to the top of the frame', to: 'frame_top', show: { notFlag: 'gotKey' } }, { text: 'Back to the gallery', to: 'gallery' }],
  },
  frame_fall: {
    on: [{ damage: 'd4', from: 'The fall' }],
    text: ['Thirty feet up, the frame creaks, and you discover that portraits are not designed to be climbed.'],
    choices: [{ text: 'Back to the gallery', to: 'gallery' }],
  },
  frame_top: {
    on: [{ flag: 'gotKey' }, { item: 'vaultkey' }],
    text: (c) => [c.flags.keyHigh ? 'On top of the frame, in three days of dust, lies a long iron key.' : 'On top of the frame, to your surprise, lies a long iron key. The Lord likes to keep things high up.', 'Down below, the painted Lord stares out of the canvas, nine feet tall and smiling. In real life he is five foot two.'],
    choices: [{ text: 'Climb down', to: 'gallery' }],
  },
  bedroom: {
    text: (c) => [`The Lord’s bed stands on eight-foot legs, with a rope ladder up to the pillows. His wardrobe is full of very long trousers with the bottom four feet sewn shut. ${c.flags.candles ? 'One six-foot silver candlestick stands by the bed, missing its twin.' : 'Two six-foot silver candlesticks stand by the bed.'} ${c.flags.diary ? 'There’s nothing under the pillow now.' : 'Under the pillow is a diary.'}`],
    choices: [
      { text: 'Take the diary', to: 'diary', show: { notFlag: 'diary' } },
      { text: 'Steal one of the Lord’s silver candlesticks', to: 'candles', show: { notFlag: 'candles' } },
      { text: 'Back to the gallery', to: 'gallery' },
    ],
  },
  diary: {
    on: [{ flag: 'diary' }, { item: 'diary' }],
    text: ['You read the first page. “Dear Diary. Measured myself again today. Five foot two. Still five foot two. Why?” His brother, Lord Shortshanks, would pay well for this. So, probably, would the Lord.'],
    choices: [{ text: 'Back to the bedroom', to: 'bedroom' }],
  },
  candles: {
    on: [{ flag: 'candles' }, { item: 'candlestick' }],
    text: ['They are six feet tall and solid silver. You can carry one, if you don’t mind carrying nothing else.'],
    choices: [{ text: 'Back to the bedroom', to: 'bedroom' }],
  },
  hounds: {
    text: (c) => c.flags.houndsGone
      ? ['The landing is empty, apart from some very long dog hair.']
      : ['On the landing outside the vault, four stilt-hounds look up from their bowls. They are bred for length, have legs like a heron’s, and cannot lie down. Nobody knows how they got up here, as they hate stairs. They hate strangers more.'],
    choices: [
      { text: 'Throw them your rations', to: 'hounds_fed', if: { item: 'rations' }, show: { notFlag: 'houndsGone' } },
      { text: 'Let your rat go', to: 'hounds_rat', if: { item: 'rat' }, show: { notFlag: 'houndsGone' } },
      { text: 'Cast Abundance and set down a dish of dinner at floor level', cast: 'abundance', pass: 'hounds_dinner', fail: 'hounds_fight', critFail: 'hounds_locusts', show: { notFlag: 'houndsGone' } },
      { text: 'Cast Burden on them, so their long legs buckle', cast: 'burden', pass: 'hounds_buckled', fail: 'hounds_fight', critFail: 'hounds_light', show: { notFlag: 'houndsGone' } },
      { text: 'Calm them the way you calm any animal', test: { stat: 'Wis', dd: 8, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you know animals' }, pass: 'hounds_calm', fail: 'hounds_fight', show: { notFlag: 'houndsGone' } },
      { text: 'Fight your way through', to: 'hounds_fight', show: { notFlag: 'houndsGone' } },
      { text: 'Go on to the vault door', to: 'vault_door', show: { flag: 'houndsGone' } },
      { text: 'Go back down', to: 'gallery' },
    ],
  },
  hounds_fed: {
    on: [{ flag: 'houndsGone' }, { lose: 'rations' }],
    text: ['The hounds fall on your rations. A stilt-hound eating from the floor has to do the splits to reach it, so they’ll be busy for a while.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  hounds_rat: {
    on: [{ flag: 'houndsGone' }],
    text: ['You set your rat down on the landing. It looks at four stilt-hounds, and they look at it, and then it goes down the stairs very fast and so do they, all knees, howling. You hear them all the way to the cellar. Your rat will find its own way back. Rats do.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  hounds_calm: {
    on: [{ flag: 'houndsGone' }],
    text: ['You crouch, hold out a hand and make the noise that animals like. One by one, four very long faces come down to sniff it. Then they go back to their bowls.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  hounds_fight: {
    text: ['The hounds come at you all knees and teeth.'],
    fight: { ceiling: 'high',
      monsters: [
        { name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' },
        { name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' },
      ],
      win: 'hounds_win', flee: { to: 'gallery', label: 'Run down the stairs, which they hate' },
    },
  },
  hounds_win: {
    on: [{ flag: 'houndsGone' }],
    text: ['The last two hounds take one look at their brothers and retreat to the far end of the landing, where they stand trembling on their enormous legs.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  vault_shaft: {
    text: ['The dumbwaiter rope ends at a hatch in the floor of the vault. You lift it a crack. On a fifteen-foot mannequin sits the Lofty Hat, nine feet of velvet studded with rubies. Beside it stands a man who is either very tall furniture or Big Ned.'],
    choices: [{ text: 'Climb in', to: 'vault' }],
  },
  vault_door: {
    text: ['The vault door is twenty feet tall, with the keyhole at the top.'],
    choices: [
      { text: 'Unlock it from your stilts', test: { stat: 'Dex', dd: 4, save: true }, pass: 'vault', fail: 'stilt_fall', if: { item: 'vaultkey' }, show: STILTS },
      { text: 'Climb up and unlock it', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing', 'pole', 'spikes'] }, dd: 4 }] }, pass: 'vault', fail: 'door_fall', if: { item: 'vaultkey' } },
      { text: 'Climb up and pick the lock', test: { stat: 'Dex', dd: 12, skill: ['skulduggery'] }, pass: 'vault', fail: 'door_fall', if: { item: 'tools' } },
      { text: 'Go back down to the gallery', to: 'gallery' },
    ],
  },
  stilt_fall: {
    on: [{ damage: 'd4', from: 'The landing' }],
    text: ['You reach up, wobble, and come down like a felled tree. Somewhere below, a guest applauds.'],
    choices: [{ text: 'Try again', to: 'vault_door' }],
  },
  door_fall: {
    on: [{ damage: 'd4', from: 'The landing' }],
    text: ['Twenty feet is further than it looks, particularly on the way down.'],
    choices: [{ text: 'Try again', to: 'vault_door' }],
  },
  vault: {
    text: (c) => c.flags.nedGone
      ? ['The vault is quiet. The mannequin stands bareheaded.']
      : ['The Lofty Hat sits on its mannequin, glittering. Beside it stands Big Ned: the tallest man in the world, nine foot four in his socks, told to stand very still and look like furniture. He is doing very well. Only his eyes move, and they are moving towards you.'],
    choices: [
      { text: 'Take the hat while he pretends to be a wardrobe', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'hat', fail: 'ned_fight', show: { notFlag: 'nedGone' } },
      { text: 'Tell him the Lord says he can go home', test: { stat: 'Cha', dd: 8, skill: ['lying'] }, pass: 'ned_home', fail: 'ned_fight', show: { notFlag: 'nedGone' }, if: { notFlag: 'truthful', notFlagText: 'being able to lie (you’re telling the truth tonight)' } },
      { text: 'Ask him whether he’s happy here', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cleric', 'Missionary'], why: 'you listen to people' }, pass: 'ned_home', fail: 'ned_fight', show: { notFlag: 'nedGone' } },
      { text: 'Manacle him to the mannequin while he’s being furniture', to: 'ned_chained', if: { anyItem: ['manacles', 'chain'] }, show: { notFlag: 'nedGone' } },
      { text: 'Cast Trip, and fell him like a tree', cast: 'trip', pass: 'ned_felled', fail: 'ned_fight', show: { notFlag: 'nedGone' } },
      { text: 'Fight him', to: 'ned_fight', show: { notFlag: 'nedGone' } },
      { text: 'Take the hat', to: 'hat', show: { flag: 'nedGone' } },
    ],
  },
  ned_chained: {
    on: [{ flag: 'nedGone' }],
    text: ['You fasten Big Ned’s wrist to the mannequin. He watches you do it. He has been told to stand very still, and he is a professional. “I’m furniture,” he whispers. “Furniture doesn’t stop thieves.” He sounds relieved.'],
    choices: [{ text: 'Take the hat', to: 'hat' }],
  },
  ned_home: {
    on: [{ flag: 'nedGone' }],
    text: ['Big Ned’s face crumples. “Home,” he says. “I haven’t been home in eleven years. I can’t get through the door.” He walks out of the vault, ducking, and you hear him banging his head all the way down the stairs.'],
    choices: [{ text: 'Take the hat', to: 'hat' }],
  },
  ned_fight: {
    text: ['Big Ned stops being furniture. He fills the vault, and he hits like a falling tree. But he’s spent his life in rooms built for ordinary people, and he flinches every time he passes a doorway.'],
    fight: { ceiling: 'high',
      monsters: [{ name: 'Big Ned', lvl: 2, hp: 18, range: 'engaged', note: 'The tallest man in the world (18 HP); takes d6 damage whenever he runs through a doorway' }],
      win: 'ned_win', flee: { to: 'gallery', label: 'Run for the stairs' },
      special: [{ label: 'Dodge through the doorway so he follows', text: 'You duck through the vault door. Big Ned charges after you and meets the lintel with his forehead.', dmg: 'd6', repeat: true }],
    },
  },
  ned_win: {
    on: [{ flag: 'nedGone' }],
    text: ['Big Ned sits down heavily and decides, on reflection, to be furniture again.'],
    choices: [{ text: 'Take the hat', to: 'hat' }],
  },
  hat: {
    on: [{ item: 'hat', msg: 'The Lofty Hat takes up four significant item slots, and most of your dignity.' }], onceOnly: true,
    text: ['You lift the Lofty Hat off its mannequin. It weighs almost nothing and is very, very long. Now you just have to get it out of the tallest building in the county.'],
    choices: [
      { text: 'Climb down the dumbwaiter shaft', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'out_kitchen', fail: 'shaft_drop' },
      { text: 'Climb up to the roof', to: 'roof_escape' },
      { text: 'Walk out of the front door wearing it', test: { stat: 'Cha', dd: 12, skill: ['lying', 'social'] }, pass: 'front_walk', fail: 'front_caught', if: STILTS },
      { text: 'Cast Haste on yourself, and leave by the front door very quickly indeed', cast: 'haste', pass: 'hasted', fail: 'front_caught' },
    ],
  },
  shaft_drop: {
    on: [{ damage: 'd6', from: 'The dumbwaiter shaft' }],
    text: ['You drop the last thirty feet, landing on the hat, which survives, and on Mrs Stump’s pudding, which doesn’t.'],
    choices: [{ text: 'Get out through the kitchen door', to: 'out_kitchen' }],
  },
  out_kitchen: {
    text: (c) => [c.flags.stump ? 'Mrs Stump holds the little door open for you. “Mind the hat,” she says, and winks.' : 'You squeeze out through the little kitchen door, hat first. It takes a while.'],
    on: [{ if: { flag: 'stumpCut' }, gold: -30, msg: 'You leave Mrs Stump her cut: 30GP.' }],
    choices: [{ text: 'Run for Mother Grubb’s', to: 'grubb' }],
  },
  roof: {
    text: ['The roof is unfinished: scaffolding, a flagpole and a builders’ rope that runs all the way down to the town square. A hatch leads down into the Spire.'],
    choices: [{ text: 'Climb down through the hatch', to: 'gallery' }],
  },
  roof_escape: {
    text: ['You climb out onto the scaffolding at the top of the Spire. Far below, the town square glitters. A builders’ rope runs all the way down to it.'],
    choices: [
      { text: 'Slide down the rope', test: { stat: 'Dex', dd: 8, save: true }, pass: 'grubb', fail: 'rope_burn' },
      { text: 'Hook something iron over the rope and ride it down', to: 'zipline', if: { anyItem: ['prybar', 'pick', 'chain'] } },
    ],
  },
  zipline: {
    text: ['You hook it over the rope and step off the scaffolding. The town square comes up to meet you at a brisk but civilised pace, and you land neatly, holding a nine-foot hat, in front of a man selling chestnuts. He doesn’t say anything. He’s seen worse.'],
    choices: [{ text: 'Stroll to Mother Grubb’s', to: 'grubb' }],
  },
  rope_burn: {
    on: [{ damage: '2d6', from: 'The landing' }],
    text: ['You arrive in the town square at a speed normally reserved for comets. The hat lands on top of you, gently.'],
    choices: [{ text: 'Limp to Mother Grubb’s', to: 'grubb' }],
  },
  front_walk: {
    text: ['You put on the Lofty Hat, which brings you to about fifteen feet, and stroll down the Grand Staircase and out through the front door. The doorman bows so low he falls over. The guests applaud. The Lord, watching from his balcony, assumes you’re his brother and is furious.'],
    choices: [{ text: 'Stroll to Mother Grubb’s', to: 'grubb' }],
  },
  front_caught: {
    text: ['“Thief!” cries the Lord from his balcony, recognising his own hat. Every pikeman in the hall begins, very slowly, to turn.'],
    fight: { ceiling: 'high', monsters: [pikeman, pikeman], distance: 1, win: 'grubb', flee: { to: 'grubb', label: 'Run for the door' } },
  },
  grubb: {
    end: 'victory',
    on: [
      { sell: { item: 'hat', gold: 370, text: 'Mother Grubb takes the Lofty Hat and counts out 400 gold, less the 30 she lent you' } },
      { sell: { item: 'diary', gold: 100, text: 'Lord Shortshanks buys the diary, laughing so hard he has to sit down' } },
      { sell: { item: 'candlestick', gold: 25, text: 'Mother Grubb takes the candlestick' } },
      { if: { notFlag: 'sold_hat' }, gold: -30, msg: 'She takes back the 30GP she lent you.' },
    ],
    text: (c) => [
      'Mother Grubb’s barrow is waiting in the alley behind the Drowned Rat, as if it had always been there.',
      c.flags.sold_hat ? '“Well, well,” she says, trying the hat on. It comes down to her knees. “You did it. Don’t do it again. They’ll be looking for somebody tall.”' : '“No hat?” she says, and holds out her hand for her thirty gold. Whatever you can’t pay goes on your tab. You didn’t have a tab before. You do now.',
      'Every 200GP you squander on a pointless endeavour gains you a level.',
    ],
  },
  cousin: {
    on: [{ flag: 'guest' }],
    text: ['“Let that one in, Doorman,” says a voice from somewhere high above, in a passable impression of a lord. “He’s my cousin.” The doorman looks up at the balcony, sees nobody, and assumes that the Lord has gone in again. He looks at you with new respect, which is to say less contempt, and waves you through.'],
    choices: [{ text: 'Go inside', to: 'long_hall' }],
  },
  hounds_dinner: {
    on: [{ flag: 'houndsGone' }],
    text: ['A dish of steaming dinner appears on the landing, at floor level. A stilt-hound eating from the floor has to do the splits to reach it, so they’ll be busy for a while.'],
    choices: [{ text: 'Go on to the vault door', to: 'vault_door' }],
  },
  hounds_locusts: {
    text: ['Your god scorns you. Instead of dinner, a swarm of locusts pours out across the landing. The hounds snap at them, eat a few, and then decide you are the larger snack.'],
    fight: { ceiling: 'high', monsters: [{ name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' }, { name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' }], win: 'hounds_win', flee: { to: 'gallery', label: 'Run down the stairs, which they hate' } },
  },
  hounds_buckled: {
    on: [{ flag: 'houndsGone' }],
    text: ['The stilt-hounds suddenly weigh twice what they did. Their long thin legs bow, wobble and fold, one after another, like deckchairs. They lie on the landing in a heap of knees, unable to get up, looking at you reproachfully.'],
    choices: [{ text: 'Step over them to the vault door', to: 'vault_door' }],
  },
  hounds_light: {
    text: ['Your god scorns you. Instead of getting heavier, the hounds can walk on water for ten minutes. There is no water on the landing, so it makes no difference at all, except that they’ve noticed you.'],
    fight: { ceiling: 'high', monsters: [{ name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' }, { name: 'Stilt-hound', lvl: 1, hp: 3, range: 'engaged', note: 'Bred for length; all legs (3 HP); can’t lie down; hates stairs' }], win: 'hounds_win', flee: { to: 'gallery', label: 'Run down the stairs, which they hate' } },
  },
  ned_felled: {
    on: [{ flag: 'nedGone' }],
    text: ['Big Ned’s feet go out from under him, and he comes down across the vault like a felled pine, taking a shelf of hats with him. He lies there with his eyes shut. “Timber,” he says, sadly, and doesn’t get up.'],
    choices: [{ text: 'Take the hat', to: 'hat' }],
  },
  hasted: {
    text: ['You go down the Grand Staircase three steps at a time, which is nine feet a stride, and through the Long Hall at a speed that makes the candles gutter. By the time anybody has looked down, you are gone, and so is the Lofty Hat.'],
    choices: [{ text: 'Run to Mother Grubb’s', to: 'grubb' }],
  },
};

export const DEATH_TEXT = [
  'You fall, and keep falling, and nobody at the party looks down to see where you land.',
  'Your adventure ends here.',
];
