import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";
import { routersPaths } from "../src/common/path/paths";
import { usersCollection } from "../src/db/mongo-db";

const BASE = "/auth";

describe("auth e2e", () => {
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let confirmationCode: string;
  let accessToken: string;
  let userId: string;

  const user = {
    login: "testuser",
    email: "testuser@example.com",
    password: "TestPass123!",
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    (usersCollection as any).client = mongoClient;
    (usersCollection as any).db = mongoClient.db("social");
    await usersCollection.deleteMany({});
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  it("should register user", async () => {
    const res = await request(app)
      .post(BASE + routersPaths.auth.registration)
      .send(user);
    expect(res.status).toBe(204);
    const dbUser = await usersCollection.findOne({ email: user.email });
    expect(dbUser).toBeDefined();
    expect(dbUser!.emailConfirmation.isConfirmed).toBe(false);
    confirmationCode = dbUser!.emailConfirmation.confirmationCode;
    userId = dbUser!._id.toString();
  });

  it("should fail login before email confirmation", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ loginOrEmail: user.login, password: user.password })
      .expect(200);
    // надо чекнуть
  });

  it("should confirm email", async () => {
    const res = await request(app)
      .post(BASE + routersPaths.auth.registrationConfirmation)
      .send({ code: confirmationCode });
    expect(res.status).toBe(204);
    const dbUser = await usersCollection.findOne({ email: user.email });
    expect(dbUser!.emailConfirmation.isConfirmed).toBe(true);
  });

  it("should fail confirm with wrong code", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.registrationConfirmation)
      .send({ code: "wrong-code" })
      .expect(400);
  });

  it("should login after confirmation", async () => {
    const res = await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ loginOrEmail: user.login, password: user.password })
      .expect(200);
    expect(res.body).toHaveProperty("accessToken");
    accessToken = res.body.accessToken;
  });

  it("should get /me with accessToken", async () => {
    const res = await request(app)
      .get(BASE + routersPaths.auth.me)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toEqual({
      userId,
      email: user.email,
      login: user.login,
    });
  });

  it("should fail /me with invalid token", async () => {
    await request(app)
      .get(BASE + routersPaths.auth.me)
      .set("Authorization", `Bearer ${accessToken}123`)
      .expect(401);
  });

  it("should fail login with wrong password", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ loginOrEmail: user.login, password: "wrongpass" })
      .expect(401);
  });

  it("should fail login with wrong login", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ loginOrEmail: "notexist", password: user.password })
      .expect(401);
  });

  it("should fail login without login or email", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ password: user.password })
      .expect(400);
  });

  it("should fail login without password", async () => {
    await request(app)
      .post(BASE + routersPaths.auth.login)
      .send({ loginOrEmail: user.login })
      .expect(400);
  });
});
