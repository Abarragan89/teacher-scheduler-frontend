import apiFetch from '@/lib/api-wrapper';
import { User } from '@/types/user';

export async function getAllUsers(): Promise<User[]> {
    // Fetch users
    const response = await apiFetch("users/allUsers")
    
    // throw error to be caught in the invocation 
    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
    }

    // Return Data
    const users = await response.json() as User[];
    return users;

}
