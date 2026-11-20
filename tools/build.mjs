// Bundle src/ into a single self-contained dist/gamebook.html (no dependencies, works from file://).
// Supports the module style used in this repo: single-line named imports, and
// `export function|class|const|let` declarations or `export { a, b };` lists.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'src/main.js');
const mods = new Map();

function load(file) {
  if (mods.has(file)) return;
  mods.set(file, null);
  let src = readFileSync(file, 'utf8');
  const exportsList = [];
  const deps = [];
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*'([^']+)';?\s*$/gm, (_, names, spec) => {
    const dep = resolve(dirname(file), spec);
    deps.push(dep);
    const bind = names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n.replace(/\s+as\s+/, ': ')).join(', ');
    return `const { ${bind} } = __req(${JSON.stringify(key(dep))});`;
  });
  if (/^import\s/m.test(src)) throw new Error(`Unsupported import form in ${file}`);
  src = src.replace(/^export\s+\{([^}]*)\};?\s*$/gm, (_, names) => { exportsList.push(...names.split(',').map((n) => n.trim()).filter(Boolean)); return ''; });
  src = src.replace(/^export\s+(async\s+function|function|class|const|let)\s+([A-Za-z_$][\w$]*)/gm, (_, kw, name) => { exportsList.push(name); return `${kw} ${name}`; });
  if (/^export\s/m.test(src)) throw new Error(`Unsupported export form in ${file}`);
  mods.set(file, { src, exportsList });
  for (const d of deps) load(d);
}
const key = (f) => relative(root, f).replace(/\\/g, '/');

load(entry);
let bundle = `(function(){\n'use strict';\nconst __defs = {}, __cache = {};\nfunction __req(k){ if (!(k in __cache)) { __cache[k] = {}; __cache[k] = __defs[k](); } return __cache[k]; }\n`;
for (const [file, m] of mods) {
  bundle += `__defs[${JSON.stringify(key(file))}] = function(){\n${m.src}\nreturn { ${m.exportsList.join(', ')} };\n};\n`;
}
bundle += `__req(${JSON.stringify(key(entry))});\n})();\n`;

let html = readFileSync(resolve(root, 'index.html'), 'utf8')
  .replace(/<script type="module" src="src\/main.js"><\/script>/, () => `<script>\n${bundle.replace(/<\/script/g, '<\\/script')}</script>`);
if (!html.includes('__req(')) throw new Error('index.html script tag not found');
// Inline local font files so the single HTML file works anywhere.
html = html.replace(/url\('(assets\/[^']+\.ttf)'\)/g, (_, f) => `url('data:font/ttf;base64,${readFileSync(resolve(root, f)).toString('base64')}')`);
// The icons and manifest stay real files beside the page (home-screen icons need real URLs): see below.
// Stamp the build, so a page left open in a tab can tell when a newer one has been published.
const stamp = createHash('sha1').update(html).digest('hex').slice(0, 12);
html = html.replace('</head>', () => `<meta name="build" content="${stamp}">\n</head>`);
mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/gamebook.html'), html);
mkdirSync(resolve(root, 'dist/assets/icons'), { recursive: true });
for (const f of readdirSync(resolve(root, 'assets/icons'))) copyFileSync(resolve(root, 'assets/icons', f), resolve(root, 'dist/assets/icons', f));
copyFileSync(resolve(root, 'manifest.webmanifest'), resolve(root, 'dist/manifest.webmanifest'));
console.log(`dist/gamebook.html written: ${mods.size} modules, ${(html.length / 1024).toFixed(1)} KB`);
