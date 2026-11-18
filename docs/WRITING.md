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

- **Effects:** `gold`, `item`, `lose`, `damage` (dice), `heal` (dice), `flag`, `unflag`, `msg`,
  `lightCharges`. Each can have its own `if`.
- **Conditions** (`if`, `show`): `item`, `anyItem`, `notItem`, `flag`, `notFlag`, `gold`,
  `magic`, `alignment`, `skill`, `spell`, `light`, `fire`, `feature`, `ranged`, `any`, `none`.
- **Tests:** `stat`, `dd`, `skill` (one skill or a list: any of them makes the test skilled),
  `profs` (professions that justify it, per the rulebook's "anything that can be justified based on
  your profession") with an optional `why` shown to the player, `save: true` for saving throws, `knowledge: true` for things
  a Canny scumbag just knows, and `mods: [{ if, dd }]` or `[{ if, auto: true, text }]`.
- **Spells and turning:** `{ cast: 'bless', pass, fail }`, `{ turn: { dd }, pass, chaos, fail }`.
- **Fights:** `fight: { monsters: [{ name, lvl, range, feats, hp, dmg, note }], win, flee: { to, label },
  surprise, distance, special: [{ flag, label, if, text }] }`. Monsters can have `ap` (armour points, soaked before HP). Monster features: `brute`, `contract`,
  `tiny`, `handgun`, `dealD6`, `takeD6`, `approval`, `relentless`, `magicImmune`, `undead`,
  `vomit`; plus `regen` and `regenStop` (a flag that stops it).
- **Endings:** `end: 'death' | 'quit' | 'victory'`.

Run `npm run check` after editing.

## Skills

Give every test all the skills that could plausibly cover it, and list any professions that could
justify it even without a listed skill (a woodcutter climbing, a hunter stalking, a cutpurse
haggling over stolen goods). Ask: would a host at the table let this character roll twice?

## Monsters

The rulebook's bestiary is a set of examples. Use them where they fit, but invent monsters for the
story in the same style: a level, a range, and one or two features that are short, specific and a
bit silly (Sir Reginald Overdraft, the inkwell imp and the ghost of Usurer Vane in this book).
Prefer features that change how you play the fight, or offer a way round it, over bigger numbers.
