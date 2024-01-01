const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const deepPopulate = require('mongoose-deep-populate')(mongoose)

const UserSchema = new Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    password: { type: String, required: true},
    profilePicture: {type: String},
    betWins: {
        type: Number,
        default: 0
    },
    betLoses: {
        type: Number,
        default: 0
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'Follow'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'Follow'

    }]
});

UserSchema.plugin(deepPopulate)


     
UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
     

//Comparing inputted login password with users password for authentication
//returns boolean
//true if password matches 
//false if password doesn't match 
UserSchema.methods.comparePassword = function(password, next) {
    let user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model("User", UserSchema);
