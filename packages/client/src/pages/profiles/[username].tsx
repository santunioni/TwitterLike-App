import styles from '@packages/client/src/styles/Home.module.css'
import { trpc } from '@packages/client/src/utils/trpc'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function ProfilePage() {
  const router = useRouter()
  const { username } = router.query
  if (!username || Array.isArray(username)) {
    return <div>Profile {username} unknown!</div>
  }
  const profileQuery = trpc.profiles.get.useQuery({ username }).data
  if (!profileQuery) {
    return <div>Loading...</div>
  }
  const profile = profileQuery.profile
  return (
    <>
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      <Image src={profile.image} alt={'Author Profile Picture'} className={styles.vercelLogo} width={100} height={24} />
      <h2>
        <a href={`/articles?author=${profile.username}`}>Articles</a>
      </h2>
    </>
  )
}
