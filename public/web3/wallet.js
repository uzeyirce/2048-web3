// TODO (Telegram Mini App): window.ethereum (MetaMask/Rabby extension)
// does not exist inside Telegram's in-app browser -- only on desktop
// browsers with the extension installed. To let Telegram users connect
// a wallet, add WalletConnect (get a free Project ID at cloud.reown.com,
// then use @walletconnect/ethereum-provider or Reown AppKit) as an
// alternative connection path when window.isTelegramMiniApp is true.
// Not implemented yet -- connectWallet() below just shows a fallback
// message for Telegram users in the meantime.

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
    if (window.isTelegramMiniApp) {
      // Telegram's in-app browser has no injected wallet (no MetaMask/Rabby
      // extension exists there). Real fix is WalletConnect -- see wallet.js
      // TODO below. For now, tell the player plainly instead of failing silently.
      alert("Wallet connect inside Telegram needs WalletConnect support, which isn't wired up yet. For now, open this game in your phone's browser (Chrome/Safari) to connect your wallet.");
    } else {
      alert("No wallet found. Please install Rabby or MetaMask.");
    }
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const wallet = accounts[0];

    await ensureRobinhoodChain();

    window.currentWallet = wallet;

    const btn = document.getElementById("connect-btn");
    btn.innerText = "Connected ✅";
    btn.classList.add("connected");
    document.getElementById("wallet-status").innerText =
      wallet.slice(0, 6) + "..." + wallet.slice(-4);

    console.log("Wallet connected:", wallet);

    window.dispatchEvent(new CustomEvent("game2048:walletConnected", { detail: { wallet } }));

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
