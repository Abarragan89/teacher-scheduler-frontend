import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get all cookies as header string for server-side requests
        const allCookies = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        // Extract CSRF token specifically (non-HttpOnly)
        const csrfCookie = cookieStore.get('XSRF-TOKEN');
        const csrfToken = csrfCookie?.value || '';

        // Check if we have access token (for authentication status)
        const accessToken = cookieStore.get('access_token');
        const authenticated = !!accessToken;

        return NextResponse.json({
            cookieHeader: allCookies,
            csrfToken: csrfToken,
            authenticated: authenticated
        });

    } catch (error) {
        console.error('Error in session API:', error);
        return NextResponse.json(
            {
                error: 'Failed to get session',
                cookieHeader: '',
                csrfToken: '',
                authenticated: false
            },
            { status: 500 }
        );
    }
}