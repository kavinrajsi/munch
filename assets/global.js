!(function () {
  var CLOSE_DURATION_MS = 24 * 60 * 60 * 1000;

  function hideAnnouncement(bar) {
    bar.classList.add("is-hidden");
  }

  function setCookie(name, value, durationMs) {
    var expiresAt = new Date(Date.now() + durationMs).toUTCString();
    document.cookie =
      name + "=" + encodeURIComponent(value) + "; expires=" + expiresAt + "; path=/";
  }

  function getCookie(name) {
    var match = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()\\[\\]\\\\/+^])/g, "\\$1") + "=([^;]*)"
      )
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getCloseKey(bar) {
    var sectionId = bar.dataset.sectionId || "default";
    return "announcementBarClosed:" + sectionId;
  }

  function shouldShowAnnouncement(bar) {
    var key = getCloseKey(bar);
    var now = Date.now();
    var stored = null;

    try {
      stored = localStorage.getItem(key);
    } catch (err) {}

    if (!stored) {
      var cookieValue = getCookie(key);
      if (cookieValue) stored = cookieValue;
    }

    if (stored && now - parseInt(stored, 10) < CLOSE_DURATION_MS) {
      hideAnnouncement(bar);
      return false;
    }

    return true;
  }

  function persistClose(bar) {
    var key = getCloseKey(bar);
    var timestamp = Date.now();

    try {
      localStorage.setItem(key, String(timestamp));
    } catch (err) {}

    setCookie(key, String(timestamp), CLOSE_DURATION_MS);
  }

  function applyAnnouncementVars(bar) {
    var data = bar.dataset;
    if (data.speed) {
      bar.style.setProperty("--announcement-speed", data.speed + "s");
    }
    if (data.textColor) {
      bar.style.setProperty("--announcement-text-color", data.textColor);
    }
    if (data.bgColor) {
      bar.style.setProperty("--announcement-bg-color", data.bgColor);
    }
    if (data.paddingTop) {
      bar.style.setProperty("--announcement-padding-top", data.paddingTop + "px");
    }
    if (data.paddingBottom) {
      bar.style.setProperty(
        "--announcement-padding-bottom",
        data.paddingBottom + "px"
      );
    }
    if (data.paddingTopMobile) {
      bar.style.setProperty(
        "--announcement-padding-top-mobile",
        data.paddingTopMobile + "px"
      );
    }
    if (data.paddingBottomMobile) {
      bar.style.setProperty(
        "--announcement-padding-bottom-mobile",
        data.paddingBottomMobile + "px"
      );
    }
  }

  function initAnnouncementBar(bar) {
    applyAnnouncementVars(bar);
    if (!shouldShowAnnouncement(bar)) return;

    var closeButton = bar.querySelector("[data-announcement-close]");
    if (!closeButton) return;

    closeButton.addEventListener("click", function () {
      hideAnnouncement(bar);
      persistClose(bar);
    });
  }

  function initAnnouncementBars() {
    document.querySelectorAll(".announcement-bar").forEach(initAnnouncementBar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnnouncementBars);
  } else {
    initAnnouncementBars();
  }
})();
