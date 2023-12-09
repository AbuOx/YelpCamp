const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

main().catch(err => console.log('CONNECTION ERROR:', err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    console.log("MONGO CONNECTION OPEN!")
}

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10
        const camp = new Campground({
            author: '654b6638f970ce793d5f031a',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quis pariatur adipisci iusto optio, impedit numquam quas, consectetur quia, repellat accusantium vero. In magnam iste officiis magni corporis. Nihil, dolore.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dmsjkf0fx/image/upload/v1700423925/YelpCamp/edjqhwxeu74svjysmn04.webp',
                    filename: 'YelpCamp/edjqhwxeu74svjysmn04',
                },
                {
                    url: 'https://res.cloudinary.com/dmsjkf0fx/image/upload/v1700423927/YelpCamp/r4gu00ir2h1nwtslcof0.jpg',
                    filename: 'YelpCamp/r4gu00ir2h1nwtslcof0',
                },

            ]
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})