var socket_server = connectToUserSocket();

if (getCookie("currentRobot") == "Cornelius"){
  var robot_ip = "raspberrypi3-a.student.iastate.edu";
}
else {
  var robot_ip = "monmodenic.student.iastate.edu";
}
var socket_robot = io(robot_ip + ":5210");

//Redirect user as instructed by server
socket_server.on('redirect', function(destination) {
  window.location.href = destination;
});


//Reset user operator
var obj = {'username':getCookie("username"), 'robotIndex':getCookie("robotIndex"), 'operatorType':getCookie("operatorType"), 'currentRobot':getCookie("currentRobot")};
socket_server.emit('set user operator', obj);

socket_server.emit("request-robotIP", getCookie("username"), function(){
  alert("Requested robotIP");
});

socket_server.on("robotIP", function(data){
  //robot_ip = data;
  console.log("Got new robot ip " + data);
});

//Chat Box
$(function () {
  $('#msgform').submit(function(){
    socket_server.emit('chat message driver', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket_server.on('chat message', function(msg){
    $('#messages').append($('<li><strong>[' + msg.type + ']' + msg.username + ":</strong> " + msg.message + '</li>'));
    var chatDiv = document.getElementById("chat-box");
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });
});

window.addEventListener("load", function(){
  
  var buttonUpLeft = document.getElementById('buttonUpLeft');
  var buttonUp = document.getElementById('buttonUp');
  var buttonUpRight = document.getElementById('buttonUpRight');
  var buttonLeft = document.getElementById('buttonLeft');
  var buttonBoost = document.getElementById('buttonBoost');
  var buttonRight = document.getElementById('buttonRight');
  var buttonDownLeft = document.getElementById('buttonDownLeft');
  var buttonDown = document.getElementById('buttonDown');
  var buttonDownRight = document.getElementById('buttonDownRight');
  var logout = document.getElementById('logout');
  var lobby = document.getElementById('lobby');
  
  var health_container = document.getElementById('health_container');
  var health_bar = document.getElementById('health_bar');
  var health = 100;
  
  socket_robot.emit('request damage', function(){
	  console.log('Requested damage');
  });
  
  socket_server.on('damage update', function(damage){
    health = ((1500 - damage) / (1500));
    health_bar.setAttribute('width', health + "%");
  });

  //up left
  buttonUpLeft.addEventListener('mousedown', function() {
      console.log("q");
      socket_robot.emit('Serial Movement', { dir: 'q'});
  });
  buttonUpLeft.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  //up
  buttonUp.addEventListener('mousedown', function() {
      console.log("w");
      socket_robot.emit('Serial Movement', { dir: 'w'});
  });
  buttonUp.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  //up right 
  buttonUpRight.addEventListener('mousedown', function() {
      console.log("e");
      socket_robot.emit('Serial Movement', { dir: 'e'});
  });
  buttonUpRight.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  
  //left
  buttonLeft.addEventListener('mousedown', function() {
      console.log("a");
      socket_robot.emit('Serial Movement', { dir: 'a'});
  });
  buttonLeft.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  //boost
  buttonBoost.addEventListener('mousedown', function() {
      console.log("+");
      socket_robot.emit('Serial Movement', { dir: '+'});
  });
  buttonBoost.addEventListener('mouseup', function() {
      console.log("0");
      socket_robot.emit('Serial Movement', { dir: '0'});
  });  


  //right
  buttonRight.addEventListener('mousedown', function() {
      console.log("d");
      socket_robot.emit('Serial Movement', { dir: 'd'});
  });
  buttonRight.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });  
  
  
 buttonDownLeft.addEventListener('mousedown', function() {
      console.log("z");
      socket_robot.emit('Serial Movement', { dir: 'z'});
  });
  buttonDownLeft.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  buttonDown.addEventListener('mousedown', function() {
      console.log("s");
      socket_robot.emit('Serial Movement', { dir: 's'});
  });
  buttonDown.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  
  buttonDownRight.addEventListener('mousedown', function() {
      console.log("c");
      socket_robot.emit('Serial Movement', { dir: 'c'});
  });
  buttonDownRight.addEventListener('mouseup', function() {
      console.log("x");
      socket_robot.emit('Serial Movement', { dir: 'x'});
  });
  

  var webcam_port = "12000";
  var webcam_host = $(".feed img");
  var cam_socket = io.connect('http://' + robot_ip + ':' + webcam_port);
  
  if (robot_ip == "monmodenic.student.iastate.edu")
	  document.getElementById('video').style.transform='scaleY(-1)';
  else
	  document.getElementById('video').style.transform='scaleY(1)';
    
  cam_socket.on("connection", function(socket){
    console.log("Connected to camera");
  });
  cam_socket.on('image', function (data) {
    webcam_host.attr("src", "data:image/jpeg;base64," + data );
  });
    

  logout.addEventListener('mouseup', function(){
    console.log("Logging out...");
    window.location.href = 'http://proj-309-rb-b-2.cs.iastate.edu:3000/';
    //Update Database with Robot score
  });

  lobby.addEventListener('mouseup', function(){
    console.log("Redirecting back to lobby");
    window.location.href = 'http://proj-309-rb-b-2.cs.iastate.edu:3000/lobby';
  });

});