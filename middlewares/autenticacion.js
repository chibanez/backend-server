var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//================================================
// Verificar Token
//================================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: err
            });
        }

        //Guardo el usuario que se encuentra en el token dentro del request 
        //(vendria a ser la session)
        req.usuario = decoded.usuario;

        //El next permite que siga la ejecucion
        next();
    });
};