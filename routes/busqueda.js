var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//================================================
// Busqueda General
//================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Genero una expresion regular para que me busque la palabra de busqueda dentro 
    // del total del nombre del hospital y sea case insensitive
    var regexp = new RegExp(busqueda, 'i');


    Promise.all([buscarHospitales(busqueda, regexp),
            buscarMedicos(busqueda, regexp),
            buscarUsuarios(busqueda, regexp),
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

//================================================
// Busqueda por Coleccion
//================================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    // Genero una expresion regular para que me busque la palabra de busqueda dentro 
    // del total del nombre del hospital y sea case insensitive
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regexp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regexp);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regexp);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son Usuarios, Medicos y Hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            // Ponerlo entre [] hace que tome el valor de la variable "tabla" para el nombre de la respuesta
            [tabla]: data
        });
    });
});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });
    });
}

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }

            });
    });
}

function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        //Para buscar filtrando por mas de un campo
        Usuario.find({}, 'nombre email role google').or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });
    });
}

module.exports = app;