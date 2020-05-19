const postsCollection = require('../db').db().collection("posts");
const objectId = require('mongodb').ObjectID;
import User from './User';
class Post {
    constructor(data, userid) {
        this.data = data;
        this.userid = userid;
        this.errors = []
    }
    cleanup() {
        if (typeof (this.data.title) != 'string') {
            this.data.title = ''
        }
        if (typeof (this.data.body) != 'string') {
            this.data.body = ''
        }
        // get rid of bogus props
        this.data = {
            title: this.data.title.trim(),
            body: this.data.body.trim(),
            createdDate: new Date(),
            author: objectId(this.userid)
        }
    }

    validate() {
        if (this.data.title == '') {
            this.errors.push("Title is empty");
        }
        if (this.data.body == '') {
            this.errors.push("body is empty");
        }
    }

    create() {
        return new Promise((resolve, reject) => {
            this.cleanup();
            this.validate();
            if (this.errors.length > 0) {
                reject()
            } else {
                postsCollection.insertOne(this.data).then(() => {
                    resolve();
                }).catch(() => {
                    this.errors.push('please try again later : DB problem.')
                    reject(this.errors);
                });

            }
        })
    }
    static findSinglePostById(id) {
        console.log('bob')
        return new Promise(async(resolve, reject)=> {
            if(typeof(id) != 'string' || !objectId.isValid(id)) {
                reject();
                return;
            }
            let posts = await postsCollection.aggregate([
                {$match: {_id: new objectId(id)}},
                {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
                {$project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    author: {$arrayElemAt: ["$authorDocument", 0]}
                }}
            ]).toArray()

            // Clean Author property in each post object.
            posts = posts.map((post)=> {
                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar,
                }
                return post
            })
            if (posts.length) {
                console.log(posts[0]);
                resolve(posts[0]);
            } else {
                reject();
            }
        });
    }
}

export default Post;