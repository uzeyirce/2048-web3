// Robinhood Chain network config
// VERIFY BEFORE MAINNET LAUNCH: these values come from the public
// Robinhood Chain TESTNET docs (docs.robinhood.com/chain/connecting) as of
// July 2026. Mainnet may use a different chain ID / RPC -- confirm the
// current values in the official docs (or your wallet's auto-detect)
// before pointing real users at this. Do not trust third-party "leaked"
// chain IDs from meme sites.
const ROBINHOOD_CHAIN = {
  chainId: "0xB626", // 46630 (Robinhood Chain Testnet) -- swap for mainnet ID once confirmed
  chainName: "Robinhood Chain Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://explorer.testnet.chain.robinhood.com"]
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
    alert("Cüzdan bulunamadı. Lütfen Rabby veya MetaMask kurun.");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const wallet = accounts[0];

    await ensureRobinhoodChain();

    const btn = document.getElementById("connect-btn");
    btn.innerText = "Bağlandı ✅";
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
