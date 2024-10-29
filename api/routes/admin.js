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
            if(req.body.password == process.env.ADMIN_PASSWORD)
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

// Admin Login Route
router.post('/login', async (req, res) => {
    try {
        // Check if the provided password matches the admin password in .env
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required." });
        }

        // Verify the password with the environment variable for admin login
        const isPasswordValid = password === process.env.ADMIN_PASSWORD;

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password." });
        }

        // Generate JWT for the admin
        const adminPayload = { name: 'admin' }; // Customize payload if needed
        const token = jwt.sign(adminPayload, process.env.ADMIN_SECRET, {
            expiresIn: '1w' // Token expires in one week
        });

        res.json({
            success: true,
            token,
            message: "Admin logged in successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error: " + err.message
        });
    }
});


module.exports = router