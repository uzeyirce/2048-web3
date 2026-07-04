// Telegram Mini App integration.
// Loads fine on a normal browser too -- window.Telegram is just undefined
// there, so everything in here safely no-ops outside Telegram.
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return; // not running inside Telegram, nothing to do

  tg.ready();
  tg.expand(); // use the full viewport instead of the collapsed sheet

  // Match Telegram's chrome to the Robinhood-green theme instead of
  // leaving it on Telegram's default background.
  try {
    tg.setHeaderColor("#0A1F0F");
    tg.setBackgroundColor("#0A1F0F");
  } catch (e) {
    // older Telegram client versions may not support these -- fine to ignore
  }

  // Telegram identity (from initDataUnsafe) -- useful later to show a
  // Telegram username next to the wallet address on the leaderboard, or
  // to verify initData server-side before trusting a score submission.
  var tgUser = tg.initDataUnsafe && tg.initDataUnsafe.user;
  if (tgUser) {
    window.telegramUser = {
      id: tgUser.id,
      username: tgUser.username,
      firstName: tgUser.first_name
    };
    console.log("Running inside Telegram as:", window.telegramUser.username || window.telegramUser.id);
  }

  // Flag other scripts (wallet.js) can check to switch to
  // WalletConnect instead of the injected window.ethereum, which does
  // not exist inside Telegram's in-app browser.
  window.isTelegramMiniApp = true;

  document.body.classList.add("in-telegram");
})();
