"use client";
import React from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { ResponsiveDialog } from './responsive-dialog'
import SigninForm from './forms/sign-in-form';

export default function SigninBtn({
    variant = 'default'
}: {
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
}) {

    const [openModal, setOpenModal] = useState<boolean>(false)

    return (

        <>
            <Button variant={variant} onClick={() => setOpenModal(true)}>
                Sign In
            </Button>
            <ResponsiveDialog
                title='Sign In'
                isOpen={openModal}
                setIsOpen={setOpenModal}
                description={"Join Teacher Scheduler for free!"}
                hideDescription={true}
            >
                <SigninForm />
            </ResponsiveDialog>
        </>
    )
}
