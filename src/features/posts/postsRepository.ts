import {blogsRepository} from '../../features/blogs/blogsRepository'
import {PostInputModel, PostViewModel} from "../../input-output-types/posts-types";
import {PostDbType} from "../../db/post-db-type";
import {postCollection} from "../../db/mongo-db";

export const postsRepository = {
    async create(post: PostInputModel): Promise<string> {
			const blogName = await blogsRepository.find(post.blogId)
        const newPost: PostDbType = {
            id: new Date().toISOString() + Math.random(),
            title: post.title,
            content: post.content,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: blogName!.name,
        }
	      await postCollection.insertOne(newPost)
        return newPost.id
    },
    async find(id: string): Promise<PostDbType | null> {
	    return await postCollection.findOne({id: id})
    },
    async findAndMap(id: string): Promise<PostViewModel | undefined> {
        const post = await this.find(id)! // ! используем этот метод если проверили существование
	    if (!post) return undefined

        return this.map(post)
    },
    async getAll(): Promise<PostViewModel[]> {
	    const posts = await postCollection.find().toArray();
	    return posts.map(p => this.map(p));
    },
	async del(id: string): Promise<boolean> {
      const result = await postCollection.deleteOne({id: id})
			return result.deletedCount == 1
    },
	async put(post: PostInputModel, id: string): Promise<PostDbType | undefined> {
      const blog = await blogsRepository.find(post.blogId);
      if (!blog) return;

       const postFind = await this.find(id)
      if (!postFind) return;

      postFind.title = post.title
      postFind.shortDescription = post.shortDescription
      postFind.blogId = blog.id
      postFind.content = post.content
			await postCollection.updateOne({id: id}, {$set: postFind})

      return postFind
    },
    map(post: PostDbType) {
        const postForOutput: PostViewModel = {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
        }
        return postForOutput
    },
}