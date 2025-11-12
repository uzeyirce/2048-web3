// ✅ UPDATED CONTRACT ADDRESS (paste new one here)
const contractAddress = "0x7E173231947A1EbCd3811474fe781AF87076B018";

// ✅ ABI for mintBadge()
const contractAbi = [
  {
    "inputs": [],
    "name": "mintBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// mint function
async function mintBadge() {
  if (!window.ethereum) {
    alert("MetaMask not detected");
    return;
  }

  try {
    console.log("⛓ Connecting wallet...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const player = await signer.getAddress();
    console.log("👤 Player:", player);

    console.log("🚀 Calling mintBadge()...");
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    const tx = await contract.mintBadge();
    await tx.wait();

    alert("✅ NFT Badge successfully minted!");
  } catch (err) {
    console.error("❌ Mint failed:", err);
  }
}

// expose globally
window.mintBadge = mintBadge;
window.checkMintStatus = async function (player) {
  try {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new ethers.Contract(contractAddress, [
      {
        "inputs":[{ "internalType": "address", "name": "", "type": "address" }],
        "name": "hasWon",
        "outputs":[{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      }
    ], provider);

    const minted = await contract.hasWon(player);

    if (minted) {
      document.getElementById("wallet-status").innerText += " ✅ Minted";
    } else {
      document.getElementById("wallet-status").innerText += " ❌ Not Minted";
    }

    console.log("Mint Status:", minted);
  } catch (err) {
    console.error("Mint status check error:", err);
  }
};

