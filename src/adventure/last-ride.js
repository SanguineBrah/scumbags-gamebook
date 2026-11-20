// THE LAST RIDE OF SIR GRISTLE — escort an aged hero on his final quest, or don't. For a level 5–6 scumbag.
// Every time Sir Gristle exerts himself there is a 1 in 10 chance his heart gives out (the rulebook's aged hero).

export const META = {
  tier: 6, id: 'last-ride', title: 'The Last Ride of Sir Gristle', levels: '5–6', final: 'pension_office',
  blurb: 'Sir Bertram Gristle is ninety-one and wants one last quest: to slay Old Croaker, the toad farmer of Muckle Fen. His nephew will pay you to make sure he dies gloriously. Sir Gristle will pay you to make sure he doesn’t. You could, in theory, take both jobs.',
};

// Exertion: 1 in 10 chance of a heart attack. `heart` is set when it happens.
const EXERT = { chance: [1, 10], then: [{ flag: 'heart', msg: 'Sir Gristle clutches his chest and topples off his horse.' }] };
const ALIVE = { notFlag: 'heart', notFlagText: 'Sir Gristle on his feet' };
const toad = { name: 'Burst toad', lvl: 1, range: 'engaged', feats: ['burst'], note: 'Swollen with marsh gas; explodes when slain (d6 Dex save or 2d6 damage)' };

