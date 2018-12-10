require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// able public folder
app.use( express.static( path.resolve(__dirname , '../public')));

// Routing global configuration
app.use(require('./controllers/index.js'));

// DB connection
mongoose.connect('mongodb://localhost:27017/cafe', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos Online`);
});

// Conection to port 3000
app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', 3000);
});



