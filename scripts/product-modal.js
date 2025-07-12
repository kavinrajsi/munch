(function ($) {
  window.openProductModal = function (productId) {
    $("#product-modal-" + productId).addClass("product-modal--show");
    $("body").addClass("overflow-hidden");
  };

  function closeProductModalById(productId) {
    $("#product-modal-" + productId).removeClass("product-modal--show");
    $("body").removeClass("overflow-hidden");
  }

  window.closeProductModal = closeProductModalById;

  document.addEventListener("click", function (event) {
    if (event.target.matches(".product-modal__buttons--cart")) {
      event.preventDefault();
      window.addToCart(event.target);
    }
    if (event.target.matches(".product-modal__buttons--buy-now")) {
      event.preventDefault();
      console.log("Buy Now button clicked");
    }
  });
})(jQuery);
