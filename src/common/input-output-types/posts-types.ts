export type PostInputModel = {
	title: string
	shortDescription: string
	content: string
	blogId: string
	createdAt?: string
}

export type PostViewModel = {
	id: string
} & PostEntityModel

export type PostEntityModel = {
	title: string
	shortDescription: string
	content: string
	blogId: string
	blogName: string
	createdAt?: string
}

export type PostsPaginationViewModel = {
	pagesCount: number
	page: number
	pageSize: number
	totalCount: number
	items: PostViewModel[]
}