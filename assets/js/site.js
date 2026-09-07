// The only JavaScript this site ships: the mobile navigation toggle.
(function () {
  var nav = document.querySelector("[data-nav]");
  var toggle = nav && nav.querySelector("[data-nav-toggle]");

  if (!nav || !toggle) return;

  var mobile = window.matchMedia("(max-width: 700px)");

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", function (event) {
    if (mobile.matches && !nav.contains(event.target)) setOpen(false);
  });

  mobile.addEventListener("change", function () {
    if (!mobile.matches) setOpen(false);
  });
})();

// 404: return to where the visitor came from, or home.
(function () {
  var back = document.querySelector("[data-go-back]");

  if (!back) return;

  back.addEventListener("click", function () {
    var referrer = document.referrer;

    if (referrer) {
      try {
        var previous = new URL(referrer);

        if (
          previous.origin === window.location.origin &&
          previous.pathname !== window.location.pathname
        ) {
          window.location.assign(previous.pathname + previous.search + previous.hash);
          return;
        }
      } catch (error) {
        // Malformed referrer: fall through to history, then home.
      }
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  });
})();
