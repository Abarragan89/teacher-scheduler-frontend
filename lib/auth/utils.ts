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


// Legacy callJavaAPI function has been removed and replaced with new API service architecture
// See /lib/api/services/ for the new client/server service implementations



//     return response;
// }