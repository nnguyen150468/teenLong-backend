const Word = require('../models/word')
const ApprovedWord = require('../models/approvedWord')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')
const removeAccents = require('remove-accents')
const ridAccents = require('khong-dau')

exports.createWord = catchAsync(async(req, res, next)=>{
    if(req.user.role==="user"){
        console.log('as userrr')
        const word = new Word({
            ...req.body,
            user: req.user._id
        })
        await word.save()
        return res.status(201).json({
            status: "success",
            data: word
        })
    }
    
    if(req.user.role==="admin" || req.user.role==="moderator"){
        console.log('as adminnn')
        const word = new ApprovedWord({
            ...req.body,
            noAccent: ridAccents(removeAccents(req.body.word)),
            user: req.user._id
        })
        await word.save()
        return res.status(201).json({
            status: "success",
            data: word
        })
    }
})

exports.getAllPendingWords = catchAsync(async(req, res, next) => {
    const pendingWords = await Word.find()
    return res.status(200).json({
        status: "success",
        data: pendingWords
    })
})

exports.deletePendingWord = catchAsync(async(req, res, next) => {
    await Word.findOneAndDelete({_id: req.params.wordID, user: req.user._id})
    return res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getAllMyPendingWords = catchAsync(async(req, res, next) => {
    const words =  Word.find({user: req.user._id}).sort('-createdAt')
    const countWords = await Word.find({user: req.user._id}).countDocuments()
    
    if(req.query.page || req.query.limit){
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const skip = (page - 1)*limit
        words.skip(skip).limit(limit)

        if(req.query.page && skip > countWords){
            return next(new AppError(400, "Page number out of range"))
        }
    }

    const sortedResults = await words;

    return res.status(200).json({
        status: "success",
        data: sortedResults,
        totalResult: countWords
    })
})

exports.getAllMyApprovedWords = catchAsync(async(req, res, next) => {
    const words =  ApprovedWord.find({user: req.user._id}).sort('-createdAt')
    const countWords = await ApprovedWord.find({user: req.user._id}).countDocuments()

    if(req.query.page || req.query.limit){
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const skip = (page - 1)*limit
        words.skip(skip).limit(limit)

        if(req.query.page && skip > countWords){
            return next(new AppError(400, "Page number out of range"))
        }
    }

    const sortedResults = await words;

    return res.status(200).json({
        status: "success",
        data: sortedResults,
        totalResult: countWords
    })
})


exports.getAllMyWords = catchAsync(async(req, res, next) => {
    const pendingWords = await Word.find({user: req.user._id})
    const approvedWords = await ApprovedWord.find({user: req.user._id})
    if(!pendingWords && !approvedWords) return next(new AppError(404, "No word found"))
    return res.status(200).json({
        status: "success",
        pendingWords: pendingWords,
        approvedWords: approvedWords
    })
})

exports.updatePendingWord = catchAsync(async(req, res, next) => {

    const allows = ['word', 'definition', 'example']
    const item = await Word.findOne({_id: req.params.wordID, user: req.user._id})
    
    Object.keys(req.body).map(el => {
        if(allows.includes(el)){
            item[el] = req.body[el]
        }
    })

    await item.save()

    return res.status(200).json({
        status: "success",
        data: item
    })
})