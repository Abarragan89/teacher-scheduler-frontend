"use client";
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation';
import SigninBtn from '@/components/signin-btn';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function UserVerificationInner() {

    const searchParams = useSearchParams();
    const token = searchParams.get('token')

    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isIOS, setIsIOS] = useState<boolean>(false)

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    }, [])

    useEffect(() => {
        if (!token) return

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
                    setIsLoading(false)
                    return
                }

                setIsLoading(false)
            } catch (error) {
                console.error('error validating ', error)
                setError("Validation Token is Expired")
                setIsLoading(false)
            }
        }

        verifyToken()
    }, [token])

    return (
        <main className='wrapper'>

            {isLoading && !error && (
                <h3 className='text-center h3-bold'>Verifying User...</h3>
            )}

            {!isLoading && !error && (
                <div className='text-center'>
                    <h3 className='h3-bold text-ring'>Verification Successful!</h3>
                    <p className='mt-3 text-xl'>You&apos;re signed in.</p>
                    <Button asChild className='mt-6 px-8' size='lg'>
                        <Link href='/dashboard'>Open App</Link>
                    </Button>
                    {isIOS && (
                        <p className='mt-4 text-sm text-muted-foreground max-w-xs mx-auto'>
                            Already have the app installed? Return to it from your home screen — you&apos;re already signed in.
                        </p>
                    )}
                </div>
            )}

            {error && (
                <div className="text-center">
                    <h3 className='h3-bold text-destructive'>Verification Unsuccessful</h3>
                    <p className='my-3'>Magic Link expired. Please sign in again.</p>
                    <SigninBtn />
                </div>
            )}
        </main>
    )
}

export default function UserVerification() {
    return (
        <Suspense>
            <UserVerificationInner />
        </Suspense>
    )
}
