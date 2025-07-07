// (function ($) {
//   console.log("functions");

//   // === DOM Caching for Reuse ===
//   const $menuToggle = $('#menu-toggle');
//   const $searchToggle = $('#search-toggle');
//   const $searchBar = $('#search-bar');
//   const $searchClose = $('#search-close');
//   const $searchIcon = $('#search-toggle');
//   const $headerNavList = $('#header-nav-lists');
//   const $headerNormal = $('.header-container.header-normal');
//   const $headerHover = $('.header-container.header-hover');
//   const $overlay = $('#header-overlay');
//   const $html = $('html');
//   const $body = $('body');

//   // === Manage overflow and overlay visibility based on open menus/search ===
//   function updateOverflow() {
//     const menuOpen = $headerNavList.hasClass('show');
//     const searchOpen = $searchBar.hasClass('show');

//     if (menuOpen || searchOpen) {
//       $html.css('overflow', 'hidden');
//       $body.css('overflow', 'hidden');
//       $overlay.addClass('show');
//     } else {
//       $html.css('overflow', '');
//       $body.css('overflow', '');
//       $overlay.removeClass('show');
//     }
//   }

//   // === Toggle mobile menu ===
//   $menuToggle.on('click', function () {
//     // Close search if it's open
//     if ($searchBar.hasClass('show')) {
//       $searchBar.removeClass('show');
//       $searchIcon.removeClass('hide');
//       $headerHover.removeClass('show');
//       $headerNormal.addClass('show');
//     }

//     // Toggle nav list and update overflow state
//     $headerNavList.toggleClass('show');
//     updateOverflow();
//   });

//   // === Toggle search bar ===
//   $searchToggle.on('click', function () {
//     // Close nav if it's open
//     if ($headerNavList.hasClass('show')) {
//       $headerNavList.removeClass('show');
//     }

//     // Toggle search bar and related elements
//     $searchBar.toggleClass('show');
//     $searchIcon.toggleClass('hide');
//     $headerNavList.toggleClass('hide', $searchBar.hasClass('show'));

//     if ($searchBar.hasClass('show')) {
//       $headerHover.addClass('show');
//       $headerNormal.removeClass('show');
//     } else {
//       $headerHover.removeClass('show');
//       $headerNormal.addClass('show');
//     }

//     updateOverflow();
//   });

//   // === Close search bar when clicking close icon ===
//   $searchClose.on('click', function () {
//     $searchBar.removeClass('show');
//     $searchIcon.removeClass('hide');
//     $headerNavList.removeClass('hide');
//     $headerHover.removeClass('show');
//     $headerNormal.addClass('show');

//     updateOverflow();
//   });

//   // === Clicking outside (overlay) closes menu/search ===
//   $overlay.on('click', function () {
//     $searchBar.removeClass('show');
//     $headerHover.removeClass('show');
//     $headerNormal.addClass('show');
//     $searchIcon.removeClass('hide');
//     $headerNavList.removeClass('show hide');

//     updateOverflow();
//   });

//   // === Initialize slick slider plugin ===
//   $(".slick-slider").slick({});

//   // === Image gallery thumbnail click handler ===
//   $("#gallery_01 a").on("click", function () {
//     var dataImage = $(this).data("image");
//     var dataZoomImage = $(this).data("zoom-image");

//     var $picture = $(".test-gallery").closest("picture");

//     $(".test-gallery").attr("src", dataImage);
//     $(".test-gallery").attr("data-zoom-image", dataZoomImage);

//     $picture.find("source[type='image/avif']").attr("srcset", dataImage.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));
//     $picture.find("source[type='image/webp']").attr("srcset", dataImage.replace(/\.(jpg|jpeg|png)$/, ".webp"));

//     console.log("Updated image src and sources.");
//   });

//   // === Update cart item count badge ===
//   function updateCartCount() {
//     $.getJSON("/cart.js", function (cart) {
//       $(".cart-count").text(cart.item_count);
//     });
//   }

//   // === Close product modal by ID ===
//   function closeModal(productId) {
//     $("#product-modal-" + productId).removeClass("product-modal--show");
//     $("body").removeClass("overflow-hidden");
//   }

