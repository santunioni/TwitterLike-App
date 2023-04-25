import { trpc } from '@packages/client/src/utils/trpc'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

function ArticleEdit({ slug }: { slug: string }) {
  const [article, setArticle] = useState({} as { title?: string; description?: string; body?: string; tags?: string[] })
  const mutateArticle = trpc.articles.update.useMutation()

  const [articleQuery, profileQuery] = trpc.useQueries(t => [
    t.articles.getOne(
      { slug },
      {
        onSuccess: data => {
          setArticle(data.article)
        },
        refetchOnMount: true,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    ),
    t.profiles.getCurrent(),
  ])

  if (!profileQuery.data) {
    return <Link href={'/login'}>Authenticate</Link>
  }
  if (!articleQuery.data) {
    return <div>Loading...</div>
  }
  const isAuthor = articleQuery.data.article.author.username === profileQuery.data.profile.username
  if (!isAuthor) {
    return (
      <div>
        <Link href={'/'}>Home</Link>
        <p>You are not the author.</p>
      </div>
    )
  }

  return (
    <div>
      <Link href={'/'}>Home</Link>
      <form
        onSubmit={event => {
          event.preventDefault()
          mutateArticle.mutateAsync({ slug, changes: article }).then(data => {
            setArticle(data.article)
          })
        }}>
        <div id={'title'}>
          <p>Title</p>
          <p>
            <textarea
              value={article.title}
              onChange={e => setArticle(previous => ({ ...previous, title: e.target.value }))}
            />
          </p>
        </div>
        <div id={'description'}>
          <p>Description</p>
          <p>
            <textarea
              value={article.description}
              onChange={e => setArticle(previous => ({ ...previous, description: e.target.value }))}
            />
          </p>
        </div>
        <div id={'body'}>
          <p>Body</p>
          <p>
            <textarea
              value={article.body}
              onChange={e => setArticle(previous => ({ ...previous, body: e.target.value }))}
            />
          </p>
        </div>
        <button type={'submit'}>Save</button>
      </form>
    </div>
  )
}

export default function ArticleEditPage() {
  const { slug } = useRouter().query
  const Back = () => <a href={'/feed'}>Back</a>
  if (!slug || Array.isArray(slug)) {
    return <Back />
  }
  return <ArticleEdit slug={slug} />
}
