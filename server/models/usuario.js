
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} is not a valid role'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre:{
        type: String,
        required: [true, 'The name is required']
    },
    email:{
        type: String,
        unique: true,
        required: [true, 'Email address is needed']
    },
    password:{
        type: String,
        required: [true, 'Password is mandatory']
    },
    img:{
        required: false,
        type: String    
    },
    role:{
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado:{
        type: Boolean,
        default: true
    },
    google:{
        type: Boolean,
        default: false
    }
});


usuarioSchema.methods.toJSON = function(){  // Esconder el campo password
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}


usuarioSchema.plugin(uniqueValidator, {message: '{PATH} must be unique'});

module.exports = mongoose.model('Usuario', usuarioSchema);