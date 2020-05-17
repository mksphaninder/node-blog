const postsCollection = require('../db').db().collection("posts");
const objectId = require('mongodb').ObjectID;
class Post {
    constructor(data, userid) {
        this.data = data;
        this.userid = userid;
        this.errors = []
    }
    cleanup() {
        if(typeof(this.data.title) != 'string') {
            this.data.title = ''
        }
        if(typeof(this.data.body) != 'string') {
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
        if(this.data.title == '') {
            this.errors.push("Title is empty");
        }
        if(this.data.body == '') {
            this.errors.push("body is empty");
        }
    }

    create() {
        return new Promise((resolve, reject)=>{
            this.cleanup();
            this.validate();
            if(this.errors.length > 0) {
                reject()
            } else {
                postsCollection.insertOne(this.data).then(()=> {
                    resolve();
                }).catch(()=> {
                    this.errors.push('please try again later : DB problem.')
                    reject(this.errors);
                });
                
            }
        })
    }
}

export default Post;