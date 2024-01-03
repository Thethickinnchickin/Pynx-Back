const router = require('express').Router();
const verifyToken = require('../middleware/verify-token');
const User = require('../models/user');
const Follow = require('../models/follow');
const mongoose = require('mongoose');
const updatedUsers = require('../utilities/parseUsers');
const generateFriends = require('../utilities/generateFriends');
const parseSocial = require('../utilities/parseSocial');

//Follwing another user
router.post('/newFollower',verifyToken, async (req, res) => {
    try {
        

        let users = await User.find({
            '_id': { $in: [
                mongoose.Types.ObjectId(req.decoded._id),
                mongoose.Types.ObjectId(req.body.userFollowed)
            ]}
        }).exec();
        
        let user;
        let followedUser;
        if(users[0]._id == req.decoded._id) {
            user = users[0]
            followedUser = users[1]
        } else {
            user = users[1]
            followedUser = users[0]
        }

        let follow = new Follow({
            userToFollow: followedUser._id,
            userRequesting: user._id,
            isAccepted: false
        });

        await follow.save()

        user.following.push(follow)


        followedUser.followers.push(follow);
        
        await user.save();
        await followedUser.save();

        
        res.json({
            success: true,
            message: 'Successfully Followed user'
        })
        
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message 
        })
    }
});

//Accepting follow request 
router.post('/accept/follow', verifyToken, async(req, res) => {
    try{

        let foundRequests = await Follow
        .findOne({$or:
             [
                {$and : [{'userToFollow': req.body.userFollowed , 'userRequesting': req.decoded._id }] },
                {$and : [{ 'userToFollow': req.decoded._id, 'userRequesting':  req.body.userFollowed}]}
            ] 
            })




            

        
            foundRequests.isAccepted = true;
            await foundRequests.save();
        

        res.json({
            success: true,
            message: "hey"
        })

    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

//Retrieving Freinds for user
router.get('/friends', verifyToken, async (req, res) => {
    try {


        let pageSkip = (req.query.pageNumber - 1) * 6

        

        let followersQuery = { $or: [
            {
                userToFollow: req.decoded._id,
                isAccepted: true
            },
            {
                userRequesting: req.decoded._id,
                isAccepted: true
            }
        ]};

        let totalFriends = await Follow.find(followersQuery).exec()

        let followers = await Follow.find(followersQuery)
        .limit(6)
        .skip(pageSkip)
        .populate("userRequesting userToFollow").exec();


        let friends = generateFriends(followers, req.decoded._id)




        res.json({
            success: true,
            friends: friends,
            totalFriends: totalFriends.length
        })
    } catch(err) {

        res.status(500).json({
            success: false,
            message: err.message 
        })
    }
})

//getting follow request for users
router.get('/requested/follows', verifyToken, async (req, res) => {
try {
    let requested = await Follow.find({ $or: [{
        userToFollow: req.decoded._id,
        isAccepted: false
    },
    {
        userRequesting: req.decoded._id,
        isAccepted: false
    }]}).populate('userRequesting userToFollow').exec();

    let users = parseSocial(requested, req.decoded._id)


    res.json({
        success: true,
        users: users
    })
} catch(err) {

    res.status(500).json({
        success: false,
        message: err.message 
    })
}
});

router.get('/search/:wins/:name', verifyToken, async(req, res) => {
    try {
        let wins = req.params.wins || 0

        let totalUsers;

        if(req.params.name !== 'null') {


            totalUsers = await User.find({
                _id: {$ne: req.decoded._id},
                name: req.params.name,
                betWins: {$gte: wins}
            }).limit(60).exec();
        } else {

            totalUsers = await User.find({
                _id: {$ne: req.decoded._id},
                betWins: {$gte: wins}
            }).limit(60)
            .exec();
        }

        let user = await User.findById(req.decoded._id).exec()
        

        let filteredUsers = updatedUsers(totalUsers, user);



        res.json({
            success: true,
            users: filteredUsers
        })

    } catch(err) {

        res.status(500).json({
            success: false,
            message: err.message 
        })
    }
})

//Getting Top Users for Friends
router.get('/search/top/users/:limit', verifyToken, async (req, res) => {
    try {

        let limit = req.params.limit || 5

        let topUsers = await User.find({_id: {$ne: req.decoded._id}}).limit(limit).sort({betWins: -1})

        
        let user = await User.findById(req.decoded._id).exec()

        let filteredUsers = updatedUsers(topUsers, user);


        res.json({
            success: true,
            topUsers: filteredUsers
        })
    } catch(err) {

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

//deleting follow request
router.delete('/requested/:userID/:followID', verifyToken, async (req, res) => {
    try {

        await Follow.findOneAndDelete({_id: req.params.followID,
            userToFollow: req.decoded._id,
            userRequesting: req.params.userID}).exec();


        res.json({
            success: true,
            message: "Follow Request Deleted"
        })
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message 
        })
    }
})

module.exports = router;
