// GET /api/leaderboard
// Returns the top 10 wallets by best score, highest first.

import { kv } from "@vercel/kv";

const LEADERBOARD_KEY = "2048:leaderboard";
const TOP_N = 10;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // withScores, descending order, top N
    const raw = await kv.zrange(LEADERBOARD_KEY, 0, TOP_N - 1, {
      rev: true,
      withScores: true
    });

    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ wallet: raw[i], score: Number(raw[i + 1]) });
    }

    res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=30");
    return res.status(200).json({ entries });
  } catch (err) {
    console.error("leaderboard error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
