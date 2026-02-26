(function($) {
  'use strict';

  // ============================================================
  // Gallery Thumbnails
  // ============================================================
  function initGalleryThumbs() {
    $(document).on('click', '[data-gallery-thumbs] button', function() {
      var $btn = $(this);
      var src = $btn.data('full-src');
      var $main = $btn.closest('[data-product-gallery]').find('#ProductMainImage');

      // Update active state
      $btn.siblings().removeClass('is-active');
      $btn.addClass('is-active');

      // Update main image
      $main.attr('src', src);

      // Update zoom link
      var $link = $main.closest('a');
      if ($link.length) {
        $link.attr('href', $btn.data('zoom-src'));
        $link.attr('data-pswp-width', $btn.data('zoom-width'));
        $link.attr('data-pswp-height', $btn.data('zoom-height'));
      }
    });
  }

  // ============================================================
  // Product Accordions
  // ============================================================
  function initAccordions() {
    $(document).on('click', '[data-accordion-trigger]', function() {
      var $trigger = $(this);
      var $content = $trigger.next('[data-accordion-content]');

      $trigger.toggleClass('is-active');
      $content.toggleClass('is-open');
    });
  }

  // ============================================================
  // Variant URL Updates
  // ============================================================
  function initVariantURLUpdates() {
    // Handled in init.js variant selection
    // This ensures URL updates on page load with variant param
    var params = new URLSearchParams(window.location.search);
    var variantId = params.get('variant');
    if (variantId) {
      var $productJson = $('[data-product-json]');
      if ($productJson.length) {
        try {
          var product = JSON.parse($productJson.text());
          var variant = product.variants.find(function(v) { return v.id == variantId; });
          if (variant) {
            // Set the option selects to match
            variant.options.forEach(function(optionVal, index) {
              $('[data-option-select][data-option-index="' + index + '"]').val(optionVal).trigger('change');
            });
          }
        } catch(e) {}
      }
    }
  }

  // ============================================================
  // Initialize on DOM ready
  // ============================================================
  $(function() {
    initGalleryThumbs();
    initAccordions();
    initVariantURLUpdates();
  });

})(jQuery);
