(function () {
  window.addToCart = function (btn) {
    const $productForm = $(btn).closest("form");
    const formData = new FormData($productForm[0]);
    const productId = $productForm.data("product-id");
    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((res) => res.json())
      .then(() => {
        closeProductModal(productId);
        openCartDrawer();
      })
      .catch((err) => console.error("Add to cart error:", err));
  };
})();
