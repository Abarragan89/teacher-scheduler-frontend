import { callJavaAPI } from './utils';

export interface AuthResponse {
    authenticated: boolean;
    user?: any;
    error?: string;
}

export async function getServerSession(): Promise<AuthResponse> {
    try {
        // Use callJavaAPI which now handles refresh automatically
        const sessionRes = await callJavaAPI('/auth/session', 'GET')

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