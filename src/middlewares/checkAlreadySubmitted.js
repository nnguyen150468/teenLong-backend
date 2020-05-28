const Word = require('../models/word')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')

exports.checkAlreadySubmitted = catchAsync(async(req, res, next) => {
    //check if user has submitted the same word for more than 5 times
    //if yes do not allow to submit more of the same word
    const sameSubmissions = await Word.find({word: req.body.word, user: req.user._id})
    if(sameSubmissions.length >= 2) return next(new AppError(400, "Cannot submit more than 5 entries of the same word"))
    next()
})