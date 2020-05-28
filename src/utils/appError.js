class AppError extends Error {
    constructor(statusCode, message){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4)? "failed" : "error";

        //all error using this class is operational
        this.isOperational = true;
        //create a stack trace for debugging, only between this and the error class
        Error.captureStackTrace(this, this.constructor) 
    }
}

module.exports = AppError;