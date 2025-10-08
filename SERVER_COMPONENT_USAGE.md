# Updated Server Component Usage

Now that we've separated the server cookie logic, here's how to update your server components:

## Example: Daily Page Component

```typescript
// app/(protected)/dashboard/daily/[dateString]/page.tsx
import { callJavaAPI } from "@/lib/auth/utils";
import { getServerCookies } from "@/lib/auth/server-utils";
import { DayData } from "@/types/day";

interface pageProps {
  params: Promise<{
    dateString: string;
  }>;
}

export default async function page({ params }: pageProps) {
  const { dateString } = await params;

  // Get server cookies for API calls
  const { cookieHeader, csrfToken } = await getServerCookies();

  // Pass cookies explicitly to callJavaAPI
  const response = await callJavaAPI(
    "/days/find-or-create",
    "POST",
    { dayDate: dateString },
    cookieHeader,
    csrfToken
  );

  if (!response.ok) {
    throw new Error("Error loading day. Try again.");
  }

  const currentDay: DayData = await response.json();

  return <main className="wrapper">{/* Your component JSX */}</main>;
}
```

## Benefits

✅ **No force-dynamic needed** - Your layout can now be static
✅ **Explicit cookie handling** - Clear where cookies are used
✅ **Better performance** - Only pages that need auth access cookies
✅ **Easier debugging** - No hidden cookie access
