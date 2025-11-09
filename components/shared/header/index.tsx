import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AuthenticatedNavLinks from './authenticated-nav-links'
import GuestNavLinks from './guest-nav-links'

export default function Header({
  isAuthenticated = false,
  email
}: {
  isAuthenticated?: boolean
  email?: string
}) {

  return (
    <header className="print:!hidden py-6 flex-between max-w-6xl mx-auto wrapper">
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
        <div className='text-xs mb-1 text-primary tracking-wider invisible sm:visible'>
          <p className='font-bold'>Teacher</p>
          <p>Scheduler</p>
        </div>
      </Link>


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
