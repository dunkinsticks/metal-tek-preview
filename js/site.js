// Page behavior for metaltekonline.com: the small-screen menu and the spec table's detail toggle.
// Without JavaScript, the menu links stay hidden on small screens (the quote button still shows)
// and the spec table shows every column.

(function () {
  // ---- Menu (shown below 1000px wide) ----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");

  if (toggle && links) {
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (document.body.classList.contains("menu-open") && !event.target.closest(".site-header")) setOpen(false);
    });
  }

  // ---- Spec table: capacities always visible, tolerances and machines on request ----
  var specWrap = document.getElementById("spec-wrap");
  var specToggle = specWrap && specWrap.querySelector(".spec-toggle");

  if (specWrap && specToggle) {
    function setDetail(open) {
      specWrap.classList.toggle("is-collapsed", !open);
      specToggle.setAttribute("aria-expanded", open ? "true" : "false");
      specToggle.textContent = open ? "Hide tolerances and machines" : "Show tolerances and machines";
    }

    specToggle.hidden = false;
    setDetail(false);

    specToggle.addEventListener("click", function () {
      setDetail(specToggle.getAttribute("aria-expanded") !== "true");
    });
  }
})();
