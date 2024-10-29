const router = require('express').Router();

const Bet = require('../models/bet');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const verifyAdmin = require('../middleware/verify-admin');



//getting bets for user
router.get('/bets', verifyAdmin, async (req, res) => {
    try {
        
        while (true) {
            console.log("Finding and updating all bets")
            await Bet.find().exec()

            let updateTime = 2 * 1000 * 60 * 60


            await new Promise(r => setTimeout(r, updateTime));

        }
        


    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
});

router.post('/signup', async (req, res) => {

        try {

            let newUser = new User();
            newUser.name = 'admin';
            if(req.password == process.env.ADMIN_PASSWORD)
            {
                newUser.password = req.body.password;
                newUser.email = "email";
                try {
                    await newUser.save()
                } catch(err) {
                    res.json({
                        success: false,
                        message: err.message
                    })
                }
    
                let adminToken = process.env.ADMIN_SECRET;
                let token = jwt.sign(newUser.toJSON(), adminToken, {
                    expiresIn: 604000 //1 week
                });
    
    
                res.json({
                    success: true,
                    token: token,
                    message: "Created a new Pnyx Admin!"
                }) 
            }
           
        } catch (err) {
            res.json({
                success: false,
                message: err.message
            })
        }

    
});


module.exports = router