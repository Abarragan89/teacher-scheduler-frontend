"use client";
import { Button } from '@/components/ui/button';
import React from 'react'
import { clientDays } from '@/lib/api/services/days';

export default function Profile() {



    async function createDayHandler() {
        try {
            const data = await clientDays.createDay("2025-03-12");
            console.log('data ', data)
        } catch (error) {
            console.error("error ", error)
        }
    }

    async function getDaysHandler() {
        try {
            const data = await clientDays.getAllDays();
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
            <h1>This is your profile</h1>
        </main>
    )
}
