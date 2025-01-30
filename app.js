const express = require("express");

const app = express();

const endpoints = require('./endpoints.json')

const getTopics = require('./controllers/topics.controller')

const { getArticles, getArticleById, getArticleComments, postComment, patchArticleVotes } = require('./controllers/articles.controller')

const { getCommentById, deleteCommentById } = require("./controllers/comments.controller")

app.use(express.json())

app.get("/api", (request, response) => {
    response.status(200).send( { endpoints })
})

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id/comments", getArticleComments)

app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", patchArticleVotes)

app.get("/api/comments/:comment_id", getCommentById)

app.delete("/api/comments/:comment_id", deleteCommentById)

app.use((err, req, res, next) => {

  if (err.code === "22P02" || err.code === "23502" || err.message === "Bad Request") {
    res.status(400).send({ error: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((req, res, next) => {
    res.status(404).send({ error: "Not found" })
})

app.use((err, req, res, next) => {
  if (err.message === "No topics found" || "Article not found" || "Comment not found") {
    res.status(404).send({ error: "Not found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err, 'unhandled error!')
  res.status(500).send({ error: 'Internal Server Error'})
})


module.exports = app;