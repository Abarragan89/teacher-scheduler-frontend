"use client";
import React from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { ResponsiveDialog } from './responsive-dialog'
import SigninForm from './forms/sign-in-form';

export default function SigninBtn({
    isGetStarted = false,
    isSignInInHeader = false
}: {
    isGetStarted?: boolean
    isSignInInHeader?: boolean
}) {

    const [openModal, setOpenModal] = useState<boolean>(false)

    return (

        <>
            <ResponsiveDialog
                title='Sign In'
                isOpen={openModal}
                setIsOpen={setOpenModal}
                description={"Join Teacher Scheduler for free!"}
                hideDescription={true}
            >
                <SigninForm />
            </ResponsiveDialog>

            {isGetStarted && (
                <Button onClick={() => setOpenModal(true)} size="lg" className="text-base px-8">
                    Get Started Free
                </Button>
            )}
            {isSignInInHeader && (
                <Button onClick={() => setOpenModal(true)} size="lg" variant="outline" className="text-base px-8">
                    Sign Up
                </Button>
            )}
            {!isGetStarted && !isSignInInHeader && (
                <Button onClick={() => setOpenModal(true)} variant="outline" size="sm" className="text-sm">
                    Sign In
                </Button>
            )}
        </>
    )
}
