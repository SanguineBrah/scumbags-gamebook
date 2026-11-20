// A PERFECTLY STANDARD DRAGON — deal with a dragon that is following procedure. For a level 9–10 scumbag.
// The dragon is old, lame and following procedure; the real problem is the slug eating its hoard.

export const META = {
  tier: 10, id: 'standard-dragon', title: 'A Perfectly Standard Dragon', levels: '9–10', final: 'epilogue',
  blurb: 'A dragon has moved into the mountain above Much Smallness and filed all the right paperwork. It has demanded a maiden, a sheep a week and the usual tribute. The village has offered the standard dragon bounty of one thousand gold. It is the sort of job a scumbag only gets once. It is probably the sort of job a scumbag only gets once.',
};

const UNITS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const COUNT = (n) => n < 20 ? UNITS[n] : n < 30 ? `twenty${n > 20 ? `-${UNITS[n - 20]}` : ''}` : String(n);
const dragon = { name: 'Old Scorchwell', lvl: 9, hp: 34, dmg: '2d6+3', range: 'short', feats: ['breath'], note: 'A perfectly standard dragon, but old (bites for 2d6+3; few teeth left); breathes fire (sometimes, instead of attacking, d12 Dex save or 5d6 fire damage, half on a success); lame, so it can’t fly' };
const slug = { name: 'Thirty-foot slug', lvl: 8, hp: 44, range: 'engaged', onHit: { stat: 'Dex', dd: 10, label: 'keep your feet', text: 'You slip on the slime.', effect: 'prone' }, note: 'Thirty feet of slug; on hit, d10 Dex save or fall over in its slime; salt is very bad for it' };

