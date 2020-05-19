import Post from '../models/Post'
class postController {
    viewCreateScreen(req, res) {
        res.render('create-post');
    }

    create(req, res) {
        let post = new Post(req.body, req.session.user._id);
        post.create().then(() => {
            res.send('New post created!');
        }).catch((e) => {
            res.send(e);
        });
    }

    async viewSingle(req, res) {
        try {
            let post = await Post.findSinglePostById(req.params.id);
            res.render('single-post-screen', {post: post});
        } catch {
            res.render('404');
        }
    }
}

export default new postController;