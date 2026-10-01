import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildSceneModel } from './scene-model.js';

const palette = {
  Gladias: 0xb85f44,
  Seila: 0xd68b4c,
  Vil: 0x557d6e,
  Daia: 0x9470a8,
  Zven: 0x527f96,
  Lily: 0xcc7685,
  Febric: 0x8d704f,
  Hreda: 0x78944d,
};

const children = new Set(['Zven', 'Lily', 'Febric', 'Hreda']);
const characterAssets = {
  Gladias: '/models/meshy-buterin-family-v2/natalia.glb?v=2',
  Seila: '/models/meshy-family-v1/adult-woman.glb?v=1',
  Vil: '/models/meshy-buterin-family-v2/vitalik.glb?v=2',
  Daia: '/models/meshy-buterin-family-v2/dmitry.glb?v=2',
  Zven: '/models/meshy-buterin-family-v2/misha.glb?v=2',
  Lily: '/models/meshy-buterin-family-v2/katya.glb?v=2',
  Febric: '/models/meshy-buterin-family-v2/cousin-male.glb?v=2',
  Hreda: '/models/meshy-buterin-family-v2/cousin-female.glb?v=2',
};
const seatPositions = [
  { x: -4.15, z: -1.9, rotation: 0.18 },
  { x: -1.65, z: -3.25, rotation: 0 },
  { x: 1.65, z: -3.25, rotation: 0 },
  { x: 4.15, z: -1.9, rotation: -0.18 },
  { x: 2.65, z: 3.05, rotation: Math.PI },
  { x: -2.65, z: 3.05, rotation: Math.PI },
];
const bagPositions = [
  new THREE.Vector3(-4.9, 0.55, 3.55),
  new THREE.Vector3(-3.95, 0.55, 4.05),
  new THREE.Vector3(4.05, 0.55, 4.05),
  new THREE.Vector3(5, 0.55, 3.55),
];

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02, ...options });
}

function mesh(geometry, color, options) {
  const item = new THREE.Mesh(geometry, material(color, options));
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function roundedBox(width, height, depth, radius = 0.12) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}

function createLabel(text, color = '#30291f', background = 'rgba(247,234,213,0.94)') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = background;
  context.roundRect(8, 8, 496, 112, 18);
  context.fill();
  context.strokeStyle = 'rgba(48,41,31,0.3)';
  context.lineWidth = 4;
  context.stroke();
  context.fillStyle = color;
  context.font = '700 42px Georgia';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.8, 0.45, 1);
  return sprite;
}

function createBackpack(name) {
  const group = new THREE.Group();
  group.name = `${name}-backpack`;
  const color = palette[name];
  const body = mesh(roundedBox(0.72, 0.86, 0.28, 0.16), color);
  body.position.set(-0.36, -0.43, -0.14);
  group.add(body);
  const pocket = mesh(roundedBox(0.46, 0.34, 0.12, 0.09), new THREE.Color(color).offsetHSL(0, 0, 0.08));
  pocket.position.set(-0.23, -0.35, 0.16);
  group.add(pocket);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.045, 8, 18, Math.PI),
    material(0x4d382d),
  );
  handle.position.set(0, 0.47, 0);
  handle.rotation.z = Math.PI;
  group.add(handle);
  const label = createLabel(name, '#30291f', 'rgba(255,248,234,0.92)');
  label.scale.set(1.35, 0.34, 1);
  label.position.set(0, 0.92, 0);
  group.add(label);
  group.visible = false;
  group.scale.setScalar(0.001);
  return group;
}

function createRoom(scene) {
  const floor = mesh(new THREE.PlaneGeometry(15, 11), 0xb98254);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const rug = mesh(new THREE.PlaneGeometry(8.7, 6), 0xb86b50);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.012;
  rug.receiveShadow = true;
  scene.add(rug);

  const backWall = mesh(new THREE.BoxGeometry(15, 7, 0.22), 0xe1cda8);
  backWall.position.set(0, 3.5, -5.35);
  scene.add(backWall);
  const sideWall = mesh(new THREE.BoxGeometry(0.22, 7, 11), 0xd2b889);
  sideWall.position.set(-7.35, 3.5, 0);
  scene.add(sideWall);

  const windowFrame = new THREE.Group();
  const windowPane = mesh(new THREE.PlaneGeometry(3.2, 2.2), 0xaac4c2, { emissive: 0x789ca0, emissiveIntensity: 0.25 });
  windowPane.position.z = 0.03;
  windowFrame.add(windowPane);
  for (const [w, h, x, y] of [[3.45, 0.14, 0, 0], [0.14, 2.45, 0, 0], [3.45, 0.18, 0, 1.18], [3.45, 0.18, 0, -1.18], [0.18, 2.45, 1.67, 0], [0.18, 2.45, -1.67, 0]]) {
    const piece = mesh(new THREE.BoxGeometry(w, h, 0.16), 0x70482f);
    piece.position.set(x, y, 0.08);
    windowFrame.add(piece);
  }
  windowFrame.position.set(-3.5, 4.15, -5.2);
  scene.add(windowFrame);

  const sideboard = mesh(new THREE.BoxGeometry(3.2, 1.65, 1.1), 0x6f4932);
  sideboard.position.set(4.8, 0.85, -4.55);
  scene.add(sideboard);

  const tableTop = mesh(new THREE.CylinderGeometry(3.45, 3.55, 0.32, 48), 0x815033);
  tableTop.scale.z = 0.62;
  tableTop.position.y = 1.55;
  scene.add(tableTop);
  for (const x of [-1.9, 1.9]) {
    const leg = mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.5, 12), 0x65402a);
    leg.position.set(x, 0.76, 0);
    scene.add(leg);
  }

  const vase = mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.7, 16), 0x557d6e);
  vase.position.set(0, 2.07, 0);
  scene.add(vase);
  for (const angle of [-0.35, 0, 0.35]) {
    const stem = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), 0x526b49);
    stem.position.set(Math.sin(angle) * 0.13, 2.7, 0);
    stem.rotation.z = angle;
    scene.add(stem);
  }
}

