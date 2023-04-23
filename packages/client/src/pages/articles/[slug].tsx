import styles from '@packages/client/src/styles/Home.module.css'
import { trpc } from '@packages/client/src/utils/trpc'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function ArticlePage() {
  const router = useRouter()
  const { slug } = router.query
  if (!slug || Array.isArray(slug)) {
    return <div>Article {slug} unknown!</div>
  }
  const articleQuery = trpc.articles.getOne.useQuery({ slug })
  if (!articleQuery.data) {
    return <div>Loading...</div>
  }
  const article = articleQuery.data.article
  return (
    <>
      <h1>{article.title}</h1>
      <p>{article.description}</p>
      <p>{article.body}</p>
      <p>
        <a href={`/profiles/${article.author.username}`} target="_blank">
          {article.author.username}
          <Image
            src={article.author.image}
            alt={'Author Profile Picture'}
            className={styles.vercelLogo}
            width={100}
            height={24}
            target="_blank"
          />
        </a>
      </p>
    </>
  )
}
