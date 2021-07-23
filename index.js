const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const Currency = require('./models/currency');
// const currencyRoute = require('./routes/currency');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const db_url = process.env.DB_URL

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo connection open!');
    })
    .catch((e) => {
        console.log('Oh no Mongo error');
        console.log(e);
    })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to database');
});

// app.use('/', currencyRoute);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const fetchData = async () => {
    try {
        const res = await axios.get('https://api.wazirx.com/api/v2/tickers');
        let c = 0;
        const data = [];
        for (let property in res.data) {
            const { name, last, buy, sell, volume, base_unit } = res.data[property];
            data.push({
                name, last, buy, sell, volume, base_unit
            });
            c++;
            if (c === 10) break;
        }
        const currency = new Currency({ data });
        const result = await Currency.remove();
        // console.log(result.deletedCount);
        currency.save();
    }
    catch (err) {
        console.log('Something went wrong: ', err);
    }
}

fetchData();

app.get('/', async (req, res) => {
    const response = await Currency.find();
    // console.log(response[0].data);
    res.render('index', { currency: response[0].data });
})

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`On port, ${port}`);
})