const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    name: String,
    base_unit: String,
    volume: String,
    last: String,
    sell: String,
    buy: String
});

const Currency = mongoose.model('Currency', currencySchema);
module.exports = Currency;