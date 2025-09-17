"use client";
import { Button } from '@/components/ui/button'
import { getAllUsers } from '@/services/userService';
import { User } from '@/types/user';
import React, { useState } from 'react'

export default function Dashboard() {

  const [users, setUsers] = useState<User[]>([])

  async function getUsers(): Promise<void> {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers)
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
