# dexo.pk — Premium Home Decor E-Commerce Frontend
A fully responsive, multi-page e-commerce frontend for a luxury home decor brand targeting the Pakistani market. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

---

## Pages

| File | Description |
|---|---|
| `index.html` | Homepage — hero, categories, featured products, newsletter |
| `shop.html` | Product listing with live filter + sort sidebar |
| `cart.html` | Cart with quantity controls, promo code, order summary |
| `checkout.html` | Multi-step checkout with payment method selection |
| `about.html` | Brand story, timeline, stats, values |
| `contact.html` | Contact form, map embed, FAQ accordion |
| `login.html` | Sign-in page with Google OAuth UI |
| `signup.html` | Registration with live password strength meter |

---

## Features

- **Cart system** — localStorage-based, persists across pages, live count badge
- **Filter + sort** — filter by category and max price, sort by price (low/high)
- **Promo codes** — `DEXO10` (10% off), `DEXO20` (20% off) — actually applied to totals
- **Scroll reveal animations** — staggered entrance on scroll via IntersectionObserver
- **Hero parallax** — image follows cursor via mousemove
- **Animated stat counters** — numbers count up on scroll into view
- **Password strength meter** — real-time feedback on signup
- **Toast notifications** — with gold progress bar, auto-dismiss at 3s
- **Back-to-top button** — auto-injected, appears after 400px scroll
- **Responsive** — mobile-first, tested across breakpoints

---

## Project Structure

```
dexo.pk/
├── index.html
├── shop.html
├── cart.html
├── checkout.html
├── about.html
├── contact.html
├── login.html
├── signup.html
├── style.css
└── script.js
```

---

## Known Limitations

- **No backend** — cart uses localStorage, forms show toast confirmations only
- **No real auth** — login/signup forms simulate success with a redirect
- **No payment gateway** — payment method selection is UI-only

---

## Built By

Kaneeza Batool — Frontend Developer  
[LinkedIn](www.linkedin.com/in/kaneeza-batool) · [GitHub](https://github.com/kaneeza-batool)
