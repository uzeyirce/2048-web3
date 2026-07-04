// Token Stats panel: shows the creator wallet's $2048 balance and the
// amount burned (sent to the standard 0x000...dead address), read live
// from Robinhood Chain. Read-only -- no wallet connection needed to see
// these numbers, anyone visiting the site can verify them.

// ⚠️ REQUIRED CONFIG -- fill this in once the $2048 token is deployed on
// fun.noxa.fi. You can find it on the token's Noxa page or on the
// Robinhood Chain explorer (robinhoodchain.blockscout.com).
const TOKEN_CONTRACT_ADDRESS = "0x5e3621092fa9a5eca3477788a47e4580c4ab73e3";

const CREATOR_WALLET = "0x43279eFf8fe1897bc35c70bB926eDa753878c4F6";
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const ROBINHOOD_RPC = "https://rpc.mainnet.chain.robinhood.com";

const ERC20_MINI_ABI = [
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

function formatTokenAmount(raw, decimals) {
  const value = Number(ethers.formatUnits(raw, decimals));
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(2) + "K";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

async function loadTokenStats() {
  const isConfigured = TOKEN_CONTRACT_ADDRESS.toLowerCase() !== BURN_ADDRESS.toLowerCase();
  const creatorEl = document.getElementById("stat-creator-balance");
  const burnedEl = document.getElementById("stat-burned");
  const supplyEl = document.getElementById("stat-burned-pct");

  if (!isConfigured) {
    if (creatorEl) creatorEl.textContent = "Set contract address";
    if (burnedEl) burnedEl.textContent = "Set contract address";
    console.warn("TOKEN_CONTRACT_ADDRESS is not set yet in web3/token-stats.js");
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(ROBINHOOD_RPC);
    const token = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_MINI_ABI, provider);

    const [decimals, creatorBalance, burnedBalance, totalSupply] = await Promise.all([
      token.decimals(),
      token.balanceOf(CREATOR_WALLET),
      token.balanceOf(BURN_ADDRESS),
      token.totalSupply()
    ]);

    if (creatorEl) creatorEl.textContent = formatTokenAmount(creatorBalance, decimals) + " $2048";
    if (burnedEl) burnedEl.textContent = formatTokenAmount(burnedBalance, decimals) + " $2048";

    if (supplyEl && totalSupply > 0n) {
      const pct = (Number(burnedBalance) / Number(totalSupply)) * 100;
      supplyEl.textContent = pct.toFixed(2) + "% of total supply burned";
    }
  } catch (err) {
    console.error("Token stats fetch failed:", err);
    if (creatorEl) creatorEl.textContent = "Unavailable";
    if (burnedEl) burnedEl.textContent = "Unavailable";
  }
}

window.addEventListener("DOMContentLoaded", loadTokenStats);
