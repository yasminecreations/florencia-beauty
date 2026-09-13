console.log("CATEGORY.JS IS RUNNING!");
const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");

console.log("Selected category:", selectedCategory);

async function loadBrands() {

    const container =
        document.getElementById("brand-container");

    const title =
        document.getElementById("category-title");

    if (!container) {
        return;
    }


    if (title) {
        title.textContent = selectedCategory;
    }


    const params =
        new URLSearchParams(window.location.search);

    const category =
        params.get("category");


    console.log("Category:", category);


    // --------------------------------
    // 1. GET PRODUCTS IN THIS CATEGORY
    // --------------------------------

    const { data: products, error: productsError } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("category", category);


    if (productsError) {

        console.error(
            "Error loading products:",
            productsError
        );

        return;
    }


    console.log(
        "Category products:",
        products
    );


    // --------------------------------
    // 2. GET ALL BRANDS
    // --------------------------------

    const { data: allBrands, error: brandsError } =
        await supabaseClient
            .from("brands")
            .select("*");


    if (brandsError) {

        console.error(
            "Error loading brands:",
            brandsError
        );

        return;
    }


    console.log("ALL BRANDS EXACTLY:");
    console.table(allBrands);


    // --------------------------------
    // 3. GET UNIQUE BRANDS USED
    //    IN THIS CATEGORY
    // --------------------------------

    const brandnames = [
        ...new Set(
            products
                .map(product => product.Brand)
                .filter(Boolean)
        )
    ];


    console.log(
        "Brands in category:",
        brandnames
    );


    // --------------------------------
    // 4. MATCH PRODUCT BRAND
    //    WITH BRANDS TABLE
    // --------------------------------

    const brands = brandnames
        .map(brandname => {

            const foundBrand =
                allBrands.find(
                    brand =>
                        brand.name &&
                        brand.name.toLowerCase() ===
                        brandname.toLowerCase()
                );


            if (!foundBrand) {

                console.warn(
                    "Brand not found in Brands table:",
                    brandname
                );

                return null;
            }


            return {
                name: foundBrand.name,
                logo: foundBrand.logo
            };

        })
        .filter(Boolean);


    console.log(
        "Matched brands:",
        brands
    );


    // --------------------------------
    // 5. CLEAR OLD BRAND CARDS
    // --------------------------------

    container.innerHTML = "";


    // --------------------------------
    // 6. CREATE BRAND CARDS
    // --------------------------------

    brands.forEach(brand => {

        const brandCard =
            document.createElement("div");

        brandCard.className =
            "brand-card";


        // Brand logo

        if (brand.logo) {

            const logo =
                document.createElement("img");

            logo.src =
                brand.logo;

            logo.alt =
                brand.name + " logo";

            logo.className =
                "brand-logo";

            brandCard.appendChild(
                logo
            );

        } else {

            // Fallback if logo is missing

            brandCard.textContent =
                brand.name;

        }


        // --------------------------------
        // CLICK BRAND
        // --------------------------------

        brandCard.addEventListener(
            "click",
            () => {

                const url =
                    `products.html?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand.name)}`;

                window.location.href =
                    url;

            }
        );


        container.appendChild(
            brandCard
        );

    });

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBrands();

    }
);