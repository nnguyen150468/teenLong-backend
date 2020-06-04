const strategy = require('passport-facebook');
const facebookStrategy = strategy.Strategy;
const User = require('../models/user')

module.exports = new facebookStrategy(
    //1 arg is configuration
    {
        clientID: process.env.FB_ID,
        clientSecret: process.env.FB_SECRET,
        callbackURL: process.env.FB_CB,
        profileFields: ["id", "email", "name"]
    },
    //verification function(callback)
    async function(accessToken, refreshToken, profile, next){
        try{
            const data = profile._json
        
            const user = await User.findOneOrCreate({name: `${data.first_name} ${data.last_name}`, email: data.email})
            console.log("facebook passport", user, user.token)
            next(null, user)
        } catch(err){
            next(err, false)
        }
    }
    )