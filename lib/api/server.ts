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
            // Extract the new access_token from Set-Cookie header
            const setCookieHeader = refreshResponse.headers.get('set-cookie');
            console.log('Set-Cookie header from refresh response:', setCookieHeader);
            let newAccessToken = '';

            if (setCookieHeader) {
                const accessTokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
                const csrfTokenMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
                if (accessTokenMatch) newAccessToken = accessTokenMatch[1];
                if (csrfTokenMatch) csrfToken = csrfTokenMatch[1];
            }
            

            console.log('New access token from refresh:', newAccessToken);
            // Retry the original request with the new access token
            if (newAccessToken) {

                const retryResponse = await makeServerRequest(endpoint, options, newAccessToken, csrfToken);
                
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

    if (newAccessToken) {
        // Use the new access token, keeping other cookies
        const otherCookies = cookieStore.getAll()
            .filter(cookie => cookie.name !== 'access_token')
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        cookieHeader = `${otherCookies}; access_token=${newAccessToken}`;
    } else {
        // Use existing cookies
        cookieHeader = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
    }

    const csrfToken = getCsrfFromCookies(cookieHeader);
    const url = `${API_BASE}${endpoint}`;

    console.log('Making server request to:', url);
    console.log('With cookies:', cookieHeader);
    console.log('With CSRF token:', csrfToken);
    console.log('With new CSRF token:', newCsrfToken);

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            'X-XSRF-TOKEN': newCsrfToken || newCsrfToken || '',
            ...options.headers,
        },
        ...options,
    };

    return fetch(url, config);
}