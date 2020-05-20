const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const router = require('./router');
const markdown = require('marked');
const sanitizeHTML = require('sanitize-html')
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
    // markdown package
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {
            allowedTags: ['p', 'br', 'ul', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], 
            allowedAttributes: {}
        });
    }
    
    // Make current user id available on request object.
    if(req.session.user) {
        req.visitorId = req.session.user._id
    } else{
        req.visitorId = 0
    }
    // 
    res.locals.user = req.session.user;

    // make all error and succes and flash messages available.

    res.locals.errors = req.flash("errors");
    res.locals.success = req.flash("success");
    next();
})

app.use('/', router) // ?

module.exports = app; // just like default export