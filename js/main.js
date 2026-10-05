/* ==========================================================================
   PawPal - vanilla JS interactions
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });

    // Collapsible sub-groups inside mobile nav
    var subToggles = nav.querySelectorAll(".m-toggle");
    subToggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = btn.parentElement.querySelector(".m-sub");
        if (!sub) return;
        var open = sub.classList.toggle("is-open");
        btn.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    // Close on link click
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active navigation ---------- */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "") path = "index.html";
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var targets = link.getAttribute("data-nav").split(",");
      if (targets.indexOf(path) !== -1) {
        link.classList.add("is-active");
      }
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (i) { obs.observe(i); });
  }

  /* ---------- Accordion (FAQ) ---------- */
  function initAccordion() {
    document.querySelectorAll(".accordion").forEach(function (acc) {
      var items = acc.querySelectorAll(".acc-item");
      items.forEach(function (item) {
        var trigger = item.querySelector(".acc-trigger");
        var panel = item.querySelector(".acc-panel");
        if (!trigger || !panel) return;
        trigger.addEventListener("click", function () {
          var isOpen = item.classList.contains("is-open");
          // close others in same accordion
          items.forEach(function (other) {
            other.classList.remove("is-open");
            var p = other.querySelector(".acc-panel");
            var t = other.querySelector(".acc-trigger");
            if (p) p.style.maxHeight = null;
            if (t) t.setAttribute("aria-expanded", "false");
          });
          if (!isOpen) {
            item.classList.add("is-open");
            panel.style.maxHeight = panel.scrollHeight + "px";
            trigger.setAttribute("aria-expanded", "true");
          }
        });
      });
    });
  }

  /* ---------- Pet selection (tabs that swap content) ---------- */
  function initPetSelect() {
    document.querySelectorAll("[data-select-group]").forEach(function (group) {
      var buttons = group.querySelectorAll("[data-select]");
      var name = group.getAttribute("data-select-group");
      var panels = document.querySelectorAll('[data-panel-group="' + name + '"]');
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-select");
          buttons.forEach(function (b) {
            b.classList.toggle("is-selected", b === btn);
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          panels.forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
            p.hidden = p.getAttribute("data-panel") !== key;
          });
        });
      });
    });
  }

  /* ---------- Checklist with progress ---------- */
  function initChecklists() {
    document.querySelectorAll("[data-checklist]").forEach(function (list) {
      var items = list.querySelectorAll(".check-item");
      var wrap = list.closest("[data-checklist-wrap]") || document;
      var bar = wrap.querySelector("[data-checklist-bar]");
      var label = wrap.querySelector("[data-checklist-count]");

      function update() {
        var total = items.length;
        var done = list.querySelectorAll(".check-item.is-checked").length;
        var pct = total ? Math.round((done / total) * 100) : 0;
        if (bar) bar.style.width = pct + "%";
        if (label) label.textContent = done + " of " + total + " complete";
      }

      items.forEach(function (item) {
        item.setAttribute("role", "checkbox");
        item.setAttribute("aria-checked", "false");
        item.setAttribute("tabindex", "0");
        function toggle() {
          var checked = item.classList.toggle("is-checked");
          item.setAttribute("aria-checked", checked ? "true" : "false");
          update();
        }
        item.addEventListener("click", toggle);
        item.addEventListener("keydown", function (e) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        });
      });
      update();
    });
  }

  /* ---------- Routine selector ---------- */
  function initRoutine() {
    var group = document.querySelector("[data-routine-group]");
    if (!group) return;
    var buttons = group.querySelectorAll("[data-routine]");
    var panels = document.querySelectorAll("[data-routine-panel]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-routine");
        buttons.forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        panels.forEach(function (p) {
          var match = p.getAttribute("data-routine-panel") === key;
          p.classList.toggle("is-active", match);
          p.hidden = !match;
        });
      });
    });
  }

  /* ---------- Multi-step wizard (Pet Plan) ---------- */
  function initWizard() {
    var wizard = document.querySelector("[data-wizard]");
    if (!wizard) return;

    var panels = Array.prototype.slice.call(wizard.querySelectorAll(".wpanel"));
    var stepEls = Array.prototype.slice.call(wizard.querySelectorAll(".wstep"));
    var result = wizard.querySelector(".wizard-result");
    var actions = wizard.querySelector(".wizard-actions");
    var backBtn = wizard.querySelector("[data-w-back]");
    var nextBtn = wizard.querySelector("[data-w-next]");
    var restartBtn = wizard.querySelector("[data-w-restart]");
    var current = 0;
    var answers = {};

    function render() {
      panels.forEach(function (p, i) {
        p.classList.toggle("is-active", i === current);
      });
      stepEls.forEach(function (s, i) {
        s.classList.toggle("is-active", i === current);
        s.classList.toggle("is-done", i < current);
      });
      if (backBtn) backBtn.style.visibility = current === 0 ? "hidden" : "visible";
      if (nextBtn) nextBtn.textContent = current === panels.length - 1 ? "See my plan" : "Continue";
    }

    // option selection within each panel
    panels.forEach(function (panel) {
      var key = panel.getAttribute("data-step-key");
      panel.querySelectorAll(".option").forEach(function (opt) {
        opt.addEventListener("click", function () {
          panel.querySelectorAll(".option").forEach(function (o) {
            o.classList.toggle("is-selected", o === opt);
          });
          answers[key] = {
            value: opt.getAttribute("data-value"),
            label: opt.querySelector("strong") ? opt.querySelector("strong").textContent : opt.getAttribute("data-value"),
          };
        });
      });
    });

    function buildResult() {
      var pet = answers.pet ? answers.pet.label : "your pet";
      var summary = wizard.querySelector("[data-result-summary]");
      if (summary) {
        summary.textContent =
          "A personalized starter plan for your " +
          (answers.pet ? answers.pet.label.toLowerCase() : "companion") +
          " based on " +
          (answers.experience ? answers.experience.label.toLowerCase() : "your") +
          " experience and a " +
          (answers.home ? answers.home.label.toLowerCase() : "flexible") +
          " home.";
      }
      var rows = wizard.querySelector("[data-result-rows]");
      if (rows) {
        var recs = [
          { ico: "\uD83C\uDF7D\uFE0F", h: "Feeding", p: "Measured portions twice daily with fresh water always available. Review our feeding guide for " + pet.toLowerCase() + "-specific amounts." },
          { ico: "\uD83E\uDDFC", h: "Grooming", p: (answers.time && answers.time.value === "low" ? "A quick weekly" : "A regular") + " grooming session keeps coat, nails, and skin healthy." },
          { ico: "\uD83C\uDFC3", h: "Exercise & play", p: "Daily activity blocks scaled to energy level, plus enrichment to prevent boredom." },
          { ico: "\uD83D\uDCDA", h: "Training", p: (answers.experience && answers.experience.value === "new" ? "Start with foundation basics and short, positive sessions." : "Layer in advanced cues and consistency across the household.") },
        ];
        rows.innerHTML = recs.map(function (r) {
          return '<div class="plan-row"><div class="pico">' + r.ico + '</div><div><h4>' + r.h + "</h4><p>" + r.p + "</p></div></div>";
        }).join("");
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var key = panels[current].getAttribute("data-step-key");
        if (!answers[key]) {
          panels[current].classList.add("shake");
          setTimeout(function () { panels[current].classList.remove("shake"); }, 500);
          var hint = panels[current].querySelector("[data-step-hint]");
          if (hint) hint.style.color = "#b4462f";
          return;
        }
        if (current < panels.length - 1) {
          current++;
          render();
        } else {
          buildResult();
          panels.forEach(function (p) { p.classList.remove("is-active"); });
          if (actions) actions.style.display = "none";
          stepEls.forEach(function (s) { s.classList.add("is-done"); });
          if (result) result.classList.add("is-active");
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (current > 0) { current--; render(); }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        answers = {};
        current = 0;
        wizard.querySelectorAll(".option").forEach(function (o) { o.classList.remove("is-selected"); });
        if (result) result.classList.remove("is-active");
        if (actions) actions.style.display = "flex";
        render();
      });
    }

    render();
  }

  /* ---------- Form validation ---------- */
  function initForms() {
    document.querySelectorAll("[data-validate]").forEach(function (form) {
      var note = form.querySelector(".form-note");

      function validateField(field) {
        var wrap = field.closest(".form-field");
        if (!wrap) return true;
        var val = field.value.trim();
        var ok = true;
        if (field.hasAttribute("required") && !val) ok = false;
        if (ok && field.type === "email" && val) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        if (ok && field.getAttribute("minlength")) {
          ok = val.length >= parseInt(field.getAttribute("minlength"), 10);
        }
        wrap.classList.toggle("has-error", !ok);
        return ok;
      }

      form.querySelectorAll("input, textarea, select").forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
          if (field.closest(".form-field").classList.contains("has-error")) validateField(field);
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var allOk = true;
        var firstBad = null;
        form.querySelectorAll("input, textarea, select").forEach(function (field) {
          var ok = validateField(field);
          if (!ok && !firstBad) firstBad = field;
          if (!ok) allOk = false;
        });
        if (!allOk) {
          if (firstBad) firstBad.focus();
          return;
        }
        if (note) {
          note.classList.add("is-visible");
        }
        form.reset();
        setTimeout(function () {
          if (note) note.classList.remove("is-visible");
        }, 6000);
      });
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      a.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });
  }

  /* ---------- Inject shared header/footer partials ---------- */
  function initAll() {
    initMobileMenu();
    initActiveNav();
    initYear();
    initReveal();
    initAccordion();
    initPetSelect();
    initChecklists();
    initRoutine();
    initWizard();
    initForms();
    initSmoothScroll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAll();
  });
})();
