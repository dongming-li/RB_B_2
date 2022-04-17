var io = require('socket.io-client');
var ip = require('ip');

var robotIP = ip.address();
var macAddress;
var serialPort = "dumb";

require('getmac').getMac(function(err, data){
    if (err){
    	throw err;
    }
    console.log("Got MAC: " + data);
    macAddress = data;

    var SerialPort = require('serialport');

	if (macAddress.includes('b8:27:eb:41:0b:d5')){
		serialPort = new SerialPort("/dev/ttyACM0",{
			baudRate: 9600,
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			flowControl: false
		});
	}
	else {
		serialPort = new SerialPort("/dev/ttyACM0",{
			baudRate: 9600,
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			flowControl: false
		});
	}

	serialPort.on('open', function(){
		let dir = 'w';
		console.log('Serial Port Opened');
		sleep(1000);
	});
		
});

var socket = io.connect('http://proj-309-rb-b-2.cs.iastate.edu:3000', {
	transports: ["websockets", "polling"],
	reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
});	//Central Server connection

var http = require('http');
var express = require('express');
var app = express();
var sleep = require('system-sleep');


const LiveCam = require('livecam');
const webcam_server = new LiveCam({
	'ui_addr' : ip.address(),
	'ui_port' : 11000,
	'broadcast_addr' : ip.address(),
	'broadcast_port' : 12000,
	'gst_tcp_addr' : '0.0.0.0',
	'gst_tcp_port' : 10000,
	'start' : function(){
		console.log('WebCam server started!');
	},
	'webcam': {
		'width': 320,
		'height': 240,
		'framerate': 5
	}

});

var server = app.listen(5210);
var io_RPI = require("socket.io").listen(server); //Operators connect to this
//io_RPI.emit('new robot', 'Robot 1');	//Placeholder robot name

var operator;


socket.on('connect', function(){
	console.log("Connected to Central Server");
	var robotName = "";
	if (macAddress == 'b8:27:eb:83:34:4f')
		robotName = 'Excalibur';
	else if (macAddress == 'b8:27:eb:41:0b:d5')
		robotName = 'Cornelius';
	else if (macAddress == 'b8:27:eb:60:3d:21')
		robotName = 'MrRobot';
	else
		robotName = macAddress;
	
	socket.emit('new robot', robotName, function(){
		console.log("Sent I'm a robot");
	});
});

socket.on('error', function(){
	console.log("Central Server Error");
});

socket.on('disconnect', function(){
	console.log("Disconnected From Central Server");
});

var damage = 0;

io_RPI.on('connection', function(socket){

	console.log("User connected");
	socket.on('Serial Movement', function(data){
		serialPort.write(data.dir);

		console.log("Writing: " + data.dir);
	});

	socket.on('request damage', function(damage){
		socket.emit('damage update', damage);
	});
	socket.on('disconnect', function () {
		console.log('A user disconnected');

	});
			
	
});

webcam_server.broadcast();

while(true){
	if (serialPort == "dumb"){
		sleep(0.1);
		continue;
	}
	var readInput = serialPort.read(512);
	if (readInput == null){
		//console.log("Read is null");
		sleep(0.1);
	}
	else {
		readInput = readInput.toString();
		//console.log("Read: " + readInput);
		damage = readInput.substring(readInput.indexOf(":"));
		console.log("Damage updated to " + damage);
		socket.emit("damage", robotIP + ":" + damage);
	}
}

