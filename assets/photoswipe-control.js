
  $(document).ready(function () {
    // Step 1: Collect all images from thumbnails
    var pswpItems = [];

    $('#gallery_01 a').each(function () {
      var $link = $(this);
      var src = $link.data('zoom-image');
      var msrc = $link.find('img').attr('src');
    });

    // Step 2: On click of large image
    $('.test-gallery').on('click', function (e) {
      e.preventDefault();

      var currentSrc = $(this).attr('data-zoom-image');
    });
  });
