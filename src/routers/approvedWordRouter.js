const router = require('express').Router()
const {auth, checkAdmin} = require('../controllers/authController')
const {getAllApprovedWords} = require('../controllers/approvedWordController')
const {getAllMyWords} = require('../controllers/wordController')

router.route("/")
.get(getAllApprovedWords)

router.route("/allMyWords")
.get(auth, getAllMyWords)

module.exports = router;