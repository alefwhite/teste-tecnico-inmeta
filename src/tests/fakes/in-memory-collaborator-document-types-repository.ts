import { CollaboratorDocumentType } from "@/domain/entities/collaborator-document-type.entity";
import type { CollaboratorDocumentTypesRepository } from "@/domain/repositories/collaborator-document-types.repository";

export class InMemoryCollaboratorDocumentTypesRepository
	implements CollaboratorDocumentTypesRepository
{
	private links = new Map<string, CollaboratorDocumentType>();

	async create(data: {
		collaboratorId: string;
		documentTypeId: string;
	}): Promise<CollaboratorDocumentType> {
		const link = CollaboratorDocumentType.create(data);

		this.links.set(link.id, link);

		return link;
	}

	async findByCollaboratorAndDocumentType(
		collaboratorId: string,
		documentTypeId: string,
	): Promise<CollaboratorDocumentType | null> {
		for (const link of this.links.values()) {
			if (
				link.collaboratorId === collaboratorId &&
				link.documentTypeId === documentTypeId
			) {
				return link;
			}
		}

		return null;
	}

	async unlink(collaboratorId: string, documentTypeId: string): Promise<void> {
		for (const [id, link] of this.links) {
			if (
				link.collaboratorId === collaboratorId &&
				link.documentTypeId === documentTypeId
			) {
				this.links.delete(id);
			}
		}
	}
}
