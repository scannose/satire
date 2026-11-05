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

const dimCosts = [1/3, 1, 10, 100, 1e4, 1e6, 1e10, 1e15, Decimal.pow(2, 1024)];
const dimCreep = [3, 4, 5, 6, 7, 8, 9, 10, Decimal.pow(2, 256)];

const game = {
  satire: new Decimal(0),
  dims: [new Decimal(1), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  dimUpgrades: [1, 0, 0, 0, 0, 0, 0, 0, 0],
  dim9prgs: new Decimal(1),
  bulk: false
};

const getDims = d => {
  return d == 7 ? game.dims[7].plus(Decimal.mul(Decimal.log2(game.dim9prgs), 10)) : game.dims[d];
};

const getDimMult = d => {
  return Decimal.pow(1.25, Math.max(game.dimUpgrades[d] - 1, 0)).times(d == 8 ? 0.001 : 0.1);
}

const getDimCost = d => {
  return Decimal.mul(dimCosts[d], Decimal.pow(Decimal.mul(dimCreep[d], d != 8 ? Math.max(game.dimUpgrades[d] / 500, 1) : 1), game.dimUpgrades[d]));
};

const formatDecimal = x => {
  let y = new Decimal(x);
  if (y.lt(1e3)) return x.toFixed(2);
  if (y.lt(1e6)) return `${y.dividedBy(1e3).toFixed(2)}k`;
  if (y.lt(1e9)) return `${y.dividedBy(1e6).toFixed(2)}m`;
  if (y.lt(1e12)) return `${y.dividedBy(1e9).toFixed(2)}b`;
  if (y.lt(1e15)) return `${y.dividedBy(1e12).toFixed(2)}t`;
  return x.toPrecision(3);
};

const buyDim = d => {
  if (game.satire.gte(getDimCost(d))) {
    game.satire = game.satire.minus(getDimCost(d));
    game.dims[d] = game.dims[d].add(1);
    game.dimUpgrades[d]++;
    document.getElementById(`dim${d + 1}_buy`).innerHTML = `Buy ${language["dim" + (d + 1)]} (${formatDecimal(getDimCost(d))} ${language.satire})`;
    if (game.dimUpgrades[d] == 1 && d < 8) {
      document.getElementById(`dim${d + 2}`).hidden = false;
    }
    return true;
  }
  return false;
};

const buyMaxDim = d => {
  while (buyDim(d));
};

let time;
const update = () => {
  const now = Date.now();
  const dt = (now - time) / 1000;
  time = now;

  game.satire = game.satire.plus(getDims(0).times(getDimMult(0)).times(dt));
  for (let d = 0; d < 7; d++) {
    game.dims[d] = game.dims[d].plus(getDims(d + 1).times(getDimMult(d + 1)).times(dt));
  }
  game.dim9prgs = game.dim9prgs.plus(getDims(8).times(getDimMult(8)).times(dt));

  document.getElementById("satirePoints").innerHTML = `You have ${formatDecimal(game.satire)} ${language.satire}.`;
  for (let d = 0; d <= 8; d++) {
    document.getElementById(`dim${d + 1}_display`).innerHTML = `You have ${formatDecimal(getDims(d))} (${game.dimUpgrades[d]}) ${language[`dim${d + 1}`]}.${d != 8 && game.dimUpgrades[d] >= 500 ? " (softcapped)" : ""}`;
  }

  setTimeout(update, 100);
};

const save = () => {
  localStorage["satire"] = JSON.stringify(game);
};

const load = () => {
  if (localStorage["satire"]) {
    Object.assign(game, JSON.parse(localStorage["satire"]));
    game.satire = new Decimal(game.satire);
    for (let d = 0; d <= 8; d++) {
      game.dims[d] = new Decimal(game.dims[d]);
    }
    game.dim9prgs = new Decimal(game.dim9prgs);
  }
};

const init = () => {
  load();
  for (let d = 0; d <= 8; d++) {
    document.getElementById(`dim${d + 1}`).hidden = d && !game.dimUpgrades[d - 1];
    document.getElementById(`dim${d + 1}_buy`).onclick = (() => {
      if (game.bulk) buyMaxDim(d);
      else buyDim(d);
    });
    document.getElementById(`dim${d + 1}_buy`).innerHTML = `Buy ${language[`dim${d + 1}`]} (${formatDecimal(getDimCost(d))} ${language.satire})`;
    document.getElementById(`dim${d + 1}_desc`).innerHTML = language[`dim${d + 1}_desc`];
  }
  document.getElementById("bulk").innerHTML = game.bulk ? "Buying Max" : "Buying 1";
  document.getElementById("bulk").onclick = () => {
    game.bulk = !game.bulk;
    document.getElementById("bulk").innerHTML = game.bulk ? "Buying Max" : "Buying 1";
  };

  time = Date.now();
  update();
  setInterval(save, 30000);
};
init();