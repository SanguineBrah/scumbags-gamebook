# Writing sections

Each section in `src/adventure/death-and-taxes.js` is keyed by a name:

```js
library: {
  dark: true,                                   // uses up light on entry
  text: ['Paragraph one.', 'Paragraph two.'],   // or (c) => [...] to vary with the character
  on: [{ gold: 20 }, { item: 'salve' }],        // effects on entry; add onceOnly: true for loot
  choices: [
    { text: 'Leave', to: 'hall' },
    { text: 'Search the shelves', test: { stat: 'Int', dd: 8, skill: 'analysis' }, pass: 'found', fail: 'mimic' },
    { text: 'Use the key', to: 'vault', if: { item: 'vaultkey' } },     // shown, locked without the key
    { text: 'Stab the book', to: 'ambush', show: { notFlag: 'mimicDead' } }, // listed only when true
  ],
},
```

- **Effects:** `gold` (add `uncapped: true` for payment at the end, which ignores slots), `item`,
  `lose`, `sell: { item, gold, text }` (removes the item, pays out and sets the flag `sold_<item>`),
  `add: ['counter', n]`, `damage` (dice), `heal` (dice), `flag`, `unflag`, `msg`, `lightCharges`.
  Each can have its own `if`.
- **Interruptions:** `redirect: [{ if, to }]` on a section sends the player somewhere else on entry,
  for events like a giant coming home when the `noise` counter reaches 3.
- **Conditions** (`if`, `show`): `item`, `anyItem`, `notItem`, `flag`, `notFlag`, `gold`, `atLeast: ['counter', n]`,
  `below: ['counter', n]`, `level`,
  `magic`, `alignment`, `skill`, `spell`, `light`, `fire`, `feature`, `ranged`, `any`, `none`.
- **Tests:** `stat`, `dd`, `skill` (one skill or a list: any of them makes the test skilled),
  `profs` (professions that justify it, per the rulebook's "anything that can be justified based on
  your profession") with an optional `why` shown to the player, `save: true` for saving throws, `knowledge: true` for things
  a Canny scumbag just knows, and `mods: [{ if, dd }]` or `[{ if, auto: true, text }]`.
- **Spells and turning:** `{ cast: 'bless', pass, fail }`, `{ turn: { dd }, pass, chaos, fail }`.
- **Fights:** `fight: { monsters: [{ name, lvl, range, feats, hp, dmg, note }], win, flee: { to, label },
  surprise, distance, cornered, unless, unlucky, special: [{ label, text, if, flag | repeat, test, dmg, win }] }`. Monsters can have `ap` (armour points, soaked before HP) and `onHit: { stat, dd, label, text, effect:
  'prone' | 'gold' | 'damage', amount }`. Monster features: `brute`, `contract`, `exposed` (crits when
  engaged), `noEngaged` (pikes), `burst` (explodes when slain), `topple`, `coward`, `unluckyAura`,
  `critWide`,
  `tiny`, `handgun`, `dealD6`, `takeD6`, `approval`, `relentless`, `magicImmune`, `undead`,
  `vomit`, `invisible` (attacks use a d20 until something reveals it: pocket sand, or a special with
  `reveal: true`), `ghostly` (ignores non-magical damage unless it's holy, or the scumbag has the
  `blessedWeapon` flag), `breath`, `flies`; plus `regen` and `regenStop` (a flag that stops it).
  Specials can also `stun: n` the monsters.
- **Endings:** `end: 'death' | 'quit' | 'victory'`.

Run `npm run check` after editing. It also rejects any item, spell, profession, skill or feature
name it doesn't recognise.

## Items

Before you finish a scene, go through the equipment list and ask of each item: would a player
holding this expect it to help here? If so, give it a choice. A rope in front of a gorge, a pole
in front of a mousetrap, rations in front of a hungry animal, a mirror in front of a vampire, glue
in front of anything that wobbles. Items can be a choice of their own (`if: { item }`) or make a
test easier (`mods`). The cheaper the item, the more it should be rewarded for being remembered.
`node tools/affordances.mjs` lists what each adventure uses and never uses.

## Consistency

A section can be reached by many routes, and visited more than once. Before you finish one, ask
what the player might already have done: killed, befriended, robbed or fled from whoever is in it;
taken what's described as lying there; put out the fire it mentions. Use flags and text functions
so the text matches (`text: (c, visits) => ...`: `visits` is 1 on the first visit). Somebody you
ran away from should remember you; something you took shouldn't still be on the shelf.

What happened in earlier adventures is kept too: when a scumbag finishes an adventure, its flags
are saved in `c.past[adventureId]`. Use `pastFlag(c, id, flag)` in text, or the `past` and
`notPast` conditions, when a character or place comes back (Lord Grimsby, the counting house).
Adventures unlock in chains, so check `after` to see which earlier ones a player must have done,
and which they might have skipped.

`node tools/states.mjs <id>` plays an adventure many times and lists, for every section, the
flags that are always or only sometimes set on arrival: read each section against the
"sometimes" list.

## Skills

Give every test all the skills that could plausibly cover it, and list any professions that could
justify it even without a listed skill (a woodcutter climbing, a hunter stalking, a cutpurse
haggling over stolen goods). Ask: would a host at the table let this character roll twice?

## Monsters

The rulebook's bestiary is a set of examples. Use them where they fit, but invent monsters for the
story in the same style: a level, a range, and one or two features that are short, specific and a
bit silly (Sir Reginald Overdraft, the inkwell imp and the ghost of Usurer Vane in this book).
Prefer features that change how you play the fight, or offer a way round it, over bigger numbers.

## Adventures

Each adventure is a module in `src/adventure/` exporting `META` (`id`, `title`, `levels`, `blurb`,
`final`: the key of the main victory section, which gets the last number; `after`: the adventures,
any one of which reveals this one), `SECTIONS` and `DEATH_TEXT`. Register it in
`src/adventure/index.js`. A scumbag can't repeat an adventure they've finished. Significant loot that is sold at the end can
take several slots (`slots` in `SIGNIFICANT`), which makes carrying it a decision.
