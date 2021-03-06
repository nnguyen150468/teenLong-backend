const mongoose = require('mongoose')
const User = require('./user')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')

const approvedWordSchema = new mongoose.Schema({
    word: {
        type: String,
        trim: true,
        required: [true, "Word is required"],
        text: true
    },
    noAccent: {
        type: String,
        trim: true,
        lowercase: true
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
        type: Number,
        default: 0
    },
    me: {
        type: String,
        default: null
    }   
}, {
    timestamps: true
})

approvedWordSchema.path('word').index({text : true});
approvedWordSchema.path('scores').index({number : true});

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

approvedWordSchema.methods.toJSON = function async(){
    const wordObject = this.toObject()
    delete wordObject.reacted
    return wordObject
}

approvedWordSchema.pre(/^find/, function(){
    this
    .populate("user", "_id email name role")
})

approvedWordSchema.post("save", async function(){
    await this.constructor.calculateReactions(this._id)
    await this.constructor.calculateUserScores(this.user._id)
    // await this.constructor.calculateHonors()
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
    
    //get object that include the count for likes and dislikes
    const likeStats = stats.find(el => el._id === "like")
    const dislikeStats = stats.find(el => el._id === "dislike")
    
    const word = await this.findByIdAndUpdate(wordID, {
        reactions: {
            likes: likeStats? likeStats.count: 0,
            dislikes: dislikeStats? dislikeStats.count : 0
        },
        scores: (likeStats && likeStats.count || 0) - (dislikeStats && dislikeStats.count || 0)
    },
    { new: true})
    
}


approvedWordSchema.statics.calculateUserScores = async function(userID){
    const stats = await this.aggregate([
        {
            $match: {user: userID}
        },
        {
            $group: {
                _id: "$user",
                userScores: {$sum: "$scores"},
                wordCount: {$sum: 1}
            }
        }
    ])

    await User.findByIdAndUpdate(userID, {
        scores: stats[0].userScores,
        wordCount: stats[0].wordCount
    },
    { new: true })
}

approvedWordSchema.statics.calculateHonors = async function(next){
    const previousHighScorer = await User.findOne({honors: {$in: ["highScorer"]}})
    const previousMostPost = await User.findOne({honors: {$in: ["mostPost"]}})
    const highestScoreUsers = await User.aggregate([
        {$match: {}},
        {$sort: {scores: -1}},
        {$limit: 1}
    ])

    const mostPosts = await User.aggregate([
        {$match: {}},
        {$sort: {wordCount: -1}},
        {$limit: 1}
    ])

    let highestScoreUser = await User.findOne({_id: highestScoreUsers[0]._id})
    let mostPost = await User.findOne({_id: mostPosts[0]._id})

    if(previousHighScorer){
        if(previousHighScorer._id.toString() !== highestScoreUser._id.toString()){
            previousHighScorer.honors.filter(el => el.toString() !== "highScorer")
            console.log('previousHighScorer', previousHighScorer)
            highestScoreUser.honors.push('highScorer')
            await previousHighScorer.save()
        }
    } else {
        highestScoreUser.honors.push('highScorer')
    }
    
    
    if(previousMostPost){
        if(previousMostPost._id.toString() !== mostPost._id.toString()){
            previousMostPost.honors.filter(el => el.toString() !=="mostPost")
            console.log('previousMostPost', previousMostPost)
            mostPost.honors.push('mostPost')
            await previousMostPost.save()
        }
    } else {
        mostPost.honors.push('mostPost')
    }
    
    await highestScoreUser.save()
    await mostPost.save()
}

const ApprovedWord = mongoose.model("ApprovedWord", approvedWordSchema)
module.exports = ApprovedWord;