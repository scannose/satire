import { buyShares, sellShares, stockMarketCycle, drawChart } from "./paperclips.js";

export const language = {
  "satire": "Satire Points",
  "dim1": "Parodies",
  "dim1_desc": "Create a parody of an idle game to generate satire points. Each purchase after the first also increases production by 25%.",
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
  "dimboost": "Dimension Boost",
  "dimboosts": "Dimension Boosts",
  "dbupg1_desc": "All satire dimensions are 2x stronger",
  "dbupg2_desc": "Revolt against softcapitalism! Softcap effect is divided by 1.15",
  "dbupg3_desc": "Increase the multiplier per purchase by 0.005",
  "dbupg4_desc": "gain a useless paperclip (does not reset)",
  "infinity_desc": "Reset all satire dimensions and upgrades and gain a bonus based on your Ninth Dimensions.",
  "infinity_reset": "Reset",
  "infinityPoints": "placeholders",
  "paperclips": "Useless Paperclips",
  "paperclips_desc": "Once a relic found only in one planet, paperclips now make up a third of the universe's matter. Despite being worth less than a speck of dust, they are nevertheless used as intergalactic currency.",
  "stonk": "Whitecoin",
  "stonks": "Whitecoins",
  "buy1": "Buy 1",
  "buy10": "Buy 10",
  "buy100": "Buy 100",
  "sell1": "Sell 1",
  "sell10": "Sell 10",
  "sell100": "Sell 100",
  "tab1": "Satire",
  "tab2": "Satire Upgrades",
  "tab3": "Stock Market",
  "options": "Options",
  "save": "Save Game",
  "export": "Export Save",
  "import": "Import Save"
};

const dimCosts = [1/3, 1, 10, 100, 1e4, 1e6, 1e9, 1e15, Decimal.pow(2, 1024)];
const dimCreep = [3, 4, 5, 6, 7, 8, 9, 10, Decimal.pow(2, 64)];

