document.addEventListener("DOMContentLoaded", async () => {

    const brandCardsContainer = document.getElementById("brand-cards");

    if (!brandCardsContainer) return;

    // Get all brands from Supabase
    const { data: brands, error } = await supabaseClient
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error loading brands:", error);
        brandCardsContainer.innerHTML = "<p>Impossible de charger les marques.</p>";
        return;
    }

    if (!brands || brands.length === 0) {
        brandCardsContainer.innerHTML = "<p>Aucune marque disponible.</p>";
        return;
    }

    // Create a card for every brand
    brands.forEach(brand => {

        const card = document.createElement("div");
        card.className = "brand-card";

        card.innerHTML = `
            <div class="brand-logo-container">
                <img
                    src="${brand.logo}"
                    
                    class="brand-logo"
                >
            </div>

           
        `;

        // When the brand is clicked
        card.addEventListener("click", () => {
            showBrandProducts(brand.name);
        });

        brandCardsContainer.appendChild(card);
    });

});
async function showBrandProducts(brandName) {

    const section =
        document.getElementById("selected-brand-section");

    const title =
        document.getElementById("selected-brand-name");

    const container =
        document.getElementById("brand-products-container");

    const brandsContainer =
        document.getElementById("brand-cards");

    if (!section || !title || !container) return;


    // Hide the brand cards
    if (brandsContainer) {
        brandsContainer.style.display = "none";
    }


    // Show selected brand section
    section.style.display = "block";

    title.textContent = brandName;


    // Make sure products are available
    if (!products || products.length === 0) {

        container.innerHTML =
            "<p>Chargement des produits...</p>";

        return;
    }


    // Find products belonging to this brand
    const brandProducts = products.filter(product =>
        product.Brand &&
        product.Brand.trim().toLowerCase() ===
        brandName.trim().toLowerCase()
    );


    if (brandProducts.length === 0) {

        container.innerHTML = `
            <p>Aucun produit disponible pour ${brandName}.</p>
        `;

        return;
    }


    // Get approved reviews
    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("product_id, rating")
        .eq("status", "approved");


    if (error) {

        console.error(
            "Error loading reviews:",
            error
        );
    }


    // Calculate ratings for the brand products
    const brandRatings = {};
    const brandReviewCounts = {};


    if (reviews) {

        reviews.forEach(review => {

            const productId = review.product_id;
            const rating = Number(review.rating);

            if (!brandRatings[productId]) {

                brandRatings[productId] = {
                    total: 0,
                    count: 0
                };

            }

            brandRatings[productId].total += rating;
            brandRatings[productId].count++;

        });


        Object.keys(brandRatings).forEach(productId => {

            const total =
                brandRatings[productId].total;

            const count =
                brandRatings[productId].count;

            brandRatings[productId] =
                total / count;

            brandReviewCounts[productId] = count;

        });

    }


    // Clear previous products
    container.innerHTML = "";


    // Create cards
    brandProducts.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";


        // Same product modal
        card.addEventListener(
            "click",
            () => {
                openProductModal(product);
            }
        );


        // SAME structure as your normal product cards
        card.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >


            <div class="product-card-rating">

                <span class="product-rating-number">
                    ${
                        brandRatings[product.id]
                            ? brandRatings[product.id].toFixed(1)
                            : "0.0"
                    }
                </span>


                <span class="product-rating-stars">
                    ${
                        brandRatings[product.id]
                            ? "★".repeat(
                                Math.round(
                                    brandRatings[product.id]
                                )
                            )
                            : "★★★★★"
                    }
                </span>


                <span class="product-rating-count">
                    (${brandReviewCounts[product.id] || 0}
                    ${
                        brandReviewCounts[product.id] === 1
                            ? "review"
                            : "reviews"
                    })
                </span>

            </div>


            <h2>
                ${product.name}
            </h2>


            <p>
                ${product.description}
            </p>


            <strong>
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

        `;


        container.appendChild(card);

    });


    // Scroll to selected brand
    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}
document.addEventListener("DOMContentLoaded", () => {

    const backButton =
        document.getElementById("brand-back-button");

    if (!backButton) return;


    backButton.addEventListener("click", () => {

        const section =
            document.getElementById("selected-brand-section");

        const brandsContainer =
            document.getElementById("brand-cards");


        // Hide selected brand
        if (section) {
            section.style.display = "none";
        }


        // Show all brands again
        if (brandsContainer) {
            brandsContainer.style.display = "grid";
        }


        // Return to the brands area
        if (brandsContainer) {
            brandsContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

});