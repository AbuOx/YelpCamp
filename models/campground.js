const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')


const ImagesSchema = new Schema({
    url: String,
    filename: String
})

//our url example: https://res.cloudinary.com/dmsjkf0fx/image/upload/v1700852844/YelpCamp/fm1jr8hji4b6ptbngnew.jpg
ImagesSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

// So need to add this here
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [  //we could potentially have multiple images per campground, hence making it an array field. 
        ImagesSchema //using our imagesSchema that has 'url' and 'filename' fields in it. 
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
    // and this here:
}, opts)

//Since we want a nested property like:
// properties: {
//     popupMarkup: '<h2>some text</h2>'
// }
//Virtual allows us to make it nested: properties.popupMarkup.
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`

})

//Note: This is Query Middleware.  - One of the 4 Mongoose middleware types
CampgroundSchema.post('findOneAndDelete', async function (doc) { //whatever campground/document is deleted will be returned in this 'doc' param, so we can use it to get the campground review array, etc. 
    if (doc) { //if doc has anything in it
        await Review.deleteMany( //delete all the reviews that are in doc.reviews
            {
                _id:
                    { $in: doc.reviews }
            })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)