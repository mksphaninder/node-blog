// Contains all the routes.
import userController from './controllers/userController' // mapping controller for methods
import postController from './controllers/postController' // mapping controller for posts.
const express = require('express'); // initilizing express
const router = express.Router(); // initializing router component

// Routes
// User
router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// posts
router.get('/create-post', userController.auth, postController.viewCreateScreen);
router.post('/create-post', userController.auth, postController.create);
router.get('/post/:id', postController.viewSingle)
module.exports = router // Same as default export