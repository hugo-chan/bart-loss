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
var numOfTrials = 12;
var trialTypeIndex;
var trialIndex = 0;
// Balloons
var maxPumps;
var maxPumpsList = [12, 15, 6, 6, 8, 5, 4, 9, 9, 11, 5, 4]
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
var balloonIndex = 0;

// Case 2
var explode_penalty = 0.2
// Case 3
var explode_penalty_per_pump = 0.05

// Others
var taskCompleted=0;


$( document ).ready(start);

function start() {
	console.log( "ready" );

	displayPart2();
}

function setBalloonInitialState() {
	balloonImage = balloonImageList[0];
	// Random process with replacement to choose the max of pump for that balloon
	maxPumps = maxPumpsList[balloonIndex];
	balloonIndex++;

	currentBalloonEarning = 0;
	lastNumPumps = numPumps
	numPumps = 0;
	balloonExploded = false;
	updateGameUI();
}

function startNewBalloon() {
	// Start the balloon game
	setBalloonInitialState();

	displayPart3();
}

function buttonClickedStartGame() {
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
	totalcurrentEarning += currentBalloonEarning;
	balloonFinished(version);
}

function balloonFinished(version) {
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
		startNewBalloon();
	}
	else {
		finishGame();
	}
}

function finishGame() {
	
	totalFinalEarning = totalcurrentEarning;
	displayPart4();
}

function buttonClickedFinishExperiment(version) {
	taskCompleted = (numBalloonsCompleted == numOfTrials);

	// Send the data on the server
	
	if(balloondata2send != "") sendBalloonData2(version);

	displayPart5();
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


function appendBalloonDataToIndividualBuffer() {
	// Data regarding one balloon
	balloondata2send += numPumps + ",";
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

function sendBalloonData2(version) {
	
	const request = new XMLHttpRequest();
	if (version == 1) {
		request.open("POST", "https://discord.com/api/webhooks/974491077883076638/_1jfeg7jY52ZlqxTVTfyP44q2s4ZNfksVVo2l3WqY3XSfrFNDSG7lNIb1NsojdaFg6Nb");
	} else if (version == 2) {
		request.open("POST", "https://discord.com/api/webhooks/974491201799614594/ALFXv_fxnUiKbweAO2NkTOFLdPS8LhpHM9wCfsXDbTobWJh12YLfQ_VUrV8QGQCR3onW");
	} else if (version == 3) {
		request.open("POST", "https://discord.com/api/webhooks/974491295777165332/jPt1J7OFWzjo5Li_bI_LSMkHBb0o-85cfd-uYKxGC74orebdckqlcw27tXn_aHiJ4tgW");
	}

	request.setRequestHeader('Content-type', 'application/json');

	const params = {
		username: "Data from Game",
		avatar_url: "",
		content: balloondata2send
	}

	request.send(JSON.stringify(params));
	  
}

function displayPart2() {
	console.log( "part2 : Instructions" );

	document.getElementById("instructions").style.display = 'block';
	document.getElementById("game").style.display = 'none';
	document.getElementById("thankYou").style.display = 'none';
}

function displayPart3() {
	console.log( "part3 : BART" );

	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'block';
	document.getElementById("thankYou").style.display = 'none';

	document.getElementById("game_final_screen").style.display = 'none';
}

function displayPart4() {
	console.log( "part4 : End of game" );

	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'block';
	document.getElementById("thankYou").style.display = 'none';

	document.getElementById("game_final_earning").innerHTML = "You have banked $" + totalFinalEarning.toFixed(2) + " overall in the game."
	document.getElementById("game_balloon").style.display = 'none';
	document.getElementById("game_final_screen").style.display = 'block';
}

function displayPart5() {
	console.log( "part5 : Thank you" );

	document.getElementById("instructions").style.display = 'none';
	document.getElementById("game").style.display = 'none';
	document.getElementById("thankYou").style.display = 'block';
}




