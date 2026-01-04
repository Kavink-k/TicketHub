import path from "path";
import { fileURLToPath } from "url";
import { build } from "vite";

// Build script for production deployment

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildClient() {
  console.log("🏗️  Building client...");

  const clientRoot = path.resolve(__dirname, "..");
  const projectRoot = path.resolve(clientRoot, "..");

  await build({
    root: clientRoot,
    build: {
      outDir: path.resolve(projectRoot, "dist/public"),
      emptyOutDir: true,
    },
    configFile: path.resolve(clientRoot, "vite.config.ts"),
  });

  console.log("✅ Client built successfully!");
  console.log("📁 Output directory: dist/public");
}

buildClient().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});

