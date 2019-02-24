var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

//================================================
// Obtener todos los usuarios
//================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en Base de Datos. Cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
});

//================================================
// Crear un nuevo usuario
//================================================

app.post('/', (req, res) => {
    // Esto solo funciona si tengo configurado el body parser
    var body = req.body;


    // Para encriptar la clave uso bcrypt (https://github.com/dcodeIO/bcrypt.js)
    // npm install bcryptjs --save
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });


    usuario.save((err, usuarioGuardado) => {

        if (err) {

            //Mando error 400 si falla por mal validacion de datos
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Creando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    });
});


module.exports = app;