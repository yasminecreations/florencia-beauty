

    console.log("APP.JS IS RUNNING!");

const SUPABASE_URL = "https://wcnjkjpqgwpszesjiuzz.supabase.co";
const SUPABASE_KEY = "sb_publishable_w5h0bJZLiL_LGc5V09P6JA_PZwfnpLD";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let products = [];
let bestseller = [];
let selectedProductId = null;
let productSwiper = null;


/* =========================
   LOAD ALL PRODUCTS
========================= */

async function loadProducts() {

    console.log("Trying to load products...");

    const { data, error } = await supabaseClient
        .from("products")
        .select("*");

    if (error) {
        console.error("Error loading products:", error);
        return;
    }

    console.log("Products received:", data);

    products = data || [];

    const averageRatings = await loadAverageRatings();
    const reviewCounts = await loadReviewCounts();

    const container =
        document.getElementById("products-container");

    const container2 =
        document.getElementById("products-container2");

    if (!container) {
        return;
    }


    /* =========================
       FIRST PRODUCT CONTAINER
    ========================= */

    container.innerHTML = "";

    const limit = container.dataset.limit
    ? Number(container.dataset.limit)
    : products.length;

products.slice(0, limit).forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.addEventListener(
            "click",
            () => {
                openProductModal(product);
            }
        );

        card.innerHTML = `
        <img
            src="${product.image}"
            alt="${product.name}"
        >
    
        <div class="product-card-rating">
            <span class="product-rating-number">
                ${
                    averageRatings[product.id]
                        ? averageRatings[product.id].toFixed(1)
                        : "0.0"
                }
            </span>
    
            <span class="product-rating-stars">
                ${
                    averageRatings[product.id]
                        ? "★".repeat(
                            Math.round(averageRatings[product.id])
                        )
                        : "★★★★★"
                }
            </span>
    
            <span class="product-rating-count">
                (${reviewCounts[product.id] || 0}
                ${
                    reviewCounts[product.id] === 1
                        ? "review"
                        : "reviews"
                })
            </span>
        </div>
    
        <h2>${product.name}</h2>
    
        <p>${product.description}</p>
    
        <strong>${product.price} MAD</strong>
    
        ${
            product.old_price !== null &&
            product.old_price !== undefined &&
            product.old_price !== ""
                ? `
                    <strong class="modal-old-price">
                        ${product.old_price} MAD
                    </strong>
                `
                : ""
        }
    `;

        container.appendChild(card);

    });


    /* =========================
       SECOND PRODUCT CONTAINER
    ========================= */

    if (container2) {

        container2.innerHTML = "";

        products.forEach(product => {

            const card =
                document.createElement("div");

            card.className =
                "product-card2";

            card.addEventListener(
                "click",
                () => {
                    openProductModal(product);
                }
            );

            card.innerHTML = `
                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <h2>${product.name}</h2>

                <p>${product.description}</p>

                <strong>${product.price} MAD</strong>

                <div class="product-card-rating">

                    <span class="product-rating-number">
                        ${
                            averageRatings[product.id]
                                ? averageRatings[product.id].toFixed(1)
                                : "0.0"
                        }
                    </span>

                    <span class="product-rating-stars">
                        ${
                            averageRatings[product.id]
                                ? "★".repeat(
                                    Math.round(
                                        averageRatings[product.id]
                                    )
                                )
                                : "★★★★★"
                        }
                    </span>

                    <span class="product-rating-count">
                        (${reviewCounts[product.id] || 0}
                        ${
                            reviewCounts[product.id] === 1
                                ? "review"
                                : "reviews"
                        })
                    </span>

                </div>
            `;

            container2.appendChild(card);

        });

    }


    displaySearchResults(products);

}


/* =========================
   ADD PRODUCT TO CART
========================= */

function addToCart(product, quantity = 1) {

    let cart = JSON.parse(
        localStorage.getItem("cart")
    ) || [];


    /* Make sure quantity is a valid number */

    quantity = Number(quantity);

    if (!quantity || quantity < 1) {
        quantity = 1;
    }

    if (quantity > 99) {
        quantity = 99;
    }


    /* =========================
       CHECK IF PRODUCT EXISTS
    ========================= */

    const existingProduct =
        cart.find(
            item => item.id === product.id
        );


    if (existingProduct) {

        existingProduct.quantity += quantity;

        /* Maximum 99 */

        if (existingProduct.quantity > 99) {
            existingProduct.quantity = 99;
        }

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: quantity

        });

    }


    /* =========================
       SAVE CART
    ========================= */

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    console.log(
        "Cart updated:",
        cart
    );


    /* Update cart sidebar if you have one */

    if (typeof renderCart === "function") {
        renderCart();
    }
    openCart();
    
}
function openCart() {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("cart-overlay");

    console.log("Opening cart now");

    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("active");
    }
}

