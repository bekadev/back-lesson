export type CommentsInputModel = {
	content: string;
}

export type CommentsViewModel = {
	id: string
	content: string
	commentatorInfo: CommentatorInfo
	createdAt?: string
}

export type CommentatorInfo = {
	userId: string
	userLogin: string
}

export type CommentsPaginationViewModel = {
	pagesCount: number
	page: number
	pageSize: number
	totalCount: number
	items: CommentsViewModel[]
}