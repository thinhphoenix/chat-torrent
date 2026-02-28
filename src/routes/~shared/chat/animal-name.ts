const ANIMALS = [
  'Otter',
  'Fox',
  'Panda',
  'Wolf',
  'Hawk',
  'Lynx',
  'Bear',
  'Deer',
  'Eagle',
  'Shark',
  'Tiger',
  'Lion',
  'Cobra',
  'Raven',
  'Crane',
  'Whale',
  'Bison',
  'Moose',
  'Gecko',
  'Koala',
  'Sloth',
  'Viper',
  'Falcon',
  'Badger',
  'Heron',
  'Zebra',
  'Camel',
  'Lemur',
  'Squid',
  'Robin',
  'Finch',
  'Hippo',
  'Rhino',
  'Macaw',
  'Dingo',
  'Quail',
  'Coyote',
  'Ferret',
  'Marten',
  'Puffin',
  'Toucan',
  'Osprey',
  'Jackal',
  'Iguana',
  'Parrot',
  'Walrus',
  'Alpaca',
  'Condor',
  'Mantis',
  'Salmon',
];

const STORAGE_KEY = 'chat_animal_name';

function generateName(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${animal}-${number}`;
}

export function getAnimalName(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const name = generateName();
  localStorage.setItem(STORAGE_KEY, name);
  return name;
}

export function resetAnimalName(): string {
  const name = generateName();
  localStorage.setItem(STORAGE_KEY, name);
  return name;
}