/* =========================
   LOAD REVIEW COUNTS
========================= */

async function loadReviewCounts() {

    const { data, error } = await supabaseClient
        .from("reviews")
        .select("product_id")
        .eq("status", "approved");

    if (error) {

        console.error(
            "Error loading review counts:",
            error
        );

        return {};
    }

    const counts = {};

    data.forEach(review => {

        const productId =
            review.product_id;

        if (!counts[productId]) {
            counts[productId] = 0;
        }

        counts[productId]++;

    });

    return counts;
}


/* =========================
   LOAD AVERAGE RATINGS
========================= */

async function loadAverageRatings() {

    const { data, error } = await supabaseClient
        .from("reviews")
        .select("product_id, rating")
        .eq("status", "approved");

    if (error) {

        console.error(
            "Error loading average ratings:",
            error
        );

        return {};
    }

    const ratings = {};

    data.forEach(review => {

        const productId =
            review.product_id;

        const rating =
            Number(review.rating);

        if (!ratings[productId]) {

            ratings[productId] = {
                total: 0,
                count: 0
            };

        }

        ratings[productId].total += rating;
        ratings[productId].count++;

    });

    const averages = {};

    Object.keys(ratings).forEach(productId => {

        const total =
            ratings[productId].total;

        const count =
            ratings[productId].count;

        averages[productId] =
            total / count;

    });

    return averages;
}


/* =========================
   LOAD BESTSELLERS
========================= */

async function loadBestsellers() {

    console.log("Trying to load bestsellers...");

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .ilike("status", "%bestseller%");

    if (error) {

        console.error(
            "Error loading bestsellers:",
            error
        );

        return;
    }

    console.log(
        "Bestsellers received:",
        data
    );

    bestseller = data || [];

    const container =
        document.getElementById(
            "bestseller-container"
        );

    if (!container) {
        return;
    }

    const reviewCounts =
        await loadReviewCounts();

    const averageRatings =
        await loadAverageRatings();

    container.innerHTML = "";

    bestseller.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "bestseller-card";


        /* =========================
           CARD CLICK
        ========================= */

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".review-button"
                    )
                ) {
                    return;
                }

                openProductModal(product);

            }
        );


        /* =========================
           CARD HTML
        ========================= */

        card.innerHTML = `
            <div class="bestseller-image-container">

                <img
                    class="bestseller-image"
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>

            <div class="bestseller-info">

                <h2 class="bestseller-title">
                    ${product.name}
                </h2>

                <p class="bestseller-description">
                    ${product.description}
                </p>

                <strong class="bestseller-price">
                    ${product.price} MAD
                </strong>

                ${
                    product.old_price !== null &&
                    product.old_price !== undefined &&
                    product.old_price !== ""
                        ? `
                            <strong class="modal-old-price">
                                ${product.old_price} MAD
                            </strong>
                        `
                        : ""
                }

                <p class="review-count">
                    ${reviewCounts[product.id] || 0}
                    ${
                        reviewCounts[product.id] === 1
                            ? "review"
                            : "reviews"
                    }
                </p>

                <div class="average-rating">

                    <span
                        class="rating-number"
                        style="color: #f3d6dc;"
                    >
                        ${
                            averageRatings[product.id]
                                ? averageRatings[product.id].toFixed(1)
                                : "0.0"
                        }
                    </span>

                    <span
                        class="average-stars"
                        style="color: #f3d6dc;"
                    >
                        ${
                            averageRatings[product.id]
                                ? "★".repeat(
                                    Math.round(
                                        averageRatings[product.id]
                                    )
                                )
                                : "★★★★★"
                        }
                    </span>

                </div>

                <button
                    type="button"
                    class="review-button"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                >
                    Add a review
                </button>

            </div>

            <div
                class="product-reviews"
                id="reviews-${product.id}"
            ></div>
        `;

        container.appendChild(card);

    });


    bestseller.forEach(product => {

        loadApprovedReviews(product.id);

    });

}


/* =========================
   REVIEW SYSTEM
========================= */

