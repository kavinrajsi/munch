
// Show loader during async operations
function showLoader() {
  console.log("showLoader: showing loader");
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
}

function hideLoader() {
  console.log("hideLoader: hiding loader");
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

// Update cart count on cart icon
function updateCartCount(count) {
  console.log(`updateCartCount: updating cart count to ${count}`);
  const cartCount = document.querySelector(".cart-count");
  if (!cartCount) return;

  if (count > 0) {
    cartCount.hidden = false;
    const span = cartCount.querySelector("span");
    const displayCount = count > 99 ? "99+" : count;
    if (span) {
      span.textContent = displayCount;
    } else {
      const spanEl = document.createElement("span");
      spanEl.setAttribute("aria-hidden", "true");
      spanEl.textContent = displayCount;
      cartCount.appendChild(spanEl);
    }
  } else {
    cartCount.hidden = true;
  }
}

// Fetch cart data from Shopify
function fetchCartData() {
  console.log("fetchCartData: fetching cart data");
  fetch("/cart.js")
    .then(res => res.json())
    .then(cart => {
      renderCartItems(cart);
      updateCartCount(cart.item_count);
    })
    .catch(err => console.error("fetchCartData: error", err));
}

// Render cart items
function renderCartItems(cart) {
  console.log("renderCartItems: rendering", cart.items.length, "items");

  const cartDrawer = document.querySelector(".cart__drawer_items");
  const emptyMessage = document.getElementById("cart-item-empty");
  const totalPriceElem = document.getElementById("cart__total_price");

  if (!cartDrawer || !emptyMessage || !totalPriceElem) {
    console.error("renderCartItems: required elements missing");
    return;
  }

  cartDrawer.innerHTML = "";

  if (!cart.items || cart.items.length === 0) {
    emptyMessage.hidden = false;
    totalPriceElem.innerHTML = `<strong>Rs. 0.00</strong>`;
    return;
  }

  emptyMessage.hidden = true;

  cart.items.forEach(item => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cartpopup-item", "cart-item");
    cartItem.innerHTML = `
      <div class="cart__item cartpopup-item">
        <div class="card__item-image">
          <img src="${item.image}&width=95&height=100&format=webp" width="95" height="100" alt="${item.title}">
        </div>
        <div class="card__item-content">
          <h4 class="card__item--title">${item.title}</h4>
          <div class="card__item--price productPrice"><span class="money">Rs. ${(item.price / 100).toFixed(2)}</span></div>
          <div class="cart-item__qtyWrapper">
           <div class="cart-item__qty">
            <button type="button" class="qty-decrease" data-line-key="${item.key}" aria-label="Decrease quantity">-</button>
            <input type="text" min="1" value="${item.quantity}" class="cart-qty-input" data-line-key="${item.key}" aria-label="Quantity input for ${item.title}" />
            <button type="button" class="qty-increase" data-line-key="${item.key}" aria-label="Increase quantity">+</button>
           </div>
          </div>
          <div class="delete">
            <button class="removeCta cart-item__remove-btn" data-line-key="${item.key}" type="button" aria-label="Remove ${item.title} from cart">Remove</button>
          </div>
        </div>
        </div>
    `;
    cartDrawer.appendChild(cartItem);
  });

  // Price calculation
  const subtotal = (cart.items_subtotal_price / 100).toFixed(2);
  const discount = (cart.total_discount / 100).toFixed(2);
  const total = (cart.total_price / 100).toFixed(2);
/** NOTE: Subtotal value is not matching with total value */
  let priceHTML = ``;
  // let priceHTML = `<div><strong>Subtotal:</strong> Rs. ${subtotal}</div>`;

  if (cart.total_discount > 0) {
    priceHTML += `
      <div><strong>Discount:</strong> -Rs. ${discount}</div>
      <div><strong>Total:</strong> Rs. ${subtotal}</div>
    `;
  } else {
    priceHTML += `<div>Rs.${subtotal}</div>`;
  }

  totalPriceElem.innerHTML = priceHTML;
}

// Remove item
function removeCartItem(lineKey) {
  console.log(`removeCartItem: ${lineKey}`);
  showLoader();
  fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: lineKey, quantity: 0 })
  })
    .then(res => res.json())
    .then(cart => {
      renderCartItems(cart);
      updateCartCount(cart.item_count);
      hideLoader();
    })
    .catch(err => {
      console.error("removeCartItem error:", err);
      alert("Failed to remove item");
      hideLoader();
    });
}

// Change item quantity
function changeCartItemQuantity(lineKey, quantity) {
  quantity = quantity < 1 ? 1 : quantity;
  showLoader();
  fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: lineKey, quantity })
  })
    .then(res => res.json())
    .then(cart => {
      renderCartItems(cart);
      updateCartCount(cart.item_count);
      hideLoader();
    })
    .catch(err => {
      console.error("changeCartItemQuantity error:", err);
      alert("Failed to update quantity");
      hideLoader();
    });
}

// Click handlers for cart buttons
document.addEventListener("click", e => {
  const target = e.target;

  if (target.matches(".cart-item__remove-btn")) {
    const lineKey = target.dataset.lineKey;
    removeCartItem(lineKey);
  }

  if (target.matches(".qty-increase") || target.matches(".qty-decrease")) {
    const lineKey = target.dataset.lineKey;
    const input = document.querySelector(`input.cart-qty-input[data-line-key="${lineKey}"]`);
    if (!input) return;
    let newQty = parseInt(input.value);
    newQty += target.classList.contains("qty-increase") ? 1 : -1;
    newQty = newQty < 1 ? 1 : newQty;
    changeCartItemQuantity(lineKey, newQty);
  }
});

// Input change handler
document.addEventListener("change", e => {
  const target = e.target;
  if (target.matches("input.cart-qty-input")) {
    const lineKey = target.dataset.lineKey;
    let qty = parseInt(target.value);
    qty = isNaN(qty) || qty < 1 ? 1 : qty;
    changeCartItemQuantity(lineKey, qty);
  }
});

// Drawer toggle and setup
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  const trigger = document.getElementById("cart-icon-bubble");
  const drawer = document.getElementById("cart-drawer");

  if (trigger && drawer) {
    trigger.addEventListener("click", e => {
      e.preventDefault();
      drawer.classList.add("is-active", "is-visible");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      fetchCartData();
    });

    drawer.querySelectorAll("[data-drawer-close]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        drawer.classList.remove("is-visible");
        drawer.setAttribute("aria-hidden", "true");
        drawer.addEventListener("transitionend", () => {
          drawer.classList.remove("is-active");
          document.body.style.overflow = "";
        }, { once: true });
      });
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && drawer.classList.contains("is-active")) {
        drawer.classList.remove("is-visible");
        drawer.setAttribute("aria-hidden", "true");
        drawer.addEventListener("transitionend", () => {
          drawer.classList.remove("is-active");
          document.body.style.overflow = "";
        }, { once: true });
      }
    });
  }

  fetchCartData(); // Optional preload on page load
});

console.log("drawer.js loaded");
