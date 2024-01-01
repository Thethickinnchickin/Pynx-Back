const router = require('express').Router();
var request = require('request');
const parseData = require('../utilities/parseOddResullt');


router.get('/odds', (req, res) => {
    try {
        var today = new Date().getTime();

        request(`https://api.the-odds-api.com/v4/sports/${req.query.league}/odds/?apiKey=${process.env.ODDS_API_KEY || 'd6a440d83822a194eab11ad175fe41e8'}&regions=us&markets=h2h,spreads&oddsFormat=american&date=${today}`,
        function (error, response, body) {
            console.log("Hello there matthew")
            let data = parseData(body)

            res.json({
                success: true,
                body: data,
                response: response
            })
        })        
    } catch (err) {
        console.log(err)
    }

    
})

router.get('/odds/:id/:league',  async(req, res) => {
    try {
        
        request(`https://api.the-odds-api.com/v4/sports/${req.params.league}/odds/?apiKey=${process.env.ODDS_API_KEY || 'd6a440d83822a194eab11ad175fe41e8'}&regions=us&markets=h2h,spreads&oddsFormat=american&eventIds=${req.params.id}`,
        function (error, response, body) {
           
            let data = parseData(body);

            res.json({
                success: true,
                game: data
            })
            
        })        
    } catch(err) {
        
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

})

module.exports = router


