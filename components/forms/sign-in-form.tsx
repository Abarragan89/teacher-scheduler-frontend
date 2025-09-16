"use client"
import React from 'react'
import { z } from "zod"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    email: z.email("Please enter a valid email")
})

export default function SigninForm() {

    const [showConfirmation, setShowConfirmation] = useState<boolean>(false)

    // 1. Define your form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const { isSubmitting } = form.formState


    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/magic-link-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: values.email
                }),
                credentials: "include"
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            setShowConfirmation(true)
        } catch (err) {
            console.error("Magic link request failed:", err);
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem aria-required>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {showConfirmation && (
                    <p className='text-center text-sm text-ring mb-2 -mt-5'>An email has been sent to your email. Check your spam folder</p>
                )}
                {!showConfirmation && (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                )}
            </form>
        </Form>
    )
}

