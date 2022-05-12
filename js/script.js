// Configure the game

var pID = -1;
// Earnings
var totalcurrentEarning = 5;
var totalFinalEarning = 0;
var currentBalloonEarning = 0;
var lastBalloonEarning = 0;
var earningPerPump = 0.05;
// Random process
var numOfTrialTypes = 1;
var balloonImageList = ["blueBalloon.png", "redBalloon.png", "greenBalloon.png"];
var balloonImage;
// var numOfTrials = 1;
var numOfTrials = 8;
var trialTypeIndex;
var trialIndex = 0;
// Balloons
var maxPumps;
var maxPumpsList = [5, 7, 4, 8, 9, 4, 5, 5]
var balloonExploded = false;
var totalExplodedBalloons = 0;
var numPumps = 0;
var lastNumPumps = 0;
var totalNumPumps = 0;
var totalNumPumpsForNonExplodedBalloons = 0;
var numBalloonsCompleted = 0;
//  Data to send
var overalldata2send = "";
var balloondata2send = "";
// Dates, times
var date_experience_start;
var date_game_start = 0;
var date_game_end;
var date_balloon_start;
var date_balloon_end;
var date_befFirstPump;
var time_befFirstPump;
var date_betwLastPumpAndCollect;
var time_betwLastPumpAndCollect;
var balloonIndex = 0;

// Case 2
var explode_penalty = 0.2
// Case 3
var explode_penalty_per_pump = 0.05

// Others
var taskCompleted=0;


// Pre-condition : a should be less than b
function randInt(a,b) { return Math.floor((Math.random() * b) + a); }


$( document ).ready(start);

function start() {
	console.log( "ready" );

	displayPart2();
}

function setBalloonInitialState() {
	balloonImage = balloonImageList[balloonIndex % 3];
	// Random process with replacement to choose the max of pump for that balloon
	maxPumps = maxPumpsList[balloonIndex];
	balloonIndex++;

	currentBalloonEarning = 0;
	lastNumPumps = numPumps
	numPumps = 0;
	balloonExploded = false;
	updateGameUI();
	time_befFirstPump = 0;
	time_betwLastPumpAndCollect = 0;
	date_balloon_start = new Date();
	date_befFirstPump = new Date();
}

function buttonClickedSendID() {

	enteredpID = document.getElementById("id_number").value;
	// If ID entered is invalid
	if( enteredpID == "" || enteredpID < 0 || enteredpID > 1000 || isNaN(enteredpID)) {
		alert("Incorrect ID number. Please re-enter it.");
		return;
	}
	if(pID == -1)
	{
		pID = enteredpID;
		date_experience_start = new Date();
		displayPart2();
	}
}

function startNewBalloon() {
	// Start the balloon game
	setBalloonInitialState();

	displayPart3();
}

function buttonClickedStartGame() {
	date_game_start = new Date();
	startNewBalloon();
}

String.prototype.leftJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char;
    }
    return fill.join('') + this;
}

String.prototype.rightJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char;
    }
    return this + fill.join('');
}

function updateGameUI() {
	var image = document.getElementById("img_balloon");
	image.src = "../img/" + balloonImage;
	image.style.width = 'auto';
	image.style.height = Math.round( 2.0/3.0 * screen.height * (10 + numPumps) / (5.0 + 128.0)) +'px';
	// document.getElementById("earning_by_pump").innerHTML = "Max pumps = " + maxPumps + ", numPumps = " + numPumps;
	document.getElementById("game_total_current_earning").innerHTML = "Total earned: $" + totalcurrentEarning.toFixed(2);
	document.getElementById("game_last_balloon_earning").innerHTML = "Last balloon: $" + lastBalloonEarning.toFixed(2);
	document.getElementById("game_last_balloon_pumps").innerHTML = "Last balloon # pumps: "+ lastNumPumps;
	document.getElementById("game_curr_balloon_pumps").innerHTML = "Current balloon # pumps: "+ numPumps;
	document.getElementById("remaining_balloons").innerHTML = "Remaining Balloons: " + (numOfTrials - balloonIndex + 1).toString();
}

