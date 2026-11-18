# Death and Taxes — a Scumbags! gamebook

A classic choose-your-own-adventure for one scumbag, using the
**Scumbags!** RPG rules: roll-under d20 + difficulty die stat tests, skills from your
profession, attacks against a d8, defending with Str or Dex against the monster's die,
AP before HP, light that runs out, 50GP per significant item slot, and levelling up by
squandering 200GP on a pointless endeavour when you get home.

81 numbered sections, shuffled the traditional way: the start is 1 and the way home is 81.
It plays in a browser and lays itself out for a desktop (adventure sheet beside the text)
or a phone (sheet in a drawer, big tap targets).

## Play

    npm run build        # writes dist/gamebook.html — one self-contained file, works from file://
    npm run serve        # dev server on http://localhost:8080 (ES modules from src/)

No dependencies. Progress is saved in the browser if it allows it.

## Develop

    npm test             # rules, engine and 300 bot playthroughs
    npm run check        # adventure graph: missing targets, unreachable sections, dead ends
    npm run simulate     # 2000 bot playthroughs: survival rate, deaths by section, fight odds
    node tools/duels.mjs # every fight in the book from full health, by profession-random bots

| Path | What's in it |
|---|---|
| `src/rules/` | Rulebook tables and rules: dice, stat tests, character creation, levelling |
| `src/engine/` | Gamebook engine: sections, choices, conditions, effects, light, fights, saving |
| `src/adventure/` | The adventure text (`death-and-taxes.js`) and section numbering |
| `src/ui/app.js` | The whole interface, plain DOM |
| `index.html` | Page shell and all the CSS |
| `tools/` | Bundler, dev server, graph checker, bots |
| `docs/` | How the rules were adapted, and how to write sections |
