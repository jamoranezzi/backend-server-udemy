var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


// =================================
// Obtener todos los Médicos
// =================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Médicos',
                        err: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error Cargando Médicos',
                            err: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });

});


// =================================
// Actualizar Médico
// =================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Médico',
                err: err
            });
        }

        if (!medicoEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Médico con el id ' + id + ' no existe',
                err: { message: 'No existe un Médico con ese ID' }
            });
        }

        medicoEncontrado.nombre = body.nombre;
        medicoEncontrado.usuario = req.usuario._id;
        medicoEncontrado.hospital = body.hospital;


        medicoEncontrado.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Médico',
                    err: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});

// =================================
// Crear un nuevo Médico
// =================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Médico',
                err: err
            });
        }
        //HTTP_ 201 - recurso Creado
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});



// =================================
// Borrar Médico
// =================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Médico',
                err: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Médico con el id ' + id + ' no existe',
                err: { message: 'No existe un Médico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });


    });

});


module.exports = app;