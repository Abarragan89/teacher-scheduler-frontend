"use client";
import { Button } from '@/components/ui/button';
import React from 'react'
// import { useCsrf } from "@/providers/csrf-provider";
import apiFetch from '@/lib/api-wrapper';

export default function Profile() {

    // const { csrfToken } = useCsrf();
    function getCsrfFromCookie() {
        const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return m ? decodeURIComponent(m[1]) : "";
    }

    async function createDayHandler() {
        try {
            const response = await apiFetch(`days/find-or-create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": getCsrfFromCookie() || "",
                },
                body: JSON.stringify({
                    dayDate: "2025-03-12"
                })
            })

            const data = await response.json();
            console.log('data ', data)


        } catch (error) {
            console.error("error ", error)
        }
    }
    async function getDaysHandler() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/days/get-all-days`, {
                credentials: "include"
            })

            const data = await response.json();

            console.log('data ', data)

        } catch (error) {
            console.error("error ", error)
        }
    }

    return (
        <main className="wrapper">
            <Button onClick={createDayHandler}>
                Create Day
            </Button>
            <Button onClick={getDaysHandler}>
                Get Days
            </Button>
        </main>
    )
}
