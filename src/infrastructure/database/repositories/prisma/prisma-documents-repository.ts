import { Document } from "@/domain/entities/document.entity";
import { DocumentVersion } from "@/domain/entities/document-version.entity";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found-error";
import type {
	CollaboratorDocument,
	DocumentsRepository,
	DocumentWithLatestVersion,
	FindManyCollaboratorDocumentsParams,
	FindManyPendingDocumentsParams,
	PendingDocument,
	SubmitDocumentInput,
	SubmitDocumentResult,
} from "@/domain/repositories/documents.repository";
import { Prisma } from "@/generated/prisma/client";
import type { DocumentsModel } from "@/generated/prisma/models/Documents";
import type { DocumentVersionsModel } from "@/generated/prisma/models/DocumentVersions";
import { prisma } from "@/infrastructure/database/prisma";
import { buildPaginationMeta, type Paginated } from "@/shared/types/pagination";

interface PendingDocumentRow {
	collaboratorId: string;
	collaboratorName: string;
	collaboratorEmail: string;
	documentTypeId: string;
	documentTypeName: string;
	linkedAt: Date;
}

interface PendingCountRow {
	total: bigint;
}

interface CollaboratorDocumentRow {
	documentId: string;
	documentTypeId: string;
	documentTypeName: string;
	versionId: string;
	versionNumber: number;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storageKey: string;
	storageUrl: string;
	createdAt: Date;
}

export class PrismaDocumentsRepository implements DocumentsRepository {
	async submit(data: SubmitDocumentInput): Promise<SubmitDocumentResult> {
		const {
			collaboratorId,
			documentTypeId,
			fileName,
			fileSize,
			mimeType,
			storageKey,
			storageUrl,
		} = data;

		return prisma.$transaction(async (tx) => {
			// Serializes concurrent submissions of the same document (collaborator + type).
			await tx.$queryRaw`
				SELECT id FROM collaborators WHERE id = ${collaboratorId} FOR UPDATE
			`;

			const existing = await tx.documents.findUnique({
				where: {
					collaboratorId_documentTypeId: {
						collaboratorId,
						documentTypeId,
					},
				},
			});

			let document: DocumentsModel;
			if (!existing) {
				document = await tx.documents.create({
					data: { collaboratorId, documentTypeId },
				});
			} else if (existing.deletedAt) {
				document = await tx.documents.update({
					where: { id: existing.id },
					data: { deletedAt: null },
				});
			} else {
				document = existing;
			}

			const lastVersion = await tx.documentVersions.findFirst({
				where: { documentId: document.id },
				orderBy: { versionNumber: "desc" },
			});

			const version = await tx.documentVersions.create({
				data: {
					documentId: document.id,
					versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
					fileName,
					fileSize,
					mimeType,
					storageKey,
					storageUrl,
				},
			});

			return {
				document: DocumentMapper.toDomain(document),
				version: DocumentVersionMapper.toDomain(version),
			};
		});
	}

	async findById(id: string): Promise<Document | null> {
		const document = await prisma.documents.findFirst({
			where: { id, deletedAt: null },
		});

		return document ? DocumentMapper.toDomain(document) : null;
	}

	async findWithLatestVersion(
		id: string,
	): Promise<DocumentWithLatestVersion | null> {
		const document = await prisma.documents.findFirst({
			where: { id, deletedAt: null },
			include: {
				versions: { orderBy: { versionNumber: "desc" }, take: 1 },
			},
		});

		if (!document || document.versions.length === 0) {
			return null;
		}

		return {
			document: DocumentMapper.toDomain(document),
			latestVersion: DocumentVersionMapper.toDomain(document.versions[0]),
		};
	}

	async findVersions(documentId: string): Promise<DocumentVersion[]> {
		const versions = await prisma.documentVersions.findMany({
			where: { documentId },
			orderBy: { versionNumber: "asc" },
		});

		return versions.map(DocumentVersionMapper.toDomain);
	}

	async softDelete(id: string): Promise<Document> {
		const existing = await prisma.documents.findFirst({
			where: { id, deletedAt: null },
		});

		if (!existing) {
			throw new ResourceNotFoundError("Document not found");
		}

		const document = await prisma.documents.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		return DocumentMapper.toDomain(document);
	}

