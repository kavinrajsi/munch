$(document).ready(function () {
  // === Open Modal ===
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

        // Preload default image
        preloadImage(productData.featured_image, function () {
          $('#modal-image').attr('src', productData.featured_image);
          $('#image-spinner').hide();
        });

        const $optionsContainer = $('#modal-variant-options');
        $optionsContainer.empty();

        // Render variant options
        $.each(productData.options, function (index, optionName) {
          if (optionName === 'Title') return;

          const $fieldset = $('<fieldset>', {
            class: 'product-option',
            'data-option-index': index
          });

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

  // === Update Variant Info on Option Change ===
  $(document).on('change', 'input[name^="option-"]', function () {
    const variant = getSelectedVariant(window.currentProductData);
    if (variant) updateVariantInfo(variant);
  });

  function updateVariantInfo(variant) {
    $('#modal-price').text(Shopify.formatMoney(variant.price));
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      $('#modal-compare-price')
        .text(Shopify.formatMoney(variant.compare_at_price))
        .show();
    } else {
      $('#modal-compare-price').hide();
    }

    const stockText = variant.available
      ? (variant.inventory_management === 'shopify'
          ? `In Stock (${variant.inventory_quantity})`
          : 'In Stock')
      : 'Out of Stock';
    $('#modal-status').text(stockText);

    // Update image if available
    if (variant.featured_image && variant.featured_image.src) {
      $('#image-spinner').show();
      preloadImage(variant.featured_image.src, function () {
        $('#modal-image').attr('src', variant.featured_image.src);
        $('#image-spinner').hide();
      });
    }
  }

  function openProductModal(product) {
  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-price').textContent = product.price;
  document.getElementById('modal-stock-status').textContent = product.available ? "In Stock" : "Out of Stock";
  document.getElementById('modal-image').src = product.featured_image;

  // Populate new meta fields
  document.getElementById('modal-sku').textContent = product.variants[0].sku || 'N/A';
  document.getElementById('modal-tags').textContent = product.tags.join(', ') || 'None';
  document.getElementById('modal-collection').textContent = product.collection || 'Uncategorized';
  document.getElementById('modal-vendor').textContent = product.vendor || 'Unknown';
  document.getElementById('modal-product-type').textContent = product.product_type || 'N/A';

  // Show modal
  document.getElementById('product-slide-modal').classList.remove('hidden');
}


  function preloadImage(src, callback) {
    const img = new Image();
    img.onload = callback;
    img.onerror = callback;
    img.src = src;
  }

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

  window.updateQty = function (btn, change) {
    const $input = $(btn).siblings('input');
    const val = parseInt($input.val()) || 1;
    $input.val(Math.max(1, val + change));
  };

  $('#modal-add-to-cart').on('click', function () {
    const variant = getSelectedVariant(window.currentProductData);
    const qty = parseInt($('#modal-qty').val()) || 1;
    if (!variant || !variant.available) return alert('Variant unavailable.');

    $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
      alert('Added to cart!');
      closeProductModal();
    });
  });

  $('#modal-buy-now').on('click', function () {
    const variant = getSelectedVariant(window.currentProductData);
    const qty = parseInt($('#modal-qty').val()) || 1;
    if (!variant || !variant.available) return alert('Variant unavailable.');

    $.post('/cart/add.js', { id: variant.id, quantity: qty }, () => {
      window.location.href = '/checkout';
    });
  });

  window.closeProductModal = function () {
    $('#product-slide-modal').removeClass('product-modal--show').addClass('hidden');
    $('.product-modal__overlay, .product-modal__content').removeClass('is-active');
  };

  $('.product-modal__overlay').on('click', closeProductModal);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeProductModal();
  });
});
