var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // Utilizado para el Token

var app = express();

var Usuario = require('../models/usuario');

// =================================
// Lógin de usuario
// =================================

app.post('/', (req, res) => {

    var body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuarioEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error durante el Login',
                err: err
            });
        }

        if (!usuarioEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                err: { message: 'El email es incorrecto' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioEncontrado.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - Password',
                err: { message: 'El Password es incorrecto' }
            });
        }

        //Crear Token
        usuarioEncontrado.password = ':D'; // Evitar enviar la contraseña en el Token
        var token = jwt.sign({ usuario: usuarioEncontrado }, SEED, { expiresIn: 14400 }); //expira en 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioEncontrado,
            token: token,
            id: usuarioEncontrado.id
        });
    });

});


module.exports = app;