var express = require("express");
var app = express();
var port = 3000;
var userServer = require('http').createServer(app);
var io = require('socket.io')(userServer);
var bodyParser = require('body-parser');
var mysql = require('mysql');

var userSocketList = [];
var userNameList = [];
var dbAccountList = [];
var robotSocketList = [];
var robotInfoList = [];

var leaderboard = [];

const path = require('path');
const url = require('url');


//Initialize bodyParser
app.use(bodyParser.json({limit: '5mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // support encoded bodies
 
//Send login page 
app.get("/login", (req, res) => {
	res.sendFile(__dirname + "/login.html");;
}); 

//Send Create User page
app.get("/create_account", (req, res) => {
	res.sendFile(__dirname + "/create_account.html");
}); 

app.get("/lobby", (req, res) => {
	res.sendFile(__dirname + "/lobby.html");
}); 

app.get("/admin", (req, res) => {
	res.sendFile(__dirname + "/admin.html");
});

app.get("/gunner", (req, res) => {
	res.sendFile(__dirname + "/gunner.html");
});

app.get("/driver", (req, res) => {
	res.sendFile(__dirname + "/driver.html");
}); 

app.get("/spectator", (req, res) => {
	res.sendFile(__dirname + "/spectator.html");
}); 

app.get("/profile", (req, res) => {
	res.sendFile(__dirname + "/profile.html");
}); 

app.get("/leaderboard", (req, res) => {
	res.sendFile(__dirname + "/leaderboard.html");
}); 

//Public folder to serve files
app.use(express.static(__dirname + '/public'));
 
//Listen on port
userServer.listen(port, () => {
	console.log("User server listening on port " + port);
});

app.get('/', function(req, res){
	res.redirect('http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'login');
});

app.get('/socket.io/*', function(req, res){
	res.sendFile(path.resolve(__dirname + '/public/socket.io.js'));
});

app.post('/login', function(req, res) {
	var username = req.body.uname;
	var password = req.body.psw;
	
	var con = mysql.createConnection({
		host: "mysql.cs.iastate.edu",
		user: "dbu309rbb2",
		password: "Ze3xcZG5",
		database: "db309rbb2"
	});
	
	con.connect(function(err) {
	  if (err) throw err;
	  con.query("SELECT * FROM users WHERE Username = '" + username + "'", function (err, result, fields) {
		if (err){
			throw err;
		}
		else if (result.length == 0){
			res.send("User does not exist in the database.");
		}
		else if (result[0].Password != password){
			res.send("Incorrect password.");
		}
		else if (result[0].isBanned != null && result[0].isBanned == 1) {
			res.send("You are banned.");
		}
		else if (result[0].UserRole != null && result[0].UserRole == 1) {
			res.redirect('http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'admin')
		}
		else {
			res.redirect('http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'lobby');
		}
		
		con.end();
	  });
	});
	
});

app.post('/create_account', function(req, res) {
	var username = req.body.uname;
	var password = req.body.psw;
	var confirmPassword = req.body.confirmPsw;
	
	var con = mysql.createConnection({
		host: "mysql.cs.iastate.edu",
		user: "dbu309rbb2",
		password: "Ze3xcZG5",
		database: "db309rbb2"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		var sql = "INSERT INTO users (Username, Password) VALUES ('" + username + "', '" + password + "')";
		con.query(sql, function (err, result) {
			if (err && err.code == "ER_DUP_ENTRY") 
				res.send("Username already taken.");
			else if (err)
				throw err;
			else {
				console.log("1 record inserted");
				//res.send("User created!");
				res.redirect('http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'login');
			}
			
			con.end();
		});
	});	
});

app.post('/profile', function(req, res) {
	
	const fs = require('fs');
	
	var fileType = req.body.pic.split(',')[0];
	fileType = fileType.split(';')[0];
	fileType = fileType.split('/')[1];
	console.log(fileType);
	var data = req.body.pic.split(',')[1];
	let buff = new Buffer(data, 'base64');
	if (fileType == "jpeg") {
		
		//Delete png if it exists
		fs.stat(__dirname + "/public/avatars/" + req.body.id + ".png", function (err, stats) {
		   console.log(stats);//here we got all information of file in stats variable

		   if (err) {
			   return console.error(err);
		   }

		   fs.unlink(__dirname + "/public/avatars/" + req.body.id + ".png",function(err){
				if(err) return console.log(err);
				console.log('file deleted successfully');
		   });  
		});
		
		//Convert to Base64 and write to folder
		fs.writeFileSync(__dirname + "/public/avatars/" + req.body.id + ".jpg", buff);
	}
	else if (fileType == "png") {
		
		//Delete jpg if it exists
		fs.stat(__dirname + "/public/avatars/" + req.body.id + ".jpg", function (err, stats) {
		   console.log(stats);//here we got all information of file in stats variable

		   if (err) {
			   return console.error(err);
		   }

		   fs.unlink(__dirname + "/public/avatars/" + req.body.id + ".jpg",function(err){
				if(err) return console.log(err);
				console.log('file deleted successfully');
		   });  
		});
		
		//Convert from Base64 and write to folder
		fs.writeFileSync(__dirname + "/public/avatars/" + req.body.id + ".png", buff);
	}
	
	res.redirect('http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'profile');
	
});


app.post('/updateHP', function(req, res) {
	var robot = req.body.robot;
	var amount = req.body.amount;


});

io.on('connection', function(socket){
	
	socket.on('new user', function(data) {
		
		if (data == "")
			socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'login');
		else {
			
			//Emit all database users
			var con = mysql.createConnection({
				host: "mysql.cs.iastate.edu",
				user: "dbu309rbb2",
				password: "Ze3xcZG5",
				database: "db309rbb2"
			});
			dbAccountList = [];
			con.connect(function(err) {
				if (err) throw err;
				var sql = "SELECT * FROM users";
				con.query(sql, function(err, result, fields)  {
					if (err) throw err;
					
					//Associate username and ID with socket
					socket.username = data;
					socket.type = "User";
					console.log(socket.username + " connected");
					userNameList.push(socket.username);
					userSocketList.push(socket);
					io.sockets.emit('usernames', userNameList);
					con.query("SELECT * FROM users WHERE Username = \"" + socket.username + "\";", function(err, result, fields) {
						if (err) throw err;
						socket.id = result[0].ID;
					});
					
					for (i = 0; i < result.length; i++) {
						dbAccountList.push(result[i].Username);
					}
					io.sockets.emit('dblist', dbAccountList);	
					
					con.end();
				});
			});		
		}
	});
	
	socket.on('kick user', function(data){
		
		for(var i=0;i<robotSocketList.length; i++){
			if(robotSocketList[i].driver == data){
				robotSocketList[i].driver = "";
				robotInfoList[i]['driver'] = "";
			}
			else if(robotSocketList[i].gunner == data){
				robotSocketList[i].gunner = "";
				robotInfoList[i]['gunner'] = "";
			}
			else{
				for(var j=0; j<robotSocketList[i].spectators.length; j++){
					if(robotSocketList[i].spectators[j] == data){
						robotSocketList[i].spectators[j] = "";
						robotInfoList[i]['spectators'] = "";
					}
				}
			}
		}
		for(var k=0; k<userNameList.length; k++){
			if(data == userNameList[k]){
				userSocketList[k].emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'lobby');
			}
		}
		
	});
	
	socket.on('ban user', function(data){
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			var sql = "UPDATE users SET isBanned = 1 WHERE Username = '" + data + "';";
			con.query(sql, function(err, result, fields)  {
				if (err) return;	//Currently not throwing errors
				
				con.end();
			});
		});
		
		for(var i=0;i<userSocketList.length; i++){
			if(data==userNameList[i]){
				userSocketList[i].emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'login');
			}
		}
	});
	
	socket.on('delete account', function(data){
		
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			var sql = "DELETE FROM users WHERE Username = '" + data + "';";
			con.query(sql, function(err, result, fields)  {
				if (err) return;	//Currently not throwing errors
				dbAccountList.splice(dbAccountList.indexOf(data), 1);
				io.sockets.emit('dblist', dbAccountList);	
				
				con.end();
			});
		});
	});
	
	socket.on('spectate', function(data){
		for(var i=0; i<robotSocketList.length; i++){
			if(data == robotSocketList[i].name){
				robotSocketList[i].spectators.push(socket.username);
				robotInfoList[i]['spectators'].push(socket.username);
				socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'spectator');
			}
		}
	});
	socket.on('redirect leaderboard', function(data){
		socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'leaderboard');
	});
	socket.on('redirect profile', function(data){
		socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'profile');
	});
	
	socket.on('redirect back', function(data){
		
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
		  if (err) throw err;
		  con.query("SELECT * FROM users WHERE Username = '" + data + "'", function (err, result, fields) {
			if (err){
				throw err;
			}

		
			else if (result[0].UserRole != null && result[0].UserRole == 1) {
				socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'admin');
			}
			else {
				socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'lobby');
			}
			
			con.end();
		  });
		});
	});
	socket.on ('set user operator', function(data) {
	
		//If user previously chose one, remove it
		for (i = 0; i < robotSocketList.length; i++) {
			
			var gunner = robotSocketList[i].gunner;
			var driver = robotSocketList[i].driver;
			
			if (data.username === gunner) {
				robotSocketList[i].gunner = "";
				robotInfoList[i].gunner = "";
			}
			
			else if (data.username === driver) {
				robotSocketList[i].driver = "";
				robotInfoList[i].driver = "";
			}
		}

		//Set chosen robot and operator type
		if (data.operatorType == 'gunner') {
			robotSocketList[data.robotIndex].gunner = data.username;
			robotInfoList[data.robotIndex].gunner = data.username;
		}
		else if (data.operatorType == 'driver') {
			robotSocketList[data.robotIndex].driver = data.username;
			robotInfoList[data.robotIndex].driver = data.username;
		}
			
		io.sockets.emit('robotInfo', robotInfoList);
	});
	
	
	socket.on('logout', function(data){
		socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'login');
	});
	
	
	socket.on('chat message lobby', function(msg){
		io.emit('chat message', {message: msg, username: socket.username, type:'Lobby'});
	});
	socket.on('chat message gunner', function(msg){
		io.emit('chat message', {message: msg, username: socket.username, type:'Gunner'});
	});
	socket.on('chat message driver', function(msg){
		io.emit('chat message', {message: msg, username: socket.username, type:'Driver'});
	});
	socket.on('chat message spectator', function(msg){
		io.emit('chat message', {message: msg, username: socket.username, type:'Spectator'});
	});
	socket.on('request profile info', function(username) {
	
		//Initialize variables
		var displayName = "";
		var bio = "";
		var onlineStatus = false;
		var friendsArray = [];
		
		
		//Check database for Display Name and Bio
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		con.connect(function(err) {
			if (err) throw err;
			
			con.query("SELECT * FROM users WHERE Username = '" + username + "'", function (err, result, fields) {
				if (err) throw err;
				var info = "";
				
				if (result.length == 0) {
					info = {"success":false};
				}
				else {
				
					if (result[0].DisplayName != null) 
						displayName = result[0].DisplayName;
					if (result[0].Bio != null)
						bio = result[0].Bio;
					
					//Check if user is online
					for (i = 0; i < userNameList.length; i++) {
						if (userNameList[i] == username)
							onlineStatus = true;
					}
					
					
					//Create friends list
					con.query("SELECT * FROM friends WHERE UserID = " + result[0].ID + ";", function (err, friend, fields) {
						if (err) throw err;
						for (i = 0; i < friend.length; i++) {
							con.query("SELECT * FROM users WHERE ID = " + friend[i].FriendID + ";", function (err, friendUser, fields) {
								if (err) throw err;							
								friendsArray.push(friendUser[0].Username);
							});
						}
						con.end();
					});
					
					setTimeout(function() {
						var info = {"ID":result[0].ID, "username":username, "displayName":displayName, "bio":bio, "onlineStatus":onlineStatus, "friendsArray":friendsArray, "success":true};
						socket.emit('profile info', info);
					}, 200);
				}
			});
		});
	});
	
	socket.on('request user id', function(username) {
		
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			con.query("SELECT * FROM users WHERE Username = '" + username + "'", function (err, result, fields) {
				if (err) throw err;
				socket.emit('get user id', result[0].ID);
				con.end();
			});
		});
		
	});
	
	socket.on('edit display name', function(displayName) {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			var sql = "UPDATE users SET DisplayName = '" + displayName + "' WHERE Username = '" + socket.username + "';";
			con.query(sql, function (err, result, fields) {
				if (err) throw err;
				con.end();
			});
		});
		
	});
	
	socket.on('edit bio', function(bio) {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			var sql = "UPDATE users SET Bio = \"" + bio + "\" WHERE Username = \"" + socket.username + "\";";
			con.query(sql, function (err, result, fields) {
				if (err) throw err;
				con.end();
			});
		});
	});
	
	
	socket.on('disconnect', function() {
		if (socket.type == "User"){
			console.log(socket.username + " disconnected");
			userSocketList.splice(userSocketList.indexOf(socket), 1);
			if (socket.username)
				userNameList.splice(userNameList.indexOf(socket.username), 1);
			io.sockets.emit('usernames', userNameList);
			
			//Remove user from robot on disconnect
			var user = socket.username;
			for (i = 0; i < robotSocketList.length; i++) {
				if (robotSocketList[i].gunner == user) {
					robotSocketList[i].gunner = "";
					robotInfoList[i].gunner = "";
				}
				else if (robotSocketList[i].driver == user) {
					robotSocketList[i].driver = "";
					robotInfoList[i].driver = "";
				}
				
			}
			// console.log("Gunner: " + robotSocketList[0].gunner);
		}
		else if (socket.type == "Robot"){
			console.log(socket.name + " disconnected");
			robotSocketList.splice(robotSocketList.indexOf(socket), 1);
			if (socket.name) {
				var index = robotInfoList.findIndex(function(item, i) {
					return item.name === socket.name;
				});
				robotInfoList.splice(index, 1);
			}
		}
		io.sockets.emit('robotInfo', robotInfoList);
	});
	
	socket.on('request robot list', function() {
		io.emit('robotInfo', robotInfoList)
	});
	
	socket.on('request-for-redirect', function(data) {
		for(i = 0; i < robotInfoList.length; i++) {
			if(robotInfoList[i].gunner === data) {
				socket.emit("redirect", "/gunner");
				return;
			}
			if(robotInfoList[i].driver === data) {
				socket.emit("redirect", "/driver");
				return;
			}
		}
		socket.emit("redirect", "/spectator");
	});

	socket.on('request-robotIP', function(data) {
		for(i = 0; i < robotInfoList.length; i++) {
			if(robotInfoList[i].gunner === data) {
				console.log("Returning this IP: " + robotInfoList[i]['ip']);
				socket.emit("robotIP", robotInfoList[i]['ip']);
			}
			if(robotInfoList[i].driver === data) {
				console.log("Returning this IP: " + robotInfoList[i]['ip']);
				socket.emit("robotIP", robotInfoList[i]['ip']);
			}
		}
	});	
		
	socket.on('new robot', function(data) {
		
		//Set robot name, users, and IP in socket
		socket.name = data;
		socket.type = "Robot";
		socket.gunner = "";
		socket.driver = "";
		socket.spectators = [];
		socket.IP = socket.request.connection.remoteAddress;
		robotIP = socket.IP.toString().substring(socket.IP.toString().lastIndexOf(":")+1, socket.IP.toString().length);
		robotSocketList.push(socket);
		console.log("Robot " + socket.name + " connected with " + robotIP);
		
		//Emit robot info to client
		var robot = {'name':socket.name, 'gunner':socket.gunner, 'driver':socket.driver, 'spectators':socket.spectators, 'ip':robotIP};
		robotInfoList.push(robot);
		io.sockets.emit('robotInfo', robotInfoList);
	});

	//Client request for User Leaderboard
	socket.on('request user leaderboard', function() {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		var userLeaderboardList = [];
		con.connect(function(err) {
			if (err) throw err;
			con.query("SELECT * FROM leaderboardUser ORDER BY totalPoints DESC", function (err, result, fields) {
				if (err) throw err;
				for (i = 0; i < result.length; i++) {
						userLeaderboardList.push(result[i]);
				}
				
				//Send User Leaderboard to client
				socket.emit('user leaderboard update', userLeaderboardList);
				con.end();
			});
		});
		
	});
	
	
	//Client request for Robot Leaderboard
	socket.on('request robot leaderboard', function() {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		var robotLeaderboardList = [];
		con.connect(function(err) {
			if (err) throw err;
			con.query("SELECT * FROM leaderboardRobot ORDER BY totalPoints DESC", function (err, result, fields) {
				if (err) throw err;
				for (i = 0; i < result.length; i++) {
						robotLeaderboardList.push(result[i]);
				}
				//Send Robot Leaderboard to client
				socket.emit('robot leaderboard update', robotLeaderboardList);
				con.end();
			});
		});
		
	});
	
	socket.on('add friend', function(friendUname) {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		con.connect(function(err) {
			if (err) throw err;
			con.query("SELECT * FROM users WHERE Username = \"" + friendUname + "\";", function (err, result, fields) {
				if (err) throw err;
				if (result.length == 0) return;
				
				con.query("INSERT INTO friends (FriendID, UserID) VALUES (" + result[0].ID + ", " + socket.id + ");", function (err, result, fields) {
					if (err) throw err;
					socket.emit('redirect', 'http://proj-309-rb-b-2.cs.iastate.edu:' + port + '/' + 'profile');
					con.end();
				});
				
			});
		});
		
		
		
	});
	
	
	socket.on('damage', function(data){
		var inp = data.toString();
		var bot = inp.substring(0, inp.indexOf(":"));
		var amount = inp.substring(inp.lastIndexOf(":") + 1);
		console.log("Damage update requested. Robot: " + bot + " down to" + amount);

	// Award points to other robot
	// Go through active robot list
	// Check for the one not equal to the bot
	// points += 10;
		var robotToAward;
		var gunnerToAward;
		var driverToAward;
		
		var gunnerToDamage;
		var driverToDamage;

		for(var i = 0; i < robotSocketList.length; i++){
			if(robotSocketList[i].IP != bot){
				robotToAward = robotSocketList[i].name;
				gunnerToAward = robotSocketList[i].gunner;
				driverToAward = robotSocketList[i].driver;
			}
			else{
				gunnerToDamage = robotSocketList[i].gunner;
				driverToDamage = robotSocketList[i].driver;
				console.log("Gunner hit: " + gunnerToDamage);
				console.log("Driver hit: " + driverToDamage);
			}
		}
		
		for(var i=0; i<userNameList; i++){
			if(gunnerToDamage == userNameList[i]){
				console.log("Emitting damage to gunner");
				userSocketList[i].emit('damage update', amount);
			}
			if(driverToDamage == userNameList[i]){
				console.log("Emitting damage to driver");
				userSocketList[i].emit('damage update', amount);
			}
		}

		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		
		//Update Driver leaderboard points
		con.connect(function(err) {
			if (err) throw err;
			var sql = "SELECT * FROM leaderboardUser WHERE username = \"" + driverToAward + "\";";
			con.query(sql, function(err, result, fields)  {
				if (err) return;	//Currently not throwing errors
				
				if (result.length > 0) {
					var updateDriver = "UPDATE leaderboardUser SET totalPoints = totalPoints + 10 WHERE username = '" + driverToAward + "';";
					con.query(updateDriver);
				}
				else {
					var insertDriver = "INSERT INTO leaderboardUser (username, totalPoints) values ('" + driverToAward + "', 10);";
					con.query(insertDriver);
				}
				
				//Update Gunner leaderboard points
				var sql2 = "SELECT * FROM leaderboardUser WHERE username = \"" + gunnerToAward + "\";";
				con.query(sql2, function(err, result2, fields)  {
					if (err) return;	//Currently not throwing errors
					
					if (result2.length > 0) {
						var updateGunner = "UPDATE leaderboardUser SET totalPoints = totalPoints + 10 WHERE username = '" + gunnerToAward + "';";
						con.query(updateGunner);
					}
					else {
						var insertGunner = "INSERT INTO leaderboardUser (username, totalPoints) values ('" + gunnerToAward + "', 10);";
						con.query(insertGunner);
					}
					
					//Update Robot leaderboard points
					var sql3 = "SELECT * FROM leaderboardRobot WHERE robotName = \"" + robotToAward + "\";";
					con.query(sql3, function(err, result3, fields)  {
						if (err) return;	//Currently not throwing errors
						
						if (result3.length > 0) {
							var updateRobot = "UPDATE leaderboardRobot SET totalPoints = totalPoints + 10 WHERE robotName = '" + robotToAward + "';";
							con.query(updateRobot);
						}
						else {
							var insertRobot = "INSERT INTO leaderboardRobot (robotName, totalPoints) values ('" + robotToAward + "', 10);";
							con.query(insertRobot);
						}
						
						setTimeout(function() {	
							con.end();
						}, 200);
					});	
				});
			});
		});
	});
	
	//Client request for User Leaderboard
	socket.on('request friend list', function(UserID) {
		var con = mysql.createConnection({
			host: "mysql.cs.iastate.edu",
			user: "dbu309rbb2",
			password: "Ze3xcZG5",
			database: "db309rbb2"
		});
		var friendList = [];
		var friendIDList = [];
		con.connect(function(err) {
			if (err) throw err;
			con.query("SELECT * FROM friends WHERE UserID = " + UserID, function (err, result, fields) {
				if (err) throw err;
				for (i = 0; i < result.length; i++) {
						friendIDList.push(result[i].FriendID);
				}
				for(i=0; i<friendIDList.length; i++){
					con.query("SELECT * FROM users WHERE ID = " + friendIDList[i], function(err, result, fields){
						friendList[i].push({"name":result[0].Username, "online":userNameList.contains(result[0].Username)});
					});					
				}
				
				
				//Send friend list
				socket.emit('friend list update', friendList);
				con.end();
			});
		});
		
	});
});
