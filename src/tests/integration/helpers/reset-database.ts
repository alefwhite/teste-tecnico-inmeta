import { prisma } from "@/infrastructure/database/prisma";

export async function resetDatabase(): Promise<void> {
	await prisma.$executeRawUnsafe(
		"TRUNCATE TABLE collaborator_document_types, document_versions, documents, document_types, collaborators RESTART IDENTITY CASCADE",
	);
}
