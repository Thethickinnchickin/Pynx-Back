const router = require('express').Router();

const verifyToken = require('../middleware/verify-token');
const verifyTokenSafe = require('../middleware/verify-token-safe');
const Bet = require('../models/bet');


//Creating a new bet for a user

router.post('/bets', verifyToken, async (req, res) => {
    try {
        
        if (req.decoded) {
            let bet = new Bet({
                userID: req.decoded._id,
                gameCompleted: false,
                spreadHome: req.body.spreadHome,
                spreadAway: req.body.spreadAway,
                homeTeam: req.body.homeTeam,
                awayTeam: req.body.awayTeam,
                league: req.body.league.toUpperCase(),
                teamPicked: req.body.teamPicked,
                timeStart: req.body.timeStart,
                gameCompleted: false,
                betWon: null,
                gameID: req.body.gameID,
                isLive: false
            });



            await bet.save();

            res.json({
                success: true,
                message: 'i think it worked'
            })
        } else {
            res.json({success: true,
            message: 'login to get beting info'})
        }

        
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    } 
});

//ChangingBet 

router.put('/bets', verifyToken, async (req, res) => {
    try {
        await Bet.where({gameID: req.body.gameID,
            userID: req.decoded._id}).updateOne(
                { $set: { teamPicked: req.body.newTeam }})

        res.json({
            success: true,
            teamPicked: req.body.newTeam
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
});


router.get('/bets', verifyToken, async(req, res) => {
    try {

        let upcomingBets = await Bet.find({userID: req.decoded._id, 
        gameCompleted: false,
        isLive: false}).limit(3).sort({timeStart: 1})
        .exec();
        let recentBets = await Bet.find({userID: req.decoded._id, 
        gameCompleted: true}).limit(3).sort({timeStart: -1})
        .exec();

        let liveBets = await Bet.find({userID: req.decoded,
        isLive: true}).limit(3).exec();
        
        res.json({
            success: true,
            upcomingBets,
            recentBets,
            liveBets
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})
//getting bets for user
router.get('/bets/:queryType', verifyToken, async (req, res, next) => {
    try {
        console.log("Helloi am heree")
        
        let betsQuery = Bet;

        let pageSkip = (req.query.pageNumber - 1) * 5
        let bets;

        let totalBets = 0;

        if(req.params.queryType == 'all') {
            totalBets = await Bet.find({userID: req.decoded._id}).exec();
            totalBets = totalBets.length;

    
            bets = await betsQuery.find({userID: req.decoded._id})
                 .limit(5)
                 .skip(pageSkip)
                 .exec();
                 
        } else if(req.params.queryType == 'recent') {
            //Getting Recent Bets
            totalBets = await Bet.find({userID: req.decoded._id,
            gameCompleted: true}).exec();

            totalBets = totalBets.length;
    
            bets = await betsQuery.find({userID: req.decoded._id,
                gameCompleted: true,
                isLive: false})
                
                 .limit(5)
                 .skip(pageSkip)
                 .sort({ timeStart: -1})
                 .exec();


        } else if(req.params.queryType == 'live'){
            //Getting Upcoming Bets
            console.log("comeone")
            totalBets = await Bet.find({userID: req.decoded._id,
                gameCompleted: false}).exec();
    
                totalBets = totalBets.length;
        
                bets = await betsQuery.find({userID: req.decoded._id,
                gameCompleted: false,
                isLive: true})
                .limit(5)
                .skip(pageSkip)
                .sort({ timeStart: 'asc'})
                .exec();

        } else {
            //Getting Upcoming Bets
            totalBets = await Bet.find({userID: req.decoded._id,
                gameCompleted: false,
            isLive: false}).exec();
    
                totalBets = totalBets.length;
        
                bets = await betsQuery.find({userID: req.decoded._id,
                gameCompleted: false,
                isLive: false})
                .limit(5)
                .skip(pageSkip)
                .sort({ timeStart: 'asc'})
                .exec();
        }

        res.json({
            success: true,
            bets: bets,
            totalBets: totalBets
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

//deleting bet 
router.delete('/bets/:betID', verifyToken, async(req, res) => {
    try {
        let deletedBet = await Bet.deleteOne({_id: req.params.betID, userID: req.decoded._id}).exec();


        res.json({
            success: true,
            deletedBet: deletedBet
        })
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
    
})



router.get('/bets/for/odds', verifyTokenSafe, async (req, res) => {       
    try {
        console.log("Hello");
        if (req.decoded) {
            let bets = await Bet.find({userID: req.decoded._id,
            league: req.query.league,
            gameCompleted: false,
            isLive: false}).exec();

            res.json({
                success: true,
                bets: bets
            })
        } else {
            res.json({success: true,
            message: 'login to get beting info'})
        }
        

    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
});

module.exports = router