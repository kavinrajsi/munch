(function () {
  document.addEventListener("DOMContentLoaded", () => {
    hideLoader();
    const cartTrigger = document.getElementById("cart-icon-bubble");
    const cartDrawer = document.getElementById("cart-drawer");

    if (cartTrigger) {
      cartTrigger.addEventListener("click", (event) => {
        event.preventDefault();
        openCartDrawer();
      });
    }

    cartDrawer?.querySelectorAll("[data-drawer-close]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeCartDrawer();
      })
    );

    cartDrawer?.querySelector(".drawer__overlay")?.addEventListener("click", closeCartDrawer);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cartDrawer?.classList.contains("is-active")) {
        closeCartDrawer();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches(".qty-increase") || target.matches(".qty-decrease")) {
        const key = target.dataset.lineKey;
        const input = document.querySelector(`input.cart-qty-input[data-line-key="${key}"]`);
        let qty = parseInt(input.value) || 1;
        qty += target.matches(".qty-increase") ? 1 : -1;
        updateCartItemQuantity(key, Math.max(qty, 1));
      }

      if (target.matches(".cart-item__remove-btn")) {
        removeCartItemByKey(target.dataset.lineKey);
      }

      if (cartDrawer?.classList.contains("is-active") &&
          !cartDrawer.contains(target) &&
          !target.closest("#cart-icon-bubble")) {
        closeCartDrawer();
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches("input.cart-qty-input")) {
        const key = event.target.dataset.lineKey;
        let val = parseInt(event.target.value);
        updateCartItemQuantity(key, isNaN(val) || val < 1 ? 1 : val);
      }
    });

    fetchCartData();
  });
})();
