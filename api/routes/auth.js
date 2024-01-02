const router = require('express').Router();
const verifyToken = require('../middleware/verify-token');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const upload = require('../utilities/uploadPhoto');






// Profile Route 
router.get("/user", verifyToken,  async(req, res) => {
    try {
        let foundUser = await User.findOne({_id: req.decoded._id}).exec();
        
        if (foundUser) {
            res.json({
                success: true,
                user: foundUser
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})


//User login
router.post("/login", async (req, res) => {
    try {
        
        let foundUser = await User.findOne({email: req.body.email })
        
        if (!foundUser) {
            res.status(403).json({
                success: false,
                message: "Login Failed, No User Found"
            });
        } else {
            if (foundUser.comparePassword(req.body.password)) {
                let secret = process.env.SECRET || 'secret';
                let token = jwt.sign(foundUser.toJSON(), secret, {
                    expiresIn: 604800 // 1 week
                });


                res.json({
                    success: true,
                    token: token
                })
            } else {
                res.status(403).json({
                    success: false,
                    message: "Login Failed password is not correct"
                });
            }
        }
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed"
        })
    }
});

//Signing Up User
router.post('/signup/user', async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.json({success: false, message: "Please enter email or password"})
    } else {
        try {

            let newUser = new User();
            newUser.name = req.body.username;
            newUser.email = req.body.email;
            newUser.password = req.body.password;
         
            try {
                await newUser.save()
            } catch(err) {
                res.json({
                    success: false,
                    message: err.message
                })
            }

            let secret = process.env.SECRET || 'secret';
            let token = jwt.sign(newUser.toJSON(), secret, {
                expiresIn: 604000 //1 week
            });


            res.json({
                success: true,
                token: token,
                message: "Created a new Pnyx User!"
            })            
        } catch (err) {
            res.json({
                success: true,
                message: err.message
            })
        }

    }
});

//Uploading Image for user
router.post('/post/image/user', upload.single("image"), verifyToken, async (req, res) => {
    try {

        await User.findByIdAndUpdate(req.decoded._id, {
            profilePicture: req.file.path
        })

        res.json({success: true})
    } catch (err) {
        res.status(500).json({
            success:false,
            message: "Image Upload Success"
        })
    }
    
})

router.put('/user', verifyToken, async(req, res) => {
    try {

        
        const user = await User.findOneAndUpdate({_id: req.decoded._id
        }, {name: req.body.name}).exec();



        res.json({
            success: true,
            updatedUser: user
        })


    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})
module.exports = router;
