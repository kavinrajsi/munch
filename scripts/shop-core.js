(function ($) {
  console.log("Shop JS functions loaded");

  // === DOM Caching ===
  window.DOM = {
    $menuToggleBtn: $("#menu-toggle"),
    $searchToggleBtn: $("#search-toggle"),
    $searchBarContainer: $("#search-bar"),
    $searchCloseBtn: $("#search-close"),
    $searchIconBtn: $("#search-toggle"),
    $navListContainer: $("#header-nav-lists"),
    $headerNormalContainer: $(".header-container.header-normal"),
    $headerHoverContainer: $(".header-container.header-hover"),
    $headerOverlay: $("#header-overlay"),
    $htmlElement: $("html"),
    $bodyElement: $("body"),
  };

  window.handlePageOverflowAndOverlay = function () {
    const { $navListContainer, $searchBarContainer, $htmlElement, $bodyElement, $headerOverlay } = DOM;
    const isMenuOpen = $navListContainer.hasClass("show");
    const isSearchOpen = $searchBarContainer.hasClass("show");

    if (isMenuOpen || isSearchOpen) {
      $htmlElement.css("overflow", "hidden");
      $bodyElement.css("overflow", "hidden");
      $headerOverlay.addClass("show");
    } else {
      $htmlElement.css("overflow", "");
      $bodyElement.css("overflow", "");
      $headerOverlay.removeClass("show");
    }
  };

})(jQuery);
