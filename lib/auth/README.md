# Authentication System Documentation

## Overview

This unified authentication system handles JWT tokens, refresh tokens, and CSRF tokens for both server-side and client-side components, providing seamless integration with a Java Spring Boot backend.

## Architecture

```
📁 lib/auth/
├── auth-service.ts    # Main authentication functions
└── utils.ts          # Cookie and API utilities

📁 hooks/
└── use-auth.ts       # Client-side authentication hooks

📁 app/api/
├── session/route.ts  # Session management API
└── auth/logout/route.ts # Logout API
```

## Usage

### Server Components

```typescript
import { getServerSession } from "@/lib/auth/auth-service";

export default async function MyPage() {
  const authResult = await getServerSession();

  if (!authResult.authenticated) {
    redirect("/auth/login");
  }

  return <div>Welcome {authResult.user?.email}</div>;
}
```

### Client Components

```typescript
"use client";
import { useAuth, useLogout } from "@/hooks/use-auth";

export default function MyComponent() {
  const { authenticated, user, loading, refreshAuth } = useAuth();
  const { logout } = useLogout();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

#### Server-side

```typescript
import { callJavaAPI, getCsrfToken, cookiesToHeader } from "@/lib/auth/utils";
import { cookies } from "next/headers";

export async function myServerFunction() {
  const cookieStore = await cookies();
  const cookieHeader = cookiesToHeader(cookieStore.getAll());
  const csrfToken = getCsrfToken(cookieHeader);

  const response = await callJavaAPI(
    "/api/data",
    cookieHeader,
    csrfToken,
    "GET"
  );
  return response.json();
}
```

#### Client-side

```typescript
// Client-side API calls automatically include cookies
const response = await fetch("/api/session", {
  credentials: "include",
});
```

## Features

✅ **Automatic Token Refresh**: Handles JWT refresh automatically  
✅ **Cookie Management**: Proper forwarding and updating of cookies  
✅ **CSRF Protection**: Automatic CSRF token handling  
✅ **Server & Client Support**: Works in both environments  
✅ **Error Handling**: Comprehensive error states and logging  
✅ **Type Safety**: Full TypeScript support

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## API Endpoints

- `GET /api/session` - Check session and refresh if needed
- `POST /api/auth/logout` - Logout and clear session

## Error Handling

The system handles:

- Network errors
- Token expiration
- Invalid sessions
- CSRF token mismatches

All functions return consistent `AuthResponse` objects with error details when needed.
