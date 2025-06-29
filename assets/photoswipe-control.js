// // Include Lightbox
// var lightbox = new PhotoSwipeLightbox({
//   gallery: '.test-gallery',
//   children: 'a',
//   showHideAnimationType: 'fade',
//   pswpModule: PhotoSwipe
// });
// lightbox.init();

// $('.product-images-thumbnails').on('click', 'a', function (e) {
//   var $this = $(this);
//   e.preventDefault();
//   console.log($this.attr('href'));
//   $this.parents('.product-images').find('.ImageMe a').addClass('ter').attr('href', $this.attr('href'));
//   $this.parents('.product-images').find('.ImageMe a').addClass('ter').data('pswp-width', $this.data('pswp-width'));
//   $this.parents('.product-images').find('.ImageMe a').addClass('ter').data('pswp-height', $this.data('pswp-height'));
//   $this.parents('.product-images').find('.ImageMe img').addClass('ter').attr('src', $this.attr('href'));
// });

// Initialize PhotoSwipe Lightbox for product images
        document.addEventListener('DOMContentLoaded', function () {
          if (typeof PhotoSwipeLightbox !== 'undefined' && typeof PhotoSwipe !== 'undefined') {
            const lightbox = new PhotoSwipeLightbox({
              gallery: '#product-gallery',
              children: 'a.zoomable',
              showHideAnimationType: 'fade',
              pswpModule: PhotoSwipe,
            });
            lightbox.init();
          } else {
            console.error('❌ PhotoSwipe library not found.');
          }
        });
