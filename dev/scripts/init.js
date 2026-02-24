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
        var $input = $(this).siblings('[data-qty-input]');
        var val = parseInt($input.val(), 10);
        if (val > 1) $input.val(val - 1).trigger('change');
      });

      this.$drawer.on('click', '[data-qty-plus]', function() {
        var $input = $(this).siblings('[data-qty-input]');
        $input.val(parseInt($input.val(), 10) + 1).trigger('change');
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
    },

    open: function() {
      this.$drawer.addClass('is-open');
      $('body').css('overflow', 'hidden');
    },

    close: function() {
      this.$drawer.removeClass('is-open');
      $('body').css('overflow', '');
    },

    updateItem: function(line, quantity) {
      var self = this;
      $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data: { line: line, quantity: quantity },
        dataType: 'json',
        success: function(cart) {
          self.refreshCart(cart);
        }
      });
    },

    addItem: function(variantId, quantity) {
      var self = this;
      quantity = quantity || 1;
      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: { id: variantId, quantity: quantity },
        dataType: 'json',
        success: function() {
          $.getJSON('/cart.js', function(cart) {
            self.refreshCart(cart);
            self.open();
          });
        }
      });
    },

    refreshCart: function(cart) {
      // Read settings from data attributes
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
      if (cart.item_count === 0) {
        $items.html(
          '<div class="cart-drawer__empty">' +
          '<p>' + emptyText + '</p>' +
          '<a href="' + emptyBtnLink + '" class="cart-drawer__checkout">' + emptyBtnText + '</a>' +
          '</div>'
        );
        this.$drawer.find('.cart-drawer__footer').hide();
        return;
      }

      this.$drawer.find('.cart-drawer__footer').show();
      var html = '';
      cart.items.forEach(function(item, index) {
        var variantTitle = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
        html += '<div class="cart-drawer__item" data-cart-item data-line="' + (index + 1) + '">';
        if (showImage) {
          html += '<a href="' + item.url + '" class="cart-drawer__item-image">';
          if (item.image) {
            html += '<img src="' + item.image.replace(/(\.[^.]+)$/, '_144x$1') + '" alt="' + item.title + '" width="72" height="90" loading="lazy">';
          }
          html += '</a>';
        }
        html += '<div class="cart-drawer__item-info">';
        html += '<a href="' + item.url + '" class="cart-drawer__item-title">' + item.product_title + '</a>';
        if (showVariant && variantTitle) {
          html += '<p class="cart-drawer__item-variant">' + variantTitle + '</p>';
        }
        html += '<p class="cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</p>';
        html += '<div class="cart-drawer__item-quantity">';
        html += '<button type="button" data-qty-minus>−</button>';
        html += '<input type="number" value="' + item.quantity + '" min="1" data-qty-input>';
        html += '<button type="button" data-qty-plus>+</button>';
        html += '</div>';
        html += '<button class="cart-drawer__item-remove" data-remove-item type="button">Remove</button>';
        html += '</div></div>';
      });
      $items.html(html);
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
      $('body').css('overflow', 'hidden');
    },

    close: function() {
      this.$overlay.removeClass('is-open');
      $('body').css('overflow', '');
    },

    clearResults: function() {
      this.$overlay.find('[data-search-results]').empty();
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
            if (cfg.showProductVendor && p.vendor) {
              html += '<div class="search-overlay__result-meta">' + self.escapeHtml(p.vendor) + '</div>';
            }
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
            if (a.author) {
              html += '<div class="search-overlay__result-meta">by ' + self.escapeHtml(a.author) + '</div>';
            }
            html += '</div></a>';
          });
          html += '</div>';
        }

        // View all link
        html += '<a href="/search?q=' + encodeURIComponent(query) + '&type=' + encodeURIComponent(cfg.resourceTypes) + '" class="search-overlay__view-all">View all results</a>';

        $results.html(html);
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
        $('body').css('overflow', '');
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
      $btn.siblings().removeClass('fcc-variants__btn--active');
      $btn.addClass('fcc-variants__btn--active');

      // Update ATC button variant id
      var variantId = $btn.data('variant-id');
      var variantAvailable = $btn.data('variant-available');
      var $atc = $controls.find('[data-fcc-add-to-cart]');

      if ($atc.length) {
        $atc.data('variant-id', variantId);
      }

      // Update price
      var variantPrice = $btn.data('variant-price');
      if (variantPrice) {
        $controls.closest('.feat-collection-carousel__item').find('.feat-collection-carousel__price').text(variantPrice);
      }

      // Handle sold out variant
      var $atcWrapper = $controls.find('.fcc-atc');
      if (!variantAvailable) {
        $atcWrapper.prop('disabled', true).text('Sold Out').addClass('fcc-atc--sold-out');
      } else {
        $atcWrapper.prop('disabled', false).text('Add to cart').removeClass('fcc-atc--sold-out');
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
      var variantId = $btn.data('variant-id');
      var qty = parseInt($controls.find('[data-fcc-qty-input]').val(), 10) || 1;

      $btn.prop('disabled', true).text('Adding...');

      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: { id: variantId, quantity: qty },
        dataType: 'json',
        success: function() {
          $btn.text('Added!');
          $.getJSON('/cart.js', function(cart) {
            CartDrawer.refreshCart(cart);
            CartDrawer.open();
          });
          setTimeout(function() {
            $btn.prop('disabled', false).text('Add to cart');
          }, 1500);
        },
        error: function() {
          $btn.prop('disabled', false).text('Add to cart');
        }
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

      $btn.prop('disabled', true).text('Adding...');

      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: $form.serialize(),
        dataType: 'json',
        success: function() {
          $btn.text('Added!');
          $.getJSON('/cart.js', function(cart) {
            CartDrawer.refreshCart(cart);
            CartDrawer.open();
          });
          setTimeout(function() {
            $btn.prop('disabled', false).text(originalText);
          }, 1500);
        },
        error: function() {
          $btn.prop('disabled', false).text(originalText);
        }
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
    // Hero slider
    $('[data-hero-slider]').each(function() {
      var $slider = $(this);
      var $section = $slider.closest('.hero-slider-section');
      var autoplay = $section.find('[data-hero-slider]').length > 0;
      var slidesDesktop = parseInt($slider.data('slides-desktop'), 10) || 1;
      var slidesMobile = parseInt($slider.data('slides-mobile'), 10) || 1;
      var useFade = slidesDesktop === 1 && slidesMobile === 1;
      var slideCount = $slider.children().length;
      var isSingle = slideCount <= 1;
      var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" fill="none" viewBox="0 0 19 13"><path fill="#161A1D" fill-rule="evenodd" d="M19 6.108a.679.679 0 0 0-.678-.679H2.317l4.27-4.27a.68.68 0 1 0-.96-.96L.199 5.627a.679.679 0 0 0 0 .961l5.429 5.428a.678.678 0 1 0 .96-.96l-4.27-4.27h16.004A.679.679 0 0 0 19 6.108Z" clip-rule="evenodd"/></svg>';

      $slider.slick({
        autoplay: !isSingle,
        autoplaySpeed: 5000,
        dots: !isSingle,
        arrows: !isSingle,
        prevArrow: '<button type="button" class="hero-slider__arrow hero-slider__arrow--prev">' + arrowSvg + '</button>',
        nextArrow: '<button type="button" class="hero-slider__arrow hero-slider__arrow--next">' + arrowSvg + '</button>',
        fade: useFade,
        slidesToShow: slidesDesktop,
        slidesToScroll: 1,
        cssEase: 'ease-in-out',
        speed: 600,
        infinite: true,
        pauseOnHover: true,
        adaptiveHeight: false,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: slidesMobile
            }
          }
        ]
      });
    });

    // Featured collection carousel
    $('[data-feat-collection-carousel]').each(function() {
      var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" fill="none" viewBox="0 0 19 13"><path fill="#161A1D" fill-rule="evenodd" d="M19 6.108a.679.679 0 0 0-.678-.679H2.317l4.27-4.27a.68.68 0 1 0-.96-.96L.199 5.627a.679.679 0 0 0 0 .961l5.429 5.428a.678.678 0 1 0 .96-.96l-4.27-4.27h16.004A.679.679 0 0 0 19 6.108Z" clip-rule="evenodd"/></svg>';

      $(this).slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        dots: true,
        infinite: false,
        prevArrow: '<button type="button" class="fcc-arrow fcc-arrow--prev">' + arrowSvg + '</button>',
        nextArrow: '<button type="button" class="fcc-arrow fcc-arrow--next">' + arrowSvg + '</button>',
        responsive: [
          { breakpoint: 1024, settings: { slidesToShow: 4 } },
          { breakpoint: 768, settings: { slidesToShow: 1.2, arrows: false } }
        ]
      });
    });

    // Product sliders
    $('[data-product-slider]').each(function() {
      $(this).slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        dots: true,
        infinite: false,
        responsive: [
          { breakpoint: 1024, settings: { slidesToShow: 3 } },
          { breakpoint: 768, settings: { slidesToShow: 2 } }
        ]
      });
    });

    // Testimonial slider
    $('[data-testimonial-slider]').each(function() {
      $(this).slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 768, settings: { slidesToShow: 1 } }
        ]
      });
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
