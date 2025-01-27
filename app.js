const express = require("express");

const app = express();

const endpoints = require('./endpoints.json')

const getTopics = require('./controllers/topics.controller')

app.get("/api", (request, response) => {
    response.status(200).send( { endpoints })
})

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
    res.status(404).send({ error: "Not found" })
})

app.use((err, req, res, next) => {
    if (err.message === "No topics found") {
      res.status(404).send({ error: "Not found" });
    } else {
      next(err);
    }
  });


module.exports = app;