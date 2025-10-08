/**
 * Extract CSRF token from cookie header string
 */
export function getCsrfToken(cookieHeader: string): string {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}

/**
 * Update cookie header with new cookies from Set-Cookie headers
 */
export function updateCookieHeader(originalHeader: string, setCookieHeaders: string[]): string {
    let updatedHeader = originalHeader;

    setCookieHeaders.forEach(setCookie => {
        const [cookieStr] = setCookie.split(';');
        const [name, value] = cookieStr.split('=');

        if (name && value !== undefined) {
            // Remove old cookie and add new one
            const regex = new RegExp(`${name}=[^;]*;?\\s*`, 'g');
            updatedHeader = updatedHeader.replace(regex, '');
            updatedHeader = updatedHeader ? `${updatedHeader}; ${name}=${value}` : `${name}=${value}`;
        }
    });

    return updatedHeader;
}

/**
 * Convert Next.js cookies to cookie header string
 */
export function cookiesToHeader(cookies: any[]): string {
    return cookies
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ");
}


/**
 * Make authenticated request to Java API with automatic token refresh
 * Automatically extracts cookies based on environment (server vs client)
 */
export async function callJavaAPI(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    cookieHeader?: string,
    csrfToken?: string
): Promise<Response> {
    const JAVA_API = process.env.NEXT_PUBLIC_API_URL!;

    // Auto-extract cookies if not provided
    let finalCookieHeader = cookieHeader;
    let finalCsrfToken = csrfToken;
    const isClient = typeof window !== 'undefined';

    if (!finalCookieHeader || !finalCsrfToken) {
        if (!isClient) {
            // Server-side: cookies must be passed explicitly
            // Use getServerCookies() from server-utils.ts in your server components
            console.warn('Server-side callJavaAPI called without cookies. Pass cookies explicitly using getServerCookies()');
            finalCookieHeader = '';
            finalCsrfToken = '';
        } else {
            // Client-side: use document.cookie for CSRF token only
            finalCookieHeader = document.cookie;
            finalCsrfToken = getCsrfToken(finalCookieHeader);
        }
    }

    const makeRequest = async (cookies: string, csrf: string, useCredentialsInclude: boolean) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrf,
        };

        const config: RequestInit = {
            method,
            headers,
        };

        // Choose cookie strategy based on client vs server
        if (useCredentialsInclude) {
            config.credentials = 'include';
        } else {
            headers.Cookie = cookies;
        }

        if (method !== 'GET' && body) {
            config.body = JSON.stringify(body);
        }

        return fetch(`${JAVA_API}${path}`, config);
    };

    // First attempt
    let response = await makeRequest(finalCookieHeader, finalCsrfToken, isClient);

    // If 401, try to refresh and retry
    if (response.status === 401) {
        try {
            // Use the SAME credential strategy for refresh
            const refreshHeaders: Record<string, string> = {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": finalCsrfToken,
            };

            const refreshConfig: RequestInit = {
                method: 'POST',
                headers: refreshHeaders,
            };

            if (isClient && !cookieHeader) {
                // Client-side: use credentials: 'include' so browser saves new HttpOnly cookies
                refreshConfig.credentials = 'include';
            } else {
                // Server-side: use manual Cookie header
                refreshHeaders.Cookie = finalCookieHeader;
            }

            const refreshResponse = await fetch(`${JAVA_API}/auth/refresh`, refreshConfig);

            if (refreshResponse.ok) {
                if (isClient) {
                    // Client-side: Browser automatically saved new HttpOnly cookies
                    // Get updated CSRF token and retry
                    const newCsrfFromCookie = getCsrfToken(document.cookie);

                    response = await makeRequest('', newCsrfFromCookie, true);
                } else {
                    // Server-side: Extract new cookies from Set-Cookie headers
                    const setCookieHeaders = refreshResponse.headers.getSetCookie();
                    const updatedCookieHeader = updateCookieHeader(finalCookieHeader, setCookieHeaders);
                    const newCsrfToken = getCsrfToken(updatedCookieHeader);
                    response = await makeRequest(updatedCookieHeader, newCsrfToken, false);
                }
            }
        } catch (refreshError) {
            console.error('Error during token refresh:', refreshError);
        }
    }

    return response;
}

