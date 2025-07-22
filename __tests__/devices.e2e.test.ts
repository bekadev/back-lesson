import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { SETTINGS } from "../src/settings";

describe("security devices e2e", () => {
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
  let refreshToken: string;
  let deviceId: string;

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
    // Логинимся (получаем accessToken и refreshToken)
    const loginRes = await request(app)
      .post(SETTINGS.PATH.AUTH + "/login")
      .send({ loginOrEmail: user.login, password: user.password })
      .expect(200);
    accessToken = loginRes.body.accessToken;
    refreshToken = loginRes.headers["set-cookie"][0]
      .split(";")[0]
      .split("=")[1];
    // Получаем deviceId из сессии в базе
    const { MongoClient: MC2 } = require("mongodb");
    const client2 = new MC2(mongoUri);
    await client2.connect();
    const db2 = client2.db();
    const session = await db2
      .collection("devices")
      .findOne({ user_id: userInDb._id.toString() });
    deviceId = session?.device_id;
    await client2.close();
  });

  describe("GET /security/devices", () => {
    it("200 — возвращает массив устройств", async () => {
      const res = await request(app)
        .get(SETTINGS.PATH.DEVICES)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({
        ip: expect.any(String),
        title: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      });
    });
    it("401 — без accessToken", async () => {
      await request(app).get(SETTINGS.PATH.DEVICES).expect(401);
    });
  });

  describe("DELETE /security/devices", () => {
    it("204 — завершает все сессии, кроме текущей", async () => {
      await request(app)
        .delete(SETTINGS.PATH.DEVICES)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
    });
    it("401 — без accessToken", async () => {
      await request(app).delete(SETTINGS.PATH.DEVICES).expect(401);
    });
  });

  describe("DELETE /security/devices/:deviceId", () => {
    it("204 — успешно удаляет свою сессию", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.DEVICES}/${deviceId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
    });
    it("401 — без accessToken", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.DEVICES}/${deviceId}`)
        .expect(401);
    });
    it("404 — несуществующий deviceId", async () => {
      await request(app)
        .delete(`${SETTINGS.PATH.DEVICES}/507f1f77bcf86cd799439011`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
    it("403 — попытка удалить чужую сессию", async () => {
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
      const { MongoClient: MC3 } = require("mongodb");
      const client3 = new MC3(mongoUri);
      await client3.connect();
      const db3 = client3.db();
      const userInDb2 = await db3
        .collection("users")
        .findOne({ email: user2.email });
      const code2 = userInDb2?.emailConfirmation?.confirmationCode;
      await client3.close();
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
      // Пытаемся удалить чужую сессию
      await request(app)
        .delete(`${SETTINGS.PATH.DEVICES}/${deviceId}`)
        .set("Authorization", `Bearer ${accessToken2}`)
        .expect(403);
    });
  });
});
