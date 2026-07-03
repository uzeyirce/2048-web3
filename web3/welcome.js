// Shows a one-time welcome/announcement modal on first visit.
// Uses localStorage so it doesn't reappear on every reload.
(function () {
  var STORAGE_KEY = "welcome2048RobinhoodSeen";

  function closeModal(overlay) {
    overlay.classList.remove("is-visible");
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      // localStorage unavailable (private mode etc.) -- fail silently,
      // modal will just show again next visit.
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    var overlay = document.getElementById("welcome-overlay");
    if (!overlay) return;

    var alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}

    if (!alreadySeen) {
      // slight delay so it doesn't flash before styles/layout settle
      setTimeout(function () {
        overlay.classList.add("is-visible");
      }, 150);
    }

    var closeBtn = document.getElementById("welcome-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeModal(overlay);
      });
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
  });
})();
