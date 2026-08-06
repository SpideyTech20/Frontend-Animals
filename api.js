const API_URL = "http://localhost:5000";

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export async function apiFetch(path, options = {}) {

    const token = getAccessToken();

    const headers = new Headers(options.headers ?? {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
    }

    return response;
}