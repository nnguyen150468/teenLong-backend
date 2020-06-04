require('dotenv').config()
const fs = require('fs')
const app = require('./app')
const path = require('path')
const mongoose = require('mongoose')
let server

//starts https
if(process.env.MODE === "development") {
    const https = require('https');
    server = https.createServer({
        key: fs.readFileSync(path.join(__dirname, "./server.key")),
        cert: fs.readFileSync(path.join(__dirname, "./server.cert"))
    }, app);
} else {
    const http = require('http'); //netlify alreay has https certificate
    server = http.createServer(app);
}


// ends https


mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Successfully connected to database"))

server.listen(process.env.PORT, () => console.log("Listening to port", process.env.PORT))

