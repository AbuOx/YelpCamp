const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMongoose); //This will add on to our schema these fields: username(makes sure they're unique), password. Also will give us some additional methods that we can use. 

module.exports = mongoose.model('User', userSchema)