export const SECTIONS = {
  start: {
    text: (c, visits) => visits > 1 ? ['Back in Much Smallness, the mayor is filling in a form, and Agnes is still on her bench with her packed lunch. Above the village, smoke curls out of the cave in a very standard way.'] : [
      'The mayor of Much Smallness reads you the form. “A dragon,” he says, “has been sighted. It has demanded, tick one, a maiden. Reward, one thousand gold, payable on proof of removal. Proof of removal,” he adds, “is usually the head.”',
      'Outside the town hall, the village’s maiden waits on a bench with a packed lunch. Her name is Agnes, she is seventy-four, and she volunteered. Above the village, smoke curls out of a cave near the top of the mountain, in a very standard way.',
    ],
    choices: [
      { text: 'Talk to Agnes', to: 'agnes', show: { notFlag: 'agnes' } },
      { text: 'Buy a sack of salt from the general store (5GP)', to: 'salt', if: { gold: 5 }, show: { notFlag: 'salt' } },
      { text: 'Climb the mountain', to: 'path' },
    ],
  },
  agnes: {
    on: [{ flag: 'agnes' }],
    text: ['“I took it some soup,” says Agnes. “He’s ever so polite. Bad leg. Can’t get about. He says he doesn’t even want a maiden, it’s just on the form.” She lowers her voice. “And there’s something down in the bottom of his cave that’s eating his gold. Leaves a trail. You should’ve seen my shoes.”'],
    choices: [{ text: 'Back to the village', to: 'start' }],
  },
  salt: {
    on: [{ flag: 'salt' }, { gold: -5 }],
    text: ['The shopkeeper sells you a sack of salt, and asks what it’s for. You say “slugs,” to see what happens. He nods slowly, and gives you a second sack for free.'],
    choices: [{ text: 'Back to the village', to: 'start' }],
  },
  path: {
    text: ['Halfway up the mountain, the path stops at a gorge. There used to be a bridge. There are now two posts and a scorch mark. The cave mouth is just on the other side, forty feet across and a long way down.'],
    choices: [
      { text: 'Climb down and up the other side', test: { stat: 'Str', dd: 6, skill: ['athletics'] }, pass: 'cave', fail: 'fall', if: { item: 'climbing' } },
      { text: 'Lasso the far post with your rope and swing across', test: { stat: 'Dex', dd: 10, skill: ['athletics'], profs: ['Hunter'], why: 'you can hit what you aim at' }, pass: 'cave', fail: 'fall', if: { item: 'rope' } },
      { text: 'Lay your pole across the narrowest part and shuffle over', test: { stat: 'Dex', dd: 8, skill: ['athletics'] }, pass: 'cave', fail: 'fall', if: { item: 'pole' } },
      { text: 'Climb down and up without any gear', test: { stat: 'Str', dd: 12, skill: ['athletics'] }, pass: 'cave', fail: 'fall' },
      { text: 'Cast Step, and appear on the far side', cast: 'step', pass: 'cave', fail: 'path' },
      { text: 'Cast Ascend, and float across', cast: 'ascend', pass: 'cave', fail: 'path', critFail: 'gorge_descend' },
      { text: 'Take the long way round, through the lower caves', to: 'lower' },
    ],
  },
  fall: {
    on: [{ damage: '3d6', from: 'The gorge' }],
    text: ['You fall into the gorge, bouncing off most of it. At the bottom, a slimy trail leads into a tunnel in the mountain. It smells of slug and money.'],
    choices: [{ text: 'Follow the trail', to: 'lower' }],
  },
  lower: {
    dark: 'caves',
    redirect: [{ if: { flag: 'slugDead' }, to: 'lair' }],
    text: (c) => [
      'The lower caves are wet, low and coated in slime. Gold coins lie scattered in the trail, all of them chewed. Ahead, something huge is moving in the dark, slowly, with a noise like a bath being emptied.',
      c.flags.salt ? 'You have a sack of salt.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Pour a ring of salt across the tunnel and wait for it', to: 'salt_trap', if: { flag: 'salt', flagText: 'a sack of salt' } },
      { text: 'Dig a pit in the soft floor with your shovel, and lure it in', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'pit', fail: 'slug_fight', if: { anyItem: ['shovel', 'pick'] } },
      { text: 'Pour your oil down the trail and set it alight', to: 'slug_burn', if: { item: 'oil', fire: true } },
      { text: 'Sneak past it to the upper cave', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'], mods: [{ if: { light: true }, dd: 8 }] }, pass: 'lair', fail: 'slug_fight' },
      { text: 'Cast Pillar of salt on it', cast: 'pillar', pass: 'slug_salted', fail: 'slug_fight', critFail: 'slug_stone' },
      { text: 'Cast Judgement on it', cast: 'judgement', pass: 'slug_converts', fail: 'slug_fight', critFail: 'slug_deluge' },
      { text: 'Cast Invisibility on yourself, and slide past it to the upper cave', cast: 'invisibility', pass: 'lair', fail: 'slug_fight' },
      { text: 'Attack it', to: 'slug_fight' },
    ],
  },
  salt_trap: {
    dark: 'caves',
    on: [{ flag: 'slugDead' }],
    text: ['The slug comes round the corner, touches the salt, and stops. It considers the salt for a long time. Then it shrinks, slowly, steaming, to the size of a man, then a dog, then a sad wet sock. In the slime where it was lies everything it ate: a heap of chewed gold.'],
    choices: [{ text: 'Gather up the gold', to: 'slug_gold' }],
  },
  pit: {
    dark: 'caves',
    on: [{ flag: 'slugDead' }],
    text: ['The slug slides straight into your pit and can’t get out, because slugs don’t climb so much as smear, and the sides are sand. It lies at the bottom, looking up at you. Under it, glinting, is a heap of chewed gold.'],
    choices: [{ text: 'Fish out the gold with your shovel', to: 'slug_gold' }],
  },
  slug_burn: {
    dark: 'caves', litIf: true,   // the slime is on fire
    on: [{ lose: 'oil' }],
    text: ['The oil catches with a WHOOMPH and races up the slime trail, which turns out to be very flammable. Somewhere ahead, the slug screams, which you didn’t know slugs could do. It comes round the corner on fire.'],
    fight: {
      monsters: [{ ...slug, hp: 26 }], win: 'slug_down', flee: { to: 'path', label: 'Run back out into the gorge' },
      special: [{ label: 'Throw salt at it', if: { flag: 'salt' }, flag: 'saltThrown', text: 'A double handful of salt. The slug hisses and shrinks.', dmg: '4d6' }],
    },
  },
  slug_fight: {
    dark: 'caves',
    text: ['Thirty feet of slug comes round the corner at a surprising speed, which is to say a walking pace.'],
    fight: {
      monsters: [slug], win: 'slug_down', flee: { to: 'path', label: 'Run back out into the gorge' },
      special: [
        { label: 'Throw salt at it', if: { flag: 'salt' }, flag: 'saltThrown', text: 'A double handful of salt. The slug hisses and shrinks.', dmg: '4d6' },
        { label: 'Wave your smelling salts at it', if: { item: 'salts' }, flag: 'smelled', text: 'It is not that kind of salt. The slug is now extremely alert.' },
      ],
    },
  },
  slug_down: {
    dark: 'caves',
    on: [{ flag: 'slugDead' }],
    text: ['The slug collapses, which for a slug is mostly a change of attitude. Under where it lay, in the slime, is a heap of chewed gold.'],
    choices: [{ text: 'Gather up the gold', to: 'slug_gold' }],
  },
  slug_gold: {
    dark: 'caves',
    on: [{ gold: 200, uncapped: true, msg: 'Chewed gold spends the same: 200GP.' }], onceOnly: true,
    text: ['You fill your pockets with gold that has been inside a slug. Above, through a crack in the cave roof, you can hear somebody reading out loud.'],
    choices: [{ text: 'Climb up to the lair', to: 'lair' }],
  },
  cave: {
    text: ['The cave mouth is wide and scorched. Inside, the tunnel climbs towards firelight. Down a side passage, a slimy trail leads into the dark.'],
    choices: [{ text: 'Go up into the lair', to: 'lair' }, { text: 'Follow the slimy trail down', to: 'lower', show: { notFlag: 'slugDead' } }],
  },
  lair: {
    text: (c, visits) => [
      'The lair is enormous, and mostly empty. There’s a hoard, but it’s smaller than it should be, and there’s a trail of slime around it. On top of the hoard lies a dragon: old, red, the size of a barn, with one hind leg in a sling and a pair of reading glasses on its nose. It is filling in a form.',
      c.flags.dragonAngry ? '“Back again,” it says, without looking up from its form. “I’ve put you down as a recurring nuisance. There’s a box for it.”'
        : visits > 1 ? '“Ah,” it says, peering at you over its glasses. “You again. Have you thought about my little problem?”'
          : '“Ah,” it says, peering at you over its glasses. “You’ll be the adventurer. I’m afraid I have to threaten you. It’s on the form.”',
      c.flags.slugDead ? '' : 'Below you, something huge and wet is eating its way through the floor of the hoard.',
    ].filter(Boolean),
    choices: [
      { text: 'Ask what the form says', to: 'form', show: { notFlag: 'form' } },
      { text: 'Look at its leg with your healer’s kit', to: 'leg', if: { item: 'healerskit' }, show: { notFlag: 'legFixed' } },
      { text: 'Cast Heal on its leg', cast: 'heal', pass: 'leg_healed', fail: 'lair', critFail: 'leg_harmed', show: { notFlag: 'legFixed' } },
      { text: 'Tell it about the slug, and offer a deal', to: 'deal', show: { notFlag: 'slugDead' } },
      { text: 'Tell it you’ve dealt with its slug', to: 'thanks', show: { flag: 'slugDead' } },
      { text: 'Fight it', to: 'dragon_fight' },
    ],
  },
  form: {
    on: [{ flag: 'form' }],
    text: ['“Form D7,” says the dragon. “Notice of Occupation. Tribute, threats, the maiden.” It sighs a little smoke. “I didn’t want a maiden. I don’t know what you’re meant to do with one. Agnes brings soup. If I don’t complete the form, I lose my licence. If I lose my licence, I’m just a lizard in a hole.” It looks at its leg. “I wanted to retire, you know. Somewhere warm. But you need a form for that, too.”'],
    choices: [
      { text: 'Forge a Form of Retirement with your quill', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'], profs: ['Envoy'], why: 'you have filled in a great many forms' }, pass: 'retired', fail: 'forgery', if: { item: 'quill' } },
      { text: 'Pretend to be from the Dragon Licensing Board, and grant it retirement', test: { stat: 'Cha', dd: 12, skill: ['lying'] }, pass: 'retired', fail: 'forgery' },
      { text: 'Cast Wish: “I wish this dragon were retired”', cast: 'wish', pass: 'wished', fail: 'lair' },
      { text: 'Cast Judgement on it, and convert it to law', cast: 'judgement', pass: 'dragon_judged', fail: 'lair', critFail: 'dragon_deluge' },
      { text: 'Back', to: 'lair' },
    ],
  },
  forgery: {
    on: [{ flag: 'dragonAngry' }],
    text: ['The dragon reads your form, and then reads it again, and then takes off its glasses. “This,” it says, “is a forgery. That’s a very serious matter. There’s a form for it.” It sets the form on fire, and then you.'],
    fight: { monsters: [dragon], distance: 1, win: 'dragon_down', flee: { to: 'path', label: 'Run for it' } },
  },
  leg: {
    on: [{ flag: 'legFixed' }],
    text: ['You look at the leg. It’s a thorn. It is a very big thorn, but it is a thorn. The dragon watches you pull it out, with tears in its eyes, partly from the pain and partly from the relief. It flexes its leg. “Good heavens,” it says. “I could fly again. I could fly somewhere warm.”'],
    choices: [{ text: 'Suggest it does exactly that', to: 'retired' }],
  },
  deal: {
    text: ['“A slug?” The dragon looks hurt. “I had assumed it was inflation.” It peers down through the floor. “If you get rid of it, I’ll give you half of whatever’s left. I can’t get down there. The leg.”'],
    choices: [{ text: 'Go down after the slug', to: 'lower' }, { text: 'Back', to: 'lair' }],
  },
  thanks: {
    on: [{ flag: 'grateful' }],
    text: ['“Gone?” The dragon is moved. It wipes its glasses. “Then please, take a share. And,” it adds, a bit shyly, “I don’t suppose you’d help with my form? I think I’m done with this. I should like to retire.”'],
    choices: [{ text: 'Help it retire', to: 'retired' }, { text: 'Fight it anyway', to: 'dragon_fight' }],
  },
  retired: {
    on: [{ flag: 'retired' }, { item: 'scale', msg: 'The dragon gives you one of its scales: proof of removal, for the mayor.' }, { gold: 300, uncapped: true, msg: 'And a share of the hoard: 300GP.' }],
    onceOnly: true,
    text: ['The dragon signs its retirement with a claw and a great deal of satisfaction. It gives you a scale for the mayor, and a share of the hoard for yourself. Then it limps or strides, depending on its leg, out of the cave mouth, spreads its wings, and is gone south, getting smaller, towards somewhere warm.'],
    choices: [{ text: 'Back down to the village', to: 'village' }],
  },
  dragon_fight: {
    on: [{ flag: 'dragonAngry' }],
    text: (c) => [
      'The dragon sighs, takes off its glasses, and folds them. “Very well,” it says. “It is, after all, on the form.”',
      c.flags.legFixed ? 'It rears up, both legs working, which you are now regretting.' : 'It can’t fly. It doesn’t need to.',
    ],
    fight: {
      monsters: [dragon], distance: 1, win: 'dragon_down', flee: { to: 'path', label: 'Run for the cave mouth' },
      special: [
        { label: 'Hold up your mirror and let it see the state of itself', if: { item: 'mirror' }, flag: 'dragonMirror', text: 'The dragon sees its reflection: old, grey round the snout, glasses askew. It stops, stricken, for a moment.', stun: 1 },
        { label: 'Hit its bad leg', if: { notFlag: 'legFixed' }, test: { stat: 'Dex', dd: 10, skill: 'attack:melee' }, flag: 'badLeg', text: 'You go for the bad leg. The dragon roars and goes down on its side.', failText: 'It sees you coming and tucks the leg away.', dmg: '3d8' },
      ],
    },
  },
  dragon_down: {
    on: [{ flag: 'dragonDead' }, { item: 'scale', msg: 'You take a scale for the mayor. The head would not fit through the door.' }, { gold: 500, uncapped: true, msg: 'The whole hoard is yours: 500GP.' }],
    onceOnly: true,
    text: ['The dragon lies down on its hoard, puts its glasses back on, and fills in one last box on its form. Then it closes its eyes. It was, in the end, a perfectly standard dragon, and you are a perfectly standard scumbag.'],
    choices: [{ text: 'Back down to the village', to: 'village' }],
  },
  village: {
    text: ['The mayor of Much Smallness examines the scale, ticks a box, and hands you a form. “Proof of removal,” he says. “Sign here.” Agnes, on her bench, eats her packed lunch.'],
    choices: [{ text: 'Sign, and take the bounty', to: 'epilogue' }],
  },
  epilogue: {
    end: 'victory',
    on: [{ if: { item: 'scale' }, lose: 'scale' }, { if: { any: [{ flag: 'retired' }, { flag: 'dragonDead' }], notFlag: 'wished' }, gold: 1000, uncapped: true, msg: 'The standard dragon bounty: 1000GP.' }, { if: { flag: 'wished' }, msg: 'The mayor can’t pay a bounty without proof of removal. There is no proof. There never was a dragon, officially.' }],
    text: (c) => [
      c.flags.retired
        ? 'Every winter, Agnes gets a postcard from somewhere warm, signed with a claw.'
        : 'They put up a statue of you in the square at Much Smallness. It looks nothing like you, which is probably for the best.',
      `That’s ${COUNT((c.done || []).length + 1)} bad idea${(c.done || []).length ? 's' : ''}, and you’re still here. Most scumbags end up in a ditch, a cage or a dragon. You’ve ended up in Much Smallness, with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing'} in your pockets and no idea what to do next. Something stupid, probably. It usually is.`,
    ],
  },
  gorge_descend: {
    on: [{ damage: '6d6', from: 'The fall' }],
    text: ['Your god scorns you. Instead of floating across, you are launched straight up out of the gorge, high enough to see three counties, and then you come down again, into the bottom of it.'],
    choices: [{ text: 'Follow the trail', to: 'lower' }],
  },
  slug_salted: {
    dark: 'caves',
    on: [{ flag: 'slugDead' }],
    text: ['Thirty feet of slug turns into thirty feet of salt, which, as far as the slug is concerned, is the worst thing that could possibly have happened. It stands in the tunnel, white and glittering, slowly crumbling. In the slime behind it lies everything it has eaten this year.'],
    choices: [{ text: 'Gather up the gold', to: 'slug_gold' }],
  },
  slug_stone: {
    dark: 'caves',
    text: ['Your god scorns you. Instead of salt, the slug’s skin turns to stone. It is now a thirty-foot slug made of granite, and it is very pleased about it.'],
    fight: { monsters: [{ ...slug, hp: slug.hp * 2, note: `${slug.note}; skin of stone (double HP)` }], win: 'slug_down', flee: { to: 'path', label: 'Run back up the tunnel' } },
  },
  slug_converts: {
    dark: 'caves',
    on: [{ flag: 'slugDead' }],
    text: ['The slug stops. It considers the light of law for a long time. Then it turns round, very slowly, and slides off down the tunnel to find something useful to do with its life. It leaves behind, in a neat pile, everything it has eaten this year.'],
    choices: [{ text: 'Gather up the gold', to: 'slug_gold' }],
  },
  slug_deluge: {
    dark: 'caves',
    text: ['Your god scorns you. Instead of judgement, you get a flood. It roars down the tunnel, and washes the slug, which is a slug, perfectly happily up the cave towards you.'],
    choices: [{ text: 'Brace yourself', to: 'slug_fight' }],
  },
  leg_healed: {
    on: [{ flag: 'legFixed' }],
    text: ['You lay your hands on the dragon’s leg and pray. Out of it, slowly, comes a thorn: a very big thorn, but a thorn. The wound closes behind it. The dragon flexes its leg. “Good heavens,” it says. “I could fly to the seaside on that. I’ve always wanted to retire to the seaside.”'],
    choices: [{ text: 'Suggest it does exactly that', to: 'retired' }],
  },
  leg_harmed: {
    text: ['Your god scorns you. Instead of healing, your prayer drives the thorn in deeper. The dragon screams, a noise like a forge exploding. When it stops, it takes off its glasses.'],
    choices: [{ text: 'Brace yourself', to: 'dragon_fight' }],
  },
  wished: {
    on: [{ flag: 'retired' }, { flag: 'wished' }],
    text: ['You wish the dragon were retired. It is. In fact, it always was: the dragon looks at you, puzzled, and explains that it retired last year, with its whole hoard, and is only here to collect its post. It picks up a letter, and flies off to the seaside. There is no scale for the mayor, and no share of the hoard. Wishes are like that.'],
    choices: [{ text: 'Back down to the village', to: 'epilogue' }],
  },
  dragon_judged: {
    text: ['The light of law falls on the dragon. Nothing happens. The dragon looks at you over its glasses. “I am a perfectly standard dragon,” it says. “I follow procedure. I am already as lawful as it gets.” It turns a page.'],
    choices: [{ text: 'Back', to: 'lair' }],
  },
  dragon_deluge: {
    text: ['Your god scorns you. Instead of judgement, a flood bursts out of the cave wall and fills the lair to the knees. The dragon’s paperwork floats away. It watches it go.'],
    choices: [{ text: 'Brace yourself', to: 'dragon_fight' }],
  },
};

export const DEATH_TEXT = [
  'The dragon fills in a form about you. It doesn’t take long.',
  'Your adventure ends here.',
];
