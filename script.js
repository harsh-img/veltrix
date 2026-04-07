const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Update this to your WhatsApp number (countrycode+number, digits only)
// Example India: "919876543210"
const VERNAFIXY_WHATSAPP = "919999999999";

const waChatUrl = `https://wa.me/${VERNAFIXY_WHATSAPP}?text=${encodeURIComponent("Hi Vernaxify Tech, I want to discuss a project.")}`;
qsa("[data-wa-link]").forEach((a) => {
  a.href = waChatUrl;
});

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
const closeNavDrops = () => {
  qsa("[data-nav-drop].is-open").forEach((d) => {
    d.classList.remove("is-open");
    const hit = qs(".navDrop__hit", d);
    const expand = qs(".navDrop__expand", d);
    if (hit) hit.setAttribute("aria-expanded", "false");
    if (expand) expand.setAttribute("aria-expanded", "false");
  });
};
const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  closeNavDrops();
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

// Mega menus (desktop hover + mobile expand)
(() => {
  const drops = qsa("[data-nav-drop]");
  if (!drops.length) return;

  let hoverCloseTimer = null;
  const isDesk = () => window.matchMedia("(min-width: 721px)").matches;
  const isFineHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setDropOpen = (drop, open) => {
    drop.classList.toggle("is-open", open);
    const hit = qs(".navDrop__hit", drop);
    const expand = qs(".navDrop__expand", drop);
    if (hit) hit.setAttribute("aria-expanded", open ? "true" : "false");
    if (expand) expand.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const closeAll = (except) => {
    drops.forEach((d) => {
      if (except && d === except) return;
      setDropOpen(d, false);
    });
  };

  drops.forEach((drop) => {
    const expand = qs(".navDrop__expand", drop);

    if (expand) {
      expand.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = drop.classList.contains("is-open");
        closeAll();
        setDropOpen(drop, !open);
      });
    }

    drop.addEventListener("mouseenter", () => {
      if (!isDesk() || !isFineHover()) return;
      if (hoverCloseTimer) window.clearTimeout(hoverCloseTimer);
      closeAll(drop);
      setDropOpen(drop, true);
    });

    drop.addEventListener("mouseleave", () => {
      if (!isDesk() || !isFineHover()) return;
      hoverCloseTimer = window.setTimeout(() => setDropOpen(drop, false), 160);
    });
  });

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeAll();
    },
    { passive: true }
  );

  document.addEventListener("click", (e) => {
    if (!isDesk()) return;
    const t = e.target;
    if (t.closest && t.closest("[data-nav-drop]")) return;
    closeAll();
  });

  window.addEventListener(
    "resize",
    () => {
      if (isDesk()) closeAll();
    },
    { passive: true }
  );
})();

// Reveal on view
const revealEls = qsa("[data-reveal]");
const reveal = (el) => el.classList.add("is-visible");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // If GSAP is available, use a nicer entrance animation.
        if (window.gsap) {
          window.gsap.fromTo(
            entry.target,
            { y: 20, opacity: 0, scale: 0.99 },
            { y: 0, opacity: 1, scale: 1, duration: 0.78, ease: "power3.out" }
          );
          entry.target.classList.add("is-visible");
        } else {
          reveal(entry.target);
        }
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
    // Click acts like a "pin": user intent beats hover.
    acc.dataset.pinned = open ? "false" : "true";
    setOpen(!open);
  });

  // Hover open/close on desktop for smoother browsing (still accessible with click).
  const canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover) {
    acc.addEventListener("mouseenter", () => {
      if (acc.dataset.pinned === "true") return;
      setOpen(true);
    });
    acc.addEventListener("mouseleave", () => {
      if (acc.dataset.pinned === "true") return;
      setOpen(false);
    });
  }

  window.addEventListener(
    "resize",
    () => {
      if (acc.dataset.open === "true") panel.style.maxHeight = `${panel.scrollHeight}px`;
    },
    { passive: true }
  );
});

