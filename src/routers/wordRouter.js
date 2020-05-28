const router = require('express').Router()
const {auth, checkAdmin} = require('../controllers/authController')
const { getAllPendingWords, getAllMyWords, deletePendingWord, updatePendingWord, getAllMyPendingWords} = require('../controllers/wordController')
const {checkDuplicate} = require('../middlewares/checkDuplicate')
const {checkUserWord} = require('../middlewares/checkUserWord')


router.route("/")
.get(auth, checkAdmin, getAllPendingWords)

// router.route("/myWords")
// .get(auth, getAllMyPendingWords)

//check if word is user's pending word
router.route("/myWords/:wordID")
.delete(auth, checkUserWord, deletePendingWord)
.patch(auth, checkUserWord, checkDuplicate, updatePendingWord)



module.exports = router;