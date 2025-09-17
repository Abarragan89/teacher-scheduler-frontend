"use client";
import React from 'react'
import { HashLoader } from "react-spinners"

export default function loading() {

    return (
        <main className='wrapper flex-center mt-40'>
            <HashLoader
                color={'#6A57C8'}
            />
        </main>
    )
}
