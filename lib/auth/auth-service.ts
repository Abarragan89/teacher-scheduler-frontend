import { callJavaAPI } from './utils';

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

/**
 * Client-side session check via API route
 */
// export async function getClientSession(): Promise<AuthResponse> {
//     const cookies = Object.fromEntries(
//         document.cookie.split("; ").map(c => c.split("="))
//     );
//     const csrfToken = cookies["XSRF-TOKEN"];

//     // First attempt: session check
//     let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//             "X-XSRF-TOKEN": csrfToken || ""
//         }
//     });

//     // return
//     if (res.ok) {
//         const userData = await res.json()
//         userData.csrfToken = csrfToken;
//         return userData
//     }

//     if (res.status === 401) {
//         // Try refreshing access token if session is unauthorized
//         const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
//             method: "POST",
//             credentials: "include",
//             headers: {
//                 "X-XSRF-TOKEN": csrfToken || ""
//             }
//         });

//         if (!refreshRes.ok) {
//             // handle refresh failure
//         }

//         // Retry session check after refresh
//         res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
//             method: "POST",
//             credentials: "include",
//             headers: {
//                 "X-XSRF-TOKEN": csrfToken || ""
//             }
//         });

//         if (res.ok) {
//             const userData = await res.json()
//             userData.csrfToken = csrfToken;

//             return userData
//         }
//     }

//     const userData = await res.json()
//     userData.csrfToken = csrfToken;

//     return userData
// }