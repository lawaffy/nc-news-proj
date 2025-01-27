const fetchTopics = require('../models/topics.model')

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({ topics })
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = getTopics