const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');
let mainWindow;

var web_app = require('express')();
var server = require('http').Server(web_app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
	console.log("io server recieved connection!");
	socket.on('event', function(data){
		socket.broadcast.emit('new message', {
			username: client.username,
			message: data
		});
	});
	socket.on('disconnect', function(){
		console.log("Server recieved disconnect!");
	});
});

console.log("Starting Server...");

server.listen(3000);
console.log("Server Started!");

web_app.get('/', function(req, res){
	console.log("Recieved Browser connection");
	res.sendFile(path.resolve(__dirname + '/../UI/index.html'));
});

web_app.post('/', function(req, res){
	console.log("Recieved Browser Login");
	res.sendFile(path.resolve(__dirname + '/../UI/operator.html'));
});




function createWindow () {
	mainWindow = new BrowserWindow({width: 1024, height: 720});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../UI/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	console.log(__dirname);
	
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

function login(){
	console.log("Switching to operator_page");
	//window.location.href = path.join(__dirname, './operator_page.html');
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../UI/operator_page.html'),
		protocol: 'file:',
		slashes: true
	}));
}

app.on('ready', createWindow);

ipcMain.on('test', function(message){
	console.log("Recieved login request");
	console.log("ACCESS GRANTED!")
	login();
});

ipcMain.on('command', function(event, message){
	console.log(message);
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
