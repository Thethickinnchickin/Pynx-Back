const router = require('express').Router();
const Bet = require('../models/bet');
const User = require('../models/user');


router.get('/user/:id', async(req, res) => {
    try {
        let upcomingBets = await Bet.find({userID: req.params.id, 
            gameCompleted: false,
            isLive: false}).limit(3).sort({timeStart: 1})
            .exec();
            let recentBets = await Bet.find({userID: req.params.id, 
            gameCompleted: true}).limit(3).sort({timeStart: -1})
            .exec();
    
            let liveBets = await Bet.find({userID: req.params.id,
            isLive: true}).limit(3).exec();

            let user = await User.findById(req.params.id)
            
    
    
    
    
            res.json({
                success: true,
                upcomingBets,
                recentBets,
                liveBets,
                user
            })
    } catch(err) {
        res.json({
            success: false,
            message: err.message
        })
    }
});



//Getting Bets for User
router.get('/user/:id/:betType', async(req, res) => {
    try {

        let betsQuery = Bet;

        let pageSkip = (req.query.pageNumber - 1) * 5
        let bets;

        let totalBets = 0;

        if(req.params.betType == 'all') {
            totalBets = await Bet.find({userID: req.params.id}).exec();
            totalBets = totalBets.length;

    
            bets = await betsQuery.find({userID: req.params.id})
                 .limit(5)
                 .skip(pageSkip)
                 .exec();
        } else if(req.params.betType == 'recent') {
            //Getting Recent Bets
            totalBets = await Bet.find({userID: req.params.id,
            gameCompleted: true}).exec();

            totalBets = totalBets.length;
    
            bets = await betsQuery.find({userID: req.params.id,
                gameCompleted: true,
                isLive: false})
                
                 .limit(5)
                 .skip(pageSkip)
                 .sort({ timeStart: -1})
                 .exec();


        } else if(req.params.queryType == 'live'){
            //Getting Upcoming Bets
            totalBets = await Bet.find({userID: req.params.id,
                gameCompleted: false}).exec();
    
                totalBets = totalBets.length;
        
                bets = await betsQuery.find({userID: req.params.id,
                gameCompleted: false,
                isLive: true})
                .limit(5)
                .skip(pageSkip)
                .sort({ timeStart: 'asc'})
                .exec();
        } else {
            //Getting Upcoming Bets
            totalBets = await Bet.find({userID: req.params.id,
                gameCompleted: false,
            isLive: false}).exec();
    
                totalBets = totalBets.length;
        
                bets = await betsQuery.find({userID: req.params.id,
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




module.exports = router;