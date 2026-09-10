console.log("FILTERED PRODUCTS JS IS RUNNING!");




/* =========================
   GET CATEGORY + BRAND
========================= */

const params =
    new URLSearchParams(window.location.search);

const selectedCategory =
    params.get("category");

const selectedBrand =
    params.get("brand");


console.log("Category:", selectedCategory);
console.log("Brand:", selectedBrand);


/* =========================
   LOAD PRODUCTS
========================= */

async function loadFilteredProducts() {

    const container =
        document.getElementById(
            "filtered-products-container"
        );

    if (!container) {

        console.error(
            "Product container not found!"
        );

        return;
    }


    console.log(
        "Loading products..."
    );


    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("category", selectedCategory)
            .eq("Brand", selectedBrand);


    if (error) {

        console.error(
            "Error loading products:",
            error
        );

        return;
    }


    console.log(
        "Filtered products:",
        data
    );


    container.innerHTML = "";


    /* =========================
       NO PRODUCTS
    ========================= */

    if (!data || data.length === 0) {

        container.innerHTML = `
            <p>
                No products found.
            </p>
        `;

        return;
    }


    /* =========================
       CREATE PRODUCT CARDS
    ========================= */

    data.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";


        card.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <h2>
                ${product.name}
            </h2>

            <p>
                ${product.description || ""}
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
        card.addEventListener("click", () => {
            openProductModal(product);
        });

        container.appendChild(
            card
        );

    });

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFilteredProducts();

    }
);