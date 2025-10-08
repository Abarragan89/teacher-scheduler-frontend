import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

function getCsrfFromCookies(cookieHeader: string): string {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}

export async function serverFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

    const csrfToken = getCsrfFromCookies(cookieHeader);

    const url = `${API_BASE}${endpoint}`;

    console.log('server fetch url ', url)
    console.log('server fetch cookieHeader ', cookieHeader)
    console.log('server fetch csrfToken ', csrfToken)

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            'X-XSRF-TOKEN': csrfToken,
            ...options.headers,
        },
        ...options,
    };

    return fetch(url, config);
}