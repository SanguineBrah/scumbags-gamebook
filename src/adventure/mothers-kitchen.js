// MOTHER'S KITCHEN — steal a prize turnip from a hill giant's cottage. For a level 3–4 scumbag.
// The `noise` counter rises with every clumsy act; at 3, Mother comes back (see `redirect` on the kitchen).

export const META = {
  tier: 4, id: 'mothers-kitchen', title: 'Mother’s Kitchen', levels: '3–4', final: 'turnbull',
  blurb: 'Farmer Turnbull lost the last oversized turnip at market to a stranger. Then a hill giant grew a bigger one, had it gilded, and won every prize in the county. Turnbull will pay 300 gold to see it gone. It sits on her mantelpiece, forty feet up.',
};

const NOISE = (n = 1) => ({ add: ['noise', n] });
const QUIET = { below: ['noise', 3] };
const louse = { name: 'Head louse', lvl: 3, range: 'engaged', ap: 4, onHit: { stat: 'Con', dd: 6, label: 'shake off the itch', text: 'It bites. The itch is unbearable.', effect: 'damage', amount: 'd4' }, note: 'The size of a pig; shell (4 AP); on hit, d6 Con save or take d4 more' };

export const SECTIONS = {
  start: {
    on: [{ gold: 20, msg: 'Turnbull pays you 20GP in advance, in turnips. You sell them on the way.' }], onceOnly: true,
    text: [
      'Farmer Turnbull meets you behind the pig sheds. He has the eyes of a man who has been outbid for a turnip and has thought about nothing else since.',
      '“Mother’s Golden Turnip,” he spits. “Grown by a giant. Gilded by a giant. Wins the county fair every year by a giant margin. It sits on her mantelpiece up on Hogback Hill. Bring it to me and I’ll pay three hundred gold.” He leans closer. “Mind the baby.”',
    ],
    choices: [{ text: 'Walk up Hogback Hill', to: 'cottage' }],
  },
  cottage: {
    text: [
      'Mother’s cottage is a perfectly ordinary cottage, except that it is a hundred feet tall. Roses the size of cartwheels climb the walls. The front door could let a galleon through, and there is a gap under it you could drive a cart into. A cat flap the size of a barn door swings in the breeze. Ivy as thick as your arm climbs to an open window.',
      'Out by the well, you can see Mother herself, drawing water in a bucket the size of a house. She is humming. She will be back.',
    ],
    choices: [
      { text: 'Crawl under the front door', to: 'kitchen' },
      { text: 'Go through the cat flap', to: 'cat_flap' },
      { text: 'Climb the ivy to the open window', test: { stat: 'Str', dd: 8, skill: ['athletics'], profs: ['Woodcutter', 'Hunter'], why: 'you know how to climb', mods: [{ if: { anyItem: ['climbing', 'rope'] }, dd: 4 }] }, pass: 'bedroom', fail: 'ivy_fall' },
    ],
  },
  ivy_fall: {
    on: [{ damage: '2d4', from: 'The ivy' }],
    text: ['Forty feet up, a leaf the size of a shield comes away in your hand.'],
    choices: [{ text: 'Try another way', to: 'cottage' }],
  },
  cat_flap: {
    text: (c) => [c.flags.tiddlesAngry
      ? 'The cat flap swings shut behind you with another BANG. Tiddles is waiting on the other side, wide awake this time, tail lashing.'
      : 'The cat flap swings shut behind you with a BANG that echoes through the cottage. On the other side, in a basket the size of a haycart, an enormous ginger cat opens one eye. A brass tag on its collar reads TIDDLES.'],
    on: [NOISE()],
    choices: [
      { text: 'Freeze and hope', test: { stat: 'Dex', dd: 8, save: true }, pass: 'kitchen', fail: 'tiddles_fight', show: { notFlag: 'tiddlesAngry' } },
      { text: 'Let your rat go as a distraction', to: 'tiddles_rat', if: { item: 'rat' } },
      { text: 'Offer it your rations', to: 'tiddles_fed', if: { item: 'rations' } },
      { text: 'Fight it', to: 'tiddles_fight' },
    ],
  },
  tiddles_rat: {
    on: [{ lose: 'rat' }],
    text: ['Your rat takes one look at Tiddles and makes the decision any rat would. Tiddles follows it at high speed. You will miss that rat. You won’t miss it much.'],
    choices: [{ text: 'Go on into the kitchen', to: 'kitchen' }],
  },
  tiddles_fed: {
    on: [{ lose: 'rations' }],
    text: ['Tiddles sniffs your rations, eats all five days of them in one go, including the wrapping, and goes back to sleep. To a cat that size, it was a biscuit.'],
    choices: [{ text: 'Go on into the kitchen', to: 'kitchen' }],
  },
  tiddles_fight: {
    on: [{ flag: 'tiddlesAngry' }],
    text: ['Tiddles stretches, which takes a while, and then pounces, which doesn’t.'],
    fight: {
      monsters: [{ name: 'Tiddles', lvl: 4, range: 'engaged', onHit: { stat: 'Dex', dd: 6, label: 'stay on your feet', text: 'A paw pins you to the floor.', effect: 'prone' }, note: 'Enormous ginger cat; on hit, d6 Dex save or be pinned (prone)' }],
      win: 'tiddles_win', flee: { to: 'cottage', label: 'Dive back out through the flap' },
    },
  },
  tiddles_win: {
    on: [{ flag: 'tiddlesGone' }, NOISE()],
    text: ['Tiddles decides you are not worth it, in the way only cats can, and stalks off to sit in a sunbeam and pretend none of this happened.'],
    choices: [{ text: 'Go on into the kitchen', to: 'kitchen' }],
  },
  kitchen: {
    redirect: [{ if: { atLeast: ['noise', 3], notFlag: 'motherHome' }, to: 'mother_back' }],
    text: (c) => [
      'Mother’s kitchen is a cathedral of crockery. Table legs rise like tree trunks to a tabletop forty feet up. A dresser towers against one wall, and a door to the larder stands ajar.',
      (c.flags.fireOut ? 'At the far end, a hearth you could hold a barn dance in sits cold and dripping.' : 'At the far end, a fire crackles in a hearth you could hold a barn dance in.')
        + (c.flags.turnip ? (c.significant.some((i) => i.id === 'turnip') ? ' The mantelpiece above it is bare. The Golden Turnip is in your arms.' : ' The mantelpiece above it is bare.') : ` On the mantelpiece above it, ${c.flags.fireOut ? 'gleaming' : 'catching the firelight'}, sits the Golden Turnip.`),
      c.flags.motherAsleep ? `Mother is asleep in her rocking chair by the ${c.flags.fireOut ? 'cold hearth, wrapped in a shawl' : 'fire'}, snoring like a landslide.`
        : c.flags.motherOut ? 'Out in the garden, Mother is calling for a lamb that isn’t there.'
          : (c.flags.noise || 0) ? 'Somewhere outside, the humming has stopped. Mother is listening.' : 'Through the window, you can hear Mother humming by the well.',
      'A doorway leads to the nursery.',
    ],
    choices: [
      { text: 'Climb the table leg', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing', 'spikes'] }, dd: 4 }] }, pass: 'table', fail: 'table_fall' },
      { text: 'Raid the larder', to: 'larder' },
      { text: 'Climb the dresser', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing', 'spikes'] }, dd: 4 }] }, pass: 'dresser', fail: 'dresser_fall', show: { notFlag: 'thimble' } },
      { text: 'Climb up to the mantelpiece', to: 'mantel_climb' },
      { text: 'Go into the nursery', to: 'nursery' },
      { text: 'Leave', to: 'turnbull' },
    ],
  },
  table_fall: {
    on: [{ damage: 'd6', from: 'The floor' }, NOISE()],
    text: ['You slide down the table leg with a squeal like a fingernail on a slate. Outside, the humming stops.'],
    choices: [{ text: 'Get up', to: 'kitchen' }],
  },
  table: {
    text: ['The tabletop is a plain of scrubbed pine. A loaf the size of a haystack. A teacup you could bathe in. A pair of knitting needles like lances. A ball of wool. And Mother’s purse, open, with a coin in it the size of a cartwheel.'],
    choices: [
      { text: 'Prise a chunk off the giant coin', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'coin', fail: 'coin_noise', show: { notFlag: 'coin' } },
      { text: 'Drag a knitting needle to the edge of the table', to: 'needle', show: { notFlag: 'needle' } },
      { text: 'Climb down', to: 'kitchen' },
    ],
  },
  coin: {
    on: [{ flag: 'coin' }, { gold: 80 }],
    text: ['The giant coin is soft gold, and with enough leverage a chunk the size of a dinner plate comes away. It is worth a fortune. It is a very small part of one of Mother’s pennies.'],
    choices: [{ text: 'Back across the table', to: 'table' }],
  },
  coin_noise: {
    on: [NOISE(), { damage: 'd4', from: 'The coin' }],
    text: ['The coin slips, rolls, and falls off the table onto the stone floor with a sound like a cathedral bell. You’re lucky it didn’t take you with it.'],
    choices: [{ text: 'Climb down before anyone comes', to: 'kitchen' }],
  },
  needle: {
    on: [{ flag: 'needle' }],
    text: ['A knitting needle is too big to use as a weapon, but just right as a bridge. You haul it to the edge of the table and swing the far end across to the mantelpiece. It’ll hold, probably.'],
    choices: [
      { text: 'Cross the needle to the mantelpiece', test: { stat: 'Dex', dd: 6, save: true }, pass: 'mantel', fail: 'needle_fall' },
      { text: 'Tie your rope to the teacup handle as a safety line, then cross', to: 'mantel', if: { item: 'rope' } },
      { text: 'Back across the table', to: 'table' },
    ],
  },
  needle_fall: {
    on: [{ damage: '2d6', from: 'The fall' }, NOISE()],
    text: ['Halfway across, the needle rolls. You don’t.'],
    choices: [{ text: 'Get up', to: 'kitchen' }],
  },
  larder: {
    text: ['The larder smells of cheese and old stone. Cheeses the size of millstones, a ham like a fallen tree, and on the floor, a mousetrap the size of a cart, baited with a lump of cheese you could live in.'],
    choices: [
      { text: 'Eat some ham', to: 'ham', show: { notFlag: 'ham' } },
      { text: 'Take the cheese off the mousetrap', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], why: 'disarming traps' }, pass: 'trap_cheese', fail: 'trap_snap', show: { notFlag: 'trap' } },
      { text: 'Set the trap off from a safe distance with your pole, then take the cheese', to: 'trap_poked', if: { anyItem: ['pole', 'prybar'] }, show: { notFlag: 'trap' } },
      { text: 'Jam the trap with an iron spike, then take the cheese', to: 'trap_cheese', if: { item: 'spikes' }, show: { notFlag: 'trap' } },
      { text: 'Back to the kitchen', to: 'kitchen' },
    ],
  },
  ham: {
    on: [{ flag: 'ham' }, { heal: '2d6' }],
    text: ['You eat a slice of ham the size of a door. You feel much better, and slightly ashamed.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  trap_cheese: {
    on: [{ flag: 'trap' }],
    text: ['You ease the cheese off the trigger plate without a sound. Wedged under it is a silver ring, lost by Mother years ago and much too big to wear. You prise out its gemstone: a ruby the size of an egg.'],
    choices: [{ text: 'Pocket the ruby', to: 'ruby' }],
  },
  ruby: {
    on: [{ gold: 60, msg: 'The ruby is worth 60GP.' }],
    text: ['It glows like a coal in your pocket.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  trap_poked: {
    on: [{ flag: 'trap' }, NOISE()],
    text: ['You poke the trigger plate from ten feet away. SNAP. The bar comes down like a portcullis on nothing at all, loud enough to rattle the crockery. Under the cheese, wedged in the trap, is a silver ring, lost by Mother years ago, with a ruby the size of an egg.'],
    choices: [{ text: 'Prise out the ruby', to: 'ruby' }],
  },
  trap_snap: {
    on: [{ flag: 'trap' }, { damage: '2d6', from: 'The mousetrap' }, NOISE()],
    text: ['SNAP. The bar comes down like a portcullis, an inch from your nose and directly onto your foot.'],
    choices: [{ text: 'Limp back to the kitchen', to: 'kitchen' }],
  },
  dresser_fall: {
    on: [{ damage: 'd6', from: 'The dresser' }, NOISE()],
    text: ['A plate the size of a millwheel comes down with you and explodes on the flagstones.'],
    choices: [{ text: 'Get up', to: 'kitchen' }],
  },
  dresser: {
    on: [{ flag: 'thimble' }, { item: 'thimble' }],
    text: ['On the second shelf, among the giant crockery, sits Mother’s silver thimble. It’s the size of a bucket and worth a good sixty gold. It is also very, very shiny.'],
    choices: [{ text: 'Climb down', to: 'kitchen' }],
  },
  mantel_climb: {
    text: (c) => [c.flags.fireOut ? 'The hearth is cold and wet now. The chimney breast is an easy climb, if you don’t mind soot.' : 'The fire roars below the mantelpiece. Climbing the chimney breast means going up through the heat.'],
    choices: [
      { text: 'Climb up through the heat', test: { stat: 'Str', dd: 12, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 8 }] }, pass: 'mantel', fail: 'mantel_burn', show: { notFlag: 'fireOut' } },
      { text: 'Climb the cool chimney breast', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'mantel', fail: 'mantel_slip', show: { flag: 'fireOut' } },
      { text: 'Put the fire out with your bucket first', to: 'fire_out', if: { item: 'bucket' }, show: { notFlag: 'fireOut' } },
      { text: 'Go round by the table instead', to: 'kitchen' },
    ],
  },
  fire_out: {
    on: [{ flag: 'fireOut' }, NOISE()],
    text: ['It takes a lot of trips to the giant water butt with a normal-sized bucket. The fire dies with a hiss you could hear in the next county.'],
    choices: [{ text: 'Climb the cool chimney breast', test: { stat: 'Str', dd: 8, skill: ['athletics'] }, pass: 'mantel', fail: 'mantel_slip' }],
  },
  mantel_slip: {
    on: [{ damage: 'd6', from: 'The hearth' }],
    text: ['You slide down into the ashes, which are still warm.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  mantel_burn: {
    on: [{ damage: '2d6', from: 'The fire' }],
    text: ['Halfway up, your eyebrows go. Then your sleeves. You drop back to the floor smoking gently.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  mantel: {
    text: (c) => c.flags.turnip
      ? ['The mantelpiece is bare except for a little rosette that says FIRST.']
      : ['The mantelpiece is a long shelf of china dogs, each as big as a real one. In the middle, on a velvet cushion, under a rosette that says FIRST, sits the Golden Turnip: as big as a barrel, gilded from root to leaf, and absolutely ridiculous.'],
    choices: [
      { text: 'Take the Golden Turnip', to: 'turnip', show: { notFlag: 'turnip' } },
      { text: 'Climb down', to: 'kitchen' },
    ],
  },
  turnip: {
    on: [{ flag: 'turnip' }, { item: 'turnip', msg: 'It takes up three significant item slots, and all of your arms.' }, NOISE()],
    text: ['You roll it off its cushion. It’s heavier than it looks, and it looks very heavy. It goes over the edge of the mantelpiece, bounces off a china dog, and lands on the hearthrug with a thump that shakes the cottage.'],
    choices: [{ text: 'Climb down after it', to: 'kitchen' }],
  },
  nursery: {
    text: (c) => c.flags.babyAsleep
      ? ['The baby is asleep in its cot, sucking a thumb the size of a ham.']
      : c.flags.babyUpset ? ['The baby is still grizzling in its cot, red in the face. It sees you and holds out its arms, not sure whether to cry again or play.']
      : ['In a cot the size of a barn sits the baby: forty feet of chubby, curious hill giant in a bonnet. It sees you, and its face lights up. “TOY,” it says, and reaches through the bars.'],
    choices: [
      { text: 'Give it its rattle', to: 'baby_rattle', if: { item: 'rattle' }, show: { notFlag: 'babyAsleep' } },
      { text: 'Sing it a lullaby', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cleric', 'Missionary', 'Bodyguard'], why: 'you’ve sung people to sleep before' }, pass: 'baby_sleep', fail: 'baby_cries', show: { notFlag: 'babyAsleep' } },
      { text: 'Pick up the rattle from the floor', to: 'rattle', show: { notFlag: 'rattle' } },
      { text: 'Back to the kitchen', to: 'kitchen' },
    ],
  },
  rattle: {
    on: [{ flag: 'rattle' }, { item: 'rattle' }],
    text: ['The rattle is the size of a barrel and full of something that sounds like gravel. Carrying it quietly takes both hands and all your concentration.'],
    choices: [{ text: 'Back to the cot', to: 'nursery' }],
  },
  baby_rattle: {
    on: [{ flag: 'babyAsleep' }, { lose: 'rattle' }],
    text: ['You heave the rattle up through the bars. The baby shakes it twice, delighted, gives it a long suck, and falls fast asleep.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  baby_sleep: {
    on: [{ flag: 'babyAsleep' }],
    text: ['You sing the only lullaby you know, which is about a drowned sailor. The baby’s eyes droop. Its thumb goes in. It’s asleep before the sailor drowns.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  baby_cries: {
    on: [NOISE(2), { flag: 'babyUpset' }],
    text: ['Your singing voice is not what it was. The baby’s lip wobbles, and then it starts to cry: a sound like a herd of cattle falling down a well. Outside, the humming stops dead.'],
    fight: {
      monsters: [{ name: 'The baby', lvl: 4, hp: 20, range: 'engaged', feats: ['topple', 'coward'], note: 'Infant hill giant (20 HP); falls over at the end of each turn; gives up at half health' }],
      win: 'baby_stops', flee: { to: 'kitchen', label: 'Run for the kitchen' },
    },
  },
  baby_stops: {
    on: [{ flag: 'babyAsleep' }],
    text: ['The baby hiccups, sniffs, and falls asleep from the effort of crying.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  bedroom: {
    text: (c) => [c.flags.louse ? 'The bed is a valley of patchwork. On the dressing table, the hairbrush is still, and the louse lies on its back beside it.' : 'You climb in at the bedroom window. The bed is a valley of patchwork. On the dressing table, a hairbrush the size of a hedge. Something large moves among its bristles.'],
    choices: [
      { text: 'Search the dressing table', to: 'louse_fight', show: { notFlag: 'louse' } },
      { text: 'Creep downstairs to the kitchen', to: 'kitchen' },
    ],
  },
  louse_fight: {
    text: ['Out of the hairbrush clambers a head louse the size of a pig, with a shell like a cart roof and an appetite for anything warm.'],
    fight: { monsters: [louse], win: 'louse_win', flee: { to: 'kitchen', label: 'Run downstairs' } },
  },
  louse_win: {
    on: [{ flag: 'louse' }, { gold: 40, msg: 'In the hairbrush: three of Mother’s gold hairpins, each worth 40GP. You can carry one without looking ridiculous. You take one.' }], onceOnly: true,
    text: ['The louse lies on its back, legs curling. You will be scratching for days.'],
    choices: [{ text: 'Creep downstairs to the kitchen', to: 'kitchen' }],
  },
  mother_back: {
    on: [{ flag: 'motherHome' }],
    text: ['The front door swings open with a noise like a ship coming into harbour. Mother ducks in, puts down her bucket, and looks round her kitchen with an expression of infinite patience. She has heard something. She is going to find it.'],
    choices: [
      { text: 'Throw your voice out of the window, like a lost lamb', cast: 'voice', pass: 'mother_out', fail: 'mother_finds' },
      { text: 'Hide under the dresser', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'], profs: ['Hunter'], why: 'you know how to lie still' }, pass: 'mother_sits', fail: 'mother_finds' },
      { text: 'Cast Shroud and hide in the darkness', cast: 'shroud', pass: 'mother_sits', fail: 'mother_finds' },
      { text: 'Run for the gap under the door', test: { stat: 'Dex', dd: 12, save: true }, pass: 'turnbull', fail: 'mother_finds' },
    ],
  },
  mother_out: {
    on: [{ flag: 'motherOut' }],
    text: ['“Baa,” says the garden, plaintively. Mother sighs, picks up her bucket again, and goes back outside to look for a lamb. She will be some time. Hill-giant lambs are very easy to find, and this one isn’t there.'],
    choices: [{ text: 'Come out of hiding', to: 'kitchen' }],
  },
  mother_sits: {
    on: [{ flag: 'motherAsleep' }],
    text: ['Mother looks under the table, behind the bread bin and inside the teapot. Then she sighs, sits down in her rocking chair by the fire, picks up her knitting and, within a minute, is snoring like a landslide.'],
    choices: [{ text: 'Come out of hiding', to: 'kitchen' }],
  },
  mother_finds: {
    on: [{ flag: 'jarred' }],
    text: ['A hand the size of a cart closes round you. Mother holds you up to her face. Her eyes are kind and enormous. “What’s this, then?” she says. She doesn’t squash you. She does something worse: she pops you in an empty jam jar, screws the lid on, and puts you on the windowsill to show the vicar.'],
    choices: [
      { text: 'Unscrew the lid from the inside', test: { stat: 'Str', dd: 12, skill: ['bruteforce'] }, pass: 'jar_out', fail: 'jar_stuck' },
      { text: 'Lever the lid off with your pry bar', test: { stat: 'Str', dd: 6, skill: ['bruteforce'] }, pass: 'jar_out', fail: 'jar_stuck', if: { item: 'prybar' } },
      { text: 'Pick the jar’s lid open', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'jar_out', fail: 'jar_stuck', if: { item: 'tools' } },
      { text: 'Wait for the vicar', to: 'vicar' },
    ],
  },
  jar_stuck: {
    on: [{ damage: 'd4', from: 'The jar' }],
    text: ['The lid doesn’t budge. Your fingers do.'],
    choices: [
      { text: 'Try again', test: { stat: 'Str', dd: 12, skill: ['bruteforce'] }, pass: 'jar_out', fail: 'jar_stuck' },
      { text: 'Wait for the vicar', to: 'vicar' },
    ],
  },
  jar_out: {
    on: [{ flag: 'motherAsleep' }],
    text: ['The lid gives. You climb out onto the windowsill. Inside, Mother has fallen asleep in her rocking chair, knitting a sock you could live in.'],
    choices: [{ text: 'Climb down into the kitchen', to: 'kitchen' }],
  },
  vicar: {
    text: (c) => ['The vicar arrives at teatime. He is an ordinary-sized man who has been the hill giants’ vicar for forty years and is unsurprised by anything. He looks at you in your jar. “Ah,” he says. “Turnbull sent you, did he?”',
      `While Mother pours the tea, he unscrews the lid${c.flags.vicarTookIt ? ', quietly puts the Golden Turnip back on the mantelpiece' : ''} and drops you into his coat pocket. He carries you down the hill without a word, and sets you down in the lane. “Go home,” he says.`],
    on: [{ if: { item: 'turnip' }, flag: 'vicarTookIt' }, { lose: 'turnip' }, { unflag: 'turnip' }],
    choices: [{ text: 'Go to Turnbull’s', to: 'turnbull' }],
  },
  turnbull: {
    end: 'victory',
    on: [
      { sell: { item: 'turnip', gold: 300, text: 'Turnbull hugs the Golden Turnip and pays up' } },
      { sell: { item: 'thimble', gold: 60, text: 'A fence in the village buys the thimble' } },
    ],
    text: (c) => [
      c.flags.sold_turnip ? 'Turnbull weeps when he sees it. He hugs the Golden Turnip, then he hugs you, then he locks the turnip in his shed and sits outside it with a shotgun. You leave him there.' : 'Turnbull looks at your empty hands. “No turnip,” he says. He goes back inside without another word, and you hear him crying.',
      `You come down from Hogback Hill with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}. Every 200GP you squander on a pointless endeavour gains you a level.`,
    ],
  },
};

export const DEATH_TEXT = [
  'Somewhere far above you, a giant sighs, sweeps you into a dustpan and goes back to her knitting.',
  'Your adventure ends here.',
];
