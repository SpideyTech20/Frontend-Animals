<<<<<<< HEAD
// script.js

const API_URL = "http://localhost:5000";

// Get the token from localStorage (saved during login)
const token = localStorage.getItem("accessToken");

// If there's no token, redirect back to login (safety check)
if (!token) {
    window.location.href = "login.html";
}

// DOM Elements
const form = document.getElementById("animalForm");
const nameInput = document.getElementById("name");
const legsInput = document.getElementById("numLegs");
const animalIdInput = document.getElementById("animalId");
const tableBody = document.getElementById("animalTable");

// --- 1. FETCH AND DISPLAY ALL ANIMALS ---
async function fetchAnimals() {
    try {
        const response = await fetch(`${API_URL}/animals`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = "login.html";
            }
            throw new Error("Failed to fetch animals");
        }

        const animals = await response.json();
        renderAnimals(animals);

    } catch (error) {
        console.error("Error fetching animals:", error);
        alert("Could not load animals. Check console for details.");
    }
}

// --- 2. RENDER ANIMALS TO THE TABLE ---
function renderAnimals(animals) {
    // Clear the table body
    tableBody.innerHTML = "";

    if (animals.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No animals found. Add one above!</td></tr>`;
        return;
    }

    animals.forEach(animal => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${animal.id}</td>
            <td>${animal.name}</td>
            <td>${animal.num_legs}</td>
            <td>
                <button onclick="editAnimal(${animal.id})">Edit</button>
                <button onclick="deleteAnimal(${animal.id})"> Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// --- 3. ADD OR UPDATE AN ANIMAL (Form Submit) ---
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const numLegs = parseInt(legsInput.value);
    const id = animalIdInput.value;

    if (!name || isNaN(numLegs)) {
        alert("Please enter a valid name and number of legs.");
        return;
    }

    // Determine if we are creating or updating
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/animals/${id}` : `${API_URL}/animals`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, num_legs: numLegs })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || "Something went wrong"}`);
            return;
        }

        // Reset the form (clear hidden ID and inputs)
        form.reset();
        animalIdInput.value = "";

        // Refresh the animal list
        await fetchAnimals();

    } catch (error) {
        console.error("Error saving animal:", error);
        alert("Could not save animal. Check console.");
    }
});

// --- 4. DELETE AN ANIMAL ---
window.deleteAnimal = async function(id) {
    if (!confirm("Are you sure you want to delete this animal?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/animals/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert("Failed to delete animal");
            return;
        }

        // Refresh the list
        await fetchAnimals();

    } catch (error) {
        console.error("Error deleting animal:", error);
        alert("Could not delete animal.");
    }
};

// --- 5. EDIT AN ANIMAL (Populate the form) ---
window.editAnimal = async function(id) {
    try {
        const response = await fetch(`${API_URL}/animals/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert("Could not fetch animal details");
            return;
        }

        const animal = await response.json();

        // Fill the form with the animal's data
        nameInput.value = animal.name;
        legsInput.value = animal.num_legs;
        animalIdInput.value = animal.id;

        // Scroll to the form
        form.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error("Error fetching animal:", error);
        alert("Could not load animal details.");
    }
};

// --- 6. START: LOAD ANIMALS WHEN PAGE LOADS ---
fetchAnimals();
=======
//const API = "http://localhost:3000/animals";
const API = "https://backend-animals-i5yl.onrender.com/animals";

const form = document.getElementById("animalForm");
const table = document.getElementById("animalTable");

const idInput = document.getElementById("animalId");
const nameInput = document.getElementById("name");
const legsInput = document.getElementById("numLegs");

loadAnimals();

async function loadAnimals(){

    const response = await fetch(API);

    const data = await response.json();

    table.innerHTML = "";

    data.animals.forEach(animal=>{

        table.innerHTML += `
        <tr>

            <td>${animal.id}</td>

            <td>${animal.name}</td>

            <td>${animal.numLegs}</td>

            <td>

                <button
                    class="edit"
                    onclick="editAnimal(${animal.id},'${animal.name}',${animal.numLegs})">

                    Edit

                </button>

                <button
                    class="delete"
                    onclick="deleteAnimal(${animal.id})">

                    Delete

                </button>

            </td>

        </tr>
        `;

    });

}

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    const animal={
        name:nameInput.value,
        numLegs:Number(legsInput.value)
    };

    if(idInput.value===""){

        await fetch(API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(animal)
        });

    }else{

        await fetch(`${API}/${idInput.value}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(animal)
        });

    }

    form.reset();

    idInput.value="";

    loadAnimals();

});

function editAnimal(id,name,numLegs){

    idInput.value=id;

    nameInput.value=name;

    legsInput.value=numLegs;

}

async function deleteAnimal(id){

    if(!confirm("Delete this animal?")) return;

    await fetch(`${API}/${id}`,{
        method:"DELETE"
    });

    loadAnimals();

}
>>>>>>> 94872e05ec91ed2fdee6b52870c63f026fa44a29
