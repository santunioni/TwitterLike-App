import styles from '@packages/client/src/styles/Home.module.css'
import { ProfileOutput } from '@packages/client/src/utils/trpc'
import Image from 'next/image'
import Link from 'next/link'
import { useQueryString } from '../hooks/useQueryString'

export function Profile(props: { profile: Omit<ProfileOutput, 'links'> }) {
  const { profile } = props

  const queryString = useQueryString()
  return (
    <>
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      <Image src={profile.image} alt={'Author Profile Picture'} className={styles.vercelLogo} width={100} height={24} />
      <h2>
        <Link
          href={queryString.getNewLink({
            pathname: 'search',
            query: {
              author: profile.username,
            },
          })}>
          Articles
        </Link>
      </h2>
    </>
  )
}
