// =====================================================================
// PLACEHOLDER / TODO
// This file still points at a leftover demo contract from the original
// template. Before this goes live you need to either:
//   1. Deploy your own reward/claim contract on Robinhood Chain mainnet
//      (see docs.robinhood.com/chain/deploy-smart-contracts), OR
//   2. Keep reward distribution off-chain (backend tracks scores,
//      periodic on-chain batch payout of $2048 to top players --
//      cheaper, recommended for a first launch).
// The $2048 ERC-20 token itself is created separately via fun.noxa.fi --
// this file is only for optional on-chain score/reward verification,
// not for the token contract itself.
// =====================================================================

const contractAddress = "0x7E173231947A1EbCd3811474fe781AF87076B018"; // TODO: replace with your deployed contract

const contractAbi = [
  {
    "inputs": [],
    "name": "mintBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Claim/mint call -- only works once a real contract is deployed above.
async function mintBadge() {
  if (!window.ethereum) {
    alert("No wallet found.");
    return;
  }

  try {
    if (window.ensureRobinhoodChain) {
      await window.ensureRobinhoodChain();
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const player = await signer.getAddress();

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const tx = await contract.mintBadge();
    await tx.wait();

    alert("Reward claim successful!");
  } catch (err) {
    console.error("Mint failed:", err);
  }
}

window.mintBadge = mintBadge;

// Read-only status check against the public Robinhood Chain mainnet RPC.
// (Rate-limited -- fine for demo, swap for a QuickNode/Alchemy endpoint
// before real traffic: docs.robinhood.com/chain/connecting)
window.checkMintStatus = async function (player) {
  try {
    const provider = new ethers.JsonRpcProvider("https://rpc.mainnet.chain.robinhood.com");
    const contract = new ethers.Contract(contractAddress, [
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "hasWon",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      }
    ], provider);

    const won = await contract.hasWon(player);
    const statusEl = document.getElementById("wallet-status");
    if (statusEl) statusEl.innerText += won ? " ✅" : "";
  } catch (err) {
    // Expected to fail until a real contract is deployed -- don't alert the user.
    console.warn("Mint status check skipped (no live contract yet):", err.message);
  }
};
