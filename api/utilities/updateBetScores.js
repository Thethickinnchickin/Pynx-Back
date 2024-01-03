const request = require('request');
const User = require('../models/user'); // Update the path based on your project structure
const Bet = require('../models/bet'); // Update the path based on your project structure

const updateBetScores = async function(bet, next) {
    console.log("Hello there ");
    bet.homeScore = 88;
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

    let oddsAPI =
        `https://api.the-odds-api.com/v4/sports/${leagueURL}/scores/?regions=us&daysFrom=3&apiKey=${process.env.ODDS_API_KEY}`
    if (bet.lockedIn && !bet.gameCompleted) {
        request(oddsAPI,
            async function (err, res, body) {

                let response = JSON.parse(res.body);
                let user = await User.findById(bet.userID);
                bet.homeScore = 99;

                for (let i = 0; i < response.length; i++) {

                    if (response[i].id == bet.gameID) {
                        let homeScore = 0;
                        let awayScore = 0;

                        if (response[i].scores) {
                            homeScore = response[i].scores[0].score;
                            awayScore = response[i].scores[1].score;
                            bet.homeScore = homeScore
                            bet.awayScore = awayScore

                        }

                        if (response[i].completed) {
                            bet.isLive = false;
                            let pointsDiffHome = homeScore - awayScore;
                            let pointsDiffAway = awayScore - homeScore;

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
                await bet.save();
                next();
            })
    }
}

module.exports = updateBetScores;
