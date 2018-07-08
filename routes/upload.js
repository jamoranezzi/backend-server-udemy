var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options (Middleware)
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validar Tipos de Collecion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            err: { message: 'Tipo de colección no es válida' }
        });

    }
    //************

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            err: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            err: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Crear nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover archivo del temporal a un PATH personalizado
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                err: err
            });
        }
    })

    subirPorTipo(tipo, id, nombreArchivo, res);

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    err: { message: 'Usuario no existe' }
                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        err: err
                    });
                }

                usuarioActualizado.password = ':D';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    err: { message: 'Hospital no existe' }
                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        err: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    err: { message: 'Médico no existe' }
                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        err: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });


    }
}

module.exports = app;