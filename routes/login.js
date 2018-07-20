var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // Utilizado para el Token

var app = express();

var Usuario = require('../models/usuario');


// Google
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ==========================================
//  Autenticación De Google
// ==========================================
app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';


    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if (e) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Token no válido',
                    errors: e
                });
            }


            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al buscar usuario - login',
                        errors: err
                    });
                }

                if (usuario) {

                    if (usuario.google === false) {
                        return res.status(400).json({
                            ok: true,
                            mensaje: 'Debe de usar su autenticación normal'
                        });
                    } else {

                        usuario.password = ':)';

                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }

                    // Si el usuario no existe por correo
                } else {

                    var usuario = new Usuario();


                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: true,
                                mensaje: 'Error al crear usuario - google',
                                errors: err
                            });
                        }


                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });

                    });

                }


            });


        });




});


// =================================
// Lógin de usuario Normal
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