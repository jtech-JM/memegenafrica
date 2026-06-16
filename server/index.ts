import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "./config";
import { initSchema } from "./db/schema";
import { seedDatabase } from "./db/seed";
import { addLog } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes/index";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Schema is managed by Supabase migrations — this is a no-op
initSchema();

// Seed subscription plans if the table is empty
seedDatabase().catch((err: Error) =>
  addLog("Database", `Seed failed: ${err.message}`, "ERROR")
);

addLog("Gateway/API", `Express gateway starting on port ${config.port}`);

// All API routes
app.use("/api", apiRouter);

async function startServer() {
  if (config.nodeEnv !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Centralized error handler — must be registered last
  app.use(errorHandler);

  app.listen(config.port, "0.0.0.0", () => {
    addLog("Gateway/API", `Server ready on http://0.0.0.0:${config.port}`, "SUCCESS");
    console.log(`Server running on http://0.0.0.0:${config.port}`);
  });
}

startServer();
