import { cookies } from 'next/headers';

/**
 * Server-only utility to extract cookies and CSRF token
 * This function can only be called from server components/pages
 */
export async function getServerCookies() {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

    const csrfToken = cookieStore.get('XSRF-TOKEN')?.value || '';

    return { cookieHeader, csrfToken };
}