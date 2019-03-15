var express = require('express');
// Para trabajar con upload de archivos tengo que instalar "npm install --save express-fileupload"
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Uso el middleware, lo van a usar todas las rutas que se definan a continuacion
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo seleccionado no es valido',
            errors: { message: 'El tipo seleccionado no es valido' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar una imagen.',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Obtener Nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'JPG'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de imagen no valida.',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Genero nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo a una carpeta especial
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo.',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });


});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuarioDB) => {

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El usuario ${ id } no existe.`,
                    errors: err
                });
            }

            // Si existe la imagen anterior la borro. Asi me queda solo la ultima
            var pathViejo = './uploads/usuarios/' + usuarioDB.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuarioDB.img = nombreArchivo;

            usuarioDB.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });

    }
    if (tipo === 'medicos') {

        Medico.findById(id, (err, medicoDB) => {

            if (!medicoDB) {
                return res.status(500).json({
                    ok: false,
                    mensaje: `El medico ${ id } no existe.`,
                    errors: err
                });
            }

            // Si existe la imagen anterior la borro. Asi me queda solo la ultima
            var pathViejo = './uploads/medicos/' + medicoDB.img;
            if (fs.existsSync(pathViejo) && medicoDB.img.length > 0) {
                fs.unlinkSync(pathViejo);
            }

            medicoDB.img = nombreArchivo;

            medicoDB.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });


    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospitalDB) => {

            if (!hospitalDB) {
                return res.status(500).json({
                    ok: false,
                    mensaje: `El hospital ${ id } no existe.`,
                    errors: err
                });
            }


            // Si existe la imagen anterior la borro. Asi me queda solo la ultima
            var pathViejo = './uploads/hospitales/' + hospitalDB.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospitalDB.img = nombreArchivo;

            hospitalDB.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });

    }
}

module.exports = app;