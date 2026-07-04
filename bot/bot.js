// 2048 Robinhood — Telegram bot
// Runs on your own remote server (long polling, no public HTTPS endpoint
// needed — that's the simplest option for a first launch).
//
// Setup:
//   1. cp .env.example .env   and fill in BOT_TOKEN + WEBAPP_URL
//   2. npm install
//   3. npm start   (or run under pm2 — see README.md)

import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL; // e.g. https://2048robin.vercel.app
const LEADERBOARD_API = `${WEBAPP_URL}/api/leaderboard`;

if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error("Missing BOT_TOKEN or WEBAPP_URL in .env — see .env.example");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

function playKeyboard() {
  return new InlineKeyboard().webApp("Play 2048", WEBAPP_URL);
}

bot.command("start", async (ctx) => {
  await ctx.reply(
    "2048 is live on Robinhood Chain.\n\n" +
    "Merge tiles, climb the leaderboard, earn $2048. Tap below to play.",
    { reply_markup: playKeyboard() }
  );
});

bot.command("play", async (ctx) => {
  await ctx.reply("Let's go.", { reply_markup: playKeyboard() });
});

bot.command("leaderboard", async (ctx) => {
  try {
    const res = await fetch(LEADERBOARD_API);
    const data = await res.json();
    const entries = data.entries || [];

    if (entries.length === 0) {
      await ctx.reply("No scores yet — be the first on the board.", { reply_markup: playKeyboard() });
      return;
    }

    const lines = entries.map((e, i) => {
      const short = e.wallet.slice(0, 6) + "..." + e.wallet.slice(-4);
      return `${i + 1}. ${short} — ${e.score.toLocaleString("en-US")}`;
    });

    await ctx.reply("Top $2048 scores:\n\n" + lines.join("\n"), { reply_markup: playKeyboard() });
  } catch (err) {
    console.error("leaderboard command failed:", err);
    await ctx.reply("Couldn't reach the leaderboard right now — try again in a bit.");
  }
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

bot.start();
console.log("2048 Robinhood bot is running (long polling)...");
