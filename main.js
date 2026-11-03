const language = {
  "satire": "Satire Points",
  "dim1": "Parodies",
  "dim1_desc": "Create a parody of an idle game to generate satire points.",
  "dim2": "Onions",
  "dim2_desc": "The Onion, the most reliable news source, allows you to create more parodies.",
  "dim3": "Farms",
  "dim3_desc": "Build a farm to grow more onions.",
  "dim4": "Revolutions",
  "dim4_desc": "Reinitiate the Neolithic Revolution to convert uninhabited places into more farmland.",
  "dim5": "Hurricanes",
  "dim5_desc": "Hurricanes rotate around themselves, thus generating more revolutions.",
  "dim6": "Butterflies",
  "dim6_desc": "Butterflies create the Butterfly Effect and thus allow more hurricanes to happen.",
  "dim7": "Swimmers",
  "dim7_desc": "Recruit a swimmer to perform more butterfly strokes.",
  "dim8": "Eighth Dimensions",
  "dim8_desc": "Mojang just released the eighth dimension in Minecraft, which consists completely of water. Here you will be able to find many swimmers and recruit them to your swimming team.",
  "dim9": "Ninth Dimensions",
  "dim9_desc": "Buy a ninth dimension to produce more eigh- wait, I thought those didn't exist...?",
};

const dimCosts = [1/3, 1, 10, 100, 1e4, 1e6, 1e9, 1e15, Infinity];
const dimCreep = [3, 4, 5, 6, 7, 8, 9, 10, 100];

const game = {
  satire: 0,
  dims: [1, 0, 0, 0, 0, 0, 0, 0, 0],
  dimUpgrades: [1, 0, 0, 0, 0, 0, 0, 0, 0]
};

const buyDim = d => {
  if (game.satire >= dimCosts[d] * Math.pow(dimCreep[d], game.dimUpgrades[d])) {
    game.satire -= dimCosts[d] * Math.pow(dimCreep[d], game.dimUpgrades[d]);
    game.dims[d]++;
    game.dimUpgrades[d]++;
    document.getElementById(`dim${d + 1}_buy`).innerHTML = `Buy ${language["dim" + (d + 1)]} (${dimCosts[d] * Math.pow(dimCreep[d], game.dimUpgrades[d])} ${language.satire})`;
    if (game.dimUpgrades[d] == 1 && d < 8) {
      document.getElementById(`dim${d + 2}`).hidden = false;
    }
  }
};

let time;
const update = () => {
  const now = Date.now();
  const dt = (now - time) / 1000;
  time = now;

  game.satire += game.dims[0] * game.dimUpgrades[0] * dt * 0.1;
  for (let i = 0; i < 7; i++) {
    game.dims[i] += game.dims[i + 1] * Math.pow(1.25, game.dimUpgrades[i + 1] - 1) * dt * 0.01;
  }

  document.getElementById("satirePoints").innerHTML = `You have ${game.satire.toFixed(2)} ${language.satire}.`;
  for (let i = 1; i <= 9; i++) {
    document.getElementById(`dim${i}_display`).innerHTML = `You have ${game.dims[i - 1].toFixed(2)} (${game.dimUpgrades[i - 1]}) ${language["dim" + i]}.`;
  }

  setTimeout(update, 100);
}

const save = () => {
  localStorage["satire"] = JSON.stringify(game);
};

const load = () => {
  if (localStorage["satire"]) {
    Object.assign(game, JSON.parse(localStorage["satire"]));
  }
};

const init = () => {
  load();
  for (let i = 1; i <= 9; i++) {
    document.getElementById(`dim${i}`).hidden = !(i == 1 || game.dimUpgrades[i - 2]);
    document.getElementById(`dim${i}_buy`).onclick = (() => buyDim(i - 1));
    document.getElementById(`dim${i}_buy`).innerHTML = `Buy ${language["dim" + i]} (${dimCosts[i - 1] * Math.pow(dimCreep[i - 1], game.dimUpgrades[i - 1])} ${language.satire})`;
    document.getElementById(`dim${i}_desc`).innerHTML = language[`dim${i}_desc`];
  }

  time = Date.now();
  update();
  setInterval(save, 30000);
};
init();