const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/user');
const { array } = require('../utilities/uploadPhoto');


const FollowSchema = new Schema({
    userToFollow: {type: Schema.Types.ObjectId,
    ref: 'User'},
    userRequesting: {type: Schema.Types.ObjectId,
    ref: 'User'},
    isAccepted: Boolean,
});


FollowSchema.pre('findOneAndDelete', async function() {
    try {
        let foundUserToFollow = await User.findByIdAndUpdate(this._conditions.userToFollow, { $pull: {
            followers: this._conditions._id
        }}).exec()
        let foundUserRequesting = await User.findByIdAndUpdate(this._conditions.userRequesting, { $pull: {
            following: this._conditions._id
        }}).exec()

        await foundUserRequesting.save();
        await foundUserToFollow.save()

    } catch(err) {
        return
    }



    
})

module.exports = mongoose.model("Follow", FollowSchema)