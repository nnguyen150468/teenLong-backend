const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const voteSchema = new mongoose.Schema({
    word: {
        type: mongoose.Schema.ObjectId,
        ref: "ApprovedWord",
        required: [true, "What word are you voting for?"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Vote must have a user"]
    },
    reaction: {
        type: String
    }
}, {
    timestamps: true,
    // toJSON: {virtuals: true},
    // toObject: {virtuals: true}
})

// voteSchema.methods.toJSON = function(){

// }

voteSchema.pre("save", async function(){
    console.log('this',this)
    // this.word = await Word.findById(this.word)
})

const Vote = mongoose.model("Vote", voteSchema)
module.exports = Vote;