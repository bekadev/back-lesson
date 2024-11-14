import type {SortQueryFieldsType} from "../../../common/types/sortQueryFields.type";

export type UsersQueryFieldsType = {
	searchLoginTerm?: string,
	searchEmailTerm?: string
} & SortQueryFieldsType