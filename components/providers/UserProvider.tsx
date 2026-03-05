'use client'
import { createContext, useContext } from 'react'

interface UserContextType {
    userId: string
    email: string
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({
    userId,
    email,
    children
}: UserContextType & { children: React.ReactNode }) {
    return (
        <UserContext.Provider value={{ userId, email }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error('useUser must be used within a UserProvider')
    return context
}
