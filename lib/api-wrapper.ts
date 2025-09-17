"use client";
type ApiFetchOptions = {
    method?: string
    headers?: HeadersInit
    body?: BodyInit | null
}

export default async function apiFetch(
    url: string,
    // destructure the second options object and set entire object to {} if nothing is passed
    // if default to {}, then defaults apply to method and headers
    { method = "GET", headers = { "Content-Type": "application/json" }, body }: ApiFetchOptions = {},
    retried: boolean = false
): Promise<Response> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });

        console.log("response first one ", response)

        
        if (response.status === 401 && !retried) {
            // Try refresh
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            const refreshData = await refreshRes.json();
            console.log('refresh data ', refreshData)

            if (!refreshRes.ok) {
                return response; // Refresh failed → return 401
            }

            // Retry original request once more. 
            return apiFetch(url, { method, headers, body }, true);
        }

        return response;
    } catch (err) {
        console.error("Network or fetch error:", err);
        // Optionally return a fake response or throw again
        throw err;
    }
}