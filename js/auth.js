/*
 * TX247 website accounts — Discord login wiring (all pages).
 *
 * - Any element with class "discord-login" becomes the Login with Discord
 *   button. While js/auth-config.js is unconfigured, buttons render in an
 *   inactive state and simply link to the explanation at
 *   how-it-works.html#website-accounts.
 * - When configured, a click builds the real Discord authorize URL
 *   (scopes: identify + guilds.members.read), stores a random state nonce
 *   in sessionStorage, and redirects. Discord returns the user to
 *   account.html?code=…&state=… — account.html verifies the state against
 *   sessionStorage before handing the code to the backend.
 * - If a valid session already exists, buttons quietly become "My Account".
 */
(function () {
  "use strict";

  var cfg = window.TX247_AUTH || {};
  var configured = Boolean(cfg.clientId && cfg.apiBase);
  var STATE_KEY = "tx247_oauth_state";
  var EXPLAIN_URL = "how-it-works.html#website-accounts";

  function makeState() {
    var arr = new Uint8Array(24);
    window.crypto.getRandomValues(arr);
    return Array.prototype.map
      .call(arr, function (b) { return ("0" + b.toString(16)).slice(-2); })
      .join("");
  }

  function accountUrl() {
    return new URL("account.html", window.location.href).href;
  }

  function startLogin() {
    var state = makeState();
    try {
      sessionStorage.setItem(STATE_KEY, state);
    } catch (e) {
      /* sessionStorage unavailable — account.html will fail the state check
         and show a clean error rather than signing in unsafely. */
    }
    var url =
      "https://discord.com/oauth2/authorize" +
      "?client_id=" + encodeURIComponent(cfg.clientId) +
      "&redirect_uri=" + encodeURIComponent(accountUrl()) +
      "&response_type=code" +
      "&scope=" + encodeURIComponent("identify guilds.members.read") +
      "&state=" + encodeURIComponent(state);
    window.location.href = url;
  }

  function wireButtons() {
    document.querySelectorAll(".discord-login").forEach(function (btn) {
      if (!configured) {
        btn.classList.add("is-inactive");
        if (!btn.getAttribute("href") || btn.getAttribute("href") === "#") {
          btn.setAttribute("href", EXPLAIN_URL);
        }
        return;
      }
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        startLogin();
      });
    });
  }

  function probeSession() {
    if (!configured) return;
    fetch(cfg.apiBase + "/api/me", { credentials: "include" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (me) {
        if (!me) return;
        document.querySelectorAll(".discord-login").forEach(function (btn) {
          // Clone to strip the login click handler wired above.
          var clone = btn.cloneNode(true);
          clone.classList.remove("is-inactive");
          clone.textContent = "My Account";
          clone.setAttribute("href", "account.html");
          btn.parentNode.replaceChild(clone, btn);
        });
      })
      .catch(function () {
        /* API unreachable — leave the plain login buttons as they are. */
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireButtons();
    probeSession();
  });

  // Shared with account.html (state check + login restart).
  window.TX247Auth = {
    configured: configured,
    startLogin: startLogin,
    accountUrl: accountUrl,
    STATE_KEY: STATE_KEY
  };
})();
