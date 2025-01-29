const { fetchArticles, fetchArticleById, fetchArticleComments, addComment } = require('../models/articles.model')

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

const getArticleComments = (request, response, next) => {
    const { article_id } = request.params
    const { sort_by, order } = request.query

    fetchArticleComments({ sort_by, order, article_id })
        .then((comments) => {
            response.status(200).send({ comments })
        })
        .catch((err) => {
            next(err)
        })
}

const postComment = (request, response, next) => {
    const newComment = request.body;
    const article_id = request.params.article_id

    addComment(newComment, article_id)
        .then((comment) => {
            response.status(201).send({ comment: comment })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = { getArticles, getArticleById, getArticleComments, postComment }