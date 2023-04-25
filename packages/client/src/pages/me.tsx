import { Profile } from '@packages/client/src/components/Profile'
import { getCurrentUser, trpc } from '@packages/client/src/utils/trpc'
import Link from 'next/link'

function MeComponent() {
  const meQuery = trpc.profiles.getCurrent.useQuery()
  const meData = meQuery.data

  if (!meData) {
    return (
      <>
        <Link href={'/'}>Início</Link>
        <br />
        <Link href={'/login'}>Authenticate</Link>
      </>
    )
  }

  return (
    <>
      <Link href={'/'}>Início</Link>
      <Profile profile={meData.profile} />
    </>
  )
}

export default function Me() {
  const user = getCurrentUser()

  if (!user) {
    return (
      <>
        <Link href={'/'}>Início</Link>
        <br />
        <Link href={'/login'}>Authenticate</Link>
      </>
    )
  }

  return <MeComponent />
}
