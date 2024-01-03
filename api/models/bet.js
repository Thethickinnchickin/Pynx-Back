const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const request = require('request');
const User = require('./user');


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
    if (true) {
        request(oddsAPI,
            async function (err, res, body) {

                let response = JSON.parse(res.body);
                let user = await User.findById(bet.userID);
   

                // updating scores of games bet on in real-time
                for (let i = 0; i < response.length; i++) {

                    if (response[i].id == bet.gameID) {
                        let homeScore = 0;
                        let awayScore = 0;

                        if (response[i].scores) {
                            homeScore = response[i].scores[0].score;
                            awayScore = response[i].scores[1].score;
                            bet.homeScore = homeScore;
                            bet.awayScore = awayScore;

                        }

                        if (response[i].completed) {
                            bet.isLive = false;
                            let pointsDiffHome = 0;
                            let pointsDiffAway = 0;

                            pointsDiffHome = homeScore - awayScore //-2

                            pointsDiffAway = awayScore - homeScore // -1.5

                            if (bet.teamPicked == bet.homeTeam && !bet.gameCompleted) {
                                bet.gameCompleted = true

                                if (bet.spreadHome > 0) {

                                    if (pointsDiffHome < (bet.spreadHome * -1)) {

                                        bet.betWon = false;
                                        user.betLoses += 1;

                                    } else {

                                        bet.betWon = true
                                        user.betWins += 1;
                                    }
                                } else {

                                    if ((bet.spreadHome * -1) > pointsDiffHome) {

                                        bet.betWon = false
                                        user.betLoses += 1;
                                    } else {

                                        bet.betWon = true
                                        user.betWins += 1;
                                    }
                                }


                            } else if (bet.teamPicked == bet.awayTeam && !bet.gameCompleted) {
                                bet.gameCompleted = true
                                if (bet.spreadAway > 0) {

                                    if (bet.spreadAway <= pointsDiffAway) {
                                        bet.betWon = false
                                        user.betLoses += 1;
                                    } else {
                                        bet.betWon = true
                                        user.betWins += 1;
                                    }
                                } else {

                                    if (bet.spreadAway <= pointsDiffAway) {
                                        bet.betWon = true
                                        user.betWins += 1;
                                    } else {
                                        bet.betWon = false
                                        user.betLoses += 1;
                                    }
                                }
                            }

                        }
                    }

                }

                await user.save();
                await bet.save(); // Save the changes here
                next();
            })
    }
})


module.exports = mongoose.model("Bet", BetSchema);

