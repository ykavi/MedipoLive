const express = require('express');
const app = express();
const bp = require('body-parser');
const sql = require('mssql')
app.set('view engine', 'ejs');
app.use(express.static('public'));
const session = require('express-session');

const login = require("./dbOperations")
app.use(bp.urlencoded({ extended: true }));
app.use(session({
    secret: 'Özel-Anahtar',
    resave: false,
    saveUninitialized: true
}));


app.post('/giris', login.GirisYapildi);

app.get('/UyeOl', login.UyeOl);

app.get('/genel', login.getGenel);
app.post('/UyeOl', login.memberinsert);

app.get('/', login.Giris);
app.get('/sifre', login.sifre);
app.post('/sifre', login.YeniSifre);
app.post('/sifreUpdate', login.sifreUpdate);

app.get('/kuzey', login.getMsgKuzey);
app.get('/guney', login.getMsgGuney);
app.get('/halic', login.getMsgHalic);
app.get('/hesap', login.hesap);
app.post('/hesapupdate', login.hesapupdate);


const port = process.env.PORT || 3000;
server = app.listen(port);


const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {

    socket.on('oda', (data) => {
        socket.join(data);
        let count = io.sockets.adapter.rooms[data].length;
        console.log('New connect ' + data)
        io.emit('onlineUser', (count));
    })

    
    socket.on('disconnect', function () {
        io.emit('DisUser', 'bos');
        console.log('Kullanıcı Ayrıldı')
    });

    socket.on('odaName', (odaName) => {
        let count = io.sockets.adapter.rooms[odaName].length;
        io.emit('DisOnlineUser', (count));
    });


    socket.on('send message', (data) => {
        socket.to(data.oda).emit('send message', { msg: data.msg, nick: data.nick }); //socket.to Kendi dısında aynı odadakilere msjı yollar ** io.to odadaki tüm herkese yollar
        /*socket.broadcast.emit('send message', (data));//'broadcast' kendisi haric socketteki baglı herkese yollar*/
        socket.emit('Imessage', (data.msg));// socket.emit sadece kendine gozukur ** io.emit tum soketteki herkese yollar
        login.msgEkle(data.msg, data.nick, data.oda);
    });
})



console.log(`Example app listening on port ${port}* !`);