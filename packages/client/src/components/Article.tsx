import styles from '@packages/client/src/styles/Home.module.css'
import { ArticleOutput, trpc } from '@packages/client/src/utils/trpc'
import Link from 'next/link'

export function Article(props: ArticleOutput) {
  return (
    <>
      <article>
        <Link href={`/articles?slug=${props.slug}`}>
          <header>
            <h1>{props.title}</h1>
            <p className={styles.description}>{props.description}</p>
          </header>
        </Link>
        <style></style>
        <section>
          <p>{props.body}</p>
        </section>
        <footer>
          <ul className={styles.tags}>
            {props.tags.map(tag => (
              <li className={styles.tags} key={tag}>
                {tag}
              </li>
            ))}
          </ul>
          <p>
            Written by <a href={`/profiles?username=${props.author.username}`}>{props.author.username}</a>.
          </p>
        </footer>
      </article>
    </>
  )
}

function Comments(props: { slug: string }) {
  const comments = trpc.comments.getMany.useQuery({ slug: props.slug })
  if (!comments.data) {
    return <></>
  }
  return (
    <>
      {comments.data.comments.map(comment => (
        <>
          <p>
            {comment.body} - <a href={`/profile?username=${comment.author.username}`}>{comment.author.username}</a>
          </p>
        </>
      ))}
    </>
  )
}

export function ArticleWithComments(props: { slug: string }) {
  const [articleQuery, currentProfileQuery] = trpc.useQueries(t => [
    t.articles.getOne({ slug: props.slug }),
    t.profiles.getCurrent(),
  ])

  const currentProfileData = currentProfileQuery.data
  const articleQueryData = articleQuery.data

  if (!articleQueryData) {
    return <div>Loading...</div>
  }

  const article = articleQueryData.article
  const isAuthor = currentProfileData && currentProfileData.profile.username == article.author.username

  return (
    <>
      <Article {...article} />
      {isAuthor && <Link href={`/articles/edit?slug=${article.slug}`}>Edit</Link>}
      <Comments slug={article.slug} />
    </>
  )
}
