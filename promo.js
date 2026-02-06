(() => {
  const DEFAULTS = {
    productsUrl: "/promo/products.json",
    cssUrl: "/promo/promo.css",
    rotationMs: 5000,
  };

  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function loadCssOnce(href) {
    const exists = document.querySelector(`link[data-sg-promo-css="1"][href="${href}"]`);
    if (exists) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-sg-promo-css", "1");
    document.head.appendChild(link);
  }

  function safeText(v, fallback = "") {
    return typeof v === "string" && v.trim().length ? v.trim() : fallback;
  }

  function isMicrosoftStoreUrl(url) {
    return typeof url === "string" && url.includes("apps.microsoft.com");
  }

  function ctaFor(url, fallback) {
    if (isMicrosoftStoreUrl(url)) return "Öppna i Microsoft Store";
    return safeText(fallback, "Köp");
  }

  function normalizeUrl(url) {
    // Allow absolute urls and site-relative urls
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  }

  function createEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function render(container, items, activeIndex) {
    const p = items[activeIndex];

    const title = safeText(p.title, "Produkt");
    const subtitle = safeText(p.subtitle, "");
    const price = safeText(p.price, "");
    const url = safeText(p.url, "#");
    const image = normalizeUrl(safeText(p.image, ""));
    const badge = safeText(p.badge, "");
    const cta = ctaFor(url, p.cta);

    container.innerHTML = "";

    const root = createEl("div", "sg-promo");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Reklamruta: fler produkter");

    const link = createEl("a", "sg-promo__link");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${title}. ${cta}`);

    const imgWrap = createEl("div", "sg-promo__img");

    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = title;
    img.src = image;
    img.onerror = () => {
      imgWrap.innerHTML = "";
      const ph = createEl("div", "");
      ph.style.width = "100%";
      ph.style.height = "100%";
      ph.style.display = "flex";
      ph.style.alignItems = "center";
      ph.style.justifyContent = "center";
      ph.style.fontSize = "10px";
      ph.style.opacity = "0.7";
      ph.textContent = "Bild saknas";
      imgWrap.appendChild(ph);
    };
    imgWrap.appendChild(img);

    const meta = createEl("div", "sg-promo__meta");

    const top = createEl("div", "sg-promo__top");
    if (badge) {
      const b = createEl("span", "sg-promo__badge");
      b.textContent = badge;
      top.appendChild(b);
    }
    const h = createEl("p", "sg-promo__title");
    h.textContent = title;
    top.appendChild(h);

    meta.appendChild(top);

    if (price) {
      const pr = createEl("p", "sg-promo__price");
      pr.textContent = price;
      meta.appendChild(pr);
    }

    if (subtitle) {
      const sub = createEl("p", "sg-promo__subtitle");
      sub.textContent = subtitle;
      meta.appendChild(sub);
    }

    const btn = createEl("span", "sg-promo__cta");
    btn.textContent = cta;
    meta.appendChild(btn);

    link.appendChild(imgWrap);
    link.appendChild(meta);
    root.appendChild(link);

    const text = createEl("p", "sg-promo__text");
    text.textContent =
      "Om du är intresserad av analoga spel eller enkla verktyg för skolan och småföretag, hittar du mer på Summagon.se.";
    root.appendChild(text);

    const dots = createEl("div", "sg-promo__dots");
    dots.setAttribute("aria-hidden", "true");
    items.forEach((_, i) => {
      const d = createEl("span", "sg-promo__dot" + (i === activeIndex ? " is-active" : ""));
      dots.appendChild(d);
    });
    root.appendChild(dots);

    container.appendChild(root);
    return root;
  }

  async function loadProducts(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load products.json");
    const data = await res.json();

    const products = Array.isArray(data.products) ? data.products : [];
    const rotationMs = Number.isFinite(data.rotationMs) ? data.rotationMs : DEFAULTS.rotationMs;

    const clean = products
      .filter((p) => p && typeof p === "object")
      .map((p) => ({
        id: p.id ?? "",
        title: p.title ?? "",
        subtitle: p.subtitle ?? "",
        price: p.price ?? "",
        cta: p.cta ?? "",
        url: p.url ?? "",
        image: p.image ?? "",
        badge: p.badge ?? "",
      }))
      .filter((p) => typeof p.url === "string" && p.url.startsWith("http"));

    return { clean, rotationMs };
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  async function initOne(container) {
    const productsUrl = container.getAttribute("data-products-url") || DEFAULTS.productsUrl;

    const rotationAttr = container.getAttribute("data-rotation-ms");
    const forcedRotation = rotationAttr ? parseInt(rotationAttr, 10) : null;

    loadCssOnce(DEFAULTS.cssUrl);

    le
