import express, { type Request, type Response } from "express";
import { prismaClient } from "@repo/database/client";

const app = express();
app.use(express.json());

// 0) Create a user
// Body: { "username": "alice", "password": "secret123" }
app.post("/users", async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as { username?: unknown; password?: unknown };

  const username = body.username;
  const password = body.password;

  if (typeof username !== "string" || username.trim().length === 0) {
    return res.status(400).json({ error: "username is required" });
  }
  if (typeof password !== "string" || password.trim().length === 0) {
    return res.status(400).json({ error: "password is required" });
  }

  const user = await prismaClient.user.create({
    data: {
      username: username.trim(),
      password: password.trim(),
    },
  });

  return res.status(201).json({
    id: user.id,
    username: user.username,
    password: user.password
  });
});

// 1) List todos
// Optional: filter by userId -> /todos?userId=abc
app.get("/todos", async (req: Request, res: Response) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;

  const todos = await prismaClient.todo.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { id: "desc" },
  });

  return res.json(todos);
});

// 2) Create a todo
// Body: { "task": "buy milk", "userId": "..." }
app.post("/todos", async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as { task?: unknown; userId?: unknown; done?: unknown };

  const task = body.task;
  const userId = body.userId;
  const done = body.done;

  if (typeof task !== "string" || task.trim().length === 0) {
    return res.status(400).json({ error: "task is required" });
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    return res.status(400).json({ error: "userId is required" });
  }

  const todo = await prismaClient.todo.create({
    data: {
      task: task.trim(),
      userId: userId.trim(),
      done: typeof done === "boolean" ? done : false,
    },
  });

  return res.status(201).json(todo);
});

// 3) Delete a todo
app.delete("/todos/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || id.trim().length === 0) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const deleted = await prismaClient.todo.delete({ where: { id } });
    return res.json(deleted);
  } catch {
    return res.status(404).json({ error: "todo not found" });
  }
});

const port = 5000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TODO API listening on http://localhost:${port}`);
});
if (typeof server.ref === "function") {
  server.ref();
}
const keepAliveTimer = setInterval(() => {
  // Intentionally empty: prevents premature process exit in some Bun/Express setups.
}, 60_000);

// Keep an explicit server reference in Bun and close cleanly on termination.
const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}. Shutting down backend server...`);
  clearInterval(keepAliveTimer);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
