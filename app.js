const express = require("express");

const app = express();

const endpoints = require('./endpoints.json')

const getTopics = require('./controllers/topics.controller')

const { getArticles, getArticleById, getArticleComments } = require('./controllers/articles.controller')

app.get("/api", (request, response) => {
    response.status(200).send( { endpoints })
})

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id/comments", getArticleComments)

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
  if (err.message === "No topics found" || "Article not found") {
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