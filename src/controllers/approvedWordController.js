const ApprovedWord = require('../models/approvedWord')
const Word = require('../models/word')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')

exports.createApprovedWord = catchAsync(async(req, res, next) => {
    const pendingWord = await Word.findOne({_id: req.params.wordID})
    if(!pendingWord) return next(new AppError(404, "Word not found"))
    
    const approvedWord = new ApprovedWord({
        categories: pendingWord.categories,
        word: pendingWord.word,
        definition: pendingWord.definition,
        example: pendingWord.example,
        user: pendingWord.user,
        createdAt: pendingWord.createdAt
    })

    //check duplicate definition from existing approved words
    await approvedWord.checkApprovedDuplicate()

    await approvedWord.save()
    await Word.remove({_id: req.params.wordID})
    console.log('approvedWord', approvedWord)
    return res.status(201).json({
        status: "success",
        data: null
    })
})

exports.getAllApprovedWords = catchAsync(async(req, res, next) => {
    const filters = {...req.query}
    
    const words = await ApprovedWord.find(filters)
    if(!words) return next(new AppError(404, "Word not found"))
    return res.status(200).json({
        status: "success",
        data: words
    })
})

exports.react = catchAsync(async (req, res, next) => {
    const word = await ApprovedWord.findOne({_id: req.params.wordID})
    if(!word) return next(new AppError(404, "Word not found"))
    
    if(req.body.reaction!=="like" && req.body.reaction!=="dislike" && req.body.reaction!=="none"){
        return next(new AppError(400, "Can only like, dislike, or express no reaction"))
    }
    
    //check if "I" user already has reaction for this word. If yes, update the reaction.
    //if no,push it into the word
    let me = word.reacted.find(el => el.user.toString() === req.user._id.toString())

    if(!me){
        word.reacted.push({user: req.user._id, reaction: req.body.reaction })
    } else {
        let meIndex = word.reacted.indexOf(me)
        if(me.reaction === req.body.reaction){
            word.reacted[meIndex].reaction = "none"
        } else{
            word.reacted[meIndex].reaction =  req.body.reaction
        }
    }
    
    await word.save()
    return res.status(200).json({
        status: "success",
        data: word
    })
})