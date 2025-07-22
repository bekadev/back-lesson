import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { ADMIN_TOKEN } from "../src/features/auth/guards/base.auth.guard";
import { SETTINGS } from "../src/settings";

describe("comments router e2e", () => {
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
    await request(app).delete(SETTINGS.PATH.CLEAR_DATA);
  });

  let accessToken: string;
  let commentId: string;
  let blogId: string;
  let postId: string;

  beforeEach(async () => {
    // Регистрация и подтверждение пользователя
    const user = {
      login: "user1",
      password: "password1",
      email: "user1@email.com",
    };
    await request(app)
      .post(SETTINGS.PATH.AUTH + "/registration")
      .send(user)
      .expect(204);
    // Получаем confirmationCode из базы
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const userInDb = await db
      .collection("users")
      .findOne({ email: user.email });
    const code = userInDb?.emailConfirmation?.confirmationCode;
    await client.close();
    // Подтверждаем email
    await request(app)
      .post(SETTINGS.PATH.AUTH + "/registration-confirmation")
      .send({ code })
      .expect(204);
    // Логинимся
    const loginRes = await request(app)
      .post(SETTINGS.PATH.AUTH + "/login")
      .send({ loginOrEmail: user.login, password: user.password })
      .expect(200);
    accessToken = loginRes.body.accessToken;
    // Создаём блог
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
    // Создаём пост
    const postRes = await request(app)
      .post(SETTINGS.PATH.POSTS)
      .set("Authorization", ADMIN_TOKEN)
      .send({
        title: "Test Post",
        shortDescription: "Short desc",
        content: "Some content",
        blogId,
      })
      .expect(201);
    postId = postRes.body.id;
    // Создаём комментарий
    const commentRes = await request(app)
      .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Комментарий" })
      .expect(201);
    commentId = commentRes.body.id;
  });

  describe("PUT /comments/:id", () => {
    it("успешно обновляет свой комментарий (204)", async () => {
      await request(app)
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Обновлённый комментарий" })
        .expect(204);
    });

    it("401 если нет авторизации", async () => {
      await request(app)
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .send({ content: "Обновлённый комментарий" })
        .expect(401);
    });

    it("400 если невалидный контент", async () => {
      await request(app)
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "" })
        .expect(400);
    });

    it("404 если комментарий не найден", async () => {
      await request(app)
        .put(`${SETTINGS.PATH.COMMENTS}/507f1f77bcf86cd799439011`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Обновлённый комментарий" })
        .expect(404);
    });

    it("403 если пытаешься обновить чужой комментарий", async () => {
      // Регистрируем второго пользователя
      const user2 = {
        login: "user2",
        password: "password2",
        email: "user2@email.com",
      };
      await request(app)
        .post(SETTINGS.PATH.AUTH + "/registration")
        .send(user2)
        .expect(204);
      // Получаем confirmationCode из базы
      const { MongoClient } = require("mongodb");
      const client2 = new MongoClient(mongoUri);
      await client2.connect();
      const db2 = client2.db();
      const userInDb2 = await db2
        .collection("users")
        .findOne({ email: user2.email });
      const code2 = userInDb2?.emailConfirmation?.confirmationCode;
      await client2.close();
      // Подтверждаем email
      await request(app)
        .post(SETTINGS.PATH.AUTH + "/registration-confirmation")
        .send({ code: code2 })
        .expect(204);
      // Логинимся
      const loginRes2 = await request(app)
        .post(SETTINGS.PATH.AUTH + "/login")
        .send({ loginOrEmail: user2.login, password: user2.password })
        .expect(200);
      const accessToken2 = loginRes2.body.accessToken;
      // Пытаемся обновить чужой комментарий
      await request(app)
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken2}`)
        .send({ content: "Попытка обновить чужой комментарий" })
        .expect(403);
    });
  });

  describe("DELETE /comments/:id", () => {
    it("успешно удаляет свой комментарий (204)", async () => {
      // Сначала создаём новый комментарий
      const commentRes = await request(app)
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Комментарий для удаления" })
        .expect(201);
      const newCommentId = commentRes.body.id;
      // Удаляем
      await request(app)
        .delete(`${SETTINGS.PATH.COMMENTS}/${newCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
      // Проверяем, что комментарий удалён
      await request(app)
        .get(`${SETTINGS.PATH.COMMENTS}/${newCommentId}`)
        .expect(404);
    });

    it("401 если нет авторизации", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(401);
    });

    it("404 если комментарий не найден", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.COMMENTS}/507f1f77bcf86cd799439011`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });

    it("403 если пытаешься удалить чужой комментарий", async () => {
      // Регистрируем второго пользователя
      const user2 = {
        login: "user2",
        password: "password2",
        email: "user2@email.com",
      };
      await request(app)
        .post(SETTINGS.PATH.AUTH + "/registration")
        .send(user2)
        .expect(204);
      // Получаем confirmationCode из базы
      const { MongoClient } = require("mongodb");
      const client2 = new MongoClient(mongoUri);
      await client2.connect();
      const db2 = client2.db();
      const userInDb2 = await db2
        .collection("users")
        .findOne({ email: user2.email });
      const code2 = userInDb2?.emailConfirmation?.confirmationCode;
      await client2.close();
      // Подтверждаем email
      await request(app)
        .post(SETTINGS.PATH.AUTH + "/registration-confirmation")
        .send({ code: code2 })
        .expect(204);
      // Логинимся
      const loginRes2 = await request(app)
        .post(SETTINGS.PATH.AUTH + "/login")
        .send({ loginOrEmail: user2.login, password: user2.password })
        .expect(200);
      const accessToken2 = loginRes2.body.accessToken;
      // Пытаемся удалить чужой комментарий
      await request(app)
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken2}`)
        .expect(403);
    });
  });

  describe("GET /comments/:id", () => {
    it("успешно возвращает существующий комментарий (200)", async () => {
      // Создаём новый комментарий
      const commentRes = await request(app)
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Комментарий для получения" })
        .expect(201);
      const newCommentId = commentRes.body.id;
      // Получаем
      const res = await request(app)
        .get(`${SETTINGS.PATH.COMMENTS}/${newCommentId}`)
        .expect(200);
      expect(res.body).toMatchObject({
        id: newCommentId,
        content: "Комментарий для получения",
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
      });
    });

    it("404 если комментарий не найден", async () => {
      await request(app)
        .get(`${SETTINGS.PATH.COMMENTS}/507f1f77bcf86cd799439011`)
        .expect(404);
    });
  });
});
