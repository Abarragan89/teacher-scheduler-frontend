import Header from '@/components/shared/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, Smartphone, Share2, CheckSquare } from 'lucide-react';
import Image from 'next/image';
import SigninBtn from '@/components/signin-btn';

export default async function Home() {

  const cookieData = await cookies();
  const refreshCookie = cookieData.get("refresh_token")

  if (refreshCookie) {
    redirect("/dashboard")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen wrapper">

        {/* Hero Section */}
        <section className="relative pt-10 pb-16 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">

            {/* Text + CTAs */}
            <div className="flex flex-col gap-6 lg:w-1/2">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                Your daily schedule,{' '}
                <span className="text-primary">beautifully organized.</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-lg">
                Plan your day, share your schedule, and stay on top of everything — whether you&apos;re a teacher, parent, or anyone managing a busy day.
              </p>
              <div className="flex gap-4 flex-wrap">
                <SigninBtn isGetStarted={true} />
                <SigninBtn isSignInInHeader={true} />
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:w-1/2 w-full">
              <Image
                src="/images/hero.webp"
                alt="Hero Image"
                width={1200}
                height={750}
                className="w-full rounded-xl border border-border shadow-xl"
                priority
              />
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Everything you need, nothing you don&apos;t.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div className="rounded-xl border border-border bg-card p-6 flex gap-4">
              <div className="mt-1 text-primary shrink-0">
                <CalendarDays size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Daily Planning</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Build out your day with drag-and-drop schedule blocks. Rearrange items on the fly and move entire schedules between days with ease.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex gap-4">
              <div className="mt-1 text-primary shrink-0">
                <Smartphone size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Mobile Friendly</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your schedule looks great on any device. Pull it up on your phone throughout the day and check off tasks as you go.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex gap-4">
              <div className="mt-1 text-primary shrink-0">
                <Share2 size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Share a Live Link</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Copy a shareable link to any day&apos;s schedule. Anyone with the link can view it — no account needed. Great for sharing with students, parents, or colleagues.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex gap-4">
              <div className="mt-1 text-primary shrink-0">
                <CheckSquare size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Todos & Reminders</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Keep track of tasks across custom lists. Set recurring reminders so nothing slips through the cracks.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to get organized?</h2>
          <p className="text-muted-foreground mb-8 text-lg">It&apos;s free to get started.</p>
          <Button asChild size="lg" className="text-base px-10">
            <Link href="/sign-in">Create an Account</Link>
          </Button>
        </section>

        {/* Footer */}
        <footer className="border-t border-border text-muted-foreground text-sm text-center py-6 px-6">
          © {new Date().getFullYear()} Teacher Scheduler. All rights reserved.
        </footer>

      </main>
    </>
  );
}
