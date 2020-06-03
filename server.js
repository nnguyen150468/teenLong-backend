require('dotenv').config()
const http = require('http');
const app = require('./app')

const mongoose = require('mongoose')

const server = http.createServer(app);

mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>console.log("Successfully connected to database"))

server.listen(process.env.PORT, ()=>console.log("Listening to port", process.env.PORT))

