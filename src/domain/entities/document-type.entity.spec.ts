import { describe, expect, it } from "vitest";
import { DocumentType } from "./document-type.entity";

describe("DocumentType", () => {
	it("creates a document type with optional description", () => {
		const documentType = DocumentType.create({
			name: "RG",
			description: "Registro geral",
		});

		expect(documentType.id).toBeTruthy();
		expect(documentType.name).toBe("RG");
		expect(documentType.description).toBe("Registro geral");
		expect(documentType.deletedAt).toBeNull();
	});

	it("defaults description to null", () => {
		const documentType = DocumentType.create({ name: "CPF" });

		expect(documentType.description).toBeNull();
	});

	it("updates name and description", () => {
		const documentType = DocumentType.create({ name: "RG" });

		documentType.update({ name: "Identidade", description: null });

		expect(documentType.name).toBe("Identidade");
		expect(documentType.description).toBeNull();
		expect(documentType.updatedAt).toBeInstanceOf(Date);
	});

	it("soft deletes by setting deletedAt", () => {
		const documentType = DocumentType.create({ name: "RG" });

		documentType.softDelete();

		expect(documentType.deletedAt).toBeInstanceOf(Date);
	});
});