// GSAP: nav, hero, scroll, marquee (site-wide where loaded)
(() => {
  if (!window.gsap) return;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (ST && gsap.registerPlugin) gsap.registerPlugin(ST);

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  navTl
    .from(".brand__logo--nav", { y: -10, opacity: 0, duration: 0.6 })
    .from(".header__top > *", { y: -8, opacity: 0, duration: 0.4, stagger: 0.06 }, "-=0.45")
    .from(".nav__menu > *", { y: -8, opacity: 0, duration: 0.45, stagger: 0.04 }, "-=0.32");

  if (!reduceMotion) {
    gsap.to(".bg__glow", { opacity: 0.78, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  const stage = qs("[data-brand-stage]");
  if (stage && !reduceMotion) {
    const rings = qsa("[data-brand-ring]", stage);
    const dots = qsa("[data-brand-particle]", stage);
    const card = qs("[data-brand-card]", stage);

    gsap.set(rings, { scale: 0.68, opacity: 0 });
    gsap.set(dots, { scale: 0, opacity: 0 });
    if (card) gsap.set(card, { y: 52, opacity: 0, scale: 0.88 });

    const heroIntro = gsap.timeline({ delay: 0.12 });
    heroIntro
      .to(rings, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.14, ease: "power2.out" })
      .to(card, { y: 0, opacity: 1, scale: 1, duration: 0.95, ease: "back.out(1.25)" }, "-=0.58")
      .to(dots, { scale: 1, opacity: 0.92, duration: 0.45, stagger: 0.07 }, "-=0.5");

    heroIntro.eventCallback("onComplete", () => {
      rings.forEach((ring, i) => {
        gsap.to(ring, {
          scale: 1.045,
          duration: 2.6 + i * 0.45,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
      dots.forEach((dot, i) => {
        gsap.to(dot, {
          y: `+=${8 + (i % 4) * 5}`,
          x: `+=${(i % 2 === 0 ? -1 : 1) * (6 + i)}`,
          duration: 2.4 + i * 0.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    });

    gsap.to(stage, { y: -10, duration: 4.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  const mq = qs(".marquee__track");
  if (mq && !reduceMotion) {
    let mqTries = 0;
    const startMarquee = () => {
      mqTries += 1;
      const half = mq.scrollWidth / 2;
      if ((!half || half < 40) && mqTries < 90) {
        window.requestAnimationFrame(startMarquee);
        return;
      }
      if (!half || half < 40) return;
      mq.classList.add("is-gsap");
      gsap.to(mq, {
        x: -half,
        duration: Math.max(22, half / 52),
        ease: "none",
        repeat: -1,
      });
    };
    if (document.readyState === "complete") startMarquee();
    else window.addEventListener("load", startMarquee, { once: true });
  }

  if (ST && !reduceMotion) {
    gsap.to(".bg__glow--a", {
      ease: "none",
      y: 100,
      scrollTrigger: { scrub: 1.05, start: "top top", end: "max max" },
    });
    gsap.to(".bg__glow--b", {
      ease: "none",
      y: -80,
      scrollTrigger: { scrub: 1.05, start: "top top", end: "max max" },
    });

    const footCols = qsa(".footer__cols > div");
    if (footCols.length) {
      gsap.from(footCols, {
        scrollTrigger: { trigger: ".footer", start: "top 90%", once: true },
        y: 32,
        opacity: 0,
        duration: 0.72,
        stagger: 0.11,
        ease: "power3.out",
      });
    }

  }

  const stackCards = qsa("[data-stack-card]");
  if (stackCards.length && ST && !reduceMotion) {
    gsap.set(stackCards, { opacity: 0, y: 32 });
    ST.batch(stackCards, {
      start: "top 88%",
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.14, ease: "power3.out", overwrite: true });
      },
      once: true,
    });
  }

  if (ST) window.addEventListener("load", () => ST.refresh(), { once: true });
})();

// Simple tilt effect for the hero brand card
const tilt = qs("[data-tilt]");
if (tilt && window.matchMedia("(prefers-reduced-motion: reduce)").matches === false && !window.matchMedia("(pointer: coarse)").matches) {
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

    const subject = encodeURIComponent("Project enquiry — Vernaxify Tech");
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
    const to = "hello@vernaxify.tech";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
}

// Floating WhatsApp button + assistant chat (all pages)
(() => {
  const chatMotionOk =
    !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const dock = document.createElement("div");
  dock.className = "floatDock";

  const wa = document.createElement("a");
  wa.className = "fab fab--wa";
  wa.href = waChatUrl;
  wa.target = "_blank";
  wa.rel = "noreferrer";
  wa.setAttribute("aria-label", "Chat on WhatsApp");
  wa.innerHTML = `<span class="fab__icon" aria-hidden="true">✆</span>`;

  const botBtn = document.createElement("button");
  botBtn.className = "fab fab--bot";
  botBtn.type = "button";
  botBtn.setAttribute("aria-label", "Open assistant");
  botBtn.setAttribute("aria-expanded", "false");
  botBtn.setAttribute("aria-controls", "vernaxify-chat-widget");
  botBtn.innerHTML = `
    <svg class="fab__iconSvg" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 14H5.17L4 17.17V4h16v12z"
      />
      <path fill="currentColor" d="M7 9h10v2H7V9zm0-3h10v2H7V6zm0 6h7v2H7v-2z" opacity="0.92" />
    </svg>
  `;

  const widget = document.createElement("section");
  widget.className = "chatWidget";
  widget.id = "vernaxify-chat-widget";
  widget.setAttribute("role", "dialog");
  widget.setAttribute("aria-modal", "false");
  widget.setAttribute("aria-label", "Vernaxify assistant");
  widget.setAttribute("aria-hidden", "true");
  widget.innerHTML = `
    <div class="chatWidget__head">
      <div class="chatWidget__title">
        <strong>Vernaxify Assistant</strong>
        <span>Turning ideas into their next version</span>
      </div>
      <div class="chatWidget__headActions">
        <button class="chatWidget__clear" type="button" data-chat-clear>Clear</button>
        <button class="chatWidget__close" type="button" aria-label="Close assistant">✕</button>
      </div>
    </div>
    <div class="chatWidget__msgs" data-chat-msgs role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="chatWidget__quick">
      <span class="chatWidget__quickLabel">Quick topics</span>
      <div class="chatWidget__quickRow">
        <button class="qBtn" type="button" data-q="services">Services</button>
        <button class="qBtn" type="button" data-q="stack">Tech stack</button>
        <button class="qBtn" type="button" data-q="ai">AI &amp; automation</button>
        <button class="qBtn" type="button" data-q="price">Pricing</button>
        <button class="qBtn" type="button" data-q="timeline">Timeline</button>
        <button class="qBtn" type="button" data-q="contact">Contact / quote</button>
        <button class="qBtn" type="button" data-q="faq">FAQ</button>
      </div>
    </div>
    <form class="chatWidget__form" data-chat-form>
      <input class="chatWidget__input" name="msg" type="text" placeholder="Ask anything about our work…" autocomplete="off" maxlength="500" />
      <button class="chatWidget__send" type="submit" aria-label="Send message">
        <svg class="chatWidget__sendIcon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  `;

  document.body.appendChild(widget);
  dock.appendChild(wa);
  dock.appendChild(botBtn);
  document.body.appendChild(dock);

  const msgs = widget.querySelector("[data-chat-msgs]");
  const formEl = widget.querySelector("[data-chat-form]");
  const input = widget.querySelector("input[name='msg']");
  const close = widget.querySelector(".chatWidget__close");
  const clearBtn = widget.querySelector("[data-chat-clear]");

  const scrollMsgs = () => {
    msgs.scrollTop = msgs.scrollHeight;
  };

  const addUser = (text) => {
    const div = document.createElement("div");
    div.className = "msg msg--me";
    div.textContent = text;
    msgs.appendChild(div);
    scrollMsgs();
  };

  const addAssistant = (text, link) => {
    const div = document.createElement("div");
    div.className = "msg";
    div.setAttribute("role", "status");
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    if (link && link.href && link.label) {
      const a = document.createElement("a");
      a.className = "msg__link";
      a.href = link.href;
      a.textContent = link.label;
      div.appendChild(a);
    }
    msgs.appendChild(div);
    scrollMsgs();
  };

  let typingEl = null;
  const showTyping = () => {
    if (typingEl || !chatMotionOk) return;
    typingEl = document.createElement("div");
    typingEl.className = "msg msg--typing";
    typingEl.setAttribute("aria-hidden", "true");
    typingEl.innerHTML = `<span class="msg__typingDots" aria-hidden="true"><span></span><span></span><span></span></span>`;
    msgs.appendChild(typingEl);
    scrollMsgs();
  };

  const hideTyping = () => {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  };

  const reply = (keyOrText) => {
    const raw = String(keyOrText || "").toLowerCase();
    const t =
      typeof raw.normalize === "function" ? raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : raw;

    if (/^(hi|hello|hey|namaste|hii|hlw)\b/.test(t) || t === "hi" || t === "hello") {
      return {
        text: "Hi! I’m here to help with Vernaxify services, timelines, and how to get a quote.\n\nTry a quick topic below, or describe your project in one line.",
      };
    }
    if (t.includes("thank") || t.includes("dhanyavad") || t.includes("shukriya")) {
      return { text: "You’re welcome! If you share your goal and timeline, we can guide you to the right next step." };
    }
    if (t.includes("bye") || t.includes("goodbye")) {
      return { text: "Goodbye — we’re a message away on WhatsApp or the Contact page anytime." };
    }

    if (t.includes("service") || t.includes("what do you do") || t.includes("kaam")) {
      return {
        text:
          "We design and build:\n• Websites & web apps\n• AI chatbots & automation\n• Mobile apps (React Native / Flutter)\n• Ecommerce & multi‑vendor platforms\n• Custom dashboards & integrations",
      };
    }
    if (t.includes("stack") || t.includes("technology") || t.includes("tech") || t.includes("laravel") || t.includes("react")) {
      return {
        text:
          "Common stack: PHP/Laravel, Node.js/Express, JavaScript, MongoDB/MySQL, Next.js/React, Python/Django, React Native, Flutter.\n\nWe pick tools based on speed, budget, and how you’ll scale.",
      };
    }
    if (t.includes("ai") || t.includes("chatbot") || t.includes("automation") || t.includes("integrat")) {
      return {
        text:
          "We build AI chatbots for websites and WhatsApp-style flows, plus automation and third‑party integrations (payments, CRMs, webhooks, APIs).\n\nTell us your use case and we’ll suggest the simplest reliable setup.",
      };
    }
    if (t.includes("price") || t.includes("cost") || t.includes("budget") || t.includes("kitna") || t.includes("charge")) {
      return {
        text:
          "Cost depends on UI depth, features, integrations, and timeline. Share a short brief (what + when + budget range if any) and we’ll reply with milestones and an estimate band — no jargon.",
      };
    }
    if (t.includes("timeline") || t.includes("time") || t.includes("days") || t.includes("week") || t.includes("kitne din")) {
      return {
        text:
          "Rough guides (varies by scope):\n• Landing page: ~3–7 days\n• Website: ~1–3 weeks\n• Ecommerce / dashboard: ~3–6 weeks\n• Mobile app: ~4–10 weeks\n\nWe’ll confirm after understanding features and design needs.",
      };
    }
    if (t.includes("contact") || t.includes("whatsapp") || t.includes("call") || t.includes("quote") || t.includes("enquir")) {
      return {
        text: "Fastest: WhatsApp (green button). For a structured brief, use our Contact page — it opens your email with the details filled in.",
        link: { href: "contact.html", label: "Open Contact page →" },
      };
    }
    if (t.includes("faq") || t.includes("question")) {
      return {
        text: "We’ve listed common questions on the FAQ page (delivery, pricing approach, tech, support).",
        link: { href: "faq.html", label: "View FAQ →" },
      };
    }
    if (t.includes("website") || t.includes("web app")) {
      return {
        text:
          "For websites and web apps we focus on speed, SEO basics, clean UI, and secure backends. Mention if you need admin panels, auth, payments, or APIs — that shapes timeline and cost.",
      };
    }
    if (t.includes("app") && (t.includes("mobile") || t.includes("android") || t.includes("ios"))) {
      return {
        text:
          "We ship cross‑platform apps with React Native or Flutter: auth, push notifications, payments, and offline‑friendly patterns where needed.",
      };
    }
    if (t.includes("ecommerce") || t.includes("e-commerce") || t.includes("shop") || t.includes("store")) {
      return {
        text:
          "Ecommerce builds include catalog, cart/checkout, payments, shipping hooks, and admin tools. For marketplaces we add vendor flows, commissions, and governance.",
      };
    }

    return {
      text:
        "Thanks for your message. To help faster, mention:\n1) What you want (website / chatbot / app / shop / custom tool)\n2) Rough timeline\n3) Any must‑have integrations\n\nOr tap Contact / quote for a full brief.",
      link: { href: "contact.html", label: "Get a quote →" },
    };
  };

  const pushAssistantReply = (keyOrText, delayMs = chatMotionOk ? 420 : 0) => {
    const { text, link } = reply(keyOrText);
    const wait = chatMotionOk ? delayMs : 0;
    showTyping();
    window.setTimeout(() => {
      hideTyping();
      addAssistant(text, link);
    }, wait);
  };

  const GREETING =
    "Hi — I’m the Vernaxify assistant.\n\nAsk in your own words, or pick a quick topic. For a formal quote, use Contact or WhatsApp.";

  const open = () => {
    widget.classList.add("is-open");
    widget.setAttribute("aria-hidden", "false");
    widget.setAttribute("aria-modal", "true");
    botBtn.setAttribute("aria-expanded", "true");
    botBtn.setAttribute("aria-label", "Close assistant");
    input?.focus();
  };

  const closeWidget = () => {
    if (!widget.classList.contains("is-open")) return;
    widget.classList.remove("is-open");
    widget.setAttribute("aria-hidden", "true");
    widget.setAttribute("aria-modal", "false");
    botBtn.setAttribute("aria-expanded", "false");
    botBtn.setAttribute("aria-label", "Open assistant");
    hideTyping();
    botBtn.focus();
  };

  const resetConversation = () => {
    msgs.replaceChildren();
    hideTyping();
    addAssistant(GREETING);
    scrollMsgs();
  };

  addAssistant(GREETING);

  botBtn.addEventListener("click", () => {
    widget.classList.contains("is-open") ? closeWidget() : open();
  });
  close.addEventListener("click", closeWidget);
  clearBtn.addEventListener("click", () => resetConversation());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.classList.contains("is-open")) closeWidget();
  });

  widget.querySelectorAll("[data-q]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-q");
      const label = (btn.textContent || "").trim();
      addUser(label);
      pushAssistantReply(String(key || ""));
    });
  });

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = String(input.value || "").trim();
    if (!text) return;
    addUser(text);
    input.value = "";
    pushAssistantReply(text, 480);
  });
})();

qsa("[data-open-assistant]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const b = qs(".fab--bot");
    if (b) b.click();
  });
});

