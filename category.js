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


    /*
       For now, we're testing Hair Care.
       Later we'll make this dynamic.
    */

   


    if (title) {
        title.textContent = selectedCategory;
    }
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    
    console.log("Category:", category);
    
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("category", category);

    if (error) {

        console.error(
            "Error loading brands:",
            error
        );

        return;
    }


    console.log(
        "Hair Care products:",
        data
    );


    /*
       Get unique brands
    */

    const brands = [
        ...new Set(
            data
                .map(product => product.Brand)
                .filter(Boolean)
        )
    ];


    console.log(
        "Brands found:",
        brands
    );


    container.innerHTML = "";


    brands.forEach(brand => {

        const brandCard =
            document.createElement("div");
    
        brandCard.className =
            "brand-card";
    
        brandCard.textContent =
            brand;
    
    
            brandCard.addEventListener(
                "click",
                () => {
            
                    const url =
                        `products.html?category=${encodeURIComponent(selectedCategory)}&brand=${encodeURIComponent(brand)}`;
            
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