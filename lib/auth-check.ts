// Check if user is logged in
export const checkSession = async () => {

    const cookies = Object.fromEntries(
        document.cookie.split("; ").map(c => c.split("="))
    );
    const csrfToken = cookies["XSRF-TOKEN"];

    // First attempt: session check
    let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-XSRF-TOKEN": csrfToken || ""
        }
    });

    // return
    if (res.ok) {
        const userData = await res.json()
        userData.csrfToken = csrfToken;
        return userData
    }

    if (res.status === 401) {
        // Try refreshing access token if session is unauthorized
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-XSRF-TOKEN": csrfToken || ""
            }
        });

        if (!refreshRes.ok) {
            // handle refresh failure
        }

        // Retry session check after refresh
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-XSRF-TOKEN": csrfToken || ""
            }
        });

        if (res.ok) {
            const userData = await res.json()
            userData.csrfToken = csrfToken;

            return userData
        }
    }

    const userData = await res.json()
    userData.csrfToken = csrfToken;

    return userData
};