const router = require('express').Router()
const {auth, login, logout, logoutAll} = require('../controllers/authController')
const {loginFacebook, facebookAuth} = require('../auth/facebookHandler')
const {loginGoogle, googleAuth} = require('../auth/googleHandler')

router.route("/login")
.post(login)

router.route("/logout")
.get(auth, logout)

router.route("/logoutAll")
.get(auth, logoutAll)

router.route("/google")
.get(loginGoogle)

router.route("/google/authorized")
.get(googleAuth)

router.route("/facebook")
.get(loginFacebook)

router.route("/facebook/authorized")
.get(facebookAuth)

module.exports = router;