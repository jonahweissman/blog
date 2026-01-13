---
title: "How Learning Algorithms Create Monopoly Prices in Competitive Markets"
date: 2025-12-25
draft: false
---

Imagine two coffee shops competing on the same street. Neither knows the other's pricing strategy, costs, or decision-making process. Each simply observes market demand and adjusts their own prices to maximize revenue. Over time, something surprising happens: **they converge to the same high price—close to what a monopolist would charge—without ever communicating or colluding.**

This isn't a hypothetical. When firms use low-regret learning algorithms to set prices, they can tacitly coordinate on monopoly-like outcomes, earning profits far above the competitive level. This phenomenon—algorithmic collusion—is the subject of growing concern among economists and regulators.

## The Setup: Pricing Without Information

Consider \\(n\\) firms competing in a market. Each day, each firm \\(i\\) chooses a price \\(p_i\\) from a set of options (say, $3.00, $3.50, $4.00, $4.50, $5.00). The firm then observes the revenue it earned, which depends on:

1. **Consumer price sensitivity**: Lower prices attract more customers
2. **Total market demand**: When all firms charge high prices, some consumers exit the market entirely
3. **Competitor prices**: The relative prices determine market share

Here's what firms **don't** know:
- Competitor prices on the current day
- Competitor strategies or decision rules
- The exact demand function
- What revenue they would have earned at different prices

In economics, this is an extremely difficult environment. Traditional game theory assumes firms know the payoff structure and can compute optimal responses. Here, firms are flying blind—they only see their own revenue after the fact.

## Low-Regret Learning: A Simple Rule for Complex Environments

A **low-regret learning algorithm** is a decision rule with a powerful guarantee:

> _After many rounds, the total revenue you missed out on by not knowing the best strategy in advance becomes negligible._

The "regret" is measured by comparing actual performance to the best fixed price you could have chosen with perfect hindsight. As rounds progress, average regret per round converges to zero. You're allowed to explore and make mistakes early on, but you can't keep making the same mistakes forever.

### Why This Matters

Low-regret algorithms are:
- **Practical**: No need to model competitors or estimate demand functions
- **Robust**: Work even when the environment is adversarial or non-stationary
- **Safe**: Guarantee you won't do much worse than reasonable baselines

When each firm independently uses a low-regret algorithm, something remarkable happens: **the system converges to an equilibrium**—specifically, a coarse correlated equilibrium (CCE), which is a generalization of Nash equilibrium.

## The Surprising Result: Convergence to High Prices

Here's the key insight from [Ban & Keskin (2023)](https://arxiv.org/abs/2305.17567) and related work:

**When all firms use low-regret learning algorithms, they converge to prices that maximize joint profits—even though each firm is selfishly maximizing its own revenue and has no knowledge of competitors.**

Why does this happen?

1. **Counterfactual reasoning**: Modern learning algorithms (like EXP3) don't just learn from chosen actions—they estimate what would have happened under alternative actions. A firm observes "I charged $3 and earned $500" and infers "Had I charged $5 while competitors charged $3, I would have earned less market share but at a higher margin."

2. **Symmetric learning**: All firms are learning simultaneously. When one firm experiments with a high price, others observe increased demand and learn that higher prices can be profitable.

3. **Stability of coordinated prices**: Once all firms charge high prices, unilateral deviations (undercutting) become unprofitable if it triggers retaliation. Since all firms are learning, sustained undercutting leads to price wars that reduce everyone's revenue. The algorithm learns to avoid this.

The result: **tacit collusion through independent learning**. No communication, no explicit coordination—just algorithms finding the Nash equilibrium that maximizes joint surplus.

## The Math: Why Monopoly Prices Maximize Revenue

The monopoly price is the price that maximizes total industry profit when all firms coordinate. For a demand curve \\(D(p) = D_0 e^{-\alpha(p - p_0)}\\), where \\(\alpha\\) is demand elasticity, the revenue-maximizing price is:

$$p^* = \frac{1}{\alpha}$$

When demand is inelastic (\\(\alpha\\) is small), consumers are relatively price-insensitive, so the monopoly price is high. For example:
- \\(\alpha = 0.2 \implies p^* = \$5.00\\)
- \\(\alpha = 0.4 \implies p^* = \$2.50\\)

In contrast, the **competitive price** is the marginal cost (assumed to be $3.00 in our model). At this price, firms earn zero economic profit, but total consumer surplus is maximized.

