var socket;
var hostnameValtozo = window.location.hostname;
if(hostnameValtozo == '10.8.0.1'){
    hostnameValtozo = '10.8.0.1';
}
var socket = io(`http://${hostnameValtozo}:8081`);
socket.on('connect', function () {
    console.log('Csatlakozva a socket.io szerverhez: ' + socket.id);
});