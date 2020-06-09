const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User must have name"],
        trim: true,
        toLowerCase: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "User must have email"],
        validate: {
            validator(e){
                if(!validator.isEmail(e)) throw new Error("Invalid email")
            }
        }
    },
    password: {
        type: String,
        trim: true
    },
    tokens: [String],
    role: {
        type: String,
        default: "user"
    },
    scores: {
        type: Number,
        default: 0
    },
    wordCount: {
        type: Number,
        default: 0
    },
    honors: [{
        type: String
    }]
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password.toString(), saltRounds)
    next()
})

//return object without password and __v
userSchema.methods.toJSON = function(){
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.__v
    delete userObject.tokens
    return userObject
}

//find user by credentials and check password
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email: email})
    if(!user) throw new Error('User not found')
    const match = await bcrypt.compare(password.toString(), user.password)
    if(!match) throw new Error('User not found')
    return user
}

//create a token whenever user logins. Maxium 4 tokens
userSchema.methods.generateToken = async function(){
    const token = await jwt.sign({id: this._id}, process.env.SECRET, {expiresIn: '7d'})
    if(this.tokens.length > 4){
        this.tokens.shift()
    }
    this.tokens.push(token)
    await this.save()
    return token
}

userSchema.statics.findOneOrCreate = async function({name, email}){
    let found = await this.findOne({email})
    if(!found) {
        found = await this.create({email, name})
    }
    
    found.token = await found.generateToken();
    
    return found
}

userSchema.statics.calculateUserScores = async function(userID){
    const stats = await this.aggregate([
        {
            $match: {user: userID}
        }
    ])
}

const User = mongoose.model("User", userSchema)
module.exports = User;