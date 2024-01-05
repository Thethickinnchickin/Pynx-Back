const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const request = require('request');
const User = require('./user');
const axios = require('axios');
const updateBetScores = require('../utilities/betUpdater');
const user = require('./user');


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

    let bet = this;

    console.log(bet.league)


    let leagueURL = '';

    if (bet.league.toLowerCase() === "nfl") {
        leagueURL = 'americanfootball_nfl';
        console.log("THIS IS BS");
    } else if (bet.league.toLowerCase() === "nhl") {
        leagueURL = 'icehockey_nhl';
    } else if (bet.league.toLowerCase() === "nba") {
        leagueURL = 'basketball_nba';
    } else if (bet.league.toLowerCase() === "mlb") {
        leagueURL = 'baseball_mlb';
    }

    let today = new Date();
    let date = new Date(bet.timeStart);

    if (today.getTime() > date.getTime() && bet.gameCompleted == false) {
        bet.lockedIn = true;
        bet.isLive = true;
    } else {
        bet.lockedIn = false
    }



    // Do not save the document here

    let oddsAPI =
        `https://api.the-odds-api.com/v4/sports/${leagueURL}/scores/?regions=us&daysFrom=3&apiKey=${process.env.ODDS_API_KEY}`
        if (bet.lockedIn && !bet.gameCompleted) {
            try {



                const response = await updateBetScores(bet, leagueURL);


                
                const responseData = response.data;

                let user = await User.findById(bet.userID);

    
                for (let i = 0; i < responseData.length; i++) {
                    //console.log(responseData[i])
                    

                    if (responseData[i].id == bet.gameID) {
                        let homeScore = bet.homeScore || 0;
                        let awayScore = bet.awayScore || 0;

    

                        if (responseData[i].scores) {
                            homeScore = responseData[i].scores[0].score;
                            awayScore = responseData[i].scores[1].score;
                            console.log("WE MADE IT")
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
                                    } else if(pointsDiffHome > (bet.spreadHome * -1)) {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }else {
                                        bet.betWon = null;
                                    }
                                } else  {
                                    if ((bet.spreadHome * -1) > pointsDiffHome) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else if((bet.spreadHome * -1) < pointsDiffHome) {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }else {
                                        bet.betWon = null;
                                    }
                                }
                            } else if (bet.teamPicked == bet.awayTeam && !bet.gameCompleted) {
                                bet.gameCompleted = true;
                                if (bet.spreadAway > 0) {
                                    if (bet.spreadAway < pointsDiffAway) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else if (bet.spreadAway > pointsDiffAway) {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    }else {
                                        bet.betWon = null;
                                    }
                                } else {
                                    if (bet.spreadAway < pointsDiffAway) {
                                        bet.betWon = true;
                                        user.betWins += 1;
                                    } else if (bet.spreadAway > pointsDiffAway) {
                                        bet.betWon = false;
                                        user.betLoses += 1;
                                    } else {
                                        bet.betWon = null;
                                    }
                                }
                            }
                        }
                    }
                }
                bet.save();
                user.save();
            } catch (err) {
                user.save();
                bet.save();
            }
    
        }

    
})


module.exports = mongoose.model("Bet", BetSchema);

