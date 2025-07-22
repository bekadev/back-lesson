import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { ADMIN_TOKEN } from "../src/features/auth/guards/base.auth.guard";
import { SETTINGS } from "../src/settings";

describe("users router e2e", () => {
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

  describe("GET /users", () => {
    it("200 — получить список пользователей с авторизацией", async () => {
      // Сначала создаём пользователя
      const user = {
        login: "user1",
        password: "password1",
        email: "user1@email.com",
      };
      await request(app)
        .post(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .send(user)
        .expect(201);
      // Получаем список
      const res = await request(app)
        .get(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .expect(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items[0]).toMatchObject({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
    });
    it("401 — без авторизации", async () => {
      await request(app).get(SETTINGS.PATH.USERS).expect(401);
    });
  });

  describe("POST /users", () => {
    it("201 — создать пользователя с валидными данными", async () => {
      const user = {
        login: "user2",
        password: "password2",
        email: "user2@email.com",
      };
      const res = await request(app)
        .post(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .send(user)
        .expect(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
    });
    it("400 — невалидные данные (короткий пароль)", async () => {
      const user = {
        login: "user3",
        password: "12",
        email: "user3@email.com",
      };
      await request(app)
        .post(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .send(user)
        .expect(400);
    });
    it("400 — невалидные данные (невалидный email)", async () => {
      const user = {
        login: "user4",
        password: "password4",
        email: "not-an-email",
      };
      await request(app)
        .post(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .send(user)
        .expect(400);
    });
    it("401 — без авторизации", async () => {
      const user = {
        login: "user5",
        password: "password5",
        email: "user5@email.com",
      };
      await request(app).post(SETTINGS.PATH.USERS).send(user).expect(401);
    });
  });

  describe("DELETE /users/:id", () => {
    let userId: string;
    beforeEach(async () => {
      const user = {
        login: "user6",
        password: "password6",
        email: "user6@email.com",
      };
      const res = await request(app)
        .post(SETTINGS.PATH.USERS)
        .set("Authorization", ADMIN_TOKEN)
        .send(user)
        .expect(201);
      userId = res.body.id;
    });
    it("204 — удалить существующего пользователя", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.USERS}/${userId}`)
        .set("Authorization", ADMIN_TOKEN)
        .expect(204);
    });
    it("404 — удалить несуществующего пользователя", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.USERS}/507f1f77bcf86cd799439011`)
        .set("Authorization", ADMIN_TOKEN)
        .expect(404);
    });
    it("401 — без авторизации", async () => {
      await request(app).delete(`${SETTINGS.PATH.USERS}/${userId}`).expect(401);
    });
  });
});
