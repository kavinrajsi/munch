(function ($) {
  console.log("functions");

   $('.slick-slider').slick();


  // // product variant
  // $('.product-variant-fielset input[type="radio"]').click(function () {
  //   var productVariant = "";
  //   var optionSelect = $(this).attr("id"); // radio button for and id
  //   var optionSelectVal = $(this).val(); // check me
  //   $("#productSelect option").each(function () {
  //     dataCircleValue = $(this).val(); // get product value id
  //     dataCircle = $(this).attr("data-circle"); // get product label name to match with radio for and id
  //     dataVariantCurrency = $(this).attr("data-variantcurrency"); // get currency code
  //     dataVariantPrice = $(this).attr("data-VariantPrice"); // get price

  //     // console.log('dataCircleValue: ' + dataCircleValue);

  //     console.log("dataCircle: " + dataCircle);
  //     console.log("optionSelect: " + optionSelect);

  //     if (dataCircle == optionSelect) {
  //       $(".jselecteValue").val(dataCircleValue); // pass product id to cart input
  //       $(".product-price").html(
  //         '<span><span class="money" data-currency-' +
  //           dataVariantCurrency +
  //           '="' +
  //           dataVariantCurrency +
  //           " " +
  //           dataVariantPrice +
  //           '">' +
  //           dataVariantCurrency +
  //           " " +
  //           dataVariantPrice +
  //           "</span></span>"
  //       );
  //       var cart_sizelist = [];
  //       var productSelectID = parseInt($(".jselecteValue").val());
  //       var cartContents = fetch(window.Shopify.routes.root + "cart.js")
  //         .then((response) => response.json())
  //         .then((data) => {
  //           $.each(data.items, function (index, cartItem) {
  //             cart_sizelist.push(cartItem.variant_id);
  //           });
  //           if (jQuery.inArray(productSelectID, cart_sizelist) != -1) {
  //             console.log("is in array");
  //             $(".product-form__submit").hide();
  //             $(".product-form__viewcart").show();
  //           } else {
  //             console.log("is NOT in array");
  //             $(".product-form__submit").show();
  //             $(".product-form__viewcart").hide();
  //           }
  //           // verification data
  //           console.log(data.items);
  //           console.log($.inArray(productSelectID, cart_sizelist));
  //           console.log(productSelectID);
  //           console.log(cart_sizelist);
  //         });
  //     }
  //   });
  // });

  // // add to cart ajax
  // $(".product-form__buttons .product-form__submit")
  //   .unbind()
  //   .click(function (e) {
  //     e.preventDefault();
  //     let dataItem = $(".jselecteValue").val();

  //     let formData = {
  //       items: [
  //         {
  //           id: dataItem,
  //           quantity: 1,
  //         },
  //       ],
  //     };

  //     fetch(window.Shopify.routes.root + "cart/add.js", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     })
  //       // let addToCartform = jQuery.post(window.Shopify.routes.root + 'cart/add.js', $('form[action$="/cart/add"]').serialize());
  //       // console.log('addToCartform:: ' + JSON.stringify(addToCartform));

  //       // let addToCartForm = document.querySelector('form[action$="/cart/add"]');
  //       // let formData = new FormData(addToCartForm);
  //       // console.log(formData);
  //       // fetch(window.Shopify.routes.root + "cart/add.js", {
  //       //   method: "POST",
  //       //   body: formData,
  //       // })
  //       .then((response) => {
  //         $(".product-form__submit").hide();
  //         $(".product-form__viewcart").show();
  //         return response.json();
  //       })
  //       .then((data) => {
  //         update_cart();
  //         let cartData = JSON.stringify(data);
  //         let pushmyObj = JSON.parse(cartData);
  //         // let pushDataItem = pushmyObj.items[0];
  //         // var cart_list = [];
  //         // cart_list.push(
  //         //   '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">' +
  //         //     '<div class="toast-body" >' +
  //         //     '<img src="' +
  //         //     pushDataItem.featured_image.url +
  //         //     '&width=48" alt="' +
  //         //     pushDataItem.featured_image.alt +
  //         //     '" width="48" height="64">' +
  //         //     "<div>" +
  //         //     "<p>" +
  //         //     pushDataItem.title +
  //         //     " is added to bag  </p>" +
  //         //     "</div>" +
  //         //     "</div>" +
  //         //     "</div>"
  //         // );
  //         // $(".productToaster")
  //         //   .html(cart_list.join(""))
  //         //   .delay(2000)
  //         //   .fadeOut("slow");
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  //   });
  // document.addEventListener("DOMContentLoaded", function () {
  //   update_cart();
  // });

  // function update_cart() {
  //   var cartContents = fetch(window.Shopify.routes.root + "cart.js")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data.item_count);
  //       $(".header-cart .cart-count span").html(data.item_count);
  //       return data;
  //     });
  // }

  //Functions, Plugins, Etc.. Here
  //(does not wait for DOM READY STATE)
})(jQuery);