function buttonClickedPumpBalloon(version) {
	if(numPumps == 0) time_befFirstPump = dateDifferenceMinSecMil(date_befFirstPump,new Date());
	date_betwLastPumpAndCollect = new Date();

	++numPumps;
	updateGameUI();
	if(numPumps <= maxPumps) {
		currentBalloonEarning += earningPerPump;
	} else {
		balloonExploded = true;
		totalExplodedBalloons++;
		currentBalloonEarning = 0;
		setTimeout(balloonFinished, 10, version); // to instantly refresh
	}
}

function buttonClickedCollectMoney(version) {
	if(numPumps != 0) {
		time_betwLastPumpAndCollect = dateDifferenceMinSecMil(date_betwLastPumpAndCollect,new Date());
	} else {
		time_betwLastPumpAndCollect = 0;
	}

	totalcurrentEarning += currentBalloonEarning;
	balloonFinished(version);
}

function balloonFinished(version) {
	date_balloon_end = new Date();

	lastBalloonEarning = currentBalloonEarning;
	numBalloonsCompleted++;
	totalNumPumps += numPumps;
	if(!balloonExploded) {
		totalNumPumpsForNonExplodedBalloons += numPumps;
		alert("You have earned $" + currentBalloonEarning.toFixed(2) + " total for this balloon.");
	} else {
		if (version == 1) {
			// No penalty
			alert("The balloon exploded! You have earned $" + currentBalloonEarning.toFixed(2) + " total for this balloon.");
		} else if (version == 2) {
			// Fixed penalty
			totalcurrentEarning -= explode_penalty
			lastBalloonEarning = -explode_penalty;
			alert("The balloon exploded! You lost $" + explode_penalty.toFixed(2) + " for this balloon.");
		} else if (version == 3) {
			// Proportional penalty
			let prop_penalty = explode_penalty_per_pump * numPumps
			totalcurrentEarning -= prop_penalty
			lastBalloonEarning = -prop_penalty;
			alert("The balloon exploded! You lost $" + prop_penalty.toFixed(2) + " for this balloon.");

		}
	}
	appendBalloonDataToIndividualBuffer();

	if(balloonIndex < numOfTrials) {
		console.log("ye");
		startNewBalloon();
	}
	else {
		console.log("ye2");
		finishGame();
	}
}

function finishGame() {
	
	console.log("ye3");
	totalFinalEarning = totalcurrentEarning;
	displayPart4();
}

function buttonClickedFinishExperiment() {
	date_game_end = new Date();

	taskCompleted = (numBalloonsCompleted == numOfTrials);

	// Send the data on the server
	if(balloondata2send != "") sendBalloonData2();
	prepareOverallDataToSend();
	sendOverallData2();

	displayPart5();
}

// function buttonClickedExitGame() {
// 	if (confirm('Are you sure you want to exit the game?')) {
// 		finishGame();
// 	}
// }

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function dateDifferenceMinSecMil(date0, date1) {
	var diff = new Date(date1-date0);;
	return pad(diff.getMinutes(),2)+":"+pad(diff.getSeconds(),2)+":"+pad(diff.getMilliseconds(),3);
}

function paddedDateDMY(date) {
	return pad(date.getDate(),2)+"/"+pad(date.getMonth()+1,2)+"/"+pad(date.getFullYear(),2);
}
function paddedDateHMS(date) {
	return pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2);
}

function appendBalloonDataToIndividualBuffer() {
	// Data regarding one balloon
	balloondata2send += pad(pID,3) + ",";
	balloondata2send += balloonIndex + ",";
	balloondata2send += maxPumps + ",";
	balloondata2send += numPumps + ",";
	balloondata2send += balloonExploded + ",";
	balloondata2send += currentBalloonEarning.toFixed(2) + ",";
	balloondata2send += totalcurrentEarning.toFixed(2) + ",";

	var time_totalOnBalloon = dateDifferenceMinSecMil(date_balloon_start,date_balloon_end);
	balloondata2send += time_totalOnBalloon + ",";

	balloondata2send += time_befFirstPump + ",";
	balloondata2send += time_betwLastPumpAndCollect + "\n";
}

