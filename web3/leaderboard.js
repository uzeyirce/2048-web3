// Leaderboard: renders under the game, submits scores when a game ends
// (not on every move -- keeps API calls cheap), and refreshes the list.
(function () {
  var lastSubmittedForGame = -1; // avoid double-submitting the same game-over

  function shortAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function renderLeaderboard(entries) {
    var list = document.getElementById("leaderboard-list");
    if (!list) return;

    if (!entries || entries.length === 0) {
      list.innerHTML = '<li class="leaderboard-empty">No scores yet — be the first.</li>';
      return;
    }

    var myWallet = window.currentWallet ? window.currentWallet.toLowerCase() : null;

    list.innerHTML = entries.map(function (entry, i) {
      var isMe = myWallet && entry.wallet.toLowerCase() === myWallet;
      return (
        '<li class="leaderboard-row' + (isMe ? " is-me" : "") + '">' +
          '<span class="leaderboard-rank">#' + (i + 1) + '</span>' +
          '<span class="leaderboard-wallet">' + shortAddress(entry.wallet) + (isMe ? " (you)" : "") + '</span>' +
          '<span class="leaderboard-score">' + entry.score.toLocaleString("en-US") + '</span>' +
        '</li>'
      );
    }).join("");
  }

  async function fetchLeaderboard() {
    try {
      var res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("bad response");
      var data = await res.json();
      renderLeaderboard(data.entries);
    } catch (err) {
      console.warn("Leaderboard fetch failed:", err);
      var list = document.getElementById("leaderboard-list");
      if (list) list.innerHTML = '<li class="leaderboard-empty">Leaderboard unavailable right now.</li>';
    }
  }

  async function submitScore(score) {
    if (!window.currentWallet || !score) return;
    try {
      await fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: window.currentWallet, score: score })
      });
      fetchLeaderboard();
    } catch (err) {
      console.warn("Score submit failed:", err);
    }
  }

  window.addEventListener("game2048:score", function (e) {
    var detail = e.detail || {};
    // Only submit once per finished game, and only if a wallet is connected.
    if (detail.terminated && detail.score !== lastSubmittedForGame) {
      lastSubmittedForGame = detail.score;
      submitScore(detail.score);
    }
  });

  window.addEventListener("game2048:walletConnected", function () {
    fetchLeaderboard(); // refresh so "(you)" highlighting can apply
  });

  window.addEventListener("DOMContentLoaded", function () {
    fetchLeaderboard();
    var refreshBtn = document.getElementById("leaderboard-refresh");
    if (refreshBtn) refreshBtn.addEventListener("click", fetchLeaderboard);
  });
})();
