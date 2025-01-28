const express = require("express");

const app = express();

const endpoints = require('./endpoints.json')

const getTopics = require('./controllers/topics.controller')

const getArticleById = require('./controllers/articles.controller')

app.get("/api", (request, response) => {
    response.status(200).send( { endpoints })
})

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById)

app.use((req, res, next) => {
    res.status(404).send({ error: "Not found" })
})

app.use((err, req, res, next) => {
    if (err.message === "No topics found" || "Article not found") { // need to add error for articles too
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