const mongoose = require('mongoose')
const User = require('./user')
const Category = require('./category')

const wordSchema = new mongoose.Schema({
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
        default: false
    }
    // ,
    // upvotes: {
    //     type: Number
    // },
    // downvotes: {
    //     type: Number
    // },
    // scores: {
    //     type: Number
    // }    
}, {
    timestamps: true
})

wordSchema.methods.toJSON = function(){
    const wordObject = this.toObject()
    if(wordObject.user){
        delete wordObject.user.tokens
        delete wordObject.user.__v
        delete wordObject.user.password
    }
    delete wordObject.__v
    return wordObject
}

wordSchema.pre("save", async function(){
    this.user = await User.findOne({_id: this.user._id})

    //make sure category exists
    const categoryArray = await Category.find({"_id": {$in: this.categories}})
    console.log('categoryArray2', categoryArray)
    if(categoryArray.length!==this.categories.length) throw new Error("Category not found")

    this.categories = await Promise.all(categoryArray)

    return this
})

wordSchema.pre(/^find/, async function(){
    this.populate("user", "_id name email role")

})

const Word = mongoose.model("Word", wordSchema)
module.exports = Word;