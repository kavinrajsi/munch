const modal = document.getElementById("productInfoModal");
const closeBtn = modal.querySelector(".btn-close");

document.getElementById("productInfoAnchor").addEventListener("click", function (e) {
  e.preventDefault(); // prevent default anchor behavior

  const productHandle = this.dataset.productHandle;
  const productUrl = `/products/${productHandle}.js`;

  fetch(productUrl)
    .then((resp) => resp.json())
    .then(function (data) {
      console.log(data);

      let ImagesMe = data.images;
      let dataContentType = `
        <div class="col-12 col-md-6" style="flex:1; min-width: 280px;">
          <div class="single-item" style="display:flex; flex-direction: column; gap:10px;">`;

      for (const face of ImagesMe) {
        const imgSrc = face.startsWith("http") ? face : "https:" + face;
        dataContentType += `<div><img width="240" height="240" src="${imgSrc}" alt="${data.title}" style="max-width: 100%; border-radius: 8px;"></div>`;
      }

      dataContentType += `</div></div><div class="col-12 col-md-6" style="flex:1; min-width: 280px;">
        <div class="modalDescription" style="font-family: Arial, sans-serif; line-height: 1.4;">
          <p class="modalDescription-Title" style="font-weight: bold; font-size: 1.5em; margin-bottom: 8px;">${data.title}</p>
          <p class="modalDescription-Vendor" style="margin-bottom: 12px;"><strong>Vendor:</strong> ${data.vendor}</p>
          <div class="modalDescription-Description" style="margin-bottom: 12px;">${data.description}</div>`;

      // Variants list
      dataContentType += `<form id="variantForm" style="margin-bottom: 15px;"><p><strong>Variants:</strong></p>`;

      data.variants.forEach((variant, index) => {
        const variantPrice = Shopify.formatMoney(variant.price);
        const checked = index === 0 ? "checked" : "";
        dataContentType += `
          <label style="display:block; margin-bottom: 6px; cursor: pointer;">
            <input type="radio" name="variant" value="${variant.id}" data-price="${variant.price}" ${checked} style="margin-right: 8px;">
            ${variant.title} - INR ${variantPrice}
          </label>
        `;
      });

      dataContentType += `</form>`;

      // Buttons
      dataContentType += `
        <button id="addToCartBtn" style="padding: 10px 16px; margin-right: 10px; cursor: pointer;">Add to Cart</button>
        <button id="buyNowBtn" style="padding: 10px 16px; cursor: pointer;">Buy Now</button>
      </div></div>`;

      document.getElementById("productInfoModalContent").innerHTML = dataContentType;

      // Show modal and prevent background scroll
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Add button listeners
      const addToCartBtn = document.getElementById("addToCartBtn");
      const buyNowBtn = document.getElementById("buyNowBtn");

      addToCartBtn.addEventListener("click", () => {
        const selectedVariantId = document.querySelector('input[name="variant"]:checked').value;
        addToCart(selectedVariantId, 1);
      });

      buyNowBtn.addEventListener("click", () => {
        const selectedVariantId = document.querySelector('input[name="variant"]:checked').value;
        buyNow(selectedVariantId, 1);
      });
    })
    .catch(function (error) {
      console.error("Error fetching product data:", error);
      showToast("Failed to load product details. Please try again.", false);
    });
});

// Close modal when clicking close button
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.style.overflow = ""; // restore scroll
});

// Close modal if clicking outside modal content
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Add to cart using Shopify AJAX API
function addToCart(variantId, quantity) {
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: variantId,
      quantity: quantity,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      showToast("Added to cart!", true);
      console.log("Cart updated:", data);
    })
    .catch((error) => {
      showToast("Failed to add to cart.", false);
      console.error("Error:", error);
    });
}

// Buy now - redirect to checkout with selected variant and quantity
function buyNow(variantId, quantity) {
  const checkoutUrl = `/cart/${variantId}:${quantity}`;
  window.location.href = checkoutUrl;
}

// Toast notification helper
function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.backgroundColor = isSuccess ? "#4BB543" : "#e74c3c"; // green or red
  toast.style.visibility = "visible";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.visibility = "hidden";
    }, 500);
  }, 3000); // visible for 3 seconds
}
