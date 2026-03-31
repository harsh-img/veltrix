const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Update this to your WhatsApp number (countrycode+number, digits only)
// Example India: "919876543210"
const VELTRIX_WHATSAPP = "919999999999";

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

// Floating WhatsApp button + mini chatbot (all pages)
(() => {
  const dock = document.createElement("div");
  dock.className = "floatDock";

  const wa = document.createElement("a");
  wa.className = "fab fab--wa";
  wa.href = `https://wa.me/${VELTRIX_WHATSAPP}?text=${encodeURIComponent("Hi Veltrix Tech, I want to discuss a project.")}`;
  wa.target = "_blank";
  wa.rel = "noreferrer";
  wa.setAttribute("aria-label", "Chat on WhatsApp");
  wa.innerHTML = `<span class="fab__icon" aria-hidden="true">✆</span>`;

  const botBtn = document.createElement("button");
  botBtn.className = "fab fab--bot";
  botBtn.type = "button";
  botBtn.setAttribute("aria-label", "Open chatbot");
  botBtn.innerHTML = `<span class="fab__icon" aria-hidden="true">◉</span>`;

  const widget = document.createElement("section");
  widget.className = "chatWidget";
  widget.setAttribute("aria-label", "Veltrix chatbot");
  widget.innerHTML = `
    <div class="chatWidget__head">
      <div class="chatWidget__title">
        <strong>Veltrix Assistant</strong>
        <span>Quick answers • Project help</span>
      </div>
      <button class="chatWidget__close" type="button" aria-label="Close chatbot">✕</button>
    </div>
    <div class="chatWidget__msgs" data-chat-msgs></div>
    <div class="chatWidget__quick">
      <button class="qBtn" type="button" data-q="services">Services</button>
      <button class="qBtn" type="button" data-q="stack">Tech stack</button>
      <button class="qBtn" type="button" data-q="price">Pricing</button>
      <button class="qBtn" type="button" data-q="timeline">Timeline</button>
      <button class="qBtn" type="button" data-q="contact">Contact</button>
    </div>
    <form class="chatWidget__form" data-chat-form>
      <input class="chatWidget__input" name="msg" placeholder="Type your message…" autocomplete="off" />
      <button class="chatWidget__send" type="submit" aria-label="Send message">➤</button>
    </form>
  `;

  document.body.appendChild(widget);
  dock.appendChild(botBtn);
  dock.appendChild(wa);
  document.body.appendChild(dock);

  const msgs = widget.querySelector("[data-chat-msgs]");
  const formEl = widget.querySelector("[data-chat-form]");
  const input = widget.querySelector("input[name='msg']");
  const close = widget.querySelector(".chatWidget__close");

  const add = (text, me = false) => {
    const div = document.createElement("div");
    div.className = `msg ${me ? "msg--me" : ""}`.trim();
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  };

  const reply = (keyOrText) => {
    const t = String(keyOrText || "").toLowerCase();
    if (t.includes("service")) {
      return "We build Websites/Web Apps, AI Chatbots, Mobile Apps, Custom Software, Ecommerce and Multi‑vendor systems.";
    }
    if (t.includes("stack") || t.includes("technology") || t.includes("tech")) {
      return "Stack: PHP/Laravel, Node.js/Express, JS, MongoDB/MySQL, Next.js/React, Python/Django, React Native, Flutter.";
    }
    if (t.includes("price") || t.includes("cost") || t.includes("budget")) {
      return "Pricing depends on scope, UI, integrations, and timeline. Share your requirement and we’ll send a clear estimate + milestones.";
    }
    if (t.includes("timeline") || t.includes("time") || t.includes("days")) {
      return "Typical: landing page 3–7 days, website 1–3 weeks, ecommerce/dashboard 3–6 weeks, mobile app 4–10 weeks (scope dependent).";
    }
    if (t.includes("contact") || t.includes("whatsapp") || t.includes("call")) {
      return "You can message us on WhatsApp (button below) or use the Contact page to send an enquiry.";
    }
    return "Got it. Tell me what you want to build (Website / AI chatbot / App / Ecommerce / Multi‑vendor) and your timeline.";
  };

  const open = () => {
    widget.classList.add("is-open");
    botBtn.setAttribute("aria-label", "Close chatbot");
    input?.focus();
  };
  const closeWidget = () => {
    widget.classList.remove("is-open");
    botBtn.setAttribute("aria-label", "Open chatbot");
  };

  // initial greeting
  add("Hi! I’m Veltrix Assistant. How can we help you today?");

  botBtn.addEventListener("click", () => {
    widget.classList.contains("is-open") ? closeWidget() : open();
  });
  close.addEventListener("click", closeWidget);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWidget();
  });

  widget.querySelectorAll("[data-q]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-q");
      add(btn.textContent || "Question", true);
      add(reply(String(key || "")));
    });
  });

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = String(input.value || "").trim();
    if (!text) return;
    add(text, true);
    input.value = "";
    window.setTimeout(() => add(reply(text)), 250);
  });
})();

