console.log("ROUTINE.JS IS RUNNING!");




const SUPABASE_URL =
    "https://wcnjkjpqgwpszesjiuzz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_w5h0bJZLiL_LGc5V09P6JA_PZwfnpLD";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );




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




async function loadRoutineProducts() {

    console.log("Looking for concern:", concern);


    if (!concern) {

        routineProducts.innerHTML = `
            <p>Aucune catégorie sélectionnée.</p>
        `;

        return;
    }


  

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
                ${product.description}
            </p>

            <strong>
                ${product.price} MAD
            </strong>

        `;


        routineProducts.appendChild(card);

    });
}




loadRoutineProducts();