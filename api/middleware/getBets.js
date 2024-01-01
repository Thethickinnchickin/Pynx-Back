
const Bet = require('../models/bet');

module.exports = async function()  {
    try {
        await Bet.find().exec();

        return;
    } catch (err) {
        return err;
    }
}