import { beforeEach, describe, expect, it } from "vitest";
import type { PendingDocument } from "@/domain/repositories/documents.repository";
import { InMemoryDocumentsRepository } from "@/tests/fakes/in-memory-documents-repository";
import { ListPendingDocumentsUseCase } from "./list-pending-documents.use-case";

describe("ListPendingDocumentsUseCase", () => {
	let documentsRepository: InMemoryDocumentsRepository;
	let useCase: ListPendingDocumentsUseCase;

	beforeEach(() => {
		documentsRepository = new InMemoryDocumentsRepository();
		useCase = new ListPendingDocumentsUseCase(documentsRepository);
	});

	it("returns seeded pending documents", async () => {
		documentsRepository.seedPending([
			{
				collaborator: {
					id: "c-1",
					name: "Ana Souza",
					email: "ana@example.com",
				},
				documentType: { id: "t-1", name: "RG" },
				linkedAt: new Date(),
			},
		]);

		const result = await useCase.execute({ page: 1, limit: 10 });

		expect(result.data).toHaveLength(1);
		expect(result.data[0].collaborator.name).toBe("Ana Souza");
	});

	it("filters by search", async () => {
		const pending: PendingDocument[] = [
			{
				collaborator: {
					id: "c-1",
					name: "Ana Souza",
					email: "ana@example.com",
				},
				documentType: { id: "t-1", name: "RG" },
				linkedAt: new Date(),
			},
			{
				collaborator: { id: "c-2", name: "Bia Lima", email: "bia@example.com" },
				documentType: { id: "t-2", name: "CPF" },
				linkedAt: new Date(),
			},
		];

		documentsRepository.seedPending(pending);

		const result = await useCase.execute({ page: 1, limit: 10, search: "bia" });

		expect(result.data).toHaveLength(1);
		expect(result.data[0].collaborator.name).toBe("Bia Lima");
	});

	it("paginates results", async () => {
		const pending: PendingDocument[] = Array.from(
			{ length: 5 },
			(_, index) => ({
				collaborator: {
					id: `c-${index}`,
					name: `Colaborador ${index}`,
					email: `colaborador${index}@example.com`,
				},
				documentType: { id: "t-1", name: "RG" },
				linkedAt: new Date(),
			}),
		);

		documentsRepository.seedPending(pending);

		const result = await useCase.execute({ page: 2, limit: 2 });

		expect(result.data).toHaveLength(2);
		expect(result.meta).toMatchObject({ page: 2, total: 5, totalPages: 3 });
	});
});
