var socket = io.connect('http://proj-309-rb-b-2.cs.iastate.edu:3000');

socket.on('user', function(user) {
	document.getElementById("users").innerHTML = user;
});

function test() {
	
	alert("test");
	
}