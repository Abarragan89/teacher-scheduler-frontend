"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { useCsrf } from '@/providers/csrf-provider';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

export default function UserVerification() {

    const searchParams = useSearchParams();
    const token = searchParams.get('token')
    const { setCsrfToken, csrfToken } = useCsrf()

    const [error, setError] = useState<string>("");


    async function verifyToken() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/magic-link-verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token }),
                credentials: "include"
            })

            if (!response.ok) {
                setError("Validation Token is Expired")
            }

            // Set the csrfToken in context
            const { csrf } = await response.json();
            setCsrfToken(csrf)
        } catch (error) {
            setError("Validation Token is Expired")
        }
    }

    useEffect(() => {
        if (token) verifyToken();
    }, [token])

    if (error) {
        return (
            <main className='wrapper text-center'>
                <h2 className='h3-bold text-destructive'>Oops, something went wrong</h2>
                <p className='text-xl mt-3'>{error}</p>
            </main>
        )
    }

    if (csrfToken) {
        return (
            <main className='wrapper'>
                <p>Verification Successful!</p>
                <Button asChild>
                    <Link href="/teacher/dashboard">
                        Login
                    </Link>
                </Button>
            </main>
        )
    }
}
