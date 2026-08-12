import { apiFetch } from "./api.js";

const animalList = document.querySelector("#animal-list");
const message = document.querySelector("#message");
const logoutButton = document.querySelector("#logout-button");
const form = document.querySelector("#animal-form");
const nameInput = document.querySelector("#animal-name");
const numLegsInput = document.querySelector("#animal-num-legs");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");

let editingId = null;
let animalsCache = [];


function getAnimalLegs(animal) {
    return animal.num_legs ?? animal.numLegs ?? "Unknown";
}


function resetForm() {
    editingId = null;
    form.reset();
    submitButton.textContent = "Add Animal";
}


async function loadAnimals() {
    try {
        message.textContent = "Loading animals...";

        const response = await apiFetch("/animals");

        const data = await response.json().catch(() => ({}));

        console.log("Animals response:", response.status, data);

        if (!response.ok) {
            message.textContent =
                data.message || `Failed to load animals (${response.status})`;
            return;
        }

        if (!Array.isArray(data)) {
            message.textContent = "Unexpected response from API.";
            console.error("Expected array but received:", data);
            return;
        }

        animalsCache = data;

        if (data.length === 0) {
            animalList.innerHTML = "<li>No animals added yet.</li>";
            message.textContent = "";
            return;
        }

        animalList.innerHTML = data.map(animal => `
            <li>
                <strong>${animal.name}</strong>
                — ${getAnimalLegs(animal)} legs

                <button
                    type="button"
                    data-action="edit"
                    data-id="${animal.id}">
                    Edit
                </button>

                <button
                    type="button"
                    data-action="delete"
                    data-id="${animal.id}">
                    Delete
                </button>
            </li>
        `).join("");

        message.textContent = "";

    } catch (error) {
        console.error("LOAD ANIMALS ERROR:", error);
        message.textContent = "Unable to connect to the backend.";
    }
}


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const numLegs = Number(numLegsInput.value);

    if (!name || Number.isNaN(numLegs)) {
        message.textContent = "Please enter a valid animal name and number of legs.";
        return;
    }

    try {
        const method = editingId ? "PUT" : "POST";

        const endpoint = editingId
            ? `/animals/${editingId}`
            : "/animals";

        const response = await apiFetch(endpoint, {
            method: method,
            body: JSON.stringify({
                name: name,
                num_legs: numLegs
            })
        });

        const data = await response.json().catch(() => ({}));

        console.log("Save response:", response.status, data);

        if (!response.ok) {
            message.textContent =
                data.message || `Unable to save animal (${response.status})`;
            return;
        }

        message.textContent = editingId
            ? "Animal updated successfully."
            : "Animal added successfully.";

        resetForm();

        await loadAnimals();

    } catch (error) {
        console.error("SAVE ANIMAL ERROR:", error);
        message.textContent = "Unable to connect to the backend.";
    }
});


animalList.addEventListener("click", async (event) => {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;


    // DELETE
    if (action === "delete") {

        if (!confirm("Delete this animal?")) {
            return;
        }

        try {

            const response = await apiFetch(`/animals/${id}`, {
                method: "DELETE"
            });

            const data = await response.json().catch(() => ({}));

            console.log("Delete response:", response.status, data);

            if (!response.ok) {
                message.textContent =
                    data.message || `Unable to delete animal (${response.status})`;
                return;
            }

            message.textContent = "Animal deleted successfully.";

            await loadAnimals();

        } catch (error) {
            console.error("DELETE ERROR:", error);
            message.textContent = "Unable to connect to the backend.";
        }

        return;
    }


    // EDIT
    if (action === "edit") {

        const animal = animalsCache.find(
            item => String(item.id) === String(id)
        );

        if (!animal) {
            message.textContent = "Animal not found.";
            return;
        }

        editingId = animal.id;

        nameInput.value = animal.name;
        numLegsInput.value = getAnimalLegs(animal);

        submitButton.textContent = "Update Animal";

        message.textContent = `Editing ${animal.name}`;
    }
});


cancelEditButton.addEventListener("click", () => {
    resetForm();
    message.textContent = "";
});


logoutButton.addEventListener("click", () => {

    localStorage.removeItem("accessToken");

    window.location.href = "./login.html";
});


// Check if user is logged in
const token = localStorage.getItem("accessToken");

if (!token) {
    window.location.href = "./login.html";
} else {
    loadAnimals();
}