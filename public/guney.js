$(function () {
    $("#icerik").height(window.innerHeight - 90 + 'px');
    $('#icerik').scrollTop($('#icerik')[0].scrollHeight);
    $(window).resize(function () {
        $("#icerik").height(window.innerHeight - 90 + 'px');
    });
    scrollingElement = (document.scrollingElement || document.body)
    $(scrollingElement).animate({
        scrollTop: document.body.scrollHeight
    });
    var socket = io.connect('/');
    socket.emit('oda', 'Güney');
    $("#send").click(function () {
        if ($.trim($('#mesaj').val()) == "" || $('#mesaj').val() == null) {
            return 0;
        }
        socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#guney').text(), nick: $('#nick').text() });
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
            socket.emit('send message', { msg: $('#mesaj').val(), oda: $('#guney').text(), nick: $('#nick').text() });
            $('#mesaj').val('');
            $("#mesaj").focus();
            scrollBottom()
        }
        event.stopPropagation();
    });
    var d = new Date();
    var strDate = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    socket.on('send message', (data) => {
        rs = Math.random();
        document.getElementById('messages').innerHTML += '<div id="' + rs + '" style="display:none">' + data.msg + '</div>' + '<li id="' + rs + '"  onclick="disPlay(' + rs + ')" style="float:left"><span class="is-size-7" style="float: right">' + strDate + '</span><h6 id="' + (rs + 1) + '" class="title is-6">' + data.nick + '</h6>' + data.msg + '<span class="icon has-text-success"  style="float: right">'
            + '<i class="fas fa-check"></i></span></li>' + '<label onclick="sikayetEtADD(' + rs + ')" name="' + rs + '" class="subtitle is-6 has-text-link" style="display: none; float: left; margin-top:15px">Şikayet Et</label>'
        scrollBottom()
    });
    socket.on('Imessage', (data) => {
        rs = Math.random();
        document.getElementById('messages').innerHTML += '<div id="' + rs + '" style="display:none">' + data + '</div><li id="' + rs + '" onclick="disPlay(' + rs + ')" class="Imessage"><span class="is-size-7" style="float: left">' + strDate + '</span><h6 class="title is-6">' + $('#nick').text() + '</h6>' + data + '<span class="icon has-text-success"  style="float: left">' +
            '<i class="fas fa-check"></i></span>' + '</li>' + '<label onclick="sil(' + rs + ')" name="' + rs + '" class="subtitle is-6 has-text-link" style="display: none; float: right; margin-top:15px">Sil</label>'
        $('#messages').append($('<div class="clear">'));
    });

    socket.on('onlineUser', (count) => {
        $('#onlineUser').text(count);
        socket.emit('onlineList', ($('#nick').text()));
    });












    function scrollBottom() {
        scrollingElement = document.getElementById('icerik');
        $(scrollingElement).animate({
            scrollTop: scrollingElement.scrollHeight
        });

    }
});

document.getElementById('nick').innerHTML = localStorage.getItem('Ad')



function disPlay(e) {
    $("label[id*='" + e + "']").toggle();
    $("label[name*='" + e + "']").toggle();
}
function sil(e) {
    var socket = io.connect('/');
    socket.emit('sil', { nick: $('#nick').text(), msg: document.getElementById(e).innerHTML, oda: 'Güney' });
    $("li[id*='" + e + "']").hide("slow");
    $("label[name*='" + e + "']").hide("slow");
}
function silDB(msgId) {
    var socket = io.connect('/');
    socket.emit('silDB', msgId);
    $("li[id*='" + msgId + "']").hide("slow");
    $("label[id*='" + msgId + "']").hide("slow");
}
function sikayetEt(msgId) {
    var socket = io.connect('/');
    socket.emit('sikayetEt', msgId);
    $("li[id*='" + msgId + "']").hide(500);
    $("label[id*='" + msgId + "']").hide(500);
}
function sikayetEtADD(e) {
    var socket = io.connect('/');
    var nick = document.getElementById(e + 1).innerHTML;
    socket.emit('sikayetEtADD', { nick: nick, msg: document.getElementById(e).innerHTML, oda: 'Güney' });
    $("li[id*='" + e + "']").hide(500);
    $("label[name*='" + e + "']").hide(500);
}














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

var close = document.getElementsByClassName('modal-close')[0];
close.onclick = function () {
    modalim.style.display = 'none';
}
window.onclick = function (event) {
    if (event.target.className == 'modal-background') {
        modalim.style.display = 'none';
    }
}
function onay(adres) {

    modalim.style.display = 'block';
    var onayButton = document.getElementById('onayButton');
    onayButton.onclick = function () {
        location.href = adres;
    }
    var vazgec = document.getElementById('vazgec');
    vazgec.onclick = function () {
        modalim.style.display = 'none';
    }
}