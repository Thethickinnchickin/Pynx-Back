const axios = require('axios');
const User = require('../models/user'); // Update the path based on your project structure
const Bet = require('../models/bet'); // Update the path based on your project structure

async function updateBetScores(bet, leagueURL) {


    if (bet.lockedIn && !bet.gameCompleted) {
        try {
            console.log("Hello")
            let oddsAPI =
            `https://api.the-odds-api.com/v4/sports/${leagueURL}/scores/?regions=us&daysFrom=3&apiKey=${process.env.ODDS_API_KEY}`
            const response = await axios.get(oddsAPI);
            return response
        } catch (err) {
            console.error('Error updating bet scores:', err.message);
        }
    }
    
}

module.exports = updateBetScores;
