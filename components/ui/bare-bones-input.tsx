import * as React from "react"

export function BareInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            onClick={(e) => e.stopPropagation()} // prevent accordion toggle on click
            onInput={(e) => {
                // Auto-resize to fit content
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
            }}
            rows={1} // Start as single line
            {...props}
            style={{ fontSize: '16px', ...props.style }}
            className={`bg-transparent outline-none border-none focus:ring-0 focus:outline-none w-fit resize-none overflow-hidden ${props.className ?? ""}`}
        />
    )
}