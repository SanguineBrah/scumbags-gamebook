// SPLITTING HEIRS — find the real Professor Glibb among dozens of copies of him. For a level 4–5 scumbag.
// Glibb is a manmoeba: hit one and it splits in two. The `clues` counter tracks how sure you are which one is real.

export const META = {
  tier: 5, id: 'splitting-heirs', title: 'Splitting Heirs', levels: '4–5', final: 'reading',
  blurb: 'Professor Glibb, alchemist and miser, drank his own elixir of youth and turned into a manmoeba: a man-shaped blob that splits in two when struck. His servants struck him, a lot. Now there are thirty Glibbs in Glibb Hall, all claiming to be the original, and the will leaves everything to the real one. His solicitor will pay 300 gold to whoever can tell which.',
};

const CLUE = { add: ['clues', 1] };
const glibb = { name: 'A Glibb', lvl: 2, hp: 6, range: 'engaged', onHit: { stat: 'Con', dd: 4, label: 'keep it off your skin', text: 'It gets on you. It is cold, and it moves.', effect: 'damage', amount: 'd4' }, note: 'Manmoeba: a man-shaped blob; splits in two when struck; gross' };
const half = { name: 'Half a Glibb', lvl: 1, hp: 3, range: 'engaged', note: 'What’s left of a Glibb after it split; still cross' };