//   // === Expose open modal function globally ===
//   window.openProductModal = function (productId) {
//     $("#product-modal-" + productId).addClass("product-modal--show");
//     $("body").addClass("overflow-hidden");
//   };

//   // === Assign to global scope to close modals ===
//   window.closeProductModal = closeModal;

//   // === Close modal if click outside content ===
//   $(window).on("click", function (e) {
//     $(".product-modal").each(function () {
//       if (e.target === this) {
//         $(this).removeClass("product-modal--show");
//         $("body").removeClass("overflow-hidden");
//       }
//     });
//   });

//   // === Quantity change (plus/minus buttons) ===
//   window.updateQty = function (button, change) {
//     const $input = $(button).siblings(".qty-input");
//     let qty = parseInt($input.val()) || 1;
//     qty = Math.max(qty + change, 1);
//     $input.val(qty);
//   };

//   // === Add to cart via button click ===
//   window.addToCart = function (button) {
//     const $form = $(button).closest("form");
//     const formData = new FormData($form[0]);
//     const productId = $form.data("product-id");

//     fetch("/cart/add.js", {
//       method: "POST",
//       body: formData,
//       headers: { Accept: "application/json" },
//     })
//       .then((res) => res.json())
//       .then(() => {
//         alert("✅ Added to cart!");
//         updateCartCount();
//         closeModal(productId);
//       })
//       .catch((err) => {
//         console.error("Add to cart error:", err);
//       });
//   };

//   // === Handle variant availability and AJAX add-to-cart ===
//   $(".product-form-ajax").each(function () {
//     const $form = $(this);
//     const productId = $form.data("product-id");
//     const productJsonElement = $("#ProductJson-" + productId);
//     if (!productJsonElement.length) return;

//     const productData = JSON.parse(productJsonElement.text());

//     // Disable unavailable variant inputs
//     $form.find("fieldset").each(function (optionIndex) {
//       $(this).find("input[type='radio']").each(function () {
//         const value = $(this).val();
//         const isAvailable = productData.variants.some((variant) => variant.options[optionIndex] === value && variant.available);
//         $(this).prop("disabled", !isAvailable);
//         if (!isAvailable) $(this).parent().addClass("disabled");
//       });
//     });

//     // Handle variant selection
//     $form.find("input[type='radio']").on("change", function () {
//       const selectedOptions = [];

//       $form.find("fieldset").each(function (index) {
//         selectedOptions[index] = $(this).find("input:checked").val() || "";
//       });

//       const variant = productData.variants.find((v) =>
//         v.options.every((val, i) => val === selectedOptions[i])
//       );

//       if (variant) {
//         $form.find(".selected-variant-id").val(variant.id);

//         const priceEl = $("#price-" + productId);
//         const compareEl = $("#compare-price-" + productId);

//         if (priceEl.length) {
//           priceEl.text(Shopify.formatMoney(variant.price, Shopify.money_format));
//         }

//         if (compareEl.length) {
//           if (variant.compare_at_price > variant.price) {
//             compareEl.show().text(Shopify.formatMoney(variant.compare_at_price, Shopify.money_format));
//           } else {
//             compareEl.hide();
//           }
//         }

//         const stockEl = $("#stock-status-" + productId);
//         if (stockEl.length) {
//           stockEl.text(variant.available ? "In Stock" : "Out of Stock");
//         }
//       }
//     });

//     // === AJAX form submission for "Buy Now" ===
//     $form.on("submit", function (e) {
//       e.preventDefault();
//       const variantId = $form.find(".selected-variant-id").val();
//       const qty = parseInt($form.find(".qty-input").val()) || 1;
//       const responseBox = $form.find(".ajax-cart-response");

//       fetch("/cart/add.js", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] }),
//       })
//         .then((res) => res.json())
//         .then(() => {
//           responseBox.text("✅ Added to cart!").css({ display: "block", color: "green" });
//           updateCartCount();
//           closeModal(productId);
//         })
//         .catch((error) => {
//           responseBox.text("❌ Error adding to cart.").css({ display: "block", color: "red" });
//           console.error("Cart error:", error);
//         });
//     });
//   });

