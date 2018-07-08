var express = require('express');

var app = express();

const path = require('path'); // Ya vienen con NodeJS 'path'  --- nos ayuda a construir el path actual de forma válida
const fs = require('fs'); // Carga el fileSystem tambien es de Node JS

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    //  __dirname  -- nos permirte obtener toda la ruta en la que nos encontramos actualmente
    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;