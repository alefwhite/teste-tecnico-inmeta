import { describe, expect, it } from "vitest";
import { DocumentVersion } from "./document-version.entity";

describe("DocumentVersion", () => {
	it("creates a version with file metadata", () => {
		const version = DocumentVersion.create({
			documentId: "document-1",
			versionNumber: 1,
			fileName: "rg.pdf",
			fileSize: 1024,
			mimeType: "application/pdf",
			storageKey: "fake/rg.pdf",
			storageUrl: "/uploads/fake/rg.pdf",
		});

		expect(version.id).toBeTruthy();
		expect(version.documentId).toBe("document-1");
		expect(version.versionNumber).toBe(1);
		expect(version.fileName).toBe("rg.pdf");
		expect(version.fileSize).toBe(1024);
		expect(version.mimeType).toBe("application/pdf");
		expect(version.createdAt).toBeInstanceOf(Date);
	});
});
