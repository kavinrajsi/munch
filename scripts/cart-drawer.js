(function () {
  function fetchCartData() {
    fetch("/cart.js")
      .then((response) => response.json())
      .then(renderCartDrawerItems)
      .catch((error) => console.error("fetchCartData error", error));
  }

  function renderCartDrawerItems(cart) {
    const cartDrawerItems = document.querySelector(".cart__drawer_items");
    const emptyCartMsg = document.getElementById("cart-item-empty");
    const totalPriceElem = document.getElementById("cart__total_price");

    cartDrawerItems.innerHTML = "";
    if (!cart.items.length) {
      emptyCartMsg.hidden = false;
      totalPriceElem.innerHTML = `<strong>Rs. 0.00</strong>`;
      return;
    }

    emptyCartMsg.hidden = true;
    cart.items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("cartpopup-item", "cart-item");
      itemDiv.innerHTML = `
        <div class="cart__item cartpopup-item">
          <div class="card__item-image">
            <img src="${item.image}&width=95&height=100&format=webp" width="95" height="100" alt="${item.title}">
          </div>
          <div class="card__item-content">
            <h4 class="card__item--title">${item.title}</h4>
            <div class="card__item--price productPrice"><span class="money">Rs. ${(item.price / 100).toFixed(2)}</span></div>
            <div class="cart-item__qtyWrapper">
              <div class="cart-item__qty">
                <button class="qty-decrease" data-line-key="${item.key}">-</button>
                <input class="cart-qty-input" data-line-key="${item.key}" value="${item.quantity}" />
                <button class="qty-increase" data-line-key="${item.key}">+</button>
              </div>
            </div>
            <div class="delete"><button class="cart-item__remove-btn" data-line-key="${item.key}">Remove</button></div>
          </div>
        </div>`;
      cartDrawerItems.appendChild(itemDiv);
    });

    const subtotal = (cart.items_subtotal_price / 100).toFixed(2);
    totalPriceElem.innerHTML = `<div>Rs. ${subtotal}</div>`;
  }

  window.openCartDrawer = function () {
    const cartDrawer = document.getElementById("cart-drawer");
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-active", "is-visible");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    fetchCartData();
  };

  window.closeCartDrawer = function () {
    const cartDrawer = document.getElementById("cart-drawer");
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-visible", "is-active");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  window.removeCartItemByKey = function (itemKey) {
    showLoader();
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemKey, quantity: 0 }),
    })
      .then((response) => response.json())
      .then((cart) => {
        renderCartDrawerItems(cart);
        hideLoader();
      });
  };

  window.updateCartItemQuantity = function (itemKey, newQty) {
    showLoader();
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemKey, quantity: newQty < 1 ? 1 : newQty }),
    })
      .then((response) => response.json())
      .then((cart) => {
        renderCartDrawerItems(cart);
        hideLoader();
      });
  };
})();
