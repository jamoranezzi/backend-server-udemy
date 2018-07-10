var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // Utilizado para el Token

var app = express();

var Usuario = require('../models/usuario');


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =================================
// Autenticación Google
// =================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload: payload
    };
}


app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((err) => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                err: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                });
            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expira en 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }

        } else {
            // El usuario no existe .... hay que crearlos
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':D';


            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar Usuario',
                        err: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expira en 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }



    });


    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK',
    //     googleUser: googleUser
    // });

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