export const SECTIONS = {
  start: {
    text: [
      'Mr Probate, solicitor, meets you at the gates of Glibb Hall with a handkerchief over his mouth. “The Professor drank something he shouldn’t,” he says, “and became a sort of… jelly. Then the butler hit him with a poker, and there were two. Then the cook hit both of them. You see the problem.”',
      '“The will leaves the entire estate to Professor Glibb. The real one. I need to know which, by the reading tomorrow morning. Three hundred gold.” He glances at a thin young man smoking on the lawn. “That’s Cedric, his nephew. If there’s no Professor at all, it all goes to Cedric. Please don’t talk to Cedric.”',
    ],
    choices: [
      { text: 'Go into the hall', to: 'hall' },
      { text: 'Talk to Cedric', to: 'cedric' },
    ],
  },
  cedric: {
    text: (c) => [c.flags.cedricDeal
      ? 'Cedric is still on the lawn, smoking. He raises his cigarette at you. “Any progress?” he says. “Fewer of them, I hope.”'
      : 'Cedric looks at you through a cloud of smoke. “Thirty uncles,” he says. “And not one of them will die properly. Every time somebody tries, there are more.” He smiles. “If you were to get rid of all of them, I’d inherit. And I’d be very grateful. Four hundred gold grateful.”'],
    choices: [
      { text: 'Take his offer', to: 'hall', effects: [{ flag: 'cedricDeal' }], show: { notFlag: 'cedricDeal' } },
      { text: 'Turn him down', to: 'hall', show: { notFlag: 'cedricDeal' } },
      { text: 'Go back into the hall', to: 'hall', show: { flag: 'cedricDeal' } },
    ],
  },
  hall: {
    text: (c) => [
      'The great hall of Glibb Hall is full of Professor Glibb. There are thirty of him, translucent and grey-green and man-shaped, in thirty pairs of spectacles, sitting on the stairs and the furniture and each other. They are all talking at once, and all saying the same thing: “I am the real one. They’re all copies. Fetch me my slippers.”',
      ['You have no idea which is the real one.', 'You have one clue to the real one.', 'You have two clues to the real one.', 'You’re fairly sure you know which is the real one.'][Math.min(3, c.flags.clues || 0)],
      c.flags.lidded ? 'Most of the Glibbs are locked in the cellar now, complaining through the door.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Ask them all a question only the real one could answer', test: { stat: 'Int', dd: 8, skill: ['analysis'], profs: ['Envoy'], why: 'you know how to question people' }, pass: 'question', fail: 'chorus', show: { notFlag: 'asked' } },
      { text: 'Look them over with your jeweller’s loupe', to: 'loupe', if: { item: 'loupe' }, show: { notFlag: 'looked' } },
      { text: 'Search the Professor’s study', to: 'study', show: { notFlag: 'studyDone' } },
      { text: 'Go down to the laboratory', to: 'lab', show: { notFlag: 'labDone' } },
      { text: 'Herd the Glibbs into the cellar and padlock it', to: 'cellar', if: { item: 'padlock' }, show: { notFlag: 'lidded' } },
      { text: 'Hit one, to see what happens', to: 'split' },
      { text: 'Point out the real Professor Glibb', to: 'choose', show: { atLeast: ['clues', 1] } },
      { text: 'Go back out to the lawn', to: 'cedric' },
    ],
  },
  chorus: {
    on: [{ flag: 'asked' }],
    text: ['You ask: what was your first wife’s name? Thirty Glibbs answer at once. Twenty say “Mildred”, nine say “Margaret”, and one says “Which one?” You don’t know which answer is right, which is a problem.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  question: {
    on: [{ flag: 'asked' }, CLUE],
    text: ['You ask: what is the combination of your safe? Twenty-nine Glibbs give twenty-nine different numbers, all with great confidence. One, by the fireplace, goes pale, or paler, and says “I’m not telling YOU.” That’s a real miser. You make a note of him.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  loupe: {
    on: [{ flag: 'looked' }, CLUE],
    text: ['Through the loupe, the Glibbs are all the same: grey-green and clouded. Except for one by the fireplace, in whose middle, very small, floats a single gold tooth. Glibb had a gold tooth. The copies didn’t get one. Gold doesn’t split.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  study: {
    text: ['The Professor’s study is a mess of papers. On the desk lies his diary, open at the last entry, and a locked strongbox.'],
    choices: [
      { text: 'Read the diary', to: 'diary' },
      { text: 'Pick the strongbox', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'strongbox', fail: 'strongbox_jam', if: { item: 'tools' }, show: { notFlag: 'strongbox' } },
      { text: 'Lever the strongbox open', test: { stat: 'Str', dd: 8, skill: ['bruteforce'] }, pass: 'strongbox', fail: 'strongbox_jam', if: { item: 'prybar' }, show: { notFlag: 'strongbox' } },
      { text: 'Back to the hall', to: 'hall' },
    ],
  },
  diary: {
    on: [{ flag: 'studyDone' }, CLUE],
    text: ['The last entry reads: “Drank it. Feel wonderful. Feel slightly runny. Must remember: if anything goes wrong, I always sit by the fire. Always. I hate the cold. G.” Underneath, in a wobbly hand: “Have gone jelly. Pass the antidote. Formula in lab, half finished.”'],
    choices: [{ text: 'Back to the study', to: 'study' }, { text: 'Back to the hall', to: 'hall' }],
  },
  strongbox: {
    on: [{ flag: 'strongbox' }, { gold: 60, msg: 'The Professor’s petty cash: 60GP. He won’t miss it, or he will, and he won’t know which of him to blame.' }],
    text: ['The strongbox holds petty cash and a lock of hair labelled MILDRED.'],
    choices: [{ text: 'Back to the study', to: 'study' }],
  },
  strongbox_jam: {
    text: ['The lock jams, and the strongbox stays shut. There are some things even a miser’s jelly can keep.'],
    on: [{ flag: 'strongbox' }],
    choices: [{ text: 'Back to the study', to: 'study' }],
  },
  lab: {
    text: (c) => [
      'In the laboratory, the Professor’s last experiment stands half-finished on the bench: a flask of something pink, and a formula scribbled on the wall. ANTIDOTE, it says. HEAT TO BLOOD WARMTH, ADD ONE PART… and then the chalk runs out.',
      c.flags.antidote ? 'You have a flask of the finished antidote.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Finish the formula', test: { stat: 'Int', dd: 8, skill: ['analysis', 'arcana'], profs: ['Alchemist'], why: 'this is your trade' }, pass: 'antidote', fail: 'lab_fumes', show: { notFlag: 'antidote' } },
      { text: 'Back to the hall', to: 'hall' },
    ],
  },
  lab_fumes: {
    on: [{ damage: 'd6', from: 'The fumes' }, { flag: 'labDone' }],
    text: ['The flask goes from pink to green to a cloud of smoke that takes your eyebrows and leaves the formula unfinished. You won’t get a second go: the flask is gone.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  antidote: {
    on: [{ flag: 'antidote' }, { flag: 'labDone' }],
    text: ['One part alchemist’s spit, as it turns out. The flask turns clear and smells of peppermint. Enough for one Professor, if you can find the right one.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  cellar: {
    on: [{ flag: 'lidded' }, { lose: 'padlock' }, CLUE],
    text: ['You tell the Glibbs there’s a fire lit in the cellar. Twenty-nine of them shuffle downstairs, and you padlock the door behind them. One stays exactly where he is, by the fireplace in the hall, warming his hands. “There isn’t a fire down there,” he says. “There’s never been a fire down there. I’m not an idiot.”'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  split: {
    text: ['You poke the nearest Glibb, quite hard. It goes “ow,” wobbles, and with a sound like a wet sheet tearing, there are two of them, both saying “ow”. The other Glibbs tut. One of the new ones takes a swing at you.'],
    fight: {
      monsters: [glibb, half], win: 'split_after', flee: { to: 'hall', label: 'Back away' },
      special: [{ label: 'Glue the two halves back together', if: { item: 'glue' }, flag: 'glued', text: 'You slap them together with a pot of glue. They stick, and stand there, stuck, arguing with themselves.', win: true }],
    },
  },
  split_after: {
    on: [{ add: ['killed', 1] }],
    text: ['The two Glibbs lie in a puddle on the floor, which slowly crawls under the sofa to think about what it’s done. The other Glibbs keep their distance from you now.'],
    choices: [{ text: 'Back to the hall', to: 'hall' }],
  },
  choose: {
    text: ['You point at the Glibb by the fireplace. He looks up from warming his hands. “Finally,” he says. “Somebody with sense.”'],
    choices: [
      { text: 'Give him the antidote', to: 'cured', if: { flag: 'antidote', flagText: 'the antidote' } },
      { text: 'Present him to Mr Probate as he is', to: 'reading', effects: [{ flag: 'found' }] },
      { text: 'Get rid of him for Cedric', to: 'real_fight', show: { flag: 'cedricDeal' } },
    ],
  },
  cured: {
    on: [{ flag: 'cured' }, { flag: 'found' }],
    text: ['The Glibb by the fire drinks the antidote. He firms up, colours in, and is suddenly a small, bald, furious old man in spectacles, with a gold tooth. All round the hall, twenty-nine copies of him sigh, slump, and become puddles.'],
    choices: [{ text: 'Take him to Mr Probate', to: 'reading' }],
  },
  real_fight: {
    on: [{ flag: 'betrayed' }],
    text: ['“Cedric sent you,” says the real Professor Glibb, getting up from the fire. “Of course he did.” He comes at you, and the other twenty-nine come too, out of family feeling.'],
    fight: {
      monsters: [{ ...glibb, name: 'Professor Glibb', lvl: 4, hp: 12, note: 'The real one; manmoeba; miserly; splits when struck' }, glibb],
      win: 'all_gone', flee: { to: 'reading', label: 'Run for the door' },
      special: [{ label: 'Throw burning oil over them', if: { fire: true }, flag: 'burnt', text: 'The Glibbs hiss and shrink back from the flames into steaming puddles.', dmg: '3d6' }],
    },
  },
  all_gone: {
    on: [{ flag: 'noGlibb' }],
    text: ['When it’s over, there are no Glibbs left in Glibb Hall: only puddles, slowly drying on the carpet, and a single gold tooth.'],
    choices: [{ text: 'Go to the reading of the will', to: 'reading' }],
  },
  reading: {
    end: 'victory',
    on: [
      { if: { flag: 'found' }, gold: 300, uncapped: true, msg: 'Mr Probate pays you 300GP.' },
      { if: { flag: 'cured' }, gold: 100, uncapped: true, msg: 'Professor Glibb gives you 100GP, and then asks for a receipt.' },
      { if: { flag: 'noGlibb', any: [{ flag: 'cedricDeal' }] }, gold: 400, uncapped: true, msg: 'Cedric pays you 400GP out of his inheritance.' },
    ],
    text: (c) => [
      c.flags.cured ? 'At the reading of the will, Professor Glibb sits in the front row, solid, and reads it himself. He leaves everything to himself, again. Cedric leaves without a word.'
        : c.flags.found ? 'At the reading of the will, Mr Probate reads it to a grey-green blob in spectacles, who signs for the estate with a finger. It leaves a stain. Cedric leaves without a word.'
          : c.flags.noGlibb ? 'At the reading of the will, Mr Probate looks at the puddles, and at Cedric, and at you, for a long time. Then he reads it. Cedric inherits everything, and lights a cigarette.'
            : 'At the reading of the will, nobody can say which Glibb is which. Mr Probate adjourns it. It is still adjourned. There are thirty Glibbs living in Glibb Hall to this day, arguing about the slippers.',
      `You leave Glibb Hall with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'You die in Glibb Hall, and for a while there are thirty-one people in it arguing about the slippers.',
  'Your adventure ends here.',
];
