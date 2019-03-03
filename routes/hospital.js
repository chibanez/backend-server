var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//================================================
// Obtener todos los hospitales
//================================================
app.get('/', (req, res, next) => {

    //Si viene algun parametro en "desde" lo usa, sino usa 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        // populate entiende la referencia a un objeto de otra coleccion y me carga sus datos
        // en el 2do parametro le digo que campos del objeto quiero cargar
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitalesDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en Base de Datos. Cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitalesDB,
                        total: conteo
                    });
                });
            });
});

//================================================
// Actualizar hospital
//================================================
app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
                //El error lo devuelvo como un objeto
            });
        }

        hospitalDB.nombre = body.nombre;
        //En el autenticador del token lo decodeo y obtengo el id del usuario. Lo pongo en el req para poder utilizar la info del token aca
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalGuardado) => {

            if (err) {
                //Mando error 400 si falla por mal validacion de datos
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en Base de Datos. Guardando cambios de hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });
});

//================================================
// Crear un nuevo hospital
//================================================
//Utilizo el middleware para que valide el token en esta llamada (mdAutenticacion.verificaToken)
//El middleware puede ir en [] ya que la funcion puede ejecutar un array de middlewares uno atras del otro
app.post('/', [mdAutenticacion.verificaToken], (req, res) => {

    // Esto solo funciona si tengo configurado el body parser
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        //En el autenticador del token lo decodeo y obtengo el id del usuario. Lo pongo en el req para poder utilizar la info del token aca
        usuario: req.usuario._id
    });


    hospital.save((err, hospitalCreado) => {

        if (err) {

            //Mando error 400 si falla por mal validacion de datos
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Creando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalCreado
        });

    });
});

//================================================
// Eliminar hospital
//================================================

app.delete('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error en Base de Datos. Borrando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;