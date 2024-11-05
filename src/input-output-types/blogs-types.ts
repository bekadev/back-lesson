export type BlogInputModel = {
	name: string // max 15
	description: string // max 500
	websiteUrl: string // max 100 ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
	createdAt?: string
	isMembership?: boolean
}

// export type BlogViewModel = {
// 	id: string
// 	name: string
// 	description: string
// 	websiteUrl: string
// 	createdAt?: string
// 	isMembership?: boolean
// }


export type BlogViewModel = {
	id: string
} & BlogEntityModel

export type BlogEntityModel = {
	name: string
	description: string
	websiteUrl: string
	createdAt?: string
	isMembership?: boolean
}


export type BlogsPaginationViewModel = {
	pagesCount: number
	page: number
	pageSize: number
	totalCount: number
	items: BlogViewModel[]
}