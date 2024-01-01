const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const MessageSchema = new Schema({
    sentID: {type: Schema.Types.ObjectId, ref: 'User'},
    sentUsername:  String,
    sentProfilePic: String,
    text: String,
    dateSent: Date
});




module.exports = mongoose.model("Message", MessageSchema)