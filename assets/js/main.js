/* ============================================
   STUDORA — MAIN JAVASCRIPT
   Handles: Services, Form, Modals, Animations
   ============================================ */

/* ─────────────────────────────────────────
   ⚠️  CONFIGURATION — EDIT THESE VALUES
   ─────────────────────────────────────────
   1. Deploy your Google Apps Script Web App
   2. Paste the Web App URL below
   3. Update WhatsApp number
   ───────────────────────────────────────── */
const CONFIG = {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyxNpzRcmY4E0EUq15A86JLBefajuw3yL7IzegqgZNLrwfZ6bhC5bkOTvveJ4SxX1XDlQ/exec",
  WHATSAPP_NUMBER:   "972567439846",   // e.g. "970591234567"
  EMAIL:             "idkrealyyea@gmail.com",
  SERVICES_JSON:     "data/services.json",
  SERVICES_PER_PAGE: 6,
};

/* ── STATE ── */
let allServices    = [];
let filteredServices = [];
let currentPage    = 1;
let currentCat     = "all";
let searchQuery    = "";
let currentService = null;

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initTheme();
  initNavbar();
  initHamburger();
  initScrollTop();
  initYear();
  initFAQ();
  initRevealAnimations();
  loadServices();
  initFormEvents();
  initModalClose();
  initWhatsAppLinks();
});

/* ══════════════════════════════════════════
   LOADER
══════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.style.overflow = "";
      initStatsCounter();
    }, 1800);
  });
  document.body.style.overflow = "hidden";
}

/* ══════════════════════════════════════════
   THEME (DARK / LIGHT)
══════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem("studora-theme") || "dark";
  applyTheme(saved);
  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("studora-theme", next);
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
}

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const links  = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);

    // Active link highlight
    let current = "";
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute("id");
    });
    links.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
    });
  });

  // Smooth close mobile menu on link click
  links.forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("navLinks").classList.remove("open");
      document.getElementById("hamburger").classList.remove("open");
    });
  });
}

function initHamburger() {
  const btn   = document.getElementById("hamburger");
  const links = document.getElementById("navLinks");
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    links.classList.toggle("open");
  });
}

/* ══════════════════════════════════════════
   SCROLL TO TOP
══════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ══════════════════════════════════════════
   YEAR
══════════════════════════════════════════ */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════
   STATS COUNTER ANIMATION
══════════════════════════════════════════ */
function initStatsCounter() {
  const counters = document.querySelectorAll(".stat-number");
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute("data-target"), 10);
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      counter.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

/* ══════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════ */
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      // Close all
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      document.querySelectorAll(".faq-question").forEach(b => b.setAttribute("aria-expanded", "false"));
      // Open clicked (if wasn't open)
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ══════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
══════════════════════════════════════════ */
function initRevealAnimations() {
  const targets = document.querySelectorAll(
    ".section-header, .service-card, .pricing-card, .testimonial-card, .faq-item, .contact-card, .apply-info, .apply-form-box"
  );
  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   LOAD SERVICES
══════════════════════════════════════════ */
async function loadServices() {
  try {
    const res  = await fetch(CONFIG.SERVICES_JSON);
    const data = await res.json();
    allServices = data.filter(s => s.active !== false);
    buildFilterTabs();
    applyFilters();
    populateServiceSelect();
  } catch (err) {
    console.error("Failed to load services:", err);
    document.getElementById("servicesGrid").innerHTML =
      `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:3rem;">
         Unable to load services. Please refresh the page.
       </p>`;
  }
}

/* ── BUILD FILTER TABS DYNAMICALLY ── */
function buildFilterTabs() {
  const cats  = ["all", ...new Set(allServices.map(s => s.category))];
  const tabs  = document.getElementById("filterTabs");
  tabs.innerHTML = "";
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `filter-tab${cat === "all" ? " active" : ""}`;
    btn.dataset.cat = cat;
    btn.textContent = cat === "all" ? "All Services" : cat;
    btn.setAttribute("role", "tab");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      currentCat  = cat;
      currentPage = 1;
      applyFilters();
    });
    tabs.appendChild(btn);
  });
}

