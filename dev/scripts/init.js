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
          '<p>Your cart is empty</p>' +
          '<a href="/collections/all" class="btn btn--primary">Continue Shopping</a>' +
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
        html += '<a href="' + item.url + '" class="cart-drawer__item-image">';
        if (item.image) {
          html += '<img src="' + item.image.replace(/(\.[^.]+)$/, '_144x$1') + '" alt="' + item.title + '" width="72" height="90" loading="lazy">';
        }
        html += '</a>';
        html += '<div class="cart-drawer__item-info">';
        html += '<a href="' + item.url + '" class="cart-drawer__item-title">' + item.product_title + '</a>';
        if (variantTitle) {
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

    init: function() {
      this.$overlay = $('[data-search-overlay]');
      if (!this.$overlay.length) return;

      var self = this;

      $(document).on('click', '[data-search-toggle]', function(e) {
        e.preventDefault();
        self.open();
      });

      $(document).on('click', '[data-search-overlay-close]', function(e) {
        e.preventDefault();
        self.close();
      });

      this.$overlay.find('[data-search-input]').on('input', function() {
        var query = $(this).val().trim();
        clearTimeout(self.searchTimeout);
        if (query.length < 3) {
          self.$overlay.find('[data-search-results]').empty();
          return;
        }
        self.searchTimeout = setTimeout(function() {
          self.search(query);
        }, 300);
      });
    },

    open: function() {
      this.$overlay.addClass('is-open');
      this.$overlay.find('[data-search-input]').focus();
      $('body').css('overflow', 'hidden');
    },

    close: function() {
      this.$overlay.removeClass('is-open');
      $('body').css('overflow', '');
    },

    search: function(query) {
      var $results = this.$overlay.find('[data-search-results]');
      $.getJSON('/search/suggest.json', { q: query, resources: { type: 'product', limit: 6 } }, function(data) {
        var products = data.resources && data.resources.results && data.resources.results.products;
        if (!products || products.length === 0) {
          $results.html('<div class="search-overlay__no-results">No results found</div>');
          return;
        }
        var html = '';
        products.forEach(function(p) {
          html += '<a href="' + p.url + '" class="search-overlay__result-item">';
          if (p.image) html += '<img src="' + p.image + '" alt="' + p.title + '">';
          html += '<div class="search-overlay__result-item-info">';
          html += '<div class="search-overlay__result-item-title">' + p.title + '</div>';
          html += '<div class="search-overlay__result-item-price">' + formatMoney(p.price) + '</div>';
          html += '</div></a>';
        });
        $results.html(html);
      });
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
      var arrowSvg = $slider.find('.hero-slider__arrow-svg').html();

      $slider.slick({
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        arrows: true,
        prevArrow: '<button type="button" class="hero-slider__arrow hero-slider__arrow--prev">' + arrowSvg + '</button>',
        nextArrow: '<button type="button" class="hero-slider__arrow hero-slider__arrow--next">' + arrowSvg + '</button>',
        fade: true,
        cssEase: 'ease-in-out',
        speed: 600,
        infinite: true,
        pauseOnHover: true,
        adaptiveHeight: false
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
    initProductForm();
    initVariantSelection();
    initSliders();
    initVideoCards();
    initCollectionSort();
    initEscapeHandler();
  });

})(jQuery);
