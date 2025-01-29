const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require('../app')
const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index');

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
      expect(response.body.error).toEqual("Not found")
    })
  })
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an object of articles with a valid dynamic endpoint taken from article_id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article).toBe('object')
        expect(article.article_id).toBe(1)
      });
  });

  test("Responds with an object with correct property count", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(Object.keys(article).length).toBe(8)
        expect(typeof article.author).toBe("string")
        expect(typeof article.article_id).toBe('number')
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

  test("400: Responds with an error message id is not a number", () => {
    return request(app)
      .get("/api/articles/generalstring")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request")
      })
  });
})

describe("GET /api/articles", () => {
  test("200: Responds with an array of articles with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          })
          expect(Object.keys(article).length).toBe(8)
          expect(article.body).toBe(undefined)
        })
      })
  });
    
  test("Should be able to sort in desc order by created_by column", () => {
    return request(app)
      .get("/api/articles")
      .query({ sort_by: 'created_at', order: 'desc' })
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
        })
      })  
      
  test("400: Responds with an error when requested to sort by invalid column", () => {
    return request(app)
      .get("/api/articles")
      .query({ sort_by: 'topics' })
      .expect(400)
      .then((response) => {
          expect(response.body.error).toBe("Bad Request")
        })
      })
  });

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String)
          })
        })
      })
    })

  test("Dynamic endpoint of article_id is functioning effectively for request", () => {
    return request(app)
      .get("/api/articles/6/comments")
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(6)
          })
        })
    })

  test("Asserts that we can sort_by most recent comments in desc", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .query({ sort_by: 'created_at', order: 'desc' })
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.comments).toBeSortedBy('created_at', { descending: true })
    })
  })

  test("404: throws error if there are no associated article_ids in comments table to return", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(404)
      .then((response) => {
        const body = response.body;
        expect(body.error).toBe("Not found")
    })
  })

  test("400: throws error if trying to sort by invalid column", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .query({ sort_by: 'comment_id' })
      .expect(400)
      .then((response) => {
        const body = response.body;
        expect(body.error).toBe("Bad Request")
    })
  })

  test("400: throws error if request is invalid data type", () => {
    return request(app)
      .get("/api/articles/articleid/comments")
      .expect(400)
      .then((response) => {
        const body = response.body;
        expect(body.error).toBe("Bad Request")
    })
  })
})