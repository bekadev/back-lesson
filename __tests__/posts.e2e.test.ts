import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { ADMIN_TOKEN } from "../src/features/auth/guards/base.auth.guard";
import { SETTINGS } from "../src/settings";

describe("posts router e2e", () => {
  let mongoServer: MongoMemoryServer;
  let mongoUri: string;
  let client: MongoClient;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    client = new MongoClient(mongoUri);
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Очищаем БД перед каждым тестом
    await request(app).delete(SETTINGS.PATH.CLEAR_DATA);
  });

  const createPost = {
    title: "Test Post",
    shortDescription: "Short desc",
    content: "Some content",
    blogId: "", // будет заполнено после создания блога
  };

  let blogId: string;

  beforeEach(async () => {
    // Создаём блог для поста
    const blogRes = await request(app)
      .post(SETTINGS.PATH.BLOGS)
      .set("Authorization", ADMIN_TOKEN)
      .send({
        name: "TestBlog",
        description: "desc",
        websiteUrl: "https://test.com",
      })
      .expect(201);
    blogId = blogRes.body.id;
    createPost.blogId = blogId;
  });

  describe("GET /posts", () => {
    it("должен вернуть пустой массив постов", async () => {
      await request(app)
        .get(SETTINGS.PATH.POSTS)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toEqual([]);
          expect(res.body.totalCount || res.body.totalCount === 0).toBeTruthy();
        });
    });

    it("должен вернуть массив с одним постом", async () => {
      // Создаём пост
      const postRes = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createPost)
        .expect(201);
      // Получаем все посты
      const res = await request(app).get(SETTINGS.PATH.POSTS).expect(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0]).toMatchObject({
        id: postRes.body.id,
        title: createPost.title,
        shortDescription: createPost.shortDescription,
        content: createPost.content,
        blogId: blogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("должен вернуть несколько постов и корректную пагинацию", async () => {
      // Создаём 15 постов
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post(SETTINGS.PATH.POSTS)
          .set("Authorization", ADMIN_TOKEN)
          .send({
            ...createPost,
            title: `Post${i}`,
          })
          .expect(201);
      }
      // Получаем первую страницу (по умолчанию pageSize=10)
      const res1 = await request(app).get(SETTINGS.PATH.POSTS).expect(200);
      expect(res1.body.items.length).toBe(10);
      expect(res1.body.page).toBe(1);
      expect(res1.body.totalCount).toBe(15);
      // Получаем вторую страницу
      const res2 = await request(app)
        .get(SETTINGS.PATH.POSTS + "?pageNumber=2")
        .expect(200);
      expect(res2.body.items.length).toBe(5);
      expect(res2.body.page).toBe(2);
    }, 20000); // увеличен таймаут

    it("должен возвращать посты в порядке сортировки по createdAt desc", async () => {
      // Создаём 2 поста с разными title
      await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send({ ...createPost, title: "A" })
        .expect(201);
      await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send({ ...createPost, title: "B" })
        .expect(201);
      // Получаем посты
      const res = await request(app).get(SETTINGS.PATH.POSTS).expect(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
      // createdAt второго поста должен быть меньше или равен первому (desc)
      const [first, second] = res.body.items;
      expect(new Date(first.createdAt) >= new Date(second.createdAt)).toBe(
        true,
      );
    });
  });

  describe("POST /posts", () => {
    it("должен создать новый пост с корректными данными", async () => {
      const response = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createPost)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        title: createPost.title,
        shortDescription: createPost.shortDescription,
        content: createPost.content,
        blogId: blogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("не должен создать пост без авторизации", async () => {
      await request(app).post(SETTINGS.PATH.POSTS).send(createPost).expect(401);
    });

    it("не должен создать пост с невалидными данными", async () => {
      await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send({
          title: "",
          shortDescription: "",
          content: "",
          blogId: "",
        })
        .expect(400);
    });
  });

  // describe("POST /posts/:postId/comments", () => {
  //   let postId: string;
  //   let accessToken: string;
  //
  //   beforeEach(async () => {
  //     // Регистрируем пользователя и логинимся для получения accessToken
  //     const user = {
  //       login: "user1",
  //       password: "password1",
  //       email: "user1@email.com",
  //     };
  //     await request(app)
  //       .post(SETTINGS.PATH.AUTH + "/registration")
  //       .send(user)
  //       .expect(204);
  //     // Получаем confirmationCode из базы
  //     const { MongoClient } = require("mongodb");
  //     const client = new MongoClient(mongoUri);
  //     await client.connect();
  //     const db = client.db();
  //     const userInDb = await db.collection("users").findOne({ email: user.email });
  //     const code = userInDb?.emailConfirmation?.confirmationCode;
  //     await client.close();
  //     // Подтверждаем email
  //     await request(app)
  //       .post(SETTINGS.PATH.AUTH + "/registration-confirmation")
  //       .send({ code })
  //       .expect(204);
  //     // Логинимся
  //     const loginRes = await request(app)
  //       .post(SETTINGS.PATH.AUTH + "/login")
  //       .send({ loginOrEmail: user.login, password: user.password })
  //       .expect(200);
  //     accessToken = loginRes.body.accessToken;
  //     // Создаём пост
  //     const postRes = await request(app)
  //       .post(SETTINGS.PATH.POSTS)
  //       .set("Authorization", ADMIN_TOKEN)
  //       .send(createPost)
  //       .expect(201);
  //     postId = postRes.body.id;
  //   });
  //
  //   it("успешно создаёт комментарий к посту с авторизацией", async () => {
  //     const content = "Комментарий к посту";
  //     const res = await request(app)
  //       .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ content })
  //       .expect(201);
  //     expect(res.body).toMatchObject({
  //       id: expect.any(String),
  //       content,
  //       commentatorInfo: {
  //         userId: expect.any(String),
  //         userLogin: expect.any(String),
  //       },
  //       createdAt: expect.any(String),
  //     });
  //   });
  //
  //   it("не создаёт комментарий без авторизации (401)", async () => {
  //     await request(app)
  //       .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
  //       .send({ content: "test" })
  //       .expect(401);
  //   });
  //
  //   it("не создаёт комментарий с невалидным контентом (400)", async () => {
  //     await request(app)
  //       .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ content: "" })
  //       .expect(400);
  //   });
  //
  //   it("не создаёт комментарий к несуществующему посту (404)", async () => {
  //     await request(app)
  //       .post(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011/comments`)
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .send({ content: "test" })
  //       .expect(404);
  //   });
  // });

  describe("GET /posts/:id", () => {
    let postId: string;

    beforeEach(async () => {
      // Создаём пост
      const postRes = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createPost)
        .expect(201);
      postId = postRes.body.id;
    });

    it("должен вернуть пост по id", async () => {
      const res = await request(app)
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .expect(200);
      expect(res.body).toMatchObject({
        id: postId,
        title: createPost.title,
        shortDescription: createPost.shortDescription,
        content: createPost.content,
        blogId: blogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("должен вернуть 404 для несуществующего id", async () => {
      await request(app)
        .get(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
        .expect(404);
    });
  });

  describe("PUT /posts/:id", () => {
    let postId: string;

    beforeEach(async () => {
      // Создаём пост
      const postRes = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createPost)
        .expect(201);
      postId = postRes.body.id;
    });

    it("успешно обновляет пост с валидными данными и авторизацией", async () => {
      const updated = {
        title: "Updated Title",
        shortDescription: "Updated Desc",
        content: "Updated Content",
        blogId: blogId,
      };
      await request(app)
        .put(`${SETTINGS.PATH.POSTS}/${postId}`)
        .set("Authorization", ADMIN_TOKEN)
        .send(updated)
        .expect(204);
      // Проверяем, что пост обновился
      const res = await request(app)
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .expect(200);
      expect(res.body).toMatchObject({
        ...updated,
        id: postId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("не обновляет пост без авторизации (401)", async () => {
      const updated = {
        title: "Updated Title",
        shortDescription: "Updated Desc",
        content: "Updated Content",
        blogId: blogId,
      };
      await request(app)
        .put(`${SETTINGS.PATH.POSTS}/${postId}`)
        .send(updated)
        .expect(401);
    });

    it("не обновляет пост с невалидными данными (400)", async () => {
      await request(app)
        .put(`${SETTINGS.PATH.POSTS}/${postId}`)
        .set("Authorization", ADMIN_TOKEN)
        .send({ title: "", shortDescription: "", content: "", blogId: "" })
        .expect(400);
    });

    it("не обновляет несуществующий пост (404)", async () => {
      const updated = {
        title: "Updated Title",
        shortDescription: "Updated Desc",
        content: "Updated Content",
        blogId: blogId,
      };
      await request(app)
        .put(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
        .set("Authorization", ADMIN_TOKEN)
        .send(updated)
        .expect(404);
    });
  });

  describe("DELETE /posts/:id", () => {
    let postId: string;

    beforeEach(async () => {
      // Создаём пост
      const postRes = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createPost)
        .expect(201);
      postId = postRes.body.id;
    });

    it("успешно удаляет пост с авторизацией", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.POSTS}/${postId}`)
        .set("Authorization", ADMIN_TOKEN)
        .expect(204);
      // Проверяем, что пост удалён
      await request(app).get(`${SETTINGS.PATH.POSTS}/${postId}`).expect(404);
    });

    it("не удаляет пост без авторизации (401)", async () => {
      await request(app).delete(`${SETTINGS.PATH.POSTS}/${postId}`).expect(401);
    });

    it("не удаляет несуществующий пост (404)", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
        .set("Authorization", ADMIN_TOKEN)
        .expect(404);
    });
  });
});
