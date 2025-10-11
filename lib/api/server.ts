import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

function getCsrfFromCookies(cookieHeader: string): string {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}


export async function serverFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    // Initial request attempt
    const response = await makeServerRequest(endpoint, options);

    // If we get a 401 and this isn't already a refresh request, try to refresh the token
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        console.error('Server: 401 detected, attempting token refresh...');
        let csrfToken = ""
        const refreshResponse = await makeServerRequest('/auth/refresh', {
            method: 'POST',
        });

        console.log('Token refresh response status:', refreshResponse.status);
        console.log('response json:', await refreshResponse.clone().json().catch(() => ({})));

        if (refreshResponse.ok) {
            // Try both methods to get the most up-to-date tokens
            let newAccessToken = '';
            let newCsrfToken = '';

            // Method 1: Extract from Set-Cookie headers (works better on mobile)
            const setCookieHeader = refreshResponse.headers.get('set-cookie');
            console.log('Set-Cookie header from refresh response:', setCookieHeader);

            if (setCookieHeader) {
                const accessTokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
                const csrfTokenMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
                if (accessTokenMatch) newAccessToken = accessTokenMatch[1];
                if (csrfTokenMatch) newCsrfToken = csrfTokenMatch[1];
            }

            // Method 2: Try to get from updated cookie store (works better on desktop)
            // Add a small delay to allow cookie store to update on desktop
            await new Promise(resolve => setTimeout(resolve, 10));
            const cookieStore = await cookies();
            const accessTokenCookie = cookieStore.get('access_token');
            const csrfTokenCookie = cookieStore.get('XSRF-TOKEN');

            // Use whichever method gave us the tokens
            if (!newAccessToken && accessTokenCookie) {
                newAccessToken = accessTokenCookie.value;
                console.log('Using access token from cookie store (desktop method)');
            }
            if (!newCsrfToken && csrfTokenCookie) {
                newCsrfToken = csrfTokenCookie.value;
                console.log('Using CSRF token from cookie store (desktop method)');
            }

            console.log('Final access token:', newAccessToken);
            console.log('Final CSRF token:', newCsrfToken);

            // Retry the original request with the new tokens
            if (newAccessToken) {
                const retryResponse = await makeServerRequest(endpoint, options, newAccessToken, newCsrfToken);

                console.log('Retry response status:', retryResponse.status);
                console.log('Retry response json:', await retryResponse.clone().json().catch(() => ({})));
                return retryResponse;
            }
        }
    }

    return response;
}

async function makeServerRequest(
    endpoint: string,
    options: RequestInit = {},
    newAccessToken?: string,
    newCsrfToken?: string
): Promise<Response> {
    const cookieStore = await cookies();

    let cookieHeader: string;
    let csrfToken: string;

    if (newAccessToken) {
        // Use the new access token, keeping other cookies
        const otherCookies = cookieStore.getAll()
            .filter(cookie => cookie.name !== 'access_token' && cookie.name !== 'XSRF-TOKEN') // Filter out both old tokens
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        // Build cookie header with new tokens
        cookieHeader = `${otherCookies}; access_token=${newAccessToken}`;

        // Add the new CSRF token to the cookie header if provided
        if (newCsrfToken) {
            cookieHeader += `; XSRF-TOKEN=${newCsrfToken}`;
            csrfToken = newCsrfToken; // Use the new CSRF token directly
        } else {
            // Fallback: try to get CSRF token from existing cookies or updated cookie store
            const existingCsrfCookie = cookieStore.get('XSRF-TOKEN');
            if (existingCsrfCookie) {
                cookieHeader += `; XSRF-TOKEN=${existingCsrfCookie.value}`;
                csrfToken = existingCsrfCookie.value;
            } else {
                csrfToken = getCsrfFromCookies(cookieHeader);
            }
        }
    } else {
        // Use existing cookies
        cookieHeader = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        csrfToken = getCsrfFromCookies(cookieHeader);
    }

    const url = `${API_BASE}${endpoint}`;

    console.log('Making server request to:', url);
    console.log('With cookies:', cookieHeader);
    console.log('With CSRF token:', csrfToken);
    console.log('With new CSRF token:', newCsrfToken);

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            'X-XSRF-TOKEN': csrfToken,
            ...options.headers,
        },
        ...options,
    };

    return fetch(url, config);
}