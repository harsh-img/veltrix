const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Footer year
const yearEl = qs("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Header elevate on scroll
const header = qs("[data-elevate]");
const setElevated = () => {
  if (!header) return;
  header.dataset.elevated = window.scrollY > 8 ? "true" : "false";
};
setElevated();
window.addEventListener("scroll", setElevated, { passive: true });

// Mobile nav
const navToggle = qs(".nav__toggle");
const navMenu = qs(".nav__menu");
const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
};
const openMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "true");
  navMenu.classList.add("is-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  qsa("a", navMenu).forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeMenu();
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });
}

// Reveal on view
const revealEls = qsa("[data-reveal]");
const reveal = (el) => el.classList.add("is-visible");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach(reveal);
}

// FAQ accordion (any page)
qsa("[data-acc]").forEach((acc) => {
  const btn = qs("[data-acc-btn]", acc);
  const panel = qs("[data-acc-panel]", acc);
  if (!btn || !panel) return;

  const setOpen = (open) => {
    acc.dataset.open = open ? "true" : "false";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";
  };

  // initial state
  const initiallyOpen = acc.dataset.open === "true";
  setOpen(initiallyOpen);

  btn.addEventListener("click", () => {
    const open = acc.dataset.open === "true";
    setOpen(!open);
  });

  window.addEventListener(
    "resize",
    () => {
      if (acc.dataset.open === "true") panel.style.maxHeight = `${panel.scrollHeight}px`;
    },
    { passive: true }
  );
});

// Simple tilt effect for the hero card
const tilt = qs("[data-tilt]");
if (tilt && window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const onMove = (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = clamp((0.5 - y) * 10, -8, 8);
    const ry = clamp((x - 0.5) * 12, -10, 10);
    tilt.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  };
  const reset = () => {
    tilt.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  tilt.addEventListener("mousemove", onMove);
  tilt.addEventListener("mouseleave", reset);
  tilt.addEventListener("blur", reset);
}

// Contact form -> mailto (demo)
const form = qs("#leadForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const subject = encodeURIComponent("Project enquiry — Veltrix Tech");
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone/WhatsApp: ${phone}`,
        email ? `Email: ${email}` : null,
        "",
        "Requirement:",
        message,
      ]
        .filter(Boolean)
        .join("\n")
    );

    // Replace with your business email anytime
    const to = "hello@veltrix.tech";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
}

