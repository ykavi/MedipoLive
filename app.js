const express = require('express');
const app = express();
const bp = require('body-parser');
const sql = require('mssql')
app.set('view engine', 'ejs');
app.use(express.static('public'));

const login = require("./dbOperations")
app.use(bp.urlencoded({ extended: true }));


app.post('/giris', login.GirisYapildi);

app.get('/UyeOl', login.UyeOl);

app.post('/UyeOl', login.memberinsert);

app.get('/', login.Giris);
app.get('/sifre',login.sifre);
app.post('/sifre',login.YeniSifre);
app.post('/sifreUpdate',login.sifreUpdate);

app.get('/kuzey', function (req, res) {
    res.render('kuzey')
})
app.get('/guney', function (req, res) {
    res.render('guney')
})
app.get('/halic', function (req, res) {
    res.render('halic')
})
const port = process.env.PORT || 3000;
server = app.listen(port);


const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {

    socket.on('oda', (data) => {
        socket.join(data);
        console.log('New connect ' + data)
    })

    socket.on('send message', (data) => {
        socket.to(data.oda).emit('send message', { msg: data.msg, nick: data.nick }); //socket.to Kendi dısında aynı odadakilere msjı yollar ** io.to odadaki tüm herkese yollar
        /*socket.broadcast.emit('send message', (data));//'broadcast' kendisi haric socketteki baglı herkese yollar*/
        socket.emit('Imessage', (data.msg));// socket.emit sadece kendine gozukur ** io.emit tum soketteki herkese yollar
        login.msgEkle(data.msg,data.nick,data.oda);
    });
})



console.log(`Example app listening on port ${port}* !`);