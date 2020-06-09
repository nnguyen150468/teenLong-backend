const ApprovedWord = require('../models/approvedWord')
const Word = require('../models/word')
const User = require('../models/user')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')
const removeAccents = require('remove-accents')
const ridAccents = require('khong-dau')

exports.createApprovedWord = catchAsync(async(req, res, next) => {
    const pendingWord = await Word.findOne({_id: req.params.wordID})
    if(!pendingWord) return next(new AppError(404, "Word not found"))
    
    const approvedWord = new ApprovedWord({
        categories: pendingWord.categories,
        word: pendingWord.word,
        noAccent: ridAccents(removeAccents(pendingWord.word)), //pendingWord become no accent
        definition: pendingWord.definition,
        example: pendingWord.example,
        user: pendingWord.user,
        createdAt: pendingWord.createdAt,
        image: pendingWord.image
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

    const paginationKeys = ['page', 'limit', 'sort']
    paginationKeys.map(el => delete filters[el])

    const words = ApprovedWord.find(filters).sort("-createdAt")
    
    const countWords = await ApprovedWord.find(filters)
        .countDocuments()

    //*ends try text index * /
    console.log('filers', filters)
    console.log('req.query.page', req.query.page)
    console.log('countWords', countWords)

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

exports.search = catchAsync(async (req, res, next) => {
    const words =  ApprovedWord.find(
        { $text: { 
            $search: req.body.word
            // $diacriticSensitive: true
        }, },
        { score: { $meta: 'textScore' }}
        )
        .sort({ score : { $meta : 'textScore' } })
        .sort('-word -scores')

    const countWords = await ApprovedWord.find(
        { $text: { $search: req.body.word } },
        { score: { $meta: 'textScore' }}
        )
        .countDocuments()

    //*ends try text index * /
    
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

exports.filterByFirstChar = catchAsync(async (req, res, next) => {
    const firstChar = req.params.firstChar.toLowerCase()
    let words
    let countWords

    if(firstChar === "*"){
        words = ApprovedWord.find({"noAccent": {$regex: new RegExp(/^[^A-Za-z]/)}})
        countWords = await ApprovedWord.find({"noAccent": {$regex: new RegExp(/^[^A-Za-z]/)}}).countDocuments()
    } else {
        words = ApprovedWord.find({"noAccent": {$regex: new RegExp(`^${firstChar}.*`)}})
        countWords = await ApprovedWord.find({"noAccent": {$regex: new RegExp(`^${firstChar}.*`)}}).countDocuments()
    }

    if(req.query.page || req.query.limit){
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const skip = (page - 1)*limit
        words.skip(skip).limit(limit)

        if(req.query.page && skip > countWords){
            return next(new AppError(400, "Page number out of range"))
        }
    }
    
    words.sort('word')
    const sortedResults = await words
    return res.status(200).json({
        status: "success",
        data: sortedResults,
        totalResult: countWords
    })
})