/* ── SEARCH INPUT ── */
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("serviceSearch");
  const clearBtn    = document.getElementById("clearSearch");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      clearBtn.classList.toggle("visible", searchQuery.length > 0);
      currentPage = 1;
      applyFilters();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      clearBtn.classList.remove("visible");
      currentPage = 1;
      applyFilters();
    });
  }
});

/* ── APPLY FILTERS + SEARCH ── */
function applyFilters() {
  filteredServices = allServices.filter(s => {
    const matchCat = currentCat === "all" || s.category === currentCat;
    const matchSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery) ||
      s.category.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  const noResults = document.getElementById("noResults");
  noResults.style.display = filteredServices.length === 0 ? "block" : "none";

  renderPage();
  renderPagination();
}

/* ── RENDER CURRENT PAGE ── */
function renderPage() {
  const grid  = document.getElementById("servicesGrid");
  const start = (currentPage - 1) * CONFIG.SERVICES_PER_PAGE;
  const page  = filteredServices.slice(start, start + CONFIG.SERVICES_PER_PAGE);

  grid.innerHTML = "";
  page.forEach((service, i) => {
    const card = createServiceCard(service, i);
    grid.appendChild(card);
  });

  // Re-trigger animations
  setTimeout(() => {
    grid.querySelectorAll(".service-card").forEach(card => {
      card.classList.add("reveal");
      requestAnimationFrame(() => card.classList.add("visible"));
    });
  }, 50);
}

/* ── BUILD A SERVICE CARD ── */
/* ── BUILD A SERVICE CARD ── */
function createServiceCard(service, index) {
  const card = document.createElement("div");
  card.className = "service-card";
  card.style.animationDelay = `${index * 0.08}s`;
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", service.title);

  const bgColors = {
    Writing:     "linear-gradient(135deg, #1e1442, #2d1f6e)",
    Academic:    "linear-gradient(135deg, #1a0f3c, #3a1a6a)",
    Tutoring:    "linear-gradient(135deg, #0f1a3c, #1a3a6a)",
    Design:      "linear-gradient(135deg, #1a1f0f, #3a4a1a)",
    Translation: "linear-gradient(135deg, #1a0f0f, #4a2020)",
  };
  const bg = bgColors[service.category] || "linear-gradient(135deg, #1e1442, #2d1f6e)";

  // Check if an image path is provided in JSON; otherwise fall back to the emoji style
  const imageHTML = service.image 
    ? `<img src="${service.image}" alt="${service.title}" style="width:100%; height:100%; object-fit:cover;">`
    : `<span style="font-size:3.5rem;">${service.emoji || "📄"}</span>`;

  card.innerHTML = `
    <div class="card-image">
      <div class="card-image-placeholder" style="background:${service.image ? 'none' : bg}">
        ${imageHTML}
      </div>
      <div class="card-category">${service.category}</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${service.title}</h3>
      <p class="card-description">${service.description}</p>
      <div class="card-footer">
        <div class="card-price">
          ${service.price}
          <small>${service.deliveryTime ? `· ${service.deliveryTime}` : ""}</small>
        </div>
        <button class="card-btn" data-id="${service.id}">
          Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>`;

  card.addEventListener("click", () => openModal(service));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openModal(service);
  });

  return card;
}
  const bg = bgColors[service.category] || "linear-gradient(135deg, #1e1442, #2d1f6e)";

  card.innerHTML = `
    <div class="card-image">
      <div class="card-image-placeholder" style="background:${bg}">
        <span style="font-size:3.5rem;">${service.emoji || "📄"}</span>
      </div>
      <div class="card-category">${service.category}</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${service.title}</h3>
      <p class="card-description">${service.description}</p>
      <div class="card-footer">
        <div class="card-price">
          ${service.price}
          <small>${service.deliveryTime ? `· ${service.deliveryTime}` : ""}</small>
        </div>
        <button class="card-btn" data-id="${service.id}">
          Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>`;

  card.addEventListener("click", () => openModal(service));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openModal(service);
  });

  return card;
}

