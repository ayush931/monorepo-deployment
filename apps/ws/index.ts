import { prismaClient } from "@repo/database/client"

Bun.serve({
  port: 8081,
  fetch(req, server) {
    // upgrade the request to the websocket
    if (server.upgrade(req)) {
      return // do not return the res
    }

    return new Response("Upgrade failed", { status: 500 })
  },

  websocket: {
    message(ws, message) {
      prismaClient.user.create({
        data: {
          username: Math.random().toString(),
          password: Math.random().toString()
        }
      })

      ws.send(message)
    }
  }
})