// POST /api/submit-score
// Body: { wallet: "0x...", score: 12345 }
//
// Stores only the player's BEST score (a wallet resubmitting a lower
// score is a no-op). Uses a Redis sorted set so leaderboard reads are
// O(log n) and cheap on the free Vercel KV tier.
//
// Known limitation (v1): the score comes straight from the client, so
// nothing stops someone from calling this endpoint directly with a
// fake number. For a first launch this is an acceptable tradeoff (low
// cost, ships today). If rewards start moving real value, harden this
// with a signed message (wallet signs the score payload with
// personal_sign, this endpoint verifies the signature with ethers'
// verifyMessage) before trusting a submission.

import { kv } from "@vercel/kv";

const LEADERBOARD_KEY = "2048:leaderboard";
const MAX_PLAUSIBLE_SCORE = 200000; // generous ceiling for a legitimate 2048 run

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet, score } = req.body || {};

    if (typeof wallet !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > MAX_PLAUSIBLE_SCORE) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const normalizedWallet = wallet.toLowerCase();
    const currentBest = await kv.zscore(LEADERBOARD_KEY, normalizedWallet);

    if (currentBest === null || numericScore > currentBest) {
      await kv.zadd(LEADERBOARD_KEY, { score: numericScore, member: normalizedWallet });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("submit-score error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
