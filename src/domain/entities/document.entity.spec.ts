import { describe, expect, it } from "vitest";
import { Document } from "./document.entity";

describe("Document", () => {
	it("creates a document bound to collaborator and type", () => {
		const document = Document.create({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
		});

		expect(document.id).toBeTruthy();
		expect(document.collaboratorId).toBe("collaborator-1");
		expect(document.documentTypeId).toBe("type-1");
		expect(document.deletedAt).toBeNull();
	});

	it("soft deletes by setting deletedAt", () => {
		const document = Document.create({
			collaboratorId: "collaborator-1",
			documentTypeId: "type-1",
		});

		document.softDelete();

		expect(document.deletedAt).toBeInstanceOf(Date);
	});
});
