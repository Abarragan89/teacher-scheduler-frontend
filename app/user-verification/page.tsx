"use client";
import React, { useEffect, useState } from 'react'
import { redirect, useSearchParams } from 'next/navigation';
import SigninBtn from '@/components/signin-btn';

export default function UserVerification() {

    const searchParams = useSearchParams();
    const token = searchParams.get('token')

    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true)


    async function verifyToken(): Promise<void> {
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

            setIsLoading(false)
        } catch (error) {
            console.error('erro validating ', error)
            setError("Validation Token is Expired")
        }
    }

    useEffect(() => {
        if (token) verifyToken();
    }, [token])

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                redirect('/dashboard')
            }, 1000);
        }
    }, [isLoading])

    return (
        <main className='wrapper'>

            {isLoading && !error && (
                <h3 className='text-center h3-bold'>Verifying User...</h3>
            )}

            {!isLoading && !error && (
                <div className='text-center'>
                    <h3 className='h3-bold text-ring'>Verification Successful!</h3>
                    <p className='mt-3 text-xl'>Redirecting to Dashboard...</p>
                </div>
            )}

            {error && (
                <div className="text-center">
                    <h3 className='h3-bold text-destructive'>Verification Unsuccessfull </h3>
                    <p className='my-3'>Magic Link expired. Please sign in again.</p>
                    <SigninBtn />
                </div>
            )}
        </main>

    )
}
