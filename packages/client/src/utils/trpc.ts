import type { AppRouter } from '@packages/server/src'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { inferReactQueryProcedureOptions } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

function getBaseUrl() {
  // if (typeof window !== 'undefined') {
  //   // browser should use relative path
  //   console.log('Using browser')
  //   return ''
  // }
  return 'http://localhost:3000'
}

export function authenticate(token: string) {
  const cookies = new Map<string, string>()
  document.cookie.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=')
    cookies.set(key, value)
  })
  cookies.set('token', token)
  document.cookie = Array.from(cookies.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

function getToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1]
}

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/trpc`,
          headers: () => {
            const token = getToken()
            return {
              ...ctx?.req?.headers,
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            }
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
