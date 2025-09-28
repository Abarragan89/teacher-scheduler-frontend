import { callJavaAPI, cookiesToHeader, getCsrfToken } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import React from 'react'

interface pageProps {
    params: {
        dateString: string
    }
}

export default async function page({ params }: pageProps) {

    const { dateString } = params;

    const response = await callJavaAPI('/days/find-or-create', 'POST', { dayDate: dateString })

    if (!response.ok) {
        throw new Error('Error loading day. Try again.');
    }

    const dayData = await response.json();
    console.log('Day data:', dayData);

    return (
        <div>page</div>
    )
}
