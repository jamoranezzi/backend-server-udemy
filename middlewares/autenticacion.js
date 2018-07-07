var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED; // Utilizado para el Token


// =================================
// Verificar Token
// =================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                err: err
            });
        }

        req.usuario = decoded.usuario;
        next();
        // res.status(401).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });

};