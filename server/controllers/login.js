const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({  //Internal server error
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(User) or password incorrect'
                }
            });
        }

        if (bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }        
        
        let token = jwt.sign({
            usuario: usuarioDB
        },process.env.SEED , { expiresIn :  process.env.TOKEN_EXPIRATION }); //The token will expire in 30 days 
        
        console.log(token);
        
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

module.exports = app;