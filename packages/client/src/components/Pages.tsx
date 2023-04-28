import { Pagination } from '@packages/server'
import Link from 'next/link'
import { useQueryString } from '../hooks/useQueryString'

export function Pages(props: { pagination: Pagination; totalInPage: number }) {
  const { pagination, totalInPage } = props

  const previousPage = pagination.getPreviousPage()
  const nextPage = pagination.getNextPage()
  const hasNextPage = totalInPage === pagination.take
  const queryString = useQueryString()

  return (
    <>
      {previousPage.skip > 0 && (
        <Link href={queryString.getUpdatedLink({ query: previousPage.toParams() })}>
          Previous ({previousPage.skip + 1}...{previousPage.skip + previousPage.take}){' '}
        </Link>
      )}
      {hasNextPage && (
        <Link href={queryString.getUpdatedLink({ query: nextPage.toParams() })}>
          Next ({nextPage.skip + 1}...{nextPage.skip + nextPage.take})
        </Link>
      )}
    </>
  )
}
