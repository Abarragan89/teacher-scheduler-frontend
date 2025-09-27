import { NextResponse } from "next/server";

const JAVA_API = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Forward request to Java API, including cookies and CSRF token
 */
async function callJava(path: string, cookieHeader: string, csrfToken: string) {
    return fetch(`${JAVA_API}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
            Cookie: cookieHeader,
        },
    });
}

export async function GET(req: Request) {
    // 1️⃣ Extract cookies from incoming request
    const cookieHeader = req.headers.get("cookie") || "";

    // 2️⃣ Extract CSRF token if present
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    const csrfToken = match?.[1] ?? "";

    // 3️⃣ Attempt session
    let sessionRes = await callJava("/auth/session", cookieHeader, csrfToken);

    // 4️⃣ If session is 401, attempt refresh
    if (sessionRes.status === 401) {
        const refreshRes = await callJava("/auth/refresh", cookieHeader, csrfToken);

        // Forward any Set-Cookie headers to the browser
        const newCookies = refreshRes.headers.get("set-cookie");

        if (refreshRes.ok) {
            // Retry session after refresh
            sessionRes = await callJava("/auth/session", cookieHeader, csrfToken);

            const data = await sessionRes.json().catch(() => null);
            const response = NextResponse.json(data, { status: sessionRes.status });

            if (newCookies) {
                response.headers.append("Set-Cookie", newCookies);
            }

            return response;
        } else {
            // Refresh failed → return 401 to client
            const errBody = await refreshRes.text().catch(() => "");
            const response = NextResponse.json(
                { error: "refresh_failed", detail: errBody },
                { status: refreshRes.status }
            );
            if (newCookies) {
                response.headers.append("Set-Cookie", newCookies);
            }
            return response;
        }
    }

    // 5️⃣ Forward normal session response
    const data = await sessionRes.json().catch(() => null);
    return NextResponse.json(data, { status: sessionRes.status });
}
