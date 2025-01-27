const db = require('../db/connection')

const fetchTopics = () => {
    return db
    .query(`SELECT * FROM topics;`)
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ message: 'No topics found' });
            }
                return rows
            });
};

module.exports = fetchTopics