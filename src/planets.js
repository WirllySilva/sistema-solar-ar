export const planets = [
  { name: 'Mercúrio', image: 'mercurio.jpg', focus: [-5, 25], kind: 'Planeta rochoso', fact: 'É o menor planeta e completa uma volta ao redor do Sol em cerca de 88 dias terrestres.', colors: ['#a49a91', '#665d57', '#d7c6b5'], radius: .12, orbit: .72, period: 12, spin: 30, phase: .3 },
  { name: 'Vênus', image: 'venus.jpg', focus: [5, -20], kind: 'Planeta rochoso', fact: 'Sua atmosfera densa, rica em dióxido de carbono, retém calor e faz dele o planeta mais quente.', colors: ['#ddad62', '#b16e3c', '#f5d69b'], radius: .16, orbit: 1.03, period: 17, spin: -40, phase: 2.4 },
  { name: 'Terra', image: 'terra.jpg', focus: [-12, -65], kind: 'Planeta rochoso', fact: 'Oceanos de água líquida cobrem a maior parte da superfície da Terra. Ela tem um satélite natural, a Lua.', colors: ['#3266bd', '#5d9f65', '#e3edf6'], radius: .17, orbit: 1.36, period: 22, spin: 8, phase: 4.5 },
  { name: 'Marte', image: 'marte.jpg', focus: [13, -110], kind: 'Planeta rochoso', fact: 'Óxidos de ferro presentes na poeira da superfície dão ao planeta sua cor avermelhada.', colors: ['#ba6540', '#783d32', '#eea26b'], radius: .13, orbit: 1.70, period: 29, spin: 9, phase: 5.6 },
  { name: 'Júpiter', image: 'jupiter.jpg', focus: [-12, -48], kind: 'Gigante gasoso', fact: 'É o maior planeta. A Grande Mancha Vermelha é uma enorme tempestade em sua atmosfera.', colors: ['#d2a57f', '#8d594c', '#f6d8b0'], radius: .29, orbit: 2.17, period: 42, spin: 5, phase: 1.3, bands: true },
  { name: 'Saturno', image: 'saturno.jpg', focus: [25, 0], kind: 'Gigante gasoso', fact: 'Seus anéis são constituídos principalmente por fragmentos de gelo, com material rochoso e poeira.', colors: ['#dbbb83', '#a88758', '#f5deb1'], radius: .24, orbit: 2.76, period: 55, spin: 6, phase: 3.5, bands: true, rings: true },
  { name: 'Urano', image: 'urano.jpg', focus: [15, -30], kind: 'Gigante de gelo', fact: 'Seu eixo de rotação é tão inclinado que o planeta parece girar de lado.', colors: ['#8cd4d8', '#60afb8', '#c5eeee'], radius: .19, orbit: 3.39, period: 72, spin: -7, phase: 5.1, bands: true, tilt: 1.7 },
  { name: 'Netuno', image: 'netuno.jpg', focus: [-12, 25], kind: 'Gigante de gelo', fact: 'É o planeta mais distante do Sol e tem ventos que podem superar a velocidade do som na Terra.', colors: ['#547ad3', '#3e5ba4', '#9cb5f0'], radius: .18, orbit: 3.87, period: 95, spin: 7.5, phase: 2.8, bands: true }
];

export const sun = {
  name: 'Sol',
  image: 'sol.jpg',
  focus: [8, -10],
  kind: 'Estrela',
  fact: 'O Sol está no centro do Sistema Solar e concentra mais de 99% de sua massa. A fusão nuclear em seu núcleo libera a energia que chega à Terra como luz e calor.',
  colors: ['#ffae36', '#ed641f', '#fff2a6'],
  radius: .38
};

const moon = {
  name: 'Lua',
  image: 'lua.jpg',
  focus: [3, 0],
  kind: 'Satélite natural da Terra',
  fact: 'A Lua leva cerca de 27,3 dias para completar uma volta ao redor da Terra e uma rotação em torno do próprio eixo. Por isso, vemos quase sempre a mesma face da Lua.',
  colors: ['#aaa9a4', '#6f6f6b', '#dedbd0'],
  primary: 'Terra',
  radius: .065,
  orbit: .29,
  period: 5,
  spin: -5,
  phase: 1.2,
  tilt: 0
};

export const solarBodies = [sun, ...planets.flatMap(planet =>
  planet.name === moon.primary ? [planet, moon] : [planet]
)];