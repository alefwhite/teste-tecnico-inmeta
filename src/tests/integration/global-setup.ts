import { execSync } from "node:child_process";

const defaultTestDatabaseUrl =
	"postgresql://inmeta:inmeta_password@localhost:5432/inmeta_test?schema=public";

export default async function globalSetup(): Promise<void> {
	const databaseUrl =
		process.env.TEST_DATABASE_URL ??
		process.env.DATABASE_URL ??
		defaultTestDatabaseUrl;

	execSync("node node_modules/prisma/build/index.js migrate deploy", {
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: "inherit",
	});
}
