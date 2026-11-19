// NOW YOU SEE HIM — catch a champion blink dog before the judging. For a level 2–3 scumbag.
// The `time` counter moves on as you search; at 4 the judging starts without him.

export const META = {
  tier: 3, id: 'now-you-see-him', title: 'Now You See Him', levels: '2–3', final: 'show',
  blurb: 'Sir Biscuit, the Duke of Waggleton’s blink dog, is the favourite for Best in Show. This morning he blinked out of his basket and hasn’t blinked back. He is somewhere in Waggleton, appearing and vanishing every few seconds. The judging is at four o’clock. The Duke will pay 200 gold to have him on the table in time.',
};

const TICK = { add: ['time', 1] };
const LATE = { atLeast: ['time', 4] };
const blinkdog = { name: 'Grudge blink dog', lvl: 2, hp: 5, range: 'engaged', feats: ['tiny'], note: 'Blinks about the place (+2 to tests when being attacked); small; very rude' };
const HOUR = (c) => ['It is noon.', 'It is one o’clock.', 'It is two o’clock.', 'It is three o’clock. One hour until the judging.', 'It is four o’clock. The judging has started.'][Math.min(4, c.flags.time || 0)];

export const SECTIONS = {
  start: {
    text: [
      'The Duke of Waggleton meets you in the show tent, among rows of empty dog tables and one very empty basket. “Sir Biscuit,” he says, and shows you a portrait: a small white dog with one brown ear and an expression of enormous self-regard. “A blink dog. He steps from here to there without going in between. He has never done it without permission before. Somebody has upset him.”',
      'He glares across the tent at a hard-faced woman with a pack of yapping grey dogs: Mrs Grudge, breeder, who has come second to Sir Biscuit three years running. “Two hundred gold,” says the Duke, “if he is on that table at four o’clock.”',
    ],
    choices: [{ text: 'Go into Waggleton to look for him', to: 'square' }],
  },
  square: {
    redirect: [{ if: LATE, to: 'too_late' }],
    text: (c) => [
      'Waggleton’s market square is busy with show day. Every so often somebody shrieks, and points, at a small white dog that is there and then isn’t.',
      HOUR(c),
      c.flags.knowsHabits ? 'You know he likes sausages, bells and somewhere high to sulk.' : '',
    ].filter(Boolean),
    choices: [
      { text: 'Ask around for sightings', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'sightings', fail: 'no_sightings', effects: [TICK], show: { notFlag: 'knowsHabits' } },
      { text: 'Try the butcher’s', to: 'butcher', effects: [TICK], show: { notFlag: 'butcherDone' } },
      { text: 'Climb the church tower', to: 'tower', effects: [TICK], show: { notFlag: 'towerDone' } },
      { text: 'Pay a visit to Mrs Grudge’s caravan', to: 'grudge', effects: [TICK], show: { notFlag: 'grudgeDone' } },
      { text: 'Give up and go back to the show', to: 'show' },
    ],
  },
  too_late: {
    text: ['The church clock strikes four. Across the square, in the show tent, a bell rings for the judging. Sir Biscuit is still out there somewhere.'],
    choices: [{ text: 'Go back to the show', to: 'show' }],
  },
  sightings: {
    on: [{ flag: 'knowsHabits' }],
    text: ['Everybody has seen him. The butcher saw him three times, each time nearer the sausages. The verger saw him on the church roof, sulking. A small boy says he blinked out the moment Mrs Grudge’s dogs started barking, and that one of them had a whistle on its collar. “A dog whistle,” says the boy. “Blink dogs hate it. Makes them jump.”'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  no_sightings: {
    text: ['Everybody has seen him, and everybody saw him somewhere different, and the more people you ask, the more places he’s been. You learn nothing, except that he gets about.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  butcher: {
    text: ['In the butcher’s window, sausages hang in loops. As you watch, a link of them vanishes, and a white dog with one brown ear appears on the counter, with a sausage in his mouth, and vanishes again. The butcher throws a cleaver at the space where he was.'],
    choices: [
      { text: 'Lay a trail of sausages to a corner and wait', test: { stat: 'Wis', dd: 6, skill: ['survival'], profs: ['Hunter'], why: 'you know how to bait a trap' }, pass: 'caught', fail: 'butcher_miss', if: { gold: 2 }, effects: [{ gold: -2 }] },
      { text: 'Hold out your rations and keep very still', to: 'caught', if: { item: 'rations' }, effects: [{ lose: 'rations' }] },
      { text: 'Cast Abundance and conjure a heap of sausages at your feet', cast: 'abundance', pass: 'caught', fail: 'butcher_miss' },
      { text: 'Drop your bucket over him the next time he lands on the counter', test: { stat: 'Dex', dd: 8, skill: ['athletics', 'skulduggery'] }, pass: 'caught', fail: 'butcher_miss', if: { item: 'bucket' } },
      { text: 'Back to the square', to: 'square' },
    ],
  },
  butcher_miss: {
    on: [{ flag: 'butcherDone' }],
    text: ['Sir Biscuit appears, takes the bait, looks at you with great contempt, and blinks away with it. He won’t fall for that again.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  tower: {
    text: ['At the top of the church tower, among the bells, the wind whistles. On the parapet sits a small white dog with one brown ear, looking out over the town as if he owned it. He sees you. He blinks onto the next parapet. He blinks onto the bell.'],
    choices: [
      { text: 'Ring the bell, so he jumps into your arms', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'caught', fail: 'bell_miss' },
      { text: 'Cast Ward on the bell rope, so it rings when he lands', cast: 'ward', pass: 'caught', fail: 'bell_miss' },
      { text: 'Talk him down, the way you’d talk to a sulking child', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Bodyguard', 'Cleric'], why: 'you’re good with difficult people' }, pass: 'caught', fail: 'bell_miss' },
      { text: 'Back down to the square', to: 'square' },
    ],
  },
  bell_miss: {
    on: [{ flag: 'towerDone' }, { damage: 'd4', from: 'The bell' }],
    text: ['The bell swings, Sir Biscuit blinks, and you take the full weight of the bell in the side of the head, which rings it rather well. When your ears stop, he’s gone.'],
    choices: [{ text: 'Back down to the square', to: 'square' }],
  },
  grudge: {
    text: (c) => [
      'Mrs Grudge’s caravan stands behind the show tent, painted with rosettes for second place. Four grey blink dogs lie under it. Mrs Grudge sits on the step, knitting, and smiles at you with very few teeth.',
      c.flags.knowsHabits ? 'One of the grey dogs wears a silver whistle on its collar.' : '',
      '“Looking for something?” she says. “Shame if the favourite missed the judging. Shame for him. I’d pay two hundred and fifty to make sure he does.”',
    ].filter(Boolean),
    choices: [
      { text: 'Take her money, and stop looking', to: 'grudge_deal' },
      { text: 'Steal the whistle off the dog’s collar', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'whistle', fail: 'dogs_fight', show: { flag: 'knowsHabits' } },
      { text: 'Accuse her of scaring Sir Biscuit off', test: { stat: 'Cha', dd: 8, skill: ['social', 'lying'] }, pass: 'grudge_cracks', fail: 'dogs_fight' },
      { text: 'Back to the square', to: 'square' },
    ],
  },
  grudge_deal: {
    on: [{ flag: 'grudgeDeal' }, { flag: 'grudgeDone' }],
    text: ['Mrs Grudge counts out a hundred now and promises the rest after the judging. “No hurry,” she says. “Have a cup of tea. Have several.”'],
    choices: [{ text: 'Go back to the show at four', to: 'show' }],
  },
  grudge_cracks: {
    on: [{ flag: 'grudgeDone' }, { flag: 'knowsHabits' }],
    text: ['Mrs Grudge’s needles stop. “All right,” she says. “I blew a dog whistle at him. Just once. They hate it. He went off like a firework.” She takes the whistle off the grey dog’s collar and throws it at you. “Blow it near him and he’ll jump straight to whoever’s holding it. That’s how they’re trained. Not that it matters now.”'],
    choices: [{ text: 'Take the whistle', to: 'whistle' }],
  },
  whistle: {
    on: [{ flag: 'dogWhistle' }, { flag: 'grudgeDone' }],
    text: ['A small silver whistle, too high to hear. Blink dogs come to it, the way other dogs come to their name.'],
    choices: [{ text: 'Blow it in the square', to: 'whistled' }],
  },
  dogs_fight: {
    text: ['Mrs Grudge says a word, and four grey blink dogs come out from under the caravan, appearing at your ankles before they’ve finished running.'],
    fight: {
      monsters: [blinkdog, blinkdog],
      win: 'dogs_down', flee: { to: 'square', label: 'Run back to the square' },
      special: [{ label: 'Throw them your rations', if: { item: 'rations' }, flag: 'dogsFed', text: 'They fall on the food, and forget you exist.', win: true }],
    },
  },
  dogs_down: {
    on: [{ flag: 'grudgeDone' }],
    text: ['The grey dogs blink away under the caravan and stay there. Mrs Grudge picks up her knitting again, furious. The dog with the whistle on its collar is lying at your feet.'],
    choices: [{ text: 'Take the whistle', to: 'whistle' }],
  },
  whistled: {
    text: ['You stand in the middle of the square and blow. Nothing seems to happen. Then there’s a pop of air, and a small white dog with one brown ear is sitting at your feet, looking up at you with enormous reproach.'],
    choices: [{ text: 'Pick him up', to: 'caught' }],
  },
  caught: {
    on: [{ flag: 'biscuit' }],
    text: ['You have Sir Biscuit. He weighs almost nothing, smells of sausages and has decided, for now, to allow it.'],
    choices: [
      { text: 'Hold him on the way with your rope as a lead, so he can’t blink off', to: 'show', if: { anyItem: ['rope', 'chain'] }, effects: [{ flag: 'leashed' }] },
      { text: 'Carry him back to the show', test: { stat: 'Dex', dd: 6, skill: ['athletics'] }, pass: 'show', fail: 'escaped' },
    ],
  },
  escaped: {
    on: [{ unflag: 'biscuit' }, TICK],
    text: ['Halfway across the square, Sir Biscuit wriggles, blinks, and is on the other side of the market, cocking his leg on a pie stall. You have to start again.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  show: {
    end: 'victory',
    on: [
      { if: { flag: 'biscuit', below: ['time', 4] }, gold: 200, uncapped: true, msg: 'The Duke pays 200GP, and a rosette, which he takes back.' },
      { if: { flag: 'grudgeDeal' }, gold: 100, uncapped: true, msg: 'Mrs Grudge’s first hundred.' },
      { if: { flag: 'grudgeDeal', notFlag: 'biscuit' }, gold: 150, uncapped: true, msg: 'Mrs Grudge pays the rest: 150GP.' },
    ],
    text: (c) => [
      c.flags.biscuit && (c.flags.time || 0) < 4
        ? 'You put Sir Biscuit on his table at five to four. He sits, perfectly still, for the first time all day, and wins Best in Show without moving a muscle.' + (c.flags.grudgeDeal ? ' Mrs Grudge’s face, when she sees him, is worth more than the money she won’t be paying you.' : '')
        : c.flags.biscuit ? 'You bring Sir Biscuit in after the judging. Mrs Grudge’s dogs have won. The Duke takes his dog without a word, and doesn’t pay you either.'
          : c.flags.grudgeDeal ? 'Mrs Grudge’s grey dogs take Best in Show. She pays you the rest of her money, grinning. Out in the square, a small white dog blinks onto the church roof and stays there, offended, for a week.'
            : 'Mrs Grudge’s grey dogs take Best in Show. Sir Biscuit turns up at the Duke’s house two days later, sleeps for a week, and never forgives anybody.',
      `You leave Waggleton with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
};

export const DEATH_TEXT = [
  'You die in Waggleton on show day. Mrs Grudge’s dogs sniff you, and take Best in Show.',
  'Your adventure ends here.',
];
