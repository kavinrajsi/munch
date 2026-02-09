(function() {
  // =============================================
  // Helpers
  // =============================================

  function formatMoney(cents) {
    var fmt = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}';
    var value = (cents / 100).toFixed(2);
    return fmt
      .replace(/\{\{\s*amount\s*\}\}/, value)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, value.replace('.', ','))
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, Math.round(cents / 100));
  }

  // =============================================
  // Thumbnail Click
  // =============================================

  var thumbs = document.querySelectorAll('.product__thumb');
  var links = document.querySelectorAll('.product__gallery-link');

  thumbs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.dataset.index, 10);

      links.forEach(function(link) {
        link.classList.remove('product__gallery-link--active');
      });
      var target = document.querySelector('.product__gallery-link[data-image-index="' + idx + '"]');
      if (target) target.classList.add('product__gallery-link--active');

      thumbs.forEach(function(t) { t.classList.remove('product__thumb--active'); });
      btn.classList.add('product__thumb--active');
    });
  });

  // =============================================
  // PhotoSwipe Lightbox
  // =============================================

  if (window.PhotoSwipeLightbox && window.PhotoSwipe) {
    var lightbox = new PhotoSwipeLightbox({
      gallery: '#ProductMainImage',
      children: 'a',
      pswpModule: PhotoSwipe
    });
    lightbox.init();
  }

  // =============================================
  // Variant Selection
  // =============================================

  var variantsJson = document.querySelector('[data-product-page-variants]');
  if (variantsJson) {
    var variants = JSON.parse(variantsJson.textContent);

    document.querySelectorAll('.product__variant-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = btn.closest('.product__variant-group');
        group.querySelectorAll('.product__variant-btn').forEach(function(b) {
          b.classList.remove('product__variant-btn--active');
        });
        btn.classList.add('product__variant-btn--active');

        var selectedOptions = [];
        document.querySelectorAll('.product__variant-group').forEach(function(g) {
          var active = g.querySelector('.product__variant-btn--active');
          if (active) selectedOptions.push(active.dataset.value);
        });

        var matched = null;
        for (var i = 0; i < variants.length; i++) {
          var v = variants[i];
          var match = true;
          for (var j = 0; j < selectedOptions.length; j++) {
            if (String(v.options[j]) !== String(selectedOptions[j])) {
              match = false;
              break;
            }
          }
          if (match) { matched = v; break; }
        }

        if (matched) {
          document.querySelector('[data-variant-id]').value = matched.id;

          var pricingEl = document.getElementById('ProductPricing');
          var html = '';
          if (matched.compare_at_price && matched.compare_at_price > matched.price) {
            var pct = Math.round((matched.compare_at_price - matched.price) / matched.compare_at_price * 100);
            html += '<span class="product__compare-price">' + formatMoney(matched.compare_at_price) + '</span>';
            html += '<span class="product__sale-price">' + formatMoney(matched.price) + '</span>';
            html += '<span class="product__save">Save ' + pct + '%</span>';
          } else {
            html += '<span class="product__regular-price">' + formatMoney(matched.price) + '</span>';
          }
          pricingEl.innerHTML = html;

          var atcBtn = document.querySelector('.product__atc');
          var buyBtn = document.querySelector('.product__buy-now');
          if (matched.available) {
            atcBtn.disabled = false;
            atcBtn.textContent = 'Add to cart';
            if (buyBtn) buyBtn.style.display = '';
          } else {
            atcBtn.disabled = true;
            atcBtn.textContent = 'Sold out';
            if (buyBtn) buyBtn.style.display = 'none';
          }
        }
      });
    });
  }

  // =============================================
  // Quantity +/-
  // =============================================

  var qtyInput = document.querySelector('[data-product-qty-input]');
  var minusBtn = document.querySelector('[data-product-qty-minus]');
  var plusBtn = document.querySelector('[data-product-qty-plus]');

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', function() {
      var val = parseInt(qtyInput.value) - 1;
      if (val < 1) val = 1;
      qtyInput.value = val;
    });
  }
  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', function() {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    });
  }

  // =============================================
  // Buy It Now
  // =============================================

  var buyNowBtn = document.querySelector('[data-product-buy-now]');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var variantId = document.querySelector('[data-variant-id]').value;
      var qty = qtyInput ? qtyInput.value : 1;
      if (variantId) {
        window.location.href = '/cart/' + variantId + ':' + qty;
      }
    });
  }

  // =============================================
  // Accordions
  // =============================================

  document.querySelectorAll('.product__accordion-header').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var current = btn.closest('.product__accordion');
      var isActive = current.classList.contains('product__accordion--active');
      document.querySelectorAll('.product__accordion--active').forEach(function(el) {
        el.classList.remove('product__accordion--active');
      });
      if (!isActive) current.classList.add('product__accordion--active');
    });
  });
})();
