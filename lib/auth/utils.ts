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
            // Server-side: use next/headers with dynamic import
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            finalCookieHeader = cookiesToHeader(cookieStore.getAll());
            finalCsrfToken = getCsrfToken(finalCookieHeader);
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