// Quick test to diagnose why monopoly pricing isn't emerging

const PRICES = [3.00, 3.50, 4.00, 4.50, 5.00];
const BASE_PRICE = 3.00;
const BASE_DEMAND = 1000;

function getTotalDemand(avgPrice, alpha) {
  return BASE_DEMAND * Math.exp(-alpha * (avgPrice - BASE_PRICE));
}

function computeMarketShares(priceIndices, beta) {
  const expVals = priceIndices.map(idx => Math.exp(-beta * PRICES[idx]));
  const total = expVals.reduce((a, b) => a + b, 0);
  return expVals.map(e => e / total);
}

// What happens if everyone charges the same price?
console.log("=== Revenue when all shops charge same price ===");
const alpha = 0.2;
const beta = 1.5;
const numShops = 3;

for (let priceIdx = 0; priceIdx < PRICES.length; priceIdx++) {
  const choices = new Array(numShops).fill(priceIdx);
  const shares = computeMarketShares(choices, beta);
  const avgPrice = PRICES[priceIdx];
  const totalDemand = getTotalDemand(avgPrice, alpha);
  const revenuePerShop = PRICES[priceIdx] * shares[0] * totalDemand;
  console.log(`Price $${PRICES[priceIdx].toFixed(2)}: revenue = $${revenuePerShop.toFixed(2)}`);
}

// What happens if one shop undercuts?
console.log("\n=== If 2 shops charge $5, one undercuts to $X ===");
for (let undercut = 0; undercut < PRICES.length; undercut++) {
  const choices = [4, 4, undercut]; // Two at $5, one undercutting
  const shares = computeMarketShares(choices, beta);
  const avgPrice = choices.reduce((s, i) => s + PRICES[i], 0) / choices.length;
  const totalDemand = getTotalDemand(avgPrice, alpha);

  const highPriceRevenue = PRICES[4] * shares[0] * totalDemand;
  const undercutRevenue = PRICES[undercut] * shares[2] * totalDemand;

  console.log(`Undercut to $${PRICES[undercut].toFixed(2)}: undercutter gets $${undercutRevenue.toFixed(2)}, high-price shops get $${highPriceRevenue.toFixed(2)}`);
}

// The problem: with min-max normalization, if everyone earns similar amounts,
// they all get ~0.5 reward. Let's see the spread:
console.log("\n=== Reward spread when all charge same price ===");
for (let priceIdx = 0; priceIdx < PRICES.length; priceIdx++) {
  const choices = new Array(numShops).fill(priceIdx);
  const shares = computeMarketShares(choices, beta);
  const avgPrice = PRICES[priceIdx];
  const totalDemand = getTotalDemand(avgPrice, alpha);
  const revenues = choices.map((idx, i) => PRICES[idx] * shares[i] * totalDemand);
  const minR = Math.min(...revenues);
  const maxR = Math.max(...revenues);
  console.log(`All at $${PRICES[priceIdx].toFixed(2)}: revenues = [${revenues.map(r => r.toFixed(2)).join(', ')}], range = ${(maxR-minR).toFixed(2)}`);
}

console.log("\n=== Key insight ===");
console.log("When all shops charge the same, they get identical revenues.");
console.log("Min-max normalization gives range=0, so normalizedReward=0.5 for everyone.");
console.log("This means shops don't learn that higher uniform prices are better!");
console.log("");
console.log("The update only affects the CHOSEN action. If everyone chose $3 and got");
console.log("normalized reward 0.5, the weight for $3 increases slightly.");
console.log("They never learn that $5 would have been better if everyone chose it.");
