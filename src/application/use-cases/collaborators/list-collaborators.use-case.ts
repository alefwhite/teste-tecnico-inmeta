import type {
	CollaboratorsRepository,
	FindManyCollaboratorsParams,
} from "@/domain/repositories/collaborators.repository";

export class ListCollaboratorsUseCase {
	constructor(private collaboratorsRepository: CollaboratorsRepository) {}

	execute(params: FindManyCollaboratorsParams) {
		return this.collaboratorsRepository.findMany(params);
	}
}
