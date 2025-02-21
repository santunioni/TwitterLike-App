import { getApiBaseUrl, getCurrentUser, setGlobalToken } from '@packages/client/src/utils/trpc'
import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'

const zodEmail = z.string().email()

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(getCurrentUser())

  const isInvalidEmail = Boolean(email) && !zodEmail.safeParse(email).success

  async function handleSubmit(event) {
    event.preventDefault()
    const fetchReturn = await fetch(`${getApiBaseUrl()}/api/accounts/signup`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        user: {
          email,
          password,
        },
      }),
    })
    const { access_token } = await fetchReturn.json()
    if (fetchReturn.status === 401) {
      window.alert('Invalid credentials')
      return
    }
    if (!fetchReturn.ok) {
      window.alert('Something went wront :(')
      return
    }
    setGlobalToken(access_token)
    setUser(getCurrentUser())
  }

  if (user) {
    return (
      <>
        <div>Logged as {user.email}</div>
        <button onClick={() => window.history.go(-1)}>Back</button>
      </>
    )
  }

  return (
    <>
      <Link href={'/'}>Início</Link>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" value={email} onChange={event => setEmail(event.target.value)} />
            <>{isInvalidEmail && 'Invalid Email'}</>
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={event => setPassword(event.target.value)} />
          </div>
          <button onClick={() => window.history.go(-1)}>Back</button>
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}
