import {PostInputModel, PostViewModel} from "../../../common/input-output-types/posts-types";
import {PostDbType} from "../../../db/post-db-type";
import {blogsRepository} from "../../blogs/blogsRepository";
import {commentsRepository} from "../commentsRepository";

export const commentsService = {
	async find(id: string): Promise<PostDbType | null> {
		return await commentsRepository.find(id)
	},
	async del(id: string): Promise<boolean> {
		return await commentsRepository.del(id);
	},
	async put(post: PostInputModel, id: string): Promise<PostViewModel | null> {
		const blog = await blogsRepository.find(post.blogId);
		if (!blog) return null;

		const existingPost = await this.find(id)
		if (!existingPost) return null;

		const updatedPost = {
			...existingPost,
			title: post.title,
			shortDescription: post.shortDescription,
			blogId: blog._id.toString(),
			content: post.content
		};

		return await commentsRepository.put(updatedPost, id)
	},
}
