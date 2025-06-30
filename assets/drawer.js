// Drawer open/close logic
var drawer = function () {
  if (!Element.prototype.closest) {
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
    }
    Element.prototype.closest = function (s) {
      var el = this;
      var ancestor = this;
      if (!document.documentElement.contains(el)) return null;
      do {
        if (ancestor.matches(s)) return ancestor;
        ancestor = ancestor.parentElement;
      } while (ancestor !== null);
      return null;
    };
  }

  var settings = {
    speedOpen: 50,
    speedClose: 350,
    activeClass: "is-active",
    visibleClass: "is-visible",
    selectorTarget: "[data-drawer-target]",
    selectorTrigger: "[data-drawer-trigger]",
    selectorClose: "[data-drawer-close]",
  };

  var toggleAccessibility = function (event) {
    event.setAttribute(
      "aria-expanded",
      event.getAttribute("aria-expanded") === "true" ? "false" : "true"
    );
  };

  var openDrawer = function (trigger) {
    var target = document.getElementById(trigger.getAttribute("aria-controls"));
    target.classList.add(settings.activeClass);
    document.documentElement.style.overflow = "hidden";
    toggleAccessibility(trigger);

    setTimeout(function () {
      target.classList.add(settings.visibleClass);
    }, settings.speedOpen);
  };

  var closeDrawer = function (event) {
    var closestParent = event.closest(settings.selectorTarget);
    var childrenTrigger = document.querySelector(
      '[aria-controls="' + closestParent.id + '"]'
    );

    closestParent.classList.remove(settings.visibleClass);
    document.documentElement.style.overflow = "";
    toggleAccessibility(childrenTrigger);

    setTimeout(function () {
      closestParent.classList.remove(settings.activeClass);
    }, settings.speedClose);
  };

  var clickHandler = function (event) {
    var toggle = event.target;
    var open = toggle.closest(settings.selectorTrigger);
    var close = toggle.closest(settings.selectorClose);

    if (open) {
      openDrawer(open);

      fetch("/cart.js")
        .then((resp) => resp.json())
        .then((data) => {
          let drawerHTML = "";

          if (data.items.length > 0) {
            $(".cart-item-no").attr("hidden", true);

            data.items.forEach(function (product, index) {
              drawerHTML += `
                <div class="cart__item cartpopup-item" data-line="${index + 1}" data-variant-id="${product.variant_id}">
                  <div class="card__item-image">
                    <img src="${product.featured_image.url}&width=95&height=100&format=webp" width="95" height="100" alt="${product.featured_image.alt}">
                  </div>
                  <div class="card__item-content">
                    <h5 class="card__item--title">${product.title}</h5>
                    <p class="card__item--price productPrice">
                      <span class="money">${Shopify.formatMoney(product.price)}</span>
                    </p>
                    <div class="cart-item__qtyWrapper">
                    <div class="cart-item__qty">
                      <button type="button" class="qty-btn qty-decrease" data-line="${index + 1}">−</button>
                      <input type="text" class="cart-qty-input" value="${product.quantity}" min="1" data-line="${index + 1}">
                      <button type="button" class="qty-btn qty-increase" data-line="${index + 1}">+</button>
                    </div>
                    <p class="delete">
                      <a class="remove removeCta" data-line="${index + 1}" href="#">
                        Remove
                      </a>
                    </p>
                    </div>
                  </div>
                </div>`;
            });

            $("#cart__drawer_items").html(drawerHTML);

            // Initialize minus button state
            $('.cart-qty-input').each(function () {
              const qty = parseInt($(this).val());
              if (qty <= 1) {
                $(this).siblings('.qty-decrease').addClass('qty-disabled');
              }
            });
          }

          $("#cart__total_price").html(
            `<span class="money">${Shopify.formatMoney(data.original_total_price)}</span>`
          );
        });
    }

    if (close) {
      closeDrawer(close);
    }

    if (open || close) {
      event.preventDefault();
    }
  };

  var keydownHandler = function (event) {
    if (event.key === "Escape" || event.keyCode === 27) {
      var drawers = document.querySelectorAll(settings.selectorTarget);
      for (let i = 0; i < drawers.length; ++i) {
        if (drawers[i].classList.contains(settings.activeClass)) {
          closeDrawer(drawers[i]);
        }
      }
    }
  };

  document.addEventListener("click", clickHandler, false);
  document.addEventListener("keydown", keydownHandler, false);
};

