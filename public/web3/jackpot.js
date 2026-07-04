// Jackpot pool: shows live reward pool balance, triggers claim when player wins 2048.
// Private key NEVER touches this file — claim goes through /api/claim-jackpot.

const TOKEN_ADDRESS = "0x5e3621092fa9a5eca3477788a47e4580c4ab73e3";
const REWARD_WALLET  = "0x81928bBd40a608329A5807Cd2964Bb339A364103"; // reward pool wallet — read-only
const RPC_URL        = "https://rpc.mainnet.chain.robinhood.com";

const ERC20_BALANCE_ABI = [
  { inputs:[{internalType:"address",name:"account",type:"address"}], name:"balanceOf", outputs:[{internalType:"uint256",name:"",type:"uint256"}], stateMutability:"view", type:"function" },
  { inputs:[], name:"decimals", outputs:[{internalType:"uint8",name:"",type:"uint8"}], stateMutability:"view", type:"function" }
];

let jackpotBalance = "0";
let jackpotClaimed = false;

function fmt(raw, decimals) {
  const n = Number(ethers.formatUnits(raw, decimals));
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2)+"M";
  if (n >= 1_000)     return (n/1_000).toFixed(2)+"K";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

async function loadJackpot() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const token    = new ethers.Contract(TOKEN_ADDRESS, ERC20_BALANCE_ABI, provider);
    const [decimals, balance] = await Promise.all([token.decimals(), token.balanceOf(REWARD_WALLET)]);
    jackpotBalance = ethers.formatUnits(balance, decimals);

    const el = document.getElementById("jackpot-amount");
    if (el) el.textContent = fmt(balance, decimals) + " $2048";

    const sub = document.getElementById("jackpot-sub");
    if (sub) sub.textContent = balance === 0n ? "Pool is empty — come back soon!" : "Reach the 2048 tile to win it all!";
  } catch (err) {
    console.warn("Jackpot fetch failed:", err.message);
  }
}

async function claimJackpot(winnerWallet) {
  const btn = document.getElementById("jackpot-claim-btn");
  if (!winnerWallet) {
    alert("Connect your wallet first to claim the jackpot.");
    return;
  }
  if (jackpotClaimed) {
    alert("Jackpot already claimed this round.");
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = "Claiming…"; }

  try {
    const res  = await fetch("/api/claim-jackpot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: winnerWallet })
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      jackpotClaimed = true;
      alert(`🎉 Jackpot claimed!\n${data.amount} $2048 sent to ${winnerWallet}\nTx: ${data.txHash}`);
      if (btn) { btn.textContent = "Claimed ✅"; }
      loadJackpot(); // refresh balance to show 0
    } else {
      alert("Claim failed: " + (data.error || "unknown error"));
      if (btn) { btn.disabled = false; btn.textContent = "Claim Jackpot 🏆"; }
    }
  } catch (err) {
    console.error("Claim error:", err);
    alert("Network error — try again.");
    if (btn) { btn.disabled = false; btn.textContent = "Claim Jackpot 🏆"; }
  }
}

// Called by html_actuator when won:true event fires
function onGameWon() {
  const wallet = window.currentWallet;
  const section = document.getElementById("jackpot-claim-section");
  if (section) {
    section.style.display = "block";
    const btn = document.getElementById("jackpot-claim-btn");
    if (btn) {
      btn.onclick = () => claimJackpot(wallet);
    }
    // Scroll into view
    section.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Listen for game2048:score event (won flag)
window.addEventListener("game2048:score", function(e) {
  if (e.detail && e.detail.won && !jackpotClaimed) {
    onGameWon();
  }
});

window.addEventListener("DOMContentLoaded", function() {
  loadJackpot();
  // Refresh every 60 seconds
  setInterval(loadJackpot, 60000);
});

window.claimJackpot = claimJackpot;
