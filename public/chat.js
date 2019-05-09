$(function () {
    var socket = io.connect('http://localhost:3000');

    var message = $('#mesaj');

    $("#send").click(function () {
        socket.emit('send message', $('#mesaj').val());
        $('#mesaj').val('');
        $("#mesaj").focus();
    });
    $('#mesaj').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            socket.emit('send message', $('#mesaj').val());
            $('#mesaj').val('');
            $("#mesaj").focus();
        }
        event.stopPropagation();
    });

    socket.on('send message', (data) => {
        $('#messages').append($('<li>').text(data));
    });

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
    if (event.target.className == 'modal-card-body') {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }
}