const db = require('../db/connection')

const fetchArticles = (queries) => {
    const sort_by = queries.sort_by
    const order = queries.order

    let SQLString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id`

    if (sort_by) {
        const validColumnsToSortBy = ['created_at'];
        if (validColumnsToSortBy.includes(sort_by)) {
            SQLString += ` ORDER BY ${sort_by}`;
        } else {
            return Promise.reject({ message: 'Bad Request'})
        }
    }

    if (order === "desc" || order === 'asc') {
        SQLString += " " + order;
    }

    return db.query(SQLString).then(({ rows }) => {
        return rows;
    })
};

const fetchArticleById = (id) => {
    return db
    .query(`SELECT * FROM articles WHERE article_id=$1`, [id])
    .then(({ rows }) => {
        if (rows.length === 0) {
        return Promise.reject({ message: 'Article not found' });
        } else {
        return rows[0]
        }
    })
}

module.exports = { fetchArticles, fetchArticleById }