const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const request = require('request');
const User = require('./user');
const axios = require('axios');
const updateBetScores = require('../utilities/betUpdater');


const BetSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    homeTeam: {
        type: String,
    },    
    awayTeam: {
        type: String,
    },
    homeScore: {
        type: Number,
        default: 0
    },
    awayScore: {
        type: Number,
        default: 0
    },
    spreadHome: {
        type: Number,
    },
    timeStart: {
        type: Date
    },
    spreadAway: {
        type: Number,
    },
    teamPicked: {
        type: String,
    },
    league: {
        type: String,
    },
    gameID: {
        type: String,
    },
    gameCompleted: {
        type: Boolean,
    },
    betWon: {
        type: Boolean 
    },
    lockedIn: {
        type: Boolean
    },
    isLive: {
        type: Boolean
    }
});

BetSchema.post('init', async function() {
    console.log("Hello there ");
    let bet = this;


    console.log("Hello there ");

    let leagueURL = '';

    if (bet.league == "NFL" || "nfl") {
        leagueURL = 'americanfootball_nfl'
    } else if (bet.league == "NHL" || bet.league == "nhl") {
        leagueURL = 'icehockey_nhl'
    } else if (bet.league == "NBA" || bet.league == "nba") {
        leagueURL = 'basketball_nba'
    } else if (bet.league == "MLB" || bet.league == "mlb") {
        leagueURL = 'baseball_mlb'
    }

    let today = new Date();
    let date = new Date(bet.timeStart);

    if (today.getTime() > date.getTime() && bet.gameCompleted == false) {
        bet.lockedIn = true;
        bet.isLive = true;
    } else {
        bet.lockedIn = false
    }

    bet.homeScore = 77;
    bet.awayScore = 67

    // Do not save the document here

    await updateBetScores(bet, leagueURL);

    
})


module.exports = mongoose.model("Bet", BetSchema);

