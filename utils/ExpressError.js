class ExpressError extends Error { //Error is the default error class of the Express it self
    constructor(message, statusCode) {
        super()  //to utilize the already existing constructor of the Error class
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = ExpressError;