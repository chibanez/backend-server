var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//================================================
// Obtener todos los usuarios
//================================================
app.get('/', (req, res, next) => {

    //Si viene algun parametro en "desde" lo usa, sino usa 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        //Saltea los primeros "desde"
        .skip(desde)
        //Trae solo 5
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en Base de Datos. Cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            });
});


//================================================
// Actualizar usuario
//================================================
//Utilizo el middleware para que valide el token en esta llamada (mdAutenticacion.verificaToken)
//El middleware puede ir en [] ya que la funcion puede ejecutar un array de middlewares uno atras del otro
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminOMismoUsuario], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
                //El error lo devuelvo como un objeto
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                //Mando error 400 si falla por mal validacion de datos
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en Base de Datos. Guardando cambios de usuario',
                    errors: err
                });
            }

            //Aca puedo blanquear los datos que no quiero devolver
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

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
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});

//================================================
// Eliminar usuario
//================================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Borrando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});


module.exports = app;