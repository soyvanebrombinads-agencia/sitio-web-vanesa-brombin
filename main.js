(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var burger = $(".navburger");
    var menu = $(".mobilemenu");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Mouse-reactive hero gradient ---------- */
  function initHeroGradient() {
    var heroes = $$(".hero, .hero-split");
    if (!heroes.length) return;
    if (!fineHover) return; // touch: keep the static CSS default (--mx/--my initial values)
    heroes.forEach(function (hero) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        hero.style.setProperty("--mx", x + "%");
        hero.style.setProperty("--my", y + "%");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // mandatory safety net
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------- Count-up ---------- */
  function animateCount(el) {
    var target = el.getAttribute("data-count-to");
    var suffix = el.getAttribute("data-count-suffix") || "";
    var prefix = el.getAttribute("data-count-prefix") || "";
    var num = parseFloat(String(target).replace(",", "."));
    if (isNaN(num)) return;
    var decimals = (String(target).split(".")[1] || "").length;
    var dur = reduced ? 1 : 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (num * eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Tilt ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach(function (card) {
      var raf = null;
      card.addEventListener("mouseover", function (e) {
        if (!card.contains(e.relatedTarget)) card.style.transition = "none";
      });
      card.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(900px) rotateX(" + (-py * 6) + "deg) rotateY(" + (px * 6) + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.style.transition = "transform .4s " + "cubic-bezier(.16,1,.3,1)";
          card.style.transform = "";
        }
      });
    });
  }

  /* ---------- Team split carousel ---------- */
  function initTeamCarousel() {
    $$("[data-team-slider]").forEach(function (slider) {
      var scope = slider.parentElement;
      var slides = $$("[data-team-slide]", slider);
      var dots = $$("[data-team-dots] button", scope);
      var thumbs = $$("[data-team-thumbs] button", scope);
      if (!slides.length) return;
      var idx = 0;
      var timer = null;

      function show(i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach(function (s, n) { s.classList.toggle("is-active", n === idx); });
        dots.forEach(function (d, n) { d.classList.toggle("is-active", n === idx); });
        thumbs.forEach(function (t, n) { t.classList.toggle("is-active", n === idx); });
      }
      function restart() {
        if (timer) clearInterval(timer);
        if (!reduced) timer = setInterval(function () { show(idx + 1); }, 5000);
      }

      var prevBtn = $("[data-team-prev]", slider);
      var nextBtn = $("[data-team-next]", slider);
      if (prevBtn) prevBtn.addEventListener("click", function () { show(idx - 1); restart(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { show(idx + 1); restart(); });
      dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); restart(); }); });
      thumbs.forEach(function (t, n) { t.addEventListener("click", function () { show(n); restart(); }); });

      show(0);
      restart();
    });
  }

  /* ---------- Proof carousel: cycle which testimonial is featured ---------- */
  function initProofCarousel() {
    $$("[data-proof-carousel]").forEach(function (root) {
      var cards = $$("[data-proof-card]", root);
      var dots = $$("[data-proof-dots] button", root);
      if (!cards.length) return;
      var idx = cards.findIndex(function (c) { return c.classList.contains("is-featured"); });
      if (idx < 0) idx = 0;

      function show(i) {
        idx = (i + cards.length) % cards.length;
        cards.forEach(function (card, n) {
          var featured = n === idx;
          card.classList.toggle("is-featured", featured);
          var badge = $(".proof-badge", card);
          if (badge) badge.textContent = featured ? "Caso destacado" : badge.getAttribute("data-category");
        });
        dots.forEach(function (d, n) { d.classList.toggle("is-active", n === idx); });
      }

      var prevBtn = $("[data-proof-prev]", root);
      var nextBtn = $("[data-proof-next]", root);
      if (prevBtn) prevBtn.addEventListener("click", function () { show(idx - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { show(idx + 1); });
      dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); }); });

      show(idx);
    });
  }

  /* ---------- Click-to-load YouTube embed ---------- */
  function initVideoEmbeds() {
    $$("[data-video-embed]").forEach(function (wrap) {
      var play = $(".video-play", wrap);
      if (!play) return;
      play.addEventListener("click", function () {
        var id = wrap.getAttribute("data-video-id");
        if (!id) return;
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
        iframe.title = "YouTube video player";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        wrap.appendChild(iframe);
        wrap.classList.add("is-playing");
      });
    });
  }

  /* ---------- Marquee: duplicate content for seamless loop ---------- */
  function initMarquee() {
    $$("[data-marquee]").forEach(function (track) {
      if (track.dataset.marqueeBound) return;
      track.dataset.marqueeBound = "1";
      track.innerHTML += track.innerHTML;
    });
  }

  /* ---------- Smooth anchor scroll (native) ---------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Contact form: no real backend, just a friendly confirmation ---------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var note = $("[data-form-note]", form);
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.getAttribute("action") || "contact.php", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!note) return;
          if (data && data.ok) {
            note.style.color = "var(--green)";
            note.textContent = "¡Gracias! Te vamos a escribir a la brevedad.";
            form.reset();
          } else {
            note.style.color = "#c0392b";
            note.textContent = "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp.";
          }
          note.hidden = false;
        })
        .catch(function () {
          if (note) {
            note.style.color = "#c0392b";
            note.textContent = "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp.";
            note.hidden = false;
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initHeroGradient, "initHeroGradient");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initTilt, "initTilt");
    safe(initTeamCarousel, "initTeamCarousel");
    safe(initProofCarousel, "initProofCarousel");
    safe(initVideoEmbeds, "initVideoEmbeds");
    safe(initMarquee, "initMarquee");
    safe(initAnchors, "initAnchors");
    safe(initContactForm, "initContactForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
