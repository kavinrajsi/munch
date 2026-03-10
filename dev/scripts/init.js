(function($) {
  'use strict';

  // ============================================================
  // Loading icon for Add to Cart buttons
  // ============================================================
  var LOADING_ICON = '<span class="btn-loading-icon"><svg width="30" height="48" viewBox="0 0 30 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2022_3150)"><path d="M14.4499 0C15.4625 2.37545 17.0963 7.9488 13.8167 14.2986C12.8282 16.2145 11.5715 18.0263 10.3559 19.7777C6.80081 24.9011 3.15148 30.1624 5.50783 38.5805C1.07547 32.4701 0 27.4386 0 23.9988C0 12.8884 10.9093 2.93907 14.4499 0Z" fill="currentColor"/><path d="M29.7069 23.9988C29.7069 13.4883 19.948 4.02035 15.895 0.539429C16.8424 3.25595 17.7729 8.05039 15.489 13.4665C15.6147 13.7423 15.7452 14.018 15.8902 14.2962C16.8787 16.2121 18.1354 18.0239 19.351 19.7752C22.9061 24.8986 26.5554 30.16 24.1991 38.578C28.6339 32.4677 29.7093 27.4362 29.7093 23.9964" fill="currentColor"/><path d="M21.4248 25.1357C20.7602 26.1856 20.0521 27.2064 19.3488 28.2223C18.1331 29.9737 16.8764 31.7855 15.888 33.7014C12.6108 40.0512 14.2421 45.6245 15.2548 48C16.6903 46.8099 19.3391 44.4659 21.9782 41.3575C24.9895 34.2601 23.8053 29.4222 21.4248 25.1357Z" fill="currentColor"/><path d="M13.8191 33.7014C12.8307 31.7855 11.5739 29.9737 10.3583 28.2223C9.65501 27.2064 8.94689 26.1856 8.28228 25.1357C5.90175 29.4222 4.71753 34.2577 7.72642 41.355C10.0127 44.045 12.3062 46.1664 13.8119 47.4581C12.8645 44.7416 11.934 39.9472 14.2179 34.5311C14.0922 34.2553 13.9617 33.9795 13.8167 33.7014" fill="currentColor"/></g><defs><clipPath id="clip0_2022_3150"><rect width="30" height="48" fill="currentColor"/></clipPath></defs></svg></span>';

  // ============================================================
  // Utility: Format money using Shopify's money_format
  // ============================================================
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    format = format || (window.Shopify && window.Shopify.money_format) || '${{amount}}';

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision == null ? 2 : precision;
      thousands = thousands || ',';
      decimal = decimal || '.';
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var cents_part = parts[1] ? decimal + parts[1] : '';
      return dollars + cents_part;
    }

    switch (format.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }
    return format.replace(placeholderRegex, value);
  }

  // ============================================================
  // Free Delivery Progress Bar
  // ============================================================
  function updateFreeDeliveryBar(cart) {
    $('[data-free-delivery-bar]').each(function() {
      var $bar = $(this);
      var threshold = parseInt($bar.data('threshold'), 10) || 100000;
      var total = cart.total_price;
      var remaining = threshold - total;
      if (remaining < 0) remaining = 0;
      var $message = $bar.find('[data-free-delivery-message]');

      if (cart.item_count === 0 || remaining === 0) {
        $bar.removeClass('is-visible');
        $message.html('');
        return;
      }

      $message.html('Order for ' + formatMoney(remaining) + ' more for unlocking free delivery');
      $bar.addClass('is-visible');
    });
  }

  // ============================================================
  // Cart Drawer
  // ============================================================
  var CartDrawer = {
    $drawer: null,

    init: function() {
      this.$drawer = $('[data-cart-drawer]');
      if (!this.$drawer.length) return;

      var self = this;

      // Open/close triggers
      $(document).on('click', '[data-cart-toggle]', function(e) {
        e.preventDefault();
        self.open();
      });

      $(document).on('click', '[data-cart-drawer-close]', function(e) {
        e.preventDefault();
        self.close();
      });

      // Quantity controls within drawer
      this.$drawer.on('click', '[data-qty-minus]', function() {
        var $qty = $(this).closest('.cart-drawer__item-quantity');
        var $input = $qty.find('[data-qty-input]');
        var val = parseInt($input.val(), 10);
        if (val > 1) {
          $input.val(val - 1).trigger('change');
          $qty.find('[data-qty-input-display]').text(val - 1);
        }
      });

      this.$drawer.on('click', '[data-qty-plus]', function() {
        var $qty = $(this).closest('.cart-drawer__item-quantity');
        var $input = $qty.find('[data-qty-input]');
        var newVal = parseInt($input.val(), 10) + 1;
        $input.val(newVal).trigger('change');
        $qty.find('[data-qty-input-display]').text(newVal);
      });

      this.$drawer.on('change', '[data-qty-input]', function() {
        var $item = $(this).closest('[data-cart-item]');
        var line = $item.data('line');
        var qty = parseInt($(this).val(), 10);
        self.updateItem(line, qty);
      });

      // Remove item
      this.$drawer.on('click', '[data-remove-item]', function(e) {
        e.preventDefault();
        var $item = $(this).closest('[data-cart-item]');
        var line = $item.data('line');
        self.updateItem(line, 0);
      });

      // Cart note toggle
      this.$drawer.on('click', '[data-cart-note-toggle]', function() {
        var $toggle = $(this);
        var $content = $toggle.next('[data-cart-note-content]');
        var expanded = $toggle.attr('aria-expanded') === 'true';
        $toggle.attr('aria-expanded', !expanded);
        $content.toggleClass('is-open');
      });

      // Cart note save (debounced)
      var noteTimer;
      this.$drawer.on('input', '[data-cart-note-input]', function() {
        var note = $(this).val();
        clearTimeout(noteTimer);
        noteTimer = setTimeout(function() {
          var root = window.Shopify.routes.root || '/';
          fetch(root + 'cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: note })
          });
        }, 500);
      });

      // Recommendation "Add" button
      this.$drawer.on('click', '[data-rec-add]', function() {
        var $btn = $(this);
        var variantId = $btn.data('rec-variant');
        if (!variantId) return;
        $btn.prop('disabled', true).html(LOADING_ICON);
        self.addItem(variantId, 1);
      });
    },

    open: function() {
      this.$drawer.addClass('is-open');
      $('html').addClass('cart-open');

      // Load recommendations if not already loaded
      var $list = this.$drawer.find('[data-cart-recommendations-list]');
      if ($list.length && !$list.children().length) {
        var self = this;
        var root = window.Shopify.routes.root || '/';
        fetch(root + 'cart.js')
          .then(function(res) { return res.json(); })
          .then(function(cart) { self.loadRecommendations(cart); });
      }
    },

    close: function() {
      this.$drawer.removeClass('is-open');
      $('html').removeClass('cart-open');
    },

    updateItem: function(line, quantity) {
      var self = this;
      var root = window.Shopify.routes.root || '/';
      fetch(root + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      })
      .then(function(res) { return res.json(); })
      .then(function(cart) {
        self.refreshCart(cart);
      });
    },

    addItem: function(variantId, quantity) {
      var self = this;
      var root = window.Shopify.routes.root || '/';
      quantity = quantity || 1;
      fetch(root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: quantity }] })
      })
      .then(function(res) { return res.json(); })
      .then(function() {
        fetch(root + 'cart.js')
          .then(function(res) { return res.json(); })
          .then(function(cart) {
            self.refreshCart(cart);
            self.open();
          });
      });
    },

    refreshCart: function(cart) {
      var showImage = this.$drawer.data('show-image') !== false;
      var showVariant = this.$drawer.data('show-variant') !== false;
      var emptyText = this.$drawer.data('empty-text') || 'Your cart is empty';
      var emptyBtnText = this.$drawer.data('empty-btn-text') || 'Continue Shopping';
      var emptyBtnLink = this.$drawer.data('empty-btn-link') || '/collections/all';

      // Update count badges
      $('[data-cart-count]').text(cart.item_count);
      $('[data-cart-count-badge]').text(cart.item_count);
      if (cart.item_count > 0) {
        $('[data-cart-count-badge]').show();
      } else {
        $('[data-cart-count-badge]').hide();
      }
      // Update subtotal
      $('[data-cart-subtotal]').text(formatMoney(cart.total_price));

      // Update free delivery progress bar
      updateFreeDeliveryBar(cart);

      // Rebuild items
      var $items = this.$drawer.find('[data-cart-items]');
      var $footer = this.$drawer.find('.cart-drawer__footer');
      if (cart.item_count === 0) {
        $items.html('<div class="cart-drawer__empty"></div>');
        $footer.html(
          '<div class="cart-drawer__footer-actions">' +
            '<a href="' + emptyBtnLink + '" class="cart-drawer__checkout-btn">Continue Shopping</a>' +
          '</div>'
        ).show();
        return;
      }

      var noteVal = cart.note || '';
      $footer.html(
        '<div class="cart-drawer__note" data-cart-drawer-note>' +
          '<button type="button" class="cart-drawer__note-toggle" data-cart-note-toggle aria-expanded="false">' +
            '<span>Order Notes</span>' +
            '<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</button>' +
          '<div class="cart-drawer__note-content" data-cart-note-content>' +
            '<textarea data-cart-note-input placeholder="Special instructions for your order...">' + noteVal + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="cart-drawer__subtotal">' +
          '<span class="cart-drawer__subtotal-label">Subtotal</span>' +
          '<span class="cart-drawer__subtotal-price" data-cart-subtotal>' + formatMoney(cart.total_price) + '</span>' +
        '</div>' +
        '<div class="cart-drawer__footer-actions">' +
          '<a href="/checkout" class="cart-drawer__checkout-btn">Check Out</a>' +
          '<a href="/cart" class="cart-drawer__view-cart">View Cart</a>' +
        '</div>'
      ).show();
      var html = '';
      cart.items.forEach(function(item, index) {
        var variantTitle = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
        html += '<div class="cart-drawer__item" data-cart-item data-line="' + (index + 1) + '">';
        if (showImage && item.image) {
          html += '<a href="' + item.url + '" class="cart-drawer__item-image">';
          html += '<img src="' + item.image.replace(/(\.[^.]+)$/, '_190x$1') + '" alt="' + item.title + '" width="95" height="95" loading="lazy">';
          html += '</a>';
        }
        html += '<div class="cart-drawer__item-info">';
        html += '<div class="cart-drawer__item-details">';
        html += '<a href="' + item.url + '" class="cart-drawer__item-title">' + item.product_title + '</a>';
        if (showVariant && variantTitle) {
          html += '<p class="cart-drawer__item-variant">Weight : <span>' + variantTitle + '</span></p>';
        }
        html += '<p class="cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</p>';
        html += '</div>';
        html += '<div class="cart-drawer__item-actions">';
        html += '<div class="cart-drawer__item-quantity">';
        html += '<button type="button" data-qty-minus>−</button>';
        html += '<span class="cart-drawer__qty-value" data-qty-input-display>' + item.quantity + '</span>';
        html += '<input type="number" value="' + item.quantity + '" min="1" data-qty-input>';
        html += '<button type="button" data-qty-plus>+</button>';
        html += '</div>';
        html += '<button class="cart-drawer__item-remove" data-remove-item type="button">Remove</button>';
        html += '</div>';
        html += '</div></div>';
      });
      $items.html(html);
      this.loadRecommendations(cart);
    },

    loadRecommendations: function(cart) {
      var self = this;
      var $section = this.$drawer.find('[data-cart-recommendations]');
      var $list = $section.find('[data-cart-recommendations-list]');

      if (!cart || !cart.items || cart.items.length === 0) {
        $section.hide();
        return;
      }

      // Get unique product IDs from cart
      var cartProductIds = [];
      var cartVariantIds = [];
      cart.items.forEach(function(item) {
        if (cartProductIds.indexOf(item.product_id) === -1) {
          cartProductIds.push(item.product_id);
        }
        cartVariantIds.push(item.variant_id);
      });

      var root = window.Shopify.routes.root || '/';
      var limit = 4;

      // Fetch recommendations for all cart products
      var fetches = cartProductIds.map(function(pid) {
        return fetch(root + 'recommendations/products.json?product_id=' + pid + '&limit=' + limit)
          .then(function(res) { return res.json(); })
          .then(function(data) { return data.products || []; })
          .catch(function() { return []; });
      });

      Promise.all(fetches).then(function(results) {
        // Merge and deduplicate
        var seen = {};
        var products = [];
        // Exclude products already in cart
        cartProductIds.forEach(function(id) { seen[id] = true; });

        results.forEach(function(list) {
          list.forEach(function(product) {
            if (!seen[product.id] && product.available) {
              seen[product.id] = true;
              products.push(product);
            }
          });
        });

        if (products.length === 0) {
          $section.hide();
          return;
        }

        // Limit to 6 products
        products = products.slice(0, 6);

        var html = '';
        products.forEach(function(product) {
          var image = product.featured_image ? product.featured_image.replace(/(\.[^.]+)$/, '_190x$1') : '';
          var variant = product.variants && product.variants[0];
          var price = variant ? formatMoney(variant.price) : '';
          var variantId = variant ? variant.id : '';

          html += '<div class="cart-drawer__rec-card">';
          html += '<div class="cart-drawer__rec-top">';
          if (image) {
            html += '<div class="cart-drawer__rec-image"><img src="' + image + '" alt="' + product.title + '" width="72" height="72" loading="lazy"></div>';
          }
          html += '<div class="cart-drawer__rec-info">';
          html += '<p class="cart-drawer__rec-title">' + product.title + '</p>';
          html += '<p class="cart-drawer__rec-price">' + price + '</p>';
          html += '</div></div>';
          html += '<button type="button" class="cart-drawer__rec-add" data-rec-add data-rec-variant="' + variantId + '">Add</button>';
          html += '</div>';
        });

        $list.html(html);
        $section.show();
      });
    }
  };

  // ============================================================
  // Product Drawer (Quick View)
  // ============================================================
  var ProductDrawer = {
    $drawer: null,

    init: function() {
      this.$drawer = $('[data-product-drawer]');
      if (!this.$drawer.length) return;

      var self = this;

      $(document).on('click', '[data-quick-view]', function(e) {
        e.preventDefault();
        var url = $(this).data('product-url');
        self.loadProduct(url);
      });

      $(document).on('click', '[data-product-drawer-close]', function(e) {
        e.preventDefault();
        self.close();
      });
    },

    loadProduct: function(url) {
      var self = this;
      this.open();
      var $body = this.$drawer.find('[data-product-drawer-body]');
      $body.html('<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>');

      $.get(url + '?view=quick-view', function(html) {
        // Fallback: load the full product page and extract info
        $.getJSON(url + '.js', function(product) {
          var imageHtml = '';
          if (product.images && product.images.length > 0) {
            imageHtml = '<img src="' + product.images[0].replace(/(\.[^.]+)$/, '_600x$1') + '" alt="' + product.title + '">';
          }

          var variantsHtml = '';
          if (product.variants.length > 1) {
            variantsHtml = '<div class="product-drawer__variants">';
            product.options.forEach(function(option, idx) {
              variantsHtml += '<div class="product-drawer__variant-group">';
              variantsHtml += '<label>' + option + '</label>';
              variantsHtml += '<select data-option-index="' + idx + '" data-option-select>';
              var seen = {};
              product.variants.forEach(function(v) {
                var val = v.options[idx];
                if (!seen[val]) {
                  seen[val] = true;
                  variantsHtml += '<option value="' + val + '">' + val + '</option>';
                }
              });
              variantsHtml += '</select></div>';
            });
            variantsHtml += '</div>';
          }

          var firstVariant = product.variants[0];
          var priceHtml = formatMoney(firstVariant.price);
          if (firstVariant.compare_at_price && firstVariant.compare_at_price > firstVariant.price) {
            priceHtml = '<span style="color:var(--color-primary)">' + formatMoney(firstVariant.price) + '</span> <span class="compare-price">' + formatMoney(firstVariant.compare_at_price) + '</span>';
          }

          var bodyHtml = '<div class="product-drawer__gallery">' + imageHtml + '</div>';
          bodyHtml += '<div class="product-drawer__info">';
          bodyHtml += '<h3 class="product-drawer__title">' + product.title + '</h3>';
          bodyHtml += '<div class="product-drawer__price">' + priceHtml + '</div>';
          bodyHtml += variantsHtml;
          bodyHtml += '<form data-product-drawer-form data-product-json=\'' + JSON.stringify(product) + '\'>';
          bodyHtml += '<input type="hidden" name="id" value="' + firstVariant.id + '" data-variant-id>';
          bodyHtml += '<button type="submit" class="btn btn--primary btn--full product-drawer__add-to-cart"';
          if (!firstVariant.available) bodyHtml += ' disabled';
          bodyHtml += '>' + (firstVariant.available ? 'Add to Cart' : 'Sold Out') + '</button>';
          bodyHtml += '</form>';
          bodyHtml += '<a href="' + url + '" class="product-drawer__view-full">View Full Details</a>';
          bodyHtml += '</div>';

          $body.html(bodyHtml);

          // Bind variant selection
          $body.find('[data-option-select]').on('change', function() {
            var options = [];
            $body.find('[data-option-select]').each(function() {
              options.push($(this).val());
            });
            var matchedVariant = product.variants.find(function(v) {
              return v.options.every(function(opt, i) { return opt === options[i]; });
            });
            if (matchedVariant) {
              $body.find('[data-variant-id]').val(matchedVariant.id);
              var newPrice = formatMoney(matchedVariant.price);
              $body.find('.product-drawer__price').html(newPrice);
              var $btn = $body.find('.product-drawer__add-to-cart');
              if (matchedVariant.available) {
                $btn.prop('disabled', false).text('Add to Cart');
              } else {
                $btn.prop('disabled', true).text('Sold Out');
              }
            }
          });

          // Bind add to cart
          $body.find('[data-product-drawer-form]').on('submit', function(e) {
            e.preventDefault();
            var variantId = $(this).find('[data-variant-id]').val();
            CartDrawer.addItem(variantId, 1);
            self.close();
          });
        });
      }).fail(function() {
        $body.html('<p style="padding:20px;text-align:center;">Could not load product.</p>');
      });
    },

    open: function() {
      this.$drawer.addClass('is-open');
      $('body').css('overflow', 'hidden');
    },

    close: function() {
      this.$drawer.removeClass('is-open');
      $('body').css('overflow', '');
    }
  };

  // ============================================================
  // Search Overlay
  // ============================================================
  var SearchOverlay = {
    $overlay: null,
    searchTimeout: null,
    activeIndex: -1,
    lastQuery: '',
    config: {},

    init: function() {
      this.$overlay = $('[data-search-overlay]');
      if (!this.$overlay.length) return;

      // Read settings from data attributes
      this.config = {
        predictive: this.$overlay.data('predictive') !== false,
        minChars: parseInt(this.$overlay.data('min-chars'), 10) || 2,
        resourceTypes: this.$overlay.data('resource-types') || 'product',
        productsLimit: parseInt(this.$overlay.data('products-limit'), 10) || 6,
        collectionsLimit: parseInt(this.$overlay.data('collections-limit'), 10) || 3,
        pagesLimit: parseInt(this.$overlay.data('pages-limit'), 10) || 3,
        articlesLimit: parseInt(this.$overlay.data('articles-limit'), 10) || 3,
        showProductImage: this.$overlay.data('show-product-image') !== false,
        showProductVendor: this.$overlay.data('show-product-vendor') !== false,
        showProductPrice: this.$overlay.data('show-product-price') !== false
      };

      var self = this;

      $(document).on('click', '[data-search-toggle]', function(e) {
        e.preventDefault();
        self.open();
      });

      $(document).on('click', '[data-search-overlay-close]', function(e) {
        e.preventDefault();
        self.close();
      });

      if (this.config.predictive) {
        this.$overlay.find('[data-search-input]').on('input', function() {
          var query = $(this).val().trim();
          clearTimeout(self.searchTimeout);
          if (query.length < self.config.minChars) {
            self.clearResults();
            return;
          }
          self.searchTimeout = setTimeout(function() {
            self.search(query);
          }, 300);
        });
      }

      // Popular search term clicks
      this.$overlay.on('click', '[data-popular-term]', function(e) {
        e.preventDefault();
        var term = $(this).data('popular-term');
        self.$overlay.find('[data-search-input]').val(term);
        if (self.config.predictive) {
          self.search(term);
        } else {
          self.$overlay.find('form').submit();
        }
      });

      // Keyboard navigation
      this.$overlay.find('[data-search-input]').on('keydown', function(e) {
        var $items = self.$overlay.find('.search-overlay__result-item');
        if (!$items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          self.activeIndex = Math.min(self.activeIndex + 1, $items.length - 1);
          self.highlightItem($items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          self.activeIndex = Math.max(self.activeIndex - 1, -1);
          self.highlightItem($items);
        } else if (e.key === 'Enter' && self.activeIndex >= 0) {
          e.preventDefault();
          var href = $items.eq(self.activeIndex).attr('href');
          if (href) window.location.href = href;
        }
      });
    },

    open: function() {
      this.$overlay.addClass('is-open');
      this.$overlay.find('[data-search-input]').val('').focus();
      this.clearResults();
      $('html').addClass('search-open');
    },

    close: function() {
      this.$overlay.removeClass('is-open');
      $('html').removeClass('search-open');
    },

    clearResults: function() {
      this.$overlay.find('[data-search-results]').empty();
      this.$overlay.find('[data-search-view-all]').hide();
      this.$overlay.find('[data-search-loading]').removeClass('is-visible');
      this.$overlay.find('[data-search-popular]').show();
      this.activeIndex = -1;
      this.lastQuery = '';
    },

    highlightItem: function($items) {
      $items.removeClass('is-active');
      if (this.activeIndex >= 0) {
        var $active = $items.eq(this.activeIndex).addClass('is-active');
        var container = this.$overlay.find('[data-search-results]')[0];
        var item = $active[0];
        if (container && item) {
          var top = item.offsetTop;
          var bottom = top + item.offsetHeight;
          if (top < container.scrollTop) {
            container.scrollTop = top;
          } else if (bottom > container.scrollTop + container.clientHeight) {
            container.scrollTop = bottom - container.clientHeight;
          }
        }
      }
    },

    search: function(query) {
      var self = this;
      var cfg = this.config;
      var $results = this.$overlay.find('[data-search-results]');
      var $loading = this.$overlay.find('[data-search-loading]');

      self.activeIndex = -1;
      self.lastQuery = query;
      $loading.addClass('is-visible');
      $results.empty();
      self.$overlay.find('[data-search-popular]').hide();

      // Build limit — Shopify suggest API uses a single limit for all types
      var maxLimit = Math.max(cfg.productsLimit, cfg.collectionsLimit, cfg.pagesLimit, cfg.articlesLimit);

      $.getJSON('/search/suggest.json', {
        q: query,
        'resources[type]': cfg.resourceTypes,
        'resources[limit]': maxLimit,
        'resources[options][fields]': 'title,product_type,vendor,tag,body'
      }, function(data) {
        if (self.lastQuery !== query) return;

        $loading.removeClass('is-visible');

        var results = data.resources && data.resources.results;
        if (!results) {
          $results.html('<div class="search-overlay__no-results">No results found</div>');
          return;
        }

        var products = (results.products || []).slice(0, cfg.productsLimit);
        var collections = (results.collections || []).slice(0, cfg.collectionsLimit);
        var articles = (results.articles || []).slice(0, cfg.articlesLimit);
        var pages = (results.pages || []).slice(0, cfg.pagesLimit);

        var totalCount = products.length + collections.length + articles.length + pages.length;
        if (totalCount === 0) {
          $results.html('<div class="search-overlay__no-results">No results found</div>');
          return;
        }

        var html = '';

        // Products
        if (products.length > 0) {
          html += '<div class="search-overlay__group">';
          html += '<div class="search-overlay__group-title">Products</div>';
          products.forEach(function(p) {
            html += '<a href="' + p.url + '" class="search-overlay__result-item">';
            if (cfg.showProductImage && p.image) {
              html += '<img class="search-overlay__result-thumb" src="' + p.image + '" alt="' + self.escapeHtml(p.title) + '" loading="lazy">';
            }
            html += '<div class="search-overlay__result-info">';
            html += '<div class="search-overlay__result-title">' + self.escapeHtml(p.title) + '</div>';
            html += '</div>';
            if (cfg.showProductPrice) {
              html += '<div class="search-overlay__result-price">';
              if (p.compare_at_price_max && parseFloat(p.compare_at_price_max) > parseFloat(p.price)) {
                html += '<span class="sale-price">' + formatMoney(p.price) + '</span>';
                html += '<span class="compare-price">' + formatMoney(p.compare_at_price_max) + '</span>';
              } else {
                html += formatMoney(p.price);
              }
              html += '</div>';
            }
            html += '</a>';
          });
          html += '</div>';
        }

        // Collections
        if (collections.length > 0) {
          html += '<div class="search-overlay__group">';
          html += '<div class="search-overlay__group-title">Collections</div>';
          collections.forEach(function(c) {
            html += '<a href="' + c.url + '" class="search-overlay__result-item search-overlay__result-item--text">';
            html += '<div class="search-overlay__result-info">';
            html += '<div class="search-overlay__result-title">' + self.escapeHtml(c.title) + '</div>';
            html += '</div></a>';
          });
          html += '</div>';
        }

        // Pages
        if (pages.length > 0) {
          html += '<div class="search-overlay__group">';
          html += '<div class="search-overlay__group-title">Pages</div>';
          pages.forEach(function(pg) {
            html += '<a href="' + pg.url + '" class="search-overlay__result-item search-overlay__result-item--text">';
            html += '<div class="search-overlay__result-info">';
            html += '<div class="search-overlay__result-title">' + self.escapeHtml(pg.title) + '</div>';
            html += '</div></a>';
          });
          html += '</div>';
        }

        // Articles
        if (articles.length > 0) {
          html += '<div class="search-overlay__group">';
          html += '<div class="search-overlay__group-title">Articles</div>';
          articles.forEach(function(a) {
            html += '<a href="' + a.url + '" class="search-overlay__result-item search-overlay__result-item--text">';
            html += '<div class="search-overlay__result-info">';
            html += '<div class="search-overlay__result-title">' + self.escapeHtml(a.title) + '</div>';
            html += '</div></a>';
          });
          html += '</div>';
        }

        $results.html(html);

        // View all link (fixed outside scrollable results)
        var $viewAll = self.$overlay.find('[data-search-view-all]');
        $viewAll.attr('href', '/search?q=' + encodeURIComponent(query) + '&type=' + encodeURIComponent(cfg.resourceTypes)).show();
      }).fail(function() {
        if (self.lastQuery !== query) return;
        $loading.removeClass('is-visible');
        $results.html('<div class="search-overlay__no-results">Something went wrong. Please try again.</div>');
      });
    },

    escapeHtml: function(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }
  };

  // ============================================================
  // Mobile Menu
  // ============================================================
  var MobileMenu = {
    init: function() {
      $(document).on('click', '[data-mobile-menu-toggle]', function(e) {
        e.preventDefault();
        $('[data-mobile-menu]').addClass('is-open');
        $('body').css('overflow', 'hidden');
      });

      $(document).on('click', '[data-mobile-menu-close]', function(e) {
        e.preventDefault();
        $('[data-mobile-menu]').removeClass('is-open');
        $('[data-mobile-submenu]').removeClass('is-open');
        $('body').css('overflow', '');
      });

      // Open submenu (works for level 2 and level 3)
      $(document).on('click', '[data-mobile-submenu-trigger]', function(e) {
        e.preventDefault();
        $(this).siblings('[data-mobile-submenu]').addClass('is-open');
      });

      // Back button (closes the nearest submenu)
      $(document).on('click', '[data-mobile-back]', function(e) {
        e.preventDefault();
        $(this).closest('[data-mobile-submenu]').removeClass('is-open');
      });
    }
  };

  // ============================================================
  // Announcement Bar
  // ============================================================
  var AnnouncementBar = {
    CLOSE_DURATION_MS: 24 * 60 * 60 * 1000,

    init: function() {
      var self = this;
      $('[data-announcement-bar]').each(function() {
        var $bar = $(this);
        var key = self.getCloseKey($bar);

        if (self.shouldHide(key)) {
          $bar.addClass('is-hidden');
          return;
        }

        $bar.find('[data-announcement-close]').on('click', function() {
          $bar.addClass('is-hidden');
          self.persistClose(key);
        });
      });
    },

    getCloseKey: function($bar) {
      return 'announcement_closed_' + $bar.data('section-id');
    },

    shouldHide: function(key) {
      try {
        var stored = localStorage.getItem(key);
        if (stored && Date.now() - parseInt(stored, 10) < this.CLOSE_DURATION_MS) return true;
      } catch(e) {}
      return this.getCookie(key) === '1';
    },

    persistClose: function(key) {
      try {
        localStorage.setItem(key, Date.now().toString());
      } catch(e) {}
      this.setCookie(key, '1', this.CLOSE_DURATION_MS);
    },

    setCookie: function(name, value, durationMs) {
      var d = new Date();
      d.setTime(d.getTime() + durationMs);
      document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/';
    },

    getCookie: function(name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
  };

  // ============================================================
  // Quantity Controls (global)
  // ============================================================
  function initQuantityControls() {
    $(document).on('click', '[data-qty-minus]', function() {
      var $input = $(this).siblings('[data-qty-input]');
      if (!$input.length) $input = $(this).parent().find('[data-qty-input]');
      var val = parseInt($input.val(), 10);
      if (val > 1) $input.val(val - 1);
    });

    $(document).on('click', '[data-qty-plus]', function() {
      var $input = $(this).siblings('[data-qty-input]');
      if (!$input.length) $input = $(this).parent().find('[data-qty-input]');
      $input.val(parseInt($input.val(), 10) + 1);
    });
  }

  // ============================================================
  // AJAX Add to Cart (product card quick add)
  // ============================================================
  function initQuickAdd() {
    $(document).on('click', '[data-quick-add]', function(e) {
      e.preventDefault();
      var $btn = $(this);
      var variantId = $btn.data('variant-id');
      $btn.prop('disabled', true).html(LOADING_ICON);
      CartDrawer.addItem(variantId, 1);
      setTimeout(function() {
        $btn.prop('disabled', false).text('Quick Add');
      }, 1000);
    });
  }

  // ============================================================
  // Featured Collection Carousel – Variants, Qty & Add to Cart
  // ============================================================
  function initFccAddToCart() {
    // Variant selection
    $(document).on('click', '[data-fcc-variant-btn]', function(e) {
      e.preventDefault();
      var $btn = $(this);
      var $controls = $btn.closest('[data-fcc-controls]');

      // Toggle active state
      $btn.siblings().removeClass('feat-collection-carousel__variant-btn--active');
      $btn.addClass('feat-collection-carousel__variant-btn--active');

      // Update ATC button variant id
      var variantId = $btn.data('variant-id');
      var variantAvailable = String($btn.data('variant-available')) === 'true';
      var $atc = $controls.find('[data-fcc-add-to-cart]');

      if ($atc.length) {
        $atc.attr('data-variant-id', variantId);
        $atc.data('variant-id', variantId);
      }

      // Update price
      var variantPrice = $btn.data('variant-price');
      if (variantPrice) {
        $controls.closest('.feat-collection-carousel__item').find('.feat-collection-carousel__price').html(variantPrice);
      }

      // Handle sold out variant
      var $atcWrapper = $controls.find('.feat-collection-carousel__atc');
      if (!variantAvailable) {
        $atcWrapper.prop('disabled', true).text('Sold Out').addClass('feat-collection-carousel__atc--sold-out');
      } else {
        $atcWrapper.prop('disabled', false).text('Add to cart').removeClass('feat-collection-carousel__atc--sold-out');
      }
    });

    // Quantity minus
    $(document).on('click', '[data-fcc-qty-minus]', function(e) {
      e.preventDefault();
      var $input = $(this).siblings('[data-fcc-qty-input]');
      var val = parseInt($input.val(), 10);
      if (val > 1) $input.val(val - 1);
    });

    // Quantity plus
    $(document).on('click', '[data-fcc-qty-plus]', function(e) {
      e.preventDefault();
      var $input = $(this).siblings('[data-fcc-qty-input]');
      var val = parseInt($input.val(), 10);
      $input.val(val + 1);
    });

    // Add to cart
    $(document).on('click', '[data-fcc-add-to-cart]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $btn = $(this);
      var $controls = $btn.closest('[data-fcc-controls]');
      var $item = $btn.closest('.feat-collection-carousel__item');
      var variantId = parseInt($btn.attr('data-variant-id'), 10);
      var qty = parseInt($controls.find('[data-fcc-qty-input]').val(), 10) || 1;
      var activeVariant = $controls.find('.feat-collection-carousel__variant-btn--active');

      var productName = $item.find('.feat-collection-carousel__title').text().trim();
      var variantTitle = activeVariant.length ? activeVariant.text().trim() : 'Default';
      var price = $item.find('.feat-collection-carousel__price').text().trim();

      console.log('🛒 Adding product to cart...', {
        product: productName,
        variantId: variantId,
        variant: variantTitle,
        quantity: qty,
        price: price
      });

      var root = window.Shopify.routes.root || '/';

      $btn.prop('disabled', true).html(LOADING_ICON);

      fetch(root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] })
      })
      .then(function(res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function(item) {
        console.log('✅ Added product to cart', {
          product: productName,
          variant: variantTitle,
          quantity: qty,
          lineItem: item
        });

        $btn.text('Added!');
        fetch(root + 'cart.js')
          .then(function(res) { return res.json(); })
          .then(function(cart) {
            console.log('🔢 Cart count updated:', cart.item_count, 'items, Total:', (cart.total_price / 100).toFixed(2));
            CartDrawer.refreshCart(cart);
            CartDrawer.open();
            console.log('📦 Mini cart shown');
          });
        setTimeout(function() {
          $btn.prop('disabled', false).text('Add to cart');
        }, 1500);
      })
      .catch(function(err) {
        console.error('❌ Failed to add to cart', {
          product: productName,
          variantId: variantId,
          error: err.message
        });
        $btn.prop('disabled', false).text('Add to cart');
      });
    });
  }

  // ============================================================
  // AJAX Product Form Submit
  // ============================================================
  function initProductForm() {
    $(document).on('submit', '[data-product-form]', function(e) {
      e.preventDefault();
      var $form = $(this);
      var $btn = $form.find('[data-add-to-cart]');
      var originalText = $btn.text();

      var root = window.Shopify.routes.root || '/';

      $btn.prop('disabled', true).html(LOADING_ICON);

      var formData = {};
      $form.serializeArray().forEach(function(field) { formData[field.name] = field.value; });

      fetch(root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: parseInt(formData.id, 10), quantity: parseInt(formData.quantity, 10) || 1 }] })
      })
      .then(function(res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function() {
        $btn.text('Added!');
        fetch(root + 'cart.js')
          .then(function(res) { return res.json(); })
          .then(function(cart) {
            CartDrawer.refreshCart(cart);
            CartDrawer.open();
          });
        setTimeout(function() {
          $btn.prop('disabled', false).text(originalText);
        }, 1500);
      })
      .catch(function() {
        $btn.prop('disabled', false).text(originalText);
      });
    });
  }

  // ============================================================
  // Variant Selection (PDP)
  // ============================================================
  function initVariantSelection() {
    var $productJson = $('[data-product-json]');
    if (!$productJson.length) return;

    try {
      var product = JSON.parse($productJson.text());
    } catch(e) { return; }

    $(document).on('change', '[data-option-select]', function() {
      var options = [];
      $('[data-option-select]').each(function() {
        options.push($(this).val());
      });

      var matched = product.variants.find(function(v) {
        return v.options.every(function(opt, i) { return opt === options[i]; });
      });

      if (matched) {
        $('[data-variant-id]').val(matched.id);

        // Update price
        var priceHtml = '';
        if (matched.compare_at_price && matched.compare_at_price > matched.price) {
          priceHtml = '<span class="sale-price">' + formatMoney(matched.price) + '</span>';
          priceHtml += ' <span class="compare-price">' + formatMoney(matched.compare_at_price) + '</span>';
        } else {
          priceHtml = '<span>' + formatMoney(matched.price) + '</span>';
        }
        $('[data-product-price]').html(priceHtml);

        // Update button
        var $btn = $('[data-add-to-cart]');
        if (matched.available) {
          $btn.prop('disabled', false).text('Add to Cart');
        } else {
          $btn.prop('disabled', true).text('Sold Out');
        }

        // Update URL
        if (window.history && window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', matched.id);
          window.history.replaceState({}, '', url.toString());
        }
      }
    });
  }

  // ============================================================
  // Slick Sliders Init
  // ============================================================
  function initSliders() {
    // Hero slider – Splide
    document.querySelectorAll('[data-hero-slider]').forEach(function(el) {
      var slidesDesktop = parseInt(el.dataset.slidesDesktop, 10) || 1;
      var slidesMobile = parseInt(el.dataset.slidesMobile, 10) || 1;
      var autoplay = el.dataset.autoplay === 'true';
      var autoplaySpeed = (parseInt(el.dataset.autoplaySpeed, 10) || 5) * 1000;
      var slideCount = el.querySelectorAll('.splide__slide').length;
      var isSingle = slideCount <= 1;
      var useFade = slidesDesktop === 1 && slidesMobile === 1;

      var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" fill="none" viewBox="0 0 19 13"><path fill="#161A1D" fill-rule="evenodd" d="M19 6.108a.679.679 0 0 0-.678-.679H2.317l4.27-4.27a.68.68 0 1 0-.96-.96L.199 5.627a.679.679 0 0 0 0 .961l5.429 5.428a.678.678 0 1 0 .96-.96l-4.27-4.27h16.004A.679.679 0 0 0 19 6.108Z" clip-rule="evenodd"/></svg>';

      var splide = new Splide(el, {
        type: useFade ? 'fade' : 'slide',
        rewind: true,
        perPage: slidesDesktop,
        autoplay: autoplay && !isSingle,
        interval: autoplaySpeed,
        pauseOnHover: true,
        speed: 600,
        easing: 'ease-in-out',
        pagination: !isSingle,
        arrows: !isSingle,
        arrowPath: '',
        breakpoints: {
          767: {
            perPage: slidesMobile
          }
        }
      }).mount();

      // Replace default Splide arrow markup with custom arrows
      if (!isSingle) {
        var prevBtn = el.querySelector('.splide__arrow--prev');
        var nextBtn = el.querySelector('.splide__arrow--next');
        if (prevBtn) {
          prevBtn.className = 'hero-slider__arrow hero-slider__arrow--prev splide__arrow splide__arrow--prev';
          prevBtn.innerHTML = arrowSvg;
        }
        if (nextBtn) {
          nextBtn.className = 'hero-slider__arrow hero-slider__arrow--next splide__arrow splide__arrow--next';
          nextBtn.innerHTML = arrowSvg;
        }
      }
    });

    // Custom arrow SVG for all Splide sliders
    var splideArrowSvg = '<svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.10761C0 5.92765 0.0714874 5.75507 0.198736 5.62782C0.325985 5.50057 0.498571 5.42908 0.678528 5.42908H16.6823L12.4116 1.15978C12.3485 1.0967 12.2985 1.0218 12.2644 0.939375C12.2302 0.856948 12.2126 0.768603 12.2126 0.679385C12.2126 0.590167 12.2302 0.501823 12.2644 0.419396C12.2985 0.336969 12.3485 0.262074 12.4116 0.198987C12.4747 0.1359 12.5496 0.0858575 12.632 0.0517152C12.7145 0.0175729 12.8028 0 12.892 0C12.9813 0 13.0696 0.0175729 13.152 0.0517152C13.2345 0.0858575 13.3093 0.1359 13.3724 0.198987L18.8007 5.62721C18.8638 5.69024 18.914 5.76512 18.9482 5.84755C18.9824 5.92999 19 6.01836 19 6.10761C19 6.19686 18.9824 6.28523 18.9482 6.36767C18.914 6.4501 18.8638 6.52498 18.8007 6.58801L13.3724 12.0162C13.3093 12.0793 13.2345 12.1294 13.152 12.1635C13.0696 12.1976 12.9813 12.2152 12.892 12.2152C12.8028 12.2152 12.7145 12.1976 12.632 12.1635C12.5496 12.1294 12.4747 12.0793 12.4116 12.0162C12.3485 11.9531 12.2985 11.8783 12.2644 11.7958C12.2302 11.7134 12.2126 11.6251 12.2126 11.5358C12.2126 11.4466 12.2302 11.3583 12.2644 11.2758C12.2985 11.1934 12.3485 11.1185 12.4116 11.0554L16.6823 6.78614H0.678528C0.498571 6.78614 0.325985 6.71465 0.198736 6.5874C0.0714874 6.46015 0 6.28757 0 6.10761Z" fill="#161A1D"/></svg>';

    function replaceSplideArrows(container) {
      container.querySelectorAll('.splide__arrow').forEach(function(btn) {
        btn.innerHTML = splideArrowSvg;
      });
    }

    // Icon with Text Slider – Splide
    document.querySelectorAll('[data-iwt-slider]').forEach(function(el) {
      var section = el.closest('.icon-with-text');
      var colsDesktop = parseInt(getComputedStyle(section).getPropertyValue('--iwt-cols-desktop')) || 6;
      var colsTablet = parseInt(getComputedStyle(section).getPropertyValue('--iwt-cols-tablet')) || 4;
      var colsMobile = parseInt(getComputedStyle(section).getPropertyValue('--iwt-cols-mobile')) || 3;
      new Splide(el, {
        type: 'slide',
        perPage: colsDesktop,
        gap: '16px',
        pagination: true,
        arrows: true,
        breakpoints: {
          1024: { perPage: colsTablet },
          750: { perPage: colsMobile, pagination: true }
        }
      }).mount();
      replaceSplideArrows(el);
    });

    // Icon with Text Scroll – Splide
    document.querySelectorAll('[data-iwt-scroll-slider]').forEach(function(el) {
      new Splide(el, {
        type: 'slide',
        autoWidth: true,
        gap: '20px',
        pagination: true,
        arrows: true,
        breakpoints: {
          750: { pagination: true, arrows: true }
        }
      }).mount();
      replaceSplideArrows(el);
    });

    // Featured collection carousel – Splide
    document.querySelectorAll('[data-feat-collection-carousel]').forEach(function(el) {
      new Splide(el, {
        type: 'slide',
        perPage: 4,
        gap: '16px',
        pagination: true,
        arrows: true,
        breakpoints: {
          1024: { perPage: 3 },
          750: { perPage: 1, padding: { right: '25%' }, pagination: true }
        }
      }).mount();
      replaceSplideArrows(el);
    });

    // Store locations slider – Splide
    document.querySelectorAll('[data-store-locations-slider]').forEach(function(el) {
      new Splide(el, {
        type: 'slide',
        perPage: 3,
        gap: '20px',
        pagination: true,
        arrows: true,
        breakpoints: {
          1024: { perPage: 2 },
          750: { perPage: 1, padding: { right: '25%' }, pagination: true }
        }
      }).mount();
      replaceSplideArrows(el);
    });

    // Related products – fetch via AJAX then init Splide
    document.querySelectorAll('[data-related-products-section]').forEach(function(section) {
      var url = section.getAttribute('data-url');
      if (!url) return;

      console.log('📦 Related Products — fetching', { url: url });

      fetch(url)
        .then(function(res) {
          console.log('📦 Related Products — response status', { status: res.status, ok: res.ok });
          return res.text();
        })
        .then(function(html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var freshContainer = doc.querySelector('[data-related-products-container]');

          if (!freshContainer) {
            console.warn('📦 Related Products — no [data-related-products-container] found in response');
            return;
          }

          var productCards = freshContainer.querySelectorAll('.feat-collection-carousel__item');
          console.log('📦 Related Products — products received', {
            count: productCards.length,
            products: Array.from(productCards).map(function(card) {
              var title = card.querySelector('.feat-collection-carousel__title');
              var price = card.querySelector('.feat-collection-carousel__price');
              return {
                title: title ? title.textContent.trim() : 'N/A',
                price: price ? price.textContent.trim() : 'N/A'
              };
            })
          });

          var container = section.querySelector('[data-related-products-container]');
          container.innerHTML = freshContainer.innerHTML;
          console.log('📦 Related Products — HTML injected into DOM');

          // Init Splide on the newly injected carousel
          container.querySelectorAll('[data-related-products-carousel]').forEach(function(el) {
            new Splide(el, {
              type: 'slide',
              perPage: 4,
              gap: '16px',
              pagination: true,
              arrows: true,
              breakpoints: {
                1024: { perPage: 3 },
                750: { perPage: 1, padding: { right: '25%' }, pagination: true }
              }
            }).mount();
            replaceSplideArrows(el);
            console.log('📦 Related Products — Splide carousel initialized');
          });

          // Init AOS for new elements
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
            console.log('📦 Related Products — AOS refreshed');
          }

          // Init add-to-cart for new cards
          if (typeof initFccAddToCart === 'function') {
            initFccAddToCart();
            console.log('📦 Related Products — add-to-cart handlers initialized');
          }
        })
        .catch(function(err) {
          console.error('📦 Related Products — fetch failed', err);
        });
    });

    // Recently Visited – debug logging
    (function() {
      var recentSection = document.querySelector('.recently-visited-section, [data-recently-visited]');
      if (recentSection) {
        console.log('👁️ Recently Visited — section found in DOM', {
          element: recentSection,
          innerHTML_length: recentSection.innerHTML.length
        });
      } else {
        console.log('👁️ Recently Visited — no section found in DOM');
      }

      // Log current product for tracking
      var productJson = document.querySelector('[data-product-json]');
      if (productJson) {
        try {
          var productData = JSON.parse(productJson.textContent);
          console.log('👁️ Recently Visited — current product data', {
            id: productData.id,
            title: productData.title,
            handle: productData.handle,
            url: productData.url,
            featured_image: productData.featured_image,
            price: productData.price,
            variants_count: productData.variants ? productData.variants.length : 0
          });

          // Check localStorage for recently visited
          var storageKey = 'recently-visited';
          var stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              var recentProducts = JSON.parse(stored);
              console.log('👁️ Recently Visited — stored products', {
                count: recentProducts.length,
                products: recentProducts
              });
            } catch(e) {
              console.log('👁️ Recently Visited — stored data (raw)', stored);
            }
          } else {
            console.log('👁️ Recently Visited — no products in localStorage');
          }
        } catch(e) {
          console.warn('👁️ Recently Visited — could not parse product JSON', e);
        }
      } else {
        console.log('👁️ Recently Visited — not on a product page (no [data-product-json])');
      }
    })();

    // Product sliders – Splide
    document.querySelectorAll('[data-product-slider]').forEach(function(el) {
      new Splide(el, {
        type: 'slide',
        perPage: 4,
        gap: '16px',
        pagination: true,
        arrows: true,
        breakpoints: {
          1024: { perPage: 3 },
          750: { perPage: 1, padding: { right: '25%' }, pagination: true }
        }
      }).mount();
      replaceSplideArrows(el);
    });

    // Testimonial slider – Splide
    document.querySelectorAll('[data-testimonial-slider]').forEach(function(el) {
      var splide = new Splide(el, {
        type: 'slide',
        perPage: 3,
        gap: '20px',
        pagination: true,
        arrows: true,
        breakpoints: {
          1024: { perPage: 2 },
          750: { perPage: 1, padding: { right: '25%' }, pagination: true }
        }
      });

      splide.on('mounted resized', function() {
        var slides = el.querySelectorAll('.splide__slide');
        var maxHeight = 0;
        slides.forEach(function(slide) {
          slide.style.height = 'auto';
          if (slide.offsetHeight > maxHeight) {
            maxHeight = slide.offsetHeight;
          }
        });
        slides.forEach(function(slide) {
          slide.style.height = maxHeight + 'px';
        });
      });

      splide.mount();
      replaceSplideArrows(el);
    });
  }

  // ============================================================
  // Video Cards
  // ============================================================
  function initVideoCards() {
    $(document).on('click', '[data-video-play]', function(e) {
      e.preventDefault();
      var $card = $(this).closest('[data-video-card]');
      var $template = $card.find('[data-video-embed]');
      if ($template.length) {
        var html = $template.html();
        $card.html(html);
      }
    });
  }

  // ============================================================
  // Collection Sort
  // ============================================================
  function initCollectionSort() {
    $('[data-sort-by]').on('change', function() {
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', $(this).val());
      window.location.href = url.toString();
    });
  }

  // ============================================================
  // Escape Key Handler
  // ============================================================
  function initEscapeHandler() {
    $(document).on('keydown', function(e) {
      if (e.key === 'Escape') {
        CartDrawer.close();
        ProductDrawer.close();
        SearchOverlay.close();
        $('[data-mobile-menu]').removeClass('is-open');
        $('body').css('overflow', '');
      }
    });
  }

  // ============================================================
  // Wishlist Manager
  // ============================================================
  var Wishlist = {
    STORAGE_KEY: 'na_wishlist',
    VIEW_KEY: 'na_wishlist_view',
    customerItems: [],

    init: function() {
      var self = this;

      // Load customer metafield data if available
      if (window.__wishlist_metafield && Array.isArray(window.__wishlist_metafield)) {
        this.customerItems = window.__wishlist_metafield;
      }

      // Sync localStorage with customer metafield if logged in
      if (this.isLoggedIn()) {
        this.sync();
      }

      this.updateAllButtons();
      this.updateBadge();

      // Click delegation for wishlist toggle buttons
      $(document).on('click', '[data-wishlist-toggle]', function(e) {
        e.preventDefault();
        var handle = $(this).data('wishlist-toggle');
        if (!handle) return;

        if (self.hasItem(handle)) {
          self.removeItem(handle);
        } else {
          self.addItem(handle);
        }
      });
    },

    isLoggedIn: function() {
      return window.__shopify_customer === true;
    },

    getItems: function() {
      var stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          var parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    setItems: function(items) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      this.updateAllButtons();
      this.updateBadge();
      $(document).trigger('wishlist:updated');
    },

    addItem: function(handle) {
      var items = this.getItems();
      if (items.indexOf(handle) === -1) {
        items.push(handle);
        this.setItems(items);
      }
    },

    removeItem: function(handle) {
      var items = this.getItems();
      var index = items.indexOf(handle);
      if (index > -1) {
        items.splice(index, 1);
        this.setItems(items);
      }
    },

    hasItem: function(handle) {
      return this.getItems().indexOf(handle) > -1;
    },

    getCount: function() {
      return this.getItems().length;
    },

    sync: function() {
      var items = this.getItems();
      var merged = items.slice();
      for (var i = 0; i < this.customerItems.length; i++) {
        if (merged.indexOf(this.customerItems[i]) === -1) {
          merged.push(this.customerItems[i]);
        }
      }
      this.setItems(merged);
    },

    updateAllButtons: function() {
      var self = this;
      $('[data-wishlist-toggle]').each(function() {
        var handle = $(this).data('wishlist-toggle');
        if (self.hasItem(handle)) {
          $(this).addClass('wishlist-btn--active');
        } else {
          $(this).removeClass('wishlist-btn--active');
        }
      });
    },

    updateBadge: function() {
      var count = this.getCount();
      var $badge = $('[data-wishlist-count-badge]');
      $badge.text(count);
      if (count > 0) {
        $badge.show();
      } else {
        $badge.hide();
      }
    },

    getView: function() {
      return localStorage.getItem(this.VIEW_KEY) || 'grid';
    },

    setView: function(view) {
      localStorage.setItem(this.VIEW_KEY, view);
    }
  };

  // ============================================================
  // Wishlist Page
  // ============================================================
  var WishlistPage = {
    $page: null,
    $grid: null,
    $emptyState: null,
    $viewButtons: null,

    init: function() {
      this.$page = $('[data-wishlist-page]');
      if (!this.$page.length) return;

      var self = this;

      this.$grid = this.$page.find('[data-wishlist-grid]');
      this.$emptyState = this.$page.find('[data-wishlist-empty]');
      this.$viewButtons = this.$page.find('[data-wishlist-view]');

      // View toggle click handlers
      this.$viewButtons.on('click', function() {
        var view = $(this).data('wishlist-view');
        Wishlist.setView(view);
        self.setActiveView(view);
        self.render(self._products || []);
      });

      // Set initial active view
      this.setActiveView(Wishlist.getView());

      // Listen for wishlist updates
      $(document).on('wishlist:updated', function() {
        self.loadProducts();
      });

      this.loadProducts();
    },

    setActiveView: function(view) {
      this.$viewButtons.removeClass('--active');
      this.$viewButtons.filter('[data-wishlist-view="' + view + '"]').addClass('--active');
    },

    loadProducts: function() {
      var self = this;
      var items = Wishlist.getItems();

      if (!items.length) {
        this.$grid.empty();
        this.$emptyState.show();
        this._products = [];
        return;
      }

      this.$emptyState.hide();
      var products = [];
      var loaded = 0;

      for (var i = 0; i < items.length; i++) {
        (function(handle) {
          $.getJSON('/products/' + handle + '.json')
            .done(function(data) {
              products.push(data.product);
            })
            .always(function() {
              loaded++;
              if (loaded === items.length) {
                self._products = products;
                self.render(products);
              }
            });
        })(items[i]);
      }
    },

    render: function(products) {
      var view = Wishlist.getView();
      var html = '';

      if (view === 'list') {
        html = '<div class="wishlist-list">';
        for (var i = 0; i < products.length; i++) {
          html += this.renderListItem(products[i]);
        }
        html += '</div>';
      } else {
        html = '<div class="wishlist-grid">';
        for (var i = 0; i < products.length; i++) {
          html += this.renderGridCard(products[i]);
        }
        html += '</div>';
      }

      this.$grid.html(html);
    },

    renderGridCard: function(product) {
      var handle = product.handle;
      var url = '/products/' + handle;
      var imageUrl = product.image ? product.image.src : '';
      var price = product.variants[0].price;
      var comparePrice = product.variants[0].compare_at_price;
      var available = product.variants[0].available;
      var variantId = product.variants[0].id;
      var isActive = Wishlist.hasItem(handle) ? ' wishlist-btn--active' : '';

      var tagsHtml = '';
      if (comparePrice && comparePrice > price) {
        var savePercent = Math.round((comparePrice - price) / comparePrice * 100);
        tagsHtml += '<span class="product-card__tag product-card__tag--sale">-' + savePercent + '%</span>';
      }
      if (!available) {
        tagsHtml += '<span class="product-card__tag product-card__tag--sold-out">Sold out</span>';
      }

      var priceHtml = '';
      if (comparePrice && comparePrice > price) {
        priceHtml = '<span class="product-card__price-sale">' + formatMoney(price * 100) + '</span>' +
          '<span class="product-card__price-compare">' + formatMoney(comparePrice * 100) + '</span>';
      } else {
        priceHtml = '<span>' + formatMoney(price * 100) + '</span>';
      }

      var actionsHtml = '';
      if (available) {
        if (product.variants.length === 1) {
          actionsHtml = '<div class="product-card__actions">' +
            '<button class="product-card__quick-add" data-quick-add data-variant-id="' + variantId + '" type="button">Quick add</button>' +
            '</div>';
        } else {
          actionsHtml = '<div class="product-card__actions">' +
            '<button class="product-card__quick-add" data-quick-view data-product-url="' + url + '" type="button">Quick add</button>' +
            '</div>';
        }
      }

      return '<div class="product-card" data-product-card>' +
        '<div class="product-card__media">' +
          '<a href="' + url + '" aria-label="' + product.title + '">' +
            (imageUrl ? '<img src="' + imageUrl + '" alt="' + product.title + '" loading="lazy">' : '') +
          '</a>' +
          '<div class="product-card__tags">' + tagsHtml + '</div>' +
          '<button class="product-card__wishlist wishlist-btn' + isActive + '" data-wishlist-toggle="' + handle + '" type="button" aria-label="Wishlist">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '</button>' +
          actionsHtml +
        '</div>' +
        '<div class="product-card__info">' +
          '<h3 class="product-card__title"><a href="' + url + '">' + product.title + '</a></h3>' +
          '<div class="product-card__price">' + priceHtml + '</div>' +
        '</div>' +
      '</div>';
    },

    renderListItem: function(product) {
      var handle = product.handle;
      var url = '/products/' + handle;
      var imageUrl = product.image ? product.image.src : '';
      var price = product.variants[0].price;
      var comparePrice = product.variants[0].compare_at_price;
      var available = product.variants[0].available;
      var variantId = product.variants[0].id;

      var priceHtml = '';
      if (comparePrice && comparePrice > price) {
        priceHtml = '<span class="wishlist-list__price-sale">' + formatMoney(price * 100) + '</span>' +
          '<span class="wishlist-list__price-compare">' + formatMoney(comparePrice * 100) + '</span>';
      } else {
        priceHtml = '<span>' + formatMoney(price * 100) + '</span>';
      }

      var addBtnHtml = '';
      if (available) {
        addBtnHtml = '<button class="wishlist-list__atc btn" data-quick-add data-variant-id="' + variantId + '" type="button">Add to Cart</button>';
      } else {
        addBtnHtml = '<button class="wishlist-list__atc btn btn--disabled" type="button" disabled>Sold out</button>';
      }

      return '<div class="wishlist-list__item" data-wishlist-item="' + handle + '">' +
        '<div class="wishlist-list__image">' +
          '<a href="' + url + '">' +
            (imageUrl ? '<img src="' + imageUrl + '" alt="' + product.title + '" loading="lazy">' : '') +
          '</a>' +
        '</div>' +
        '<div class="wishlist-list__details">' +
          '<h3 class="wishlist-list__title"><a href="' + url + '">' + product.title + '</a></h3>' +
          '<div class="wishlist-list__price">' + priceHtml + '</div>' +
        '</div>' +
        '<div class="wishlist-list__actions">' +
          addBtnHtml +
          '<button class="wishlist-list__remove" data-wishlist-toggle="' + handle + '" type="button" aria-label="Remove from wishlist">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }
  };

  // ============================================================
  // Initialize everything on DOM ready
  // ============================================================
  $(function() {
    CartDrawer.init();
    ProductDrawer.init();
    SearchOverlay.init();
    MobileMenu.init();
    AnnouncementBar.init();
    initQuantityControls();
    initQuickAdd();
    initFccAddToCart();
    initProductForm();
    initVariantSelection();
    initSliders();
    initVideoCards();
    initCollectionSort();
    initEscapeHandler();
    Wishlist.init();
    WishlistPage.init();
  });

})(jQuery);
