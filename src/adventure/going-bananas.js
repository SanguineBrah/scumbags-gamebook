// GOING BANANAS — deal with a runaway golem made of bananas before the Harvest Festival. For a level 4–5 scumbag.
// The golem is delicious, and everyone in Pippin-on-Wye knows it.

export const META = {
  tier: 5, id: 'going-bananas', title: 'Going Bananas', levels: '4–5', final: 'festival',
  blurb: 'For the Harvest Festival at Pippin-on-Wye, the Greengrocers’ Guild hired a hedge-wizard to bring their centrepiece to life: a nine-foot man made entirely of bananas. It walked off the float, through the market and into the orchards, and has been stamping about ever since. The Guild will pay 300 gold to have it gone by the mayor’s inspection. It is, everyone agrees, delicious.',
};

const golem = { name: 'Banana-flesh golem', lvl: 4, hp: 22, range: 'engaged', feats: ['dealD6', 'takeD6'], note: 'Nine feet of bananas; deals and receives +d6 damage; delicious' };
const flies = { name: 'Cloud of fruit flies', lvl: 2, hp: 6, range: 'engaged', feats: ['tiny'], note: 'A buzzing cloud the size of a cart; hard to hit (+2 to tests when being attacked)' };
const grocer = { name: 'Guild greengrocer', lvl: 2, hp: 8, range: 'engaged', note: 'Armed with a marrow; very protective of produce' };

