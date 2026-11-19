// THE LICH’S LEAVING DO — steal an archlich’s soul at his retirement party. For a level 8–9 scumbag.

export const META = {
  tier: 9, id: 'leaving-do', title: 'The Lich’s Leaving Do', levels: '8–9', final: 'goodbye',
  blurb: 'After nine hundred years as Dark Lord of the Blighted Marches, the Archlich Morbidius is retiring to the seaside. He is throwing a leaving party at his tower. The Council of Wizards would like his phylactery, the jar that holds his soul, so that he can never come back. They will pay 500 gold for it. The party needs waiters.',
};

const skeleton = { name: 'Skeleton waiter', lvl: 4, hp: 12, range: 'engaged', feats: ['undead'], note: 'Undead; silver tray; terrible service' };
const vexilla = { name: 'Vexilla', lvl: 8, hp: 26, range: 'medium', dmg: '2d6', note: 'The apprentice; Arcane bolt (2d6); ambitious' };

export const SECTIONS = {
  start: {
    text: [
      'The Archlich Morbidius’s tower rises from the Blighted Marches like a broken tooth. Tonight it is hung with bunting. A banner over the gate reads FAREWELL, DREAD LORD, and somebody has drawn a skull with a party hat on it.',
      'The Council’s man gave you a waiter’s jacket and a description: the phylactery is a small jar, the size of a mustard pot, and the lich will never let it out of his sight. “He’s retiring,” said the Council’s man. “But nine hundred years is a long time. They always come back. Unless somebody else has the jar.”',
    ],
    choices: [
      { text: 'Go in through the kitchens, as a waiter', to: 'kitchen' },
      { text: 'Walk in through the front door, as a guest', test: { stat: 'Cha', dd: 10, skill: ['lying', 'social'], profs: ['Envoy'], why: 'you know how to work a door' }, pass: 'ballroom', fail: 'doorman' },
    ],
  },
  doorman: {
    text: ['The doorman is a ghoul in a bow tie. He looks at the guest list, and at you, and at the guest list. “You are not dead,” he says. “This is a dead-only function. The living are through the back, with the canapés.”'],
    choices: [{ text: 'Go round to the kitchens', to: 'kitchen' }],
  },
  kitchen: {
    text: (c) => [
      'The kitchens are chaos. Skeleton waiters clatter in and out with trays. A zombie chef is making canapés out of things you don’t look at too closely. Nobody asks who you are. You have a jacket and a tray, which is all anybody here has ever needed.',
      c.flags.cardSigned ? '' : 'On a table by the door lies a huge leaving card, half-signed, with a quill beside it, waiting to go out to the ballroom.',
    ].filter(Boolean),
    choices: [
      { text: 'Write something extra in the leaving card', to: 'card', show: { notFlag: 'cardSigned' } },
      { text: 'Pick up a tray and go out into the ballroom', to: 'ballroom' },
    ],
  },
  card: {
    text: ['The card says GOOD LUCK, DREAD LORD, and is signed by four hundred minions. There is room at the bottom.'],
    choices: [
      { text: 'Write a binding oath: “I, the undersigned, will never return as Dark Lord”', test: { stat: 'Int', dd: 8, skill: ['languages', 'arcana', 'analysis'], profs: ['Envoy', 'Sorcerer'], why: 'you know how contracts are worded' }, pass: 'oath_written', fail: 'oath_smudged' },
      { text: 'Just sign it', to: 'kitchen', effects: [{ flag: 'cardSigned' }, { msg: 'You sign it “a waiter”. It seems polite.' }] },
    ],
  },
  oath_written: {
    on: [{ flag: 'cardSigned' }, { flag: 'oath' }],
    text: ['You write it small and neat at the bottom, under BEST WISHES FROM ACCOUNTS, in the old language liches use for contracts. If he signs the card, he signs that. Liches are very particular about what they sign.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  oath_smudged: {
    on: [{ flag: 'cardSigned' }],
    text: ['Your oath comes out in the old language as “I, the undersigned, will never return as a herring.” You leave it. It can’t hurt.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen' }],
  },
  ballroom: {
    text: (c) => [
      'The ballroom is full of the dead, dressed up. Vampires in evening dress, mummies in bow ties, a ghost dancing alone. A banshee sings on a stage. At the top table, in black robes and a party hat, sits the Archlich Morbidius: a skeleton crowned with frost, nine hundred years old, holding a mug that says WORLD’S BEST DARK LORD. He is drinking tea out of it. He does not seem to need to drink tea.',
      'Beside him sits a pale young woman in purple, watching him with great attention: Vexilla, his apprentice. She is watching the mug.',
      c.flags.speechOver ? 'The speeches are over.' : 'A skeleton taps a glass. Speeches soon.',
    ],
    choices: [
      { text: 'Get a closer look at the mug while you serve the top table', test: { stat: 'Wis', dd: 8, skill: ['skulduggery'], mods: [{ if: { item: 'loupe' }, dd: 4 }] }, pass: 'mug', fail: 'mug_miss', show: { notFlag: 'knowsMug' } },
      { text: 'Talk to Vexilla', to: 'vexilla', show: { notFlag: 'vexTalked' } },
      { text: 'Wait for the speeches', to: 'speech', show: { notFlag: 'speechOver' } },
      { text: 'Back to the kitchen', to: 'kitchen' },
    ],
  },
  mug_miss: {
    text: ['You pour him more tea. He doesn’t look at you. You don’t see anything except a mug and a skeleton.'],
    choices: [{ text: 'Back to the ballroom', to: 'ballroom' }],
  },
  mug: {
    on: [{ flag: 'knowsMug' }],
    text: ['As you pour, you see it: the mug has a false bottom. Under the tea, under a little glass lid, a faint green light. The phylactery isn’t near the mug. The phylactery is the mug. A present from his minions, centuries ago. He has never put it down.'],
    choices: [{ text: 'Back to the ballroom', to: 'ballroom' }],
  },
  vexilla: {
    on: [{ flag: 'vexTalked' }],
    text: ['Vexilla looks at you, a waiter, with no interest at all. Then with some. “You’re not one of ours,” she murmurs. “Council? Thought so.” She smiles. “Get me his jar, and I’ll give you twice what they’re paying. A thousand gold. He’s retiring. Somebody has to be Dark Lord.”'],
    choices: [
      { text: 'Agree', to: 'ballroom', effects: [{ flag: 'vexDeal' }] },
      { text: 'Say nothing, and keep pouring', to: 'ballroom' },
    ],
  },
  speech: {
    on: [{ flag: 'speechOver' }],
    text: (c) => [
      'Morbidius rises. The ballroom goes silent. He speaks for some time about the old days: the burning of the Western Kingdoms, the Year Without Spring. It is surprisingly funny. Then the card is brought to him, and a quill.',
      c.flags.oath ? 'He signs it without reading it, being nine hundred years old and having signed a great many cards. Halfway down, under BEST WISHES FROM ACCOUNTS, a line of small, neat script glows briefly green, and fades.' : 'He signs it, without reading it.',
      'Then he raises his mug. “To the seaside,” he says, and puts it down on the table, for the first time in nine hundred years, to accept a round of applause with both hands.',
    ],
    choices: [
      { text: 'Swap his mug for another one off your tray', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'swapped', fail: 'caught' },
      { text: 'Knock it into your pocket as you clear the table', test: { stat: 'Dex', dd: 10, skill: ['skulduggery'] }, pass: 'swapped', fail: 'caught' },
      { text: 'Throw your voice so everybody looks at the stage', cast: 'voice', pass: 'swapped', fail: 'caught' },
      { text: 'Leave it, and clap', to: 'clap' },
    ],
  },
  clap: {
    text: (c) => [c.flags.oath ? 'You clap. Morbidius picks up his mug again. It doesn’t matter. He’s signed the card.' : 'You clap. Morbidius picks up his mug again, and never puts it down again for the rest of the night.'],
    choices: [{ text: 'Back to the kitchen', to: 'kitchen_end' }],
  },
  kitchen_end: {
    text: ['The party goes on until dawn. At sunrise, the guests go back to their coffins, and the waiters are paid in bones.'],
    choices: [{ text: 'Leave', to: 'goodbye' }],
  },
  caught: {
    text: ['Your hand is on the mug when a hand like a frozen bundle of twigs closes on your wrist. Morbidius looks at you. Nine hundred years look at you. “Ah,” he says. “A waiter.” Across the table, Vexilla stands up, very fast, wand drawn.'],
    choices: [{ text: 'Brace yourself', to: 'vexilla_strikes' }],
  },
  swapped: {
    on: [{ flag: 'jar' }, { item: 'phylactery' }],
    text: ['When Morbidius picks up his mug again and raises it to the crowd, it is a plain kitchen mug, and his own is in your pocket, warm and faintly green. He doesn’t notice. Vexilla does. She stands up, very fast.'],
    choices: [{ text: 'Brace yourself', to: 'vexilla_strikes' }],
  },
  vexilla_strikes: {
    text: (c) => [c.flags.vexDeal && c.flags.jar ? '“Give it to me,” Vexilla hisses across the table. “We had a deal.”' : '“Mine,” says Vexilla, and lifts her wand at the top table. At you. At him. At everyone.'],
    choices: [
      { text: 'Give her the jar, as you agreed', to: 'vex_wins', show: { flag: 'vexDeal', any: [{ flag: 'jar' }] } },
      { text: 'Fight her', to: 'vex_fight' },
      { text: 'Hold up your hand mirror to her bolt', to: 'vex_mirror', if: { item: 'mirror' } },
    ],
  },
  vex_mirror: {
    text: ['Vexilla’s bolt leaves her wand, hits your mirror, and goes straight back, and the apprentice is flung across the ballroom into the banshee, who hits a note that breaks every glass in the tower.'],
    choices: [{ text: 'Finish it', to: 'vex_fight_weak' }],
  },
  vex_fight: {
    text: ['Vexilla throws a bolt that takes the top off the cake, and the ballroom erupts. The banshee screams. Skeleton waiters throw down their trays and come at you.'],
    fight: {
      monsters: [vexilla, skeleton], distance: 1, win: 'vex_down', flee: { to: 'goodbye', label: 'Run for the kitchens and out' },
      special: [{ label: 'Throw holy water at the skeletons', if: { item: 'holywater' }, flag: 'holySkel', text: 'The skeleton waiters fizz and fall apart, trays and all.', dmg: '3d6' }],
    },
  },
  vex_fight_weak: {
    fight: { monsters: [{ ...vexilla, hp: 12 }], distance: 1, win: 'vex_down', flee: { to: 'goodbye', label: 'Run for the kitchens and out' } },
    text: ['Vexilla gets up out of the wreckage of the stage, singed and furious, for one more go.'],
  },
  vex_down: {
    on: [{ flag: 'vexDown' }],
    text: (c) => [
      'Vexilla goes down among the canapés. Morbidius looks at her, and at you, for a long time.',
      c.flags.jar ? '“My apprentice,” he says, “would have kept that jar for the rest of time, and come for me with it. You may keep it. Give it to the Council. I shan’t need it at the seaside.”' : '“She’d have had my jar off me within the year,” he says. “I knew she would. Thank you.” He gives you a small purse, and the remains of his party hat.',
    ],
    choices: [{ text: 'Leave the party', to: 'goodbye' }],
  },
  vex_wins: {
    on: [{ lose: 'phylactery' }, { flag: 'vexWon' }],
    text: ['You toss Vexilla the mug. She catches it, laughs, and says a word, and Morbidius, the Archlich, Dread Lord of the Blighted Marches, kneels to his own apprentice. The guests start clapping, slowly, unsure. You leave while they’re clapping.'],
    choices: [{ text: 'Leave the party', to: 'goodbye' }],
  },
  goodbye: {
    end: 'victory',
    on: [
      { sell: { item: 'phylactery', gold: 500, text: 'The Council of Wizards takes the Archlich’s phylactery, and pays' } },
      { if: { flag: 'oath', notFlag: 'jar' }, gold: 300, uncapped: true, msg: 'The Council pays 300GP for the oath in the leaving card. It’s nearly as good.' },
      { if: { flag: 'vexWon' }, gold: 1000, uncapped: true, msg: 'Vexilla pays you a thousand gold, in coins with her face on them already.' },
      { if: { flag: 'vexDown', notFlag: 'jar' }, gold: 150, uncapped: true, msg: 'In the lich’s purse: 150GP.' },
    ],
    text: (c) => [
      c.flags.vexWon ? 'The Blighted Marches have a new Dark Lord by the end of the week. She is young and ambitious and terribly efficient. You hear she has a list. You hope you aren’t on it.'
        : c.flags.sold_phylactery ? 'Morbidius retires to the seaside, as planned, and buys a little house with a view of the sea. The Council keeps his jar in a vault under a mountain. He sends you a postcard, every year, with a crab on it.'
          : c.flags.oath ? 'Morbidius retires to the seaside. The first time he thinks about coming back, a line of green script glows on the inside of his skull, and he decides to take up painting instead.'
            : 'Morbidius retires to the seaside with his mug. Nine hundred years is a long time, and the seaside is very quiet. Everybody in the Blighted Marches knows he’ll be back.',
      `You leave the Blighted Marches with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'You die at the Archlich’s leaving do. He is very gracious about it, and raises you as a skeleton waiter. You are terrible at it.',
  'Your adventure ends here.',
];
