const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeReturnTo } = require('../middleware')
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    //passport.authenticate() will use local strategy(since we specified that, could also specify google strategy, etc.)
    //It automatically takes the password and does the comparison with the one in the db. Does the hashing and stuff to compare.
    //telling it to flash a failure message in case login failed. 
    //telling it to redirect to login in case of failure
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)



module.exports = router; 