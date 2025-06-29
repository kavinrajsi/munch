$(document).ready(function () {
  $(".product-gallery").slick({
    slidesToShow: 1,
    dots: true,
    arrows: true,
  });

  $(".lightbox-trigger").on("click", function (e) {
    e.preventDefault();
    const index = $(this).data("index");
    const items = $(".lightbox-trigger")
      .map(function () {
        return {
          src: $(this).data("full"),
          w: 1200,
          h: 900,
        };
      })
      .get();

    const gallery = new PhotoSwipe(
      document.querySelector(".pswp"),
      PhotoSwipeUI_Default,
      items,
      { index }
    );
    gallery.init();
  });
});
