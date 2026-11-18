# Ten Bad Ideas — Scumbags! gamebooks

Ten classic adventures for one scumbag, using the
**Scumbags!** RPG rules: roll-under d20 + difficulty die stat tests, skills from your
profession, attacks against a d8, defending with Str or Dex against the monster's die,
AP before HP, light that runs out, 50GP per significant item slot, and levelling up by
squandering 200GP on a pointless endeavour when you get home.

| Adventure | Level | The job |
|---|---|---|
| Death and Taxes | 1 | Rob a dead moneylender's vault under Gallows Hill |
| The Tall Order | 1–2 | Steal the Lofty Hat from Lord Longshanks' birthday party |
| Fortune's Fang | 2–3 | Break the bank at a casino run by a luck vampire |
| Mother's Kitchen | 3–4 | Steal a hill giant's prize Golden Turnip from her mantelpiece |
| Eviction Notice | 4–5 | Evict a kobold siege-pyramid from a town square, or don't |
| The Last Ride of Sir Gristle | 5–6 | Get a dying old knight to his glorious last battle, or keep him alive |
| The Invisible Menagerie | 6–7 | Steal an invisible ostrich egg from a travelling show, with a visitor from very far away |
| Unsolved | 7–8 | Solve the transdimensional murdercube haunting a university |
| Torches and Pitchforks | 8–9 | Escort Lord Grimsby across a moor through a mob of ghostly tenants |
| A Perfectly Standard Dragon | 9–10 | Deal with a dragon that is following procedure |

Each adventure's sections are shuffled the traditional way: the start is 1 and the way home is last.
Survivors are kept. Between adventures they're in Scumbag Town, where they can rest at the inn (HP
carries over otherwise), swap and restock mundane items, buy potions and gear, sell loot to the fence,
squander their takings to level up, and pick a job from the notice board. Finishing a job reveals the
next ones (each adventure's `after` list), and a scumbag can't do the same job twice.
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
    node tools/affordances.mjs # which items, spells and professions each adventure gives a use to

| Path | What's in it |
|---|---|
| `src/rules/` | Rulebook tables and rules: dice, stat tests, character creation, levelling |
| `src/engine/` | Gamebook engine: sections, choices, conditions, effects, light, fights, saving |
| `src/adventure/` | One module per adventure, and `index.js`, which registers and numbers them |
| `src/ui/app.js` | The whole interface, plain DOM |
| `index.html` | Page shell and all the CSS |
| `tools/` | Bundler, dev server, graph checker, bots |
| `docs/` | How the rules were adapted, and how to write sections |
