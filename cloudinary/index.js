const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//Associating our account to the cloudinary instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

//Setting up an instance of the Cloudinary Storage in this file, so that its now configured to have our credentials 
//for our particular Cloudinary account, and we specify the filder where the files need to sit there, and formats we allow.. 
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'pgp', 'jpg']
    }
})

module.exports = {
    cloudinary,
    storage
}