import {SortQueryFieldsType} from "../types/sortQueryFields.type";
import {SortQueryFilterType} from "../types/sortQueryFilter.type";

export const sortQueryFieldsUtil = (query: SortQueryFieldsType & {
	searchLoginTerm?: string;
	searchEmailTerm?: string;
}): SortQueryFilterType & {
	searchLoginTerm?: string;
	searchEmailTerm?: string;
} => {
	const pageNumber = !isNaN(Number(query.pageNumber))
		? Number(query.pageNumber)
		: 1;
	const pageSize = !isNaN(Number(query.pageSize))
		? Number(query.pageSize)
		: 10;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortDirection: 1 | -1 = query.sortDirection === "asc" ? 1 : -1;
	const searchLoginTerm = query.searchLoginTerm || "";
	const searchEmailTerm = query.searchEmailTerm || "";
	const result = {
		pageNumber,
		pageSize,
		sortDirection,
		sortBy,
		searchLoginTerm,
		searchEmailTerm,
	};
	return result;
}