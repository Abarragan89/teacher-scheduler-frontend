const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}

export async function clientFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = `${API_BASE}${endpoint}`;

    const config: RequestInit = {
        credentials: 'include', // Always include cookies
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
            ...options.headers,
        },
        ...options,
    };

    let response = await fetch(url, config);

    // Handle token refresh on 401
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        try {
            const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            if (refreshResponse.ok) {
                // Update CSRF token and retry
                config.headers = {
                    ...config.headers,
                    'X-XSRF-TOKEN': getCsrfToken(),
                };
                response = await fetch(url, config);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }

    return response;
}