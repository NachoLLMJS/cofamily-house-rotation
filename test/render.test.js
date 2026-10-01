import test from 'node:test';
import assert from 'node:assert/strict';
import { getRotation } from '../src/rotation.js';
import { renderSceneMarkup } from '../src/render.js';

test('accessible scene summary labels residents, visitors, child bags, and known orders', () => {
  const markup = renderSceneMarkup(getRotation(4));

  assert.match(markup, /Gladias[\s\S]*Current household/);
  assert.match(markup, /Hreda[\s\S]*Visiting for dinner/);
  assert.match(markup, /Dzego order 10/);
  assert.match(markup, /Dzego order 4/);
  assert.match(markup, /Dzego order 8/);
  assert.match(markup, /Dzego order 9/);
  assert.match(markup, /Febric’s backpack/);
  assert.match(markup, /Lily’s backpack/);
  assert.doesNotMatch(markup, /Gladias’s backpack/);
  assert.doesNotMatch(markup, /Seila’s backpack/);
  assert.doesNotMatch(markup, /Dzego order null/);
});
