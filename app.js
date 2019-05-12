const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', function (req, res) {
    res.render('genel');
})
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
        console.log(data + ' odası')
    })

    socket.on('send message', (data) => {
        console.log(data.oda)
        socket.to(data.oda).emit('send message', (data.msg)); //socket.to Kendi dısında aynı odadakilere msjı yollar ** io.to odadaki tüm herkese yollar
        /*socket.broadcast.emit('send message', (data));//'broadcast' kendisi haric socketteki baglı herkese yollar
        */
        socket.emit('Imessage', (data.msg));// socket.emit sadece kendine gozukur ** io.emit tum soketteki herkese yollar

    });
})



console.log(`Example app listening on port ${port}* !`);