// ✅ Wallet Connect Logic
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found!");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const wallet = accounts[0];

    document.getElementById("connect-btn").innerText = "Connected ✅";
    document.getElementById("wallet-status").innerText =
      wallet.slice(0, 6) + "..." + wallet.slice(-4);

    console.log("✅ Wallet connected:", wallet);

    // ✅ After connecting, check NFT status
    if (window.checkMintStatus) {
      window.checkMintStatus(wallet);
    }
  } catch (err) {
    console.error("Wallet connect failed:", err);
  }
}

// attach to button
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connect-btn");
  if (btn) btn.onclick = connectWallet;
});

// ✅ expose globally
window.connectWallet = connectWallet;

