import { cookies } from 'next/headers';
import { getCsrfToken, cookiesToHeader, callJavaAPI, updateCookieHeader } from './utils';

export interface AuthResponse {
    authenticated: boolean;
    user?: any;
    error?: string;
}

/**
 * Server-side session check that handles cookie forwarding and refresh
 */
export async function getServerSession(): Promise<AuthResponse> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookiesToHeader(cookieStore.getAll());
        const csrfToken = getCsrfToken(cookieHeader);

        // Try session first
        let sessionRes = await callJavaAPI('/auth/session', cookieHeader, csrfToken, 'POST');


        if (sessionRes.ok) {
            const data = await sessionRes.json();
            return { authenticated: true, user: data };
        }

        // If session fails with 401, try refresh
        if (sessionRes.status === 401) {
            const refreshRes = await callJavaAPI('/auth/refresh', cookieHeader, csrfToken, 'POST');

            if (refreshRes.ok) {
                // Get updated cookies from refresh response
                const setCookieHeaders = refreshRes.headers.getSetCookie();

                // Update cookie header with new cookies (including new access_token)
                const updatedCookieHeader = updateCookieHeader(cookieHeader, setCookieHeaders);
                const newCsrfToken = getCsrfToken(updatedCookieHeader);

                // Retry session with updated cookies
                const retryRes = await callJavaAPI('/auth/session', updatedCookieHeader, newCsrfToken, 'POST');

                if (retryRes.ok) {
                    const data = await retryRes.json();
                    return { authenticated: true, user: data };
                }
            }
        }

        return { authenticated: false, error: 'Session expired' };
    } catch (error) {
        console.error('Server session check failed:', error);
        return { authenticated: false, error: 'Network error' };
    }
}

/**
 * Client-side session check via API route
 */
export async function getClientSession(): Promise<AuthResponse> {
    try {
        const response = await fetch('/api/session', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            return { authenticated: true, user: data };
        }

        if (response.status === 401) {
            return { authenticated: false, error: 'Not authenticated' };
        }

        return { authenticated: false, error: 'Session check failed' };
    } catch (error) {
        console.error('Client session check failed:', error);
        return { authenticated: false, error: 'Network error' };
    }
}