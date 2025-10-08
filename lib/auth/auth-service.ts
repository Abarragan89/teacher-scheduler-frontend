import { serverAuth } from '../api/services/auth'

export interface AuthResponse {
    authenticated: boolean;
    user?: any;
    error?: string;
}

export async function getServerSession(): Promise<AuthResponse> {
    try {
        const user = await serverAuth.getSession()
        return { authenticated: true, user }
    } catch (error) {
        console.error('Server session error:', error)
        return { authenticated: false, error: 'Network error' }
    }
}