import { getCurrentUser } from '@packages/client/src/utils/trpc'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    setUser(getCurrentUser())
  }, [])
  return (
    <>
      <Link href="/feed">Feed</Link>
      <Link href="/search">Search</Link>
      {Boolean(user) ? (
        <Link href="/me">Me</Link>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href={'/signup'}>Signup</Link>
        </>
      )}
    </>
  )
}
