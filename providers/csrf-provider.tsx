"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react'

type CsrfContextType = {
    csrfToken: string | null
    setCsrfToken: (token: string | null) => void
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export function CsrfProvider({children}: {children: ReactNode}) {

    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    return (
        <CsrfContext.Provider value={{ csrfToken, setCsrfToken}}>
            {children}
        </CsrfContext.Provider>
    )
}

export function useCsrf() {
    const context = useContext(CsrfContext)
    if(!context) {
        throw new Error('useCsrf must be used inside a CsrfProvider')
    }
    return context;
}
