"use client";
import { Button } from '@/components/ui/button'
import apiFetch from '@/lib/api-wrapper';
import React, { useState } from 'react'

type User = {
  id: string
  email: string
  username: string
}

export default function Dashboard() {

  const [users, setUsers] = useState<User[]>([])

  async function getUsers(): Promise<void> {
    try {
      const response = await apiFetch("users/allUsers")
      console.log('response ', response)
      const users = await response.json();
      setUsers(users)
    } catch (err) {
        console.error('error getting users ', err);
    }
  }

  return (
    <>
      <Button onClick={getUsers}>
        Get User
      </Button>

      {users && users.length > 0 && users.map((user: User) => (
        <div key={user.id}>
          <p>{user.email}</p>
        </div>
      ))}
    </>
  )
}
