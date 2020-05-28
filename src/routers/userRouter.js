const router = require('express').Router()
const {auth, checkPermission, checkAdmin} = require('../controllers/authController')
const {createUser, getAllUsers, getOneUser, getOneUsersApprovedWords, 
    getMyProfile, deleteUser, updateUser, resetPassword, changePassword} = require('../controllers/userController')


router.route("/me")
.get(auth, getMyProfile)

router.route("/")
.post(createUser)
.get(getAllUsers)

router.route("/:userID/words")
.get(getOneUsersApprovedWords)

//check if it's correct user or admin deleting the account
router.route("/:userID") 
.delete(auth, checkPermission, deleteUser)
.patch(auth, checkPermission, updateUser)
.get(getOneUser)



//reset password
router.route("/forget-password/:email")
.get(resetPassword)

router.route("/update-password/:token")
.post(changePassword)

module.exports = router;