export const SECTIONS = {
  start: {
    text: [
      'The Master of the Greengrocers’ Guild stands among the wreckage of a parade float that once said BOUNTIFUL HARVEST and now says BOUN. He is a stout man in an apron covered in medals. “Nine feet of prime bananas,” he says. “Animated. For the parade. It was supposed to wave.” He points down the market street, where every stall has been flattened and every fruit stall licked. “It didn’t wave.”',
      '“The mayor inspects the festival at sunset. If that thing is still loose, the Guild loses its charter. Three hundred gold. And whatever’s left of it is Guild property, mind. We’ll want it back for the custard.”',
    ],
    choices: [
      { text: 'Follow the trail of skins into the orchards', to: 'orchard' },
      { text: 'Find the hedge-wizard who animated it', to: 'wizard' },
    ],
  },
  wizard: {
    text: (c) => [c.flags.wizardTalked
      ? 'The hedge-wizard is still behind the cider tent, still eating a banana, still nervous.'
      : 'The hedge-wizard who animated the golem is hiding behind the cider tent, eating a banana, which may be evidence. “It’s scared,” he says, with his mouth full. “That’s all. It’s a banana. It knows what happens to bananas. Everybody keeps trying to peel it.” He swallows. “It wants to go somewhere warm, where nobody eats it. Like the Duke’s hothouse, over the hill. It said so. Well. It pointed.”'],
    on: [{ flag: 'wizardTalked' }],
    choices: [{ text: 'Go after it', to: 'orchard' }],
  },
  orchard: {
    text: (c) => [
      'The trail of skins leads into the orchards. Not the golem’s skins: everybody else’s. Half the village followed it in with bowls and spoons. The air is thick with the smell of banana and the buzz of fruit flies.',
      c.flags.fliesGone ? 'The fruit flies have gone.' : 'Between you and the trees hangs a cloud of fruit flies the size of a cart, humming.',
    ],
    choices: [
      { text: 'Walk through the flies', to: 'flies_fight', show: { notFlag: 'fliesGone' } },
      { text: 'Smoke them out with a torch', to: 'flies_smoked', if: { fire: true }, show: { notFlag: 'fliesGone' } },
      { text: 'Blow them away with your bellows', to: 'flies_smoked', if: { item: 'bellows' }, show: { notFlag: 'fliesGone' } },
      { text: 'Go round the long way', to: 'clearing', effects: [{ flag: 'longWay' }], show: { notFlag: 'fliesGone' } },
      { text: 'Into the trees', to: 'clearing', show: { flag: 'fliesGone' } },
      { text: 'Give up and go back to the Guild', to: 'festival' },
    ],
  },
  flies_fight: { outdoors: true,
    text: ['The fruit flies come at you in a cloud, up your nose and in your ears and, you suspect, in your soul.'],
    fight: { monsters: [flies], win: 'flies_gone', flee: { to: 'orchard', label: 'Run out of the cloud' } },
  },
  flies_smoked: {
    on: [{ flag: 'fliesGone' }],
    text: ['The fruit flies take one sniff and leave for somewhere with less going on.'],
    choices: [{ text: 'Into the trees', to: 'clearing' }],
  },
  flies_gone: {
    on: [{ flag: 'fliesGone' }],
    text: ['You flail until the cloud gives up and drifts off to find a bin. You will be picking fruit flies out of your ears for a week.'],
    choices: [{ text: 'Into the trees', to: 'clearing' }],
  },
  clearing: {
    text: (c) => [
      c.flags.longWay ? 'Going the long way round takes an hour, and you arrive scratched and late.' : '',
      'In a clearing among the apple trees stands the golem: nine feet tall, man-shaped, made of bananas, still in the bunches. It is beginning to go brown at the edges. Around it, at a respectful distance, stand a dozen villagers with spoons. Every so often one of them darts in and peels a bit. The golem flinches.',
      c.flags.golemTrusts ? 'The golem watches you, and waits.' : 'It sees you, and backs into a tree.',
    ].filter(Boolean),
    choices: [
      { text: 'Chase the villagers off', test: { stat: 'Cha', dd: 8, skill: ['social', 'bruteforce'], profs: ['Bodyguard', 'Pit fighter'], why: 'you know how to clear a room' }, pass: 'villagers_gone', fail: 'villagers_angry', show: { notFlag: 'villagersGone' } },
      { text: 'Talk to the golem', test: { stat: 'Cha', dd: 6, skill: ['social', 'languages'], profs: ['Missionary', 'Cleric'], why: 'you know how to calm the frightened' }, pass: 'golem_talk', fail: 'golem_panics', show: { notFlag: 'golemTrusts' } },
      { text: 'Offer it the shelter of your tent', to: 'golem_talk', if: { item: 'tent' }, show: { notFlag: 'golemTrusts' } },
      { text: 'Cast Tongues on the golem, so it can say what it wants', cast: 'tongues', pass: 'golem_speaks', fail: 'golem_panics', critFail: 'golem_silent', show: { notFlag: 'golemTrusts' } },
      { text: 'Cast Command on it: “Come with me”', cast: 'command', pass: 'golem_commanded', fail: 'golem_panics' },
      { text: 'Lead it to the Duke’s hothouse, over the hill', to: 'road', show: { flag: 'golemTrusts' } },
      { text: 'Cast Famine on it, so it smells rotten and nobody wants to eat it', cast: 'famine', pass: 'famine', fail: 'golem_panics', critFail: 'custard', show: { notFlag: 'villagersGone' } },
      { text: 'Attack it', to: 'golem_fight' },
      { text: 'Rope it and drag it back to the Guild', test: { stat: 'Str', dd: 10, skill: ['athletics'] }, pass: 'dragged', fail: 'golem_fight', if: { anyItem: ['rope', 'chain'] } },
    ],
  },
  villagers_gone: {
    on: [{ flag: 'villagersGone' }],
    text: ['You wave your arms and shout and threaten the villagers with a fruit-tax, and they go, spoons and all. The golem stops flinching.'],
    choices: [{ text: 'Back to the golem', to: 'clearing' }],
  },
  villagers_angry: {
    text: ['The villagers do not want to be chased off. They want custard. A large woman with a ladle explains this to you, firmly.'],
    fight: { outdoors: true,
      monsters: [{ name: 'Hungry villager', lvl: 1, hp: 4, range: 'engaged', feats: ['coward'], note: 'Spoon; custard on the brain; gives up at half health' }, { name: 'Woman with a ladle', lvl: 2, hp: 6, range: 'engaged', feats: ['coward'], note: 'Ladle; gives up at half health' }],
      win: 'villagers_gone', flee: { to: 'orchard', label: 'Retreat into the trees' },
    },
  },
  famine: {
    on: [{ flag: 'villagersGone' }, { flag: 'golemTrusts' }, { flag: 'rotten' }],
    text: ['A wave of brown spreads over the golem, and a smell like the back of a greengrocer’s in August. The villagers lower their spoons, and then back away, and then go home. The golem looks at itself, appalled, and then at the empty orchard, and understands. Nobody will try to eat it now. It looks at you with something like gratitude.'],
    choices: [{ text: 'Back to the golem', to: 'clearing' }],
  },
  golem_talk: {
    on: [{ flag: 'golemTrusts' }],
    text: ['You talk to it, slowly. It doesn’t speak, having no mouth, but it listens, and after a while it points: over the hill, towards a glint of glass. The Duke’s hothouse. Warm. Nobody eats anything in there except the Duke, and he only eats pineapples.'],
    choices: [{ text: 'Back to the golem', to: 'clearing' }],
  },
  golem_panics: {
    text: ['You say something that sounds to the golem, unfortunately, like “peel”. It panics and lashes out.'],
    fight: { outdoors: true,
      monsters: [golem], win: 'golem_down', flee: { to: 'orchard', label: 'Run for it' },
      special: [{ label: 'Throw burning oil over it', if: { fire: true }, flag: 'caramel', text: 'It caramelises with a hiss and a heavenly smell, and staggers.', dmg: '3d6' }],
    },
  },
  golem_fight: { outdoors: true,
    text: ['The golem draws itself up to its full nine feet, and comes at you swinging bunches.'],
    fight: {
      monsters: [golem], win: 'golem_down', flee: { to: 'orchard', label: 'Run for it' },
      special: [
        { label: 'Throw burning oil over it', if: { fire: true }, flag: 'caramel', text: 'It caramelises with a hiss and a heavenly smell, and staggers.', dmg: '3d6' },
        { label: 'Let your rat at it', if: { item: 'rat' }, flag: 'ratted', text: 'Your rat runs up its leg and starts eating. The golem stops dead, horrified, and spends a turn trying to shake it off.', stun: 1 },
      ],
    },
  },
  golem_down: {
    on: [{ flag: 'golemDead' }],
    text: (c) => [c.flags.rotten
      ? 'The golem goes down in a brown heap, and lies still. Nobody comes out of the trees to eat it. It smells too much like August.'
      : 'The golem goes down in a heap of bunches, and lies still. The villagers come back out of the trees with their spoons, and look at you hopefully.'],
    choices: [
      { text: 'Let them have it', to: 'feast', show: { notFlag: 'rotten' } },
      { text: 'Fill a sack for the Guild’s custard first', to: 'sacked', show: { notFlag: 'rotten' } },
      { text: 'Go back to the Guild', to: 'festival', show: { flag: 'rotten' } },
    ],
  },
  feast: {
    on: [{ flag: 'feast' }],
    text: ['The village eats the golem where it fell. It is, everyone agrees, the best banana anyone has ever had. Somebody makes a speech in your honour, with their mouth full.'],
    choices: [{ text: 'Go back to the Guild', to: 'festival' }],
  },
  sacked: {
    on: [{ flag: 'sacked' }],
    text: ['You fill a sack with the best of the golem. The villagers take the rest. The sack is heavy, warm and smells wonderful.'],
    choices: [{ text: 'Go back to the Guild', to: 'festival' }],
  },
  dragged: {
    on: [{ flag: 'dragged' }],
    text: ['You get a rope round it and haul. It digs in its heels, which are bananas, and slides, all the way back down the hill to the market, leaving long brown streaks in the grass. The Guild is waiting.'],
    choices: [{ text: 'Hand it over', to: 'festival' }],
  },
  road: {
    text: ['You lead the golem over the hill, keeping to the hedges. It follows you like a big yellow dog. Halfway there, a cart full of Guild greengrocers comes round the bend. They see the golem, and reach for their marrows.'],
    choices: [
      { text: 'Hide it in the hedge', test: { stat: 'Dex', dd: 8, skill: ['skulduggery', 'survival'] }, pass: 'hothouse', fail: 'grocers' },
      { text: 'Tell them it’s a different golem, made of plantains', test: { stat: 'Cha', dd: 8, skill: ['lying'] }, pass: 'hothouse', fail: 'grocers' },
      { text: 'Throw your caltrops under the cart', to: 'hothouse', if: { item: 'caltrops' }, effects: [{ lose: 'caltrops' }] },
      { text: 'Cast Burden on the cart', cast: 'burden', pass: 'cart_stuck', fail: 'grocers', critFail: 'cart_light' },
      { text: 'Fight them', to: 'grocers' },
    ],
  },
  grocers: {
    text: ['The greengrocers pile out of the cart with marrows. The golem hides behind you, which doesn’t work.'],
    fight: { outdoors: true, monsters: [grocer, grocer], win: 'hothouse', flee: { to: 'clearing', label: 'Run back with the golem' } },
  },
  hothouse: {
    on: [{ flag: 'saved' }],
    text: ['The Duke’s hothouse is a palace of glass, steaming and green. The golem walks in among the palms, stands in a shaft of sunlight, and stops. It stops browning. You could swear it relaxes. The Duke, a small man in a straw hat, comes out from behind a pineapple and looks at it for a long time. “Splendid,” he says. “I’ve always wanted one.”'],
    choices: [{ text: 'Go back to the festival', to: 'festival' }],
  },
  festival: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'golemDead' }, { flag: 'dragged' }, { flag: 'saved' }] }, gold: 300, uncapped: true, msg: 'The Guild pays 300GP: the golem is gone, and that’s all they asked.' },
      { if: { flag: 'sacked' }, gold: 40, uncapped: true, msg: 'The Guild buys your sack of banana for the custard: 40GP.' },
      { if: { flag: 'saved' }, gold: 60, uncapped: true, msg: 'The Duke sends you 60GP, and a pineapple.' },
    ],
    text: (c) => [
      c.flags.saved ? 'The mayor inspects the festival at sunset and finds no golem, and a great deal of custard. The Guild keeps its charter. Nobody asks where the golem went, and the Duke’s hothouse acquires a new attraction, which waves.'
        : c.flags.dragged ? 'The mayor inspects the festival at sunset and finds the golem tied to a lamp post, brown, sad and very sticky. The Guild keeps its charter, and the custard that night is the best anyone remembers. You try not to think about it.'
          : c.flags.golemDead ? `The mayor inspects the festival at sunset and finds no golem. ${c.flags.feast ? 'He does find a village that has eaten very well and is lying down.' : 'He does find a great deal of custard.'} The Guild keeps its charter.`
            : 'The golem is still loose at sunset. The mayor sees it, is chased round the market by it, and revokes the Guild’s charter on the spot.',
      `You leave Pippin-on-Wye with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  custard: {
    text: ['Your god scorns you. Instead of locusts, a vast bowl of hot custard appears at the golem’s feet. The villagers cheer and come running with their spoons. The golem looks at the custard, and at the villagers, and at itself, and understands exactly what is going on.'],
    choices: [{ text: 'Brace yourself', to: 'golem_panics' }],
  },
  golem_speaks: {
    on: [{ flag: 'golemTrusts' }],
    text: ['The golem opens a mouth it didn’t have a moment ago. “I DON’T WANT TO BE CUSTARD,” it says, in every language in the world at once, and then, more quietly, in yours: “There is a glass house over the hill. Warm. Nobody eats anything in there except the Duke, and he only eats pineapples.” It looks at you, hopefully.'],
    choices: [{ text: 'Back to the golem', to: 'clearing' }],
  },
  golem_silent: {
    text: ['Your god scorns you, and makes the golem unable to make a sound for five minutes. As it has no mouth, this makes no difference whatsoever. It looks at you, puzzled.'],
    choices: [{ text: 'Back to the golem', to: 'clearing' }],
  },
  golem_commanded: {
    on: [{ flag: 'golemTrusts' }],
    text: ['“Come with me,” you say, and the golem does, every bunch of it, before it has decided whether it wants to.'],
    choices: [{ text: 'Lead it to the Duke’s hothouse, over the hill', to: 'road' }, { text: 'Lead it back to the Guild', to: 'led_back' }],
  },
  cart_stuck: {
    text: ['The greengrocers’ cart suddenly weighs twice what it did. The axle groans and the wheels sink into the lane up to the hubs. The greengrocers get out and push, and swear, and push, while you and the golem walk on over the hill.'],
    choices: [{ text: 'On to the hothouse', to: 'hothouse' }],
  },
  cart_light: {
    text: ['Your god scorns you. Instead of growing heavy, the cart can drive on water. There isn’t any water in the lane, so it just drives on, straight at you.'],
    choices: [{ text: 'Fight them', to: 'grocers' }],
  },
  led_back: {
    on: [{ flag: 'dragged' }],
    text: ['The golem follows you back down the hill to the market, as meek as a lamb, with an expression, if bananas can have one, of growing horror. The Guild is waiting.'],
    choices: [{ text: 'Hand it over', to: 'festival' }],
  },
};

export const DEATH_TEXT = [
  'You are beaten to death with bananas. The golem is very sorry about it, and you are made into custard by mistake.',
  'Your adventure ends here.',
];
