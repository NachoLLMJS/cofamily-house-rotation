import './style.css';
import { getRotation, getRotationCount } from './rotation.js';
import { renderSceneMarkup } from './render.js';
import { createHouseScene } from './scene3d.js';

const elements = {
  scene: document.querySelector('#scene'),
  sceneSummary: document.querySelector('#scene-summary'),
  season: document.querySelector('#season-label'),
  heading: document.querySelector('#room-heading'),
  note: document.querySelector('#scene-note'),
  residents: document.querySelector('#resident-list'),
  visitors: document.querySelector('#visitor-list'),
  range: document.querySelector('#rotation-range'),
  month: document.querySelector('#month-readout'),
  step: document.querySelector('#step-readout'),
  monthLabels: document.querySelector('#month-labels'),
  previous: document.querySelector('#previous'),
  next: document.querySelector('#next'),
};

const houseScene = createHouseScene(elements.scene);

function listMarkup(names, rotation, kind) {
  return names.map((name) => {
    const order = rotation.orders[name];
    return `<li><span class="roster__dot" data-name="${name}"></span><strong>${name}</strong><span class="roster__role">${kind}</span><b>${order ?? '—'}</b></li>`;
  }).join('');
}

function render(index) {
  const rotation = getRotation(index);
  houseScene.updateRotation(rotation);
  elements.sceneSummary.innerHTML = renderSceneMarkup(rotation);
  elements.season.textContent = rotation.season;
  elements.heading.textContent = `${rotation.month} at the long table`;
  elements.note.textContent = rotation.note;
  elements.residents.innerHTML = listMarkup(rotation.residents, rotation, 'living here');
  elements.visitors.innerHTML = listMarkup(rotation.visitors, rotation, 'visiting');
  elements.month.textContent = rotation.month;
  elements.step.textContent = `${String(rotation.index + 1).padStart(2, '0')} / 06`;
  elements.range.value = String(rotation.index);
  elements.range.setAttribute('aria-valuetext', `${rotation.month}, ${rotation.season.toLowerCase()}`);
  elements.previous.disabled = rotation.index === 0;
  elements.next.disabled = rotation.index === getRotationCount() - 1;
  document.body.dataset.season = rotation.index < 3 ? 'spring' : 'summer';
}

const months = Array.from({ length: getRotationCount() }, (_, index) => getRotation(index).month);
elements.monthLabels.innerHTML = months.map((month) => `<span>${month}</span>`).join('');
elements.range.addEventListener('input', (event) => render(event.target.value));
elements.previous.addEventListener('click', () => render(Number(elements.range.value) - 1));
elements.next.addEventListener('click', () => render(Number(elements.range.value) + 1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && document.activeElement !== elements.range) elements.previous.click();
  if (event.key === 'ArrowRight' && document.activeElement !== elements.range) elements.next.click();
});

render(0);

window.addEventListener('pagehide', () => houseScene.dispose(), { once: true });