/**
 * callJavaAPI: unified API helper for frontend and server components
 * Uses HttpOnly cookies for access/refresh tokens + CSRF token cookie
 */
// export async function callJavaAPI(
//     path: string,
//     method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
//     body?: any,
//     cookieHeader?: string,
//     csrfToken?: string
// ): Promise<Response> {
//     const JAVA_API = process.env.NEXT_PUBLIC_API_URL!;
//     const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

//     let finalCookieHeader = cookieHeader as string;
//     let finalCsrfToken = csrfToken as string;
//     const isClient = typeof window !== 'undefined';

//     // Auto-extract cookies if not provided
//     if (!finalCookieHeader || !finalCsrfToken) {
//         if (!isClient) {
//             // Server-side: call internal API route to get session + CSRF
//             try {
//                 console.log('Fetching server session from', `${APP_URL}`)
//                 const res = await fetch(`${APP_URL}/api/session`, { cache: 'no-store' });
//                 console.log('session res', res.status)
//                 if (res.ok) {
//                     const data = await res.json();
//                     finalCookieHeader = data.cookieHeader;
//                     finalCsrfToken = data.csrfToken;
//                     console.log('Server-side extracted cookies:', finalCookieHeader);
//                     console.log('Server-side extracted CSRF token:', finalCsrfToken);
//                 }
//             } catch (error) {
//                 console.error('Failed to get server session:', error);
//                 finalCookieHeader = '';
//                 finalCsrfToken = '';
//             }
//         } else {
//             // Client-side: read document.cookie for CSRF (HttpOnly cookies sent automatically)
//             finalCookieHeader = document.cookie as string;
//             finalCsrfToken = getCsrfToken(finalCookieHeader);
//         }
//     }

//     const makeRequest = async (cookies: string, csrf: string, useCredentialsInclude: boolean): Promise<Response> => {
//         const headers: Record<string, string> = {
//             'Content-Type': 'application/json',
//             'X-XSRF-TOKEN': csrf, // CSRF token in header
//         };

//         const config: RequestInit = {
//             method,
//             headers,
//             body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
//         };

//         if (useCredentialsInclude) {
//             // Client-side: browser automatically includes HttpOnly cookies
//             config.credentials = 'include';
//         } else {
//             // Server-side: manually include all cookies (including HttpOnly ones)
//             headers.Cookie = cookies;
//         }

//         return fetch(`${JAVA_API}${path}`, config);
//     };

//     // First attempt
//     let response = await makeRequest(finalCookieHeader, finalCsrfToken, isClient);

//     // If 401 Unauthorized, try to refresh tokens
//     if (response.status === 401) {
//         try {
//             const refreshHeaders: Record<string, string> = {
//                 'Content-Type': 'application/json',
//                 'X-XSRF-TOKEN': finalCsrfToken,
//             };

//             const refreshConfig: RequestInit = {
//                 method: 'POST',
//                 headers: refreshHeaders,
//             };

//             if (isClient) {
//                 // Client-side: let browser handle HttpOnly cookies
//                 refreshConfig.credentials = 'include';
//             } else {
//                 // Server-side: manually send all cookies
//                 refreshHeaders.Cookie = finalCookieHeader;
//             }

//             // console.log('refreshconfig', refreshConfig)

//             const refreshResponse = await fetch(`${JAVA_API}/auth/refresh`, refreshConfig);

//             // console.log('Refresh response status:', await refreshResponse.json());

//             if (refreshResponse.ok) {
//                 if (isClient) {
//                     // Client-side: browser automatically saved new HttpOnly cookies
//                     // Just get updated CSRF token and retry
//                     const newCsrfToken = getCsrfToken(document.cookie);
//                     response = await makeRequest('', newCsrfToken, true);
//                 } else {
//                     // Server-side: extract new cookies from Set-Cookie headers
//                     const setCookieHeaders = refreshResponse.headers.getSetCookie();
//                     const updatedCookieHeader = updateCookieHeader(finalCookieHeader, setCookieHeaders);
//                     const newCsrfToken = getCsrfToken(updatedCookieHeader);
//                     response = await makeRequest(updatedCookieHeader, newCsrfToken, false);
//                 }
//             } else {
//                 console.warn('Token refresh failed:', refreshResponse.status);
//             }
//         } catch (refreshError) {
//             console.error('Error during token refresh:', refreshError);
//         }
//     }

//     return response;
// }