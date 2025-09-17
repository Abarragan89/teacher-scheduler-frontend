import React from 'react'

export default async function Profile() {

    async function waitSome() {
        await new Promise((resolve) => setTimeout(resolve, 10000))
    }

    await waitSome();

    return (
        <div>Profile</div>
    )
}
