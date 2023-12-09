const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
//grab our mapbox token
const mapBoxToken = process.env.MAPBOX_TOKEN;
//Instanciate a new mapBox geocoding instance, passing it our mapbox token, and then assigning it to a variable
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        //parameters:
        query: req.body.campground.location, //city/state value from our location field
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    //Adding geometry(long and lat) to the geomtry field in out model in DB
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully saved the new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampgrounds = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save();

    if (req.body.deletedImages) {

        //find each filename from the deletedImages array, and then destroy/delete each of them in clodinary host.
        for (let filename of req.body.deletedImages) {
            await cloudinary.uploader.destroy(filename)
        }

        //If deletedImages has any selected images in it, then get the same campground above, update it, delete/pull out imageS that have filenameS IN 'req.body.deletedImages'
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deletedImages } } } })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}