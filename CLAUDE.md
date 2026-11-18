# Notes for Claude Code

- Vanilla ES modules, no dependencies, Node 20+. `npm test` must pass and `npm run check` must
  report no problems before you finish.
- The bundler (`tools/build.mjs`) only understands single-line `import { a, b } from '...'`
  and `export function|class|const|let` / `export { }`. Keep to those forms.
- Rules live in `src/rules/` and should match the Scumbags! rulebook. Anything the gamebook
  changes is marked `(gamebook)` and explained in `docs/ADAPTATION.md`.
- Adventure content is data, one module per adventure in `src/adventure/`; see `docs/WRITING.md` for
  the section format. Sections are keyed by name; numbers are assigned by `index.js`, so never
  write a section number into the text.
- After changing content or balance, run `npm run simulate` and `node tools/duels.mjs` and look
  at the fight death rates.
- House style: British spelling, second person, short sentences, the rulebook's deadpan tone.
