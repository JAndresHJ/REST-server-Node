

require('./config/config');
const express = require('express');
const bodyParser = require('body-parser')
const app = express()


// app.use son Middlerwares. Cada petición pasa por los middlewares

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

 
app.get('/usuarios', function (req, res) {
  res.json('get usuario')
})

// POST Usado para crear nuevos registros
app.post('/usuarios', function (req, res) {
    res.json(req.body);
  })


//PUT Usado para actualizar datos
app.put('/usuarios/:id', function (req, res) {
    res.json('get usuario');
  })
 

// DELETE
app.delete('/usuarios', function (req, res) {
    res.json('get usuario');
  })


app.listen(3000, () => {
    console.log('Escuchando puerto: ', 3000);
});