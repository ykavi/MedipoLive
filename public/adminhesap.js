
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
    socket.emit('oda', 'Genel');

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

