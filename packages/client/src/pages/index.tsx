import { getCurrentUser } from '@packages/client/src/utils/trpc'
import Link from 'next/link'

export default function Home() {
  const isLogged = getCurrentUser() !== null
  return (
    <>
      <Link href="/feed">Feed</Link>
      <Link href="/search">Search</Link>
      {isLogged ? (
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
