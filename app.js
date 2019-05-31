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
    saveUninitialized: true,
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
app.get('/hesapupdate', login.Giris);
app.get('/giris', login.Giris);


app.get('/hesap/:id', login.HesapSilindi);
app.get('/oneri', login.GetOneri);

app.post('/oneri', login.PostOneri);

app.get('/admin', login.GetAdmin);
app.get('/AdminOneriler', login.GetAdminOneriler);
app.post('/AdminOneriler', login.PostAdminOneriler);
app.get('/AdminOneriGorus', login.GetAdminOneriGorus);
app.post('/AdminOneriGorus', login.PostAdminOneriGorus);
app.get('/adminhesap', login.AdminHesap)
app.post('/adminhesapupdate', login.AdminHesapUpdate);
app.get('/adminhesap/:id', login.AdminHesapSilindi);
app.get('/AdminSikayetler', login.GetAdminSikayetler);
app.post('/AdminSikayetler', login.AdminSikayetBan);
/*
app.get('/AdminOneriGorus',login.GetAdminOneriGorus);*/
const port = process.env.PORT || 3000;
server = app.listen(port);


const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {

    socket.on('oda', (data) => {
        socket.join(data);
        console.log('New connect ' + data)
    })

    socket.on('sil', (data) => {
        login.silMsg(data.nick, data.msg, data.oda);
    })
    socket.on('silDB', (data) => {
        login.silMsgDB(data);
    })
    socket.on('sikayetEt', (data) => {
        login.sikayetEt(data);
    })
    socket.on('sikayetEtADD', (data) => {
        login.sikayetEtADD(data.nick, data.msg, data.oda);
    })


    let count = Object.keys(io.sockets.connected).length
    io.emit('onlineUser', (count));


    socket.on('disconnect', function () {
        console.log('Kullanıcı Ayrıldı')
        let count = Object.keys(io.sockets.connected).length
        io.emit('onlineUser', (count));
    });



    socket.on('send message', (data) => {
        socket.to(data.oda).emit('send message', { msg: data.msg, nick: data.nick }); //socket.to Kendi dısında aynı odadakilere msjı yollar ** io.to odadaki tüm herkese yollar
        /*socket.broadcast.emit('send message', (data));//'broadcast' kendisi haric socketteki baglı herkese yollar*/
        socket.emit('Imessage', (data.msg));// socket.emit sadece kendine gozukur ** io.emit tum soketteki herkese yollar
        login.msgEkle(data.msg, data.nick, data.oda);
    });
})



console.log(`Example app listening on port ${port}* !`);