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

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with a posted comment using dynamic article_id endpoint and an existing username", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        body: "hello",
        username: "butter_bridge"
      })
      .expect(201)
      .then((response) => {
        expect(response.body.comment.body).toBe('hello')
        expect(response.body.comment.author).toBe('butter_bridge')
        expect(response.body.comment.article_id).toBe(2)
      })
  })

  test("400: missing keys/malformed input", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        author: 'laura',
        votes: 1
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Bad Request')
      })
  })

  test("400: two incorrect data types being added", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        body: 2,
        username: 5348
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Bad Request')
      })
  })
  test("400: one incorrect data type being added", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        body: 2,
        username: 'butter_bridge'
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Bad Request')
      })
  })

  test("404: when article_id can't be found for endpoint", () => {
    return request(app)
      .post("/api/articles/5000/comments")
      .send({
        body: 'hello',
        username: 'butter_bridge'
      })
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe('Not found')
      })
  })
})

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with an updated article when passed a votes object with all properties", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toHaveProperty("votes", expect.any(Number))
        expect(body.updatedArticle).toHaveProperty("title", expect.any(String))
        expect(body.updatedArticle).toHaveProperty("topic", expect.any(String))
        expect(body.updatedArticle).toHaveProperty("author", expect.any(String))
        expect(body.updatedArticle).toHaveProperty("body", expect.any(String))
        expect(body.updatedArticle).toHaveProperty("created_at", expect.any(String))
        expect(body.updatedArticle).toHaveProperty("article_img_url", expect.any(String))
        expect(body.updatedArticle.votes).toBeGreaterThan(0)
        expect(body.updatedArticle.article_id).toBe(2)
      })
  })

  test("shows votes are incrementally adding to existing article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.votes).toBe(100)
    
    return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 2 })
        .expect(200)
      })
      .then((response) => {
        expect(response.body.updatedArticle.votes).toBe(102)
      })
  })

  test("shows votes can be deducted from an existing article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -20 })
      .expect(200)
      .then((response) => {
        expect(response.body.updatedArticle.votes).toBe(80)
      })
  })

  test("400: error thrown when vote_id is incorrect data type", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 'two' })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request")
      })
  })

  test("400: error thrown when vote_id is empty", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request")
      })
  })

  test("404: error thrown when no article_id to update", () => {
    return request(app)
      .patch("/api/articles/1000")
      .send({ inc_votes: 2 })
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found")
      })
  })
})

describe("GET /api/comments/:comment_id", () => {
  test("200: successfully retrieves comment by id", () => {
    return request(app)
      .get("/api/comments/2")
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.comment_id).toBe(2)
        expect(comment).toHaveProperty("body", expect.any(String))
    })
  })

  test("404: returns error when no comment associated", () => {
    return request(app)
      .get("/api/comments/2000")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found")
    })
  })

  test("400: returns error when incorrect data input", () => {
    return request(app)
      .get("/api/comments/numberone")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request")
    })
  })
})

describe("DELETE /api/comments/:comment_id", () => {
  test("204: successfully deletes comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then(() => {
        return request(app)
        .get("/api/comments/2")
        .expect(404)
        .then((response) => {
            expect(response.body.error).toBe("Not found")
            expect(response.body).not.toHaveProperty("body")
          })
      })
  })

  test("404: no relevant comment_id to delete", () => {
    return request(app)
      .delete("/api/comments/2000")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found")
      })
    })

  test("400: incorrect data type for request", () => {
    return request(app)
      .delete("/api/comments/commentid")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request")
      })
  })
})

describe("GET /api/users", () => {
  test("200: Responds with an array of objects with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true)
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
          expect(Object.keys(user).length).toBe(3)
        })
      })
  }); 
      
  test("404: Responds with an error when passed incorrect endpoint", () => {
    return request(app)
      .get("/api/2308")
      .expect(404)
      .then((response) => {
          expect(response.body.error).toBe("Not found")
        })
      })
  });