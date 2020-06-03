const User = require('../models/user')
const Word = require('../models/word')
const ApprovedWord = require('../models/approvedWord')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken')

exports.createUser = catchAsync(async (req, res, next) => {
    console.log('backendddd')
    if (!req.body.password) return next(new AppError(400, "You need to enter a password"))
    const user = new User({
        ...req.body
    })
    await user.save()
    
    return res.status(201).json({
        status: "success",
        data: user
    })
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    return res.status(200).json({
        status: "success",
        data: users
    })
})

exports.getOneUser = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.params.userID })
    if (!user) return next(new AppError(404, "User not found"))
    return res.status(200).json({
        status: "success",
        data: user
    })
})

exports.getMyProfile = catchAsync(async (req, res, next) => {
    const pendingWords = await Word.find({user: req.user._id})
    const approvedWords = await ApprovedWord.find({user: req.user_id})
    return res.status(200).json({
        status: "success",
        user: req.user,
        pendingWords: pendingWords,
        approvedWord: approvedWords
    })
})

exports.getOneUsersApprovedWords = catchAsync(async (req, res, next) => {
    const words =  ApprovedWord.find({ user: req.params.userID }).sort('-scores')
    const countWords = await ApprovedWord.find({ user: req.params.userID }).countDocuments()
    
    
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

exports.getAllWordsByUser = catchAsync(async (req, res, next) => {
    if(req.user.role==='admin' || req.user._id.toString() === req.params.userID){
        const words = await Word.find({ user: req.params.userID })
        const approvedWord = await ApprovedWord.find({ user: req.params.userID })
        const total = words.concat(approvedWord)
        
        return res.status(200).json({
            status: "success",
            data: total,
            totalResult: total.length
        })
    } else {
        return next(new AppError(401, "Unauthorized"))
    }
    
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.userID)
    //delete all pending words made by the user
    await Word.deleteMany({ user: req.params.userID })
    return res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateUser = catchAsync(async (req, res, next) => {
    const allows = ['email', 'password']
    const item = await User.findOne({ _id: req.params.userID })

    Object.keys(req.body).map(el => {
        if (allows.includes(el)) {
            item[el] = req.body[el]
        }
    })

    await item.save()

    return res.status(200).json({
        status: "success",
        data: item
    })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.params
    if (!email) return next(new AppError(400, "Need to provide email"))

    const user = await User.findOne({ email: email })
    //we return success in front end either way to protect user
    if (!user) return res.status(200).json({
        status: "success",
        data: null
    })

    const token = jwt.sign({ email: email }, process.env.SECRET, { expiresIn: '15min' })

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: user.email,
        from: 'n.dinhnguyen95@gmail.com',
        subject: 'Reset Password',
        html: `Click <a href="${process.env.CLIENT}/email/${token}">this link to reset your paswsword`
    };
    sgMail.send(msg);
    console.log('msg====',msg)

    return res.status(200).json({
        status: "success",
        data: null
    })

})

exports.changePassword = catchAsync(async (req, res, next) => {
    const {token} = req.params
    const {password} = req.body
    if(!password) return next(new AppError(400, "Invalid password"))

    const decoded = await jwt.verify(token, process.env.SECRET)

    const user = await User.findOne({email: decoded.email})
    user.password = password
    await user.save()

    return res.status(200).json({
        status: "success",
        data: user
    })
})