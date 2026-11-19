// TRIAL BY DUCKING — save an old herbalist from a witchfinder before dawn. For a level 6–7 scumbag.

export const META = {
  tier: 7, id: 'trial-by-ducking', title: 'Trial by Ducking', levels: '6–7', final: 'dawn',
  blurb: 'Witchfinder Righteous Gall has come to Puddlecombe, where the milk has been curdling, and found a witch: Old Nan, the herbalist, who is ninety and deaf and makes very good cough sweets. At dawn, she will be ducked in the millpond. If she floats, she’s a witch. If she sinks, she’s innocent, and dead. Her granddaughter will give you everything she has to stop it.',
};

const hound = { name: 'Witchfinder’s hound', lvl: 4, hp: 12, range: 'engaged', note: 'Lean, grey and trained to sniff out herbs' };
const gall = { name: 'Righteous Gall', lvl: 6, hp: 22, range: 'engaged', note: 'Witchfinder General; iron pricker and a very loud voice' };
const constable = { name: 'Gall’s man', lvl: 4, hp: 12, range: 'engaged', note: 'Paid by the witch; cudgel; not very bright' };

export const SECTIONS = {
  start: {
    text: [
      'Tansy, Old Nan’s granddaughter, finds you at the Puddlecombe inn. She is fourteen and has walked all night. She puts a purse on the table: her savings, and a jar of her grandmother’s cough sweets. “He says she curdled the milk,” she says. “She didn’t. She hasn’t been out of her chair since spring. But he’s got everybody frightened. Dawn. The millpond. Please.”',
      'Out of the window, by torchlight, men are building a ducking stool on the end of the mill jetty. A tall man in black with a hat like a coal scuttle supervises. Righteous Gall. He is paid by the witch.',
    ],
    on: [{ item: 'sweets', msg: 'Tansy gives you a jar of Old Nan’s cough sweets. They smell of liquorice and something stronger.' }], onceOnly: true,
    choices: [
      { text: 'Go to the lock-up where Nan is held', to: 'lockup' },
      { text: 'Look round Gall’s lodgings at the inn', to: 'lodgings' },
      { text: 'Go to the dairy where the milk’s been curdling', to: 'dairy' },
      { text: 'Go down to the millpond', to: 'jetty' },
    ],
  },
  dairy: {
    text: (c) => [
      'The dairy is cold and smells of sour milk. Every churn has curdled. The dairymaid, red-eyed, says it started the day the Witchfinder arrived. “He came to inspect,” she says. “Before anyone had even said the word witch. He went round all the churns. Took a long time over it.”',
      c.flags.powder ? 'You know what he was doing.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Examine the curdled milk with your jeweller’s loupe', to: 'milk_clue', if: { item: 'loupe' }, show: { notFlag: 'milkClue' } },
      { text: 'Taste the milk', test: { stat: 'Con', dd: 8, save: true, skill: ['medicine'], why: 'you know your poisons' }, pass: 'milk_clue', fail: 'milk_sick', show: { notFlag: 'milkClue' } },
      { text: 'Back to the inn', to: 'start_return' },
    ],
  },
  milk_clue: {
    on: [{ flag: 'milkClue' }],
    text: ['There’s a grey dust floating on the curdled milk, finer than flour. Not herbs. Not witchcraft. Rennet powder, the kind cheesemakers use, by the handful.'],
    choices: [{ text: 'Back to the inn', to: 'start_return' }],
  },
  milk_sick: {
    on: [{ damage: 'd6', from: 'The milk' }],
    text: ['The milk tastes the way you’d expect. You spend some time behind the dairy, thinking about your choices.'],
    choices: [{ text: 'Back to the inn', to: 'start_return' }],
  },
  start_return: {
    text: ['Back at the inn, Tansy is waiting by the fire, watching the door. Outside, the ducking stool is nearly finished.'],
    choices: [
      { text: 'Go to the lock-up', to: 'lockup' },
      { text: 'Look round Gall’s lodgings', to: 'lodgings', show: { notFlag: 'lodgingsDone' } },
      { text: 'Go to the dairy', to: 'dairy', show: { notFlag: 'milkClue' } },
      { text: 'Go down to the millpond', to: 'jetty' },
    ],
  },
  lodgings: {
    text: ['Gall’s room at the inn is locked. His hound lies across the doorway, asleep, with one eye open.'],
    choices: [
      { text: 'Give the hound some of Nan’s cough sweets', to: 'hound_sweets', if: { item: 'sweets' } },
      { text: 'Give the hound your rations', to: 'hound_fed', if: { item: 'rations' }, effects: [{ lose: 'rations' }] },
      { text: 'Cast Command on the hound: “Sit”', cast: 'command', pass: 'hound_sits', fail: 'hound_fight' },
      { text: 'Step over it', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'], profs: ['Hunter'], why: 'you can move quietly round animals' }, pass: 'room', fail: 'hound_fight' },
      { text: 'Back to the inn', to: 'start_return' },
    ],
  },
  hound_sweets: {
    on: [{ lose: 'sweets' }],
    text: ['The hound eats the sweets one by one, its eyes watering, then lies down and goes to sleep properly, breathing liquorice. Whatever’s in them, it isn’t just liquorice.'],
    choices: [{ text: 'Go in', to: 'room' }],
  },
  hound_fed: {
    text: ['The hound eats your rations, licks your hand, and rolls over to have its belly scratched. It was only ever paid in food.'],
    choices: [{ text: 'Go in', to: 'room' }],
  },
  hound_fight: {
    text: ['The open eye was open. The hound comes up off the floor at your throat.'],
    fight: { monsters: [hound], win: 'room', flee: { to: 'start_return', label: 'Retreat down the stairs' } },
  },
  room: {
    on: [{ flag: 'lodgingsDone' }],
    text: ['Gall’s room is tidy. A black coat on the door. A ledger of fees: WITCHES FOUND, forty-one, at ten gold each. And under the bed, a saddlebag full of paper twists of grey powder, labelled, in a cheesemaker’s hand, RENNET.'],
    choices: [
      { text: 'Take a twist of the powder and the ledger, as evidence', to: 'evidence' },
    ],
  },
  evidence: {
    on: [{ flag: 'powder' }, { item: 'rennet', msg: 'A twist of rennet powder and Gall’s ledger: evidence.' }],
    text: ['You take the powder and the ledger. Forty-one witches. Forty-one dairies. Ten gold a time.'],
    choices: [{ text: 'Back to the inn', to: 'start_return' }],
  },
  lockup: {
    text: (c) => [
      c.flags.nanFree ? 'The lock-up is empty. Somewhere, a deaf old woman is eating cough sweets in safety.' : 'Old Nan sits in the village lock-up on a stool, wrapped in a shawl, sucking a cough sweet. She is very small, and very deaf, and very calm. “Is it morning?” she shouts. Two of Gall’s men stand guard outside, leaning on cudgels.',
    ],
    choices: [
      { text: 'Pick the lock while the guards doze', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'nan_out', fail: 'guards_fight', if: { item: 'tools' }, show: { notFlag: 'nanFree' } },
      { text: 'Melt the lock with acid', to: 'nan_out', if: { item: 'acid' }, effects: [{ lose: 'acid' }], show: { notFlag: 'nanFree' } },
      { text: 'Cast Knock on the lock while the guards doze', cast: 'knock', pass: 'nan_out', fail: 'guards_fight', show: { notFlag: 'nanFree' } },
      { text: 'Offer the guards some of Nan’s cough sweets', to: 'guards_asleep', if: { item: 'sweets' }, show: { notFlag: 'nanFree' } },
      { text: 'Bribe the guards (50GP)', to: 'nan_out', if: { gold: 50 }, effects: [{ gold: -50 }], show: { notFlag: 'nanFree' } },
      { text: 'Cast Shroud, and pick the lock unseen in your own darkness', cast: 'shroud', pass: 'nan_out', fail: 'guards_fight', critFail: 'lockup_glow', if: { item: 'tools' }, show: { notFlag: 'nanFree' } },
      { text: 'Back to the inn', to: 'start_return' },
    ],
  },
  guards_asleep: {
    on: [{ lose: 'sweets' }],
    text: ['The guards take a sweet each, then another. Within a minute they’re asleep against the door, snoring liquorice. Whatever Nan puts in those, it isn’t liquorice.'],
    choices: [{ text: 'Get her out', to: 'nan_out' }],
  },
  guards_fight: {
    text: ['A guard opens his eyes and sees you at the lock. “Witch-lover,” he says, and the other one wakes up too.'],
    fight: { monsters: [constable, constable], win: 'nan_out', flee: { to: 'start_return', label: 'Run back to the inn' } },
  },
  nan_out: {
    on: [{ flag: 'nanFree' }],
    text: ['Old Nan comes out of the lock-up on your arm, very slowly, and you hide her under a heap of sacks in the inn stable with Tansy. “Is it morning?” she shouts. Not yet, you tell her. Not yet.'],
    choices: [{ text: 'Go down to the millpond', to: 'jetty' }],
  },
  jetty: {
    text: (c) => [
      'Dawn comes up grey over the millpond. Half the village stands on the bank. At the end of the jetty, the ducking stool hangs over the water on its long arm. Righteous Gall stands beside it, hat on, pricker in hand.',
      c.flags.nanFree ? 'He’s looking for Old Nan. She’s missing. He’s furious.' : 'Two of his men bring Old Nan down the jetty and strap her in the chair. “Is it morning?” she shouts.',
    ],
    choices: [
      { text: 'Show the village the rennet and Gall’s ledger', to: 'exposed', if: { item: 'rennet' } },
      { text: 'Denounce Gall in front of the crowd', test: { stat: 'Cha', dd: 10, skill: ['social'], profs: ['Cleric', 'Missionary', 'Envoy'], why: 'you know how to work a crowd', mods: [{ if: { flag: 'milkClue' }, dd: 8 }] }, pass: 'exposed', fail: 'crowd_turns' },
      { text: 'Cast Divine light over Nan, for a miracle', cast: 'light', pass: 'miracle', fail: 'crowd_turns', critFail: 'nan_shrouded', show: { notFlag: 'nanFree' } },
      { text: 'Cast Confession on Righteous Gall, in front of the whole village', cast: 'confession', pass: 'gall_confesses', fail: 'crowd_turns', critFail: 'gall_wiped' },
      { text: 'Cast Intervention, and ask your god to do something about Gall', cast: 'intervention', pass: 'intervention', fail: 'crowd_turns', critFail: 'petition_answer', show: { notFlag: 'gallDown' } },
      { text: 'Cast Telekinesis, and wedge a stone in the ducking stool’s pivot from across the pond', cast: 'telekinesis', pass: 'jammed', fail: 'jetty', show: { notFlag: 'nanFree' } },
      { text: 'Jam the ducking stool’s pivot with an iron spike', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'jammed', fail: 'gall_fight', if: { item: 'spikes' }, show: { notFlag: 'nanFree' } },
      { text: 'Glue the ducking stool’s pivot', test: { stat: 'Dex', dd: 6, skill: ['skulduggery'] }, pass: 'jammed', fail: 'gall_fight', if: { item: 'glue' }, show: { notFlag: 'nanFree' } },
      { text: 'Bless a bucket of millpond water and throw it over Nan, so the crowd sees she doesn’t burn', cast: 'bless', pass: 'holy_water', fail: 'crowd_turns', critFail: 'nan_oiled', if: { item: 'bucket' }, show: { notFlag: 'nanFree' } },
      { text: 'Challenge Gall', to: 'gall_fight' },
    ],
  },
  exposed: {
    on: [{ flag: 'exposed' }],
    text: ['You hold up the rennet and read from the ledger: forty-one witches, forty-one dairies, ten gold a time. The crowd goes quiet. Then the dairymaid says, quite loudly, “He went round all the churns.” Righteous Gall looks at the crowd, and the crowd looks at Righteous Gall, and then it is Gall in the ducking stool, and he floats.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  miracle: {
    on: [{ flag: 'miracle' }],
    text: ['As they swing Nan out over the water, you raise your holy symbol, and the chair begins to glow with a soft golden light. The crowd falls to its knees. Gall stares. Nan, who can’t hear anything, beams and waves. Nobody is ducking a saint.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  holy_water: {
    on: [{ flag: 'miracle' }],
    text: ['You fill your bucket from the millpond, bless it in front of everybody, and throw it over Old Nan in her chair. Holy water, as everybody knows, burns a witch. Nan sits there, soaked, blinking, entirely unburnt. “Is it raining?” she shouts. The crowd looks at Righteous Gall. Righteous Gall has nothing to say.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  jammed: {
    on: [{ flag: 'jammed' }],
    text: ['They swing the arm out over the water and pull the rope to drop it. It doesn’t drop. They pull harder. Old Nan hangs over the millpond, perfectly dry, sucking a cough sweet. “Is it morning?” she shouts. The crowd starts to laugh. Then someone says it: “She won’t go in. The water won’t have her. It’s a sign.” A sign of innocence, by general agreement. They let her down.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  crowd_turns: {
    text: ['“Witch-lover!” shouts Gall, pointing at you, and the crowd turns, the way crowds do. His men come at you down the jetty.'],
    choices: [{ text: 'Fight', to: 'gall_fight' }],
  },
  gall_fight: {
    text: ['Righteous Gall throws off his black coat and comes down the jetty at you with his iron pricker.'],
    fight: { outdoors: true,
      monsters: [gall], win: 'gall_down', flee: { to: 'dawn', label: 'Run' },
      special: [
        { label: 'Throw the rennet powder in his face', if: { item: 'rennet' }, flag: 'rennetThrown', text: 'A cloud of rennet hits Gall in the face. He chokes, and the crowd, who know what rennet is, start muttering.', stun: 1 },
        { label: 'Clap your manacles on him and drag him to the ducking stool', if: { item: 'manacles' }, test: { stat: 'Dex', dd: 8, skill: 'skulduggery' }, flag: 'galled', text: 'The manacles snap shut on Gall’s wrists. You haul him to the ducking stool, and the crowd, who have always wanted to see this, help.', failText: 'He twists away from the manacles.', win: true },
      ],
    },
  },
  gall_down: {
    on: [{ flag: 'gallDown' }],
    text: ['Righteous Gall goes off the end of the jetty into the millpond. He floats. The crowd watches him float for a long time. Nobody helps.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  dawn: {
    end: 'victory',
    on: [
      { if: { any: [{ flag: 'nanFree' }, { flag: 'exposed' }, { flag: 'miracle' }, { flag: 'jammed' }, { flag: 'gallDown' }] }, gold: 120, uncapped: true, msg: 'Tansy gives you her savings: 120GP, in very small coins.' },
      { if: { flag: 'exposed' }, gold: 200, uncapped: true, msg: 'The village pays you the 200GP it had set aside for Gall.' },
    ],
    text: (c) => [
      c.flags.exposed ? 'Righteous Gall leaves Puddlecombe the same morning, wet and witchless, with the whole village throwing curdled milk after him. Old Nan never finds out any of it happened.'
        : c.flags.miracle ? 'Old Nan is declared a saint, which she doesn’t hear either. Pilgrims come for her cough sweets. Righteous Gall moves on to the next village, and the next, until somebody stops him.'
          : c.flags.jammed ? 'Old Nan goes home on Tansy’s arm. Gall leaves Puddlecombe in a huff, looking for a village with better carpentry.'
            : c.flags.nanFree ? 'Old Nan is three villages away by sunrise, in the back of a hay cart, with Tansy and the cough sweets. Puddlecombe never sees her again, and its milk stops curdling the day Gall leaves.'
              : c.flags.gallDown ? 'With the Witchfinder in the pond, nobody has the heart to duck anybody else. Old Nan goes home and makes cough sweets.'
                : 'They duck Old Nan at sunrise. She floats, because she is very small and very light, and they call her a witch. She is still a witch, as far as Puddlecombe is concerned, when she dies in her own bed nine years later. Gall has moved on by then.',
      `You leave Puddlecombe with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  hound_sits: {
    text: ['“Sit,” you say. The hound sits, and stays sitting, looking at you with an expression of deep betrayal, while you step over it and try the door.'],
    choices: [{ text: 'Go in', to: 'room' }],
  },
  lockup_glow: {
    text: ['Your god scorns you. Instead of darkness, light pours out of your sleeves, and you stand at the lock-up door with your tools out, glowing like a lantern. A guard opens one eye. Then the other.'],
    choices: [{ text: 'Fight', to: 'guards_fight' }],
  },
  nan_shrouded: {
    text: ['Your god scorns you. Instead of a holy light, darkness pours out over Old Nan and the ducking stool, thick as soot. The crowd falls back. “WITCHCRAFT,” cries Righteous Gall, delighted, and points at you.'],
    choices: [{ text: 'Brace yourself', to: 'crowd_turns' }],
  },
  nan_oiled: {
    text: ['Your god scorns you. Instead of holy water, your bucket is full of lamp oil, and you have already thrown it. Old Nan sits on the ducking stool, dripping, and asks if it’s raining. “An OILY witch,” says Gall, with deep satisfaction.'],
    choices: [{ text: 'Brace yourself', to: 'crowd_turns' }],
  },
  gall_confesses: {
    on: [{ flag: 'exposed' }],
    text: ['Righteous Gall stops in the middle of a prayer, and relives his most recent sins in front of the whole of Puddlecombe, who see every one: Gall at the dairy at midnight, shaking rennet into the churns; Gall counting his witch money at the inn. The crowd goes quiet. Then the dairymaid says, quite loudly, “He went round all the churns.” Righteous Gall looks at the crowd, and the crowd looks at him.'],
    choices: [{ text: 'Watch the sun come up', to: 'dawn' }],
  },
  gall_wiped: {
    text: ['Your god scorns you, and wipes the last day’s worries from Righteous Gall’s mind. He looks out at the crowd with perfect serenity, a man without a doubt in the world. “Duck her,” he says, and then, kindly, pointing at you: “And that one.”'],
    choices: [{ text: 'Brace yourself', to: 'crowd_turns' }],
  },
  intervention: {
    on: [{ flag: 'gallDown' }],
    text: ['You ask your god to do something about Righteous Gall. Your god does. A single gust of wind comes across the millpond, lifts Gall’s hat, and while he is reaching for it, the plank under his feet decides it has had enough.'],
    choices: [{ text: 'Watch', to: 'gall_down' }],
  },
  petition_answer: {
    text: ['Your god scorns you. Instead of action, you get an answer. You asked what could be done about Righteous Gall, and your god tells you, at length, in a voice only you can hear, while the crowd watches you stand on the jetty nodding to yourself. The answer is “not much”.'],
    choices: [{ text: 'Try something else', to: 'jetty' }],
  },
};

export const DEATH_TEXT = [
  'You die on the mill jetty at Puddlecombe. Righteous Gall writes you in his ledger as a witch, and charges the village ten gold.',
  'Your adventure ends here.',
];
