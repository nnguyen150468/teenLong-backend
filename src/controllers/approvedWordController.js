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