function normalizeCharacter(source, name) {
  const content = source.clone(true);
  content.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (Array.isArray(object.material)) object.material = object.material.map((item) => item.clone());
    else object.material = object.material?.clone();
  });
  content.updateWorldMatrix(true, true);
  let box = new THREE.Box3().setFromObject(content);
  const targetHeight = children.has(name) ? 2.55 : 3.05;
  content.scale.setScalar(targetHeight / Math.max(box.max.y - box.min.y, 0.001));
  content.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(content);
  const center = box.getCenter(new THREE.Vector3());
  content.position.set(-center.x, -box.min.y, -center.z);

  const wrapper = new THREE.Group();
  wrapper.name = name;
  wrapper.add(content);
  const label = createLabel(name);
  label.position.set(0, targetHeight + 0.35, 0);
  wrapper.add(label);
  wrapper.userData.label = label;
  wrapper.scale.setScalar(0.001);
  wrapper.visible = false;
  return wrapper;
}

export function createHouseScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd8c09a);
  scene.fog = new THREE.Fog(0xd8c09a, 16, 28);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(10.8, 9.2, 12.8);
  camera.lookAt(0, 1.3, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'scene-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.replaceChildren(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 11;
  controls.maxDistance = 20;
  controls.minPolarAngle = 0.68;
  controls.maxPolarAngle = 1.34;
  controls.target.set(0, 1.35, 0);

  scene.add(new THREE.HemisphereLight(0xfff1d2, 0x76523a, 2.1));
  const key = new THREE.DirectionalLight(0xffe0aa, 4.5);
  key.position.set(-5, 11, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  scene.add(key);
  const warm = new THREE.PointLight(0xff9d60, 18, 18, 2);
  warm.position.set(4, 4.5, 2);
  scene.add(warm);

  createRoom(scene);

  const people = new Map();
  const backpacks = new Map([...children].map((name) => {
    const backpack = createBackpack(name);
    scene.add(backpack);
    return [name, backpack];
  }));

  const targets = new Map();
  const bagTargets = new Map();
  let animationFrame = 0;
  let currentRotation = null;

  const loader = new GLTFLoader();
  async function loadCharacterModels() {
    const cache = new Map();
    for (const [name, url] of Object.entries(characterAssets)) {
      if (!cache.has(url)) cache.set(url, loader.loadAsync(url));
      const gltf = await cache.get(url);
      const person = normalizeCharacter(gltf.scene, name);
      people.set(name, person);
      scene.add(person);
    }
    if (currentRotation) applyRotation(currentRotation);
  }
  loadCharacterModels().catch((error) => {
    console.error('Meshy character loading failed', error);
    container.dataset.characterError = 'true';
  });

  function applyRotation(rotation) {
    const model = buildSceneModel(rotation);
    const activeNames = new Set(model.chairs.map(({ name }) => name));
    const activeBags = new Set(model.backpacks.map(({ owner }) => owner));

    model.chairs.forEach((diner, index) => {
      const position = seatPositions[index];
      const person = people.get(diner.name);
      if (person) {
        targets.set(diner.name, { position: new THREE.Vector3(position.x, 0, position.z), rotation: position.rotation, scale: 1 });
        person.visible = true;
        person.userData.label.material.opacity = diner.status === 'visitor' ? 0.7 : 1;
      }
    });

    people.forEach((person, name) => {
      if (!activeNames.has(name)) targets.set(name, { position: new THREE.Vector3(0, 0, -7), rotation: 0, scale: 0.001 });
    });

    model.backpacks.forEach((bag, index) => {
      const item = backpacks.get(bag.owner);
      item.visible = true;
      bagTargets.set(bag.owner, { position: bagPositions[index % bagPositions.length], scale: 1.3 });
    });
    backpacks.forEach((item, name) => {
      if (!activeBags.has(name)) bagTargets.set(name, { position: new THREE.Vector3(0, 0, -7), scale: 0.001 });
    });
  }

  function updateRotation(rotation) {
    currentRotation = rotation;
    applyRotation(rotation);
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  function animate() {
    controls.update();
    people.forEach((person, name) => {
      const target = targets.get(name);
      if (!target) return;
      person.position.lerp(target.position, 0.075);
      person.rotation.y = THREE.MathUtils.lerp(person.rotation.y, target.rotation, 0.08);
      person.scale.lerp(new THREE.Vector3(target.scale, target.scale, target.scale), 0.09);
      if (target.scale < 0.01 && person.scale.x < 0.012) person.visible = false;
    });
    backpacks.forEach((item, name) => {
      const target = bagTargets.get(name);
      if (!target) return;
      item.position.lerp(target.position, 0.07);
      item.scale.lerp(new THREE.Vector3(target.scale, target.scale, target.scale), 0.09);
      if (target.scale < 0.01 && item.scale.x < 0.012) item.visible = false;
    });

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }
  animate();

  return {
    updateRotation,
    dispose() {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
        else object.material?.dispose();
      });
    },
  };
}
