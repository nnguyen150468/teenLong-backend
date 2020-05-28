const Word = require('../models/word')
const ApprovedWord = require('../models/approvedWord')
const catchAsync = require('./catchAsync')
const AppError = require('../utils/appError')

exports.checkDuplicate = catchAsync(async(req, res, next) => {
    const existingWords = await Word.find({word: req.body.word})

    //check if the same definition already exists. If yes, return error
    existingWords.map(el => {
        if(el.definition===req.body.definition)
        return next(new AppError(400, "Duplicate definition"))
    })
    
    const existingApprovedWords = await ApprovedWord.find({word: req.body.word})

    //check if the same definition already exists. If yes, return error
    existingApprovedWords.map(el => {
        if(el.definition===req.body.definition)
        return next(new AppError(400, "Duplicate definition"))
    })

    next()
})