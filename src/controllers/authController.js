const User = require('../models/user')
const catchAsync = require('../middlewares/catchAsync')
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken')

//login by email and password, then generate a token
exports.login = catchAsync(async (req, res, next)=>{
    const {email, password} = req.body
    if(!email || !password) return next(new AppError(400, "Invalid email or password"))
    const user = await User.findByCredentials(email, password)
    const token =  await user.generateToken()
    return res.status(200).json({
        status: "success",
        data: user,
        token: token
    })
})

exports.auth = catchAsync(async(req, res, next) => {
    const headers = req.headers.authorization
    if(!headers || !headers.startsWith('Bearer')){
        return next(new AppError(401, "Unauthorized access"))
    }
    const token = headers.replace("Bearer ", "")
    const decoded = await jwt.verify(token.toString(), process.env.SECRET)
    
    const user = await User.findOne({_id: decoded.id})
    
    req.user = user;

    next()
})

//check if user is admin
exports.checkAdmin = catchAsync(async (req, res, next) => {
    if(req.user.role==='admin'){
        return next()
    } else{
        return next(new AppError(401, "Only admin is allowed"))
    }
})

//check if it's correct user or admin to delete/update an account
exports.checkPermission = catchAsync(async (req, res, next) => {
    if(req.user.role!=='admin' && req.user._id.toString()!==req.params.userID.toString()){
        return next(new AppError(401, "Unauthorized access"))
    }
    next()
})

//log out one device
exports.logout = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization.replace("Bearer ", "")
    req.user.tokens = req.user.tokens.filter(el => el.toString()!==token)
    await req.user.save()
    return res.status(204).json({
        status: "success",
        data: null
    })
})

exports.logoutAll = catchAsync(async (req, res, next) => {
    req.user.tokens = []
    await req.user.save()
    return res.status(204).json({
        status: "success",
        data: null
    })
})