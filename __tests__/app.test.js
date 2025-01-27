const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require('../app')
const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index')

/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => {
  return seed(testData)
})

afterAll(() => {
  return db.end();
})

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics  }}) => {
        expect(Array.isArray(topics)).toBe(true)
        console.log(topics)
      })
  });

  test(`200: Correct response should have 'slug' and 'description' properties`, () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics  }}) => {
        topics.forEach((topic) => {
          expect(topic).toHaveProperty('slug')
          expect(topic).toHaveProperty('description')
        })
      })
  });

  test("404: Responds with error if the endpoint is incorrect for the request", () => {
    return request(app)
    .get("/api/topi")
    .expect(404)
    .then((response) => {
      expect(response.body).toEqual({ error: "Not found" })
    })
 })

  test("404: Responds with an error message if there is no data to handle", () => {
    return db.query("DELETE FROM comments;")
    .then(() => {
      return db.query("DELETE FROM articles;");
    })
    .then(() => {
      return db.query("DELETE FROM topics;");
    })
    .then(() => {
      return request(app)
      .get("/api/topics")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ error: 'Not found'})
      })
    })
  });
});
