import type { AppRouter } from '@packages/server/src/trpc/merged'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { inferReactQueryProcedureOptions } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export function setGlobalToken(token: string | null) {
  if (typeof window === 'undefined') {
    return
  }
  if (token) {
    localStorage.setItem('id_token', token)
  } else {
    localStorage.removeItem('id_token')
  }
}

export function decodeToken(token: string) {
  const [, payload] = token.split('.')
  return JSON.parse(Buffer.from(payload, 'base64').toString())
}

function getGlobalToken() {
  if (typeof window === 'undefined') {
    return
  }
  const token = localStorage.getItem('id_token')
  if (!token) {
    return token
  }
  const { exp } = decodeToken(token)
  if (Date.now() >= exp * 1000) {
    localStorage.removeItem('id_token')
    return null
  }
  return token
}

export function getCurrentUser() {
  const token = getGlobalToken()
  return token ? decodeToken(token) : null
}

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

export type ArticleOutput = RouterOutputs['articles']['getOne']['article']
export type ProfileOutput = RouterOutputs['profiles']['get']['profile']

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'}/trpc`,
          headers: () => {
            const token = getGlobalToken()
            return {
              ...ctx?.req?.headers,
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            }
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
})
