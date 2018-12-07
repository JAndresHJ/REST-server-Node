const jwt = require('jsonwebtoken');
//====================
//   Confirm token
//====================
let verifyToken = (req, res, next) => {

    let token = req.get('token');   // Get the header named token
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({ // Unauthorized
                ok: false,
                err
            });
        }
        req.usuario = decoded.usuario;
        next();

    });
};


//====================
//   Check for Admin Role
//====================

let checkForAdmin = (req, res, next) => {
    console.log(req);
    let user = req.usuario;

    if(user.role === 'ADMIN_ROLE'){
        next();
    } else {
        res.json({
            ok: false,
            err: {
                message: 'The user is not an ADMIN'
            }
        });
    }

 
}

module.exports = {
    verifyToken,
    checkForAdmin
}