const passport = require('passport')
const facebookStrategy = require('./facebook')
const googleStrategy = require('./google')

passport.use(facebookStrategy)
passport.use(googleStrategy)

module.exports = passport;