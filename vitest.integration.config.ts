import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL ??
	"postgresql://inmeta:inmeta_password@localhost:5432/inmeta_test?schema=public";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		globals: true,
		include: ["src/tests/integration/**/*.spec.ts"],
		globalSetup: ["./src/tests/integration/global-setup.ts"],
		fileParallelism: false,
		testTimeout: 30000,
		hookTimeout: 30000,
		env: {
			NODE_ENV: "test",
			DATABASE_URL: TEST_DATABASE_URL,
			JWT_SECRET: "test_jwt_secret",
		},
	},
});
