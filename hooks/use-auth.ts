'use client';

import { useEffect, useState, useCallback } from 'react';
import { getClientSession, AuthResponse } from '@/lib/auth/auth-service';

interface UseAuthReturn extends AuthResponse {
    loading: boolean;
    refreshAuth: () => Promise<void>;
}

/**
 * Client-side hook for authentication state management
 * Use this in client components that need real-time auth updates
 */
export function useAuth(): UseAuthReturn {
    const [authState, setAuthState] = useState<AuthResponse>({
        authenticated: false
    });
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getClientSession();
            setAuthState(result);
        } catch (error) {
            console.error('Auth check failed:', error);
            setAuthState({
                authenticated: false,
                error: 'Auth check failed'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const refreshAuth = useCallback(async () => {
        await checkAuth();
    }, [checkAuth]);

    return {
        ...authState,
        loading,
        refreshAuth
    };
}

/**
 * Hook for components that need to trigger logout
 */
export function useLogout() {
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            // Redirect to login page
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    return { logout };
}