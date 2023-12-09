const express = require('express');
const router = express.Router()
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary') //Node automatically looks for index.js file. fyi
const upload = multer({ storage }) //dest - destination, where we want to store our images. We should put the Cloudinary path there instead of locally storing on the uploads folder.


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {  //Use 'single' for one file, 'array' for multiple fiels. 'image' is the file input in name on the form in new.ejs.
//     console.log(req.body, req.files)
//     res.send('IT WORKED!')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;
