import path from "path";
import { fileURLToPath } from "url";
import { build } from "vite";

// Build script for production deployment
// This script builds both the frontend and prepares for server deployment

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildClient() {
  console.log("🏗️  Building client...");

  const projectRoot = path.resolve(__dirname, "..");

  await build({
    root: path.resolve(projectRoot, "client"),
    build: {
      outDir: path.resolve(projectRoot, "dist/public"),
      emptyOutDir: true,
    },
    configFile: path.resolve(projectRoot, "client/vite.config.ts"),
  });

  console.log("✅ Client built successfully!");
  console.log("📁 Output directory: dist/public");
}

buildClient().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});

