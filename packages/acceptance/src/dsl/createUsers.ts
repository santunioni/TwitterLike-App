import { AccountsDriver } from './AccountsDSL'
import { UserDriver } from './UserDriver'
import { UserDSL } from './UserDSL'
import { UserRestDriver } from './UserRestDriver'
import { UserTrpcDriver } from './UserTrpcDriver'

const driverClasses = {
  trpc: UserTrpcDriver,
  rest: UserRestDriver,
} as const

export function createDriver(): UserDriver {
  const DRIVER = process.env.DRIVER?.toLowerCase()
  const DriverClass = driverClasses[DRIVER as keyof typeof driverClasses]
  if (!DriverClass) {
    throw new Error(`Unknown driver: ${DRIVER}`)
  }
  return new DriverClass()
}

export async function createAccounts() {
  const accounts = new AccountsDriver()
  await Promise.all(['abbott', 'costello'].map(username => accounts.upsert(username)))

  return () => {
    const ctx = {}

    const abbott = new UserDSL(createDriver(), ctx, 'abbott')
    const costello = new UserDSL(createDriver(), ctx, 'costello')
    const guest = new UserDSL(createDriver(), ctx)

    return {
      abbott,
      costello,
      guest,
    }
  }
}

export type CreateUsers = Awaited<ReturnType<typeof createAccounts>>
