

const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');



app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({estado:true}, 'nombre email role estado google img') // Filtro. Se regresan los estados del segundo argumento
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {  //Ejecutar                
                if (err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Usuario.count({estado: true},(err, conteo) => { // Debe tener el mismo filtro

                    res.json({
                        ok: true,
                        usuarios,
                        conteo
                    })
                })
               
            });
 
});



// POST Usado para crear nuevos registros
app.post('/usuario', function (req, res) {

   
    let body = req.body;

     let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    }); 

    usuario.save((err, usuarioDB) => { //Metodo de mongoose
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

       // usuarioDB.password = null; //esconder psw de usuario, pero aun se vería el valor de null

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});


//PUT Usado para actualizar datos
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre','email','img','role', 'estado']); // Seleccionar los campos que se pueden actualizar

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {
        
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

})


// DELETE
app.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    //Usuario.findByIdAndRemove(id, (err,usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, {new:true}, (err,usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'User not found'
                }
            })
        }

        res.json({
            ok: true,
            usuarioBorrado
        });
    })


})


module.exports = app;