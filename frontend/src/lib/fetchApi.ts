import * as Sentry from "@sentry/react";

interface fetchApiOptions extends RequestInit {
    getToken?: () => Promise<string | null>;
}

export const fetchApi = async (path: string, options: fetchApiOptions = {}) => {

    const rawUrl: string = import.meta.env.VITE_API_BASE_URL
    const baseUrl: string = typeof rawUrl === "string" ? rawUrl.replace(/\/+$/, "") : "";

    const { getToken, method = "GET", body } = options;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (getToken) {
        const token = await getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }
    }
    let response;
    try {
        response = await fetch(`${baseUrl}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        })
    } catch (error) {
        Sentry.addBreadcrumb({
            category: "api",
            message: `${method} ${path}`,
            level: "error",
            data: { network: true },
        });

        Sentry.captureException(error, {
            tags: { "api.fetch": "network" },
            extra: { path, method },
        });

        throw error;
    }

    const data = await response.json();

    Sentry.addBreadcrumb({
        category: "api",
        message: `${method} ${path}`,
        level: response.ok ? "info" : "warning",
        data: { status: response.status },
    });

    if (!response.ok) {
        const msg = typeof data?.error === "string" ? data.error : response.statusText;
        const err = new Error(typeof msg === "string" ? msg : "Request failed");

        if (response.status >= 500) {
            Sentry.captureException(err, {
                tags: { "api.fetch": "http", "http.status": String(response.status) },
                extra: { path, method, status: response.status },
            });
        }

        throw err;
    }

    return data;
}