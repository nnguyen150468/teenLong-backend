require('dotenv').config()
const https = require('https');
const fs = require('fs')
const app = require('./app')
const path = require('path')

const mongoose = require('mongoose')

const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, "./server.key")),
    cert: fs.readFileSync(path.join(__dirname, "./server.cert"))
}, app);



mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>console.log("Successfully connected to database"))

server.listen(process.env.PORT, ()=>console.log("Listening to port", process.env.PORT))

