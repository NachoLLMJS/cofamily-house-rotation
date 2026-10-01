import { buildSceneModel } from './scene-model.js';

const palette = {
  Gladias: '#b85f44',
  Seila: '#d68b4c',
  Vil: '#557d6e',
  Daia: '#9470a8',
  Zven: '#527f96',
  Lily: '#cc7685',
  Febric: '#8d704f',
  Hreda: '#78944d',
};

function orderText(order) {
  return order === null ? 'Dzego order not recorded' : `Dzego order ${order}`;
}

export function renderSceneMarkup(rotation) {
  const scene = buildSceneModel(rotation);
  const chairs = scene.chairs
    .map(
      ({ name, status, order }) => `
        <article data-person="${name}">
          <strong>${name}</strong>
          <span>${status === 'resident' ? 'Current household' : 'Visiting for dinner'}</span>
          <small>${orderText(order)}</small>
        </article>`,
    )
    .join('');

  const backpacks = scene.backpacks
    .map(
      ({ owner, status }) => `<span>${owner}’s backpack, ${status === 'resident' ? 'unpacked in this household' : 'arriving with a visiting child'}</span>`,
    )
    .join('');

  return `
    <div data-rotation="${rotation.index}">
      <p>Dining table with ${scene.chairs.length} places</p>
      ${chairs}
      <div aria-label="Backpacks belonging only to children">${backpacks}</div>
    </div>`;
}
