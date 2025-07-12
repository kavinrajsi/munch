(function ($) {
  $("#gallery_01 a").on("click", function () {
    const imageUrl = $(this).data("image");
    const zoomImageUrl = $(this).data("zoom-image");
    const $galleryPicture = $(".test-gallery").closest("picture");
    $(".test-gallery").attr("src", imageUrl).attr("data-zoom-image", zoomImageUrl);
    $galleryPicture.find("source[type='image/avif']").attr("srcset", imageUrl.replace(/\.(jpg|jpeg|png|webp)$/, ".avif"));
    $galleryPicture.find("source[type='image/webp']").attr("srcset", imageUrl.replace(/\.(jpg|jpeg|png)$/, ".webp"));
  });
})(jQuery);
