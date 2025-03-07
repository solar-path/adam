import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

const app = new Hono();
app.use(logger());

// Serve static files
app.use("/static/*", serveStatic({ root: "./public" }));

// Serve index.html at root
app.get("/", serveStatic({ path: './public/index.html'}));

export default app;