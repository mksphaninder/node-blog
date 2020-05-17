const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const router = require('./router');

let sessionOptions = session({
    secret: "JS is so cool",
    store: new MongoStore({ client: require('./db') }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
});
app.use(sessionOptions);
app.use(flash());
app.use(express.static('public')); // location for css files
app.set('views', 'views'); // View resolver
app.set('view engine', 'ejs'); // view files type.
app.use(express.urlencoded({ extended: false })); // lets express read from request params
app.use(express.json()); // lets express send json data
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
})
app.use('/', router) // ?

module.exports = app; // just like default export