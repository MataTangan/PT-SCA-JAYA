import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["node_modules", "dist", "tests/database/**"],
    coverage: {
      provider: "v8",
      include: ["src/backend/**/*.ts", "src/shared/**/*.ts"],
      exclude: ["src/shared/types/database.types.ts"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
