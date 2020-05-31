const router = require('express').Router()
const {auth, checkAdmin} = require('../controllers/authController')
const {getAllApprovedWords, react, search, filterByFirstChar} = require('../controllers/approvedWordController')
const {getAllMyWords} = require('../controllers/wordController')

router.route("/")
.get(getAllApprovedWords)

router.route("/allMyWords")
.get(auth, getAllMyWords)

router.route("/search/:word")
.get(search)

router.route("/filter/:firstChar")
.get(filterByFirstChar)

router.route("/:wordID/react")
.patch(auth, react)

module.exports = router;