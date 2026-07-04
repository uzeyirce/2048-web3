// POST /api/claim-jackpot
// Body: { winner: "0x..." }
//
// PRIVATE KEY NEVER GOES IN THE FRONTEND.
// Set these in Vercel Dashboard → Project → Settings → Environment Variables:
//   REWARD_WALLET_PRIVATE_KEY  — the reward pool wallet private key
//   CLAIM_SECRET               — a random string you choose (e.g. openssl rand -hex 32)
//
// The frontend sends the winner address. This endpoint verifies the
// claim hasn't been paid before, then transfers all $2048 tokens to the winner.

import { ethers } from "ethers";

const TOKEN_ADDRESS = "0x5e3621092fa9a5eca3477788a47e4580c4ab73e3";
const RPC_URL = "https://rpc.mainnet.chain.robinhood.com";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// Simple one-time claim guard — in production use a DB or KV store
let alreadyClaimed = false;
let lastWinner: string | null = null;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { winner } = req.body || {};

  // Validate winner address
  if (!winner || !/^0x[a-fA-F0-9]{40}$/.test(winner)) {
    return res.status(400).json({ error: "Invalid winner address" });
  }

  // One-time claim guard
  if (alreadyClaimed) {
    return res.status(409).json({ error: "Jackpot already claimed by " + lastWinner });
  }

  const privateKey = process.env.REWARD_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error("REWARD_WALLET_PRIVATE_KEY not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

    const decimals = await token.decimals();
    const balance = await token.balanceOf(signer.address);

    if (balance === 0n) {
      return res.status(400).json({ error: "Reward pool is empty" });
    }

    // Transfer all tokens to winner
    const tx = await token.transfer(winner, balance);
    await tx.wait();

    alreadyClaimed = true;
    lastWinner = winner;

    console.log(`Jackpot claimed: ${ethers.formatUnits(balance, decimals)} $2048 → ${winner} (tx: ${tx.hash})`);

    return res.status(200).json({
      ok: true,
      txHash: tx.hash,
      amount: ethers.formatUnits(balance, decimals),
      winner
    });

  } catch (err: any) {
    console.error("Jackpot claim failed:", err);
    return res.status(500).json({ error: "Transfer failed: " + err.message });
  }
}
