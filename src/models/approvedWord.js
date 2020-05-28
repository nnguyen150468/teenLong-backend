const mongoose = require('mongoose')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')

const approvedWordSchema = new mongoose.Schema({
    word: {
        type: String,
        trim: true,
        required: [true, "Word is required"]
    },
    definition: {
        type: String,
        trim: true,
        required: [true, "Word must have definition"]
    },
    example: {
        type: String,
        required: [true, "Word must have example"]
    },
    categories: [String],
    image: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Word must have contributing user"]
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    upvotes: {
        type: Number
    },
    downvotes: {
        type: Number
    },
    scores: {
        type: Number
    }    
}, {
    timestamps: true
})

approvedWordSchema.methods.checkApprovedDuplicate = async function(){
    const ApprovedWord = require('./approvedWord')
    console.log('this====', this)
    const existingWords = await ApprovedWord.find({word: this.word})

    //check if the same definition already exists. If yes, return error
    existingWords.map(el => {
        if(el.definition===this.definition)
        throw new Error("Duplicate definition")
    })
    
    return this 
}

approvedWordSchema.pre(/^find/, function(){
    this
    .populate("user", "_id email name role")
})

const ApprovedWord = mongoose.model("ApprovedWord", approvedWordSchema)
module.exports = ApprovedWord;