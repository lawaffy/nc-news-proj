const db = require('../db/connection')

const filterByTopic = (topic) => {
    return db.query(`SELECT * FROM articles WHERE topic = $1`, [topic])
    .then(({ rows }) => {
        if (rows.length === 0 ) {
            return Promise.reject({ message: "Not found" })
        }
        return rows[0]
    })
}

const fetchArticles = (queries) => {

    const acceptedQueries = ['topic', 'sort_by', 'order']
    let isValidQuery = true;
    Object.keys(queries).forEach((query) => {
        if (!acceptedQueries.includes(query)) {
            isValidQuery = false
        }
    })
    if (!isValidQuery) {
        return Promise.reject({ message: "Bad Request" })
    }

    const sort_by = queries.sort_by || 'created_at'
    const order = queries.order || 'desc'
    const topic = queries.topic 

    let SQLString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comments.article_id) :: INTEGER AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id`

    const queryArgs = []

    if (topic) {
        return filterByTopic(topic).then(() => {
            SQLString += ` WHERE articles.topic = $1`, [topic] 
            queryArgs.push(topic)
            SQLString += ` GROUP BY articles.article_id`
            return db.query(SQLString, queryArgs).then(({ rows }) => {
                return rows
            })
        })

    } else {

        SQLString += ` GROUP BY articles.article_id`

        if (sort_by) {
            const validColumnsToSortBy = ['created_at', 'author', 'title', 'article_id', 'topic', 'comment_count', 'votes'];
            if (validColumnsToSortBy.includes(sort_by)) {
                SQLString += ` ORDER BY ${sort_by}`;
            } else {
                return Promise.reject({ message: 'Bad Request' })
            } 
            if (order === 'asc' || order === 'desc') {
                SQLString += " " + order
            } else {
                return Promise.reject({ message: 'Bad Request' })
            }
        }
        return db.query(SQLString).then(({ rows }) => {
            return rows;
        })
    }
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

const fetchArticleComments = (queries) => {
    const { sort_by, order, article_id } = queries

    return fetchArticleById(article_id)
    .then(() => {
        let SQLString = `
        SELECT * FROM comments
        WHERE article_id = $1`
        
        if (sort_by) {
            const validColumnsToSortBy = ['created_at'];
            if (validColumnsToSortBy.includes(sort_by)) {
                SQLString += ` ORDER BY ${sort_by}`;
            } else {
                return Promise.reject({ message: 'Bad Request'})
            }
        }
    
        if (order === "desc" || order === 'asc') {
            SQLString += " " + `${order}`
        }

        return db.query(SQLString, [article_id]);
    })
    .then(( { rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ message: 'Not found' })
        }
        return rows
    })
}

const addComment = (newComment, article_id) => {
    const { body, username } = newComment

    if (typeof body !== 'string' || typeof username !== 'string') {
        return Promise.reject({ message: 'Bad Request'})
    }

    return fetchArticleById(article_id)
    .then((article) => {
        if (!article) {
            return Promise.reject({ message: 'Not Found' })
        }

        return db.query(`SELECT * FROM users WHERE username = $1`, [username]
        )
        .then((user) => {
            if (!user) {
                return Promise.reject({ message: 'Not Found'})
            }

            return db.query(
                `INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *;`, [body, username, article_id]
                )
            })
    })
    .then(({ rows }) => {
        return rows[0];
    })
}

const updateArticleVotes = (article_id, inc_votes) => {
    const newVotes = inc_votes

    if (typeof newVotes !== "number") {
        return Promise.reject({ message: "Bad Request"})
    }

    let SQLstring = `UPDATE ARTICLES
        SET votes = votes + $1`

    let args = [newVotes]

    return fetchArticleById(article_id).then((article) => {
        if (!article) {
            return Promise.reject({ message: "Article not found" })
        } 

        SQLstring += ` WHERE article_id = $2 RETURNING *;`,
        args.push(article_id)
        
        return db.query(SQLstring, args)
        })
            .then(({ rows }) => {
                return rows[0]
        })
}

module.exports = { fetchArticles, fetchArticleById, fetchArticleComments, addComment, updateArticleVotes }