function prepareOverallDataToSend() {

	var averageNumPumps = totalNumPumps/numBalloonsCompleted;
	var numNonExplodedBalloonsCompleted = numBalloonsCompleted - totalExplodedBalloons;
	var averageNumPumpsForNonExplodedBalloons = totalNumPumpsForNonExplodedBalloons/numNonExplodedBalloonsCompleted;

	// If the participant has exited the game before doing any balloon.
	if(date_game_start == 0 || numBalloonsCompleted == 0) {
		date_game_start = date_experience_start;
		averageNumPumps = 0; // replace NaN
		averageNumPumpsForNonExplodedBalloons = 0; // replace NaN
	}

	overalldata2send += pad(pID,3) + ",";
	overalldata2send += paddedDateDMY(date_game_start) + ",";
	overalldata2send += paddedDateHMS(date_game_start) + ",";
	overalldata2send += paddedDateHMS(date_game_end) + ",";
	overalldata2send += taskCompleted + ",";
	overalldata2send += numBalloonsCompleted + ",";
	overalldata2send += totalFinalEarning.toFixed(2) + ",";
	overalldata2send += totalNumPumps + ",";
	overalldata2send += averageNumPumps.toFixed(3) + ",";
	overalldata2send += totalExplodedBalloons + ",";
	overalldata2send += numNonExplodedBalloonsCompleted + ",";
	overalldata2send += totalNumPumpsForNonExplodedBalloons + ",";
	overalldata2send += averageNumPumpsForNonExplodedBalloons.toFixed(3) + "\n";

}

function sendOverallData() {
	$.ajax({
	 type: "POST",
	 url: "write_overall_data.php",
	 data: { data : overalldata2send },
	 success: function(msg){
	     if(msg != "") alert(msg);
	 },
	 error: function(XMLHttpRequest, textStatus, errorThrown) {
	    alert("Some error occured");
	 }
	 });
}

function sendOverallData2() {
	
	const request = new XMLHttpRequest();
	request.open("POST", "https://discord.com/api/webhooks/973413177901588610/jJ6VSOoN4usZXt9jfyliEgEU3it26nd678M--z9t4xNC0RZfCGw-1V3Y_D9N3dRVucO0");

	request.setRequestHeader('Content-type', 'application/json');

	const params = {
		username: "Data from Game",
		avatar_url: "",
		content: overalldata2send
	}

	request.send(JSON.stringify(params));
	  
}


function sendBalloonData() {
	$.ajax({
	 type: "POST",
	 url: "write_balloon_data.php",
	 data: { data : balloondata2send },
	 success: function(msg){
	     if(msg != "") alert(msg);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Some error occured");
		}
	});
}

function sendBalloonData2() {
	
	const request = new XMLHttpRequest();
	request.open("POST", "https://discord.com/api/webhooks/973413177901588610/jJ6VSOoN4usZXt9jfyliEgEU3it26nd678M--z9t4xNC0RZfCGw-1V3Y_D9N3dRVucO0");

	request.setRequestHeader('Content-type', 'application/json');

	const params = {
		username: "Data from Game",
		avatar_url: "",
		content: balloondata2send
	}

	request.send(JSON.stringify(params));
	  
}

function displayPart1() {
	console.log( "part1 : setup" );

	document.getElementById("exit_game").style.display = 'none';

	document.getElementById("setup").style.display = 'block';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'none';
	document.getElementById("thankYou").style.display = 'none';
}

function displayPart2() {
	console.log( "part2 : Instructions" );

	// document.getElementById("exit_game").style.display = 'block';

	document.getElementById("setup").style.display = 'none';
	document.getElementById("instructions").style.display = 'block';
	document.getElementById("game").style.display = 'none';
	document.getElementById("thankYou").style.display = 'none';
}

function displayPart3() {
	console.log( "part3 : BART" );

	document.getElementById("setup").style.display = 'none';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'block';
	document.getElementById("thankYou").style.display = 'none';

	document.getElementById("game_final_screen").style.display = 'none';
}

function displayPart4() {
	console.log( "part4 : End of game" );


	document.getElementById("setup").style.display = 'none';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'block';
	document.getElementById("thankYou").style.display = 'none';

	document.getElementById("game_final_earning").innerHTML = "You have banked $" + totalFinalEarning.toFixed(2) + " overall in the game."
	document.getElementById("game_balloon").style.display = 'none';
	document.getElementById("game_final_screen").style.display = 'block';
}

function displayPart5() {
	console.log( "part5 : Thank you" );

	document.getElementById("setup").style.display = 'none';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'none';
	document.getElementById("thankYou").style.display = 'block';
}




