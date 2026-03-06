(function($) {
  'use strict';

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
        $btn.prop('disabled', true).text('Adding...');
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
      $btn.prop('disabled', true).text('Adding...');
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

      $btn.prop('disabled', true).text('Adding...');

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

      $btn.prop('disabled', true).text('Adding...');

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
  });

})(jQuery);
