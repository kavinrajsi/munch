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
  // PhotoSwipe Lightbox
  // ============================================================
  function initPhotoSwipe() {
    if (typeof photoswipe === 'undefined' && typeof PhotoSwipeLightbox === 'undefined') {
      // Wait for PhotoSwipe to load
      var checkInterval = setInterval(function() {
        if (typeof PhotoSwipeLightbox !== 'undefined') {
          clearInterval(checkInterval);
          setupPhotoSwipe();
        }
      }, 100);

      setTimeout(function() { clearInterval(checkInterval); }, 5000);
      return;
    }

    setupPhotoSwipe();
  }

  function setupPhotoSwipe() {
    if (typeof PhotoSwipeLightbox === 'undefined') return;

    var $gallery = $('[data-product-gallery]');
    if (!$gallery.length) return;

    var items = [];
    $gallery.find('[data-gallery-thumbs] button').each(function() {
      items.push({
        src: $(this).data('zoom-src'),
        width: $(this).data('zoom-width'),
        height: $(this).data('zoom-height'),
        alt: $(this).find('img').attr('alt') || ''
      });
    });

    // If no thumbs, use main image
    if (items.length === 0) {
      var $mainLink = $gallery.find('[data-pswp-image]');
      if ($mainLink.length) {
        items.push({
          src: $mainLink.attr('href'),
          width: parseInt($mainLink.attr('data-pswp-width'), 10),
          height: parseInt($mainLink.attr('data-pswp-height'), 10)
        });
      }
    }

    if (items.length === 0) return;

    $gallery.find('[data-gallery-main]').on('click', 'a', function(e) {
      e.preventDefault();

      var lightbox = new PhotoSwipeLightbox({
        dataSource: items,
        pswpModule: PhotoSwipe,
        showHideAnimationType: 'zoom',
        bgOpacity: 0.9
      });

      // Find current index from active thumb
      var activeIndex = 0;
      var $activeThumb = $gallery.find('[data-gallery-thumbs] button.is-active');
      if ($activeThumb.length) {
        activeIndex = parseInt($activeThumb.data('thumb-index'), 10) || 0;
      }

      lightbox.init();
      lightbox.loadAndOpen(activeIndex);
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
    initPhotoSwipe();
    initAccordions();
    initVariantURLUpdates();
  });

})(jQuery);
