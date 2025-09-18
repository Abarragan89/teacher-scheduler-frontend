import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { CsrfProvider } from "@/providers/csrf-provider"

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teacher Scheduler",
  description: "Teacher scheduler",
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
          <CsrfProvider>
            {children}
          </CsrfProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
