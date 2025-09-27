import { NextResponse } from "next/server";
import { getCsrfToken, updateCookieHeader, callJavaAPI } from "@/lib/auth/utils";

export async function GET(req: Request) {
    const cookieHeader = req.headers.get("cookie") || "";
    const csrfToken = getCsrfToken(cookieHeader);



    try {
        // Try session first
        let sessionRes = await callJavaAPI("/auth/session", cookieHeader, csrfToken, "GET");

        if (sessionRes.ok) {
            const data = await sessionRes.json();
            return NextResponse.json(data, { status: 200 });
        }

        // If 401, try refresh
        if (sessionRes.status === 401) {
            const refreshRes = await callJavaAPI("/auth/refresh", cookieHeader, csrfToken, "POST");

            if (refreshRes.ok) {
                // Get updated cookies from refresh
                const setCookieHeaders = refreshRes.headers.getSetCookie();

                // Update cookie header with new cookies for retry
                const updatedCookieHeader = updateCookieHeader(cookieHeader, setCookieHeaders);
                const newCsrfToken = getCsrfToken(updatedCookieHeader);

                // Retry session with updated cookies
                sessionRes = await callJavaAPI("/auth/session", updatedCookieHeader, newCsrfToken, "GET");

                if (sessionRes.ok) {
                    const data = await sessionRes.json();
                    const response = NextResponse.json(data, { status: 200 });

                    // Forward all new cookies to client
                    setCookieHeaders.forEach(cookie => {
                        response.headers.append('Set-Cookie', cookie);
                    });

                    return response;
                }
            }
        }

        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });

    } catch (error) {
        console.error('Session API error:', error);
        return NextResponse.json({ error: 'Network error' }, { status: 500 });
    }
}
