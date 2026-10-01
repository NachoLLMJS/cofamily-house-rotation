const chairPositions = [
  'north-west',
  'north',
  'north-east',
  'south-east',
  'south',
  'south-west',
];

const bagPositions = ['west-hook', 'west-bench', 'east-hook', 'east-bench'];
const children = new Set(['Zven', 'Lily', 'Febric', 'Hreda']);

export function buildSceneModel(rotation) {
  const diners = [
    ...rotation.residents.map((name) => ({ name, status: 'resident' })),
    ...rotation.visitors.map((name) => ({ name, status: 'visitor' })),
  ];

  return {
    chairs: diners.map((diner, index) => ({
      ...diner,
      position: chairPositions[index],
      order: rotation.orders[diner.name],
    })),
    backpacks: diners.filter(({ name }) => children.has(name)).map(({ name: owner, status }, index) => ({
      owner,
      status,
      position: bagPositions[index],
    })),
    visitorNames: [...rotation.visitors],
  };
}
