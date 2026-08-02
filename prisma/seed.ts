import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const TEST_PASSWORD = "secret123";

const collaborators = [
	{
		id: "a80b4e88-3ed6-4320-8cf8-1d7b31a5d1fc",
		name: "Ana Souza",
		email: "ana@example.com",
	},
	{
		id: "29fe9fe5-1f72-4c9c-8cf0-451ae7c0b92d",
		name: "Bia Lima",
		email: "bia@example.com",
	},
];

const documentTypes = [
	{
		id: "1ee8b727-f89e-4a2f-b100-62d1ef765112",
		name: "RG",
		description: "Registro Geral",
	},
	{
		id: "1cd9af08-38e0-491c-8945-5997c03849cc",
		name: "CPF",
		description: "Cadastro de Pessoas Físicas",
	},
	{
		id: "e85b854b-5164-4f8a-a466-172e6a97c923",
		name: "CNH",
		description: "Carteira Nacional de Habilitação",
	},
	{
		id: "361fe617-26a4-43ff-95af-768aa1fcf3c7",
		name: "Comprovante de Residência",
		description: "Comprovante de endereço",
	},
];

const links = [
	{ collaboratorId: collaborators[0].id, documentTypeId: documentTypes[0].id },
	{ collaboratorId: collaborators[0].id, documentTypeId: documentTypes[1].id },
	{ collaboratorId: collaborators[0].id, documentTypeId: documentTypes[2].id },
	{ collaboratorId: collaborators[1].id, documentTypeId: documentTypes[0].id },
	{ collaboratorId: collaborators[1].id, documentTypeId: documentTypes[1].id },
];

const documents = [
	{
		id: "35e7ec6c-c4db-4e97-a608-79481d0f6531",
		collaboratorId: collaborators[0].id,
		documentTypeId: documentTypes[0].id,
		versions: [
			{
				versionNumber: 1,
				fileName: "ana-rg.pdf",
				fileSize: 15360,
				mimeType: "application/pdf",
			},
		],
	},
	{
		id: "3f4e52e9-3758-4130-8c6e-10cf24a63fe1",
		collaboratorId: collaborators[0].id,
		documentTypeId: documentTypes[1].id,
		versions: [
			{
				versionNumber: 1,
				fileName: "ana-cpf.pdf",
				fileSize: 12288,
				mimeType: "application/pdf",
			},
			{
				versionNumber: 2,
				fileName: "ana-cpf-v2.pdf",
				fileSize: 20480,
				mimeType: "application/pdf",
			},
		],
	},
	{
		id: "9f55ce11-94fc-4432-841d-b6de86193cfd",
		collaboratorId: collaborators[1].id,
		documentTypeId: documentTypes[0].id,
		versions: [
			{
				versionNumber: 1,
				fileName: "bia-rg.pdf",
				fileSize: 10240,
				mimeType: "application/pdf",
			},
		],
	},
];

async function main() {
	const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

	for (const collaborator of collaborators) {
		await prisma.collaborators.upsert({
			where: { id: collaborator.id },
			update: { name: collaborator.name, email: collaborator.email },
			create: {
				id: collaborator.id,
				name: collaborator.name,
				email: collaborator.email,
				password: passwordHash,
			},
		});
	}

	for (const documentType of documentTypes) {
		await prisma.documentTypes.upsert({
			where: { id: documentType.id },
			update: {
				name: documentType.name,
				description: documentType.description,
			},
			create: documentType,
		});
	}

	for (const link of links) {
		await prisma.collaboratorDocumentTypes.upsert({
			where: {
				collaboratorId_documentTypeId: {
					collaboratorId: link.collaboratorId,
					documentTypeId: link.documentTypeId,
				},
			},
			update: {},
			create: link,
		});
	}

	for (const document of documents) {
		await prisma.documents.upsert({
			where: {
				collaboratorId_documentTypeId: {
					collaboratorId: document.collaboratorId,
					documentTypeId: document.documentTypeId,
				},
			},
			update: { deletedAt: null },
			create: {
				id: document.id,
				collaboratorId: document.collaboratorId,
				documentTypeId: document.documentTypeId,
			},
		});

		for (const version of document.versions) {
			const storageKey = `seed/${document.collaboratorId}/${version.fileName}`;
			await prisma.documentVersions.upsert({
				where: {
					documentId_versionNumber: {
						documentId: document.id,
						versionNumber: version.versionNumber,
					},
				},
				update: {
					fileName: version.fileName,
					fileSize: version.fileSize,
					mimeType: version.mimeType,
					storageKey,
					storageUrl: `/uploads/${storageKey}`,
				},
				create: {
					documentId: document.id,
					versionNumber: version.versionNumber,
					fileName: version.fileName,
					fileSize: version.fileSize,
					mimeType: version.mimeType,
					storageKey,
					storageUrl: `/uploads/${storageKey}`,
				},
			});
		}
	}

	console.log(
		"✅ Seed concluído. Usuário de teste: ana@example.com / secret123",
	);
}

main()
	.catch((error) => {
		console.error("❌ Erro ao executar seed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
