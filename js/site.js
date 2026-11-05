/*
 * TX247 redesign — shared UI behaviour (vanilla JS, no dependencies).
 *
 * 1) Nav dropdowns: click toggles (touch), outside-click and Esc close.
 *    Desktop hover/focus is pure CSS in css/nav.css, so menus still work
 *    with JS disabled; this script only adds the touch/keyboard layer.
 * 2) Mobile nav: hamburger toggles the stacked menu panel.
 * 3) Tabs: any [data-tabs] block gets button->panel switching, arrow-key
 *    navigation, and deep-link support — if location.hash points at a
 *    panel or at an element inside a hidden panel (e.g.
 *    how-it-works.html#website-accounts), that panel is activated.
 */
(function () {
  "use strict";

  /* ---------- nav dropdowns ---------- */
  var nav = document.querySelector(".tx-nav");
  if (nav) {
    var dds = Array.prototype.slice.call(nav.querySelectorAll(".tx-dd"));
    function closeAll(except) {
      dds.forEach(function (dd) {
        if (dd !== except) {
          dd.classList.remove("open");
          var b = dd.querySelector(".tx-dd-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }
    dds.forEach(function (dd) {
      var btn = dd.querySelector(".tx-dd-btn");
      if (!btn) return;
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var willOpen = !dd.classList.contains("open");
        closeAll(dd);
        dd.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
      dd.addEventListener("click", function (ev) { ev.stopPropagation(); });
    });
    document.addEventListener("click", function () { closeAll(null); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        closeAll(null);
        nav.classList.remove("open");
        var burger = nav.querySelector(".tx-burger");
        if (burger) burger.setAttribute("aria-expanded", "false");
      }
    });

    var burger = nav.querySelector(".tx-burger");
    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------- tabs ---------- */
  function activate(tabsEl, panelId) {
    var btns = tabsEl.querySelectorAll(".tab-btn");
    var panels = tabsEl.querySelectorAll(".tab-panel");
    var found = false;
    panels.forEach(function (p) { if (p.id === panelId) found = true; });
    if (!found) return false;
    btns.forEach(function (b) {
      var on = b.getAttribute("data-tab") === panelId;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.id === panelId;
      p.classList.toggle("on", on);
      if (on) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
    });
    return true;
  }

  var tabBlocks = document.querySelectorAll("[data-tabs]");
  tabBlocks.forEach(function (tabsEl) {
    var btns = Array.prototype.slice.call(tabsEl.querySelectorAll(".tab-btn"));
    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        activate(tabsEl, btn.getAttribute("data-tab"));
      });
      btn.addEventListener("keydown", function (ev) {
        var j = null;
        if (ev.key === "ArrowRight") j = (i + 1) % btns.length;
        if (ev.key === "ArrowLeft") j = (i - 1 + btns.length) % btns.length;
        if (j !== null) {
          ev.preventDefault();
          btns[j].focus();
          activate(tabsEl, btns[j].getAttribute("data-tab"));
        }
      });
    });
  });

  function activateFromHash() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var id = hash.slice(1);
    var target = document.getElementById(id);
    tabBlocks.forEach(function (tabsEl) {
      // Hash names a panel directly.
      if (tabsEl.querySelector('.tab-panel[id="' + id + '"]')) {
        activate(tabsEl, id);
        return;
      }
      // Hash names an element inside a panel (e.g. #website-accounts).
      if (target) {
        var panel = target.closest ? target.closest(".tab-panel") : null;
        if (panel && tabsEl.contains(panel)) activate(tabsEl, panel.id);
      }
    });
  }
  activateFromHash();
  window.addEventListener("hashchange", activateFromHash);
})();
