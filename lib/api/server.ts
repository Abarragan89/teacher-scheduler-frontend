import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Extracts CSRF token from a cookie header string.
 * Used as a fallback when we can't get the CSRF token from other methods.
 */
function getCsrfFromCookies(cookieHeader: string): string {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}


/**
 * Main server-side fetch wrapper with automatic token refresh.
 * Handles JWT access token and CSRF token synchronization across desktop and mobile platforms.
 * 
 * Key features:
 * - Automatic 401 error detection and token refresh
 * - Cross-platform cookie handling (desktop vs mobile Safari)
 * - CSRF token synchronization to prevent authentication failures
 */
export async function serverFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    // Initial request attempt
    const response = await makeServerRequest(endpoint, options);

    // If we get a 401 and this isn't already a refresh request, try to refresh the token
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        console.error('Server: 401 detected, attempting token refresh...');
        const refreshResponse = await makeServerRequest('/auth/refresh', {
            method: 'POST',
        });

        if (refreshResponse.ok) {
            /*
             * CRITICAL: Cross-platform token extraction strategy
             * 
             * Problem: Mobile Safari vs Desktop browsers handle cookie synchronization differently
             * - Mobile Safari: cookieStore.getAll() may return stale values immediately after Set-Cookie headers
             * - Desktop browsers: cookieStore.getAll() updates immediately, but Set-Cookie parsing may be incomplete
             * 
             * Solution: Hybrid approach that tries both methods and uses whichever succeeds
             */
            let newAccessToken = '';
            let newCsrfToken = '';

            // Method 1: Extract directly from Set-Cookie headers (MOBILE-FRIENDLY)
            // This works immediately on mobile where cookieStore updates are delayed
            const setCookieHeader = refreshResponse.headers.get('set-cookie');

            if (setCookieHeader) {
                const accessTokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
                const csrfTokenMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
                if (accessTokenMatch) newAccessToken = accessTokenMatch[1];
                if (csrfTokenMatch) newCsrfToken = csrfTokenMatch[1];
            }

            // Method 2: Fallback to updated cookie store (DESKTOP-FRIENDLY)
            // Small delay allows desktop browsers to update their internal cookie store
            await new Promise(resolve => setTimeout(resolve, 10));
            const cookieStore = await cookies();
            const accessTokenCookie = cookieStore.get('access_token');
            const csrfTokenCookie = cookieStore.get('XSRF-TOKEN');

            // Use whichever method successfully retrieved the tokens
            if (!newAccessToken && accessTokenCookie) {
                newAccessToken = accessTokenCookie.value;
            }
            if (!newCsrfToken && csrfTokenCookie) {
                newCsrfToken = csrfTokenCookie.value;
            }

            // Retry the original request with the new tokens
            if (newAccessToken) {
                const retryResponse = await makeServerRequest(endpoint, options, newAccessToken, newCsrfToken);
                return retryResponse;
            }
        }
    }

    return response;
}

/**
 * Core server request function that handles cookie and CSRF token management.
 * 
 * This function is called in two scenarios:
 * 1. Normal requests: Uses existing cookies from the cookie store
 * 2. Post-refresh requests: Uses newly provided tokens to avoid stale cookie issues
 * 
 * @param endpoint - API endpoint to call
 * @param options - Fetch options
 * @param newAccessToken - Fresh access token from refresh response (mobile fix)
 * @param newCsrfToken - Fresh CSRF token from refresh response (mobile fix)
 */
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
        /*
         * POST-REFRESH REQUEST: Use fresh tokens to avoid mobile timing issues
         * 
         * Why this is necessary:
         * - Mobile Safari may not immediately update cookieStore.getAll() after Set-Cookie headers
         * - We manually build the cookie header with fresh tokens from the refresh response
         * - This ensures CSRF token synchronization between cookie and header values
         */

        // Keep all existing cookies except the ones we're updating
        const otherCookies = cookieStore.getAll()
            .filter(cookie => cookie.name !== 'access_token' && cookie.name !== 'XSRF-TOKEN') // Filter out stale tokens
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        // Build cookie header with fresh access token
        cookieHeader = `${otherCookies}; access_token=${newAccessToken}`;

        // Handle CSRF token with multiple fallback strategies
        if (newCsrfToken) {
            // Best case: We have a fresh CSRF token from the refresh response
            cookieHeader += `; XSRF-TOKEN=${newCsrfToken}`;
            csrfToken = newCsrfToken;
        } else {
            // Fallback 1: Try to get CSRF token from updated cookie store (desktop browsers)
            const existingCsrfCookie = cookieStore.get('XSRF-TOKEN');
            if (existingCsrfCookie) {
                cookieHeader += `; XSRF-TOKEN=${existingCsrfCookie.value}`;
                csrfToken = existingCsrfCookie.value;
            } else {
                // Fallback 2: Parse CSRF token from cookie header string
                csrfToken = getCsrfFromCookies(cookieHeader);
            }
        }
    } else {
        /*
         * NORMAL REQUEST: Use existing cookies from cookie store
         * 
         * This is the standard path for initial requests and when no token refresh is needed.
         * Works reliably across all platforms since we're not dealing with timing issues.
         */
        cookieHeader = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        csrfToken = getCsrfFromCookies(cookieHeader);
    }

    const url = `${API_BASE}${endpoint}`;

    /*
     * CRITICAL: CSRF Protection
     * 
     * The X-XSRF-TOKEN header MUST exactly match the XSRF-TOKEN cookie value.
     * This is enforced by Spring Security's CSRF protection on the backend.
     * Any mismatch results in a 401 error, which was the root cause of mobile auth failures.
     */
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            'X-XSRF-TOKEN': csrfToken, // Must match XSRF-TOKEN cookie exactly
            ...options.headers,
        },
        ...options,
    };

    return fetch(url, config);
}