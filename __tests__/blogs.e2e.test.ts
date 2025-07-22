import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { ADMIN_TOKEN } from "../src/features/auth/guards/base.auth.guard";
import { SETTINGS } from "../src/settings";

describe("blogs router e2e", () => {
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

  const createBlog = {
    name: "Тестовый блог",
    description: "Описание тестового блога",
    websiteUrl: "https://test.com",
  };

  describe("GET /blogs", () => {
    it("должен вернуть пустой массив блогов", async () => {
      await request(app)
        .get(SETTINGS.PATH.BLOGS)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toEqual([]);
          expect(res.body.totalCount).toBe(0);
        });
    });
  });

  describe("POST /blogs", () => {
    it("должен создать новый блог с корректными данными", async () => {
      const response = await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createBlog)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: createBlog.name,
        description: createBlog.description,
        websiteUrl: createBlog.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it("не должен создать блог без авторизации", async () => {
      await request(app).post(SETTINGS.PATH.BLOGS).send(createBlog).expect(401);
    });

    it("не должен создать блог с некорректными данными", async () => {
      await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set("Authorization", ADMIN_TOKEN)
        .send({
          name: "",
          description: "",
          websiteUrl: "invalid-url",
        })
        .expect(400);
    });
  });

  describe("GET /blogs/:id", () => {
    it("должен вернуть блог по id", async () => {
      // Создаем блог
      const createResponse = await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createBlog)
        .expect(201);

      // Получаем созданный блог по id
      await request(app)
        .get(`${SETTINGS.PATH.BLOGS}/${createResponse.body.id}`)
        .expect(200)
        .expect(createResponse.body);
    });

    it("должен вернуть 404 для несуществующего id", async () => {
      // Используем валидный ObjectId
      await request(app)
        .get(`${SETTINGS.PATH.BLOGS}/507f1f77bcf86cd799439011`)
        .expect(404);
    });
  });

  describe("PUT /blogs/:id", () => {
    it("должен обновить существующий блог", async () => {
      // Создаем блог
      const createResponse = await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createBlog)
        .expect(201);

      const updatedBlog = {
        name: "Блог-обновлен", // <= 15 символов
        description: "Обновленное описание",
        websiteUrl: "https://updated.com",
      };

      // Обновляем блог
      const updateRes = await request(app)
        .put(`${SETTINGS.PATH.BLOGS}/${createResponse.body.id}`)
        .set("Authorization", ADMIN_TOKEN)
        .send(updatedBlog);
      if (updateRes.status !== 204) {
        throw new Error("Update blog error: " + JSON.stringify(updateRes.body));
      }
      expect(updateRes.status).toBe(204);

      // Проверяем, что блог обновился
      const getResponse = await request(app)
        .get(`${SETTINGS.PATH.BLOGS}/${createResponse.body.id}`)
        .expect(200);

      expect(getResponse.body).toEqual({
        ...createResponse.body,
        name: updatedBlog.name,
        description: updatedBlog.description,
        websiteUrl: updatedBlog.websiteUrl,
      });
    });
  });

  describe("DELETE /blogs/:id", () => {
    it("должен удалить существующий блог", async () => {
      // Создаем блог
      const createResponse = await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set("Authorization", ADMIN_TOKEN)
        .send(createBlog)
        .expect(201);

      // Удаляем блог
      await request(app)
        .delete(`${SETTINGS.PATH.BLOGS}/${createResponse.body.id}`)
        .set("Authorization", ADMIN_TOKEN)
        .expect(204);

      // Проверяем, что блог удален
      await request(app)
        .get(`${SETTINGS.PATH.BLOGS}/${createResponse.body.id}`)
        .expect(404);
    });
  });
});
