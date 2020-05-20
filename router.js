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

// profile
router.get('/profile/:username', userController.ifUserExists, userController.profilePostsScreen);

// posts
router.get('/create-post', userController.auth, postController.viewCreateScreen);
router.post('/create-post', userController.auth, postController.create);
router.get('/post/:id', postController.viewSingle);
router.get('/post/:id/edit', userController.auth, postController.viewEditScreen);
router.post('/post/:id/edit', userController.auth, postController.edit);
router.post('/post/:id/delete', userController.auth, postController.delete);
module.exports = router // Same as default export