function setupReviewSystem() {

    const reviewModal =
        document.getElementById(
            "reviewModal"
        );

    const closeReview =
        document.getElementById(
            "closeReview"
        );

    const reviewProductName =
        document.getElementById(
            "reviewProductName"
        );

    const reviewName =
        document.getElementById(
            "reviewName"
        );

    const reviewRating =
        document.getElementById(
            "reviewRating"
        );

    const reviewText =
        document.getElementById(
            "reviewText"
        );

    const submitReview =
        document.getElementById(
            "submitReview"
        );

    const reviewMessage =
        document.getElementById(
            "reviewMessage"
        );

    const ratingStars =
        document.querySelectorAll(
            ".rating-star"
        );

    const reviewImage =
        document.getElementById(
            "reviewImage"
        );

    const reviewImagePreview =
        document.getElementById(
            "reviewImagePreview"
        );


    if (
        !reviewModal ||
        !closeReview ||
        !reviewProductName ||
        !reviewName ||
        !reviewRating ||
        !reviewText ||
        !submitReview ||
        !reviewMessage ||
        !reviewImage
    ) {

        console.warn(
            "Review HTML elements were not found."
        );

        return;
    }


    /* =========================
       RATING STARS
    ========================= */

    ratingStars.forEach(star => {

        star.addEventListener(
            "click",
            () => {

                const rating =
                    Number(
                        star.dataset.rating
                    );

                reviewRating.value =
                    rating;

                ratingStars.forEach(item => {

                    const itemRating =
                        Number(
                            item.dataset.rating
                        );

                    if (
                        itemRating <= rating
                    ) {

                        item.classList.add(
                            "active"
                        );

                    } else {

                        item.classList.remove(
                            "active"
                        );

                    }

                });

            }
        );

    });


    /* =========================
       REVIEW IMAGE PREVIEW
    ========================= */

    reviewImage.addEventListener(
        "change",
        () => {

            const file =
                reviewImage.files[0];

            if (!file) {

                if (reviewImagePreview) {

                    reviewImagePreview.style.display =
                        "none";

                    reviewImagePreview.src =
                        "";

                }

                return;
            }

            if (reviewImagePreview) {

                reviewImagePreview.src =
                    URL.createObjectURL(file);

                reviewImagePreview.style.display =
                    "block";

            }

        }
    );


    /* =========================
       OPEN REVIEW MODAL
    ========================= */

    document.addEventListener(
        "click",
        event => {

            const reviewButton =
                event.target.closest(
                    ".review-button"
                );

            if (!reviewButton) {
                return;
            }

            selectedProductId =
                reviewButton.dataset.productId;

            const productName =
                reviewButton.dataset.productName;

            console.log(
                "Selected product ID:",
                selectedProductId
            );

            console.log(
                "Selected product:",
                productName
            );

            reviewProductName.textContent =
                productName;

            reviewName.value =
                "";

            reviewText.value =
                "";

            reviewRating.value =
                "0";

            reviewMessage.textContent =
                "";

            ratingStars.forEach(star => {

                star.classList.remove(
                    "active"
                );

            });

            reviewImage.value =
                "";

            if (reviewImagePreview) {

                reviewImagePreview.src =
                    "";

                reviewImagePreview.style.display =
                    "none";

            }

            reviewModal.classList.add(
                "show"
            );

            reviewName.focus();

        }
    );


    /* =========================
       CLOSE REVIEW MODAL
    ========================= */

    closeReview.addEventListener(
        "click",
        () => {

            reviewModal.classList.remove(
                "show"
            );

        }
    );


    reviewModal.addEventListener(
        "click",
        event => {

            if (
                event.target === reviewModal
            ) {

                reviewModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =========================
       SUBMIT REVIEW
    ========================= */

    submitReview.addEventListener(
        "click",
        async () => {

            const name =
                reviewName.value.trim();

            const review =
                reviewText.value.trim();

            const rating =
                Number(
                    reviewRating.value
                );

            if (
                !name ||
                !review ||
                rating === 0
            ) {

                reviewMessage.textContent =
                    "Veuillez entrer tout vos informations";

                return;
            }

            if (!selectedProductId) {

                reviewMessage.textContent =
                    "Produit introuvable.";

                return;
            }

            submitReview.disabled =
                true;

            reviewMessage.textContent =
                "Submitting...";


            /* =========================
               UPLOAD REVIEW IMAGE
            ========================= */

            let imageUrl =
                null;

            const imageFile =
                reviewImage.files[0];

            if (imageFile) {

                if (
                    imageFile.size >
                    5 * 1024 * 1024
                ) {

                    reviewMessage.textContent =
                        "veuillez choisir une taille d'image < 5 MB.";

                    submitReview.disabled =
                        false;

                    return;
                }

                const fileExtension =
                    imageFile.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                const fileName =
                    `${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2)}.${fileExtension}`;

                const filePath =
                    `reviews/${fileName}`;

                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("review-photos")
                        .upload(
                            filePath,
                            imageFile
                        );

                if (uploadError) {

                    console.error(
                        "Erreur d'envoie d'image:",
                        uploadError
                    );

                    reviewMessage.textContent =
                        "La photo n'est pas compatible.";

                    submitReview.disabled =
                        false;

                    return;
                }

                const {
                    data: publicUrlData
                } =
                    supabaseClient
                        .storage
                        .from("review-photos")
                        .getPublicUrl(
                            filePath
                        );

                imageUrl =
                    publicUrlData.publicUrl;

            }


            /* =========================
               INSERT REVIEW
            ========================= */

            const { error } =
                await supabaseClient
                    .from("reviews")
                    .insert([
                        {
                            product_id:
                                Number(
                                    selectedProductId
                                ),

                            name:
                                name,

                            review:
                                review,

                            rating:
                                rating,

                            status:
                                "pending",

                            image_url:
                                imageUrl
                        }
                    ]);

            if (error) {

                console.error(
                    "Review submission error:",
                    error
                );

                reviewMessage.textContent =
                    "Something went wrong. Please try again.";

                submitReview.disabled =
                    false;

                return;
            }

            console.log(
                "Votre Avis est envoyé!"
            );

            reviewMessage.textContent =
                "Merci! Votre Avis Est en Cours de Validation.";

            reviewName.value =
                "";

            reviewText.value =
                "";

            reviewRating.value =
                "0";

            reviewImage.value =
                "";

            if (reviewImagePreview) {

                reviewImagePreview.src =
                    "";

                reviewImagePreview.style.display =
                    "none";

            }

            ratingStars.forEach(star => {

                star.classList.remove(
                    "active"
                );

            });

            submitReview.disabled =
                false;

        }
    );

}


/* =========================
   SEARCH
========================= */

function setupSearch() {

    const searchButton =
        document.getElementById(
            "searchButton"
        );

    const searchWindow =
        document.getElementById(
            "searchWindow"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const searchResults =
        document.getElementById(
            "searchResults"
        );

    const closeSearch =
        document.getElementById(
            "closeSearch"
        );


    if (
        !searchButton ||
        !searchWindow ||
        !searchInput ||
        !searchResults ||
        !closeSearch
    ) {
        console.log("SEARCH BUTTON:", searchButton);
        console.log("SEARCH WINDOW:", searchWindow);
        console.log("SEARCH INPUT:", searchInput);
        console.log("SEARCH RESULTS:", searchResults);
        console.log("CLOSE SEARCH:", closeSearch);
        console.warn(
            "Search HTML elements were not found."
        );

        return;
    }


    searchButton.addEventListener(
        "click",
        () => {
    
            console.log("🔍 SEARCH BUTTON CLICKED!");
    
            searchWindow.classList.add(
                "show"
            );

            searchInput.focus();

            displaySearchResults(
                products
            );

        }
    );


    closeSearch.addEventListener(
        "click",
        () => {

            searchWindow.classList.remove(
                "show"
            );

            searchInput.value =
                "";

            searchResults.innerHTML =
                "";

        }
    );


    searchInput.addEventListener(
        "input",
        () => {

            const searchTerm =
                searchInput.value
                    .toLowerCase()
                    .trim();

            if (searchTerm === "") {

                displaySearchResults(
                    products
                );

                return;
            }

            const filteredProducts =
                products.filter(product => {

                    const name =
                        product.name
                            ?.toLowerCase() || "";

                    const description =
                        product.description
                            ?.toLowerCase() || "";

                    return (
                        name.includes(
                            searchTerm
                        ) ||
                        description.includes(
                            searchTerm
                        )
                    );

                });

            displaySearchResults(
                filteredProducts
            );

        }
    );

}


/* =========================
   DISPLAY SEARCH RESULTS
========================= */

function displaySearchResults(results) {

    const searchResults =
        document.getElementById(
            "searchResults"
        );

    if (!searchResults) {
        return;
    }

    searchResults.innerHTML =
        "";

    if (
        !results ||
        results.length === 0
    ) {

        searchResults.innerHTML = `
            <p class="no-results">
                No products found.
            </p>
        `;

        return;
    }

    results.forEach(product => {

        const result =
            document.createElement(
                "div"
            );

        result.className =
            "search-product";


        result.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="search-product-info">

                <h3>${product.name}</h3>

                <p>${product.price} DH</p>

            </div>
        `;


        /* CLICK SEARCH RESULT */

        result.addEventListener(
            "click",
            () => {

                openProductModal(product);

                const searchWindow =
                    document.getElementById(
                        "searchWindow"
                    );

                if (searchWindow) {

                    searchWindow.classList.remove(
                        "show"
                    );

                }

            }
        );


        searchResults.appendChild(
            result
        );

    });

}


/* =========================
   LOAD APPROVED REVIEWS
========================= */

async function loadApprovedReviews(productId) {

    const container =
        document.getElementById(
            `reviews-${productId}`
        );

    if (!container) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("product_id", productId)
            .eq("status", "approved")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "Error loading reviews:",
            error
        );

        return;
    }

    container.innerHTML =
        "";

    if (
        !data ||
        data.length === 0
    ) {

        return;
    }

    data.forEach(review => {

        const reviewCard =
            document.createElement(
                "div"
            );

        reviewCard.className =
            "review-card";

        const stars =
            "★".repeat(
                Number(review.rating)
            );

        let imageHTML =
            "";

        if (review.image_url) {

            imageHTML = `
                <img
                    src="${review.image_url}"
                    alt="Customer review photo"
                    class="review-photo"
                >
            `;

        }

        reviewCard.innerHTML = `

            <h3>
                ${review.name}
            </h3>

            <div class="review-stars">
                ${stars}
            </div>

            <p>
                ${review.review}
            </p>

            ${imageHTML}

        `;

        container.appendChild(
            reviewCard
        );

    });

}


/* =========================
   LOAD MODAL RATING
========================= */

async function loadModalRating(productId) {

    const modalRating =
        document.getElementById(
            "modalProductRating"
        );

    if (!modalRating) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("reviews")
            .select("rating")
            .eq("product_id", productId)
            .eq("status", "approved");

    if (error) {

        console.error(
            "Error loading modal rating:",
            error
        );

        modalRating.textContent =
            "0.0 ★";

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        modalRating.textContent =
            "No reviews yet";

        return;
    }

    const total =
        data.reduce(
            (sum, review) =>
                sum +
                Number(review.rating),
            0
        );

    const average =
        total / data.length;

    const roundedAverage =
        average.toFixed(1);

    const roundedStars =
        Math.round(average);

    const stars =
        "★".repeat(
            roundedStars
        ) +
        "☆".repeat(
            5 - roundedStars
        );

    modalRating.innerHTML = `
        <span class="modal-rating-number">
            ${roundedAverage}
        </span>

        <span class="modal-rating-stars">
            ${stars}
        </span>

        <span class="modal-rating-count">
            (${data.length}
            ${
                data.length === 1
                    ? "review"
                    : "reviews"
            })
        </span>
    `;

}


/* =========================
   LOAD MODAL REVIEWS
========================= */

async function loadModalReviews(productId) {

    const container =
        document.getElementById(
            "modalReviewsList"
        );

    if (!container) {

        console.error(
            "modalReviewsList was not found."
        );

        return;
    }

    container.innerHTML =
        "Loading reviews...";

    const { data, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("product_id", productId)
            .eq("status", "approved")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "Error loading modal reviews:",
            error
        );

        container.innerHTML =
            "Could not load reviews.";

        return;
    }

    container.innerHTML =
        "";

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            "<p>No reviews yet.</p>";

        return;
    }

    data.forEach(review => {

        const reviewCard =
            document.createElement(
                "div"
            );

        reviewCard.className =
            "modal-review-card";

        const rating =
            Number(review.rating);

        const stars =
            "★".repeat(rating) +
            "☆".repeat(5 - rating);

        let imageHTML =
            "";

        if (review.image_url) {

            imageHTML = `
                <img
                    src="${review.image_url}"
                    alt="Customer review photo"
                    class="modal-review-photo"
                >
            `;
        }

        reviewCard.innerHTML = `
            <h4>${review.name}</h4>

            <div class="modal-review-stars">
                ${stars}
            </div>

            <p>${review.review}</p>

            ${imageHTML}
        `;

        container.appendChild(
            reviewCard
        );

    });
}


/* =========================
   PRODUCT DETAILS MODAL
========================= */

function openProductModal(product) {
     selectedProductId = product.id;
    const modal =
        document.getElementById(
            "productModal"
        );

    const modalName =
        document.getElementById(
            "modalProductName"
        );

    const modalDescription =
        document.getElementById(
            "modalProductDescription"
        );

    const modalCurrentPrice =
        document.getElementById(
            "modalCurrentPrice"
        );

    const modalOldPrice =
        document.getElementById(
            "modalOldPrice"
        );

    const swiperWrapper =
        document.getElementById(
            "productSwiperWrapper"
        );


    if (!modal) {
        return;
    }


    /* =========================
       PRODUCT INFORMATION
    ========================= */

    if (modalName) {

        modalName.textContent =
            product.name || "";

    }


    if (modalDescription) {

        modalDescription.textContent =
            product.description || "";

    }


    /* =========================
       CURRENT PRICE
    ========================= */

    if (modalCurrentPrice) {

        modalCurrentPrice.textContent =
            `${product.price} MAD`;

    }


    /* =========================
       OLD PRICE
    ========================= */

    if (modalOldPrice) {

        if (
            product.old_price !== null &&
            product.old_price !== undefined &&
            product.old_price !== ""
        ) {

            modalOldPrice.textContent =
                `${product.old_price} MAD`;

            modalOldPrice.style.display =
                "inline";

        } else {

            modalOldPrice.textContent =
                "";

            modalOldPrice.style.display =
                "none";

        }

    }


    /* =========================
       PRODUCT IMAGES
    ========================= */

    if (swiperWrapper) {

        swiperWrapper.innerHTML =
            "";

        const images = [
            product.image,
            product.thumbnail_1,
            product.thumbnail_2,
            product.thumbnail_3
        ];


        images.forEach(image => {

            if (!image) {
                return;
            }


            const slide =
                document.createElement(
                    "div"
                );

            slide.className =
                "swiper-slide";


            slide.innerHTML = `
                <img
                    src="${image}"
                    alt="${product.name}"
                >
            `;


            swiperWrapper.appendChild(
                slide
            );

        });

    }


    /* =========================
       OPEN MODAL
    ========================= */

    modal.classList.add(
        "show"
    );


    /* =========================
       START SWIPER
    ========================= */

    if (
        typeof Swiper !== "undefined" &&
        swiperWrapper
    ) {

        if (productSwiper) {

            productSwiper.destroy(
                true,
                true
            );

        }


        productSwiper =
            new Swiper(
                ".product-swiper",
                {

                    loop: true,

                    slidesPerView: 1,

                    spaceBetween: 10,

                    navigation: {

                        nextEl:
                            ".product-swiper .swiper-button-next",

                        prevEl:
                            ".product-swiper .swiper-button-prev"

                    },

                    pagination: {

                        el:
                            ".product-swiper .swiper-pagination",

                        clickable: true

                    }

                }
            );

    }


    /* =========================
       LOAD RATING
    ========================= */

    loadModalRating(
        product.id
    );


    /* =========================
       LOAD REVIEWS
    ========================= */

    loadModalReviews(
        product.id
    );


    /* =========================
       MODAL QUANTITY
    ========================= */

    const modalAddToCart =
        document.getElementById(
            "modalAddToCart"
        );


    if (modalAddToCart) {

        let quantityContainer =
            document.getElementById(
                "modalQuantityContainer"
            );


        /* =========================
           CREATE QUANTITY CONTAINER
        ========================= */

        if (!quantityContainer) {

            quantityContainer =
                document.createElement(
                    "div"
                );

            quantityContainer.id =
                "modalQuantityContainer";


            quantityContainer.innerHTML = `
                <div class="modal-quantity">

                    <label for="modalQuantity">
                        Quantity
                    </label>

                    <div class="quantity-controls">

                        <button
                            type="button"
                            id="quantityMinus"
                        >
                            −
                        </button>

                        <input
                            type="number"
                            id="modalQuantity"
                            value="1"
                            min="1"
                            max="99"
                        >

                        <button
                            type="button"
                            id="quantityPlus"
                        >
                            +
                        </button>

                    </div>

                </div>
            `;


            /* Put quantity BEFORE Add to Cart */

            modalAddToCart.parentNode.insertBefore(
                quantityContainer,
                modalAddToCart
            );

        }


        /* =========================
           GET QUANTITY ELEMENTS
        ========================= */

        const quantityInput =
            document.getElementById(
                "modalQuantity"
            );

        const quantityMinus =
            document.getElementById(
                "quantityMinus"
            );

        const quantityPlus =
            document.getElementById(
                "quantityPlus"
            );


        if (
            quantityInput &&
            quantityMinus &&
            quantityPlus
        ) {


            /* =========================
               RESET QUANTITY
            ========================= */

            quantityInput.value =
                1;


            /* =========================
               MINUS
            ========================= */

            quantityMinus.onclick =
                () => {

                    let quantity =
                        Number(
                            quantityInput.value
                        ) || 1;


                    if (quantity > 1) {

                        quantity--;

                    }


                    quantityInput.value =
                        quantity;

                };


            /* =========================
               PLUS
            ========================= */

            quantityPlus.onclick =
                () => {

                    let quantity =
                        Number(
                            quantityInput.value
                        ) || 1;


                    if (quantity < 99) {

                        quantity++;

                    }


                    quantityInput.value =
                        quantity;

                };


            /* =========================
               ADD TO CART
            ========================= */

            modalAddToCart.onclick =
                () => {

                    let quantity =
                        Number(
                            quantityInput.value
                        );


                    if (
                        !quantity ||
                        quantity < 1
                    ) {

                        quantity = 1;

                    }


                    if (
                        quantity > 99
                    ) {

                        quantity = 99;

                    }


                    quantityInput.value =
                        quantity;


                    /* IMPORTANT:
                       Send selected quantity */

                    addToCart(
                        product,
                        quantity
                    );


                    console.log(
                        `${product.name} added to cart: ${quantity}`
                    );

                };

        }

    }


    /* =========================
       ADD REVIEW BUTTON
    ========================= */

    const modalAddReview =
        document.getElementById(
            "modalAddReview"
        );


    if (modalAddReview) {

        modalAddReview.onclick =
            () => {

                selectedProductId =
                    product.id;


                const reviewModal =
                    document.getElementById(
                        "reviewModal"
                    );


                const reviewProductName =
                    document.getElementById(
                        "reviewProductName"
                    );


                if (reviewProductName) {

                    reviewProductName.textContent =
                        product.name;

                }


                modal.classList.remove(
                    "show"
                );


                if (reviewModal) {

                    reviewModal.classList.add(
                        "show"
                    );

                }

            };

    }

}


/* =========================
   SETUP PRODUCT MODAL
========================= */

function setupProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    const closeButton =
        document.getElementById(
            "closeProductModal"
        );


    if (!modal || !closeButton) {

        console.warn(
            "Product modal elements were not found."
        );

        return;
    }


    /* =========================
       CLOSE BUTTON
    ========================= */

    closeButton.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       CLICK OUTSIDE MODAL
    ========================= */

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================
   LOAD SPECIFIC PRODUCT
========================= */

async function loadProductById(
    productId,
    containerId
) {

    console.log(
        "Loading specific product:",
        productId
    );

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {

        console.error(
            "CONTAINER NOT FOUND:",
            containerId
        );

        return;
    }

    console.log(
        "Container found:",
        container
    );


    /* =========================
       LOAD PRODUCT
    ========================= */

    const {
        data: product,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();


    if (error) {

        console.error(
            "ERROR LOADING PRODUCT:",
            error
        );

        return;
    }


    if (!product) {

        console.error(
            "PRODUCT NOT FOUND"
        );

        return;
    }


    console.log(
        "PRODUCT FOUND:",
        product
    );


    /* =========================
       LOAD RATING
    ========================= */

    const {
        data: reviews,
        error: reviewError
    } =
        await supabaseClient
            .from("reviews")
            .select("rating")
            .eq("product_id", product.id)
            .eq("status", "approved");


    if (reviewError) {

        console.error(
            "ERROR LOADING PRODUCT REVIEWS:",
            reviewError
        );

    }


    let averageRating =
        0;

    let reviewCount =
        0;


    if (
        reviews &&
        reviews.length > 0
    ) {

        reviewCount =
            reviews.length;


        const totalRating =
            reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating
                    ),
                0
            );


        averageRating =
            totalRating /
            reviewCount;

    }


    const roundedRating =
        averageRating.toFixed(1);


    const numberOfStars =
        Math.round(
            averageRating
        );


    const stars =
        averageRating > 0
            ? "★".repeat(
                numberOfStars
            )
            : "☆";


    /* =========================
       CREATE CARD
    ========================= */

    container.innerHTML = `

        <div class="product-card3">

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <h2>
                ${product.name}

                <div
                    class="product-card3-price"
                    style="gap:3px;"
                >

                    <strong>
                        ${product.price} DH
                    </strong>

                    ${
                        product.old_price !== null &&
                        product.old_price !== undefined &&
                        product.old_price !== ""
                            ? `
                                <strong class="modal-old-price">
                                    ${product.old_price} MAD
                                </strong>
                            `
                            : ""
                    }

                </div>


                <div class="product-card3-rating">

                    <span class="product-card3-rating-number">
                        ${
                            averageRating > 0
                                ? roundedRating
                                : "★★★★★"
                        }
                    </span>

                    <span class="product-card3-stars">
                        ${stars}
                    </span>

                </div>

            </h2>

        </div>

    `;


    /* =========================
       PRODUCT CARD 3 CLICK
    ========================= */

    const productCard3 =
        container.querySelector(
            ".product-card3"
        );


    if (productCard3) {

        productCard3.addEventListener(
            "click",
            () => {

                console.log(
                    "Product card 3 clicked:",
                    product.name
                );

                openProductModal(
                    product
                );

            }
        );

    }


container.innerHTML = `

<div class="product-card4">

    <img
        src="${product.image}"
        alt="${product.name}"
    >

    <h2>
        ${product.name}

        <div
            class="product-card4-price"
            style="gap:3px;"
        >

            <strong>
                ${product.price} DH
            </strong>

            ${
                product.old_price !== null &&
                product.old_price !== undefined &&
                product.old_price !== ""
                    ? `
                        <strong style="font-size: 13px;" class="modal-old-price">
                            ${product.old_price} MAD
                        </strong>
                    `
                    : ""
            }

        </div>


        <div class="product-card4-rating">

            <span class="product-card4-rating-number">
                ${
                    averageRating > 0
                        ? roundedRating
                        : "★★★★★"
                }
            </span>

            <span style="display: none;" class="product-card4-stars">
                ${stars}
            </span>

        </div>

    </h2>

</div>

`;


/* =========================
PRODUCT CARD 4 CLICK
========================= */

const productCard4 =
container.querySelector(
    ".product-card4"
);


if (productCard4) {

productCard4.addEventListener(
    "click",
    () => {

        console.log(
            "Product card 4 clicked:",
            product.name
        );

        openProductModal(
            product
        );

    }
);

}
}


/* =========================
   CART SYSTEM
========================= */

function toggleCart() {

    const cartSidebar =
        document.getElementById("cart-sidebar");

    const cartOverlay =
        document.getElementById("cart-overlay");

    if (!cartSidebar || !cartOverlay) {
        console.error("Cart sidebar or overlay not found.");
        return;
    }

    cartSidebar.classList.toggle("open");
    cartOverlay.classList.toggle("active");

    renderCart();
}


/* =========================
   CLOSE CART
========================= */

function closeCart() {

    const cartSidebar =
        document.getElementById("cart-sidebar");

    const cartOverlay =
        document.getElementById("cart-overlay");

    if (!cartSidebar || !cartOverlay) {
        return;
    }

    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("active");

}


/* =========================
   RENDER CART
========================= */

function renderCart() {

    const cartItemsContainer =
        document.querySelector(".cart-items");

    const cartSubtotal =
        document.getElementById("cart-subtotal");

    if (!cartItemsContainer) {
        console.error("Cart items container not found.");
        return;
    }

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    cartItemsContainer.innerHTML = "";

    /* =========================
       EMPTY CART
    ========================= */

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p style="text-align:center;">
                Your bag is empty.
            </p>
        `;

        if (cartSubtotal) {
            cartSubtotal.textContent = "0.00 DH";
        }

        return;
    }


    /* =========================
       DISPLAY PRODUCTS
    ========================= */

    let subtotal = 0;

    cart.forEach((item, index) => {

        const quantity =
            Number(item.quantity) || 1;

        const price =
            Number(item.price) || 0;

        subtotal += price * quantity;


        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
                width="70"
                height="70"
            >

            <div class="cart-item-details">

                <p>
                    <strong>${item.name}</strong>
                </p>

                <p>
                    ${price} DH × ${quantity}
                </p>

                <p>
                    ${(
                        price * quantity
                    ).toFixed(2)} DH
                </p>

                <button
                    class="remove-item"
                    data-index="${index}"
                >
                    Remove
                </button>

            </div>

        `;

        cartItemsContainer.appendChild(cartItem);

    });


    /* =========================
       UPDATE SUBTOTAL
    ========================= */

    if (cartSubtotal) {

        cartSubtotal.textContent =
            `${subtotal.toFixed(2)} DH`;

    }


    /* =========================
       REMOVE BUTTONS
    ========================= */

    const removeButtons =
        cartItemsContainer.querySelectorAll(
            ".remove-item"
        );

    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.index
                    );

                cart.splice(index, 1);

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );

                renderCart();

            }
        );

    });

}


/* =========================
   CART OVERLAY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const cartOverlay =
            document.getElementById(
                "cart-overlay"
            );

        if (cartOverlay) {

            cartOverlay.addEventListener(
                "click",
                closeCart
            );

        }

        /* Show saved cart when page loads */

        renderCart();

    }
);


/* =========================
   CHECKOUT
========================= */

function goToCheckout() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    if (cart.length === 0) {

        alert("Your bag is empty.");

        return; 
    }

    console.log(
        "Proceeding to checkout:",
        cart
    );

    /* Change this to your checkout page */

    window.location.href =
        "checkout.html";

}
/* =========================
   BUY NOW
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const buyNowButton = document.getElementById("modalBuyNow");

    if (!buyNowButton) {
        console.error("Buy Now button not found.");
        return;
    }

    buyNowButton.addEventListener("click", () => {

        // Find the product currently open in the modal
        const product = products.find(
            p => String(p.id) === String(selectedProductId)
        );

        if (!product) {
            console.error("Could not find the selected product.");
            alert("Something went wrong. Please try again.");
            return;
        }

        /* =========================
           CREATE BUY NOW CART
        ========================= */



        const buyNowItem = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image_url || product.image || "",
            quantity: 1
        };

        /* =========================
           SAVE TO LOCAL STORAGE
        ========================= */

        localStorage.setItem(
            "cart",
            JSON.stringify([buyNowItem])
        );

        console.log("Buy Now product:", buyNowItem);

        /* =========================
           GO TO CHECKOUT
        ========================= */

        window.location.href = "checkout.html";

    });

});

/* =========================
   PAGE START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupReviewSystem();

        setupSearch();

        setupProductModal();

        loadProducts();

        loadBestsellers();

        loadProductById(
            4,
            "product4-container"
        );
        loadProductById(
            5,
            "product5-container"
        );
    }
);