// Copies ../support-kb/src into .build, adds the two files a SvelteKit app needs (app.html and a
// prerender switch), and builds static HTML into ./out. The kb export itself stays untouched.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
rmSync('.build', { recursive: true, force: true });
mkdirSync('.build', { recursive: true });
cpSync('../support-kb/src', '.build/src', { recursive: true });
writeFileSync('.build/src/app.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />%sveltekit.head%</head>
<body><div style="display: contents">%sveltekit.body%</div></body></html>
`);
writeFileSync('.build/src/routes/+layout.js', 'export const prerender = true;\nexport const trailingSlash = "always";\n');
cpSync('svelte.config.js', '.build/svelte.config.js');
cpSync('vite.config.js', '.build/vite.config.js');
writeFileSync('.build/package.json', '{"type":"module"}');
execSync('node ../node_modules/vite/bin/vite.js build', { cwd: '.build', stdio: 'inherit' });
rmSync('out', { recursive: true, force: true });
cpSync('.build/build', 'out', { recursive: true });

// One self-contained file per page, as the desk sees it: CSS inlined, scripts dropped (the tables
// are already rendered on the server), links left as they are.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
rmSync('../rendered', { recursive: true, force: true });
mkdirSync('../rendered', { recursive: true });
for (const file of walk('out').filter((f) => f.endsWith('index.html'))) {
  let html = readFileSync(file, 'utf8')
    .replace(/<link href="([^"]+\.css)" rel="stylesheet">/g, (_, href) => `<style>${readFileSync(join('out', href.replace(/^(\.\.\/)+|^\//g, '')), 'utf8')}</style>`)
    .replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const name = file.split('\\').join('/').replace(/^out\//, '').replace(/\/index\.html$/, '').replace(/\//g, '__') + '.html';
  writeFileSync(join('../rendered', name), html);
  console.log('rendered/' + name);
}
