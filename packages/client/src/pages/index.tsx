import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Link href="/feed">Feed</Link>
      <Link href="/search">Search</Link>
      <Link href="/login">Login</Link>
      <Link href="/me">Me</Link>
    </>
  )
}
