"use client";
import { Button } from '@/components/ui/button';
import React from 'react'
import { callJavaAPI } from '@/lib/auth/utils';

export default function Profile() {


    async function createDayHandler() {

        try {
            const response = await callJavaAPI('/days/find-or-create', 'POST', { dayDate: "2025-03-12" })
            const data = await response.json();
            console.log('data ', data)
        } catch (error) {
            console.error("error ", error)
        }
    }

    async function getDaysHandler() {
        try {
            const response = await callJavaAPI('/days/get-all-days', 'GET')

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
