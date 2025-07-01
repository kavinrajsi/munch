(function ($) {
  console.log("functions");

  $(".slick-slider").slick();

  $("#gallery_01 a").on("click", function () {
    var dataImage = $(this).data("image");
    var dataZoomImage = $(this).data("zoom-image");

    // Get the picture element wrapping the .test-gallery image
    var $picture = $(".test-gallery").closest("picture");

    // Update the img src and data-zoom-image
    $(".test-gallery").attr("src", dataImage);
    $(".test-gallery").attr("data-zoom-image", dataZoomImage);

    // Update the AVIF source srcset
    $picture
      .find("source[type='image/avif']")
      .attr("srcset", dataImage.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));

    // Update the WEBP source srcset
    $picture
      .find("source[type='image/webp']")
      .attr("srcset", dataImage.replace(/\.(jpg|jpeg|png)$/, ".webp"));

    console.log("Updated image src and sources.");
  });

  //Functions, Plugins, Etc.. Here
  //(does not wait for DOM READY STATE)
})(jQuery);

// Product Modal
document.addEventListener("DOMContentLoaded", function () {
  // Utilities
  function updateCartCount() {
    fetch("/cart.js")
      .then((res) => res.json())
      .then((cart) => {
        const cartCountEls = document.querySelectorAll(".cart-count");
        cartCountEls.forEach((el) => {
          el.textContent = cart.item_count;
        });
      });
  }

  function closeModal(productId) {
    const modal = document.getElementById("product-modal-" + productId);
    if (modal) {
      modal.classList.remove("product-modal--show");
      document.body.classList.remove("overflow-hidden");
    }
  }

  window.openProductModal = function (productId) {
    const modal = document.getElementById("product-modal-" + productId);
    if (modal) {
      modal.classList.add("product-modal--show");
      document.body.classList.add("overflow-hidden");
    }
  };

  window.closeProductModal = closeModal;

  // Close modal when clicking outside content
  window.onclick = function (event) {
    document.querySelectorAll(".product-modal").forEach((modal) => {
      if (event.target === modal) {
        modal.classList.remove("product-modal--show");
        document.body.classList.remove("overflow-hidden");
      }
    });
  };

  // Quantity buttons
  window.updateQty = function (button, change) {
    const input = button.parentElement.querySelector(".qty-input");
    let qty = parseInt(input.value) || 1;
    qty = Math.max(qty + change, 1);
    input.value = qty;
  };

  // Add to Cart button
  window.addToCart = function (button) {
    const form = button.closest("form");
    const formData = new FormData(form);
    const productId = form.dataset.productId;

    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        alert("✅ Added to cart!");
        updateCartCount();
        closeModal(productId);
      })
      .catch((err) => {
        console.error("Add to cart error:", err);
      });
  };

  // Form submit (Buy Now via AJAX)
  document.querySelectorAll(".product-form-ajax").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const productId = form.dataset.productId;
      const variantId = form.querySelector(".selected-variant-id").value;
      const qty = parseInt(form.querySelector(".qty-input").value) || 1;
      const responseBox = form.querySelector(".ajax-cart-response");

      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] }),
      })
        .then((res) => res.json())
        .then(() => {
          responseBox.textContent = "✅ Added to cart!";
          responseBox.style.display = "block";
          responseBox.style.color = "green";
          updateCartCount();
          closeModal(productId);
        })
        .catch((error) => {
          responseBox.textContent = "❌ Error adding to cart.";
          responseBox.style.display = "block";
          responseBox.style.color = "red";
          console.error("Cart error:", error);
        });
    });

    // Variant radio button logic
    const productId = form.dataset.productId;
    const radios = form.querySelectorAll('input[type="radio"]');
    const productJsonElement = document.getElementById(
      "ProductJson-" + productId
    );
    if (!productJsonElement) return;

    const productData = JSON.parse(productJsonElement.textContent);

    // Disable unavailable variant values
    form.querySelectorAll("fieldset").forEach((fieldset, optionIndex) => {
      const valueRadios = fieldset.querySelectorAll("input[type='radio']");
      valueRadios.forEach((radio) => {
        const value = radio.value;
        const isAvailable = productData.variants.some((variant) => {
          return variant.options[optionIndex] === value && variant.available;
        });

        radio.disabled = !isAvailable;
        if (!isAvailable) {
          radio.parentElement.classList.add("disabled");
        }
      });
    });

    // Handle variant changes
    radios.forEach((input) => {
      input.addEventListener("change", function () {
        const selectedOptions = [];
        form.querySelectorAll("fieldset").forEach((fieldset, index) => {
          const selected = fieldset.querySelector("input:checked");
          selectedOptions[index] = selected ? selected.value : "";
        });

        const variant = productData.variants.find((v) =>
          v.options.every((val, i) => val === selectedOptions[i])
        );

        if (variant) {
          form.querySelector(".selected-variant-id").value = variant.id;

          // Update price
          const priceEl = document.getElementById("price-" + productId);
          const compareEl = document.getElementById(
            "compare-price-" + productId
          );
          if (priceEl)
            priceEl.textContent = Shopify.formatMoney(
              variant.price,
              Shopify.money_format
            );
          if (compareEl) {
            if (variant.compare_at_price > variant.price) {
              compareEl.style.display = "inline";
              compareEl.textContent = Shopify.formatMoney(
                variant.compare_at_price,
                Shopify.money_format
              );
            } else {
              compareEl.style.display = "none";
            }
          }

          // Update stock status
          const stockEl = document.getElementById("stock-status-" + productId);
          if (stockEl) {
            stockEl.textContent = variant.available
              ? "In Stock"
              : "Out of Stock";
          }
        }
      });
    });
  });
});