const game = {
  satire: new Decimal(0),
  dims: [new Decimal(1), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  dimUpgrades: [1, 0, 0, 0, 0, 0, 0, 0, 0],
  dbUpgrades: [0, 0, 0, 0],
  dim9prgs: new Decimal(1),
  dimboostsSpent: 0,
  infinityPoints: new Decimal(0),
  stockMarket: {
    paperclips: new Decimal(0),
    price: new Decimal(1),
    shares: new Decimal(0),
    trend: 0
  },
  unlocks: {
    tab2: false,
    tab3: false,
    infinity: false
  },
  bulk: false
};

const stockMarketHist = [];

const getDims = d => {
  return d == 7 ? game.dims[7].plus(Decimal.mul(Decimal.log2(game.dim9prgs), 10)) : game.dims[d];
};

const getDimMult = d => {
  return Decimal.pow(1.25 + game.dbUpgrades[2] * 0.005, Math.max(game.dimUpgrades[d] - 1, 0))
  .times(Decimal.pow(2, game.dbUpgrades[0]))
  .times(Decimal.sqrt(game.infinityPoints.plus(1)))
  .times(d == 8 ? 0.001 : 0.1);
};

const getDimCost = d => {
  return Decimal.mul(dimCosts[d], Decimal.pow(dimCreep[d], game.dimUpgrades[d] * (d != 8 ? Decimal.max(Decimal.div((game.dimUpgrades[d] - 400) / 800, Decimal.pow(1.15, game.dbUpgrades[1])), 0).plus(1) : 1)));
};

const getDimboosts = () => {
  return getDims(7).div(50).floor().minus(game.dimboostsSpent);
};

const getDbUpgradeCost = i => {
  if (i == 0) return 1;
  return (game.dbUpgrades[i] + 1) * (i == 3 ? 2 : 1) + (i == 3 ? 8 : 0);
};

const getDbUpgradeEffect = i => {
  if (game.dbUpgrades[i] == 0) return "";
  else if (i == 0) return ` (Effect: x${formatDecimal(Decimal.pow(2, game.dbUpgrades[0]))})`;
  else if (i == 1) return ` (Effect: /${formatDecimal(Decimal.pow(1.15, game.dbUpgrades[1]))})`;
  else if (i == 2) return ` (Effect: +${game.dbUpgrades[2] * 0.005})`;
  else return "";
};

export const formatDecimal = x => {
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

const buyDbUpgrade = i => {
  if (getDimboosts().gte(getDbUpgradeCost(i))) {
    game.dimboostsSpent += getDbUpgradeCost(i);
    game.dbUpgrades[i]++;
    document.getElementById(`dbupg${i + 1}_desc`).innerHTML = language[`dbupg${i + 1}_desc`] + getDbUpgradeEffect(i);
    document.getElementById(`dbupg${i + 1}_buy`).innerHTML = `Buy Upgrade (${getDbUpgradeCost(i)} ${getDbUpgradeCost(i) != 1 ? language.dimboosts : language.dimboost})`;
    if (i == 1) {
      for (let d = 0; d <= 8; d++) {
        document.getElementById(`dim${d + 1}_buy`).innerHTML = `Buy ${language["dim" + (d + 1)]} (${formatDecimal(getDimCost(d))} ${language.satire})`;
      }
    } else if (i == 3) {
      game.stockMarket.paperclips = game.stockMarket.paperclips.plus(1);
    }
  }
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
    document.getElementById(`dim${d + 1}_display`).innerHTML = `You have ${formatDecimal(getDims(d))} (${game.dimUpgrades[d]}) ${language[`dim${d + 1}`]}.${d != 8 && game.dimUpgrades[d] >= 400 ? " (softcapped)" : ""}`;
  }

  document.getElementById("dimboosts").innerHTML = `You have ${getDimboosts()} ${getDimboosts() != 1 ? language.dimboosts : language.dimboost}. You gain your next ${language.dimboost} at ${getDims(7).div(50).floor().plus(1).times(50)} ${language.dim8}.`;

  if (!game.unlocks.tab2 && game.dimUpgrades[7] >= 50) {
    game.unlocks.tab2 = true;
    document.getElementById("tab2").hidden = false;
  }
  if (!game.unlocks.tab3 && game.stockMarket.paperclips.gt(0)) {
    game.unlocks.tab3 = true;
    document.getElementById("tab3").hidden = false;
  }
  if (!game.unlocks.infinity && game.dimUpgrades[8]) {
    game.unlocks.infinity = true;
    document.getElementById("infinity").hidden = false;
  }

  setTimeout(update, 100);
};

const save = () => {
  localStorage["satire"] = JSON.stringify(game);
};

const parseSave = save => {
  Object.assign(game, JSON.parse(save));
  game.satire = new Decimal(game.satire);
  for (let d = 0; d <= 8; d++) {
    game.dims[d] = new Decimal(game.dims[d]);
  }
  game.dim9prgs = new Decimal(game.dim9prgs);
  game.infinityPoints = new Decimal(game.infinityPoints);
  game.stockMarket.paperclips = new Decimal(game.stockMarket.paperclips);
  game.stockMarket.price = new Decimal(game.stockMarket.price);
  game.stockMarket.shares = new Decimal(game.stockMarket.shares);
};

const load = () => {
  if (localStorage["satire"]) {
    parseSave(localStorage["satire"]);
  }
};

const initUI = () => {
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

  for (let i = 0; i <= 3; i++) {
    document.getElementById(`dbupg${i + 1}_desc`).innerHTML = language[`dbupg${i + 1}_desc`] + getDbUpgradeEffect(i);
    document.getElementById(`dbupg${i + 1}_buy`).innerHTML = `Buy Upgrade (${getDbUpgradeCost(i)} ${getDbUpgradeCost(i) != 1 ? language.dimboosts : language.dimboost})`;
    document.getElementById(`dbupg${i + 1}_buy`).onclick = (() => buyDbUpgrade(i));
  }
  document.getElementById("infinity").hidden = !game.unlocks.infinity;
  document.getElementById("infinity_display").innerHTML = `You have ${game.infinityPoints} ${language.infinityPoints}, which grant a ${formatDecimal(Decimal.sqrt(game.infinityPoints.plus(1)))}x boost to all dimensions. This effect is likely to be reworked in the future.`;
  document.getElementById("infinity_display").hidden = !game.infinityPoints.gt(0);
  document.getElementById("infinity_desc").innerHTML = language.infinity_desc;
  document.getElementById("infinity_reset").innerHTML = `${language.infinity_reset} (+${game.dimUpgrades[8]} ${language.infinityPoints})`;
  document.getElementById("infinity_reset").onclick = () => {
    game.infinityPoints = game.infinityPoints.plus(game.dimUpgrades[8]);
    game.satire = new Decimal(0);
    game.dims = [new Decimal(1), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)];
    game.dimUpgrades = [1, 0, 0, 0, 0, 0, 0, 0, 0];
    game.dbUpgrades = [0, 0, 0, game.dbUpgrades[0]];
    game.dim9prgs = new Decimal(1);
    game.dimboostsSpent = 0;
    initUI();
  };

  document.getElementById("paperclips").innerHTML = `You have ${formatDecimal(game.stockMarket.paperclips)} ${language.paperclips}.`;
  document.getElementById("paperclips_desc").innerHTML = language.paperclips_desc;
  document.getElementById("stonks").innerHTML = `You have ${formatDecimal(game.stockMarket.shares)} ${language.stonks}. The current price of ${language.stonk} is ${formatDecimal(game.stockMarket.price)}.`;
  document.getElementById("stonk_buy1").innerHTML = language.buy1;
  document.getElementById("stonk_buy1").onclick = (() => buyShares(game, 1));
  document.getElementById("stonk_buy10").innerHTML = language.buy10;
  document.getElementById("stonk_buy10").onclick = (() => buyShares(game, 10));
  document.getElementById("stonk_buy100").innerHTML = language.buy100;
  document.getElementById("stonk_buy100").onclick = (() => buyShares(game, 100));
  document.getElementById("stonk_sell1").innerHTML = language.sell1;
  document.getElementById("stonk_sell1").onclick = (() => sellShares(game, 1));
  document.getElementById("stonk_sell10").innerHTML = language.sell10;
  document.getElementById("stonk_sell10").onclick = (() => sellShares(game, 10));
  document.getElementById("stonk_sell100").innerHTML = language.sell100;
  document.getElementById("stonk_sell100").onclick = (() => sellShares(game, 100));

  document.getElementById("save").innerHTML = language.save;
  document.getElementById("save").onclick = save;
  document.getElementById("export").innerHTML = language.export;
  document.getElementById("export").onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(game));
  };
  document.getElementById("import").innerHTML = language.import;
  document.getElementById("import").onclick = () => {
    parseSave(prompt("import save"));
  };

  document.getElementById("tab1").innerHTML = language.tab1;
  document.getElementById("tab1").onclick = () => {
    document.getElementById("main").childNodes.forEach(e => e.hidden = true);
    document.getElementById("dimensions").hidden = false;
  };
  document.getElementById("tab2").innerHTML = language.tab2;
  document.getElementById("tab2").hidden = !game.unlocks.tab2;
  document.getElementById("tab2").onclick = () => {
    document.getElementById("main").childNodes.forEach(e => e.hidden = true);
    document.getElementById("dimupgrades").hidden = false;
  };
  document.getElementById("tab3").innerHTML = language.tab3;
  document.getElementById("tab3").hidden = !game.unlocks.tab3;
  document.getElementById("tab3").onclick = () => {
    document.getElementById("main").childNodes.forEach(e => e.hidden = true);
    document.getElementById("stockmarket").hidden = false;
  };
  document.getElementById("tabOptions").innerHTML = language.options;
  document.getElementById("tabOptions").onclick = () => {
    document.getElementById("main").childNodes.forEach(e => e.hidden = true);
    document.getElementById("options").hidden = false;
  };
};

const init = () => {
  load();
  initUI();

  addEventListener("keydown", e => {
    if (!document.getElementById("dimensions").hidden && e.code.match(/Digit[1-9]/g)) {
      document.getElementById(`dim${e.code[5]}_buy`).click();
    }
    if (!document.getElementById("dimupgrades").hidden && e.code.match(/Digit[1-4]/g)) {
      buyDbUpgrade(e.code[5] - 1);
    }
  });

  stockMarketHist.push(game.stockMarket.price.toNumber());
  drawChart(stockMarketHist);

  time = Date.now();
  setTimeout(update, 100);
  setInterval(stockMarketCycle, 10000, game, stockMarketHist);
  setInterval(save, 10000);
};
init();