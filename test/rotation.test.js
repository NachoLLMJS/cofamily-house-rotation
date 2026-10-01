import test from 'node:test';
import assert from 'node:assert/strict';
import { getRotation } from '../src/rotation.js';
import { buildSceneModel } from '../src/scene-model.js';

test('the first rotation distinguishes residents from visiting children', () => {
  const rotation = getRotation(0);

  assert.deepEqual(rotation.residents, ['Gladias', 'Seila', 'Vil', 'Daia']);
  assert.deepEqual(rotation.visitors, ['Lily']);
  assert.equal(rotation.season, 'Early spring');
});

test('each named diner keeps their truthful Dzego dinner order', () => {
  const expected = {
    Gladias: 10,
    Seila: 13,
    Febric: 4,
    Zven: 5,
    Lily: 8,
    Hreda: 9,
  };

  const seen = new Map();
  for (let index = 0; index < 6; index += 1) {
    const rotation = getRotation(index);
    for (const person of [...rotation.residents, ...rotation.visitors]) {
      if (person in expected) seen.set(person, rotation.orders[person]);
    }
  }

  assert.deepEqual(Object.fromEntries(seen), expected);
});

test('the scene creates one chair per diner and gives backpacks only to resident children', () => {
  const model = buildSceneModel(getRotation(5));

  assert.equal(model.chairs.length, 6);
  assert.equal(model.backpacks.length, 2);
  assert.deepEqual(
    model.backpacks.map(({ owner, status }) => [owner, status]),
    [
      ['Zven', 'resident'],
      ['Hreda', 'resident'],
    ],
  );
  assert.deepEqual(model.visitorNames, ['Gladias', 'Seila']);
});
