import * as React from "react"

export function BareInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Auto-resize function
    const autoResize = React.useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 'px'
        }
    }, [])

    // Resize on mount and when value changes
    React.useEffect(() => {
        autoResize()
    }, [props.value, autoResize])

    // Also resize after render (for cases where content is set programmatically)
    React.useLayoutEffect(() => {
        autoResize()
    })

    return (
        <textarea
            ref={textareaRef}
            onClick={(e) => e.stopPropagation()} // prevent accordion toggle on click
            onInput={(e) => {
                // Auto-resize to fit content
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'

                // Call original onInput if provided
                if (props.onInput) {
                    props.onInput(e)
                }
            }}
            rows={1} // Start as single line
            {...props}
            style={{ fontSize: '16px', ...props.style }}
            className={`bg-transparent outline-none leading-5.5 border-none focus:ring-0 focus:outline-none w-fit resize-none overflow-hidden ${props.className ?? ""}`}
        />
    )
}