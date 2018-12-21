let Product = require('../models/producto');
const {verifyToken} = require('../middlewares/authentication')
const express = require('express');
let app = express();


// =========== Get all products ====================
app.get('/products', verifyToken, (req,res) => {
    //Retrieve all products populating user and category
    let since = Number(req.query.desde || 0);
    
    Product.find({disponible: true}).skip(since).limit(5)
           .populate('usuario','nombre email').populate('category','descripcion').exec((err, allProducts) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }        
        res.json({
            ok: true,
            allProducts
        })
    });
});


// ================= Get product by ID =================
app.get('/products/:id', verifyToken, (req, res) => {
    //Retrieve one product populating user and category
    let id = req.params.id;
    
    Product.findById(id).populate('usuario category').exec((err, product) => {
        if(err){
            return res.json(500).json({
                ok: false,
                err
            })
        }
        if(!product){
            return res.status(400).json({
                ok: false,
                err,
                message: 'Product not found'
            })
        }
        res.json({
            ok: true,
            product
        })
    })
});


// =========== Create a product ====================
app.post('/products', verifyToken, (req, res) => {
    //Save a user and a category
    let user = req.usuario._id;

    let product = new Product({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        disponible: req.body.disponible,
        categoria: req.body.categoria,
        usuario: user
    });

    product.save((err, createdProduct) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!createdProduct){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Fail creating product"
                }
            })
        }
        res.json({
            ok: true,
            createdProduct
        });
    });    
});


// =============== Update a product =================
app.put('/products/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Product.findById(id, (err, product) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!product){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Product not found"
                }
            })
        }
        product.nombre = req.body.nombre;
        product.precioUni = req.body.precioUni;
        product.descripcion = req.body.descripcion;
        product.disponible = req.body.disponible;
        product.categoria = req.body.categoria;

        product.save((err, productSaved) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productSaved
            });
        });
    });

});

// ================ Search for products ===============
app.get('/products/search/:term', verifyToken, (req, res) => {
    let term = req.params.term;
    let regex = RegExp(term,'i'); // i make this regex insensitive to lowercase or uppercase

    Product.find({nombre: regex}).populate('category', 'nombre').exec((err , product) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            product
        });
    });
})


// ================ Delete a product =================
app.delete('/products/:id', verifyToken, (req, res) => {
    // Set "disponible" to false
    let id = req.params.id;
    Product.findById(id, (err, product) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!product){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "Product not found"
                }
            });
        }

        product.disponible = false;
        product.save((err, deletedProduct) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                deletedProduct,
                message: "Product succesfully removed"
            });
        });
    });
})

module.exports = app;
