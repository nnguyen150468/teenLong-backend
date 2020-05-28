const Word = require('../models/word')
const catchAsync = require('./catchAsync')
const AppError = require('../utils/appError')

exports.checkUserWord = catchAsync(async(req, res, next) => {
    const word = await Word.findOne({_id: req.params.wordID})
    if(!word) return next(new AppError(404, 'Word not found'))
    if(word.user._id.toString()!==req.user._id.toString()) return next(new AppError(401, 'You can only modify your own word'))
    if(word.isApproved) return next(new AppError(400, 'You cannot modify approved word'))
    next()
})