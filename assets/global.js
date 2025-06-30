(function ($) {
  console.log("functions");

  $(".slick-slider").slick();

  // // product variant
  // $('.product-variant-fielset input[type="radio"]').click(function () {
  //   var productVariant = "";
  //   var optionSelect = $(this).attr("id"); // radio button for and id
  //   var optionSelectVal = $(this).val(); // check me
  //   $("#productSelect option").each(function () {
  //     dataCircleValue = $(this).val(); // get product value id
  //     dataCircle = $(this).attr("data-circle"); // get product label name to match with radio for and id
  //     dataVariantCurrency = $(this).attr("data-variantcurrency"); // get currency code
  //     dataVariantPrice = $(this).attr("data-VariantPrice"); // get price

  //     // console.log('dataCircleValue: ' + dataCircleValue);

  //     console.log("dataCircle: " + dataCircle);
  //     console.log("optionSelect: " + optionSelect);

  //     if (dataCircle == optionSelect) {
  //       $(".jselecteValue").val(dataCircleValue); // pass product id to cart input
  //       $(".product-price").html(
  //         '<span><span class="money" data-currency-' +
  //           dataVariantCurrency +
  //           '="' +
  //           dataVariantCurrency +
  //           " " +
  //           dataVariantPrice +
  //           '">' +
  //           dataVariantCurrency +
  //           " " +
  //           dataVariantPrice +
  //           "</span></span>"
  //       );
  //       var cart_sizelist = [];
  //       var productSelectID = parseInt($(".jselecteValue").val());
  //       var cartContents = fetch(window.Shopify.routes.root + "cart.js")
  //         .then((response) => response.json())
  //         .then((data) => {
  //           $.each(data.items, function (index, cartItem) {
  //             cart_sizelist.push(cartItem.variant_id);
  //           });
  //           if (jQuery.inArray(productSelectID, cart_sizelist) != -1) {
  //             console.log("is in array");
  //             $(".product-form__submit").hide();
  //             $(".product-form__viewcart").show();
  //           } else {
  //             console.log("is NOT in array");
  //             $(".product-form__submit").show();
  //             $(".product-form__viewcart").hide();
  //           }
  //           // verification data
  //           console.log(data.items);
  //           console.log($.inArray(productSelectID, cart_sizelist));
  //           console.log(productSelectID);
  //           console.log(cart_sizelist);
  //         });
  //     }
  //   });
  // });

  // // add to cart ajax
  // $(".product-form__buttons .product-form__submit")
  //   .unbind()
  //   .click(function (e) {
  //     e.preventDefault();
  //     let dataItem = $(".jselecteValue").val();

  //     let formData = {
  //       items: [
  //         {
  //           id: dataItem,
  //           quantity: 1,
  //         },
  //       ],
  //     };

  //     fetch(window.Shopify.routes.root + "cart/add.js", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     })
  //       // let addToCartform = jQuery.post(window.Shopify.routes.root + 'cart/add.js', $('form[action$="/cart/add"]').serialize());
  //       // console.log('addToCartform:: ' + JSON.stringify(addToCartform));

  //       // let addToCartForm = document.querySelector('form[action$="/cart/add"]');
  //       // let formData = new FormData(addToCartForm);
  //       // console.log(formData);
  //       // fetch(window.Shopify.routes.root + "cart/add.js", {
  //       //   method: "POST",
  //       //   body: formData,
  //       // })
  //       .then((response) => {
  //         $(".product-form__submit").hide();
  //         $(".product-form__viewcart").show();
  //         return response.json();
  //       })
  //       .then((data) => {
  //         update_cart();
  //         let cartData = JSON.stringify(data);
  //         let pushmyObj = JSON.parse(cartData);
  //         // let pushDataItem = pushmyObj.items[0];
  //         // var cart_list = [];
  //         // cart_list.push(
  //         //   '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">' +
  //         //     '<div class="toast-body" >' +
  //         //     '<img src="' +
  //         //     pushDataItem.featured_image.url +
  //         //     '&width=48" alt="' +
  //         //     pushDataItem.featured_image.alt +
  //         //     '" width="48" height="64">' +
  //         //     "<div>" +
  //         //     "<p>" +
  //         //     pushDataItem.title +
  //         //     " is added to bag  </p>" +
  //         //     "</div>" +
  //         //     "</div>" +
  //         //     "</div>"
  //         // );
  //         // $(".productToaster")
  //         //   .html(cart_list.join(""))
  //         //   .delay(2000)
  //         //   .fadeOut("slow");
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  //   });
  // document.addEventListener("DOMContentLoaded", function () {
  //   update_cart();
  // });

  // function update_cart() {
  //   var cartContents = fetch(window.Shopify.routes.root + "cart.js")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data.item_count);
  //       $(".header-cart .cart-count span").html(data.item_count);
  //       return data;
  //     });
  // }

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
      const productJsonElement = document.getElementById("ProductJson-" + productId);
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
            const compareEl = document.getElementById("compare-price-" + productId);
            if (priceEl) priceEl.textContent = Shopify.formatMoney(variant.price, Shopify.money_format);
            if (compareEl) {
              if (variant.compare_at_price > variant.price) {
                compareEl.style.display = "inline";
                compareEl.textContent = Shopify.formatMoney(variant.compare_at_price, Shopify.money_format);
              } else {
                compareEl.style.display = "none";
              }
            }

            // Update stock status
            const stockEl = document.getElementById("stock-status-" + productId);
            if (stockEl) {
              stockEl.textContent = variant.available ? "In Stock" : "Out of Stock";
            }
          }
        });
      });
    });
  });
