'use client'
// import Header from '@/components/shared/header'
import SigninBtn from '@/components/signin-btn'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Error({
    error,
}: {
    error: Error & { digest?: string }
}) {

    const router = useRouter();

    return (
        <>
            {/* <Header /> */}
            <main className='flex flex-col justify-center items-center mt-10 gap-y-3'>
                <h3 className='h3-bold text-destructive'>Something went wrong!</h3>
                <p>{error.message}</p>
                <div className="flex-center space-x-5 mt-5">
                    <SigninBtn />
                    <Button onClick={() => router.push("/")}>
                        Home
                    </Button>
                </div>
            </main>
        </>
    )
}