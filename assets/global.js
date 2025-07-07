(function ($) {
  console.log("Shop JS functions loaded");

  // === DOM Caching for Reuse ===
  const $menuToggleBtn = $("#menu-toggle");
  const $searchToggleBtn = $("#search-toggle");
  const $searchBarContainer = $("#search-bar");
  const $searchCloseBtn = $("#search-close");
  const $searchIconBtn = $("#search-toggle");
  const $navListContainer = $("#header-nav-lists");
  const $headerNormalContainer = $(".header-container.header-normal");
  const $headerHoverContainer = $(".header-container.header-hover");
  const $headerOverlay = $("#header-overlay");
  const $htmlElement = $("html");
  const $bodyElement = $("body");

  // === Control Page Overflow and Overlay ===
  function handlePageOverflowAndOverlay() {
    const isMenuOpen = $navListContainer.hasClass("show");
    const isSearchOpen = $searchBarContainer.hasClass("show");
    if (isMenuOpen || isSearchOpen) {
      $htmlElement.css("overflow", "hidden");
      $bodyElement.css("overflow", "hidden");
      $headerOverlay.addClass("show");
    } else {
      $htmlElement.css("overflow", "");
      $bodyElement.css("overflow", "");
      $headerOverlay.removeClass("show");
    }
  }

  // === Menu Toggle Handler ===
  $menuToggleBtn.on("click", function () {
    if ($searchBarContainer.hasClass("show")) {
      $searchBarContainer.removeClass("show");
      $searchIconBtn.removeClass("hide");
      $headerHoverContainer.removeClass("show");
      $headerNormalContainer.addClass("show");
    }
    $navListContainer.toggleClass("show");
    handlePageOverflowAndOverlay();
  });

  // === Search Toggle Handler ===
  $searchToggleBtn.on("click", function () {
    if ($navListContainer.hasClass("show")) {
      $navListContainer.removeClass("show");
    }
    $searchBarContainer.toggleClass("show");
    $searchIconBtn.toggleClass("hide");
    $navListContainer.toggleClass("hide", $searchBarContainer.hasClass("show"));
    if ($searchBarContainer.hasClass("show")) {
      $headerHoverContainer.addClass("show");
      $headerNormalContainer.removeClass("show");
    } else {
      $headerHoverContainer.removeClass("show");
      $headerNormalContainer.addClass("show");
    }
    handlePageOverflowAndOverlay();
  });

  // === Close Search Bar Handler ===
  $searchCloseBtn.on("click", function () {
    $searchBarContainer.removeClass("show");
    $searchIconBtn.removeClass("hide");
    $navListContainer.removeClass("hide");
    $headerHoverContainer.removeClass("show");
    $headerNormalContainer.addClass("show");
    handlePageOverflowAndOverlay();
  });

  // === Header Overlay Click (closes menus) ===
  $headerOverlay.on("click", function () {
    $searchBarContainer.removeClass("show");
    $headerHoverContainer.removeClass("show");
    $headerNormalContainer.addClass("show");
    $searchIconBtn.removeClass("hide");
    $navListContainer.removeClass("show hide");
    handlePageOverflowAndOverlay();
  });

  // === Slick Slider Initialization ===
  $(".slick-slider").slick({});

  // === Gallery Thumbnail Click (Image Switch) ===
  $("#gallery_01 a").on("click", function () {
    const imageUrl = $(this).data("image");
    const zoomImageUrl = $(this).data("zoom-image");
    const $galleryPicture = $(".test-gallery").closest("picture");
    $(".test-gallery").attr("src", imageUrl).attr("data-zoom-image", zoomImageUrl);
    $galleryPicture
      .find("source[type='image/avif']")
      .attr("srcset", imageUrl.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));
    $galleryPicture
      .find("source[type='image/webp']")
      .attr("srcset", imageUrl.replace(/\.(jpg|jpeg|png)$/, ".webp"));
  });

  // === Product Modal Handlers ===
  function closeProductModalById(productId) {
    $("#product-modal-" + productId).removeClass("product-modal--show");
    $("body").removeClass("overflow-hidden");
  }
  window.openProductModal = function (productId) {
    $("#product-modal-" + productId).addClass("product-modal--show");
    $("body").addClass("overflow-hidden");
  };
  window.closeProductModal = closeProductModalById;

  // === Product Modal: Add to Cart Button ===
  document.addEventListener("click", function (event) {
    if (event.target.matches(".product-modal__buttons--cart")) {
      event.preventDefault();
      window.addToCart(event.target);
    }
  });

  // === Product Modal: Buy Now Button ===
  document.addEventListener("click", function (event) {
    if (event.target.matches(".product-modal__buttons--buy-now")) {
      event.preventDefault();
      console.log("Buy Now button clicked");
    }
  });

  // === Quantity Updater Utility ===
  window.updateQty = function (btn, diff) {
    const $qtyInput = $(btn).siblings(".qty-input");
    let currentQty = parseInt($qtyInput.val(), 10) || 1;
    currentQty = Math.max(currentQty + diff, 1);
    $qtyInput.val(currentQty);
  };

  // === AJAX Add To Cart (Generic) ===
  window.addToCart = function (btn) {
    const $productForm = $(btn).closest("form");
    const formData = new FormData($productForm[0]);
    const productId = $productForm.data("product-id");
    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((res) => res.json())
      .then(() => {
        closeProductModalById(productId);
        openCartDrawer();
      })
      .catch((err) => console.error("Add to cart error:", err));
  };

  // === AJAX Product Form (Variants & Cart) ===
  $(".product-form-ajax").each(function () {
    const $ajaxForm = $(this);
    const productId = $ajaxForm.data("product-id");
    const $productJsonElem = $("#ProductJson-" + productId);
    if (!$productJsonElem.length) return;
    const productData = JSON.parse($productJsonElem.text());

    // Disable unavailable variants
    $ajaxForm.find("fieldset").each(function (optionIdx) {
      $(this)
        .find("input[type='radio']")
        .each(function () {
          const value = $(this).val();
          const available = productData.variants.some(
            (variant) => variant.options[optionIdx] === value && variant.available
          );
          $(this).prop("disabled", !available).parent().toggleClass("disabled", !available);
        });
    });

    // On variant change
    $ajaxForm.find("input[type='radio']").on("change", function () {
      const selectedOptions = [];
      $ajaxForm.find("fieldset").each(function (fieldsetIdx) {
        selectedOptions[fieldsetIdx] = $(this).find("input:checked").val() || "";
      });
      const selectedVariant = productData.variants.find((variant) =>
        variant.options.every((opt, idx) => opt === selectedOptions[idx])
      );
      if (selectedVariant) {
        $ajaxForm.find(".selected-variant-id").val(selectedVariant.id);
        const $priceEl = $("#price-" + productId);
        const $comparePriceEl = $("#compare-price-" + productId);
        if ($priceEl.length)
          $priceEl.text(Shopify.formatMoney(selectedVariant.price, Shopify.money_format));
        if ($comparePriceEl.length) {
          if (selectedVariant.compare_at_price > selectedVariant.price)
            $comparePriceEl.show().text(Shopify.formatMoney(selectedVariant.compare_at_price, Shopify.money_format));
          else
            $comparePriceEl.hide();
        }
        const $stockStatusEl = $("#stock-status-" + productId);
        if ($stockStatusEl.length)
          $stockStatusEl.text(selectedVariant.available ? "In Stock" : "Out of Stock");
      }
    });

    // On AJAX form submit
    $ajaxForm.on("submit", function (event) {
      event.preventDefault();
      const variantId = $ajaxForm.find(".selected-variant-id").val();
      const quantity = parseInt($ajaxForm.find(".qty-input").val(), 10) || 1;
      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items: [{ id: variantId, quantity: quantity }] })
      })
        .then((res) => res.json())
        .then(() => {
          closeProductModalById(productId);
          openCartDrawer();
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });

  // === Cart Drawer Open/Close ===
  function openCartDrawer() {
    const cartDrawer = document.getElementById("cart-drawer");
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-active", "is-visible");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    fetchCartData();
  }
  function closeCartDrawer() {
    const cartDrawer = document.getElementById("cart-drawer");
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-visible", "is-active");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // === Loader Show/Hide ===
  function showLoader() {
    const loaderElem = document.getElementById("loader");
    if (loaderElem) loaderElem.style.display = "block";
  }
  function hideLoader() {
    const loaderElem = document.getElementById("loader");
    if (loaderElem) loaderElem.style.display = "none";
  }

  // === Fetch and Render Cart Data ===
  function fetchCartData() {
    fetch("/cart.js")
      .then((response) => response.json())
      .then((cart) => {
        renderCartDrawerItems(cart);
      })
      .catch((error) => console.error("fetchCartData error", error));
  }
  function renderCartDrawerItems(cart) {
    const cartDrawerItems = document.querySelector(".cart__drawer_items");
    const emptyCartMsg = document.getElementById("cart-item-empty");
    const totalPriceElem = document.getElementById("cart__total_price");
    if (!cartDrawerItems || !emptyCartMsg || !totalPriceElem) return;
    cartDrawerItems.innerHTML = "";
    if (!cart.items || cart.items.length === 0) {
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
           <div class="delete">
          <button class="cart-item__remove-btn" data-line-key="${item.key}">Remove</button>
          </div>
          </div>
        </div>`;
      cartDrawerItems.appendChild(itemDiv);
    });
    const subtotal = (cart.items_subtotal_price / 100).toFixed(2);
    const discount = (cart.total_discount / 100).toFixed(2);
    totalPriceElem.innerHTML =
      cart.total_discount > 0
        ? `<div><strong>Discount:</strong> -Rs. ${discount}</div><div><strong>Total:</strong> Rs. ${subtotal}</div>`
        : `<div>Rs. ${subtotal}</div>`;
  }

  function removeCartItemByKey(itemKey) {
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
      })
      .catch((error) => {
        alert("Remove failed");
        hideLoader();
      });
  }
  function updateCartItemQuantity(itemKey, newQty) {
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
      })
      .catch((error) => {
        alert("Update failed");
        hideLoader();
      });
  }

  // === Global Event Handlers (Cart Drawer + Qty) ===
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.matches(".qty-increase") || target.matches(".qty-decrease")) {
      const lineKey = target.dataset.lineKey;
      const qtyInput = document.querySelector(`input.cart-qty-input[data-line-key="${lineKey}"]`);
      let currentQty = parseInt(qtyInput.value, 10) || 1;
      currentQty += target.matches(".qty-increase") ? 1 : -1;
      updateCartItemQuantity(lineKey, Math.max(currentQty, 1));
    }
    if (target.matches(".cart-item__remove-btn")) removeCartItemByKey(target.dataset.lineKey);
    const cartDrawer = document.getElementById("cart-drawer");
    if (
      cartDrawer.classList.contains("is-active") &&
      !cartDrawer.contains(target) &&
      !target.closest("#cart-icon-bubble")
    ) {
      closeCartDrawer();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("input.cart-qty-input")) {
      const lineKey = event.target.dataset.lineKey;
      let inputVal = parseInt(event.target.value, 10);
      updateCartItemQuantity(lineKey, isNaN(inputVal) || inputVal < 1 ? 1 : inputVal);
    }
  });

  // === Initialization on DOM Ready ===
  document.addEventListener("DOMContentLoaded", () => {
    hideLoader();
    const $cartTrigger = document.getElementById("cart-icon-bubble");
    const $cartDrawer = document.getElementById("cart-drawer");
    const $cartDrawerBackdrop = $cartDrawer.querySelector(".drawer__overlay");
    $cartTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      openCartDrawer();
    });
    $cartDrawer.querySelectorAll("[data-drawer-close]").forEach((btn) =>
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        closeCartDrawer();
      })
    );
    if ($cartDrawerBackdrop) $cartDrawerBackdrop.addEventListener("click", closeCartDrawer);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && $cartDrawer.classList.contains("is-active")) {
        closeCartDrawer();
      }
    });
    fetchCartData();
  });

  console.log("shop-drawer.js loaded");
})(jQuery);
