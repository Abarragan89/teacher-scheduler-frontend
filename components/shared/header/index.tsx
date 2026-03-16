import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AuthenticatedNavLinks from './authenticated-nav-links'
import GuestNavLinks from './guest-nav-links'
import InstallPrompt from '@/components/install-prompt'

export default function Header({
  isAuthenticated = false,
  email
}: {
  isAuthenticated?: boolean
  email?: string
}) {

  return (
    <header className="print:hidden! flex-between mx-auto wrapper">
      <div className='flex-center gap-x-2'>
        <Link
          href={"/"}
          className='flex justify-center items-end'
        >
          <Image
            src={'/images/logo.png'}
            height={45}
            width={45}
            alt="Company Logo"
            priority
          />
          <div className='text-xs mb-1 text-primary tracking-wider hidden sm:block'>
            <p className='font-bold'>Teacher</p>
            <p>Scheduler</p>
          </div>
        </Link>
        {isAuthenticated && (
          <InstallPrompt />
        )}
      </div>



      {/* Navigation Link */}
      {isAuthenticated ? (
        <AuthenticatedNavLinks
          email={email || 'guest'}
        />
      ) : (
        <GuestNavLinks />
      )}
    </header>
  )
}
