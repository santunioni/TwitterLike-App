import { Profile } from '@packages/client/src/components/Profile'
import { getCurrentUser, trpc } from '@packages/client/src/utils/trpc'
import { useRouter } from 'next/router'
import { useState } from 'react'

function ProfileFetch({ username }: { username: string }) {
  const [following, setFollowing] = useState(false)
  const profileQuery = trpc.profiles.get.useQuery(
    { username },
    {
      onSuccess: data => {
        setFollowing(Boolean(data.profile.following))
      },
    },
  )
  const follow = trpc.profiles.follow.useMutation()
  const unfollow = trpc.profiles.unfollow.useMutation()

  const profileData = profileQuery.data
  if (!profileData) {
    return <div>Loading...</div>
  }

  const profile = profileData.profile
  const user = getCurrentUser()

  return (
    <>
      <Profile profile={profileData.profile}></Profile>
      {user && (
        <div>
          {following && (
            <p>
              Following{' '}
              <button onClick={() => unfollow.mutateAsync(profile, { onSuccess: () => setFollowing(false) })}>
                Unfollow
              </button>
            </p>
          )}
          {!following && (
            <p>
              Not following{' '}
              <button onClick={() => follow.mutateAsync(profile, { onSuccess: () => setFollowing(true) })}>
                Follow
              </button>
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { username } = router.query

  if (!username || Array.isArray(username)) {
    return <div>Profile {username} unknown!</div>
  }

  return <ProfileFetch username={username} />
}
