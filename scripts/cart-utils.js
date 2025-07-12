(function () {
  window.updateQty = function (btn, diff) {
    const $qtyInput = $(btn).siblings(".qty-input");
    let currentQty = parseInt($qtyInput.val(), 10) || 1;
    currentQty = Math.max(currentQty + diff, 1);
    $qtyInput.val(currentQty);
  };

  window.showLoader = function () {
    const loaderElem = document.getElementById("loader");
    if (loaderElem) loaderElem.style.display = "block";
  };

  window.hideLoader = function () {
    const loaderElem = document.getElementById("loader");
    if (loaderElem) loaderElem.style.display = "none";
  };
})();