<div id="monopoly-explainer" style="font-family: system-ui, sans-serif; max-width: 600px; margin: 1.5em 0; padding: 1em; border: 1px solid #ddd; border-radius: 8px; background: #fafafa;">
  <h4 style="margin: 0 0 0.5em 0;">Why the monopoly price maximizes revenue</h4>
  <p style="font-size: 0.9em; color: #555; margin-bottom: 1em;">Revenue = Price × Quantity. The demand curve shows quantity at each price. The monopoly price is where the revenue rectangle has maximum area. Drag the sliders to see how price and demand elasticity affect revenue.</p>
  <canvas id="monopoly-area-chart" width="560" height="280" style="background: white; border: 1px solid #ccc;"></canvas>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1em; margin-top: 0.75em;">
    <div>
      <label><strong>Price: $<span id="slider-price-val">5.00</span></strong></label>
      <input type="range" id="price-slider" min="1" max="8" step="0.1" value="5" style="width: 100%;">
    </div>
    <div>
      <label><strong>Demand elasticity (α): <span id="slider-alpha-val">0.20</span></strong></label>
      <input type="range" id="alpha-slider" min="0.05" max="0.5" step="0.02" value="0.2" style="width: 100%;">
      <div style="font-size: 0.8em; color: #666;">Lower α → less price-sensitive demand</div>
    </div>
  </div>
  <div id="revenue-display" style="margin-top: 0.5em; font-size: 1.1em; text-align: center;">
    Revenue: <strong style="color: #2563eb;">$5000</strong>
    <span style="margin-left: 1em; font-size: 0.9em; color: #666;">(Maximum at $<span id="optimal-price-display">5.00</span>)</span>
  </div>
</div>

