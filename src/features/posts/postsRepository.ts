import {blogsRepository} from '../../features/blogs/blogsRepository'
import {PostInputModel, PostViewModel} from "../../input-output-types/posts-types";
import {PostDbType} from "../../db/post-db-type";
import {db} from "../../db/db";

export const postsRepository = {
    create(post: PostInputModel) {
        const newPost: PostDbType = {
            id: new Date().toISOString() + Math.random(),
            title: post.title,
            content: post.content,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: blogsRepository.find(post.blogId)!.name,
        }
        db.posts = [...db.posts, newPost]
        return newPost.id
    },
    find(id: string) {
        return db.posts.find(p => p.id === id)
    },
    findAndMap(id: string) {
        const post = this.find(id)! // ! используем этот метод если проверили существование
        return this.map(post)
    },
    getAll() {
        return db.posts.map(p => this.map(p))
    },
    del(id: string) {
      for (let i = 0; i < db.posts.length; i++) {
        if (db.posts[i].id === id) {
          db.posts.splice(i, 1)
          return true
        }
      }
      return  false
    },
    put(post: PostInputModel, id: string) {
      const blog = blogsRepository.find(post.blogId);
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