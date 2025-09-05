import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
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
