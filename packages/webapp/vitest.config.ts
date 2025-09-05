import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["text", "json", "html"],
			lines: 80,
			functions: 80,
			branches: 80,
			statements: 80,
		},
	},
});
