import User from '../models/User'; // importing the model.
import Post from '../models/Post'; // Posts model.
import { resolveInclude } from 'ejs';

// Controller specific actions that are linked with user
class userController {

    auth(req, res, next) {
        if (req.session.user) {
            next()
        } else {
            req.flash("errors", "You must login first")
            req.session.save(() => {
                res.redirect('/')
            })
        }
    }

    login(req, res) {
        let user = new User(req.body) // creating a object for User model
        user.login().then((result) => {
            req.session.user = { avatar: user.avatar, username: user.data.username, _id: user.data._id }
            req.session.save(() => {
                res.redirect('/')
            })
        }).catch((error) => {
            req.flash('errors', error);
            req.session.save(() => {
                res.redirect('/');
            })
        });
    }

    logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/')
        });
    }

    register(req, res) {
        let user = new User(req.body);
        user.register().then(() => {
            req.session.user = {
                username: user.data.username,
                avatar: user.avatar,
                _id: user.data._id
            }
            req.session.save(() => {
                res.redirect('/');
            });
        }).catch((regErrors) => {
            regErrors.forEach((e) => {
                req.flash('regErrors', e);
            })
            req.session.save(() => {
                res.redirect('/');
            });
        });
    }

    home(req, res) {
        if (!req.session.user) {
            res.render('home-guest', { regErrors: req.flash('regErrors') }); // render method will load the HTML.
        } else {
            res.render('home-dashboard');
        }
    }

    ifUserExists(req, res, next) {
        User.findByUsername(req.params.username).then((userDocument) => {
            req.profileUser = userDocument;
            next()
        }).catch(() => {
            res.render('404');
        })
    }

    profilePostsScreen(req, res) {
        // ask post model for the accurate posts for a post id.
        Post.findByAuthorId(req.profileUser._id).then((posts) => {
            res.render('profile-posts', {
                posts: posts,
                profileUsername: req.profileUser.username,
                profileAvatar: req.profileUser.avatar
            });
        }).catch(() => {
            res.render('404')
        });

    }

}

export default new userController;