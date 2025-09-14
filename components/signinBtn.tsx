"use client";
import React from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { ResponsiveDialog } from './responsive-dialog'

export default function SigninBtn() {

    const [openModal, setOpenModal] = useState<boolean>(false)

    return (

        <>
            <Button asChild onClick={() => setOpenModal(true)}>
                Sign In
            </Button>
            <ResponsiveDialog
                title='Sign In'
                isOpen={openModal}
                setIsOpen={setOpenModal}
            >
                <p>Sign in form here...</p>
            </ResponsiveDialog>
        </>
    )
}
