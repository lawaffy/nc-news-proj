const db = require('../db/connection')

const fetchUsers = () => {

    let SQLString = (`SELECT username, name, avatar_url FROM users;`) 

    return db.query(SQLString).then(( { rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ message: "Not found" })
        }
        return rows;
    })
}

module.exports = fetchUsers