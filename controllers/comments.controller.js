const { fetchCommentById, removeCommentById } = require("../models/comments.model")

const getCommentById = (request, response, next) => {
    const { comment_id } = request.params;
    fetchCommentById(comment_id)
        .then((comment) => {
            response.status(200).send({ comment })
        })
        .catch((err) => {
            next(err)
        })
}

const deleteCommentById = (request, response, next) => {
    const { comment_id } = request.params;

    removeCommentById(comment_id)
    .then(() => {
        response.status(204).send();
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = { getCommentById, deleteCommentById }