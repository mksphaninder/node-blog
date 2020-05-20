import Post from '../models/Post'
class postController {
    viewCreateScreen(req, res) {
        res.render('create-post');
    }

    create(req, res) {
        let post = new Post(req.body, req.session.user._id);
        post.create().then((postId) => {
            req.flash('success', "The post has been successfully created!")
            req.session.save(() => res.redirect(`/post/${postId}`));
        }).catch((errors) => {
            errors.forEach((e) => req.flash('errors', e));
            req.session.save(() => res.redirect('/create-post'));
        });
    }

    async viewSingle(req, res) {
        try {
            let post = await Post.findSinglePostById(req.params.id, req.visitorId);
            res.render('single-post-screen', { post: post });
        } catch {
            res.render('404');
        }
    }

    async viewEditScreen(req, res) {
        try {
            let postId = req.params.id;
            let postData = await Post.findSinglePostById(postId, req.visitorId);
            if (post.isVisitorOwner) {
                res.render('edit-post', { post: postData });
            } else {
                req.flash('errors', "Permission denied");
                req.session.save(() => res.redirect('/'))
            }
        } catch {
            res.render('404');
        }
    }

    edit(req, res) {
        // find and edit the document in mongo db.
        let postId = req.params.id;
        let visitorId = req.visitorId;
        let post = new Post(req.body, visitorId, postId)
        post.update().then((status) => {
            // The post was suscessfully updated in the DB.
            // There were some validation errors.
            if (status == 'success') {
                req.flash('success', 'The post has been sucees');
                req.session.save(() => {
                    res.redirect(`/post/${req.params.id}/edit`);
                })
            }
        }).catch(() => {
            // return 404
            // if visitor is not he author.
            // if post does not exist.
            req.flash("errors", "Sorry permission denied");
            req.session.save(() => {
                res.redirect("/")
            });
        });
    }

    delete(req, res) {
        Post.delete(req.params.id, req.visitorId).then(() => {
            req.flash('success', "Post Successfully deleted");
            req.session.save(() => {
                res.redirect(`/profile/${req.session.user.username}`)
            })
        }).catch(() => {
            req.flash('errors', "You do not have permission to delete");
            req.session.save(() => res.redirect('/'));
        })
    }
}

export default new postController;