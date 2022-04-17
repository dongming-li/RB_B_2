//Connect to socket
var socket = connectToUserSocket();

//Redirect user as instructed by server
socket.on('redirect', function(destination) {
	window.location.href = destination;
});

//View own profile
var curProfile = getCookie("username");
socket.emit('request profile info', curProfile);

socket.on('profile info', function(data) {
	
	if (data.success) {
	
		document.getElementById('username').innerHTML = data.username;
		document.getElementById('displayName').innerHTML = data.displayName;
		document.getElementById('bio').innerHTML = data.bio;
		
		if (data.onlineStatus == true) {
			document.getElementById('onlineStatus').innerHTML = "Online";
			document.getElementById('onlineStatus').style.color = "green";
		}
		else {
			document.getElementById('onlineStatus').innerHTML = "Offline";
			document.getElementById('onlineStatus').style.color = "red";
		}
		
		//Set edit buttons
		if (data.username == getCookie("username")) {
			document.getElementById('displayNameButton').innerHTML = "<button onclick='editDisplayName();'>Edit</button>";
			document.getElementById('bioButton').innerHTML = "<button onclick='editBio();'>Edit</button>";
			document.getElementById('profilePicButton').innerHTML = "<button type=\"button\" class=\"button\" onclick=\"openModal();\">Change Profile Pic</button>";
			document.getElementById('addFriendButton').innerHTML = "";
		}
		else {
			document.getElementById('displayNameButton').innerHTML = "";
			document.getElementById('bioButton').innerHTML = "";
			document.getElementById('profilePicButton').innerHTML = "";
			document.getElementById('addFriendButton').innerHTML = "<button type=\"button\" class=\"button\" onclick=\"addFriend()\">Add Friend</button>";
		}
		
		//Set profile picture
		var urlBase = "http://proj-309-rb-b-2.cs.iastate.edu:3000/avatars/";
		var url = "";
		if (urlExists(urlBase + data.ID + ".png")) {
			url = urlBase + data.ID + ".png";
		}
		else if (urlExists(urlBase + data.ID + ".jpg")) {
			url = urlBase + data.ID + ".jpg";
		}
		else if (urlExists(urlBase + data.ID + ".jpeg")) {
			url = urlBase + data.ID + ".jpeg";
		}
		else {
			url = urlBase + "default.jpg";
		}
		document.getElementById('profilePic').innerHTML = '<img src="' + url + '" class="avatar" alt="Profile Image"/>'
		
		//Display friends
		var html = '';
		for (i = 0; i < data.friendsArray.length; i++) {
			html += "<a onclick=\"viewProfileByUsername('" + data.friendsArray[i] + "')\" href=\"#\">" + data.friendsArray[i] + "</a><br/>";
		}
		document.getElementById("friendsList").innerHTML = html;
	}
	else {
		alert("User does not exist.");
	}
});

function editDisplayName() {
	var displayName = prompt("Enter your new display name:", "Harry Potter");
	displayName = displayName.replace("\"","\\'");
	socket.emit ('edit display name', displayName);
	socket.emit('request profile info', getCookie("username"));
}

function editBio() {
	var bio = prompt("Enter your new bio:", "I am the chosen one!");
	bio = bio.replace("\"","\\'");
	socket.emit ('edit bio', bio);
	socket.emit('request profile info', getCookie("username"));
}


function urlExists(url) {
	var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function viewProfile() {
	curProfile = prompt("Enter username:", getCookie("username"));
	socket.emit('request profile info', curProfile);
}

function viewProfileByUsername(username) {
	socket.emit('request profile info', username);
}

function returnHome() {
	socket.emit('redirect back', getCookie("username"));
}

function logout() {
	window.location.href = 'http://proj-309-rb-b-2.cs.iastate.edu:3000/login';
}

function openModal() {
	document.getElementById('myModal').style.display = "block";
}

document.getElementsByClassName("close")[0].onclick = function() {
    document.getElementById('myModal').style.display = "none";
}

function uploadProfilePic() {
	
	//Convert to Base64 and submit form
	var file = document.getElementById('newProfilePic').files[0];
	var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
	  document.getElementById('id').value = getCookie("ID");
	  document.getElementById('pic').value = reader.result;
	  //document.getElementById('pic').value = reader.result.split(',')[1];
	  document.getElementById("profileForm").submit();
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
}

function addFriend() {
	if (confirm("Add " + curProfile + " to friends list?")) {
		socket.emit('add friend', curProfile);
	} 
}
		
		