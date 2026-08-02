import * as crypto from "node:crypto";

export interface CollaboratorAttributes {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface CreateCollaboratorDTO {
	name: string;
	email: string;
	password: string;
}

export class Collaborator {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(attributes: CollaboratorAttributes) {
		this.id = attributes.id;
		this.name = attributes.name;
		this.email = attributes.email;
		this.password = attributes.password;
		this.createdAt = attributes.createdAt;
		this.updatedAt = attributes.updatedAt;
		this.deletedAt = attributes.deletedAt;
	}

	static create(data: CreateCollaboratorDTO): Collaborator {
		return new Collaborator({
			id: crypto.randomUUID(),
			name: data.name,
			email: data.email,
			password: data.password,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		});
	}
}