//   // === Open product modal on "select options" ===
//   $('.select-option-button').on('click', function () {
//     const handle = $(this).data('product-handle');

//     $('#product-slide-modal').removeClass('hidden').addClass('product-modal--show');
//     $('.product-modal__overlay, .product-modal__content').addClass('is-active');
//     $('#image-spinner').show();

//     $.ajax({
//       url: `/products/${handle}.js`,
//       method: 'GET',
//       dataType: 'json',
//       success: function (productData) {
//         window.currentProductData = productData;

//         const variant = productData.variants[0];
//         updateVariantInfo(variant);

//         $('#modal-title').text(productData.title);
//         $('#modal-description').html(productData.description);
//         $('#modal-view-details').attr('href', productData.url);

//         preloadImage(productData.featured_image, function () {
//           $('#modal-image').attr('src', productData.featured_image);
//           $('#image-spinner').hide();
//         });

//         const $optionsContainer = $('#modal-variant-options');
//         $optionsContainer.empty();

//         // Render options dynamically
//         $.each(productData.options, function (index, optionName) {
//           if (optionName === 'Title') return;

//           const $fieldset = $('<fieldset>', { class: 'product-option', 'data-option-index': index });
//           const $legend = $('<legend>').text(optionName);
//           $fieldset.append($legend);

//           const values = new Set();
//           productData.variants.forEach(v => values.add(v.options[index]));

//           values.forEach(value => {
//             const id = `option-${index}-${value.replace(/\s+/g, '-')}`;
//             const $label = $('<label>', { class: 'swatch', for: id });
//             const $input = $('<input>', {
//               type: 'radio',
//               name: `option-${index}`,
//               value: value,
//               id: id
//             });

//             const matchingVariants = productData.variants.filter(v => v.options[index] === value);
//             const anyAvailable = matchingVariants.some(v => v.available);

//             if (!anyAvailable) {
//               $input.prop('disabled', true);
//               $label.css('opacity', 0.5).attr('title', 'Out of stock');
//             }

//             if (value === variant.options[index]) {
//               $input.prop('checked', true);
//             }

//             const $span = $('<span>').text(value);
//             $label.append($input).append($span);
//             $fieldset.append($label);
//           });

//           $optionsContainer.append($fieldset);
//         });

//         $('#modal-qty').val(1);
//       },
//       error: function () {
//         alert('Failed to load product data.');
//         $('#image-spinner').hide();
//       }
//     });
//   });

//   // === When a variant option is changed ===
//   $(document).on('change', 'input[name^="option-"]', function () {
//     const variant = getSelectedVariant(window.currentProductData);
//     if (variant) updateVariantInfo(variant);
//   });

//   // === Updates variant info in modal ===
//   function updateVariantInfo(variant) {
//     $('#modal-price').text(Shopify.formatMoney(variant.price));

//     if (variant.compare_at_price && variant.compare_at_price > variant.price) {
//       $('#modal-compare-price').text(Shopify.formatMoney(variant.compare_at_price)).show();
//     } else {
//       $('#modal-compare-price').hide();
//     }

//     const stockText = variant.available
//       ? (variant.inventory_management === 'shopify'
//           ? `In Stock (${variant.inventory_quantity})`
//           : 'In Stock')
//       : 'Out of Stock';
//     $('#modal-status').text(stockText);

//     if (variant.featured_image && variant.featured_image.src) {
//       $('#image-spinner').show();
//       preloadImage(variant.featured_image.src, function () {
//         $('#modal-image').attr('src', variant.featured_image.src);
//         $('#image-spinner').hide();
//       });
//     }
//   }

//   // === Populate modal with additional product data ===
//   function openProductModal(product) {
//     document.getElementById('modal-title').textContent = product.title;
//     document.getElementById('modal-price').textContent = product.price;
//     document.getElementById('modal-stock-status').textContent = product.available ? "In Stock" : "Out of Stock";
//     document.getElementById('modal-image').src = product.featured_image;

