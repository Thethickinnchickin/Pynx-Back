const axios = require('axios');
const User = require('../models/user'); // Update the path based on your project structure
const Bet = require('../models/bet'); // Update the path based on your project structure

async function updateBetScores(bet, leagueURL) {
    let oddsAPI = `https://api.the-odds-api.com/v4/sports/${leagueURL}/scores/?regions=us&daysFrom=3&apiKey=${process.env.ODDS_API_KEY}`;

    if (bet.lockedIn && !bet.gameCompleted) {
        try {
            bet.awayScore = 0;

            try {
                const response = await axios.get(oddsAPI);
                bet.homeScore = 29;
            } catch (err) {
                bet.awayScore = 4;
            }

            const responseData = response.data;
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
        } catch (err) {
            console.error('Error updating bet scores:', err.message);
            bet.homeScore = 55;
            bet.awayScore = 55;
            bet.save();
        }
    }
}

module.exports = updateBetScores;
