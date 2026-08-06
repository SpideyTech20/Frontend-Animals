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
        const response = await apiFetch("/animals");
        const data = await response.json().catch(() => []);

        if (!response.ok) {
            message.textContent = data.message ?? "Unable to load animals";
            return;
        }

        if (!Array.isArray(data)) {
            message.textContent = "Unexpected response from the API.";
            return;
        }

        animalsCache = data;

        if (data.length === 0) {
            animalList.innerHTML = "<li>No animals added yet.</li>";
            return;
        }

        animalList.innerHTML = data
            .map(animal => `
                <li>
                    <strong>${animal.name}</strong> — ${getAnimalLegs(animal)} legs
                    <button data-action="edit" data-id="${animal.id}" type="button">Edit</button>
                    <button data-action="delete" data-id="${animal.id}" type="button">Delete</button>
                </li>
            `)
            .join("");
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the API";
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
        const path = editingId ? `/animals/${editingId}` : "/animals";
        const response = await apiFetch(path, {
            method,
            body: JSON.stringify({ name, num_legs: numLegs })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            message.textContent = data.message ?? "Unable to save animal";
            return;
        }

        message.textContent = editingId ? "Animal updated successfully." : "Animal added successfully.";
        resetForm();
        await loadAnimals();
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the API";
    }
});

animalList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "delete") {
        if (!confirm("Delete this animal?")) {
            return;
        }

        try {
            const response = await apiFetch(`/animals/${id}`, {
                method: "DELETE"
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                message.textContent = data.message ?? "Unable to delete animal";
                return;
            }

            message.textContent = "Animal deleted successfully.";
            await loadAnimals();
        } catch (error) {
            console.error(error);
            message.textContent = "Unable to connect to the API";
        }

        return;
    }

    if (action === "edit") {
        const animal = animalsCache.find(item => String(item.id) === String(id));

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

cancelEditButton.addEventListener("click", resetForm);

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    window.location.href = "./login.html";
});

loadAnimals();