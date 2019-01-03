const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const User = require("../models/usuario");
const Product = require("../models/producto");
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload()); // All uploaded files are allocated to req.files

app.put('/upload/:type/:id', function(req , res){

    let type = req.params.type;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "No file selected"
                }
        });
    }

    //Validate type
    let validTypes = ['products' , 'users'];
    if(validTypes.indexOf( type ) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message : "The allowed types are " + validTypes.join(', ')
            }
        })
    }

    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    let splitedName = file.name.split('.');
    let extension = splitedName[splitedName.length - 1]; // to get the last string of splitedName, which is the file extension

    // allowed extensions
    let allowedExtentions = ['png', 'jpg', 'gif', 'jpeg'];

    if(allowedExtentions.indexOf(extension) < 0){ // If extension is not found
        return res.status(400).json({
            ok: false,
            err: {
                message : "The allowed extensions are " + allowedExtentions.join(', '),
                ext : extension
            }
        })
    }

    // Change file name
    let fileName = `${ id }-${ new Date().getMilliseconds() }.${ extension }`; // To avoid the cache and give a unique name to the file, the miliseconds of the current date are concatenated

    file.mv(`uploads/${ type }/${ fileName }`, (err) => { // The uploaded files should be renamed in order to avoid overwriting files when uploading with the same name
        if (err)
        return res.status(500).json({
            ok: false,
            err
        });

        if (type === "users")
            userImage(id, res, fileName);
        else if(type === "products")
            productImage(id, res, fileName)

    });        
});



function userImage(id, res, fileName){

    User.findById(id, (err, user) => {
        if(err){
            deleteFile(fileName, "users");
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!user){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "User not found"
                }
            });
        }
        
        deleteFile(user.img, "users");

        user.img = fileName;
        user.save((err, savedUser) => {
            res.json({
                ok: true,
                user: savedUser, 
                img: fileName
            })
        })
    })

}


function productImage(id, res, fileName){
    
    Product.findById(id, (err, product) => {
        if(err){
            deleteFile(fileName, "products");
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
            });
        }
        
        deleteFile(product.img, "products");

        product.img = fileName;
        product.save((err, savedProduct) => {
            res.json({
                ok: true,
                product: savedProduct, 
                img: fileName
            })
        })
    })
}



function deleteFile(fileName, type){

    let pathImage = path.resolve(__dirname, `../../uploads/${ type }/${ fileName }`);

    if(fs.existsSync(pathImage)){ // If path exists
        fs.unlinkSync(pathImage);
    }
}

module.exports = app;