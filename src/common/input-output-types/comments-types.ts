export type CommentsInputModel = {
	content: string;
}

export type CommentsViewModel = Omit<{
	id: string
} & CommentsEntityModel, 'postId'>

export type CommentsEntityModel = {
	content: string
	commentatorInfo: CommentatorInfo
	createdAt?: string
	postId: string
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