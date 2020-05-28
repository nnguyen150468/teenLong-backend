const passport = require('passport')

exports.loginGoogle = passport.authenticate('google')

exports.googleAuth = function(req, res, next){
    passport.authenticate("google", function(err, user, info){
        if(err) return res.redirect(`${process.env.CLIENT}/login`)

        return res.redirect(`${process.env.CLIENT}/?token=${user.tokens[user.tokens.length-1]}`)
    })(req, res, next)
}