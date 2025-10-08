import { callJavaAPI } from './utils';

export interface AuthResponse {
    authenticated: boolean;
    user?: any;
    error?: string;
}

export async function getServerSession(): Promise<AuthResponse> {
    try {
        // Import server utils dynamically to avoid forcing dynamic rendering
        const { getServerCookies } = await import('./server-utils')
        const { cookieHeader, csrfToken } = await getServerCookies()

        // Pass cookies explicitly to callJavaAPI
        const sessionRes = await callJavaAPI('/auth/session', 'GET', undefined, cookieHeader, csrfToken)

        if (sessionRes.ok) {
            const data = await sessionRes.json()
            return { authenticated: true, user: data }
        }
        return { authenticated: false, error: 'Session expired' }

    } catch (error) {
        console.error('Server session error:', error)
        return { authenticated: false, error: 'Network error' }
    }
}