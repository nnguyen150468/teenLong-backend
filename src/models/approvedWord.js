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
    reacted: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        reaction: {
            type: String,
            trim: true
        }
    }],
    reactions: {
        likes: {
            type: Number,
            min: 0,
            default: 0
        },
        dislikes: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    scores: {
        type: Number
    },
    me: {
        type: String,
        default: null
    }   
}, {
    timestamps: true
})

approvedWordSchema.methods.checkApprovedDuplicate = async function(){
    const ApprovedWord = require('./approvedWord')
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

approvedWordSchema.post("save", async function(){
    await this.constructor.calculateReactions(this._id)
})

approvedWordSchema.statics.calculateReactions = async function(wordID){
    const stats = await this.aggregate([
        {  
            $match: { "_id": wordID }
        },
        {$unwind: '$reacted'}, 
        {$unwind: "$reacted.reaction"},
        { 
            $group: {
                _id: "$reacted.reaction" , 
                count: {$sum: 1}
             }
        }
    ])
    
    const likeStats = stats.find(el => el._id === "like")
    const dislikeStats = stats.find(el => el._id === "dislike")
    const word = await this.findByIdAndUpdate(wordID, {
        reactions: {
            likes: likeStats? likeStats.count: 0,
            dislikes: dislikeStats? dislikeStats.count : 0
        }
    },
    { new: true})
    
    
    console.log('likeStatesssss===', stats)
}

const ApprovedWord = mongoose.model("ApprovedWord", approvedWordSchema)
module.exports = ApprovedWord;