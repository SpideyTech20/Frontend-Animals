const API_URL = "https://backend-animals-manager.onrender.com";

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Token is invalid/expired
    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
        return response;
    }

    return response;
}