	async findManyByCollaborator(
		params: FindManyCollaboratorDocumentsParams,
	): Promise<Paginated<CollaboratorDocument>> {
		const { collaboratorId, page, limit } = params;
		const offset = (page - 1) * limit;

		const [rows, countRows] = await Promise.all([
			prisma.$queryRaw<CollaboratorDocumentRow[]>`
				SELECT
					d.id AS "documentId",
					d.document_type_id AS "documentTypeId",
					dt.name AS "documentTypeName",
					dv.id AS "versionId",
					dv.version_number AS "versionNumber",
					dv.file_name AS "fileName",
					dv.file_size AS "fileSize",
					dv.mime_type AS "mimeType",
					dv.storage_key AS "storageKey",
					dv.storage_url AS "storageUrl",
					dv.created_at AS "createdAt"
				FROM documents d
				JOIN document_types dt
					ON dt.id = d.document_type_id AND dt.deleted_at IS NULL
				JOIN LATERAL (
					SELECT *
					FROM document_versions
					WHERE document_id = d.id
					ORDER BY version_number DESC
					LIMIT 1
				) dv ON TRUE
				WHERE d.collaborator_id = ${collaboratorId}
					AND d.deleted_at IS NULL
				ORDER BY dv.created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`,
			prisma.$queryRaw<PendingCountRow[]>`
				SELECT COUNT(*)::bigint AS total
				FROM documents d
				WHERE d.collaborator_id = ${collaboratorId}
					AND d.deleted_at IS NULL
			`,
		]);

		const total = Number(countRows[0]?.total ?? 0);

		return {
			data: rows.map<CollaboratorDocument>((row) => ({
				document: {
					id: row.documentId,
					documentTypeId: row.documentTypeId,
				},
				documentType: {
					id: row.documentTypeId,
					name: row.documentTypeName,
				},
				activeVersion: new DocumentVersion({
					id: row.versionId,
					documentId: row.documentId,
					versionNumber: row.versionNumber,
					fileName: row.fileName,
					fileSize: row.fileSize,
					mimeType: row.mimeType,
					storageKey: row.storageKey,
					storageUrl: row.storageUrl,
					createdAt: row.createdAt,
				}),
			})),
			meta: buildPaginationMeta({ page, limit }, total),
		};
	}

	async findManyPending(
		params: FindManyPendingDocumentsParams,
	): Promise<Paginated<PendingDocument>> {
		const { page, limit, collaboratorId, documentTypeId, search } = params;
		const offset = (page - 1) * limit;

		const conditions = [
			Prisma.sql`c.deleted_at IS NULL`,
			Prisma.sql`dt.deleted_at IS NULL`,
			Prisma.sql`d.id IS NULL`,
			collaboratorId
				? Prisma.sql`cdt.collaborator_id = ${collaboratorId}`
				: undefined,
			documentTypeId
				? Prisma.sql`cdt.document_type_id = ${documentTypeId}`
				: undefined,
			search
				? Prisma.sql`(c.name ILIKE ${`%${search}%`} OR c.email ILIKE ${`%${search}%`})`
				: undefined,
		].filter((condition) => condition !== undefined);

		const where =
			conditions.length > 0
				? Prisma.join(conditions, " AND ")
				: Prisma.sql`TRUE`;

		const [rows, countRows] = await Promise.all([
			prisma.$queryRaw<PendingDocumentRow[]>`
				SELECT
					c.id AS "collaboratorId",
					c.name AS "collaboratorName",
					c.email AS "collaboratorEmail",
					dt.id AS "documentTypeId",
					dt.name AS "documentTypeName",
					cdt.created_at AS "linkedAt"
				FROM collaborator_document_types cdt
				JOIN collaborators c ON c.id = cdt.collaborator_id
				JOIN document_types dt ON dt.id = cdt.document_type_id
				LEFT JOIN documents d
					ON d.collaborator_id = cdt.collaborator_id
					AND d.document_type_id = cdt.document_type_id
					AND d.deleted_at IS NULL
				WHERE ${where}
				ORDER BY c.name ASC, cdt.created_at ASC
				LIMIT ${limit} OFFSET ${offset}
			`,
			prisma.$queryRaw<PendingCountRow[]>`
				SELECT COUNT(*)::bigint AS total
				FROM collaborator_document_types cdt
				JOIN collaborators c ON c.id = cdt.collaborator_id
				JOIN document_types dt ON dt.id = cdt.document_type_id
				LEFT JOIN documents d
					ON d.collaborator_id = cdt.collaborator_id
					AND d.document_type_id = cdt.document_type_id
					AND d.deleted_at IS NULL
				WHERE ${where}
			`,
		]);

		const total = Number(countRows[0]?.total ?? 0);

		return {
			data: rows.map<PendingDocument>((row) => ({
				collaborator: {
					id: row.collaboratorId,
					name: row.collaboratorName,
					email: row.collaboratorEmail,
				},
				documentType: {
					id: row.documentTypeId,
					name: row.documentTypeName,
				},
				linkedAt: row.linkedAt,
			})),
			meta: buildPaginationMeta({ page, limit }, total),
		};
	}
}

export class DocumentMapper {
	static toDomain(document: DocumentsModel): Document {
		return new Document({
			id: document.id,
			collaboratorId: document.collaboratorId,
			documentTypeId: document.documentTypeId,
			createdAt: document.createdAt,
			updatedAt: document.updatedAt,
			deletedAt: document.deletedAt,
		});
	}
}

export class DocumentVersionMapper {
	static toDomain(version: DocumentVersionsModel): DocumentVersion {
		return new DocumentVersion({
			id: version.id,
			documentId: version.documentId,
			versionNumber: version.versionNumber,
			fileName: version.fileName,
			fileSize: version.fileSize,
			mimeType: version.mimeType,
			storageKey: version.storageKey,
			storageUrl: version.storageUrl,
			createdAt: version.createdAt,
		});
	}
}
