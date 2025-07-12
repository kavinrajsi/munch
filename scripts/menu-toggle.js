(function ($) {
  const { $menuToggleBtn, $searchBarContainer, $searchIconBtn, $navListContainer, $headerHoverContainer, $headerNormalContainer } = DOM;

  $menuToggleBtn.on("click", function () {
    if ($searchBarContainer.hasClass("show")) {
      $searchBarContainer.removeClass("show");
      $searchIconBtn.removeClass("hide");
      $headerHoverContainer.removeClass("show");
      $headerNormalContainer.addClass("show");
    }
    $navListContainer.toggleClass("show");
    handlePageOverflowAndOverlay();
  });
})(jQuery);
