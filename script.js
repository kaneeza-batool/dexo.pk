/* =========================================
   DEXO.PK — script.js  v2.0
   Bug fixes + premium interactions
   ========================================= */

/* ── Navbar Scroll Effect ── */
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);

  // Back to top button
  const btn = document.getElementById("back-to-top");
  if (btn) btn.classList.toggle("visible", window.scrollY > 400);
});

/* ── Cart System ── */
const CART_KEY = "dexo_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function addToCart(id, name, price, img, category) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, category, qty: 1 });
  }
  saveCart(cart);
  showToast(`<i class="bi bi-bag-check"></i> ${name} added to cart`);
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  renderCart();
}

/* BUG FIX #1: parseInt('') = NaN → Math.max(1, NaN) = NaN → broken cart.
   Added || 1 guard and isNaN check. */
function updateQty(id, qty) {
  const parsed = parseInt(qty);
  const safeQty = isNaN(parsed) ? 1 : Math.max(1, parsed);
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty = safeQty;
    saveCart(cart);
    renderCart();
  }
}

/* ── Toast (premium version with auto-remove) ── */
function showToast(msg) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = msg;
  container.appendChild(toast);

  // Animate out before removal
  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }, 3100);
}

/* ── Render Cart Page ── */
function renderCart() {
  const wrap = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  if (!wrap) return;

  const cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="empty-cart">
        <i class="bi bi-bag-x"></i>
        <h4>Your cart is empty</h4>
        <p>Discover our premium decor collection and add something beautiful.</p>
        <a href="shop.html" class="btn-gold">Explore Shop</a>
      </div>`;
    if (summary) summary.style.display = "none";
    return;
  }

  if (summary) summary.style.display = "block";

  wrap.innerHTML = `
    <div class="cart-table">
      <table class="table mb-0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${cart
            .map(
              (item) => `
            <tr>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img src="${item.img}" class="cart-img" alt="${item.name}">
                  <div>
                    <div class="cart-product-title">${item.name}</div>
                    <div class="cart-product-cat">${item.category}</div>
                  </div>
                </div>
              </td>
              <td class="text-gold fw-600">PKR ${item.price.toLocaleString()}</td>
              <td>
                <div class="qty-wrap">
                  <button class="qty-btn" onclick="updateQty('${item.id}', ${item.qty - 1})">−</button>
                  <input class="qty-input" type="number" value="${item.qty}" min="1"
                    onchange="updateQty('${item.id}', this.value)"
                    onblur="if(!this.value||parseInt(this.value)<1)this.value=1">
                  <button class="qty-btn" onclick="updateQty('${item.id}', ${item.qty + 1})">+</button>
                </div>
              </td>
              <td class="fw-600">PKR ${(item.price * item.qty).toLocaleString()}</td>
              <td>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')">
                  <i class="bi bi-x-circle"></i>
                </button>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  updateCartSummary();
}

/* Extracted helper so promo code can call it too */
function updateCartSummary(discountPct = 0) {
  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 350;
  const discountAmt = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmt + shipping;

  if (document.getElementById("summary-subtotal")) {
    document.getElementById("summary-subtotal").textContent =
      `PKR ${subtotal.toLocaleString()}`;
    document.getElementById("summary-shipping").textContent =
      shipping === 0 ? "Free" : `PKR ${shipping}`;
    document.getElementById("summary-total").textContent =
      `PKR ${total.toLocaleString()}`;
  }
  return { subtotal, shipping, discountAmt, total };
}

/* BUG FIX #2: Promo code was purely cosmetic — it showed a toast
   but never changed the total. Now it actually reduces the total. */
let _activeDiscount = 0;
function applyPromo() {
  const val = document.getElementById("promo-input").value.trim().toUpperCase();
  if (val === "") {
    showToast(
      '<i class="bi bi-exclamation-circle"></i> Please enter a promo code.',
    );
    return;
  }
  if (val === "DEXO10") {
    _activeDiscount = 10;
    updateCartSummary(_activeDiscount);
    showToast('<i class="bi bi-tag-fill"></i> 10% discount applied!');
  } else if (val === "DEXO20") {
    _activeDiscount = 20;
    updateCartSummary(_activeDiscount);
    showToast('<i class="bi bi-tag-fill"></i> 20% discount applied!');
  } else {
    _activeDiscount = 0;
    updateCartSummary(0);
    showToast('<i class="bi bi-x-circle"></i> Invalid promo code. Try DEXO10.');
  }
}

/* ── Render Checkout Summary ── */
function renderCheckoutSummary() {
  const wrap = document.getElementById("checkout-items");
  if (!wrap) return;

  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 350;
  const total = subtotal + shipping;

  wrap.innerHTML = cart
    .map(
      (item) => `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-2">
        <img src="${item.img}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
        <div>
          <div style="font-size:13px;font-weight:600">${item.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">Qty: ${item.qty}</div>
        </div>
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--gold)">PKR ${(item.price * item.qty).toLocaleString()}</div>
    </div>`,
    )
    .join("");

  if (document.getElementById("co-subtotal")) {
    document.getElementById("co-subtotal").textContent =
      `PKR ${subtotal.toLocaleString()}`;
    document.getElementById("co-shipping").textContent =
      shipping === 0 ? "Free" : `PKR ${shipping}`;
    document.getElementById("co-total").textContent =
      `PKR ${total.toLocaleString()}`;
  }
}

/* ── Product Gallery Thumbnails ── */
function initGallery() {
  const thumbs = document.querySelectorAll(".product-thumb");
  const main = document.getElementById("main-img");
  if (!thumbs.length || !main) return;
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      main.src = thumb.dataset.img;
    });
  });
}

/* ── Quantity Buttons on Product Page ── */
function initQtyButtons() {
  const qtyInput = document.getElementById("qty-input");
  const btnPlus = document.getElementById("qty-plus");
  const btnMinus = document.getElementById("qty-minus");
  if (!qtyInput) return;
  btnPlus?.addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value || 1) + 1;
  });
  btnMinus?.addEventListener("click", () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1) - 1);
  });
}

/* ── Add to Cart from Product Page ── */
function initProductPage() {
  const btn = document.getElementById("add-to-cart-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const qty = parseInt(document.getElementById("qty-input")?.value || 1);
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const img = btn.dataset.img;
    const cat = btn.dataset.cat;
    const cart = getCart();
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, name, price, img, category: cat, qty });
    saveCart(cart);
    showToast(`<i class="bi bi-bag-check"></i> ${name} added to cart`);
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  if (!els.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
  );
  els.forEach((el) => observer.observe(el));
}

/* ── Animated counter for hero stats ── */
function animateCounters() {
  const nums = document.querySelectorAll(".hero-stat .num");
  if (!nums.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const raw = el.textContent.trim();
        // Parse number and suffix (e.g. "10K+", "500+", "8")
        const match = raw.match(/^([\d.]+)([KkMm+]*)/);
        if (!match) return;
        const target = parseFloat(match[1]);
        const suffix = match[2] || "";
        let start = null;
        const duration = 1400;

        function step(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target * 10) / 10;
          el.textContent =
            (Number.isInteger(target) ? Math.round(current) : current) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  nums.forEach((el) => observer.observe(el));
}

/* BUG FIX #3: filterProducts sort was re-appending ALL cards (including
   hidden ones) in sorted order. While visually this worked, it caused
   hidden cards to shift positions in the DOM unnecessarily, and visible
   results count was computed AFTER re-appending, which could mismatch.
   Fixed: filter first, sort only visible cards, then re-append. */
function initShopFilters() {
  const sortEl = document.getElementById("sort-select");
  const filterCats = document.querySelectorAll(".filter-cat-check");
  const priceRange = document.getElementById("price-range");
  const priceVal = document.getElementById("price-val");

  if (priceRange && priceVal) {
    priceRange.addEventListener("input", () => {
      priceVal.textContent = `PKR ${parseInt(priceRange.value).toLocaleString()}`;
      filterProducts();
    });
  }
  sortEl?.addEventListener("change", filterProducts);
  filterCats.forEach((el) => el.addEventListener("change", filterProducts));

  function filterProducts() {
    const cards = [...document.querySelectorAll(".product-card-wrap")];
    const sortVal = sortEl?.value || "";
    const maxPrice = parseInt(priceRange?.value || 999999);
    const activeCats = [...(filterCats || [])]
      .filter((el) => el.checked && !el.disabled)
      .map((el) => el.value);

    const grid = document.getElementById("product-grid");

    // Separate into visible and hidden
    const visible = [];
    const hidden = [];

    cards.forEach((card) => {
      const price = parseInt(card.dataset.price || 0);
      const cat = card.dataset.cat || "";
      const isVisible =
        price <= maxPrice &&
        (activeCats.length === 0 || activeCats.includes(cat));

      card.style.display = isVisible ? "" : "none";
      if (isVisible) visible.push(card);
      else hidden.push(card);
    });

    // Sort only the visible cards
    if (sortVal === "low") {
      visible.sort(
        (a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price),
      );
    } else if (sortVal === "high") {
      visible.sort(
        (a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price),
      );
    }

    // Re-append: visible first (sorted), then hidden (order doesn't matter)
    if (grid) {
      [...visible, ...hidden].forEach((c) => grid.appendChild(c));
    }

    const countEl = document.getElementById("results-count");
    if (countEl) {
      countEl.innerHTML = `Showing <span>${visible.length}</span> products`;
    }
  }
}

/* ── Newsletter Form ── */
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast(
      '<i class="bi bi-check-circle"></i> Subscribed! Thank you for joining us.',
    );
    form.reset();
  });
}

/* ── Contact Form ── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast(
      '<i class="bi bi-check-circle"></i> Message sent! We\'ll be in touch soon.',
    );
    form.reset();
  });
}

/* BUG FIX #4: No guard for empty cart on checkout page.
   User could submit an order with PKR 0 and empty items.
   Now redirects to cart if empty, and validates before submit. */
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  // Redirect if cart is empty on page load
  if (document.getElementById("checkout-items")) {
    const cart = getCart();
    if (cart.length === 0) {
      showToast(
        '<i class="bi bi-exclamation-triangle"></i> Your cart is empty. Add items first.',
      );
      setTimeout(() => {
        window.location.href = "shop.html";
      }, 1800);
      return;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      showToast(
        '<i class="bi bi-exclamation-triangle"></i> Your cart is empty!',
      );
      return;
    }
    // Disable the button to prevent double-submit
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="bi bi-hourglass-split"></i> Placing Order...';
    }
    saveCart([]);
    window.location.href = "index.html?order=success";
  });
}

/* ── Order Success Toast ── */
function checkOrderSuccess() {
  if (window.location.search.includes("order=success")) {
    showToast(
      '<i class="bi bi-patch-check"></i> Order placed successfully! Thank you 🎉',
    );
    history.replaceState({}, "", window.location.pathname);
  }
}

/* ── Auth Forms ── */
function initAuthForms() {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Signing in...';
    }
    showToast('<i class="bi bi-person-check"></i> Welcome back!');
    setTimeout(() => (window.location.href = "index.html"), 1500);
  });

  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    // Basic password match check
    const pass1 = signupForm.querySelector("#signup-pass");
    const pass2 = signupForm.querySelectorAll('[type="password"]')[1];
    if (pass1 && pass2 && pass1.value !== pass2.value) {
      showToast(
        '<i class="bi bi-exclamation-circle"></i> Passwords do not match.',
      );
      return;
    }
    const btn = signupForm.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML =
        '<i class="bi bi-hourglass-split"></i> Creating account...';
    }
    showToast(
      '<i class="bi bi-person-plus"></i> Account created! Welcome to dexo.pk',
    );
    setTimeout(() => (window.location.href = "index.html"), 1500);
  });
}

/* ── Back to Top Button ── */
function initBackToTop() {
  // Inject the button if it doesn't exist
  if (!document.getElementById("back-to-top")) {
    const btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
    document.body.appendChild(btn);
  }
}

/* ── Parallax on hero image ── */
function initHeroParallax() {
  const heroImg = document.querySelector(".hero-img");
  if (!heroImg) return;
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    heroImg.style.transform = `perspective(1200px) rotateY(${-4 + x * 0.3}deg) rotateX(${y * 0.2}deg) translateZ(0)`;
  });
}

/* ── Smooth page entry ── */
function initPageEntry() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.4s ease";
  window.addEventListener("load", () => {
    document.body.style.opacity = "1";
  });
  // Fallback
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 500);
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initScrollReveal();
  renderCart();
  renderCheckoutSummary();
  initGallery();
  initQtyButtons();
  initProductPage();
  initShopFilters();
  initNewsletter();
  initContactForm();
  initCheckoutForm();
  initAuthForms();
  checkOrderSuccess();
  initBackToTop();
  initHeroParallax();
  animateCounters();
});
