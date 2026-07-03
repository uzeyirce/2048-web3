// Robinhood Chain — MAINNET config (verified against docs.robinhood.com/chain
// and docs.robinhood.com/chain/connecting, July 2026)
const ROBINHOOD_CHAIN = {
  chainId: "0x1237", // 4663 (Robinhood Chain Mainnet)
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"]
};

// Add / switch to Robinhood Chain in the connected wallet
async function ensureRobinhoodChain() {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ROBINHOOD_CHAIN.chainId }]
    });
    return true;
  } catch (switchError) {
    // 4902 = chain not added to wallet yet
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ROBINHOOD_CHAIN]
        });
        return true;
      } catch (addError) {
        console.error("Could not add Robinhood Chain:", addError);
        return false;
      }
    }
    console.error("Could not switch to Robinhood Chain:", switchError);
    return false;
  }
}

// Wallet Connect Logic
async function connectWallet() {
  if (!window.ethereum) {
    alert("No wallet found. Please install Rabby or MetaMask.");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const wallet = accounts[0];

    await ensureRobinhoodChain();

    const btn = document.getElementById("connect-btn");
    btn.innerText = "Connected ✅";
    btn.classList.add("connected");
    document.getElementById("wallet-status").innerText =
      wallet.slice(0, 6) + "..." + wallet.slice(-4);

    console.log("Wallet connected:", wallet);

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

// expose globally
window.connectWallet = connectWallet;
window.ensureRobinhoodChain = ensureRobinhoodChain;
