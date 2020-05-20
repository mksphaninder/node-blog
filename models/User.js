// User Model.
import validator from 'validator'; // importing the validator pckage form npm
import bcrypt from 'bcryptjs';
import md5 from 'md5';
const userCollection = require('../db').db().collection('users'); // getting the db object for the collection users

class User {
    constructor(data, getAvatar) {
        this.data = data;
        this.errors = [];
        // this.avatar = '';

        if(getAvatar == undefined) {
            getAvatar = false;
        }
        if(getAvatar) {
            this.getAvatar();
        }
    }
    // Sanitizing the Data from the user.
    cleanup() {
        // Checking if the data given is a string.
        if (typeof (this.data.username) != "string") {
            this.data.username = "";
        }
        if (typeof (this.data.email) != "string") {
            this.data.email = "";
        }
        if (typeof (this.data.password) != "string") {
            this.data.password = "";
        }
        // Overwriting the values from the user.
        this.data = {
            username: this.data.username.trim().toLowerCase(), // triming all the extraspaces and converting to lowercase.
            email: this.data.email,
            password: this.data.password
        };
    }

    validate() {
        // Just performing some regular validations, would have been good if we had some package for this.
        return new Promise(async (resolve, reject) => {
            if (this.data.username == "") {
                this.errors.push("Username cannot be empty");
            }
            if (this.data.username.length > 0 && this.data.username < 3) {
                this.errors.push("The username should be atleast 3 characters")
            }
            if (this.data.username.length > 30) {
                this.errors.push("username cannot exceed more than 30 charcters");
            }
            if (!validator.isAlphanumeric(this.data.username)) {
                this.errors.push("username cannot have special characters");
            }
            if (this.data.email == "") {
                this.errors.push("email cannot be empty");
            }
            if (!validator.isEmail(this.data.email)) {
                this.errors.push("The Email is invalid");
            }
            if (this.data.password == "") {
                this.errors.push("password cannot be empty");
            }
            if (this.data.password.length < 12) {
                this.errors.push("The password should be atleast 12 characters");
            }
            if (this.data.password.length > 50) {
                this.errors.push("The password cannot exceed 50 characters");
            }

            // only if username is valid check if username & email exist
            if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric) {
                let usernameExists = await userCollection.findOne({
                    username: this.data.username
                })
                if (usernameExists) {
                    this.errors.push("this username is already taken!")
                }
            }
            // checking if email is valid and checking if already exist
            if (validator.isEmail(this.data.email)) {
                let emailExists = await userCollection.findOne({
                    email: this.data.email
                })
                if (emailExists) {
                    this.errors.push("this Email is already taken!")
                }
            }
            resolve();
        })
    }
    // Registering a new user. 
    async register() {
        // Validate the data
        return new Promise(async(resolve, reject) => {
            this.cleanup();
            await this.validate();

            // Only if no validation errors save data to DB.
            if (!this.errors.length) {
                // hashing the password
                // salt
                let salt = bcrypt.genSaltSync(10)
                this.data.password = bcrypt.hashSync(this.data.password, salt);
                await userCollection.insertOne(this.data); // creating a new entry into the db.
                this.getAvatar();
                resolve()
            } else {
                reject(this.errors);
            }
        })
    }
    login() {
        return new Promise((resolve, reject) => {
            this.cleanup();
            // The mongodb package returns a promise when the findOne method is called.
            userCollection.findOne({ username: this.data.username }).then((attemptedUser) => {
                // attemptedUser = result for the query for the db
                if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                    this.data = attemptedUser
                    this.getAvatar(); // Need to find a way to make this work without gravatar.
                    resolve('congrats!');
                } else {
                    reject('Invalid');
                }
            }).catch((e) => {
                reject('please try again later');
            });
            
        })
    }

    getAvatar() {
        this.avatar = `http://gravatar.com/avatar/${md5(this.data.email)}?s=128`
    }

    static findByUsername(username){
        return new Promise((resolve, reject)=> {
            if(typeof(username) != 'string') {
                reject();
                return;
            }
            userCollection.findOne({username: username})
            .then((userDoc)=>{
                if(userDoc) {
                    userDoc = new User(userDoc, true)
                    userDoc = {
                        _id: userDoc.data._id,
                        username: userDoc.data.username,
                        avatar: userDoc.avatar
                    }
                    resolve(userDoc);
                }
            }).catch(()=>{
                reject();
            });
        })
    }
}

export default User;