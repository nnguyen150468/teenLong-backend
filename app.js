const express = require('express');
const app = express()
const router = express.Router();
const bodyParser = require('body-parser')
const cors = require("cors");
const passport = require('./src/auth/passport')

const Category = require('./src/models/category')

const userRouter = require('./src/routers/userRouter')
const authRouter = require('./src/routers/authRouter')
const wordRouter = require('./src/routers/wordRouter')
const adminRouter = require('./src/routers/adminRouter')
const approvedWordRouter = require('./src/routers/approvedWordRouter')

const {checkAlreadySubmitted} = require('./src/middlewares/checkAlreadySubmitted')
const {createWord} = require('./src/controllers/wordController')
const {checkDuplicate} = require('./src/middlewares/checkDuplicate')
const {auth} = require('./src/controllers/authController')

const catchAsync = require('./src//middlewares/catchAsync')
const AppError = require('./src//utils/appError')

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router)
app.use(passport.initialize())


router.route("/").get((req, res) => res.send("OK"))
router.use("/users", userRouter)
router.use("/auth", authRouter)
router.use("/pendingWords", wordRouter)
router.use("/admin", adminRouter)
router.use("/words", approvedWordRouter)

//check if exact same definition already exists
//check if the same user has already submitted >5 entries for same word
router.route("/addNewWord")
.post(auth, checkDuplicate, checkAlreadySubmitted, createWord)

router.route("/create-categories")
.get(catchAsync(async(req, res, next) => {
    const categories = await Category.insertMany([
        {   category: "college" },
        {   category: "sex" },
        {   category: "countries" },
        {   category: "family" },
        {   category: "relationship" },
        {   category: "society" }
    ])
    res.send(categories)
}))


module.exports = app;