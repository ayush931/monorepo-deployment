import { prismaClient } from '@repo/database/client'

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