const app = require('./app')
const PORT = 8000;

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Listening on ${PORT}!`)
    }
});