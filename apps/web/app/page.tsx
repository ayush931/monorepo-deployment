import { prismaClient } from '@repo/database/client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const res = await prismaClient.user.findMany();

  return (
    <div>
      {JSON.stringify(res)}
      <div>
        Hello
      </div>
    </div>
  )
}