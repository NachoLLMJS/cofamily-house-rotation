import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('the page exposes an accessible half-year scrubber and live rotation summary', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');

  assert.match(html, /<html lang="en">/);
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="Choose a month in the household rotation"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Current household/);
  assert.match(html, /Visiting \/ moved children/);
});

test('the stylesheet includes responsive and reduced-motion behavior', async () => {
  const css = await readFile(new URL('src/style.css', root), 'utf8');

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.scene-canvas/);
});

test('the desktop composition is constrained to one main viewport', async () => {
  const css = await readFile(new URL('src/style.css', root), 'utf8');

  assert.match(css, /@media \(min-width: 1100px\)/);
  assert.match(css, /height:100dvh/);
  assert.match(css, /grid-template-rows:auto minmax\(0,1fr\) auto auto/);
  assert.match(css, /\.experience\{min-height:0/);
  assert.match(css, /\.scene-frame\{min-height:0/);
});

test('the house uses a real Three.js scene and visible copy has no terminal full stops', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const main = await readFile(new URL('src/main.js', root), 'utf8');
  const packageJson = await readFile(new URL('package.json', root), 'utf8');

  assert.match(packageJson, /"three"/);
  assert.match(main, /createHouseScene/);
  assert.match(html, /id="scene"/);
  assert.doesNotMatch(html, /turns\.<\/em>/);
  assert.doesNotMatch(html, /rhythm\.<\/p>/);
  assert.doesNotMatch(html, /not\.<\/h2>/);
  assert.doesNotMatch(html, /number\.<\/p>/);
  assert.doesNotMatch(html, /open\.<\/p>/);
});
