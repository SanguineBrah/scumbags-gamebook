// OUT OF THE COT — get a hill giant's baby home before the giant-catcher gets it. For a level 5–6 scumbag.
import { pastFlag, didAdventure } from '../engine/conditions.js';

export const META = {
  tier: 6, id: 'out-of-the-cot', title: 'Out of the Cot', levels: '5–6', final: 'home',
  blurb: 'Mother’s baby has climbed out of its cot, toddled down Hogback Hill and sat down in the middle of the town of Lower Hogback. Mother can’t go in after it without flattening the place. The town council has sent for Captain Snare, giant-catcher, who has a net, a harpoon gun and no sense of humour. Mother will pay a fortune to whoever brings her baby home first.',
};

const baby = { name: 'The baby', lvl: 6, hp: 30, range: 'engaged', feats: ['topple', 'coward'], dmg: 'd8+3', note: 'Infant hill giant (30 HP); falls over at the end of each turn; gives up at half health' };
const snareman = { name: 'Snare’s man', lvl: 3, hp: 10, range: 'engaged', note: 'Giant-catcher; carries a boathook and a grudge' };
const snare = { name: 'Captain Snare', lvl: 5, hp: 18, range: 'medium', dmg: '2d6', note: 'Giant-catcher; harpoon gun (2d6); no sense of humour' };

const MOTHER_KNOWS = (c) => {
  const p = (f) => pastFlag(c, 'mothers-kitchen', f);
  if (p('jarred')) return 'Mother peers down at you, and her face crumples into a smile. “Oh,” she sniffs. “It’s the little one from the jam jar. You’ll know the way, then.”';
  if (didAdventure(c, 'mothers-kitchen')) return `Mother peers down at you. You have been in her kitchen, and she doesn’t know it.${p('sold_turnip') ? ' Somewhere in Turnbull’s shed, her Golden Turnip is gathering dust.' : ''} You decide not to mention it.`;
  return '';
};

