import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
});
