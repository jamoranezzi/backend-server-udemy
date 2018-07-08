var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// =================================
// Obtener todos los Hospitales
// =================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(

            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Hospitales',
                        err: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error Cargando Hospitales',
                            err: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });
            });

});


// =================================
// Actualizar Hospital
// =================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital',
                err: err
            });
        }

        if (!hospitalEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital con el id ' + id + ' no existe',
                err: { message: 'No existe un Hospital con ese ID' }
            });
        }

        hospitalEncontrado.nombre = body.nombre;
        hospitalEncontrado.usuario = req.usuario._id;


        hospitalEncontrado.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Hospital',
                    err: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

// =================================
// Crear un nuevo Hospital
// =================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Hospital',
                err: err
            });
        }
        //HTTP_ 201 - recurso Creado
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});



// =================================
// Borrar Hospital
// =================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Hospital',
                err: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital con el id ' + id + ' no existe',
                err: { message: 'No existe un Hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });

});


module.exports = app;