export const SECTIONS = {
  start: {
    text: (c) => [
      'Halfway down Hogback Hill, Mother is sitting in a field with her apron over her face, crying. She is a hill giant, a hundred feet tall, and when she sobs, the hedges shake.',
      MOTHER_KNOWS(c),
      `“My baby,” she says. “He climbed out of his cot and went down the hill, and he’s sitting in the middle of the town, and I can’t go in after him. I’d tread on somebody. I’d tread on everybody.” She wipes her nose on a tree. “And they’ve sent for that Captain Snare. With his nets. Bring my baby home and I’ll give you this.” She holds out a gold coin the size of a cartwheel.${pastFlag(c, 'mothers-kitchen', 'coin') ? ' Well, most of one. Somebody has taken a chunk out of it. You don’t say anything.' : ''}`,
    ].filter(Boolean),
    choices: [{ text: 'Go down into Lower Hogback', to: 'square' }],
  },
  square: {
    text: (c) => [
      c.flags.babyFollowing ? 'The baby is following you round the square on its hands and knees, delighted, flattening a wall here and there.'
        : 'In the market square of Lower Hogback sits the baby: forty feet of chubby hill giant in a bonnet and a nappy, playing with the church spire, which has come off. The town is hiding. The baby is having a wonderful time.',
      c.flags.snareFixed ? 'Captain Snare’s camp at the edge of the square is in a sorry state.' : 'At the edge of the square, Captain Snare’s men are unrolling a net the size of a field and loading a harpoon gun.',
    ],
    choices: [
      { text: 'Visit the dairy for something a baby would want', to: 'dairy', show: { notFlag: 'milk' } },
      { text: 'Climb the church tower and fetch the bell, to make a rattle', to: 'tower', show: { notFlag: 'bell' } },
      { text: 'Go and see Captain Snare', to: 'snare_camp', show: { notFlag: 'snareFixed' } },
      { text: 'Blow your whistle at the baby', to: 'whistle', if: { item: 'whistle' }, show: { notFlag: 'babyFollowing' } },
      { text: 'Give the baby the milk', to: 'milk_given', if: { flag: 'milk', flagText: 'a churn of milk' }, show: { notFlag: 'babyFollowing' } },
      { text: 'Give the baby the bell', to: 'bell_given', if: { flag: 'bell', flagText: 'the church bell' }, show: { notFlag: 'babyFollowing' } },
      { text: 'Cast Abundance and set out a feast for it', cast: 'abundance', pass: 'feast', fail: 'grabbed', critFail: 'square_locusts', show: { notFlag: 'babyFollowing' } },
      { text: 'Cast Command on the baby: “Come with me”', cast: 'command', pass: 'baby_commanded', fail: 'grabbed', show: { notFlag: 'babyFollowing' } },
      { text: 'Cast Humble on the baby, and shrink it to a size you can manage', cast: 'humble', pass: 'baby_humbled', fail: 'grabbed', critFail: 'baby_emboldened', show: { notFlag: 'babyFollowing' } },
      { text: 'Cast Embolden on yourself, and go and play with it as an equal', cast: 'embolden', pass: 'playmate', fail: 'grabbed', critFail: 'tiny_toy', show: { notFlag: 'babyFollowing' } },
      { text: 'Walk up to it and introduce yourself', to: 'grabbed', show: { notFlag: 'babyFollowing' } },
      { text: 'Lead the baby out of town and up the hill', to: 'hill_road', show: { flag: 'babyFollowing' } },
      { text: 'Give up and leave', to: 'home' },
    ],
  },
  dairy: {
    text: ['The dairy is deserted. Milk churns stand in rows, each as tall as you. The dairyman is hiding in the butter.'],
    choices: [
      { text: 'Roll out a churn of milk', test: { stat: 'Str', dd: 6, skill: ['athletics', 'bruteforce'] }, pass: 'milk', fail: 'churn_spilt' },
      { text: 'Back to the square', to: 'square' },
    ],
  },
  churn_spilt: {
    on: [{ damage: 'd4', from: 'A milk churn' }],
    text: ['The churn tips, rolls over your foot and empties itself into the street. You try again with the next one.'],
    choices: [{ text: 'Try again', to: 'dairy' }],
  },
  milk: {
    on: [{ flag: 'milk' }],
    text: ['You roll a churn of milk out into the square. It is, to a baby that size, a thimble. But it’s a start.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  tower: {
    text: ['The church tower has lost its spire, which is in the baby’s mouth. The bell hangs open to the sky. A baby likes something that makes a noise.'],
    choices: [
      { text: 'Cut the bell down and lower it on your rope', test: { stat: 'Str', dd: 6, skill: ['athletics'] }, pass: 'bell', fail: 'bell_fall', if: { anyItem: ['rope', 'chain'] } },
      { text: 'Cut it down and let it drop', to: 'bell', effects: [{ damage: 'd4', from: 'The falling bell' }] },
      { text: 'Back down to the square', to: 'square' },
    ],
  },
  bell_fall: {
    on: [{ damage: 'd6', from: 'The bell' }],
    text: ['The rope slips, and you and the bell go down together. The bell lands on the square with a BONG that the baby finds hilarious.'],
    choices: [{ text: 'Get up', to: 'bell' }],
  },
  bell: {
    on: [{ flag: 'bell' }],
    text: ['You have a church bell. Rung, it sounds like a church bell. Shaken, by somebody forty feet tall, it will sound like a rattle.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  whistle: {
    on: [{ flag: 'babyFollowing' }],
    text: ['You blow your whistle. The baby stops chewing the spire. It looks round for the noise. You blow again. Its face lights up, and it comes crawling across the square towards you, flattening a fruit stall, chuckling.'],
    choices: [{ text: 'Keep blowing', to: 'square' }],
  },
  milk_given: {
    on: [{ flag: 'babyFollowing' }],
    text: ['You heave the churn up. The baby takes it in both hands, drinks it in one gulp, and burps a burp that takes the thatch off the inn. It looks at you as if you were its mother. It will follow you anywhere now, in case there’s more.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  bell_given: {
    on: [{ flag: 'babyFollowing' }],
    text: ['You push the church bell across the cobbles. The baby picks it up and shakes it. It goes BONG. The baby shrieks with joy and shakes it again, and again, and follows you round the square, BONG, BONG, BONG.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  grabbed: {
    text: ['The baby sees you. “TOY,” it says, and picks you up.'],
    choices: [
      { text: 'Wriggle free', test: { stat: 'Dex', dd: 8, save: true }, pass: 'square', fail: 'baby_fight' },
      { text: 'Tickle its hand', test: { stat: 'Cha', dd: 6, skill: ['social'] }, pass: 'tickled', fail: 'baby_fight' },
      { text: 'Point at the splinter in its thumb, and take it out with your healer’s kit', to: 'splinter', if: { item: 'healerskit' } },
    ],
  },
  feast: {
    on: [{ flag: 'babyFollowing' }],
    text: ['Loaves, cheeses and a heap of apples the size of a haystack spill out across the cobbles. The baby crawls over, delighted, and eats the lot, and then looks at you, the source of all food, with total devotion. It will follow you anywhere now.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  splinter: {
    on: [{ flag: 'babyFollowing' }],
    text: ['There is a splinter in its thumb the size of a fence post: a bit of the church spire. You lever it out, and dab the hole with something from your kit, and the baby looks at its thumb, and then at you, and puts you down very gently, and pats you on the head with one finger. It will follow you anywhere now.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  tickled: {
    on: [{ flag: 'babyFollowing' }],
    text: ['The baby giggles, a noise like a landslide, and puts you down very gently. It wants to play now. It will follow you anywhere.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  baby_fight: { outdoors: true,
    text: ['The baby decides you are a squeaky toy, and squeezes.'],
    fight: {
      monsters: [baby], win: 'baby_cries', flee: { to: 'square', label: 'Squirm free and run' },
      special: [{ label: 'Wave your smelling salts under its nose', if: { item: 'salts' }, flag: 'sneezed', text: 'The baby sneezes, which blows you clear across the square, and starts to cry.', win: true }],
    },
  },
  baby_cries: {
    text: ['The baby starts to cry. Up on the hill, Mother hears it, and stands up. You have about a minute before she comes into town after it, whatever it treads on.'],
    choices: [
      { text: 'Soothe it, quickly', test: { stat: 'Cha', dd: 8, skill: ['social'], profs: ['Cleric', 'Missionary', 'Bodyguard'], why: 'you’ve calmed people before' }, pass: 'tickled', fail: 'mother_comes' },
      { text: 'Run', to: 'mother_comes' },
    ],
  },
  mother_comes: {
    on: [{ flag: 'trampled' }, { flag: 'delivered' }],
    text: ['Mother comes down the hill. She tries very hard not to tread on anything. She treads on the inn, the bakery and the town hall, and picks up her baby, and goes home with it, sobbing apologies. Lower Hogback will need rebuilding.'],
    choices: [{ text: 'Follow her up the hill', to: 'home' }],
  },
  snare_camp: {
    text: ['Captain Snare is a hard, lean man in a leather coat, with a harpoon gun the size of a canoe. “Catching a giant’s easy,” he says. “Net it, harpoon it, sell the bits. The council’s paying me two hundred. A menagerie’ll pay more for it alive. Want in? Lead it to the net, and I’ll give you a cut.”'],
    choices: [
      { text: 'Agree to lead the baby into his net', to: 'square', effects: [{ flag: 'snareDeal' }], show: { notFlag: 'snareDeal' } },
      { text: 'Pour acid on the net while his back is turned', to: 'sabotaged', if: { item: 'acid' }, effects: [{ lose: 'acid' }] },
      { text: 'Spike the harpoon gun', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'sabotaged', fail: 'snare_fight', if: { item: 'spikes' } },
      { text: 'Glue the harpoon into the barrel', test: { stat: 'Dex', dd: 8, skill: ['skulduggery'] }, pass: 'sabotaged', fail: 'snare_fight', if: { item: 'glue' } },
      { text: 'Cast Invisibility on yourself, and wreck his gear while he’s looking right at it', cast: 'invisibility', pass: 'sabotaged', fail: 'snare_fight', show: { notFlag: 'snareFixed' } },
      { text: 'Tell him the council has cancelled the job', test: { stat: 'Cha', dd: 10, skill: ['lying'] }, pass: 'snare_leaves', fail: 'snare_fight' },
      { text: 'Back to the square', to: 'square' },
    ],
  },
  sabotaged: {
    on: [{ flag: 'snareFixed' }],
    text: ['When Captain Snare turns round, his gear is ruined. He looks at it, at you, and at the baby, and swears for a full minute without repeating himself. He is not going to catch anything today.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  snare_leaves: {
    on: [{ flag: 'snareFixed' }],
    text: ['Captain Snare reads the letter you wave at him, which is a laundry list, very quickly. He packs up his net with a face like thunder and leaves, grumbling about councils.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  snare_fight: { outdoors: true,
    text: ['Captain Snare catches you at it. “Giant-lover,” he says, and nods to the biggest of his men, who picks up a boathook.'],
    fight: { monsters: [snareman], distance: 1, win: 'snare_beaten', flee: { to: 'square', label: 'Run back to the square' } },
  },
  snare_beaten: {
    on: [{ flag: 'snareFixed' }],
    text: ['Snare’s man goes down in his own net. Captain Snare looks at him, and at you, and decides the council isn’t paying him enough. He and his men retreat out of Lower Hogback, leaving the net behind. The baby crawls over and starts eating it.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  hill_road: {
    redirect: [{ if: { flag: 'snareDeal', notFlag: 'snareFixed' }, to: 'net' }, { if: { notFlag: 'snareFixed' }, to: 'ambush' }],
    text: ['You lead the baby out of town and up the hill road, slowly, a step at a time. It follows you like an enormous duckling.'],
    choices: [{ text: 'On up the hill', to: 'arrive' }],
  },
  ambush: {
    text: ['Halfway up the hill road, Captain Snare steps out from behind a hedge with his harpoon gun levelled at the baby. “Mine,” he says.'],
    choices: [
      { text: 'Get between them', to: 'snare_fight_road' },
      { text: 'Shout for Mother', to: 'mother_up' },
    ],
  },
  mother_up: {
    text: ['“MOTHER!” you shout. At the top of the hill, a hundred feet of hill giant stands up and looks down. Captain Snare looks up at her. He lowers his harpoon gun, very slowly, and walks away down the hill, very quickly.'],
    choices: [{ text: 'On up the hill', to: 'arrive' }],
  },
  snare_fight_road: {
    text: ['Captain Snare swings his harpoon gun towards you.'],
    fight: { outdoors: true, monsters: [snare], distance: 1, win: 'arrive', flee: { to: 'mother_up', label: 'Shout for Mother' } },
  },
  arrive: {
    on: [{ flag: 'delivered' }],
    text: ['At the top of the hill road, the baby sees its mother, and lets go of everything it was holding except the church spire, and crawls into her arms.'],
    choices: [{ text: 'Collect your fee', to: 'home' }],
  },
  net: {
    text: ['You lead the baby round the bend of the hill road, and there is Captain Snare’s net, spread across the way, and Captain Snare, waiting. The baby looks at the net, and then at you, trustingly.'],
    choices: [
      { text: 'Walk it into the net', to: 'netted' },
      { text: 'Change your mind, and lead it round', test: { stat: 'Wis', dd: 8, skill: ['survival'] }, pass: 'mother_up', fail: 'snare_fight_road' },
    ],
  },
  netted: {
    on: [{ flag: 'sold' }],
    text: ['The baby walks into the net, and Snare’s men pull it tight. It doesn’t cry. It just looks at you through the mesh. Captain Snare counts out your cut. Up on the hill, Mother is still waiting.'],
    choices: [{ text: 'Leave by the other road', to: 'home' }],
  },
  home: {
    end: 'victory',
    on: [
      { if: { flag: 'delivered' }, gold: 300, uncapped: true, msg: 'Mother gives you her gold coin the size of a cartwheel. A goldsmith in Lower Hogback gives you 300GP for it, and a nervous look.' },
      { if: { flag: 'sold' }, gold: 250, uncapped: true, msg: 'Captain Snare’s cut: 250GP.' },
    ],
    text: (c) => [
      c.flags.sold ? 'The baby is sold to a travelling menagerie that same week. Mother sits on Hogback Hill for a very long time. You avoid the area.'
        : c.flags.trampled ? 'Mother carries her baby home, still apologising to the town. She pays you anyway. Lower Hogback is rebuilt by midwinter, mostly.'
          : !c.flags.delivered ? 'You leave Lower Hogback with the baby still sitting in the square. By nightfall, Captain Snare has his net round it, and Mother’s crying can be heard three counties away.'
          : 'The baby crawls up the last of the hill into Mother’s arms, and she squashes it to her apron and sobs. Lower Hogback is a bit flatter than it was, but standing. The church never gets its spire back. The baby keeps it.',
      `You leave Hogback Hill with ${c.flags.homeGold ? `${c.flags.homeGold} gold` : 'nothing but the clothes you stand up in'}.`,
    ],
  },
  square_locusts: {
    text: ['Your god scorns you. Instead of a feast, a swarm of locusts pours out over the square. The baby grabs at them, misses, grabs again, and gets you instead.'],
    choices: [{ text: 'Wriggle', to: 'grabbed' }],
  },
  baby_commanded: {
    on: [{ flag: 'babyFollowing' }],
    text: ['“Come with me,” you say. The baby stops chewing the spire, looks at you, and comes, crawling across the square after you, flattening a fruit stall, chuckling. It has never done what anybody told it before, and it seems to find it very funny.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  baby_humbled: {
    on: [{ flag: 'babyFollowing' }],
    text: ['The baby shrinks to a quarter of its size, which makes it about as big as a carthorse. It looks at its hands, astonished, and then at you, now nearly its own height, and holds them up to be carried. You can’t carry it. But it toddles after you, holding your sleeve.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  baby_emboldened: {
    text: ['Your god scorns you. Instead of shrinking, the baby grows to twice its size, and finds this very exciting, and then very frightening.'],
    choices: [{ text: 'Duck', to: 'baby_cries' }],
  },
  playmate: {
    on: [{ flag: 'babyFollowing' }],
    text: ['You grow to twice your size, which is still small for a giant, and sit down in the square opposite the baby. It looks at you with enormous interest. You pull a face. It laughs, a noise like a rockfall, and when you get up and walk off, it crawls after you, to see what you’ll do next.'],
    choices: [{ text: 'Back to the square', to: 'square' }],
  },
  tiny_toy: {
    text: ['Your god scorns you. Instead of growing, you shrink to a quarter of your size. The baby sees you at once. You are the best toy it has ever seen.'],
    choices: [{ text: 'Oh no', to: 'grabbed' }],
  },
};

export const DEATH_TEXT = [
  'The baby squeezes, the way babies do, and you are its favourite toy for a little while, and then you aren’t anything.',
  'Your adventure ends here.',
];
