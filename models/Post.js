const postsCollection = require('../db').db().collection("posts");
const objectId = require('mongodb').ObjectID;
import sanitizeHTML from 'sanitize-html';
import User from './User';
class Post {
    constructor(data, userid, requestedPostId) {
        this.data = data;
        this.userid = userid;
        this.errors = [];
        this.requestedPostId = requestedPostId;
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
            title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
            body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
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
                postsCollection.insertOne(this.data).then((info) => {
                    // Mongodb will return an object which has the property ops.
                    // Since we are only creating one document we need only the first one in the array.
                    resolve(info.ops[0]._id); 
                }).catch(() => {
                    this.errors.push('please try again later : DB problem.')
                    reject(this.errors);
                });

            }
        })
    }

    static reusablePostQuery(uniqueOperations, visitorId) {
        return new Promise(async (resolve, reject) => {
            let aggOperation = uniqueOperations.concat([{ $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            {
                $project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    authorId: "$author",
                    author: { $arrayElemAt: ["$authorDocument", 0] }
                }
            }]);
            let posts = await postsCollection.aggregate(aggOperation).toArray()
            // Clean Author property in each post object.
            posts = posts.map((post) => {
                post.isVisitorOwner = post.authorId.equals(visitorId);
                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar,
                }
                return post
            })
            resolve(posts)
        });
    }

    static findSinglePostById(id, visitorId) {
        return new Promise(async (resolve, reject) => {
            if (typeof (id) != 'string' || !objectId.isValid(id)) {
                reject();
                return;
            }

            let posts = await this.reusablePostQuery([
                {
                    $match: {
                        _id: new objectId(id)
                    }
                }
            ], visitorId)

            if (posts.length) {
                resolve(posts[0]);
            } else {
                reject();
            }
        });
    }

    static findByAuthorId(authorId) {
        return this.reusablePostQuery([
            {$match : {author: authorId}},
            {$sort : {createdDate: -1}}
        ]);
    }

    actuallyUpdate() {
        return new Promise(async(resolve, reject)=> {
            this.cleanup();
            this.validate();
            if(!this.errors.length) {
                await postsCollection.findOneAndUpdate({
                    _id: new objectId(this.requestedPostId)
                }, {$set : {
                    title: this.data.title,
                    body: this.data.body
                }});
                resolve("success");
            } else {
                resolve("failure");
            }
        })
    }

    update() {
        return new Promise(async(resolve, reject)=> {
            try {
                let post = await Post.findSinglePostById(this.requestedPostId, this.userid);
                if(post.isVisitorOwner) {
                    // update the DB
                    let status = await this.actuallyUpdate();
                    resolve(status);
                }else {
                    reject();
                    return;
                }
            } catch {
                reject()
            }
        })
    }

    static delete(postIdToDelete, currentUserId) {
        return new Promise(async(resolve, reject)=> {
            try {
                let post = await Post.findSinglePostById(postIdToDelete, currentUserId);
                console.log(post.isVisitorOwner);
                if(post.isVisitorOwner) {
                    await postsCollection.deleteOne({_id: new objectId(postIdToDelete)});
                    resolve();
                } else {
                    reject();
                }
            } catch {
                reject();
            }
        })
    }
}

export default Post;