export const SECTIONS = {
  start: {
    text: [
      'Sir Bertram Gristle receives you in the parlour of his crumbling manor, in full armour, which takes him most of the morning to put on. “Old Croaker,” he wheezes. “Toad farmer. Menace. Fires toads at the village from a cannon. Exploding toads. I shall slay him. One last quest. You shall be my squire.”',
      'On your way out, his nephew Percival catches your sleeve. “The Royal Pension Office pays five hundred gold to the family of any knight who dies in glorious battle,” he murmurs. “Dies of old age, we get nothing. See that he dies gloriously, and three hundred of it is yours.” Then Sir Gristle calls you back. “And squire,” he says, “if I come home alive, I shall pay you three hundred gold just to see Percival’s face.”',
    ],
    choices: [
      { text: 'Agree to keep Sir Gristle alive', to: 'set_out', effects: [{ flag: 'keepAlive' }] },
      { text: 'Agree to see he dies gloriously', to: 'set_out', effects: [{ flag: 'glory' }] },
      { text: 'Agree to both, and decide later', to: 'set_out', effects: [{ flag: 'keepAlive' }, { flag: 'glory' }] },
    ],
  },
  set_out: {
    text: ['Sir Gristle mounts his horse, Thunder, who is thirty and mostly asleep. It takes three of you to get him into the saddle. You set out for Muckle Fen at the pace of a funeral, which, depending on who is paying, may be appropriate.'],
    choices: [
      { text: 'Take the King’s Road (longer, but safer)', to: 'road' },
      { text: 'Take the short cut across the fen', to: 'fen_edge' },
    ],
  },
  road: {
    text: ['On the King’s Road you meet a party of young adventurers coming the other way. They recognise Sir Gristle at once. “It’s HIM,” breathes one. “The Hero of the Stinking Ford!” They want autographs. They want stories. They want to see him do his famous running leap onto a horse.'],
    choices: [
      { text: 'Let him show them the leap', to: 'leap', effects: [EXERT] },
      { text: 'Tell them he’s resting', test: { stat: 'Cha', dd: 6, skill: ['social', 'lying'], profs: ['Bodyguard'], why: 'keeping fans away is your job' }, pass: 'fans_gone', fail: 'leap' },
      { text: 'Sell them his autograph (forged)', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'autographs', fail: 'fans_gone', if: { item: 'quill' } },
    ],
  },
  leap: {
    text: (c, visits) => visits > 1 && c.flags.heart ? ['Your prayer goes unanswered. Sir Gristle lies on the King’s Road, purple, breathing faintly. The young adventurers have gone.'] : c.flags.heart
      ? ['He runs, he leaps, he misses the horse completely and lies on the road, purple, with his eyes shut. The young adventurers back away slowly.']
      : ['He runs, he leaps, he lands in the saddle facing backwards. The young adventurers cheer. Sir Gristle waves, wheezing, and has to be helped to turn round.'],
    choices: [
      { text: 'Revive him with smelling salts', to: 'revived', if: { item: 'salts' }, show: { flag: 'heart' } },
      { text: 'Try to revive him', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'revived', fail: 'dead_on_road', show: { flag: 'heart' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'revived', fail: 'leap', critFail: 'harm_road', show: { flag: 'heart' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'revived', fail: 'leap', critFail: 'harm_road', show: { flag: 'heart' } },
      { text: 'Let nature take its course', to: 'dead_on_road', show: { flag: 'heart' } },
      { text: 'Ride on', to: 'fen_edge', show: ALIVE },
    ],
  },
  revived: {
    on: [{ unflag: 'heart' }],
    text: ['Sir Gristle sits bolt upright. “Where’s the toad?” he demands. You tell him it’s further on. He seems pleased. He has no idea anything happened, and you decide not to tell him.'],
    choices: [{ text: 'Ride on', to: 'fen_edge' }],
  },
  dead_on_road: {
    on: [{ flag: 'dead' }, { flag: 'inglorious' }],
    text: ['Sir Bertram Gristle, Hero of the Stinking Ford, has died of a heart attack showing off on the King’s Road. It is not, by any definition the Pension Office would accept, glorious.'],
    choices: [
      { text: 'Make it look glorious', to: 'staging' },
      { text: 'Take him home', to: 'pension_office' },
    ],
  },
  staging: {
    text: ['You could, if you were the kind of person who would, prop him up on Thunder, carry him into Muckle Fen, and make sure he was seen to fall in battle. You are exactly that kind of person.'],
    choices: [
      { text: 'Tie him into the saddle', to: 'fen_edge', if: { anyItem: ['rope', 'chain', 'manacles'] }, effects: [{ flag: 'propped' }, { unflag: 'inglorious' }] },
      { text: 'Glue him into the saddle', to: 'fen_edge', if: { item: 'glue' }, effects: [{ lose: 'glue' }, { flag: 'propped' }, { unflag: 'inglorious' }] },
      { text: 'Give up and take him home', to: 'pension_office' },
    ],
  },
  fans_gone: {
    text: ['The young adventurers trail away, disappointed. One of them looks back and salutes. Sir Gristle salutes back and nearly falls off.'],
    choices: [{ text: 'Ride on', to: 'fen_edge' }],
  },
  autographs: {
    on: [{ gold: 40, msg: 'Eight forged autographs at 5GP each.' }], onceOnly: true,
    text: ['“Sir Gristle’s hands aren’t what they were,” you explain, signing on his behalf with a flourish. The young adventurers pay five gold each and treasure them forever.'],
    choices: [{ text: 'Ride on', to: 'fen_edge' }],
  },
  fen_edge: {
    text: (c) => [
      'Muckle Fen is a grey-green nothing of reeds, mud and standing water. Somewhere out there, a cannon goes WHUMP, and a toad sails overhead, croaking, and explodes in a field. On a hummock in the middle of the fen stands a farmhouse with a cannon on the roof.',
      c.flags.propped ? 'Sir Gristle sways in the saddle beside you, looking more alive than he did yesterday.' : 'Sir Gristle draws his sword with a noise like a kettle. “Charge!” he says, and nobody moves, including the horse.',
      'There’s a causeway, half sunk; a flat-bottomed punt tied to a stake; and a lot of mud.',
    ],
    choices: [
      { text: 'Lead the horse along the sunken causeway', test: { stat: 'Wis', dd: 8, skill: ['survival'], profs: ['Hunter', 'Woodcutter'], why: 'you can read the ground', mods: [{ if: { item: 'pole' }, dd: 4 }] }, pass: 'causeway', fail: 'bog' },
      { text: 'Cast Waterwalk on Thunder, and ride straight across the top of the fen', cast: 'waterwalk', pass: 'fen_walk', fail: 'fen_edge', critFail: 'fen_burden' },
      { text: 'Take the punt', to: 'punt' },
      { text: 'Let Sir Gristle charge straight across the mud', to: 'charge', show: { notFlag: 'propped' } },
    ],
  },
  charge: {
    on: [EXERT],
    text: (c) => c.flags.heart
      ? ['Sir Gristle digs in his spurs. Thunder wakes, considers, and sets off at a stately trot into the mud. Twenty yards out, Sir Gristle gives a great cry, clutches his chest and slides gently into the fen.']
      : ['Sir Gristle digs in his spurs. Thunder wakes, considers, and sets off at a stately trot into the mud, where he sinks to the knees and stops. Sir Gristle waves his sword at the farmhouse. It is too far away to notice.'],
    choices: [
      { text: 'Haul them both out', test: { stat: 'Str', dd: 8, skill: ['athletics', 'bruteforce'], mods: [{ if: { anyItem: ['rope', 'chain'] }, dd: 4 }] }, pass: 'hauled', fail: 'bog' },
    ],
  },
  hauled: {
    text: (c, visits) => visits > 1 && c.flags.heart ? ['Your prayer goes unanswered. Sir Gristle lies on the bank beside Thunder, breathing faintly.'] : ['You get hold of Thunder’s bridle and heave, and horse and knight come out of the mud with a noise like a cow being born.'],
    choices: [
      { text: 'Revive Sir Gristle with smelling salts', to: 'fen_revived', if: { item: 'salts' }, show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Try to revive Sir Gristle', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'fen_revived', fail: 'fen_dead', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'fen_revived', fail: 'hauled', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'fen_revived', fail: 'hauled', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Push on along the causeway', to: 'causeway', show: { notFlag: 'heart' } },
    ],
  },
  bog: {
    on: [{ damage: 'd6', from: 'The bog' }],
    text: ['The mud takes you up to the waist, and something in it takes a bite. By the time you’ve dragged everyone out you’re wet, filthy and missing a boot.'],
    choices: [
      { text: 'Revive Sir Gristle with smelling salts', to: 'fen_revived', if: { item: 'salts' }, show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Try to revive Sir Gristle', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'fen_revived', fail: 'fen_dead', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'fen_revived', fail: 'fen_fizzle', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'fen_revived', fail: 'fen_fizzle', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Push on along the causeway', to: 'causeway', show: { notFlag: 'heart' } },
      { text: 'Push on along the causeway', to: 'causeway', show: { flag: 'propped' } },
    ],
  },
  fen_revived: {
    on: [{ unflag: 'heart' }],
    text: ['Sir Gristle comes round spluttering. “Did I get him?” he asks. Not yet, you say. “Good,” he says. “Saving the best for last.”'],
    choices: [{ text: 'Push on along the causeway', to: 'causeway' }],
  },
  fen_dead: {
    on: [{ flag: 'dead' }, { flag: 'inglorious' }],
    text: ['Sir Bertram Gristle has died in a bog, a quarter of a mile from the enemy, of natural causes. You close his eyes, and think about money.'],
    choices: [{ text: 'Make it look glorious', to: 'staging_fen' }, { text: 'Take him home', to: 'pension_office' }],
  },
  staging_fen: {
    text: ['The farmhouse is right there. If somebody were seen to fall storming it…'],
    choices: [
      { text: 'Tie him onto Thunder', to: 'causeway', if: { anyItem: ['rope', 'chain', 'manacles'] }, effects: [{ flag: 'propped' }, { unflag: 'inglorious' }] },
      { text: 'Glue him onto Thunder', to: 'causeway', if: { item: 'glue' }, effects: [{ lose: 'glue' }, { flag: 'propped' }, { unflag: 'inglorious' }] },
      { text: 'Take him home', to: 'pension_office' },
    ],
  },
  punt: {
    text: (c) => [`The punt leaks. ${c.flags.propped ? 'Thunder refuses to get in, so you send him round by the bank with Sir Gristle tied on top, and hope he knows the way. He does: he has been to the farm before.' : 'Thunder refuses to get in, so Sir Gristle rides round by the bank, “guarding the rear”, and promises to meet you at the farm.'} Halfway across, the water around you starts to bubble, and a dozen swollen toads surface, glowing faintly and ticking.`],
    choices: [
      { text: 'Bail with your bucket and pole on through', test: { stat: 'Str', dd: 6, skill: ['athletics'] }, pass: 'farm_yard', fail: 'toads', if: { item: 'bucket' } },
      { text: 'Pole through as fast as you can', test: { stat: 'Str', dd: 8, skill: ['athletics'], mods: [{ if: { item: 'pole' }, dd: 4 }] }, pass: 'farm_yard', fail: 'toads' },
      { text: 'Cast Ward on the punt and let them come', cast: 'ward', pass: 'toads_warned', fail: 'toads' },
    ],
  },
  toads_warned: {
    text: ['Every time a toad touches the punt, an alarm goes off like a cathedral bell. The toads, deeply startled, explode harmlessly in the water. You arrive at the farm soaked, deafened and alive.'],
    choices: [{ text: 'Climb out at the farm', to: 'farm_yard' }],
  },
  toads: {
    text: ['The toads swarm over the side of the punt, ticking.'],
    fight: { outdoors: true, monsters: [toad, toad, toad], win: 'farm_yard', flee: { to: 'fen_edge', label: 'Jump overboard and wade back' } },
  },
  causeway: {
    text: (c) => [
      'The causeway brings you, muddy and squelching, to the farmyard. Hundreds of toads sit in cages along the walls, swelling gently. On the roof, an iron cannon swings round to point at you.',
      c.flags.dead && c.flags.propped ? 'Sir Gristle, tied upright on Thunder, rides proudly into the yard. From a distance, he looks magnificent.' : c.flags.dead ? '' : 'Sir Gristle, still mounted, raises his sword. “CROAKER!” he bellows. “COME OUT AND FACE ME!”',
    ].filter(Boolean),
    choices: [{ text: 'Into the farmyard', to: 'farm_yard' }],
  },
  farm_yard: {
    text: (c) => [
      'Old Croaker comes out onto the roof beside his cannon: a long, thin man in waders with a pipe and a face like a sad frog. “Go away,” he says. “I’m busy. The toads have to go somewhere.”',
      c.flags.dead || c.flags.propped ? '' : 'Sir Gristle draws himself up. “You have been firing exploding toads at the village of Lower Muckle for a month,” he says. “Prepare to die.”',
    ].filter(Boolean),
    choices: [
      { text: 'Ask him why he fires toads at the village', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'croaker_story', fail: 'cannon_fight' },
      { text: 'Climb up and spike his cannon with an iron spike', test: { stat: 'Dex', dd: 8, skill: ['athletics', 'skulduggery'], mods: [{ if: { anyItem: ['rope', 'climbing'] }, dd: 4 }] }, pass: 'spiked', fail: 'cannon_fight', if: { item: 'spikes' } },
      { text: 'Glue up the cannon’s touch-hole', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'spiked', fail: 'cannon_fight', if: { item: 'glue' }, effects: [{ lose: 'glue' }, { flag: 'gluedCannon' }] },
      { text: 'Dazzle him with your hand mirror', to: 'dazzled', if: { item: 'mirror' } },
      { text: 'Cast Chosen on yourself, and walk up to the cannon through the toads', cast: 'chosen', pass: 'chosen_walk', fail: 'cannon_fight', critFail: 'pariah_walk' },
      { text: 'Cast Humble on the cannon', cast: 'humble', pass: 'cannon_shrunk', fail: 'cannon_fight', critFail: 'cannon_grown' },
      { text: 'Cast Telekinesis, and turn the cannon round to face the fen', cast: 'telekinesis', pass: 'cannon_turned', fail: 'cannon_fight' },
      { text: 'Let Sir Gristle challenge him to single combat', to: 'duel', show: { notFlag: 'dead' } },
      { text: 'Send Sir Gristle, tied to Thunder, charging at the farmhouse', to: 'glory_charge', show: { flag: 'propped' } },
      { text: 'Attack', to: 'cannon_fight' },
    ],
  },
  croaker_story: {
    on: [{ flag: 'story' }],
    text: (c) => [`Old Croaker sighs. “The toads breed in the fen. Thousands of ’em. If I don’t get rid of them, they go off on their own, in the night, in people’s cellars. So I fire them at the village pond, where they go off harmlessly. Mostly. That’s my job. Nobody thanks me.” ${c.flags.dead
      ? 'He looks at the knight tied to the horse. “Least of all him. He’s the one who hired me, forty years ago.” He squints. “Is he… all right?”'
      : 'He looks at Sir Gristle. “Least of all him. He’s the one who hired me, forty years ago.”'}`],
    choices: [
      { text: 'Tell Sir Gristle the truth', to: 'truth', show: { notFlag: 'dead' } },
      { text: 'Offer to help him aim them somewhere better', test: { stat: 'Int', dd: 8, skill: ['analysis'], profs: ['Alchemist', 'Hunter'], why: 'you understand trajectories, or toads' }, pass: 'better_aim', fail: 'cannon_fight' },
      { text: 'Attack him anyway', to: 'cannon_fight' },
    ],
  },
  truth: {
    onceOnly: true,
    text: (c, visits) => visits > 1 && c.flags.heart ? ['Your prayer goes unanswered. Sir Gristle lies where he fell, with Croaker’s hand still in his, breathing faintly.'] : ['Sir Gristle listens, frowning, to Croaker’s story. Then he laughs until he wheezes. “By God, I did hire him. Forgot all about it.” He sheathes his sword. “Well, Croaker. I shan’t kill you, then. I shall shake your hand.” He climbs down from Thunder to do it, which is, in its way, the bravest thing he does all day.'],
    on: [EXERT],
    choices: [
      { text: 'Revive him with smelling salts', to: 'peace_revived', if: { item: 'salts' }, show: { flag: 'heart' } },
      { text: 'Try to revive him', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'peace_revived', fail: 'peace_dead', show: { flag: 'heart' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'peace_revived', fail: 'truth', critFail: 'harm_peace', show: { flag: 'heart' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'peace_revived', fail: 'truth', critFail: 'harm_peace', show: { flag: 'heart' } },
      { text: 'Take him home', to: 'pension_office', show: { notFlag: 'heart' } },
    ],
  },
  peace_revived: {
    on: [{ unflag: 'heart' }],
    text: ['He comes round on the ground with his hand still in Croaker’s. “Firm grip,” he says. “Good man.”'],
    choices: [{ text: 'Take him home', to: 'pension_office' }],
  },
  peace_dead: {
    on: [{ flag: 'dead' }, { flag: 'inglorious' }],
    text: ['Sir Bertram Gristle dies shaking hands with the man he came to kill, which is a better death than most, if not a glorious one.'],
    choices: [{ text: 'Take him home', to: 'pension_office' }],
  },
  better_aim: {
    on: [{ gold: 60, msg: 'Croaker pays you 60GP from a jar, delighted.' }, { flag: 'aimed' }],
    text: ['You spend an hour with Croaker, a map and a lot of wet string, and work out that if he moves the cannon six feet to the left, the toads will land in the middle of the fen, where nobody lives except other toads. He is so happy he cries a little.'],
    choices: [{ text: 'Take Sir Gristle home', to: 'pension_office' }],
  },
  spiked: {
    on: [{ flag: 'spiked' }, { if: { notFlag: 'gluedCannon' }, lose: 'spikes' }],
    text: (c) => [`${c.flags.gluedCannon ? 'You fill the touch-hole with glue, and the cannon is useless.' : 'You hammer home the spike and the cannon is useless.'} Croaker looks at it, then at you, and sits down on the roof with his head in his hands. “The toads,” he says. “What am I going to do with the toads?”`],
    choices: [
      { text: 'Ask him what he means', to: 'croaker_story' },
      { text: 'Take Sir Gristle home', to: 'pension_office' },
    ],
  },
  dazzled: {
    text: ['You catch the sun in your mirror and flash it into Croaker’s eyes. He reels back, fires the cannon blind, and blows a hole in his own barn. Toads pour out of it in every direction, croaking and ticking. Croaker climbs down the ladder to chase them, swearing.'],
    choices: [{ text: 'Take the chance to grab his cash box', to: 'cashbox' }, { text: 'Follow him and talk', to: 'croaker_story' }],
  },
  cashbox: {
    on: [{ gold: 120, msg: 'Forty years of toad-disposal fees: 120GP.' }], onceOnly: true,
    text: ['Croaker keeps his cash box in the oven. Everybody keeps their cash box in the oven.'],
    choices: [{ text: 'Take Sir Gristle home', to: 'pension_office' }],
  },
  duel: {
    on: [EXERT], onceOnly: true,
    text: (c, visits) => visits > 1 && c.flags.heart ? ['Your prayer goes unanswered. Sir Gristle lies face-down in the yard, sword pointing at the enemy, breathing faintly.'] : c.flags.heart
      ? ['Sir Gristle advances on the farmhouse with his sword raised, roaring a war cry from the Stinking Ford. Croaker swings the cannon round. Before it can fire, Sir Gristle’s heart does, in a manner of speaking, and he falls face-first in the yard, sword pointing at the enemy. A toad lands on his back and croaks.', 'From the village, people have been watching. It looked very, very glorious.']
      : ['Sir Gristle advances, roaring. Croaker fires. The toad hits Sir Gristle’s shield and explodes, throwing him flat on his back in the yard, where he lies laughing. “Ha! Missed!” he cries, which isn’t true, but nobody has the heart to tell him. Croaker is so impressed that he comes down to shake his hand.'],
    choices: [
      { text: 'Hear what Croaker has to say', to: 'croaker_story', show: { notFlag: 'heart' } },
      { text: 'Make sure he isn’t revived', to: 'glorious', show: { flag: 'heart' } },
      { text: 'Revive him with smelling salts', to: 'duel_revived', if: { item: 'salts' }, show: { flag: 'heart' } },
      { text: 'Try to revive him', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'duel_revived', fail: 'glorious', show: { flag: 'heart' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'duel_revived', fail: 'duel', critFail: 'harm_duel', show: { flag: 'heart' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'duel_revived', fail: 'duel', critFail: 'harm_duel', show: { flag: 'heart' } },
    ],
  },
  duel_revived: {
    on: [{ unflag: 'heart' }],
    text: ['Sir Gristle comes round flat on his back in the farmyard, with a toad sitting on his breastplate. “Did I win?” he asks. Croaker, who has come down to look, says that he did. It seems the kindest thing.'],
    choices: [{ text: 'Hear what Croaker has to say', to: 'croaker_story' }],
  },
  glory_charge: {
    text: ['You slap Thunder’s rump. The creaky horse sets off at a canter, a dead knight swaying magnificently in the saddle, sword lashed to his hand. Croaker sees him coming and fires in panic. Toad, knight and horse meet in a tremendous green explosion. Thunder trots out of the smoke unhurt. Sir Gristle does not, being already dead, but the village saw everything.'],
    on: [{ flag: 'gloriousDeath' }],
    choices: [{ text: 'Take him home', to: 'pension_office' }],
  },
  glorious: {
    on: [{ flag: 'dead' }, { flag: 'gloriousDeath' }],
    text: ['You kneel beside Sir Gristle, take off your hat, and wait until you’re sure.'],
    choices: [{ text: 'Take him home', to: 'pension_office' }],
  },
  cannon_fight: {
    text: ['Croaker swings the cannon round and lights the fuse. A toad the size of a cat comes whistling down at you, glowing and ticking.'],
    fight: { outdoors: true,
      monsters: [{ name: 'Old Croaker', lvl: 4, range: 'long', onHit: { stat: 'Dex', dd: 6, label: 'dodge the blast', text: 'The toad goes off at your feet.', effect: 'damage', amount: '2d6' }, note: 'Eccentric; launches burst toads from a cannon (on hit, d6 Dex save or 2d6 more)' }, toad],
      distance: 3, win: 'croaker_beaten', flee: { to: 'fen_edge', label: 'Retreat into the reeds' },
      special: [{ label: 'Douse his fuse with your bucket', if: { item: 'bucket' }, flag: 'doused', text: 'You hurl a bucket of fen water at the roof. The fuse goes out with a hiss, and so does Croaker’s will to fight.', win: true }],
    },
  },
  croaker_beaten: {
    on: [{ gold: 120, msg: 'In his oven: a cash box with 120GP of toad-disposal fees.' }], onceOnly: true,
    text: (c) => [
      'Croaker surrenders, sitting on his roof with his pipe out. “Fine,” he says. “Take the cannon. See how you like the toads.”',
      c.flags.dead ? '' : 'Sir Gristle claims the victory, loudly, and is carried home a hero, which mostly involves being helped back onto Thunder.',
    ].filter(Boolean),
    choices: [{ text: 'Go home', to: 'pension_office' }],
  },
  pension_office: {
    end: 'victory',
    on: [
      { if: { notFlag: 'dead', flag: 'keepAlive' }, gold: 300, uncapped: true, msg: 'Sir Gristle pays you 300GP, just to see Percival’s face.' },
      { if: { flag: 'gloriousDeath', any: [{ flag: 'glory' }] }, gold: 300, uncapped: true, msg: 'Percival pays you 300GP out of the pension.' },
      { if: { flag: 'propped', notFlag: 'gloriousDeath' }, msg: 'The village swears he fell storming the farm.' },
      { if: { flag: 'propped', notFlag: 'gloriousDeath', any: [{ flag: 'glory' }] }, gold: 300, uncapped: true, msg: 'Percival pays you 300GP out of the pension.' },
    ],
    text: (c) => [
      c.flags.gloriousDeath || (c.flags.dead && c.flags.propped)
        ? `Sir Bertram Gristle is buried with full honours. The Pension Office pays out, Percival weeps for nearly a minute, and the toads keep on coming.${c.flags.glory ? '' : ' Percival never thanks you. You never asked him to.'}`
        : c.flags.dead
          ? 'Sir Bertram Gristle is buried quietly. The Pension Office notes the cause of death as “old age, mostly” and pays nothing. Percival looks at you as if it were your fault, which, in fairness, it might be.'
          : 'Sir Bertram Gristle rides home on Thunder, at the pace of a funeral, and lives another nine years out of spite. Percival’s face is everything he hoped.',
      c.flags.aimed ? 'In Lower Muckle, the exploding toads stop landing in the village pond. Nobody ever finds out why.' : '',
      `You come home with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ].filter(Boolean),
  },
  harm_road: {
    text: ['Your god scorns you. Instead of healing, your prayer lands on Sir Gristle’s heart like a dropped anvil. He gives a small sigh, and is still.'],
    choices: [{ text: 'Kneel beside him', to: 'dead_on_road' }],
  },
  harm_fen: {
    text: ['Your god scorns you. Instead of healing, your prayer lands on Sir Gristle’s heart like a dropped anvil. He gives a small sigh, and slides a little further into the mud.'],
    choices: [{ text: 'Kneel beside him', to: 'fen_dead' }],
  },
  harm_peace: {
    text: ['Your god scorns you. Instead of healing, your prayer lands on Sir Gristle’s heart like a dropped anvil. He gives a small sigh, with Croaker’s hand still in his.'],
    choices: [{ text: 'Kneel beside him', to: 'peace_dead' }],
  },
  harm_duel: {
    text: ['Your god scorns you. Instead of healing, your prayer lands on Sir Gristle’s heart like a dropped anvil. He gives a small sigh, sword still in his hand.'],
    choices: [{ text: 'Kneel beside him', to: 'glorious' }],
  },
  fen_walk: {
    text: ['Thunder steps out onto the mud, finds it as firm as a road, and trots across the top of Muckle Fen with Sir Gristle upright in the saddle and you running behind, sinking, holding on to the stirrup. The reeds part. The farmhouse comes up out of the mist.'],
    choices: [{ text: 'Into the farmyard', to: 'farm_yard' }],
  },
  fen_burden: {
    text: ['Your god scorns you. Instead of walking on water, Thunder suddenly weighs twice what he did, and sinks to the hocks where he stands. It takes an hour to dig him out.'],
    choices: [{ text: 'Try another way', to: 'fen_edge' }],
  },
  chosen_walk: {
    text: ['Croaker fires toad after toad at you, and every one of them swerves away at the last moment and bursts harmlessly in the reeds. You walk up to the farmhouse, climb the ladder, and stand beside him on the roof. He looks at the cannon, and at you, and puts down the slow match.'],
    choices: [{ text: 'Ask him why he fires toads at the village', to: 'croaker_story' }],
  },
  pariah_walk: {
    text: ['Your god scorns you. Instead of being Chosen, you become a Pariah. Every toad Croaker fires for the next five minutes is drawn to you, wherever he aims it, like iron filings to a magnet.'],
    choices: [{ text: 'Brace yourself', to: 'cannon_fight' }],
  },
  cannon_shrunk: {
    on: [{ flag: 'spiked' }],
    text: ['The cannon shrinks to a quarter of its size. Croaker drops the next toad into it, and the toad sits in the muzzle, too big to go anywhere, looking out. Croaker looks at it, then at you, and sits down on the roof with his head in his hands. “The toads,” he says. “What am I going to do with the toads?”'],
    choices: [{ text: 'Ask him what he means', to: 'croaker_story' }, { text: 'Take Sir Gristle home', to: 'pension_office' }],
  },
  cannon_grown: {
    text: ['Your god scorns you. Instead of shrinking, the cannon grows to twice its size. Croaker looks at it with love. Then he loads three toads at once.'],
    choices: [{ text: 'Brace yourself', to: 'cannon_fight' }],
  },
  cannon_turned: {
    on: [{ flag: 'spiked' }],
    text: ['The cannon swings round on its own, under Croaker’s hands, until it points out over the fen, and stays there. He heaves at it. It won’t move. The next toad goes off into the reeds, where it frightens a heron. Croaker sits down on the roof with his head in his hands. “The toads,” he says. “What am I going to do with the toads?”'],
    choices: [{ text: 'Ask him what he means', to: 'croaker_story' }, { text: 'Take Sir Gristle home', to: 'pension_office' }],
  },
  fen_fizzle: {
    text: ['Your prayer goes unanswered. Sir Gristle lies in the mud, breathing faintly, his moustache trembling.'],
    choices: [
      { text: 'Revive Sir Gristle with smelling salts', to: 'fen_revived', if: { item: 'salts' }, show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Try to revive Sir Gristle', test: { stat: 'Wis', dd: 8, skill: ['medicine'] }, pass: 'fen_revived', fail: 'fen_dead', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Heal on him', cast: 'heal', pass: 'fen_revived', fail: 'fen_fizzle', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Cast Vivify on him', cast: 'vivify', pass: 'fen_revived', fail: 'fen_fizzle', critFail: 'harm_fen', show: { flag: 'heart', notFlag: 'propped' } },
      { text: 'Push on along the causeway', to: 'causeway', show: { notFlag: 'heart' } },
      { text: 'Push on along the causeway', to: 'causeway', show: { flag: 'propped' } },
    ],
  },
};

export const DEATH_TEXT = [
  'You die in Muckle Fen. Nobody pays a pension for squires.',
  'Your adventure ends here.',
];
