$(function () {
    $("#icerik").height(window.innerHeight - 120 + 'px');
    $('#icerik').scrollTop($('#icerik')[0].scrollHeight);
    $(window).resize(function () {
        $("#icerik").height(window.innerHeight - 120 + 'px');
    });
    scrollingElement = (document.scrollingElement || document.body)
    $(scrollingElement).animate({
        scrollTop: document.body.scrollHeight
    });
    var socket = io.connect('/');
    socket.emit('oda', 'Haliç');
    $("#send").click(function () {
        if ($.trim($('#mesaj').val()) == "" || $('#mesaj').val() == null) {
            return 0;
        }
        socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#halic').text(), nick: $('#nick').text() });
        $('#mesaj').val('');
        $("#mesaj").focus();
        scrollBottom();
    });
    $('#mesaj').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            if ($.trim($('#mesaj').val()) == "" || $('#mesaj').val() == null) {
                return;
            }
            socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#halic').text(), nick: $('#nick').text() });
            $('#mesaj').val('');
            $("#mesaj").focus();
            scrollBottom()
        }
        event.stopPropagation();
    });
    var d = new Date();
    var strDate = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    socket.on('send message', (data) => {
        document.getElementById('messages').innerHTML += '<li><span class="is-size-7" style="float: right">' + strDate + '</span><h6 class="title is-6">' + data.nick + '</h6>' + data.msg + '<span class="icon has-text-success"  style="float: right">'
            + '<i class="fas fa-check"></i></span></li>'
        scrollBottom()
    });
    socket.on('Imessage', (data) => {
        document.getElementById('messages').innerHTML += '<li class="Imessage"><span class="is-size-7" style="float: left">' + strDate + '</span><h6 class="title is-6">' + $('#nick').text() + '</h6>' + data + '<span class="icon has-text-success"  style="float: left">' +
            '<i class="fas fa-check"></i></span>' + '</li>'
        $('#messages').append($('<div class="clear">'));
    });













    function scrollBottom() {
        scrollingElement = document.getElementById('icerik');
        $(scrollingElement).animate({
            scrollTop: scrollingElement.scrollHeight
        });

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
//window.onclick = function (event) {
//if (event.target.className == 'icerik') {
//document.getElementById("mySidenav").style.width = "0";
//document.getElementById("main").style.marginLeft = "0";
// }
//}

document.getElementById('nick').innerHTML = localStorage.getItem('Ad')