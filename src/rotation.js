export const people = [
  'Gladias',
  'Seila',
  'Vil',
  'Daia',
  'Zven',
  'Lily',
  'Febric',
  'Hreda',
];

const orders = Object.freeze({
  Gladias: 10,
  Seila: 13,
  Vil: null,
  Daia: null,
  Zven: 5,
  Lily: 8,
  Febric: 4,
  Hreda: 9,
});

const rotations = [
  {
    season: 'Early spring',
    month: 'March',
    note: 'Lily crosses the lane after school and stays for supper',
    residents: ['Gladias', 'Seila', 'Vil', 'Daia'],
    visitors: ['Lily'],
  },
  {
    season: 'Mid spring',
    month: 'April',
    note: 'The children’s backpacks settle by the east wall for a month',
    residents: ['Febric', 'Hreda', 'Zven', 'Lily'],
    visitors: ['Daia'],
  },
  {
    season: 'Late spring',
    month: 'May',
    note: 'Zven moves in while Vil keeps a regular place as a visitor',
    residents: ['Gladias', 'Seila', 'Lily', 'Zven'],
    visitors: ['Vil'],
  },
  {
    season: 'Early summer',
    month: 'June',
    note: 'The table returns to the south household for long bright evenings',
    residents: ['Febric', 'Hreda', 'Vil', 'Daia'],
    visitors: ['Zven'],
  },
  {
    season: 'High summer',
    month: 'July',
    note: 'Febric brings a small case while Hreda arrives for dinner',
    residents: ['Gladias', 'Seila', 'Febric', 'Lily'],
    visitors: ['Hreda'],
  },
  {
    season: 'Late summer',
    month: 'August',
    note: 'Six places open for the handover meal before the next cycle',
    residents: ['Zven', 'Hreda', 'Vil', 'Daia'],
    visitors: ['Gladias', 'Seila'],
  },
].map((rotation, index) => ({ ...rotation, index, orders }));

export function getRotation(index) {
  const safeIndex = Math.max(0, Math.min(rotations.length - 1, Number(index) || 0));
  return rotations[safeIndex];
}

export function getRotationCount() {
  return rotations.length;
}
