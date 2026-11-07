import { language, formatDecimal } from "./main.js";

const getPaperclipTax = x => {
  return Decimal.div(x, 1000).pow(1.2).floor();
};

export const buyShares = (game, qty) => {
  if (game.stockMarket.paperclips.gte(game.stockMarket.price.times(qty))) {
    game.stockMarket.paperclips = game.stockMarket.paperclips.minus(game.stockMarket.price.times(qty));
    game.stockMarket.shares = game.stockMarket.shares.plus(qty);
    document.getElementById("paperclips").innerHTML = `You have ${formatDecimal(game.stockMarket.paperclips)} ${language.paperclips}.`;
    document.getElementById("stonks").innerHTML = `You have ${formatDecimal(game.stockMarket.shares)} ${language.stonks}. The current price of ${language.stonk} is ${formatDecimal(game.stockMarket.price)}.`;
  }
};

export const sellShares = (game, qty) => {
  if (game.stockMarket.shares.gte(qty)) {
    game.stockMarket.paperclips = game.stockMarket.paperclips.plus(game.stockMarket.price.times(qty));
    game.stockMarket.shares = game.stockMarket.shares.minus(qty);
    document.getElementById("paperclips").innerHTML = `You have ${formatDecimal(game.stockMarket.paperclips)} ${language.paperclips}.`;
    document.getElementById("stonks").innerHTML = `You have ${formatDecimal(game.stockMarket.shares)} ${language.stonks}. The current price of ${language.stonk} is ${formatDecimal(game.stockMarket.price)}.`;
  }
};

export const stockMarketCycle = (game, hist) => {
  game.stockMarket.trend = 0.9 * game.stockMarket.trend + 0.1 * (Math.random() * 4 - 2);
  const modifier = game.stockMarket.trend + (Math.random() * 2 - 1);
  game.stockMarket.price = game.stockMarket.price.pow(0.96).times(Decimal.pow(10, modifier * 0.04));
  document.getElementById("stonks").innerHTML = `You have ${formatDecimal(game.stockMarket.shares)} ${language.stonks}. The current price of ${language.stonk} is ${formatDecimal(game.stockMarket.price)}.`;
  hist.push(game.stockMarket.price.toNumber());

  if (getPaperclipTax(game.stockMarket.paperclips).gt(0)) {
    document.getElementById("tax").innerHTML = `Due to your immense wealth, you are paying a tax of ${getPaperclipTax(game.stockMarket.paperclips)} ${language.paperclips} per cycle.`;
    document.getElementById("tax").hidden = false;
    game.stockMarket.paperclips = game.stockMarket.paperclips.minus(getPaperclipTax(game.stockMarket.paperclips));
    document.getElementById("paperclips").innerHTML = `You have ${formatDecimal(game.stockMarket.paperclips)} ${language.paperclips}.`;
  } else {
    document.getElementById("tax").hidden = true;
  }

  drawChart(hist.slice(-21));
};

export const drawChart = hist => {
  // document.getElementById("stockchart").replaceChildren(svg.node());
  const data = [];
  for (let i = 0; i < hist.length; i++) {
    data.push({x: i, y: hist[i]});
  }

  const plot = Plot.plot({
    margin: 20,
    marginLeft: 40,
    width: 480,
    height: 300,
    y: {grid: true, label: `Price (${language.stonks})`},
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(data, {x: "x", y: "y", stroke: "steelblue"})
    ]
  });
  document.getElementById("stockchart").replaceChildren(plot);
};