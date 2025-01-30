const db = require('../db/connection')

const fetchCommentById = (id) => {
    return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ message: 'Comment not found' })
        } else {
            return rows[0]
        }
    })
}

const removeCommentById = (comment_id) => {
    const commentToRemove = comment_id

    if (isNaN(commentToRemove)) {
        return Promise.reject({ message: 'Bad Request' })
    }

    return fetchCommentById(comment_id)
    .then((comment) => {
        if (!comment) {
            return Promise.reject({ message: 'Not found'})
        }

        return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [comment_id])
    })
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ message: 'Not found' })
        }
        return
    })
}

module.exports = { fetchCommentById, removeCommentById }