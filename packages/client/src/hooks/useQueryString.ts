import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'

function createSearchParams(query: ParsedUrlQuery) {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (!value) {
      return acc
    }
    if (Array.isArray(value)) {
      value.forEach(val => acc.append(key, val))
      return acc
    }
    acc.append(key, value)

    return acc
  }, new URLSearchParams())
}

export function useQueryString() {
  const router = useRouter()
  return {
    getUpdatedLink: ({ pathname, query }: { pathname?: string; query?: ParsedUrlQuery }) =>
      `${pathname ?? router.pathname ?? ' '}?${createSearchParams({ ...router.query, ...query }).toString()}`,
    getNewLink: ({ pathname, query }: { pathname?: string; query?: ParsedUrlQuery }) =>
      `${pathname ?? router.pathname ?? ' '}?${createSearchParams({ ...query }).toString()}`,
  }
}
