// Live price ticker — reads from DexScreener's free public API,
// no API key or registration required.
// Falls back silently if the token isn't indexed yet.

const TOKEN_ADDRESS = "0x5e3621092fa9a5eca3477788a47e4580c4ab73e3";
const CHAIN = "robinhoodchain"; // DexScreener chain slug
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`;
const REFRESH_INTERVAL_MS = 30000; // refresh every 30 seconds

function formatPrice(p) {
  if (!p) return "—";
  const n = parseFloat(p);
  if (n < 0.000001) return "$" + n.toExponential(2);
  if (n < 0.01) return "$" + n.toFixed(6);
  return "$" + n.toFixed(4);
}

function formatMcap(m) {
  if (!m) return "—";
  if (m >= 1_000_000) return "$" + (m / 1_000_000).toFixed(2) + "M";
  if (m >= 1_000) return "$" + (m / 1_000).toFixed(1) + "K";
  return "$" + Math.round(m);
}

function updateMilestone(mcap) {
  const milestones = [
    { target: 100_000, label: "$100K MCap" },
    { target: 500_000, label: "$500K MCap" },
    { target: 1_000_000, label: "$1M MCap" },
    { target: 5_000_000, label: "$5M MCap" },
    { target: 10_000_000, label: "$10M MCap" },
  ];

  let milestone = milestones[0];
  for (const m of milestones) {
    if (mcap < m.target) { milestone = m; break; }
    milestone = m; // we've passed this, keep going
  }

  const prevTarget = milestones[milestones.indexOf(milestone) - 1]?.target || 0;
  const pct = Math.min(100, Math.round(((mcap - prevTarget) / (milestone.target - prevTarget)) * 100));

  const bar = document.getElementById("milestone-bar");
  const label = document.getElementById("milestone-label");
  const desc = document.getElementById("milestone-desc");

  if (bar) bar.style.width = pct + "%";
  if (label) label.textContent = "Target: " + milestone.label;
  if (desc) desc.textContent = pct + "% of the way there — keep playing and spread the word!";
}

async function fetchTicker() {
  try {
    const res = await fetch(DEXSCREENER_URL);
    if (!res.ok) return;
    const data = await res.json();
    const pairs = data.pairs;
    if (!pairs || pairs.length === 0) return;

    // Pick the pair with the highest liquidity
    const pair = pairs.reduce((a, b) =>
      (parseFloat(a.liquidity?.usd || 0) > parseFloat(b.liquidity?.usd || 0)) ? a : b
    );

    const price = pair.priceUsd;
    const change24h = parseFloat(pair.priceChange?.h24 || 0);
    const mcap = parseFloat(pair.marketCap || pair.fdv || 0);

    const priceEl = document.getElementById("ticker-price");
    const changeEl = document.getElementById("ticker-change");
    const mcapEl = document.getElementById("ticker-mcap");

    if (priceEl) priceEl.textContent = formatPrice(price);
    if (changeEl) {
      const sign = change24h >= 0 ? "+" : "";
      changeEl.textContent = sign + change24h.toFixed(2) + "%";
      changeEl.className = "ticker-change " + (change24h >= 0 ? "ticker-up" : "ticker-down");
    }
    if (mcapEl) mcapEl.textContent = formatMcap(mcap);

    if (mcap > 0) updateMilestone(mcap);

  } catch (err) {
    console.warn("Ticker fetch failed:", err.message);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fetchTicker();
  setInterval(fetchTicker, REFRESH_INTERVAL_MS);
});
