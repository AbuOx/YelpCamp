//Making a function - func, that returns an anonymous function and executes the func, and catches any errors in case happens, and passes it to next. 
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}