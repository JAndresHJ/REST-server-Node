const express = require('express');
let {verifyToken, checkForAdmin} = require('../middlewares/authentication');
let Category = require('../models/category');
const _ = require('underscore');

let app = express();

//======= Show all categories =========
app.get('/category' ,verifyToken, (req, res)=>{
    Category.find({}).sort('descripcion').populate('usuario', 'nombre email').exec((err, allCategories) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            allCategories
        });
    })
})

//========= Get cathegory by id ==========
app.get('/category/:id' ,verifyToken, (req , res) => {
    let id = req.params.id;
    Category.findById(id,(err, category) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!category){ // Category not found
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Category not found'
                }
            })
        }
        res.json({
            ok:true,
            category
        })
    });
});


//========= Create a new category ==========
app.post('/category', verifyToken, (req, res) => {
    // returns a new category
    let body = req.body;

    let category = new Category({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    category.save((err, createdCategory) => { //Metodo de mongoose
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!createdCategory){ // If the category is not created
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            category: createdCategory
        });
    });
});


//======== Update the category's description =======
app.put('/category/:id', [verifyToken], (req, res) =>{
    let id = req.params.id;
    let descripcion = req.body.descripcion;

    Category.findByIdAndUpdate(id, {$set:{descripcion: descripcion}}, {new: true, runValidators: true}, (err, updatedCategory) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!updatedCategory){ // If the category is not created
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            category: updatedCategory
        })
    })
});


//========== Delete category ==============
app.delete('/category/:id', [verifyToken,checkForAdmin], (req,res) => {
// Just admin users can delete a category
    let id = req.params.id;
    
    Category.findByIdAndRemove(id, (err, deletedCategory) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if(!deletedCategory){
            return res.status(400).json({
                ok: false,
                error: {
                    message:'Id not found'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Category successfully deleted',
            deletedCategory
        })
    })

});

module.exports = app;