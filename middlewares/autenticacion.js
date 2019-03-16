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

//================================================
// Verificar Admin
//================================================

exports.verificaAdmin = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Funcion solo para administradores',
            errors: { message: 'Funcion solo para administradores' }
        });
    }
};

//================================================
// Verificar Admin o Mismo Usuario
//================================================

exports.verificaAdminOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    // Toma el id que envio por parametro a la funcion
    // OJO que la funcion que lo use reciba un parametro
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || id === usuario._id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Funcion solo para administradores o el mismo usuario',
            errors: { message: 'Funcion solo para administradores' }
        });
    }
};