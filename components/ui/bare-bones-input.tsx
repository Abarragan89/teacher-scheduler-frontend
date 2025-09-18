'use client';
import * as React from "react"

export function BareInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            onClick={(e) => e.stopPropagation()} // prevent accordion toggle on click
            {...props}
            className={`bg-transparent outline-none border-none focus:ring-0 focus:outline-none w-fit ${props.className ?? ""}`}
        />
    )
}