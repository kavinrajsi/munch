(function ($) {
  console.log("functions");

  // === DOM Caching for Reuse ===
  const $menuToggle = $("#menu-toggle");
  const $searchToggle = $("#search-toggle");
  const $searchBar = $("#search-bar");
  const $searchClose = $("#search-close");
  const $searchIcon = $("#search-toggle");
  const $headerNavList = $("#header-nav-lists");
  const $headerNormal = $(".header-container.header-normal");
  const $headerHover = $(".header-container.header-hover");
  const $overlay = $("#header-overlay");
  const $html = $("html");
  const $body = $("body");

  function updateOverflow() {
    const menuOpen = $headerNavList.hasClass("show");
    const searchOpen = $searchBar.hasClass("show");
    if (menuOpen || searchOpen) {
      $html.css("overflow", "hidden");
      $body.css("overflow", "hidden");
      $overlay.addClass("show");
    } else {
      $html.css("overflow", "");
      $body.css("overflow", "");
      $overlay.removeClass("show");
    }
  }

  // === Menu Toggle ===
  $menuToggle.on("click", function () {
    if ($searchBar.hasClass("show")) {
      $searchBar.removeClass("show");
      $searchIcon.removeClass("hide");
      $headerHover.removeClass("show");
      $headerNormal.addClass("show");
    }
    $headerNavList.toggleClass("show");
    updateOverflow();
  });

  // === Search Toggle ===
  $searchToggle.on("click", function () {
    if ($headerNavList.hasClass("show")) {
      $headerNavList.removeClass("show");
    }
    $searchBar.toggleClass("show");
    $searchIcon.toggleClass("hide");
    $headerNavList.toggleClass("hide", $searchBar.hasClass("show"));
    if ($searchBar.hasClass("show")) {
      $headerHover.addClass("show");
      $headerNormal.removeClass("show");
    } else {
      $headerHover.removeClass("show");
      $headerNormal.addClass("show");
    }
    updateOverflow();
  });

  // === Close Search ===
  $searchClose.on("click", function () {
    $searchBar.removeClass("show");
    $searchIcon.removeClass("hide");
    $headerNavList.removeClass("hide");
    $headerHover.removeClass("show");
    $headerNormal.addClass("show");
    updateOverflow();
  });

  // === Header Overlay Click ===
  $overlay.on("click", function () {
    $searchBar.removeClass("show");
    $headerHover.removeClass("show");
    $headerNormal.addClass("show");
    $searchIcon.removeClass("hide");
    $headerNavList.removeClass("show hide");
    updateOverflow();
  });

  // === Slick Slider Init ===
  $(".slick-slider").slick({});

  // === Gallery Image Switch ===
  $("#gallery_01 a").on("click", function () {
    const dataImage = $(this).data("image");
    const dataZoomImage = $(this).data("zoom-image");
    const $picture = $(".test-gallery").closest("picture");
    $(".test-gallery").attr("src", dataImage).attr("data-zoom-image", dataZoomImage);
    $picture
      .find("source[type='image/avif']")
      .attr("srcset", dataImage.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));
    $picture
      .find("source[type='image/webp']")
      .attr("srcset", dataImage.replace(/\.(jpg|jpeg|png)$/, ".webp"));
  });

  // === Product Modal Handlers ===
  function closeProductModal(productId) {
    $("#product-modal-" + productId).removeClass("product-modal--show");
    $("body").removeClass("overflow-hidden");
  }
  window.openProductModal = function (productId) {
    $("#product-modal-" + productId).addClass("product-modal--show");
    $("body").addClass("overflow-hidden");
  };
  window.closeProductModal = closeProductModal;

  // === Product Modal: Add to Cart Button ===
  document.addEventListener("click", function (e) {
    if (e.target.matches(".product-modal__buttons--cart")) {
      e.preventDefault();
      window.addToCart(e.target);
    }
  });

  // === Product Modal: Buy Now Button ===
  document.addEventListener("click", function (e) {
    if (e.target.matches(".product-modal__buttons--buy-now")) {
      e.preventDefault();
      console.log("buy now clicked");
    }
  });

  // === Quantity Updater ===
  window.updateQty = function (button, change) {
    const $input = $(button).siblings(".qty-input");
    let qty = parseInt($input.val(), 10) || 1;
    qty = Math.max(qty + change, 1);
    $input.val(qty);
  };

  // === AJAX Add To Cart (Generic) ===
  window.addToCart = function (button) {
    const $form = $(button).closest("form");
    const formData = new FormData($form[0]);
    const productId = $form.data("product-id");
    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((res) => res.json())
      .then(() => {
        closeProductModal(productId);
        openCartDrawer();
      })
      .catch((err) => console.error("Add to cart error:", err));
  };

  // === AJAX Product Form (Variants & Cart) ===
  $(".product-form-ajax").each(function () {
    const $form = $(this);
    const productId = $form.data("product-id");
    const productJson = $("#ProductJson-" + productId);
    if (!productJson.length) return;
    const productData = JSON.parse(productJson.text());

    // Disable unavailable variants
    $form.find("fieldset").each(function (i) {
      $(this)
        .find("input[type='radio']")
        .each(function () {
          const val = $(this).val();
          const available = productData.variants.some(
            (v) => v.options[i] === val && v.available
          );
          $(this).prop("disabled", !available).parent().toggleClass("disabled", !available);
        });
    });

    // On variant change
    $form.find("input[type='radio']").on("change", function () {
      const opts = [];
      $form.find("fieldset").each(function (j) {
        opts[j] = $(this).find("input:checked").val() || "";
      });
      const variant = productData.variants.find((v) =>
        v.options.every((o, k) => o === opts[k])
      );
      if (variant) {
        $form.find(".selected-variant-id").val(variant.id);
        const priceEl = $("#price-" + productId);
        const cmpEl = $("#compare-price-" + productId);
        if (priceEl.length) priceEl.text(Shopify.formatMoney(variant.price, Shopify.money_format));
        if (cmpEl.length) {
          if (variant.compare_at_price > variant.price)
            cmpEl.show().text(Shopify.formatMoney(variant.compare_at_price, Shopify.money_format));
          else cmpEl.hide();
        }
        const stockEl = $("#stock-status-" + productId);
        if (stockEl.length)
          stockEl.text(variant.available ? "In Stock" : "Out of Stock");
      }
    });

    // On form submit
    $form.on("submit", function (e) {
      e.preventDefault();
      const vid = $form.find(".selected-variant-id").val();
      const qty = parseInt($form.find(".qty-input").val(), 10) || 1;
      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items: [{ id: vid, quantity: qty }] })
      })
        .then((res) => res.json())
        .then(() => {
          closeProductModal(productId);
          openCartDrawer();
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });

  // === Cart Drawer Helpers ===
  function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.add("is-active", "is-visible");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    fetchCartData();
  }
  function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.remove("is-visible", "is-active");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // === Loader Functions ===
  function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";
  }
  function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
  }

  // === Cart Data & Rendering ===
  function fetchCartData() {
    fetch("/cart.js")
      .then((r) => r.json())
      .then((cart) => {
        renderCartItems(cart);
      })
      .catch((e) => console.error("fetchCartData error", e));
  }
  function renderCartItems(cart) {
    const drawer = document.querySelector(".cart__drawer_items");
    const emptyMsg = document.getElementById("cart-item-empty");
    const totalEl = document.getElementById("cart__total_price");
    if (!drawer || !emptyMsg || !totalEl) return;
    drawer.innerHTML = "";
    if (!cart.items || cart.items.length === 0) {
      emptyMsg.hidden = false;
      totalEl.innerHTML = `<strong>Rs. 0.00</strong>`;
      return;
    }
    emptyMsg.hidden = true;
    cart.items.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("cartpopup-item", "cart-item");
      div.innerHTML = `
        <div class="card__item-image">
          <img src="${item.image}&width=95&height=100&format=webp" width="95" height="100" alt="${item
        .title}">
        </div>
        <div class="card__item-content">
          <h4 class="card__item--title">${item.title}</h4>
          <div class="card__item--price productPrice"><span class="money">Rs. ${(
            item.price / 100
          ).toFixed(2)}</span></div>
          <div class="cart-item__qtyWrapper">
            <button class="qty-decrease" data-line-key="${item.key}">-</button>
            <input class="cart-qty-input" data-line-key="${item.key}" value="${
        item.quantity
      }" />
            <button class="qty-increase" data-line-key="${item.key}">+</button>
          </div>
          <button class="cart-item__remove-btn" data-line-key="${item.key}">Remove</button>
        </div>`;
      drawer.appendChild(div);
    });
    const subtotal = (cart.items_subtotal_price / 100).toFixed(2);
    const discount = (cart.total_discount / 100).toFixed(2);
    totalEl.innerHTML =
      cart.total_discount > 0
        ? `<div><strong>Discount:</strong> -Rs. ${discount}</div><div><strong>Total:</strong> Rs. ${subtotal}</div>`
        : `<div>Rs. ${subtotal}</div>`;
  }

  function removeCartItem(key) {
    showLoader();
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: key, quantity: 0 }),
    })
      .then((r) => r.json())
      .then((cart) => {
        renderCartItems(cart);
        hideLoader();
      })
      .catch((e) => {
        alert("Remove failed");
        hideLoader();
      });
  }
  function changeCartItemQuantity(key, qty) {
    showLoader();
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: key, quantity: qty < 1 ? 1 : qty }),
    })
      .then((r) => r.json())
      .then((cart) => {
        renderCartItems(cart);
        hideLoader();
      })
      .catch((e) => {
        alert("Update failed");
        hideLoader();
      });
  }

  // === Global Event Handlers ===
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.matches(".qty-increase") || t.matches(".qty-decrease")) {
      const key = t.dataset.lineKey;
      const inp = document.querySelector(
        `input.cart-qty-input[data-line-key="${key}"]`
      );
      let val = parseInt(inp.value, 10) || 1;
      val += t.matches(".qty-increase") ? 1 : -1;
      changeCartItemQuantity(key, Math.max(val, 1));
    }
    if (t.matches(".cart-item__remove-btn")) removeCartItem(t.dataset.lineKey);
    const drawer = document.getElementById("cart-drawer");
    if (
      drawer.classList.contains("is-active") &&
      !drawer.contains(t) &&
      !t.closest("#cart-icon-bubble")
    ) {
      closeCartDrawer();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("input.cart-qty-input")) {
      const key = e.target.dataset.lineKey;
      let v = parseInt(e.target.value, 10);
      changeCartItemQuantity(key, isNaN(v) || v < 1 ? 1 : v);
    }
  });

  // === Initialization ===
  document.addEventListener("DOMContentLoaded", () => {
    hideLoader();
    const trigger = document.getElementById("cart-icon-bubble");
    const drawerEl = document.getElementById("cart-drawer");
    const backdrop = drawerEl.querySelector(".drawer__overlay");
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openCartDrawer();
    });
    drawerEl.querySelectorAll("[data-drawer-close]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeCartDrawer();
      })
    );
    if (backdrop) backdrop.addEventListener("click", closeCartDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawerEl.classList.contains("is-active")) {
        closeCartDrawer();
      }
    });
    fetchCartData();
  });

  console.log("drawer.js loaded");
})(jQuery);