/* ── PAGINATION ── */
function renderPagination() {
  const total = Math.ceil(filteredServices.length / CONFIG.SERVICES_PER_PAGE);
  const pag   = document.getElementById("pagination");
  pag.innerHTML = "";
  if (total <= 1) return;

  const createBtn = (label, page, disabled = false) => {
    const btn = document.createElement("button");
    btn.className = `page-btn${page === currentPage ? " active" : ""}`;
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener("click", () => {
      currentPage = page;
      renderPage();
      renderPagination();
      document.getElementById("services").scrollIntoView({ behavior: "smooth" });
    });
    return btn;
  };

  pag.appendChild(createBtn("←", currentPage - 1, currentPage === 1));
  for (let i = 1; i <= total; i++) pag.appendChild(createBtn(i, i));
  pag.appendChild(createBtn("→", currentPage + 1, currentPage === total));
}

/* ── POPULATE FORM SERVICE SELECT ── */
function populateServiceSelect() {
  const select = document.getElementById("serviceSelect");
  if (!select) return;
  allServices.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.title} — ${s.price}`;
    opt.dataset.price = s.price;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => {
    const sel = allServices.find(s => s.id === select.value);
    if (sel) {
      document.getElementById("serviceId").value    = sel.id;
      document.getElementById("servicePrice").value = sel.price;
    }
  });
}

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
/* ── BUILD A SERVICE CARD ── */
function createServiceCard(service, index) {
  const card = document.createElement("div");
  card.className = "service-card";
  card.style.animationDelay = `${index * 0.08}s`;
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", service.title);

  const bgColors = {
    Writing:     "linear-gradient(135deg, #1e1442, #2d1f6e)",
    Academic:    "linear-gradient(135deg, #1a0f3c, #3a1a6a)",
    Tutoring:    "linear-gradient(135deg, #0f1a3c, #1a3a6a)",
    Design:      "linear-gradient(135deg, #1a1f0f, #3a4a1a)",
    Translation: "linear-gradient(135deg, #1a0f0f, #4a2020)",
  };
  const bg = bgColors[service.category] || "linear-gradient(135deg, #1e1442, #2d1f6e)";

  // Check if an image path is provided in JSON; otherwise fall back to the emoji style
  const imageHTML = service.image 
    ? `<img src="${service.image}" alt="${service.title}" style="width:100%; height:100%; object-fit:cover;">`
    : `<span style="font-size:3.5rem;">${service.emoji || "📄"}</span>`;

  card.innerHTML = `
    <div class="card-image">
      <div class="card-image-placeholder" style="background:${service.image ? 'none' : bg}">
        ${imageHTML}
      </div>
      <div class="card-category">${service.category}</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${service.title}</h3>
      <p class="card-description">${service.description}</p>
      <div class="card-footer">
        <div class="card-price">
          ${service.price}
          <small>${service.deliveryTime ? `· ${service.deliveryTime}` : ""}</small>
        </div>
        <button class="card-btn" data-id="${service.id}">
          Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>`;

  card.addEventListener("click", () => openModal(service));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openModal(service);
  });

  return card;
}

  // Apply button prefills form
  document.getElementById("modalApply").onclick = () => {
    closeModal();
    prefillForm(service);
    document.getElementById("apply").scrollIntoView({ behavior: "smooth" });
  };

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  currentService = null;
}

function initModalClose() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* ── PREFILL FORM FROM MODAL ── */
function prefillForm(service) {
  const select = document.getElementById("serviceSelect");
  if (select) {
    select.value = service.id;
    select.dispatchEvent(new Event("change"));
  }
}

/* ══════════════════════════════════════════
   FORM SUBMISSION → GOOGLE SHEETS
══════════════════════════════════════════ */
function initFormEvents() {
  const form = document.getElementById("applyForm");
  if (!form) return;
  form.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const submitBtn  = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  const btnLoader  = document.getElementById("btnLoader");
  const submitIcon = document.getElementById("submitIcon");

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = "Sending...";
  btnLoader.style.display = "flex";
  submitIcon.style.display = "none";

  const formData = {
    name:      document.getElementById("fullName").value.trim(),
    phone:     document.getElementById("phone").value.trim(),
    email:     document.getElementById("email").value.trim(),
    service:   document.getElementById("serviceSelect").selectedOptions[0]?.text || "",
    serviceId: document.getElementById("serviceId").value,
    price:     document.getElementById("servicePrice").value,
    notes:     document.getElementById("message").value.trim(),
    timestamp: new Date().toISOString(),
    status:    "New",
  };

  try {
    await submitToGoogleSheets(formData);
    showFormSuccess();
    showNotification("Application sent successfully! We'll be in touch soon.", "success");
  } catch (err) {
    console.error("Submission error:", err);
    showNotification("Something went wrong. Please try WhatsApp instead.", "error");
    // Reset button
    submitBtn.disabled = false;
    submitText.textContent = "Send Application";
    btnLoader.style.display = "none";
    submitIcon.style.display = "inline";
  }
}

/* ── GOOGLE SHEETS SUBMISSION ── */
async function submitToGoogleSheets(data, retries = 2) {
  if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE")) {
    // Demo mode — simulate success after 1.5s
    await new Promise(r => setTimeout(r, 1500));
    console.log("Demo mode — form data:", data);
    return;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method:  "POST",
        headers: { "Content-Type": "text/plain" },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

/* ── FORM VALIDATION ── */
function validateForm() {
  let valid = true;
  clearErrors();

  const name    = document.getElementById("fullName");
  const phone   = document.getElementById("phone");
  const email   = document.getElementById("email");
  const service = document.getElementById("serviceSelect");
  const message = document.getElementById("message");

  if (!name.value.trim() || name.value.trim().length < 2) {
    showError(name, "nameError", "Please enter your full name.");
    valid = false;
  }
  if (!phone.value.trim() || !/^\+?[\d\s\-().]{7,}$/.test(phone.value.trim())) {
    showError(phone, "phoneError", "Please enter a valid phone number.");
    valid = false;
  }
  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError(email, "emailError", "Please enter a valid email address.");
    valid = false;
  }
  if (!service.value) {
    showError(service, "serviceError", "Please select a service.");
    valid = false;
  }
  if (!message.value.trim() || message.value.trim().length < 10) {
    showError(message, "messageError", "Please describe your requirements (at least 10 characters).");
    valid = false;
  }
  return valid;
}

function showError(field, errorId, message) {
  field.classList.add("error");
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

/* ── SHOW SUCCESS STATE ── */
function showFormSuccess() {
  document.getElementById("applyForm").style.display   = "none";
  document.getElementById("formSuccess").style.display = "block";
}

/* ── RESET FORM ── */
function resetForm() {
  document.getElementById("applyForm").reset();
  document.getElementById("applyForm").style.display   = "";
  document.getElementById("formSuccess").style.display = "none";
  clearErrors();
}
window.resetForm = resetForm;

/* ══════════════════════════════════════════
   NOTIFICATION POPUP
══════════════════════════════════════════ */
function showNotification(message, type = "success") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className   = `notification ${type} show`;
  setTimeout(() => notif.classList.remove("show"), 4500);
}

/* ══════════════════════════════════════════
   WHATSAPP LINKS — update dynamically
══════════════════════════════════════════ */
function initWhatsAppLinks() {
  if (!CONFIG.WHATSAPP_NUMBER || CONFIG.WHATSAPP_NUMBER.includes("X")) return;
  document.querySelectorAll('a[href*="wa.me/970XXXXXXXXX"]').forEach(link => {
    link.href = link.href.replace("970XXXXXXXXX", CONFIG.WHATSAPP_NUMBER);
  });
}
