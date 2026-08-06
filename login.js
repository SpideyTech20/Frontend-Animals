const API_URL = "http://localhost:5000";

const form = document.querySelector("#login-form");
const message = document.querySelector("#message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {

        const response = await fetch(`${API_URL}/auth/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        localStorage.setItem("accessToken", data.accessToken || data.token);

        window.location.href = "./animals.html";

    } catch (err) {

        message.textContent = "Cannot connect to API.";

    }

});