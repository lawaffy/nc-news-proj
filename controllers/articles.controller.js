const { fetchArticles, fetchArticleById } = require('../models/articles.model')

const getArticleById = (request, response, next) => {
    const { article_id } = request.params;
    fetchArticleById(article_id)
        .then((article) => {
            response.status(200).send({ article })
        })
        .catch((err) => {
            next(err)
        })
}

const getArticles = (request, response, next) => {
    const queries = request.query
    fetchArticles(queries)
        .then((articles) => {
            response.status(200).send({ articles })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = { getArticles, getArticleById }