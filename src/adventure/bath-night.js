// BATH NIGHT — get a filthy noble into a bath before his wedding. For a level 1–2 scumbag.
// You need hot water, a bath that's fit to use and a Lord who's in it. The `ready` counter tracks the first two.

export const META = {
  tier: 2, id: 'bath-night', title: 'Bath Night', levels: '1–2', final: 'wedding',
  blurb: 'Lord Mudlark marries Lady Primrose at noon tomorrow. Lady Primrose’s mother has said there will be no wedding unless the groom has had a bath. He has never had a bath. The Dowager Lady Mudlark will pay 200 gold to whoever gets her son clean by dawn.',
};

const footman = { name: 'Filthy footman', lvl: 1, hp: 3, range: 'engaged', note: 'Never bathes; loyal to the smell' };
const mudlark = { name: 'Lord Mudlark', lvl: 2, hp: 6, range: 'engaged', onHit: { stat: 'Con', dd: 4, label: 'keep your dinner down', text: 'He breathes on you.', effect: 'prone' }, note: 'Filthy noble; never bathes; on hit, d4 Con save or retch on the floor' };
const READY = { atLeast: ['ready', 2] };

export const SECTIONS = {
  start: {
    on: [{ item: 'soap', msg: 'The Dowager gives you a bar of carbolic soap the size of a brick. It has never been used. It came with the house.' }], onceOnly: true,
    text: (c, visits) => visits > 1 ? ['You’re back at the gates of Mudlark Manor. The Dowager’s carriage hasn’t moved. Behind the glass, her handkerchief hasn’t either.'] : [
      'The Dowager Lady Mudlark meets you in her carriage at the gates of Mudlark Manor, with the windows shut and a handkerchief over her face. “My son,” she says, “is a lord, a landowner and a filthy pig. He has not washed since his christening, and he fought that. The wedding is at noon. Lady Primrose’s mother will check behind his ears.”',
      'She waves at the manor. “The bath is in the east wing. The boiler is in the cellar. My son is wherever the smell is. Two hundred gold if he’s clean by dawn. Do not let him near the curtains.”',
    ],
    choices: [
      { text: 'Knock at the front door', to: 'hall' },
      { text: 'Go round to the cellar door', to: 'cellar' },
      { text: 'Climb the ivy to the east wing', test: { stat: 'Str', dd: 6, skill: ['athletics'], profs: ['Woodcutter'], why: 'you climb trees for a living', mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'bathroom', fail: 'ivy_fall' },
    ],
  },
  ivy_fall: {
    on: [{ damage: 'd4', from: 'The ivy' }],
    text: ['The ivy comes away from the wall in a sheet, and you come down with it into a flowerbed that hasn’t been weeded, or smelt, in years.'],
    choices: [{ text: 'Knock at the front door', to: 'hall' }, { text: 'Go round to the cellar door', to: 'cellar' }],
  },
  hall: {
    text: (c) => [
      c.flags.footmenDown
        ? 'The great hall of Mudlark Manor is empty now, apart from the smell, which is never empty.'
        : c.flags.footmenClean ? 'The footmen hover in the great hall with towels over their arms, waiting their turn for the bath.'
        : c.flags.footmenGone ? 'The footmen lean on their stain in the great hall, and pay you no attention at all.'
        : 'Two footmen open the front door, one each, and the smell comes out to meet you like a dog. The great hall is hung with tapestries of the Mudlarks through the ages, all of them muddy. The footmen are muddy too. “His Lordship,” says one, “does not receive bathers.”',
      'Stairs lead to the east wing, a door to the cellar, and a corridor to a back door, beyond which you can hear grunting.',
    ],
    choices: [
      { text: 'Tell them you’re from the wedding, to measure his Lordship for his suit', test: { stat: 'Cha', dd: 6, skill: ['lying', 'social'] }, pass: 'footmen_fooled', fail: 'footmen_fight', show: { notFlag: 'footmenGone' } },
      { text: 'Offer them a bath too', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cleric', 'Missionary'], why: 'you’ve made converts before' }, pass: 'footmen_converted', fail: 'footmen_fight', show: { notFlag: 'footmenGone' } },
      { text: 'Push past them', to: 'footmen_fight', show: { notFlag: 'footmenGone' } },
      { text: 'Go up to the east wing', to: 'bathroom', show: { flag: 'footmenGone' } },
      { text: 'Go down to the cellar', to: 'cellar', show: { flag: 'footmenGone' } },
      { text: 'Follow the grunting', to: 'sty', show: { flag: 'footmenGone', notFlag: 'lordWaiting' } },
    ],
  },
  footmen_fooled: {
    on: [{ flag: 'footmenGone' }],
    text: ['“Ah,” says the footman. “Measuring. That’s all right, then.” They step aside, and go back to leaning on the wall, which has a footman-shaped stain on it from years of practice.'],
    choices: [{ text: 'Into the hall', to: 'hall' }],
  },
  footmen_converted: {
    on: [{ flag: 'footmenGone' }, { flag: 'footmenClean' }],
    text: ['You describe hot water, and soap, and the feeling of being able to smell things again. The footmen look at each other. One of them starts to cry. “I had a bath once,” he says. “When I was a boy. I’ve never forgotten.” They stand aside, and ask if they can be next.'],
    choices: [{ text: 'Into the hall', to: 'hall' }],
  },
  footmen_fight: {
    text: ['The bigger footman steps forward, and the smell steps forward with him. The other one holds his coat.'],
    fight: { monsters: [footman], win: 'footmen_down', flee: { to: 'start', label: 'Back out of the front door' } },
  },
  footmen_down: {
    on: [{ flag: 'footmenGone' }, { flag: 'footmenDown' }, { gold: 6, msg: 'In the coat pockets: 6GP, very damp.' }], onceOnly: true,
    text: ['The footman lies on the floor, where he fits in with the décor. The other one hands you back his coat, as if you’d won it, and goes off to lie down somewhere.'],
    choices: [{ text: 'Into the hall', to: 'hall' }],
  },
  cellar: {
    dark: true,
    text: (c) => [
      c.flags.boilerLit
        ? 'The boiler in the cellar roars happily, and the pipes up to the east wing knock and gurgle.'
        : 'The cellar holds a copper boiler the size of a carriage, cold since before anyone can remember, and a coal heap. Pipes run up through the ceiling towards the east wing.',
    ],
    choices: [
      { text: 'Light the boiler', test: { stat: 'Int', dd: 6, skill: ['analysis'], profs: ['Alchemist'], why: 'you know your way round a furnace', mods: [{ if: { item: 'bellows' }, auto: true, text: 'Your bellows get it roaring in a minute.' }] }, pass: 'boiler', fail: 'boiler_fail', if: { fire: true }, show: { notFlag: 'boilerLit' } },
      { text: 'Go up into the hall', to: 'hall' },
    ],
  },
  boiler_fail: {
    on: [{ damage: 'd4', from: 'The boiler' }],
    text: ['The coal catches, splutters and goes out, and a cloud of soot comes out of the firebox and into your face.'],
    choices: [{ text: 'Try again', to: 'cellar' }],
  },
  boiler: {
    on: [{ flag: 'boilerLit' }, { add: ['ready', 1] }],
    text: ['The coal catches. The boiler groans, then rumbles, then thinks about it and roars. All over the manor, pipes that haven’t been warm in thirty years start to knock. Somewhere upstairs, a tap coughs.'],
    choices: [{ text: 'Go up into the hall', to: 'hall' }],
  },
  bathroom: {
    text: (c) => [
      'The bathroom in the east wing is magnificent: marble floor, gold taps, and a claw-footed bath you could row across.',
      c.flags.spongeGone ? 'The bath is empty and clean, or clean enough.' : 'Something lives in the bath. It is yellow, the size of a sheep and full of holes, and it has been growing there undisturbed for thirty years. It is a sponge, and it has ambitions.',
      c.flags.boilerLit ? 'The taps are hot to the touch.' : 'The taps are cold.',
      c.flags.lordWaiting ? 'Lord Mudlark sits on the edge of the bath, sulking, and leaving a ring.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Put Lord Mudlark in the bath', to: 'tub', show: { flag: 'lordWaiting' } },
      { text: 'Squeeze it out of the bath', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'sponge_out', fail: 'sponge_fight', show: { notFlag: 'spongeGone' } },
      { text: 'Pour salt from your rations on it, to dry it out', to: 'sponge_out', if: { item: 'rations' }, effects: [{ lose: 'rations' }], show: { notFlag: 'spongeGone' } },
      { text: 'Burn it', to: 'sponge_burnt', if: { fire: true }, show: { notFlag: 'spongeGone' } },
      { text: 'Fight it', to: 'sponge_fight', show: { notFlag: 'spongeGone' } },
      { text: 'Go down to the hall', to: 'hall' },
    ],
  },
  sponge_fight: {
    text: ['The sponge heaves itself up over the rim of the bath, wet and enormous, and comes at you with a noise like a mop going into a bucket.'],
    fight: {
      monsters: [{ name: 'The sponge', lvl: 2, hp: 6, range: 'engaged', onHit: { stat: 'Str', dd: 4, label: 'pull free', text: 'It wraps round you and squeezes.', effect: 'damage', amount: 'd4' }, note: 'Thirty years old; on hit, d4 Str save or take d4 more' }],
      win: 'sponge_beaten', flee: { to: 'hall', label: 'Run downstairs' },
      special: [{ label: 'Wring it out', test: { stat: 'Str', dd: 6, skill: 'bruteforce' }, flag: 'wrung', text: 'You get both arms round it and twist. Thirty years of bathwater comes out in a flood, and the sponge goes limp.', failText: 'It’s too wet to get a grip on.', win: true }],
    },
  },
  sponge_burnt: {
    on: [{ flag: 'spongeGone' }, { add: ['ready', 1] }],
    text: ['It takes a while to catch, being a sponge, but when it goes it goes, with a smell that is, remarkably, an improvement on the rest of the house.'],
    choices: [{ text: 'Back to the bathroom', to: 'bathroom' }],
  },
  sponge_beaten: {
    on: [{ flag: 'spongeGone' }, { add: ['ready', 1] }],
    text: ['The sponge goes limp at last, and you drag thirty years of it over the rim and out of the window. It lands in the moat with a long, wet sigh.'],
    choices: [{ text: 'Back to the bathroom', to: 'bathroom' }],
  },
  sponge_out: {
    on: [{ flag: 'spongeGone' }, { add: ['ready', 1] }],
    text: ['You heave the sponge out of the bath and out of the window. It lands in the moat with a sigh and floats off, perfectly happy.'],
    choices: [{ text: 'Back to the bathroom', to: 'bathroom' }],
  },
  sty: {
    text: (c) => [
      'Behind the manor, in the pig sty, up to his knees in it, stands Lord Mudlark: round, pink and brown in roughly equal amounts. He is scratching a pig with a stick. The pig is cleaner than he is.',
      c.flags.lordAngry ? '“You,” he says. “The bather. Stay back. I have a pig and I’m not afraid to use it.”' : '“Who are you?” he says. “Mother sent you, didn’t she? I can smell soap.”',
    ],
    choices: [
      { text: 'Tell him it’s not a bath, it’s a mud bath, and very fashionable', test: { stat: 'Cha', dd: 6, skill: ['lying'], profs: ['Envoy'], why: 'you know what nobles like' }, pass: 'lured', fail: 'lord_fight', show: { notFlag: 'lordAngry' } },
      { text: 'Ask him whether Lady Primrose likes the smell', test: { stat: 'Cha', dd: 8, skill: ['social'] }, pass: 'lured', fail: 'lord_fight', show: { notFlag: 'lordAngry' } },
      { text: 'Clap your manacles on him while he’s busy with the pig', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'caught', fail: 'lord_fight', if: { item: 'manacles' } },
      { text: 'Lasso him with your rope', test: { stat: 'Dex', dd: 8, skill: ['athletics'], profs: ['Hunter'], why: 'you can rope an animal' }, pass: 'caught', fail: 'lord_fight', if: { item: 'rope' } },
      { text: 'Wave your smelling salts under his nose, so he can smell himself', to: 'salted', if: { item: 'salts' } },
      { text: 'Grab him', to: 'lord_fight' },
    ],
  },
  salted: {
    text: ['Lord Mudlark sniffs the salts. His eyes water. His nose, for the first time in thirty years, starts to work. He looks down at himself. He sniffs again. “Oh,” he says, in a very small voice. “Oh, no. Is that me?” He goes very quiet, and lets you lead him indoors by the sleeve.'],
    choices: [{ text: 'Take him up to the bathroom', to: 'tub' }],
  },
  lured: {
    text: ['Lord Mudlark brightens. “A mud bath,” he says. “Mother never lets me have a mud bath.” He follows you indoors, leaving a trail across the carpets, humming.'],
    choices: [{ text: 'Take him up to the bathroom', to: 'tub' }],
  },
  caught: {
    text: ['Lord Mudlark is a lord, and has never been told no, and doesn’t know what to do when he’s tied up. He comes along, complaining, but he comes.'],
    choices: [{ text: 'Take him up to the bathroom', to: 'tub' }],
  },
  lord_fight: {
    on: [{ flag: 'lordAngry' }],
    text: ['Lord Mudlark comes out of the sty at you with his stick. The pig watches, with interest, from a safe distance.'],
    fight: {
      monsters: [mudlark],
      win: 'lord_beaten', flee: { to: 'hall', label: 'Retreat indoors' },
      special: [{ label: 'Throw a bucket of water over him', if: { item: 'bucket' }, flag: 'splashed', text: 'He gets a bucket of water full in the face and stops dead, gasping, as if you’d thrown acid. It’s the first water that’s touched him in thirty years.', stun: 1 }],
    },
  },
  lord_beaten: {
    text: ['Lord Mudlark sits down in the mud, which he finds comforting, and lets himself be led away.'],
    choices: [{ text: 'Take him up to the bathroom', to: 'tub' }],
  },
  tub: {
    text: (c) => [
      c.flags.boilerLit ? 'You turn the gold taps. Hot water roars into the bath.' : 'You turn the gold taps. Cold water dribbles out, brown at first, then clear.',
      c.flags.spongeGone ? '' : 'The sponge is still in the bath, and it is not making room.',
    ].filter(Boolean),
    choices: [
      { text: 'Put him in the bath and scrub him with the Dowager’s soap', to: 'scrubbed', if: { item: 'soap' }, show: READY },
      { text: 'Put him in a cold bath anyway', to: 'cold_bath', show: { flag: 'spongeGone', notFlag: 'boilerLit' } },
      { text: 'Throw him in the moat and hope', to: 'moat' },
      { text: 'Put him in with the sponge', to: 'sponge_bath', show: { notFlag: 'spongeGone' } },
      { text: 'Lock him in the bathroom and get things ready first', to: 'bathroom', effects: [{ flag: 'lordWaiting' }], show: { none: [READY, { flag: 'lordWaiting' }] } },
    ],
  },
  scrubbed: {
    on: [{ flag: 'clean' }, { lose: 'soap' }, { item: 'signet', msg: 'Under the third layer of mud: Lord Mudlark’s signet ring, lost in his teens. Worth 40GP.' }],
    text: ['It takes four hours and the whole bar of soap. The water goes brown, then black, then something you don’t have a word for. Under the mud, layer after layer, you find a lord, quite pink, rather handsome and very cross. He emerges smelling of carbolic and squeaking slightly when he walks.'],
    choices: [{ text: 'Present him to his mother', to: 'wedding' }],
  },
  cold_bath: {
    on: [{ flag: 'halfClean' }],
    text: ['You get him into the cold bath. He screams for an hour, which helps loosen the outer layers. He comes out the colour of a plum and only somewhat cleaner.'],
    choices: [{ text: 'Present him to his mother', to: 'wedding' }],
  },
  sponge_bath: {
    on: [{ flag: 'halfClean' }, { damage: 'd4', from: 'The sponge' }],
    text: ['You push him in. The sponge, delighted to have company after thirty years, wraps itself round him lovingly and scrubs. It takes the mud. It also takes his eyebrows, and a little skin, and you, for a while, when you try to pull him out.'],
    choices: [{ text: 'Present him to his mother', to: 'wedding' }],
  },
  moat: {
    on: [{ flag: 'moated' }],
    text: ['You throw Lord Mudlark in the moat. He sinks, rises, and climbs out, wearing a coat of pondweed over his coat of mud. He looks no cleaner, but he smells very slightly of pond, which is a change.'],
    choices: [{ text: 'Present him to his mother', to: 'wedding' }],
  },
  wedding: {
    end: 'victory',
    on: [
      { if: { flag: 'clean' }, gold: 200, uncapped: true, msg: 'The Dowager pays 200GP, with her handkerchief down for the first time in thirty years.' },
      { if: { flag: 'halfClean' }, gold: 80, uncapped: true, msg: 'The Dowager pays 80GP, which she says is generous.' },
      { sell: { item: 'signet', gold: 40, text: 'A fence in the village buys the signet ring' } },
      { if: { flag: 'footmenClean' }, gold: 20, uncapped: true, msg: 'The footmen club together to thank you: 20GP.' },
    ],
    text: (c) => [
      c.flags.clean ? 'At noon, Lady Primrose’s mother checks behind Lord Mudlark’s ears, twice, and nods. The wedding goes ahead. The bride faints at the altar from the shock of being able to breathe.'
        : c.flags.halfClean ? 'At noon, Lady Primrose’s mother checks behind Lord Mudlark’s ears, and finds something living there. The wedding goes ahead anyway, but with all the windows open.'
          : c.flags.moated ? 'At noon, Lady Primrose’s mother takes one look at Lord Mudlark, dripping pondweed at the altar, and takes her daughter home. The Dowager pays you nothing and gives you the handkerchief, which you suspect is an insult.'
            : 'The wedding is called off. Lord Mudlark goes back to his sty, happier than he’s been all week. The Dowager pays you nothing.',
      `You leave Mudlark Manor with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}, and a smell that takes three days to wear off.`,
    ],
  },
};

export const DEATH_TEXT = [
  'You die in Mudlark Manor, and nobody notices for a week, because of the smell.',
  'Your adventure ends here.',
];
