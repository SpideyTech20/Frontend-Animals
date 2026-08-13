const API_URL = "https://backend-animals-manager.onrender.com";

// ==================================================
// CHECK AUTH - Redirect to login if not logged in
// ==================================================

const token = localStorage.getItem("accessToken");
if (!token) {
    window.location.href = "/login.html";
}

const animalForm = document.getElementById("animalForm");
const animalId = document.getElementById("animalId");
const nameInput = document.getElementById("name");
const numLegsInput = document.getElementById("numLegs");
const animalTable = document.getElementById("animalTable");
const message = document.getElementById("message");


// ==================================================
// GET - GET ALL ANIMALS
// ==================================================

async function getAnimals() {

    try {

        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${API_URL}/animals`, {
            method: "GET",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        // Safely parse response body (some endpoints return empty body)
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

        console.log("GET response:", response.status, data);

        if (!response.ok) {
            message.textContent = data.message || `Failed to get animals (${response.status})`;
            return;
        }

        displayAnimals(Array.isArray(data) ? data : (data.animals ?? []));

    } catch (error) {

        console.error("GET Error:", error);

        message.textContent =
            "Cannot connect to backend.";
    }
}


// ==================================================
// DISPLAY ANIMALS
// ==================================================

function displayAnimals(animals) {

    animalTable.innerHTML = "";

    if (!Array.isArray(animals) || animals.length === 0) {

        animalTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No animals found.
                </td>
            </tr>
        `;

        return;
    }

    animals.forEach(animal => {

        const row = document.createElement("tr");

        const id = animal.id ?? animal._id ?? "";
        const animalName = animal.name ?? animal.title ?? "";
        const legs = animal.num_legs ?? animal.numLegs ?? "";

        row.innerHTML = `
            <td>${id}</td>
            <td></td>
            <td>${legs}</td>
            <td></td>
        `;

        // set name safely
        const nameCell = row.children[1];
        nameCell.textContent = animalName;

        const actionsCell = row.children[3];

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
            editAnimal(id, animalName, legs);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => {
            deleteAnimal(id);
        });

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(delBtn);

        animalTable.appendChild(row);
    });
}


// ==================================================
// POST - ADD ANIMAL  ✅ FIXED - Added this function
// ==================================================

async function addAnimal(name, numLegs) {

    try {

        const token = localStorage.getItem("accessToken");

        const response = await fetch(
            `${API_URL}/animals`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    name: name,
                    num_legs: numLegs
                })
            }
        );

        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

        console.log("POST response:", response.status, data);

        if (!response.ok) {
            message.textContent = data.message || `Failed to add animal (${response.status})`;
            return;
        }

        message.textContent =
            "Animal added successfully!";

        animalForm.reset();

        animalId.value = "";

        await getAnimals();

    } catch (error) {

        console.error("POST Error:", error);

        message.textContent =
            "Cannot connect to backend.";
    }
}


// ==================================================
// PUT - UPDATE ANIMAL  ✅ KEPT ONLY ONE (the correct one)
// ==================================================

async function updateAnimal(id, name, numLegs) {

    try {

        const response = await fetch(
            `${API_URL}/animals/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${localStorage.getItem("accessToken")}`
                },

                body: JSON.stringify({
                    name: name,
                    num_legs: numLegs
                })
            }
        );

        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

        console.log("PUT response:", response.status, data);

        if (!response.ok) {
            message.textContent = data.message || `Failed to update animal (${response.status})`;
            return;
        }

        message.textContent =
            "Animal updated successfully!";

        animalForm.reset();

        animalId.value = "";

        await getAnimals();

    } catch (error) {

        console.error("PUT Error:", error);

        message.textContent =
            "Cannot connect to backend.";
    }
}


// ==================================================
// DELETE - DELETE ANIMAL
// ==================================================

async function deleteAnimal(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this animal?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const token = localStorage.getItem("accessToken");

        const response = await fetch(
            `${API_URL}/animals/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

        console.log("DELETE response:", response.status, data);

        if (!response.ok) {
            message.textContent = data.message || `Failed to delete animal (${response.status})`;
            return;
        }

        message.textContent =
            "Animal deleted successfully!";

        await getAnimals();

    } catch (error) {

        console.error("DELETE Error:", error);

        message.textContent =
            "Cannot connect to backend.";
    }
}


// ==================================================
// EDIT BUTTON
// ==================================================

function editAnimal(id, name, numLegs) {

    animalId.value = id;

    nameInput.value = name;

    numLegsInput.value = numLegs ?? "";

    nameInput.focus();

    message.textContent =
        `Editing ${name}`;
}


// ==================================================
// FORM SUBMIT
// ==================================================

animalForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const id = animalId.value;

        const name = nameInput.value.trim();

        const numLegs = Number(numLegsInput.value);


        // ------------------------------------------
        // VALIDATE NAME
        // ------------------------------------------

        if (!name) {

            message.textContent =
                "Please enter an animal name.";

            return;
        }


        // ------------------------------------------
        // VALIDATE NUMBER OF LEGS
        // ------------------------------------------

        if (
            Number.isNaN(numLegs) ||
            numLegs < 0
        ) {

            message.textContent =
                "Please enter a valid number of legs.";

            return;
        }


        // ------------------------------------------
        // ID EXISTS = UPDATE
        // NO ID = ADD
        // ------------------------------------------

        if (id) {

            await updateAnimal(
                id,
                name,
                numLegs
            );

        } else {

            await addAnimal(   // ✅ NOW THIS FUNCTION EXISTS!
                name,
                numLegs
            );
        }
    }
);


// ==================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==================================================

window.editAnimal = editAnimal;

window.deleteAnimal = deleteAnimal;


// ==================================================
// LOAD ANIMALS WHEN PAGE OPENS
// ==================================================

getAnimals();


// ==================================================
// LOGOUT BUTTON
// ==================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        window.location.href = "/login.html";
    });
}