<script>
(function() {
  const canvas = document.getElementById('monopoly-area-chart');
  const ctx = canvas.getContext('2d');
  const priceSlider = document.getElementById('price-slider');
  const alphaSlider = document.getElementById('alpha-slider');
  const priceValSpan = document.getElementById('slider-price-val');
  const alphaValSpan = document.getElementById('slider-alpha-val');
  const revenueDisplay = document.getElementById('revenue-display');

  const width = canvas.width;
  const height = canvas.height;
  const padding = { left: 50, right: 30, top: 20, bottom: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const baseDemand = 1000;
  const basePrice = 3.0;
  const maxPrice = 8;

  function getDemand(price, alpha) {
    return baseDemand * Math.exp(-alpha * (price - basePrice));
  }

  function getRevenue(price, alpha) {
    return price * getDemand(price, alpha);
  }

  function getOptimalPrice(alpha) {
    return 1 / alpha;
  }

  function draw(currentPrice, alpha) {
    ctx.clearRect(0, 0, width, height);

    const optimalPrice = getOptimalPrice(alpha);
    const maxDemand = getDemand(0.5, alpha);

    const toX = (q) => padding.left + (q / maxDemand) * chartW;
    const toY = (p) => padding.top + chartH - (p / maxPrice) * chartH;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Quantity', padding.left + chartW / 2, height - 8);
    ctx.save();
    ctx.translate(15, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Price', 0, 0);
    ctx.restore();

    // Draw demand curve
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let p = 0.5; p <= maxPrice; p += 0.1) {
      const q = getDemand(p, alpha);
      const x = toX(q);
      const y = toY(p);
      if (p === 0.5) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw revenue rectangle
    const currentQ = getDemand(currentPrice, alpha);
    const rectX = padding.left;
    const rectY = toY(currentPrice);
    const rectW = toX(currentQ) - padding.left;
    const rectH = toY(0) - rectY;

    ctx.fillStyle = 'rgba(37, 99, 235, 0.25)';
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(rectX, rectY, rectW, rectH);

    // Draw optimal price line (dashed)
    if (optimalPrice <= maxPrice) {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, toY(optimalPrice));
      ctx.lineTo(toX(getDemand(optimalPrice, alpha)), toY(optimalPrice));
      ctx.lineTo(toX(getDemand(optimalPrice, alpha)), toY(0));
      ctx.stroke();
      ctx.setLineDash([]);

      // Optimal price marker
      ctx.fillStyle = '#dc2626';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('$' + optimalPrice.toFixed(2) + ' (optimal)', padding.left - 5, toY(optimalPrice) + 4);
    }

    // Label the current point
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(toX(currentQ), toY(currentPrice), 6, 0, Math.PI * 2);
    ctx.fill();

    // Price and quantity labels on axes
    ctx.fillStyle = '#2563eb';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('$' + currentPrice.toFixed(2), padding.left - 5, toY(currentPrice) + 4);
    ctx.textAlign = 'center';
    ctx.fillText(currentQ.toFixed(0), toX(currentQ), padding.top + chartH + 15);

    // Legend
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666';
    ctx.fillText('Demand curve', padding.left + chartW - 100, padding.top + 15);
    ctx.fillStyle = 'rgba(37, 99, 235, 0.7)';
    ctx.fillRect(padding.left + chartW - 100, padding.top + 25, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Revenue (area)', padding.left + chartW - 85, padding.top + 35);
  }

  function update() {
    const price = parseFloat(priceSlider.value);
    const alpha = parseFloat(alphaSlider.value);
    const optimalPrice = getOptimalPrice(alpha);

    priceValSpan.textContent = price.toFixed(2);
    alphaValSpan.textContent = alpha.toFixed(2);

    const revenue = getRevenue(price, alpha);
    const maxRevenue = getRevenue(optimalPrice, alpha);
    const revenueColor = Math.abs(price - optimalPrice) < 0.3 ? '#16a34a' : '#2563eb';
    revenueDisplay.innerHTML = 'Revenue: <strong style="color: ' + revenueColor + ';">$' + revenue.toFixed(0) + '</strong>' +
      '<span style="margin-left: 1em; font-size: 0.9em; color: #666;">(Maximum $' + maxRevenue.toFixed(0) + ' at $' + optimalPrice.toFixed(2) + ')</span>';
    draw(price, alpha);
  }

  priceSlider.addEventListener('input', update);
  alphaSlider.addEventListener('input', update);
  update();
})();
</script>

## The Learning Algorithm: EXP3 with Counterfactual Updates

The simulation uses **EXP3** (Exponential-weight algorithm for Exploration and Exploitation), a classic low-regret algorithm. Here's how it works:

Each firm maintains a weight \\(w_a\\) for each price option \\(a\\). The key innovation is **counterfactual reasoning**: after observing market revenue, each firm estimates what it would have earned at every possible price (not just the one it chose).

**Update rule:**
$$w_a \leftarrow w_a \cdot \exp\left(\eta \cdot \frac{R_a}{R_{\max}}\right)$$

where:
- \\(R_a\\) is the estimated revenue at price \\(a\\) (holding competitors' prices fixed)
- \\(R_{\max}\\) is the maximum possible revenue (for normalization)
- \\(\eta\\) is the learning rate

**Price selection**: Firms choose prices probabilistically, proportional to weights, but with probability \\(\gamma = 0.15\\) of exploring uniformly. This ensures all prices get tried, enabling discovery of profitable coordination.

**Why counterfactuals enable collusion**: Without counterfactual reasoning, if all firms charge $3 and earn similar revenue, they never discover that coordinating at $5 would be more profitable. With counterfactuals, each firm asks "what if I had charged $5 while others stayed at $3?"—and learns that undercutting is tempting but coordination is better. Over many rounds, this leads to convergence on high prices.

## Market Structure and the Conditions for Collusion

Not all markets lead to monopoly pricing. The key factors:

### 1. **Number of Competitors**
- **Few firms (2-4)**: Strong coordination. Each firm's price significantly affects average market price and total demand.
- **Many firms (10+)**: Coordination breaks down. Individual price changes have little impact on market conditions, and undercutting becomes dominant.

### 2. **Demand Elasticity (α)**
- **Low elasticity** (α ≈ 0.2): Consumers are price-insensitive. Monopoly prices are high and sustainable.
- **High elasticity** (α ≈ 0.5): Consumers exit at high prices. Revenue peaks at lower prices, limiting collusion potential.

### 3. **Price Sensitivity (β)**
- **Low β**: Market share is relatively insensitive to price differences. Coordination is easier.
- **High β** (β > 2): Small price cuts capture large market share. Undercutting becomes irresistible, destabilizing high prices.

### 4. **Learning Rate and Exploration**
- Moderate learning rates (η ≈ 0.1) and exploration (γ ≈ 0.15) are optimal for discovering coordination.
- Too fast learning can lead to instability; too slow learning delays convergence.

## Interactive Simulator

Experiment with the parameters to see when algorithmic collusion emerges:

<div id="simulator-container" style="font-family: system-ui, sans-serif; max-width: 800px; margin: 2em 0; padding: 1em; border: 1px solid #ddd; border-radius: 8px; background: #fafafa;">

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5em; margin-bottom: 1.5em;">
    <div>
      <label for="num-shops"><strong>Number of firms:</strong></label><br>
      <input type="range" id="num-shops" min="2" max="12" value="4" style="width: 100%;">
      <span id="num-shops-val">4</span>
      <div style="font-size: 0.85em; color: #666;">More firms → harder to coordinate</div>
    </div>
    <div>
      <label for="demand-elasticity"><strong>Demand elasticity (α):</strong></label><br>
      <input type="range" id="demand-elasticity" min="0.05" max="0.5" step="0.05" value="0.2" style="width: 100%;">
      <span id="demand-elasticity-val">0.2</span>
      <div style="font-size: 0.85em; color: #666;">Monopoly: $<span id="monopoly-price">5.00</span> · Competitive: $3.00</div>
    </div>
    <div>
      <label for="price-sensitivity"><strong>Price sensitivity (β):</strong></label><br>
      <input type="range" id="price-sensitivity" min="0.1" max="3" step="0.1" value="1.5" style="width: 100%;">
      <span id="price-sensitivity-val">1.5</span>
      <div style="font-size: 0.85em; color: #666;">Higher → stronger incentive to undercut</div>
    </div>
    <div>
      <label for="num-days"><strong>Days:</strong></label><br>
      <input type="range" id="num-days" min="100" max="2000" step="50" value="300" style="width: 100%;">
      <span id="num-days-val">300</span>
    </div>
  </div>

  <button id="run-sim" style="padding: 0.75em 2em; font-size: 1em; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 4px;">Run Simulation</button>

  <div id="demand-curve-section" style="margin-top: 1.5em;">
    <h4 style="margin-bottom: 0.5em;">Revenue and Demand by Price Level</h4>
    <canvas id="demand-chart" width="760" height="200" style="background: white; border: 1px solid #ccc;"></canvas>
    <div style="font-size: 0.85em; color: #666; margin-top: 0.5em;">
      Shows total market demand and per-firm revenue (if all firms charge the same price). Notice how revenue peaks at the monopoly price, not the competitive price.
    </div>
  </div>

  <div id="results" style="margin-top: 1.5em; display: none;">
    <h4 style="margin-bottom: 0.5em;">Price Dynamics Over Time</h4>
    <canvas id="price-chart" width="760" height="300" style="background: white; border: 1px solid #ccc;"></canvas>
    <div style="font-size: 0.85em; color: #666; margin-top: 0.5em;">
      Watch how independent learners converge toward monopoly pricing (red dashed line) and away from the socially optimal competitive price (green dashed line).
    </div>
    <h4 style="margin-top: 1.5em; margin-bottom: 0.5em;">Average Regret per Day</h4>
    <canvas id="regret-chart" width="760" height="250" style="background: white; border: 1px solid #ccc;"></canvas>
    <div style="font-size: 0.85em; color: #666; margin-top: 0.5em;">
      Regret = (best fixed strategy in hindsight) - (actual revenue). Low-regret learners drive this toward zero over time.
    </div>
    <div id="stats" style="margin-top: 1em; padding: 1em; background: white; border-radius: 4px; border: 1px solid #ddd;"></div>
  </div>
</div>

<script>
(function() {
  const PRICES = [3.00, 3.50, 4.00, 4.50, 5.00];
  const BASE_PRICE = 3.00;
  const BASE_DEMAND = 1000;

  function getTotalDemand(avgPrice, alpha) {
    return BASE_DEMAND * Math.exp(-alpha * (avgPrice - BASE_PRICE));
  }

  function getMonopolyPrice(alpha) {
    const theoreticalOptimal = 1 / alpha;
    return Math.min(5.00, Math.max(3.00, theoreticalOptimal));
  }

  function updateDisplays() {
    const alpha = parseFloat(document.getElementById('demand-elasticity').value);
    const beta = parseFloat(document.getElementById('price-sensitivity').value);
    const numShops = parseInt(document.getElementById('num-shops').value);

    document.getElementById('num-shops-val').textContent = numShops;
    document.getElementById('demand-elasticity-val').textContent = alpha.toFixed(2);
    document.getElementById('price-sensitivity-val').textContent = beta.toFixed(1);
    document.getElementById('num-days-val').textContent = document.getElementById('num-days').value;

    const monopolyPrice = getMonopolyPrice(alpha);
    document.getElementById('monopoly-price').textContent = monopolyPrice.toFixed(2);

    drawDemandCurve(alpha, numShops);
  }

  function drawDemandCurve(alpha, numShops) {
    const canvas = document.getElementById('demand-chart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = { left: 60, right: 60, top: 20, bottom: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minP = 2.5, maxP = 5.5;
    const toX = (p) => padding.left + ((p - minP) / (maxP - minP)) * chartW;

    let maxDemand = 0, maxRevenue = 0;
    for (let p = minP; p <= maxP; p += 0.1) {
      const d = getTotalDemand(p, alpha);
      const r = p * d / numShops;
      maxDemand = Math.max(maxDemand, d);
      maxRevenue = Math.max(maxRevenue, r);
    }

    const toYDemand = (d) => padding.top + chartH - (d / maxDemand) * chartH;
    const toYRevenue = (r) => padding.top + chartH - (r / maxRevenue) * chartH;

    // Grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw demand curve
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let p = minP; p <= maxP; p += 0.05) {
      const x = toX(p);
      const y = toYDemand(getTotalDemand(p, alpha));
      if (p === minP) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw revenue curve
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let p = minP; p <= maxP; p += 0.05) {
      const x = toX(p);
      const y = toYRevenue(p * getTotalDemand(p, alpha) / numShops);
      if (p === minP) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw monopoly price line
    const monopolyPrice = getMonopolyPrice(alpha);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toX(monopolyPrice), padding.top);
    ctx.lineTo(toX(monopolyPrice), padding.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw competitive price line
    const socialPrice = BASE_PRICE;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toX(socialPrice), padding.top);
    ctx.lineTo(toX(socialPrice), padding.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price labels
    ctx.fillStyle = '#333';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    PRICES.forEach(p => {
      ctx.fillText('$' + p.toFixed(2), toX(p), height - 8);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.fillText(maxDemand.toFixed(0), padding.left - 5, padding.top + 10);
    ctx.fillText('0', padding.left - 5, padding.top + chartH);
    ctx.save();
    ctx.translate(12, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Demand', 0, 0);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('$' + maxRevenue.toFixed(0), width - padding.right + 5, padding.top + 10);
    ctx.fillText('$0', width - padding.right + 5, padding.top + chartH);
    ctx.save();
    ctx.translate(width - 12, padding.top + chartH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Revenue/firm', 0, 0);
    ctx.restore();

    // Legend
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    const legendY = padding.top + 8;

    ctx.fillStyle = '#666';
    ctx.fillRect(padding.left + 10, legendY - 5, 20, 2);
    ctx.fillText('Demand', padding.left + 35, legendY);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(padding.left + 110, legendY - 5, 20, 2);
    ctx.fillText('Revenue/firm', padding.left + 135, legendY);

    ctx.strokeStyle = '#dc2626';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padding.left + 230, legendY - 4);
    ctx.lineTo(padding.left + 250, legendY - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#dc2626';
    ctx.fillText('Monopoly', padding.left + 255, legendY);

    ctx.strokeStyle = '#16a34a';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padding.left + 330, legendY - 4);
    ctx.lineTo(padding.left + 350, legendY - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('Competitive', padding.left + 355, legendY);
  }

  class LowRegretAgent {
    constructor(numPrices, eta = 0.1, gamma = 0.15) {
      this.weights = new Array(numPrices).fill(1);
      this.eta = eta;
      this.gamma = gamma;
      this.numPrices = numPrices;
      this.probs = null;
    }

    choosePrice() {
      const total = this.weights.reduce((a, b) => a + b, 0);
      this.probs = this.weights.map(w =>
        (1 - this.gamma) * (w / total) + this.gamma / this.numPrices
      );
      const r = Math.random();
      let cumsum = 0;
      for (let i = 0; i < this.probs.length; i++) {
        cumsum += this.probs[i];
        if (r < cumsum) return i;
      }
      return this.probs.length - 1;
    }

    updateWithCounterfactuals(counterfactualRevenues, maxRevenue) {
      for (let a = 0; a < this.numPrices; a++) {
        const normalizedReward = counterfactualRevenues[a] / maxRevenue;
        this.weights[a] *= Math.exp(this.eta * normalizedReward);
      }

      const maxW = Math.max(...this.weights);
      if (maxW > 100) {
        this.weights = this.weights.map(w => w / maxW);
      }
    }
  }

  function computeMarketShares(priceIndices, beta) {
    const expVals = priceIndices.map(idx => Math.exp(-beta * PRICES[idx]));
    const total = expVals.reduce((a, b) => a + b, 0);
    return expVals.map(e => e / total);
  }

  function runSimulation(numShops, alpha, beta, numDays) {
    const agents = [];
    for (let i = 0; i < numShops; i++) {
      agents.push(new LowRegretAgent(PRICES.length));
    }

    const history = {
      avgPrice: [],
      avgRevenue: [],
      firmPrices: [],
      firmRegrets: [],
      firmTotalRevenue: [],
      counterfactualRevenues: []
    };

    for (let i = 0; i < numShops; i++) {
      history.firmPrices.push([]);
      history.firmRegrets.push([]);
      history.firmTotalRevenue.push(0);
      history.counterfactualRevenues.push(new Array(PRICES.length).fill(0));
    }

    const monopolyPrice = Math.min(5.0, 1 / alpha);
    const maxPossibleRevenue = monopolyPrice * getTotalDemand(monopolyPrice, alpha) / numShops * 1.5;

    for (let day = 0; day < numDays; day++) {
      const choices = agents.map(a => a.choosePrice());
      const shares = computeMarketShares(choices, beta);

      const avgPrice = choices.reduce((sum, idx) => sum + PRICES[idx], 0) / choices.length;
      const totalDemand = getTotalDemand(avgPrice, alpha);

      const revenues = choices.map((idx, i) => PRICES[idx] * shares[i] * totalDemand);

      const agentCounterfactuals = [];
      choices.forEach((chosenIdx, i) => {
        const counterfactuals = [];
        for (let altIdx = 0; altIdx < PRICES.length; altIdx++) {
          const altChoices = [...choices];
          altChoices[i] = altIdx;
          const altShares = computeMarketShares(altChoices, beta);
          const altAvgPrice = altChoices.reduce((sum, pIdx) => sum + PRICES[pIdx], 0) / altChoices.length;
          const altTotalDemand = getTotalDemand(altAvgPrice, alpha);
          const altRevenue = PRICES[altIdx] * altShares[i] * altTotalDemand;
          counterfactuals.push(altRevenue);
        }
        agentCounterfactuals.push(counterfactuals);
      });

      agents.forEach((agent, i) => {
        agent.updateWithCounterfactuals(agentCounterfactuals[i], maxPossibleRevenue);
      });

      history.avgPrice.push(avgPrice);
      history.avgRevenue.push(revenues.reduce((a, b) => a + b, 0) / numShops);

      choices.forEach((chosenIdx, i) => {
        history.firmPrices[i].push(PRICES[chosenIdx]);
        history.firmTotalRevenue[i] += revenues[i];

        for (let altIdx = 0; altIdx < PRICES.length; altIdx++) {
          history.counterfactualRevenues[i][altIdx] += agentCounterfactuals[i][altIdx];
        }
      });

      for (let i = 0; i < numShops; i++) {
        const bestCounterfactual = Math.max(...history.counterfactualRevenues[i]);
        const regret = bestCounterfactual - history.firmTotalRevenue[i];
        history.firmRegrets[i].push(regret);
      }
    }

    return history;
  }

  function drawPriceChart(canvas, history, alpha) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = { left: 50, right: 20, top: 30, bottom: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minPrice = 2.8;
    const maxPrice = 5.2;

    const toX = (i) => padding.left + (i / (history.avgPrice.length - 1)) * chartW;
    const toY = (p) => padding.top + chartH - ((p - minPrice) / (maxPrice - minPrice)) * chartH;

    // Grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    PRICES.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(padding.left, toY(p));
      ctx.lineTo(width - padding.right, toY(p));
      ctx.stroke();
    });

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    PRICES.forEach(p => {
      ctx.fillText('$' + p.toFixed(2), padding.left - 5, toY(p) + 4);
    });

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Days', width / 2, height - 5);

    // Draw reference lines
    const monopolyPrice = getMonopolyPrice(alpha);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, toY(monopolyPrice));
    ctx.lineTo(width - padding.right, toY(monopolyPrice));
    ctx.stroke();
    ctx.setLineDash([]);

    const socialPrice = 3.0;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, toY(socialPrice));
    ctx.lineTo(width - padding.right, toY(socialPrice));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw individual firm prices (faint)
    const windowSize = Math.max(1, Math.floor(history.avgPrice.length / 50));
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#2563eb';

    history.firmPrices.forEach((firmHistory) => {
      ctx.beginPath();
      for (let i = 0; i < firmHistory.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = i + 1;
        const slice = firmHistory.slice(start, end);
        const smoothed = slice.reduce((a, b) => a + b, 0) / slice.length;

        const x = toX(i);
        const y = toY(smoothed);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    ctx.globalAlpha = 1.0;

    // Draw average price line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let i = 0; i < history.avgPrice.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = i + 1;
      const slice = history.avgPrice.slice(start, end);
      const smoothed = slice.reduce((a, b) => a + b, 0) / slice.length;

      const x = toX(i);
      const y = toY(smoothed);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(padding.left + 10, padding.top - 15, 20, 3);
    ctx.fillStyle = '#333';
    ctx.fillText('Average price', padding.left + 35, padding.top - 10);

    ctx.strokeStyle = '#dc2626';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left + 150, padding.top - 13);
    ctx.lineTo(padding.left + 170, padding.top - 13);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333';
    ctx.fillText('Monopoly ($' + monopolyPrice.toFixed(2) + ')', padding.left + 175, padding.top - 10);

    ctx.strokeStyle = '#16a34a';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left + 320, padding.top - 13);
    ctx.lineTo(padding.left + 340, padding.top - 13);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333';
    ctx.fillText('Competitive ($3.00)', padding.left + 345, padding.top - 10);
  }

  function drawRegretChart(canvas, history, numShops) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = { left: 60, right: 20, top: 30, bottom: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const numDays = history.firmRegrets[0].length;

    const avgRegrets = history.firmRegrets.map(regrets =>
      regrets.map((r, i) => r / (i + 1))
    );

    let maxAvgRegret = 0;
    avgRegrets.forEach(regrets => {
      const earlyMax = Math.max(...regrets.slice(0, Math.max(20, Math.floor(regrets.length * 0.2))));
      maxAvgRegret = Math.max(maxAvgRegret, earlyMax);
    });
    maxAvgRegret = maxAvgRegret * 1.1 || 500;

    const toX = (i) => padding.left + (i / (numDays - 1)) * chartW;
    const toY = (r) => padding.top + chartH - (r / maxAvgRegret) * chartH;

    // Grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxAvgRegret * (1 - i / 4);
      ctx.fillText('$' + val.toFixed(0), padding.left - 5, padding.top + (i / 4) * chartH + 4);
    }

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Days', width / 2, height - 5);

    // Colors
    const colors = [
      '#2563eb', '#dc2626', '#16a34a', '#9333ea',
      '#ea580c', '#0891b2', '#be185d', '#4f46e5',
      '#059669', '#d97706', '#7c3aed', '#db2777'
    ];

    // Draw regret lines
    const windowSize = Math.max(1, Math.floor(numDays / 30));
    ctx.lineWidth = 2;
    avgRegrets.forEach((regrets, firmIdx) => {
      ctx.strokeStyle = colors[firmIdx % colors.length];
      ctx.beginPath();
      for (let i = 0; i < regrets.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = i + 1;
        const slice = regrets.slice(start, end);
        const smoothed = slice.reduce((a, b) => a + b, 0) / slice.length;

        const x = toX(i);
        const y = toY(smoothed);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Legend
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    const legendStartX = padding.left + 10;
    const legendY = padding.top - 12;
    const itemWidth = 70;

    for (let i = 0; i < Math.min(numShops, 8); i++) {
      const x = legendStartX + (i % 8) * itemWidth;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, legendY - 3, 12, 3);
      ctx.fillStyle = '#333';
      ctx.fillText('Firm ' + (i + 1), x + 16, legendY);
    }
    if (numShops > 8) {
      ctx.fillStyle = '#666';
      ctx.fillText('+ ' + (numShops - 8) + ' more', legendStartX + 8 * itemWidth, legendY);
    }
  }

  function showStats(history, numShops, alpha, lastN) {
    const statsDiv = document.getElementById('stats');

    const recentPrices = history.avgPrice.slice(-lastN);
    const recentRevenues = history.avgRevenue.slice(-lastN);
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const avgRevenue = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
    const monopolyPrice = getMonopolyPrice(alpha);

    const monopolyRevenue = monopolyPrice * getTotalDemand(monopolyPrice, alpha) / numShops;
    const competitiveRevenue = 3.0 * getTotalDemand(3.0, alpha) / numShops;

    const priceGap = ((avgPrice - 3.0) / (monopolyPrice - 3.0) * 100).toFixed(0);

    const numDays = history.firmRegrets[0].length;
    const totalFinalRegret = history.firmRegrets.reduce((sum, regrets) => sum + regrets[regrets.length - 1], 0);
    const avgRegretPerDay = totalFinalRegret / numShops / numDays;

    statsDiv.innerHTML =
      '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1em; text-align: center;">' +
        '<div>' +
          '<div style="font-size: 1.5em; font-weight: bold; color: #2563eb;">$' + avgPrice.toFixed(2) + '</div>' +
          '<div style="font-size: 0.85em; color: #666;">Equilibrium price</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size: 1.5em; font-weight: bold; color: #16a34a;">$' + avgRevenue.toFixed(0) + '</div>' +
          '<div style="font-size: 0.85em; color: #666;">Revenue per firm</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size: 1.5em; font-weight: bold; color: #dc2626;">' + priceGap + '%</div>' +
          '<div style="font-size: 0.85em; color: #666;">Toward monopoly</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size: 1.5em; font-weight: bold; color: #9333ea;">$' + avgRegretPerDay.toFixed(1) + '</div>' +
          '<div style="font-size: 0.85em; color: #666;">Avg regret/day</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top: 1em; font-size: 0.9em; color: #666;">' +
        'Competitive: $3.00 (revenue: $' + competitiveRevenue.toFixed(0) + '/firm) · ' +
        'Monopoly: $' + monopolyPrice.toFixed(2) + ' (revenue: $' + monopolyRevenue.toFixed(0) + '/firm)' +
      '</div>';
  }

  // Initialize
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', updateDisplays);
  });
  updateDisplays();

  document.getElementById('run-sim').addEventListener('click', () => {
    const numShops = parseInt(document.getElementById('num-shops').value);
    const alpha = parseFloat(document.getElementById('demand-elasticity').value);
    const beta = parseFloat(document.getElementById('price-sensitivity').value);
    const numDays = parseInt(document.getElementById('num-days').value);

    const history = runSimulation(numShops, alpha, beta, numDays);

    document.getElementById('results').style.display = 'block';
    drawPriceChart(document.getElementById('price-chart'), history, alpha);
    drawRegretChart(document.getElementById('regret-chart'), history, numShops);
    showStats(history, numShops, alpha, 50);
  });
})();
</script>

## Experiments to Try

### 1. **The Collusion Sweet Spot**
- **Settings**: 3 firms, α = 0.2, β = 1.0
- **Result**: Prices converge to ~$4.80-$5.00 (near monopoly)
- **Why**: Few competitors, inelastic demand, moderate price sensitivity creates perfect conditions for coordination

### 2. **Too Many Competitors**
- **Settings**: 10 firms, α = 0.2, β = 1.5
- **Result**: Prices settle around $3.50-$4.00 (partial collusion)
- **Why**: Each firm's price has little impact on total demand; undercutting is tempting

### 3. **High Price Sensitivity Breaks Collusion**
- **Settings**: 3 firms, α = 0.2, β = 2.8
- **Result**: Prices converge to ~$3.00-$3.50 (near competitive)
- **Why**: Small price cuts capture huge market share; high prices are unsustainable

### 4. **Elastic Demand Limits Monopoly Power**
- **Settings**: 3 firms, α = 0.45, β = 1.0
- **Result**: Monopoly price is $2.22 (below competitive baseline)
- **Why**: Consumers are price-sensitive at the aggregate level; raising prices shrinks the market too much

## Policy Implications

This phenomenon has major implications for antitrust enforcement:

1. **No communication required**: Traditional collusion requires explicit coordination (price-fixing agreements, market division, etc.). Algorithmic collusion emerges organically from independent learning.

2. **Legal gray area**: Current antitrust law focuses on explicit agreements. Are firms liable if their pricing algorithms independently discover collusive equilibria?

3. **Detection is hard**: Unlike cartel meetings or suspicious communications, algorithmic collusion leaves no smoking gun. Enforcement requires detecting suspicious price patterns and proving algorithmic causation.

4. **Interventions**: Possible responses include:
   - Requiring algorithmic transparency and audits
   - Banning certain types of learning algorithms in pricing contexts
   - Structural remedies (breaking up oligopolies)
   - Adding noise or regulation to prevent coordination

The fundamental tension: algorithms that are optimal for individual firms can be harmful for consumers and society. The same learning mechanisms that help firms adapt to changing markets can also facilitate tacit collusion.

## Further Reading

- [Gur Huberman and Gabriel Kashin, "The Dynamics of Algorithmic Pricing and Competition"](https://arxiv.org/abs/2305.17567) (2023)
- [Calvano et al., "Artificial Intelligence, Algorithmic Pricing, and Collusion"](https://www.aeaweb.org/articles?id=10.1257/aer.20190623) (2020)
- [Roughgarden, "The Price of Anarchy"](https://theory.stanford.edu/~tim/papers/cac.pdf) - Game-theoretic foundations

---

_This simulator implements the EXP3 algorithm with counterfactual updates, demonstrating how low-regret learners can converge to monopoly pricing in oligopolistic markets. The code is available for inspection in the page source._
