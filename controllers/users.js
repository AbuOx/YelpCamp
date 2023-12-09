const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err) //if theres error, call error handler middleware to handle this error.
            req.flash('success', `Welcome to YelpCamp, ${username}!`)
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds' //If req.session.returnTo is false, then saves '/campgrounds' in the variable. This is called "Short Circuit Evaluation"
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    //the req.logout() method now requires a callback function passed as an argument. 
    //Inside this callback function, we will handle any potential errors and also execute the code to set a flash message and redirect the user.
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    })
}