const passport = require('passport')

exports.loginFacebook = passport.authenticate('facebook', {scope: 'email'})

exports.facebookAuth = function(req, res, next) {
    passport.authenticate("facebook", function(err, user){
        if(err) return res.redirect(`${process.env.CLIENT}/login`)
            console.log('facebookAUth',user)
        return res.redirect(`${process.env.CLIENT}/?token=${user.tokens[user.tokens.length-1]}`)
    })(req, res, next)
}