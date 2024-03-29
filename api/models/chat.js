const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ChatSchema = new Schema({
    gameID: {type: String},
    users: [{type: Schema.Types.ObjectId,
    ref: 'User'}],
    messages: [{type: Schema.Types.ObjectId,
    ref: 'Message'}]
});




module.exports = mongoose.model("Chat", ChatSchema)