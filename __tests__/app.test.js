const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require('../app')
const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index');
const { fetchArticle, fetchArticleById } = require("../models/articles.model");

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
      .then(({ body: { topics }}) => {
        expect(Array.isArray(topics)).toBe(true)
        expect(topics.length).toBeTruthy()
        expect(topics.length).toBe(3)
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
    const noData = { rows: [] }
    jest.spyOn(db, 'query').mockResolvedValueOnce(noData)

    return request(app)
      .get("/api/topics")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ error: "Not found" })
    })
  })
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an object of articles with a valid dynamic endpoint taken from article_id", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article).toBe('object')
        expect(article.article_id).toBe(2)
      });
  });

  test("200: Responds with an object with correct properties", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty('author')
        expect(article).toHaveProperty('title')
        expect(article).toHaveProperty('article_id')
        expect(article).toHaveProperty('body')
        expect(article).toHaveProperty('topic')
        expect(article).toHaveProperty('created_at')
        expect(article).toHaveProperty('votes')
        expect(article).toHaveProperty('article_img_url')
      });
  });

  test("404: Responds with an error message when requested an invalid dynamic endpoint (no article_id)", () => {
    return request(app)
      .get("/api/articles/3000")
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ error: "Not found" })
        expect(response.body).not.toHaveProperty('author_id')
      })
  });

  test("Checks that the article_id associates with the dynamic endpoint", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(3)
        })
      })

  test("Checks the fetchArticleById promise will reject if there is no associated article_id in database", () => {
    return expect(fetchArticleById(3000)).rejects.toEqual({ message: 'Article not found' })
  })
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of articles with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const firstArticle = body.articles[0]
          expect(firstArticle.author).toBe('rogersop')
          expect(firstArticle.title).toBe('UNCOVERED: catspiracy to bring down democracy')
          expect(firstArticle.article_id).toBe(5)
          expect(firstArticle.body).toBe(undefined)
          expect(firstArticle.comment_count).toBe('2')
          expect(firstArticle.created_at).toBe('2020-08-03T13:14:00.000Z')
          expect(Object.keys(firstArticle).length).toBe(8)
        })
      });

  test("Should be able to sort in desc order by created_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
        })
      })  
      
  test("400: Responds with an error when sorted by invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(400)
      .then((response) => {
          expect(response.body.error).toBe("Bad Request")
        })
      })
  });