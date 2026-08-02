export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface Paginated<T> {
	data: T[];
	meta: PaginationMeta;
}

export function buildPaginationMeta(
	params: PaginationParams,
	total: number,
): PaginationMeta {
	return {
		page: params.page,
		limit: params.limit,
		total,
		totalPages: Math.ceil(total / params.limit),
	};
}
