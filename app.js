if (process.env.NODE_ENV !== 'production') { //Is an env variable that is usually dev env or prod env. Checking if its not 'prod'
    require('dotenv').config() //then require dotenv package, which is going to take the variables from the .env, and add them into process.env in my Node app. So i can access them in this file or any other files. 
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
// const catchAsync = require('./utils/catchAsync')
// const { campgroundSchema, reviewSchema } = require('./schemas') //since we will need to extract more schemas from this file later, we can destructure like this one by one.
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoDBStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'


main().catch(err => console.log('CONNECTION ERROR:', err));
async function main() {
    await mongoose.connect(dbUrl)
    console.log("MONGO CONNECTION OPEN!")
}


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(mongoSanitize())

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    //If you are using express-session >= 1.10.0 and don't want to resave all the session on database every single time that the user refreshes the page,
    //you can lazy update the session, by limiting a period of time.
    touchAfter: 24 * 60 * 60, //hr / min / secs 
    //by doing this, setting touchAfter: 24 * 60 * 60 you are saying to the session be updated only one time in a period of 24 hours,
    //does not matter how many request's are made (with the exception of those that change something on the session data)

    crypto: {
        secret: 'thisshouldbeabettersecret!',
    }
})

//look for errors
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    //passing our mongo db store to session config:
    store, //aka store: store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //As a result, even if a cross-site scripting (XSS) flaw exists, and a user accidentally accesses a link that exploits this flaw, the browser (primarily Internet Explorer) will not reveal the cookie to a third party.
        httpOnly: true, //this is an extra layer of security that is default to true, but we're still setting it to true just to make sure.
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Setting Expiration for the cookies. This will be a week. Yeah, weird calculation. We need to set the expiration for cookies, otherwise user will always stay logged in, since authentication uses sessionId from cookie..
        maxAge: 1000 * 60 * 60 * 24 * 7 //setting up max age
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmsjkf0fx/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate())) //authenticate is one of the static methods that have been added to our model automatically by passport-local-mongoose. 
passport.serializeUser(User.serializeUser()) //is telling passsport how to store the user in the session. 
passport.deserializeUser(User.deserializeUser()) //is telling passport how to take the user out of the session.


app.use((req, res, next) => {
    res.locals.signedInUserInfo = req.user;
    res.locals.success = req.flash('success') //passing the flash to all of the templates as a local variable. 
    res.locals.error = req.flash('error')
    next()
})


//NOTE: Moved all the routes to their corresponding router files, hence creating middleware function to invoke those routers.
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use(express.static(path.join(__dirname, 'public')))





app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404))
})

app.use((err, req, res, next) => {
    // const { statusCode = 500, message = 'Something went wrong!' } = err;
    //since with the above code message default text wont be actually save to the err, we can do the following instead so it saves in err so we can also  use it in the error template.
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'OH NO, SOMETHING WENT WRONG!'
    res.status(statusCode).render('error', { err });

})

app.listen('8000', () => {
    console.log('PORT 8000 SERVER CONNECTED')
})