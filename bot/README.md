# 2048 Robinhood — Telegram Bot

Runs the Telegram side of the game: a `/play` button that opens the game as
a Telegram Mini App, plus a `/leaderboard` command that reads from the same
`/api/leaderboard` endpoint the website uses.

## 1. Create the bot (5 minutes, free)

1. Open Telegram, message **@BotFather**.
2. `/newbot` → pick a display name → pick a username ending in `bot`
   (e.g. `play2048robinhood_bot`).
3. BotFather gives you a **token** — copy it.
4. `/setmenubutton` → select your bot → send your game URL
   (e.g. `https://2048robin.vercel.app`) as the Web App URL. This puts a
   persistent "Play" button next to the message box in every chat with the bot.
5. Optional but recommended: `/setdescription` and `/setuserpic` to brand the bot.

## 2. Deploy on your remote server

```bash
# on your server
git clone <your-repo>
cd 2048-web3/bot
cp .env.example .env
nano .env   # paste BOT_TOKEN, set WEBAPP_URL to your live site
npm install
npm start   # test it — /start your bot on Telegram, confirm the button works
```

## 3. Keep it running (pm2)

Long polling means the process needs to stay alive. `pm2` is the simplest way:

```bash
npm install -g pm2
pm2 start bot.js --name 2048-bot
pm2 save
pm2 startup   # follow the printed instructions so it survives a server reboot
```

Check logs any time with `pm2 logs 2048-bot`.

## Notes

- This uses **long polling**, not a webhook — no need to expose a public
  HTTPS port on your server or configure a reverse proxy. Simplest option
  for a first launch; a webhook is only worth the extra setup once you're
  at a scale where polling's latency actually matters.
- Wallet connect inside the Mini App is not wired up yet (Telegram's in-app
  browser has no injected wallet like MetaMask). See the TODO comment at
  the top of `web3/wallet.js` — WalletConnect is the next step there.
