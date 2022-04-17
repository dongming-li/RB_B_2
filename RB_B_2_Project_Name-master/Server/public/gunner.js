
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


socket_robot.emit('request damage', function(){
	  console.log('Requested damage');
  });
  
  socket_server.on('damage update', function(damage) {
    console.log("Damage update event recieved. " + damage);
	  health = ((1500 - damage) / (1500));
	  health_bar.style.setAttribute('width', "" + health + "%");
  });
socket_server.on("robotIP", function(data){
  //robot_ip = data;
  console.log("Got new robot ip " + data);
});

//Chat Box
$(function () {
  $('#msgform').submit(function(){
    socket_server.emit('chat message gunner', $('#m').val());
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
    
  
  var buttonUp = document.getElementById('buttonUp');
  var buttonLeft = document.getElementById('buttonLeft');
  var buttonRight = document.getElementById('buttonRight');
  var buttonDown = document.getElementById('buttonDown');
  var buttonFire = document.getElementById('buttonFire');
  var logout = document.getElementById('logout');
  var lobby = document.getElementById('lobby');
  
  var c1 = document.getElementById('c1');
  var c2 = document.getElementById('c2');
  var c3 = document.getElementById('c3');
  var c4 = document.getElementById('c4'); 
  var c5 = document.getElementById('c5'); 
  var reticule = [c1, c2, c3, c4, c5];
  
  var health_container = document.getElementById('health_container');
  var health_bar = document.getElementById('health_bar');
  var health = 100;

  //laser-charging process and charging status
  var charge;  
  var charging = 0;
  var charge_level = 0;
  
  //keydown handler
  window.onkeydown = function(e){
	  var key = e.keyCode
	  
	  //prevent spacebar from scrolling
	  if(key == '32' && e.target == document.body) {
			e.preventDefault();
	  }
	  
	  //start fire
	  if(key == '32' && charging != 1){
		  charging = 1;
		  fireStart();
	  }
  };
  
  //keyup handler
  window.onkeyup = function(e){
		var key = e.keyCode
		//console.log(key);
		
		//stop fire
		if(key =='32'){
			charging = 0;
			fireStop();
		}
	};
 
  buttonUp.addEventListener('mousedown', function() {
      console.log("I");
      socket_robot.emit('Serial Movement', { dir: 'I'});
  });
  buttonUp.addEventListener('mouseup', function() {
      console.log("i");
      socket_robot.emit('Serial Movement', { dir: 'i'});
  });
  
  
  
  buttonLeft.addEventListener('mousedown', function() {
      console.log("J");
      socket_robot.emit('Serial Movement', { dir: 'J'});
  });
  buttonLeft.addEventListener('mouseup', function() {
      console.log("j");
      socket_robot.emit('Serial Movement', { dir: 'j'});
  });
  
  
  
  buttonRight.addEventListener('mousedown', function() {
      console.log("L");
      socket_robot.emit('Serial Movement', { dir: 'L'});
  });
  buttonRight.addEventListener('mouseup', function() {
      console.log("l");
      socket_robot.emit('Serial Movement', { dir: 'l'});
  });  
  
  
  buttonDown.addEventListener('mousedown', function() {
      console.log("M");
      socket_robot.emit('Serial Movement', { dir: 'M'});
  });
  buttonDown.addEventListener('mouseup', function() {
      console.log("m");
      socket_robot.emit('Serial Movement', { dir: 'm'});
  });
  
  buttonFire.addEventListener('mousedown', function(){
	  fireStart();
  });
  buttonFire.addEventListener('mouseup', function(){
	  fireStop();
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
  
  function fireStart(){
	  console.log("K");
	   charge_level = 1;
	   reticule[charge_level - 1].setAttribute("stroke-opacity", .2);

		charge = setInterval(function(){
			charge_level++;
			if(charge_level == 2){
				reticule[charge_level - 1].setAttribute("stroke-opacity", .4);
			}
			else if (charge_level == 3){
				reticule[charge_level - 1].setAttribute("stroke-opacity", .6);
			}
			else if(charge_level == 4){
				reticule[charge_level - 1].setAttribute("fill-opacity", 1);		
			}
				
		}, 750);  
  }
  
  function fireStop(){
	  console.log("k");
	  
	  if(charge_level >= 4){
		  console.log('start fire');
		  socket_robot.emit('Serial Movement', { dir: 'K'});
		  
		  var op = [.2,.4,.6,1,1];
		  reticule[4].setAttribute("fill-opacity", op);
		  var fire;
		  fire = setInterval(function(){
			 
			 
			for(var i=0; i< 3; i++){
				reticule[i].setAttribute("stroke-opacity",op[i]); 
			}
			reticule[3].setAttribute("fill-opacity", op[3]);
			reticule[4].setAttribute("fill-opacity", op[4]);

			
			if(op[4] <= 0){
			  clearInterval(fire);
		    }
			
			for(var j=0; j<5; j++){
				op[j] = op[j] - .1;
			}
		  },70);
		  console.log('stop fire');
	  }
	  else {
		  for(var i=0; i<3; i++){
			reticule[i].setAttribute("stroke-opacity", 0); 
		  }
		  reticule[3].setAttribute("fill-opacity", 0);
		  reticule[4].setAttribute("fill-opacity", 0);
	  }
	  clearInterval(charge);
	  charge_level = 0;
	  charging = 0;
	  socket_robot.emit('Serial Movement', { dir: 'k'});
	  
  }
   
  
   
});

