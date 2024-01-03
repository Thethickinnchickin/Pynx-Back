const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const request = require('request');
const User = require('./user');
const fetch = require('node-fetch');

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

    let oddsAPI =
        `https://api.the-odds-api.com/v4/sports/${leagueURL}/scores/?regions=us&daysFrom=3&apiKey=${process.env.ODDS_API_KEY}`
        if (bet.lockedIn && !bet.gameCompleted) {
            try {
                const response = await fetch(oddsAPI);
                const responseData = await response.json();
                
                let user = await User.findById(bet.userID);
                bet.homeScore = 99;
    
                for (let i = 0; i < responseData.length; i++) {
                    if (responseData[i].id == bet.gameID) {
                        let homeScore = 0;
                        let awayScore = 0;
    
                        if (responseData[i].scores) {
                            homeScore = responseData[i].scores[0].score;
                            awayScore = responseData[i].scores[1].score;
                            bet.homeScore = homeScore;
                            bet.awayScore = awayScore;
                        }
    
                        if (responseData[i].completed) {
                            bet.isLive = false;
                            let pointsDiffHome = homeScore - awayScore;
                            let pointsDiffAway = awayScore - homeScore;
    
                            if (bet.teamPicked == bet.homeTeam && !bet.gameCompleted) {
                                bet.gameCompleted = true;
    
                                if (bet.spreadHome > 0) {
                                    if (pointsDiffHome < (bet.spreadHome * -1)) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }
                                } else {
                                    if ((bet.spreadHome * -1) > pointsDiffHome) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }
                                }
                            } else if (bet.teamPicked == bet.awayTeam && !bet.gameCompleted) {
                                bet.gameCompleted = true;
                                if (bet.spreadAway > 0) {
                                    if (bet.spreadAway <= pointsDiffAway) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }
                                } else {
                                    if (bet.spreadAway <= pointsDiffAway) {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    } else {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    }
                                }
                            }
                        }
                    }
                }
    
                await user.save();
                await bet.save();
       
    
            } catch (err) {
                bet.homeScore = 55;
                bet.awayScore = 55
                bet.save();
            }
    
        }

    
})


module.exports = mongoose.model("Bet", BetSchema);