//     document.getElementById('modal-sku').textContent = product.variants[0].sku || 'N/A';
//     document.getElementById('modal-tags').textContent = product.tags.join(', ') || 'None';
//     document.getElementById('modal-collection').textContent = product.collection || 'Uncategorized';
//     document.getElementById('modal-vendor').textContent = product.vendor || 'Unknown';
//     document.getElementById('modal-product-type').textContent = product.product_type || 'N/A';

//     document.getElementById('product-slide-modal').classList.remove('hidden');
//   }

//   // === Helper: Preload image ===
//   function preloadImage(src, callback) {
//     const img = new Image();
//     img.onload = callback;
//     img.onerror = callback;
//     img.src = src;
//   }

//   // === Get currently selected variant from modal ===
//   function getSelectedVariant(productData) {
//     const selectedOptions = [];
//     productData.options.forEach((_, index) => {
//       const value = $(`input[name="option-${index}"]:checked`).val();
//       selectedOptions.push(value);
//     });

//     return productData.variants.find(v =>
//       v.options.every((opt, i) => opt === selectedOptions[i])
//     );
//   }

//   // === Reassign updateQty (override) ===
//   window.updateQty = function (btn, change) {
//     const $input = $(btn).siblings('input');
//     const val = parseInt($input.val()) || 1;
//     $input.val(Math.max(1, val + change));
//   };

//   // === Add to cart from modal ===
//   $('#modal-add-to-cart').on('click', function () {
//     const variant = getSelectedVariant(window.currentProductData);
//     const qty = parseInt($('#modal-qty').val()) || 1;
//     if (!variant || !variant.available) return alert('Variant unavailable.');

//     $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
//       alert('Added to cart!');
//       closeProductModal();
//     });
//   });

//   // === Buy now from modal ===
//   $('#modal-buy-now').on('click', function () {
//     const variant = getSelectedVariant(window.currentProductData);
//     const qty = parseInt($('#modal-qty').val()) || 1;
//     if (!variant || !variant.available) return alert('Variant unavailable.');

//     $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
//       window.location.href = '/checkout';
//     });
//   });

//   // === Close modal and reset UI ===
//   window.closeProductModal = function () {
//     $('#product-slide-modal').removeClass('product-modal--show').addClass('hidden');
//     $('.product-modal__overlay, .product-modal__content').removeClass('is-active');
//   };

//   // === Allow modal close via background click or Escape key ===
//   $('.product-modal__overlay').on('click', closeProductModal);
//   $(document).on('keydown', function (e) {
//     if (e.key === 'Escape') closeProductModal();
//   });

//   // === Additional plugins/functions can go below ===

// })(jQuery);


