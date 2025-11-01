import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teacher Scheduler",
  description: "Teacher scheduler",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased`}
      >
        <ThemeProvider attribute="class">
          <ScrollArea className="h-screen w-screen print:h-auto print:overflow-visible">
            {children}
          </ScrollArea>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
