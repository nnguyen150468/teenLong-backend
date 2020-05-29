const Vote = require('../models/vote')
const ApprovedWord = require('../models/approvedWord')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')

exports.createVote = catchAsync(async(req, res, next)=>{

    if(req.body.reaction!=="like" 
    && req.body.reaction!=="dislike" &&req.body.reaction!=="none"){
        return next(new AppError(400, "Can only like or dislike or no reaction"))
    }

    //check word exists
    const word = await ApprovedWord.findOne({_id: req.params.wordID})
    if(!word) return next(new AppError(404, "Word not found"))

    const vote = await Vote.findOneAndUpdate({
        word: req.params.wordID,
        user: req.user._id
    },
    {  
        ...req.body
    },
    { new: true, upsert: true})
    .populate("word", "word definition example -user")
    .populate("user", "name email")


    return res.status(201).json({
        status: "success",
        data: vote
    })
})