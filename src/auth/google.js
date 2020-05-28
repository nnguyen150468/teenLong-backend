const passport = require('passport-google-oauth2')
const googleStrategy = passport.Strategy
const User = require('../models/user')

module.exports = new googleStrategy({
    clientID: process.env.GG_ID,
    clientSecret: process.env.GG_SECRET,
    callbackURL: process.env.DOMAIN + process.env.GG_CB,
    scope: [ "email", "profile"]
}, async function(accessToken, refreshToken, profile, cb){
    const {name, email} = profile._json
    console.log('google profile', profile)
    const user = await User.findOneOrCreate({name, email})
    cb(null, user)
})