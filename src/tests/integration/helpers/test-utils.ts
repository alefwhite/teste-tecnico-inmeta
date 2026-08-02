import type { FastifyInstance } from "fastify";

export const defaultCollaborator = {
	name: "Ana Souza",
	email: "ana@example.com",
	password: "secret123",
};

export async function createCollaborator(
	app: FastifyInstance,
	overrides: Partial<typeof defaultCollaborator> = {},
) {
	const response = await app.inject({
		method: "POST",
		url: "/collaborators",
		payload: { ...defaultCollaborator, ...overrides },
	});

	return {
		response,
		body: response.json() as { id: string; name: string; email: string },
	};
}

interface LoginResponseBody {
	accessToken: string;
	collaborator: { id: string; name: string; email: string };
}

export async function login(
	app: FastifyInstance,
	email: string,
	password: string,
) {
	const response = await app.inject({
		method: "POST",
		url: "/auth/login",
		payload: { email, password },
	});

	return { response, body: response.json() as LoginResponseBody };
}

export async function createAndLogin(app: FastifyInstance) {
	await createCollaborator(app);

	const { body } = await login(
		app,
		defaultCollaborator.email,
		defaultCollaborator.password,
	);

	return {
		accessToken: body.accessToken,
		collaboratorId: body.collaborator.id,
		headers: { authorization: `Bearer ${body.accessToken}` },
	};
}

export async function createDocumentType(
	app: FastifyInstance,
	headers: Record<string, string>,
	name = "RG",
) {
	const response = await app.inject({
		method: "POST",
		url: "/document-types",
		headers,
		payload: { name },
	});

	return { response, body: response.json() as { id: string; name: string } };
}

export async function linkCollaboratorToDocumentType(
	app: FastifyInstance,
	headers: Record<string, string>,
	collaboratorId: string,
	documentTypeId: string,
) {
	return app.inject({
		method: "POST",
		url: `/collaborators/${collaboratorId}/document-types`,
		headers,
		payload: { documentTypeId },
	});
}

const TEST_BOUNDARY = "----inmetaTestBoundary";

function buildMultipartBody(
	fields: Record<string, string>,
	file: { filename: string; contentType: string; content: Buffer },
	fileFirst = false,
) {
	const chunks: Buffer[] = [];

	const fieldChunks = () =>
		Object.entries(fields).map(([name, value]) =>
			Buffer.from(
				`--${TEST_BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
			),
		);

	const fileChunks = () => [
		Buffer.from(
			`--${TEST_BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`,
		),
		file.content,
		Buffer.from(`\r\n`),
	];

	if (fileFirst) {
		chunks.push(...fileChunks());
		chunks.push(...fieldChunks());
	} else {
		chunks.push(...fieldChunks());
		chunks.push(...fileChunks());
	}

	chunks.push(Buffer.from(`--${TEST_BOUNDARY}--\r\n`));

	return Buffer.concat(chunks);
}

export async function submitDocument(
	app: FastifyInstance,
	headers: Record<string, string>,
	payload: {
		documentTypeId: string;
		fileName: string;
		fileSize: number;
		mimeType: string;
	},
	fileFirst = false,
) {
	const response = await app.inject({
		method: "POST",
		url: "/documents",
		headers: {
			...headers,
			"content-type": `multipart/form-data; boundary=${TEST_BOUNDARY}`,
		},
		payload: buildMultipartBody(
			{ documentTypeId: payload.documentTypeId },
			{
				filename: payload.fileName,
				contentType: payload.mimeType,
				content: Buffer.alloc(payload.fileSize),
			},
			fileFirst,
		),
	});

	return {
		response,
		body: response.json() as {
			document: { id: string };
			version: { versionNumber: number; fileName: string };
		},
	};
}
