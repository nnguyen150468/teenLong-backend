const router = require('express').Router()
const {auth, checkAdmin} = require('../controllers/authController')
const {getAllApprovedWords, react, search, filterByFirstChar} = require('../controllers/approvedWordController')
const {getAllMyWords, getAllMyPendingWords, getAllMyApprovedWords} = require('../controllers/wordController')

router.route("/")
.get(getAllApprovedWords)

router.route("/allMyWords")
.get(auth, getAllMyWords)

router.route("/allMyPending")
.get(auth, getAllMyPendingWords)

router.route("/allMyApproved")
.get(auth, getAllMyApprovedWords)

router.route("/search")
.post(search)

router.route("/filter/:firstChar")
.get(filterByFirstChar)

router.route("/:wordID/react")
.patch(auth, react)

module.exports = router;