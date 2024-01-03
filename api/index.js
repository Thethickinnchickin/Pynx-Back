const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const http = require('http');
const server = http.createServer(app);
require('dotenv').config({ path: './.env'})
const Chat = require('./models/chat');
const Message = require('./models/message');
const User = require('./models/user')
const io = require('socket.io')(server, {
    rejectUnauthorized: false,
})

//Connecting to Mongoose
mongoose.connect(
    process.env.DATABASE,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});



app.use(cors());


app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'attribution-reporting=(), run-ad-auction=(), join-ad-interest-group=(), browsing-topics=()');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '50000mb', extended: false}));

//ADDING ROUTES
const AuthRoutes = require('./routes/auth');
const OddsRoutes = require('./routes/odds');
const BetsRoutes = require('./routes/bets');
const AdminRoutes = require('./routes/admin');
const SocialRoutes = require('./routes/social');
const UserRoutes = require('./routes/user');

app.get("/greet", (req, res) => {

    res.send({ msg: `Welcome!` });
});

app.use('/api/auth', AuthRoutes);

app.use('/api/admin', AdminRoutes);

app.use('/api/social', SocialRoutes);

app.use('/api', UserRoutes)

app.use('/api', OddsRoutes);

app.use('/api', BetsRoutes);



const port = process.env.API_PORT || 7000;

server.listen(port, (err) => {
    console.log(this)
    if (err) {
        console.log(err);
    } else {
        console.log(`API: Listening on port 7000`);
    }
})



io.on('connection', (socket) => {
    
    // socket = io({transports: ['websocket', 'polling']})

    socket.on('get-messages', async function (gameID, userID, fn) {
        console.log('Whats up man')
        thing = gameID
        socket.join(gameID)


        
        let chat = await Chat.find({gameID: gameID}).populate('messages users').exec()

        

        let newChat;
        let user;
        
        if(chat.length <= 0) {
            newChat = new Chat({gameID: gameID});
            user = await User.findById(userID);
            newChat.users.push(user)

        
            await newChat.save()
            

            
            
            
            
        } else {
            newChat = chat[0]
            user = await User.findById(userID);
            if(!newChat.users.find(user => user._id == userID)) {
                newChat.users.push(user)
                await newChat.save()
                io.to(gameID).emit("player-join", user)
            }       
  
        }

        fn(newChat)



    })

    socket.on('send-message', async function(user, chatID, text, gameID) {

        let newMessage = new Message({
            sentID: user._id,
            sentUsername: user.name,
            sentProfilePic: user.profilePicture,
            text: text,
            dateSent: new Date()
        });


        
        newMessage.save();



        let foundChat = await Chat.findByIdAndUpdate(chatID,
            {$push: {"messages": newMessage}}).exec()

        foundChat.save()
        io.to(gameID).emit('new-message', (newMessage))

    })
    socket.on('on-disconnect', async (userID, chatGroup) => {

        let chat = await Chat.find({gameID: chatGroup}).exec()

        
        chat[0]?.users.remove(userID)
        await chat[0]?.save()

        io.to(chatGroup).emit("player-left", userID)


    })

});



module.exports = app;
