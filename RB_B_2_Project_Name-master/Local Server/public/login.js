function checkForEnter(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
		document.getElementById("loginButton").click();
	}
}
			
function validateForm() {
	var uname = document.getElementById("uname").value;
	var psw = document.getElementById("psw").value;
	
	re = /^\w+$/; 
	if (!re.test(uname)) {
		alert("Username must only contain letters, numbers, and underscores.");
		return false;
	}
	
	if (!re.test(psw)) {
		alert("Password must only contain letters, numbers, and underscores.");
		return false;
	}
	
	if (uname.length > 25) {
		alert("Username must be 25 characters or less");
		return false;
	}
	
	if (psw.length > 40) {
		alert("Password must be 40 characters or less");
		return false;
	}
	
	return true;

}