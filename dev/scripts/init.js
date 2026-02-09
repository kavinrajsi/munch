(function($) {

  // =============================================
  // Helpers
  // =============================================

  function formatMoney(cents) {
    var format = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}';
    var value = (cents / 100).toFixed(2);
    return format
      .replace(/\{\{\s*amount\s*\}\}/, value)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, value.replace('.', ','))
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, Math.round(cents / 100));
  }

  function getSizedImageUrl(url, size) {
    if (!url) return '';
    var match = url.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp|avif)(\?|$)/i);
    if (match) {
      var prefix = url.substring(0, match.index);
      var suffix = url.substring(match.index);
      prefix = prefix.replace(/_(\d+x\d*|\d*x\d+)$/, '');
      return prefix + '_' + size + suffix;
    }
    return url;
  }

  // =============================================
  // Cart Drawer
  // =============================================

  var CartDrawer = {
    init: function() {
      this.$drawer = $('#CartDrawer');
      this.$body = $('#CartDrawerBody');
      this.$count = $('.cart-drawer__count');
      this.$headerCount = $('.header__cart-count');
      this.$subtotal = $('.cart-drawer__subtotal-price');

      this.bindEvents();
    },

    bindEvents: function() {
      $(document).on('click', '[data-cart-drawer-close]', function(e) {
        e.preventDefault();
        CartDrawer.close();
      });

      $(document).on('click', '[data-qty-minus]', function(e) {
        e.preventDefault();
        var line = $(this).data('line');
        var $qty = $(this).siblings('.cart-drawer__qty-value');
        var newQty = parseInt($qty.text()) - 1;
        if (newQty < 0) newQty = 0;
        CartDrawer.updateItem(line, newQty);
      });

      $(document).on('click', '[data-qty-plus]', function(e) {
        e.preventDefault();
        var line = $(this).data('line');
        var $qty = $(this).siblings('.cart-drawer__qty-value');
        var newQty = parseInt($qty.text()) + 1;
        CartDrawer.updateItem(line, newQty);
      });

      $(document).on('click', '[data-remove-item]', function(e) {
        e.preventDefault();
        var line = $(this).data('line');
        CartDrawer.updateItem(line, 0);
      });

      $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
          CartDrawer.close();
          ProductDrawer.close();
          SearchOverlay.close();
        }
      });
    },

    open: function() {
      this.$drawer.attr('aria-hidden', 'false').addClass('cart-drawer--open');
      $('body').addClass('cart-drawer-open');
    },

    close: function() {
      this.$drawer.attr('aria-hidden', 'true').removeClass('cart-drawer--open');
      $('body').removeClass('cart-drawer-open');
    },

    updateItem: function(line, quantity) {
      $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data: JSON.stringify({ line: line, quantity: quantity }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(cart) {
          CartDrawer.renderCart(cart);
        },
        error: function(xhr) {
          var msg = 'Could not update cart. Please try again.';
          try {
            var resp = JSON.parse(xhr.responseText);
            if (resp.description) msg = resp.description;
          } catch(e) {}
          alert(msg);
        }
      });
    },

    renderCart: function(cart) {
      this.$count.text(cart.item_count);
      this.$headerCount.text(cart.item_count);
      this.$subtotal.text(formatMoney(cart.total_price));

      if (cart.item_count === 0) {
        this.$body.html('<p class="cart-drawer__empty">Your cart is empty.</p>');
        return;
      }

      var html = '';
      cart.items.forEach(function(item, index) {
        var line = index + 1;
        var imgSrc = item.image ? getSizedImageUrl(item.image, '120x') : '';

        html += '<div class="cart-drawer__item" data-line="' + line + '">';
        html += '  <a href="' + item.url + '" class="cart-drawer__item-image">';
        if (imgSrc) {
          html += '    <img src="' + imgSrc + '" alt="' + item.title + '" width="120" height="auto" loading="lazy">';
        }
        html += '  </a>';
        html += '  <div class="cart-drawer__item-info">';
        html += '    <a href="' + item.url + '" class="cart-drawer__item-title">' + item.product_title + '</a>';
        if (item.variant_title && item.variant_title !== 'Default Title') {
          html += '    <p class="cart-drawer__item-variant">' + item.variant_title + '</p>';
        }
        html += '    <p class="cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</p>';
        html += '    <div class="cart-drawer__item-qty">';
        html += '      <button class="cart-drawer__qty-btn" data-qty-minus data-line="' + line + '">-</button>';
        html += '      <span class="cart-drawer__qty-value">' + item.quantity + '</span>';
        html += '      <button class="cart-drawer__qty-btn" data-qty-plus data-line="' + line + '">+</button>';
        html += '    </div>';
        html += '  </div>';
        html += '  <button class="cart-drawer__item-remove" data-remove-item data-line="' + line + '" aria-label="Remove">';
        html += '    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">';
        html += '      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
        html += '      <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
        html += '    </svg>';
        html += '  </button>';
        html += '</div>';
      });

      this.$body.html(html);
    }
  };

  // =============================================
  // Product Drawer
  // =============================================

  var ProductDrawer = {
    init: function() {
      this.$drawer = $('#ProductDrawer');
      this.$title = $('#ProductDrawerTitle');
      this.$pricing = $('#ProductDrawerPricing');
      this.$body = $('#ProductDrawerBody');
      this.$footer = $('#ProductDrawerFooter');
      this.bindEvents();
    },

    bindEvents: function() {
      $(document).on('click', '[data-open-product-drawer]', function(e) {
        e.preventDefault();
        var $card = $(this).closest('.product-card');
        var productData = $card.data('product-json');
        if (productData) {
          ProductDrawer.renderProduct(productData);
          ProductDrawer.open();
        }
      });

      $(document).on('click', '[data-product-drawer-close]', function(e) {
        e.preventDefault();
        ProductDrawer.close();
      });

      // Buy it now — redirect to checkout with the selected variant
      $(document).on('click', '[data-buy-now]', function(e) {
        e.preventDefault();
        var variantId = ProductDrawer.$footer.find('[data-variant-id]').val();
        var qty = ProductDrawer.$body.find('[data-card-qty-input]').val() || 1;
        if (variantId) {
          window.location.href = '/cart/' + variantId + ':' + qty;
        }
      });
    },

    open: function() {
      this.$drawer.attr('aria-hidden', 'false').addClass('product-drawer--open');
      $('body').addClass('product-drawer-open');
    },

    close: function() {
      this.$drawer.attr('aria-hidden', 'true').removeClass('product-drawer--open');
      $('body').removeClass('product-drawer-open');
    },

    renderProduct: function(product) {
      var body = '';
      var footer = '';

      // --- HEADER: product title + price ---

      this.$title.text(product.title);

      var cheapest = (product.variants || []).slice().sort(function(a, b) { return a.price - b.price; })[0] || {};
      var pricingHtml = '';
      if (cheapest.compare_at_price && cheapest.compare_at_price > cheapest.price) {
        var savePercent = Math.round((cheapest.compare_at_price - cheapest.price) / cheapest.compare_at_price * 100);
        pricingHtml += '<span class="product-drawer__compare-price">' + formatMoney(cheapest.compare_at_price) + '</span>';
        pricingHtml += '<span class="product-drawer__sale-price">' + formatMoney(cheapest.price) + '</span>';
        pricingHtml += '<span class="product-drawer__save">Save ' + savePercent + '%</span>';
      } else {
        pricingHtml += '<span class="product-drawer__regular-price">' + formatMoney(cheapest.price) + '</span>';
      }
      this.$pricing.html(pricingHtml);

      // --- BODY: image, description, variants, qty ---

      // Image
      if (product.featured_image) {
        body += '<div class="product-drawer__image">';
        body += '  <img src="' + product.featured_image + '" alt="' + (product.title || '').replace(/"/g, '&quot;') + '" width="400" height="auto">';
        body += '</div>';
      }

      // Description
      if (product.description) {
        body += '<div class="product-drawer__description rte">' + product.description + '</div>';
      }

      // Wrap variant selectors + qty in product-card scoping div
      body += '<div class="product-card product-card--drawer">';
      body += '  <div class="product-card__info">';

      // Variant selectors — sorted by price low to high
      body += '  <div class="product-card__variants">';
      if (product.options_with_values && product.options_with_values.length > 0) {
        var hasRealOptions = !(product.options_with_values.length === 1 && product.options_with_values[0].values.length === 1 && product.options_with_values[0].values[0] === 'Default Title');
        if (hasRealOptions) {
          var sortedVariants = (product.variants || []).slice().sort(function(a, b) { return a.price - b.price; });
          for (var i = 0; i < product.options_with_values.length; i++) {
            var option = product.options_with_values[i];
            body += '<div class="product-card__variant-group">';
            body += '  <span class="product-card__variant-label">' + option.name + ':</span>';
            body += '  <div class="product-card__variant-options">';
            var seen = {};
            var isFirst = true;
            for (var s = 0; s < sortedVariants.length; s++) {
              var val = sortedVariants[s].options[i];
              if (!seen[val]) {
                seen[val] = true;
                var activeClass = isFirst ? ' product-card__variant-btn--active' : '';
                body += '<button type="button" class="product-card__variant-btn' + activeClass + '" data-option-index="' + i + '" data-value="' + val + '">' + val + '</button>';
                isFirst = false;
              }
            }
            body += '  </div>';
            body += '</div>';
          }
        }
      }
      body += '  </div>';

      // Qty
      body += '  <div class="product-card__qty">';
      body += '    <button type="button" class="product-card__qty-btn" data-card-qty-minus>-</button>';
      body += '    <input type="text" name="quantity" value="1" min="1" class="product-card__qty-input" data-card-qty-input readonly>';
      body += '    <button type="button" class="product-card__qty-btn" data-card-qty-plus>+</button>';
      body += '  </div>';

      // Variants JSON for selection logic
      body += '  <script type="application/json" data-product-variants>' + JSON.stringify(product.variants) + '<\/script>';

      body += '  </div>'; // .product-card__info
      body += '</div>'; // .product-card--drawer

      // --- FOOTER: add to cart, buy now, view details ---

      var sortedByPrice = (product.variants || []).slice().sort(function(a, b) { return a.price - b.price; });
      var selectedVariant = sortedByPrice[0] || {};

      footer += '<form class="product-drawer__actions" data-product-form data-ajax-cart>';
      footer += '  <input type="hidden" name="id" value="' + (selectedVariant.id || '') + '" data-variant-id>';

      if (product.available) {
        footer += '  <button type="submit" class="product-drawer__atc">Add to cart</button>';
        footer += '  <button type="button" class="product-drawer__buy-now" data-buy-now>Buy it now</button>';
      } else {
        footer += '  <button type="submit" class="product-drawer__atc" disabled>Sold out</button>';
      }

      footer += '</form>';
      footer += '<a href="' + product.url + '" class="product-drawer__view-details">View full details</a>';

      this.$body.html(body);
      this.$footer.html(footer);
    }
  };

  // =============================================
  // AJAX Add to Cart
  // =============================================

  var defaultLoadingSvg = '<svg class="product-card__atc-loader" xmlns="http://www.w3.org/2000/svg" width="30" height="48" fill="none" viewBox="0 0 30 48"><path fill="url(#a)" fill-rule="evenodd" d="M.055 24.648c.942 10.68 14.753 22.91 14.753 22.91 5.453-14.78-1.875-15.505-6.464-24.631C4.79 15.86 7.1 9.817 8.962 6.649 6.104 10.806.557 19.455.055 24.65ZM8.962 6.65a88.007 88.007 0 0 1 1.681-2.374s-.79.86-1.68 2.374Z" clip-rule="evenodd"/><path fill="url(#b)" fill-rule="evenodd" d="M21.275 22.93c-4.588 9.123-11.916 9.85-6.464 24.63 0 0 13.811-12.23 14.753-22.91.335-8.375-10.435-20.202-10.586-20.37.127.138 7.506 8.295 2.297 18.65Z" clip-rule="evenodd"/><path fill="#DA521F" d="M14.81 0c-5.451 14.78 1.877 15.508 6.465 24.631 5.253 10.444-2.19 18.654-2.19 18.654s11.423-9.698 10.479-20.375C28.622 12.23 14.81 0 14.81 0Z"/><path fill="#C61D23" d="M14.808 0c5.453 14.78-1.875 15.508-6.464 24.631-5.252 10.444 2.19 18.654 2.19 18.654S-.89 33.587.055 22.91C.997 12.23 14.808 0 14.808 0Z"/><defs><linearGradient id="a" x1="6.597" x2="13.28" y1="25.918" y2="25.918" gradientUnits="userSpaceOnUse"><stop stop-color="#6E1517"/><stop offset="1" stop-color="#C61D23"/></linearGradient><linearGradient id="b" x1="23.143" x2="7.163" y1="-.09" y2="25.948" gradientUnits="userSpaceOnUse"><stop stop-color="#6E1517"/><stop offset="1" stop-color="#C61D23"/></linearGradient></defs></svg>';

  function getLoadingHtml() {
    if (window.theme && window.theme.loadingImage) {
      return '<img class="product-card__atc-loader" src="' + window.theme.loadingImage + '" alt="Loading">';
    }
    return defaultLoadingSvg;
  }

  $(document).on('submit', 'form[data-ajax-cart]', function(e) {
    e.preventDefault();
    var $form = $(this);
    var $btn = $form.find('[type="submit"]');
    var originalHtml = $btn.html();

    $btn.prop('disabled', true).html(getLoadingHtml());

    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: $form.serialize(),
      dataType: 'json',
      success: function() {
        ProductDrawer.close();
        $.getJSON('/cart.js', function(cart) {
          CartDrawer.renderCart(cart);
          CartDrawer.open();
        });
      },
      error: function(xhr) {
        var msg = 'Could not add to cart';
        try {
          var resp = JSON.parse(xhr.responseText);
          if (resp.description) msg = resp.description;
        } catch(e) {}
        $btn.html(msg);
      },
      complete: function() {
        setTimeout(function() {
          $btn.prop('disabled', false).html(originalHtml);
        }, 1000);
      }
    });
  });

  // =============================================
  // Variant Selection on Product Cards
  // =============================================

  $(document).on('click', '.product-card__variant-btn', function() {
    var $btn = $(this);
    var $card = $btn.closest('.product-card');
    var $group = $btn.closest('.product-card__variant-group');

    $group.find('.product-card__variant-btn').removeClass('product-card__variant-btn--active');
    $btn.addClass('product-card__variant-btn--active');

    var selectedOptions = [];
    $card.find('.product-card__variant-group').each(function() {
      var $active = $(this).find('.product-card__variant-btn--active');
      selectedOptions.push($active.data('value'));
    });

    var variants = JSON.parse($card.find('[data-product-variants]').text());
    var matchedVariant = null;

    for (var i = 0; i < variants.length; i++) {
      var variant = variants[i];
      var match = true;
      for (var j = 0; j < selectedOptions.length; j++) {
        if (String(variant.options[j]) !== String(selectedOptions[j])) {
          match = false;
          break;
        }
      }
      if (match) {
        matchedVariant = variant;
        break;
      }
    }

    if (matchedVariant) {
      $card.find('[data-variant-id]').val(matchedVariant.id);
      var $atcBtn = $card.find('.product-card__atc');
      if (matchedVariant.available) {
        $atcBtn.prop('disabled', false).text('Add to cart');
      } else {
        $atcBtn.prop('disabled', true).text('Sold out');
      }

      // Update price on product card
      var $pricing = $card.closest('.product-card[data-product-json]').find('.product-card__pricing');
      if ($pricing.length) {
        var priceHtml = '';
        if (matchedVariant.compare_at_price && matchedVariant.compare_at_price > matchedVariant.price) {
          var savePercent = Math.round((matchedVariant.compare_at_price - matchedVariant.price) / matchedVariant.compare_at_price * 100);
          priceHtml += '<span class="product-card__compare-price">' + formatMoney(matchedVariant.compare_at_price) + '</span>';
          priceHtml += '<span class="product-card__sale-price">' + formatMoney(matchedVariant.price) + '</span>';
          priceHtml += '<span class="product-card__save">Save ' + savePercent + '%</span>';
        } else {
          priceHtml += '<span class="product-card__regular-price">' + formatMoney(matchedVariant.price) + '</span>';
        }
        $pricing.html(priceHtml);
      }

      // Sync footer form and price when variant changes inside product drawer
      if ($card.hasClass('product-card--drawer')) {
        var $footer = ProductDrawer.$footer;
        $footer.find('[data-variant-id]').val(matchedVariant.id);
        var $footerAtc = $footer.find('.product-drawer__atc');
        var $footerBuyNow = $footer.find('[data-buy-now]');
        if (matchedVariant.available) {
          $footerAtc.prop('disabled', false).text('Add to cart');
          $footerBuyNow.show();
        } else {
          $footerAtc.prop('disabled', true).text('Sold out');
          $footerBuyNow.hide();
        }

        // Update price in product drawer header
        var drawerPriceHtml = '';
        if (matchedVariant.compare_at_price && matchedVariant.compare_at_price > matchedVariant.price) {
          var drawerSavePercent = Math.round((matchedVariant.compare_at_price - matchedVariant.price) / matchedVariant.compare_at_price * 100);
          drawerPriceHtml += '<span class="product-drawer__compare-price">' + formatMoney(matchedVariant.compare_at_price) + '</span>';
          drawerPriceHtml += '<span class="product-drawer__sale-price">' + formatMoney(matchedVariant.price) + '</span>';
          drawerPriceHtml += '<span class="product-drawer__save">Save ' + drawerSavePercent + '%</span>';
        } else {
          drawerPriceHtml += '<span class="product-drawer__regular-price">' + formatMoney(matchedVariant.price) + '</span>';
        }
        ProductDrawer.$pricing.html(drawerPriceHtml);
      }
    }
  });

  // =============================================
  // Product Card Quantity +/-
  // =============================================

  $(document).on('click', '[data-card-qty-minus]', function() {
    var $input = $(this).siblings('[data-card-qty-input]');
    var val = parseInt($input.val()) - 1;
    if (val < 1) val = 1;
    $input.val(val);
  });

  $(document).on('click', '[data-card-qty-plus]', function() {
    var $input = $(this).siblings('[data-card-qty-input]');
    var val = parseInt($input.val()) + 1;
    $input.val(val);
  });

  // =============================================
  // Search Overlay
  // =============================================

  var SearchOverlay = {
    debounceTimer: null,

    init: function() {
      this.$overlay = $('#SearchOverlay');
      this.$input = $('#SearchOverlayInput');
      this.$results = $('#SearchOverlayResults');
      this.$empty = $('#SearchOverlayEmpty');
      this.$footer = $('#SearchOverlayFooter');
      this.$viewAll = $('#SearchOverlayViewAll');

      this.bindEvents();
    },

    bindEvents: function() {
      $(document).on('click', '[data-search-open]', function(e) {
        e.preventDefault();
        SearchOverlay.open();
      });

      $(document).on('click', '[data-search-overlay-close]', function(e) {
        e.preventDefault();
        SearchOverlay.close();
      });

      this.$input.on('input', function() {
        var query = $(this).val().trim();
        clearTimeout(SearchOverlay.debounceTimer);

        if (query.length === 0) {
          SearchOverlay.$results.empty();
          SearchOverlay.$empty.hide();
          SearchOverlay.$footer.hide();
          return;
        }

        SearchOverlay.debounceTimer = setTimeout(function() {
          SearchOverlay.search(query);
        }, 300);
      });
    },

    open: function() {
      this.$overlay.attr('aria-hidden', 'false').addClass('search-overlay--open');
      $('body').addClass('search-overlay-open');
      this.$input.focus();
    },

    close: function() {
      this.$overlay.attr('aria-hidden', 'true').removeClass('search-overlay--open');
      $('body').removeClass('search-overlay-open');
      this.$input.val('');
      this.$results.empty();
      this.$empty.hide();
      this.$footer.hide();
      clearTimeout(this.debounceTimer);
    },

    search: function(query) {
      $.getJSON('/search/suggest.json', {
        q: query,
        'resources[type]': 'product',
        'resources[limit]': 8
      }, function(data) {
        var products = data.resources && data.resources.results && data.resources.results.products
          ? data.resources.results.products
          : [];

        SearchOverlay.$results.empty();

        if (products.length === 0) {
          SearchOverlay.$empty.show();
          SearchOverlay.$footer.hide();
          return;
        }

        SearchOverlay.$empty.hide();

        var html = '';
        for (var i = 0; i < products.length; i++) {
          var product = products[i];
          var imgSrc = product.featured_image && product.featured_image.url
            ? product.featured_image.url
            : '';
          var imgAlt = product.featured_image && product.featured_image.alt
            ? product.featured_image.alt
            : product.title;

          html += '<a href="' + product.url + '" class="search-overlay__item">';

          if (imgSrc) {
            html += '<div class="search-overlay__item-image">';
            html += '  <img src="' + imgSrc + '" alt="' + imgAlt.replace(/"/g, '&quot;') + '" loading="lazy">';
            html += '</div>';
          }

          html += '<div class="search-overlay__item-title">' + product.title + '</div>';
          html += '<div class="search-overlay__item-price">';

          if (product.compare_at_price_max && product.compare_at_price_max !== '0.00' && product.compare_at_price_max !== product.price) {
            html += '<span class="search-overlay__item-compare-price">' + product.compare_at_price_max + '</span>';
          }
          html += product.price;

          html += '</div>';
          html += '</a>';
        }

        SearchOverlay.$results.html(html);
        SearchOverlay.$viewAll.attr('href', '/search?q=' + encodeURIComponent(query));
        SearchOverlay.$footer.show();
      }).fail(function() {
        SearchOverlay.$results.html('<p class="search-overlay__error">Something went wrong. Please try again.</p>');
        SearchOverlay.$empty.hide();
        SearchOverlay.$footer.hide();
      });
    }
  };

  // =============================================
  // Header Cart — open drawer instead of navigate
  // =============================================

  $(document).on('click', '.header__cart', function(e) {
    e.preventDefault();
    CartDrawer.open();
  });

  // =============================================
  // Init
  // =============================================

  $(document).ready(function() {
    CartDrawer.init();
    ProductDrawer.init();
    SearchOverlay.init();
  });

})(jQuery);
