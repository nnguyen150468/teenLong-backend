const router = require('express').Router()
const {auth, checkAdmin} = require('../controllers/authController')
const {getAllWordsByUser} = require('../controllers/userController')
const {createApprovedWord} = require('../controllers/approvedWordController')
const {checkApprovedDuplicate} = require('../middlewares/checkApprovedDuplicate')

router.route("/users/:userID/allWords")
.get(auth, checkAdmin, getAllWordsByUser)


router.route("/words/:wordID/approve")
.post(auth, checkAdmin, checkApprovedDuplicate, createApprovedWord)

module.exports = router;