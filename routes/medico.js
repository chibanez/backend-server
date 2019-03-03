var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//================================================
// Obtener todos los medicos
//================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicosDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en Base de Datos. Cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicosDB,
                        total: conteo
                    });
                });
            });
});

//================================================
// Actualizar medico
//================================================
app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id).exec((err, medicoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + ' no existe',
                errors: { message: 'No existe un medico con ese id' }
                //El error lo devuelvo como un objeto
            });
        }

        if (body.nombre) {
            medicoDB.nombre = body.nombre;
        }
        if (body.hospital) {
            medicoDB.hospital = body.hospital;
        }

        //En el autenticador del token lo decodeo y obtengo el id del usuario. Lo pongo en el req para poder utilizar la info del token aca
        medicoDB.usuario = req.usuario._id;

        medicoDB.save((err, medicoGuardado) => {

            if (err) {
                //Mando error 400 si falla por mal validacion de datos
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en Base de Datos. Guardando cambios de medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });
});

//================================================
// Crear un nuevo medico
//================================================
//Utilizo el middleware para que valide el token en esta llamada (mdAutenticacion.verificaToken)
//El middleware puede ir en [] ya que la funcion puede ejecutar un array de middlewares uno atras del otro
app.post('/', [mdAutenticacion.verificaToken], (req, res) => {

    // Esto solo funciona si tengo configurado el body parser
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        //En el autenticador del token lo decodeo y obtengo el id del usuario. Lo pongo en el req para poder utilizar la info del token aca
        usuario: req.usuario._id,
        hospital: body.hospital,
    });


    medico.save((err, medicoCreado) => {

        if (err) {

            //Mando error 400 si falla por mal validacion de datos
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Creando medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoCreado
        });

    });
});

//================================================
// Eliminar medico
//================================================

app.delete('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Borrando medico',
                errors: err
            });
        }

        if (!medicoBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;