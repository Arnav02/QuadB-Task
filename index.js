const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const Currency = require('./models/currency');
const currencyRoute = require('./routes/currency');
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

app.use('/', currencyRoute);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const currencies = ['btcinr', 'xrpinr', 'ethinr', 'trxinr', 'eosinr', 'zilinr', 'batinr', 'zrxinr', 'omginr', 'polyinr'];

const fetchData = async () => {
    try {
        const res = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const data = await Currency.find({});

        for (let i = 0; i < 5; i++) {
            // const currency = new Currency({
            //     name: res.data.currencies[i].name,
            //     base_unit: res.data.currencies[i].base_unit,
            //     volume: res.data.currencies[i].volume,
            //     last: res.data.currencies[i].last,
            //     sell: res.data.currencies[i].sell,
            //     buy: res.data.currencies[i].buy
            // });
            // currency.save()
            //     .then(data => {
            //         console.log('it worked');
            //     })
            //     .catch(err => {
            //         console.log('oops, error!', err);
            //     })
            data[i].last = res.data.currencies[i].last;
            data[i].buy = res.data.currencies[i].buy;
            data[i].sell = res.data.currencies[i].sell;
            data[i].volume = res.data.currencies[i].volume;
        }
    }
    catch (err) {
        console.log('Something went wrong: ', err);
    }
}

fetchData();

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`On port, ${port}`);
})