import {blogsRepository} from '../../features/blogs/blogsRepository'
import {PostInputModel, PostViewModel} from "../../input-output-types/posts-types";
import {PostDbType} from "../../db/post-db-type";
import {db} from "../../db/db";

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
        db.posts = [...db.posts, newPost]
        return newPost.id
    },
    async find(id: string): Promise<PostDbType | undefined> {
        return db.posts.find(p => p.id === id)
    },
    async findAndMap(id: string): Promise<PostViewModel | undefined> {
        const post = await this.find(id)! // ! используем этот метод если проверили существование
	    if (!post) return undefined

        return this.map(post)
    },
    async getAll(): Promise<PostViewModel[]> {
        return db.posts.map(p => this.map(p))
    },
	async del(id: string): Promise<boolean> {
      for (let i = 0; i < db.posts.length; i++) {
        if (db.posts[i].id === id) {
          db.posts.splice(i, 1)
          return true
        }
      }
      return  false
    },
	async put(post: PostInputModel, id: string): Promise<PostDbType | undefined> {
      const blog = await blogsRepository.find(post.blogId);
      if (!blog) return;

       const postFind = db.posts.find(p => p.id === id)
      if (!postFind) return;

      postFind.title = post.title
      postFind.shortDescription = post.shortDescription
      postFind.blogId = blog.id
      postFind.content = post.content

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