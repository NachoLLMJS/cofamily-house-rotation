import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRotation } from '../src/rotation.js';
import { buildSceneModel } from '../src/scene-model.js';

const root = new URL('../', import.meta.url);

test('only children receive migrating backpacks in the 3D scene model', () => {
  for (let index = 0; index < 6; index += 1) {
    const scene = buildSceneModel(getRotation(index));
    const owners = scene.backpacks.map(({ owner }) => owner);
    assert.ok(owners.every((owner) => ['Zven', 'Lily', 'Febric', 'Hreda'].includes(owner)));
  }
});

test('the Three.js scene loads Meshy characters, furniture, lighting, and rotation updates', async () => {
  const source = await readFile(new URL('src/scene3d.js', root), 'utf8');

  assert.match(source, /from 'three'/);
  assert.match(source, /GLTFLoader/);
  assert.match(source, /meshy-family-v1/);
  assert.match(source, /loadCharacterModels/);
  assert.match(source, /createBackpack/);
  assert.match(source, /updateRotation/);
  assert.match(source, /OrbitControls/);
  assert.doesNotMatch(source, /CapsuleGeometry/);
});

test('all eight people use distinct Meshy family likenesses while the red-haired woman stays unchanged', async () => {
  const source = await readFile(new URL('src/scene3d.js', root), 'utf8');
  const assetBlock = source.match(/const characterAssets = \{([\s\S]*?)\n\};/)?.[1] ?? '';
  const paths = [...assetBlock.matchAll(/'([^']+\.glb\?v=\d+)'/g)].map((match) => match[1]);

  assert.equal(paths.length, 8);
  assert.equal(new Set(paths).size, 8);
  assert.match(assetBlock, /Seila: '\/models\/meshy-family-v1\/adult-woman\.glb\?v=1'/);
  for (const asset of ['vitalik', 'dmitry', 'natalia', 'misha', 'katya', 'cousin-male', 'cousin-female']) {
    assert.match(assetBlock, new RegExp(`/models/meshy-buterin-family-v2/${asset}\\.glb\\?v=2`));
  }
});

test('the rendered room has no chair geometry', async () => {
  const source = await readFile(new URL('src/scene3d.js', root), 'utf8');

  assert.doesNotMatch(source, /function createChair/);
  assert.doesNotMatch(source, /const chairs =/);
  assert.doesNotMatch(source, /\n\s*chairs\.forEach/);
});