(function ($) {
  const {
    $searchToggleBtn, $searchBarContainer, $searchCloseBtn,
    $searchIconBtn, $navListContainer, $headerHoverContainer,
    $headerNormalContainer, $headerOverlay
  } = DOM;

  $searchToggleBtn.on("click", function () {
    if ($navListContainer.hasClass("show")) {
      $navListContainer.removeClass("show");
    }
    $searchBarContainer.toggleClass("show");
    $searchIconBtn.toggleClass("hide");
    $navListContainer.toggleClass("hide", $searchBarContainer.hasClass("show"));
    $headerHoverContainer.toggleClass("show", $searchBarContainer.hasClass("show"));
    $headerNormalContainer.toggleClass("show", !$searchBarContainer.hasClass("show"));
    handlePageOverflowAndOverlay();
  });

  $searchCloseBtn.on("click", function () {
    $searchBarContainer.removeClass("show");
    $searchIconBtn.removeClass("hide");
    $navListContainer.removeClass("hide");
    $headerHoverContainer.removeClass("show");
    $headerNormalContainer.addClass("show");
    handlePageOverflowAndOverlay();
  });

  $headerOverlay.on("click", function () {
    $searchBarContainer.removeClass("show");
    $headerHoverContainer.removeClass("show");
    $headerNormalContainer.addClass("show");
    $searchIconBtn.removeClass("hide");
    $navListContainer.removeClass("show hide");
    handlePageOverflowAndOverlay();
  });
})(jQuery);