(function ($) {
  console.log("functions");

  // === DOM Caching for Reuse ===
  const $menuToggle = $('#menu-toggle');
  const $searchToggle = $('#search-toggle');
  const $searchBar = $('#search-bar');
  const $searchClose = $('#search-close');
  const $searchIcon = $('#search-toggle');
  const $headerNavList = $('#header-nav-lists');
  const $headerNormal = $('.header-container.header-normal');
  const $headerHover = $('.header-container.header-hover');
  const $overlay = $('#header-overlay');
  const $html = $('html');
  const $body = $('body');

  // === Manage overflow and overlay visibility based on open menus/search ===
  function updateOverflow() {
    const menuOpen = $headerNavList.hasClass('show');
    const searchOpen = $searchBar.hasClass('show');

    if (menuOpen || searchOpen) {
      $html.css('overflow', 'hidden');
      $body.css('overflow', 'hidden');
      $overlay.addClass('show');
    } else {
      $html.css('overflow', '');
      $body.css('overflow', '');
      $overlay.removeClass('show');
    }
  }

  // === Toggle mobile menu ===
  $menuToggle.on('click', function () {
    // Close search if it's open
    if ($searchBar.hasClass('show')) {
      $searchBar.removeClass('show');
      $searchIcon.removeClass('hide');
      $headerHover.removeClass('show');
      $headerNormal.addClass('show');
    }

    // Toggle nav list and update overflow state
    $headerNavList.toggleClass('show');
    updateOverflow();
  });

  // === Toggle search bar ===
  $searchToggle.on('click', function () {
    // Close nav if it's open
    if ($headerNavList.hasClass('show')) {
      $headerNavList.removeClass('show');
    }

    // Toggle search bar and related elements
    $searchBar.toggleClass('show');
    $searchIcon.toggleClass('hide');
    $headerNavList.toggleClass('hide', $searchBar.hasClass('show'));

    if ($searchBar.hasClass('show')) {
      $headerHover.addClass('show');
      $headerNormal.removeClass('show');
    } else {
      $headerHover.removeClass('show');
      $headerNormal.addClass('show');
    }

    updateOverflow();
  });

  // === Close search bar when clicking close icon ===
  $searchClose.on('click', function () {
    $searchBar.removeClass('show');
    $searchIcon.removeClass('hide');
    $headerNavList.removeClass('hide');
    $headerHover.removeClass('show');
    $headerNormal.addClass('show');

    updateOverflow();
  });

  // === Clicking outside (overlay) closes menu/search ===
  $overlay.on('click', function () {
    $searchBar.removeClass('show');
    $headerHover.removeClass('show');
    $headerNormal.addClass('show');
    $searchIcon.removeClass('hide');
    $headerNavList.removeClass('show hide');

    updateOverflow();
  });

  // === Initialize slick slider plugin ===
  $(".slick-slider").slick({});

  // === Image gallery thumbnail click handler ===
  $("#gallery_01 a").on("click", function () {
    var dataImage = $(this).data("image");
    var dataZoomImage = $(this).data("zoom-image");

    var $picture = $(".test-gallery").closest("picture");

    $(".test-gallery").attr("src", dataImage);
    $(".test-gallery").attr("data-zoom-image", dataZoomImage);

    $picture.find("source[type='image/avif']").attr("srcset", dataImage.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));
    $picture.find("source[type='image/webp']").attr("srcset", dataImage.replace(/\.(jpg|jpeg|png)$/, ".webp"));

    console.log("Updated image src and sources.");
  });

  // === Update cart item count badge ===
  function updateCartCount() {
    $.getJSON("/cart.js", function (cart) {
      $(".cart-count").text(cart.item_count);
    });
  }

  // === Close product modal by ID ===
  function closeModal(productId) {
    $("#product-modal-" + productId).removeClass("product-modal--show");
    $("body").removeClass("overflow-hidden");
  }

  // === Expose open modal function globally ===
  window.openProductModal = function (productId) {
    $("#product-modal-" + productId).addClass("product-modal--show");
    $("body").addClass("overflow-hidden");
  };

  // === Assign to global scope to close modals ===
  window.closeProductModal = closeModal;

  // === Close modal if click outside content ===
  $(window).on("click", function (e) {
    $(".product-modal").each(function () {
      if (e.target === this) {
        $(this).removeClass("product-modal--show");
        $("body").removeClass("overflow-hidden");
      }
    });
  });

  // === Quantity change (plus/minus buttons) ===
  window.updateQty = function (button, change) {
    const $input = $(button).siblings(".qty-input");
    let qty = parseInt($input.val()) || 1;
    qty = Math.max(qty + change, 1);
    $input.val(qty);
  };

  // === Add to cart via button click ===
  window.addToCart = function (button) {
    const $form = $(button).closest("form");
    const formData = new FormData($form[0]);
    const productId = $form.data("product-id");

    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
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

  // === Handle variant availability and AJAX add-to-cart ===
  $(".product-form-ajax").each(function () {
    const $form = $(this);
    const productId = $form.data("product-id");
    const productJsonElement = $("#ProductJson-" + productId);
    if (!productJsonElement.length) return;

    const productData = JSON.parse(productJsonElement.text());

    // Disable unavailable variant inputs
    $form.find("fieldset").each(function (optionIndex) {
      $(this).find("input[type='radio']").each(function () {
        const value = $(this).val();
        const isAvailable = productData.variants.some((variant) => variant.options[optionIndex] === value && variant.available);
        $(this).prop("disabled", !isAvailable);
        if (!isAvailable) $(this).parent().addClass("disabled");
      });
    });

    // Handle variant selection
    $form.find("input[type='radio']").on("change", function () {
      const selectedOptions = [];

      $form.find("fieldset").each(function (index) {
        selectedOptions[index] = $(this).find("input:checked").val() || "";
      });

      const variant = productData.variants.find((v) =>
        v.options.every((val, i) => val === selectedOptions[i])
      );

      if (variant) {
        $form.find(".selected-variant-id").val(variant.id);

        const priceEl = $("#price-" + productId);
        const compareEl = $("#compare-price-" + productId);

        if (priceEl.length) {
          priceEl.text(Shopify.formatMoney(variant.price, Shopify.money_format));
        }

        if (compareEl.length) {
          if (variant.compare_at_price > variant.price) {
            compareEl.show().text(Shopify.formatMoney(variant.compare_at_price, Shopify.money_format));
          } else {
            compareEl.hide();
          }
        }

        const stockEl = $("#stock-status-" + productId);
        if (stockEl.length) {
          stockEl.text(variant.available ? "In Stock" : "Out of Stock");
        }
      }
    });

    // === AJAX form submission for "Buy Now" ===
    $form.on("submit", function (e) {
      e.preventDefault();
      const variantId = $form.find(".selected-variant-id").val();
      const qty = parseInt($form.find(".qty-input").val()) || 1;
      const responseBox = $form.find(".ajax-cart-response");

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
          responseBox.text("✅ Added to cart!").css({ display: "block", color: "green" });
          updateCartCount();
          closeModal(productId);
        })
        .catch((error) => {
          responseBox.text("❌ Error adding to cart.").css({ display: "block", color: "red" });
          console.error("Cart error:", error);
        });
    });
  });

  // === Open product modal on "select options" ===
  $('.select-option-button').on('click', function () {
    const handle = $(this).data('product-handle');

    $('#product-slide-modal').removeClass('hidden').addClass('product-modal--show');
    $('.product-modal__overlay, .product-modal__content').addClass('is-active');
    $('#image-spinner').show();

    $.ajax({
      url: `/products/${handle}.js`,
      method: 'GET',
      dataType: 'json',
      success: function (productData) {
        window.currentProductData = productData;

        const variant = productData.variants[0];
        updateVariantInfo(variant);

        $('#modal-title').text(productData.title);
        $('#modal-description').html(productData.description);
        $('#modal-view-details').attr('href', productData.url);

        preloadImage(productData.featured_image, function () {
          $('#modal-image').attr('src', productData.featured_image);
          $('#image-spinner').hide();
        });

        const $optionsContainer = $('#modal-variant-options');
        $optionsContainer.empty();

        // Render options dynamically
        $.each(productData.options, function (index, optionName) {
          if (optionName === 'Title') return;

          const $fieldset = $('<fieldset>', { class: 'product-option', 'data-option-index': index });
          const $legend = $('<legend>').text(optionName);
          $fieldset.append($legend);

          const values = new Set();
          productData.variants.forEach(v => values.add(v.options[index]));

          values.forEach(value => {
            const id = `option-${index}-${value.replace(/\s+/g, '-')}`;
            const $label = $('<label>', { class: 'swatch', for: id });
            const $input = $('<input>', {
              type: 'radio',
              name: `option-${index}`,
              value: value,
              id: id
            });

            const matchingVariants = productData.variants.filter(v => v.options[index] === value);
            const anyAvailable = matchingVariants.some(v => v.available);

            if (!anyAvailable) {
              $input.prop('disabled', true);
              $label.css('opacity', 0.5).attr('title', 'Out of stock');
            }

            if (value === variant.options[index]) {
              $input.prop('checked', true);
            }

            const $span = $('<span>').text(value);
            $label.append($input).append($span);
            $fieldset.append($label);
          });

          $optionsContainer.append($fieldset);
        });

        $('#modal-qty').val(1);
      },
      error: function () {
        alert('Failed to load product data.');
        $('#image-spinner').hide();
      }
    });
  });

  // === When a variant option is changed ===
  $(document).on('change', 'input[name^="option-"]', function () {
    const variant = getSelectedVariant(window.currentProductData);
    if (variant) updateVariantInfo(variant);
  });

  // === Updates variant info in modal ===
  function updateVariantInfo(variant) {
    $('#modal-price').text(Shopify.formatMoney(variant.price));

    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      $('#modal-compare-price').text(Shopify.formatMoney(variant.compare_at_price)).show();
    } else {
      $('#modal-compare-price').hide();
    }

    const stockText = variant.available
      ? (variant.inventory_management === 'shopify'
          ? `In Stock (${variant.inventory_quantity})`
          : 'In Stock')
      : 'Out of Stock';
    $('#modal-status').text(stockText);

    if (variant.featured_image && variant.featured_image.src) {
      $('#image-spinner').show();
      preloadImage(variant.featured_image.src, function () {
        $('#modal-image').attr('src', variant.featured_image.src);
        $('#image-spinner').hide();
      });
    }
  }

  // === Populate modal with additional product data ===
  function openProductModal(product) {
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-stock-status').textContent = product.available ? "In Stock" : "Out of Stock";
    document.getElementById('modal-image').src = product.featured_image;

    document.getElementById('modal-sku').textContent = product.variants[0].sku || 'N/A';
    document.getElementById('modal-tags').textContent = product.tags.join(', ') || 'None';
    document.getElementById('modal-collection').textContent = product.collection || 'Uncategorized';
    document.getElementById('modal-vendor').textContent = product.vendor || 'Unknown';
    document.getElementById('modal-product-type').textContent = product.product_type || 'N/A';

    document.getElementById('product-slide-modal').classList.remove('hidden');
  }

  // === Helper: Preload image ===
  function preloadImage(src, callback) {
    const img = new Image();
    img.onload = callback;
    img.onerror = callback;
    img.src = src;
  }

  // === Get currently selected variant from modal ===
  function getSelectedVariant(productData) {
    const selectedOptions = [];
    productData.options.forEach((_, index) => {
      const value = $(`input[name="option-${index}"]:checked`).val();
      selectedOptions.push(value);
    });

    return productData.variants.find(v =>
      v.options.every((opt, i) => opt === selectedOptions[i])
    );
  }

  // === Reassign updateQty (override) ===
  window.updateQty = function (btn, change) {
    const $input = $(btn).siblings('input');
    const val = parseInt($input.val()) || 1;
    $input.val(Math.max(1, val + change));
  };

  // === Add to cart from modal ===
  $('#modal-add-to-cart').on('click', function () {
    const variant = getSelectedVariant(window.currentProductData);
    const qty = parseInt($('#modal-qty').val()) || 1;
    if (!variant || !variant.available) return alert('Variant unavailable.');

    $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
      alert('Added to cart!');
      closeProductModal();
    });
  });

  // === Buy now from modal ===
  $('#modal-buy-now').on('click', function () {
    const variant = getSelectedVariant(window.currentProductData);
    const qty = parseInt($('#modal-qty').val()) || 1;
    if (!variant || !variant.available) return alert('Variant unavailable.');

    $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
      window.location.href = '/checkout';
    });
  });

  // === Close modal and reset UI ===
  window.closeProductModal = function () {
    $('#product-slide-modal').removeClass('product-modal--show').addClass('hidden');
    $('.product-modal__overlay, .product-modal__content').removeClass('is-active');
  };

  // === Allow modal close via background click or Escape key ===
  $('.product-modal__overlay').on('click', closeProductModal);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeProductModal();
  });

 // === Cart Drawer + Loader ===

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

  const subtotal = (cart.items_subtotal_price / 100).toFixed(2);
  const discount = (cart.total_discount / 100).toFixed(2);

  let priceHTML = ``;

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

// Remove item from cart
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

// Change quantity
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

// Handle cart interactions
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

document.addEventListener("change", e => {
  const target = e.target;
  if (target.matches("input.cart-qty-input")) {
    const lineKey = target.dataset.lineKey;
    let qty = parseInt(target.value);
    qty = isNaN(qty) || qty < 1 ? 1 : qty;
    changeCartItemQuantity(lineKey, qty);
  }
});

// Open/close drawer
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

  fetchCartData(); // Optional preload
});

console.log("drawer.js loaded");
})(jQuery);
