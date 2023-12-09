const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension) //extending the extension function/method we created above for sanitization, and adding it to the Joi variable so the below code keep running using 'Joi' refference. 
//Now we can go ahead and add 'escapeHTML' to each of our input validations in the below schema.


// const campgroundSchema = Joi.object({
//     campground: Joi.object({
//         title: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         image: Joi.string().required(),
//         description: Joi.string().required(),
//         location: Joi.string().required(),
//     }).required()
// })

// module.exports.campground = campgroundSchema; // can use campground from outside files to refer to this schema now. 

//Or we could instead do:
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
    }).required(),
    deletedImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})