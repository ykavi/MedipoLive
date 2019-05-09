const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('home');
})

server = app.listen(3000);

const io = require('socket.io')(server);

io.on('connect', (socket) => {
    console.log('Yeni Baglanti');

    socket.on('send message', (data) => {
        io.emit('send message', (data));
    });
})