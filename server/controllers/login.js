const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});


// Google configurations

async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); // All user information (name, email, picture)
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);

    //This returning object must match with the user Schema's keys
    return {
        nombre :payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

  }

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)  //this returns a promise that's why an async-await block is defined
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({  //Internal server error
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) { //If a user is not authenticated by its google account
                return res.status(400).json({  //Internal server error
                    ok: false,
                    err: {
                        message: "You must use your normal authentication"
                    }
                });
            } else { //Renovate the token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION }); //The token will expire in 30 days

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else { //User is not in the DB
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({  //Internal server error
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION }); //The token will expire in 30 days

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;