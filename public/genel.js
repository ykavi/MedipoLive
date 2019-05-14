$(function () {
    var socket = io.connect('http://localhost:3000');
    socket.emit('oda', 'Genel');
    $("#send").click(function () {
        socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#genel').text(),nick:$('#nick').text() });
        $('#mesaj').val('');
        $("#mesaj").focus();
        scrollBottom();
    });
    $('#mesaj').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#genel').text(),nick:$('#nick').text() });
            $('#mesaj').val('');
            $("#mesaj").focus();
            scrollBottom()
        }
        event.stopPropagation();
    });

    socket.on('send message', (data) => {
       // $('#messages').append($('<li>').text(data));
        document.getElementById('messages').innerHTML += '<li><h6 class="title is-6">'+ data.nick +'</h6>'+data.msg+'</li>'
        scrollBottom()
    });
    socket.on('Imessage', (data) => {
       // $('#messages').append($('<li class="Imessage">').text(data));
        document.getElementById('messages').innerHTML += '<li class="Imessage"> <h6 class="title is-6">' + $('#nick').text() + '</h6>' + data + '</li>'
        $('#messages').append($('<div class="clear">'));
    });













    function scrollBottom() {
        scrollingElement = (document.scrollingElement || document.body)
        $(scrollingElement).animate({
            scrollTop: document.body.scrollHeight
        }, 500);
    }
});



















function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}
window.onclick = function (event) {
    if (event.target.className == 'icerik') {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }
}