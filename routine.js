console.log("ROUTINE.JS IS RUNNING!");








const urlParams =
    new URLSearchParams(window.location.search);


const concern =
    urlParams.get("concern");


const title =
    urlParams.get("title");




const routineTitle =
    document.getElementById("routineTitle");


if (title) {

    routineTitle.textContent = title;

} else {

    routineTitle.textContent = "Routine";
}




const routineProducts =
    document.getElementById("routineProducts");




    async function loadroutineProducts() {

        const container =
            document.getElementById(
                "routineProducts"
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
            .ilike("concerns", `%${concern}%`);


  

    if (error) {

        console.error(
            "Error loading routine products:",
            error
        );

        routineProducts.innerHTML = `
            <p>Une erreur est survenue.</p>
        `;

        return;
    }


    console.log(
        "Routine products:",
        data
    );



    if (!data || data.length === 0) {

        routineProducts.innerHTML = `
            <p>
                Aucun produit trouvé pour cette routine.
            </p>
        `;

        return;
    }


   

    routineProducts.innerHTML = "";


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


document.addEventListener(
    "DOMContentLoaded",
    () => {

        
     loadroutineProducts();
    }
);

