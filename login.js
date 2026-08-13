const API_URL = "https://backend-animals-manager.onrender.com";

// Wait for DOM to be ready (optional but safe)
document.addEventListener("DOMContentLoaded", () => {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const form = document.getElementById("login-form");
    const message = document.getElementById("message");

    // Safety check: make sure all elements exist
    if (!emailInput || !passwordInput || !form || !message) {
        console.error("Login form elements not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Login failed";
                message.style.color = "red";
                return;
            }

            // Save token
            localStorage.setItem("accessToken", data.accessToken || data.token);

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";

            // Redirect to main page
            setTimeout(() => {
                window.location.href = "./index.html";
            }, 1000);

        } catch (err) {
            message.textContent = "Cannot connect to API.";
            message.style.color = "red";
            console.error("Login error:", err);
        }
    });

});