drawer();

// REMOVE ITEM
$(document).on('click', '.cartpopup-body .remove', function (e) {
  e.preventDefault();
  const $item = $(this).closest('.cartpopup-item');
  const line = parseInt($(this).data('line'));

  $item.remove();

  $.ajax({
    type: 'POST',
    url: '/cart/change.js',
    dataType: 'json',
    data: {
      line: line,
      quantity: 0
    },
    success: function (cart) {
      $('.cart-count, .cart-item-count').text(cart.item_count);
      $('#cart__total_price').html(
        `<span class="money">${(cart.total_price / 100).toFixed(2)}</span>`
      );
      if (cart.item_count === 0) {
        $('.cart-item-no').removeAttr('hidden');
        $('.cart-count').attr('hidden', true);
      }
    },
    error: function () {
      alert('Error removing item. Please refresh.');
    }
  });
});

// QTY UPDATE (buttons)
$(document).on('click', '.cart__item .qty-btn', function () {
  const $btn = $(this);
  const $input = $btn.siblings('.cart-qty-input');
  const line = parseInt($btn.data('line'));
  let qty = parseInt($input.val());

  if ($btn.hasClass('qty-increase')) {
    qty += 1;
  } else if ($btn.hasClass('qty-decrease') && qty > 1) {
    qty -= 1;
  }

  $input.val(qty);

  // Toggle minus button state
  const $decreaseBtn = $btn.parent().find('.qty-decrease');
  if (qty <= 1) {
    $decreaseBtn.addClass('qty-disabled');
  } else {
    $decreaseBtn.removeClass('qty-disabled');
  }

  $.ajax({
    type: 'POST',
    url: '/cart/change.js',
    dataType: 'json',
    data: {
      line: line,
      quantity: qty
    },
    success: function (cart) {
      $('#cart__total_price').html(
        `<span class="money">${(cart.total_price / 100).toFixed(2)}</span>`
      );
      $('.cart-count, .cart-item-count').text(cart.item_count);
    },
    error: function () {
      alert('Failed to update quantity. Please refresh.');
    }
  });
});

var openDrawer = function (trigger) {
  var target = document.getElementById(trigger.getAttribute("aria-controls"));
  target.classList.add(settings.activeClass);
  document.documentElement.style.overflow = "hidden";
  toggleAccessibility(trigger);

  setTimeout(function () {
    target.classList.add(settings.visibleClass);
  }, settings.speedOpen);

  fetch("/cart.js")
    .then((resp) => resp.json())
    .then((data) => {
      let drawerHTML = "";

      if (data.items.length > 0) {
        $(".cart-item-no").attr("hidden", true);

        data.items.forEach(function (product, index) {
          drawerHTML += `
            <div class="cart__item cartpopup-item" data-line="${index + 1}" data-variant-id="${product.variant_id}">
              <div class="card__item-image">
               <img src="${product.featured_image.url}&width=95&height=100&format=webp" width="95" height="100" alt="${product.featured_image.alt}">
              </div>
              <div class="card__item-content">
                <h5 class="card__item--title">${product.title}</h5>
                <p class="card__item--price productPrice">
                  <span class="money">${Shopify.formatMoney(product.price)}</span>
                </p>
                <div class="cart-item__qtyWrapper">
                <div class="cart-item__qty">
                  <button type="button" class="qty-btn qty-decrease" data-line="${index + 1}">−</button>
                  <input type="number" class="cart-qty-input" value="${product.quantity}" min="1" data-line="${index + 1}">
                  <button type="button" class="qty-btn qty-increase" data-line="${index + 1}">+</button>
                </div>
                <p class="delete">
                  <a class="remove removeCta" data-line="${index + 1}" href="#">
                  Remove
                  </a>
                </p>
              </div>
              </div>
            </div>`;
        });

        $("#cart__drawer_items").html(drawerHTML);

        // Initialize minus button state
        $('.cart-qty-input').each(function () {
          const qty = parseInt($(this).val());
          if (qty <= 1) {
            $(this).siblings('.qty-decrease').addClass('qty-disabled');
          }
        });

        // Call related product logic using the first product's ID
        loadRelatedProducts(data.items[0].product_id);
      }

      $("#cart__total_price").html(
        `<span class="money">${Shopify.formatMoney(data.original_total_price)}</span>`
      );
    });
};
