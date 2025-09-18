
// Check if user is logged in
export const checkSession = async () => {

    // First attempt: session check
    let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
        method: "POST",
        credentials: "include"
    });

    // return
    if (res.ok) {
        return await res.json();
    }

    if (res.status === 401) {
        // Try refreshing access token if session is unauthorized
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            
        }

        // Retry session check after refresh
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
            method: "POST",
            credentials: "include"
        });


        if (res.ok) {
            return await res.json();
        }
    }

    return await res.json();

};