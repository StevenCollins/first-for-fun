//Set our event listeners
document.addEventListener('DOMContentLoaded', function() {
    var el = document.body;
    el.addEventListener("touchstart", handleStartTouch, false);
    el.addEventListener("touchmove", handleMove, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleEnd, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("keydown", handleStartKey, false);
    el.addEventListener("keyup", handleEndKey, false);
}, false);

//Global variables
var DEFAULT_SIZE = 100;
var DEFAULT_TIMEOUT = 3000;
var ongoingTouches = new Array;
var keySpaces = new Array;
var timer;

//Adds finger icons for touch screens
function handleStartTouch(event) {
    event.preventDefault();
    var touches = event.changedTouches;

    handleStart(touches);
}
//Adds finger icons for keyboards
function handleStartKey(event) {
    event.preventDefault();

    if (keySpaces.length == 0) {
        createKeySpaces();
    }

    if (ongoingTouches.find(function (i) { return i.identifier == event.key.toUpperCase() }) == undefined) {
        var touch = createTouchFromKey(event.key);

        if (ongoingTouchIndexById(touch.identifier) < 0) {
            handleStart([touch]);
        }
    }
}
//Adds finger icons
function handleStart(touches) {
    for (var i = 0; i < touches.length; i++) {
        //Do start
        createFinger(touches[i].identifier, touches[i].clientX, touches[i].clientY);
        //Save touch info
        ongoingTouches.push(copyTouch(touches[i]));
    }
    
    updateTimer();
}

//Moves finger icons
function handleMove(event) {
    event.preventDefault();
    var touches = event.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        //Get index for saved touch info
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            //Do move
            moveFinger(touches[i].identifier, touches[i].clientX, touches[i].clientY);
            //Update saved touch info
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
        }
    }
}

//Removes finger icons
function handleEnd(event) {
    event.preventDefault();
    var touches = event.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        //Get index for saved touch info
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            //Do end
            document.body.removeChild(document.getElementById('touch' + touches[i].identifier));
            //Remove saved touch info
            ongoingTouches.splice(idx, 1);
        }
    }

    updateTimer();
}
//Removes finger icons for keyboards
function handleEndKey(event) {
    event.preventDefault();

    //Get index for saved touch info
    var id = event.key.toUpperCase();
    var idx = ongoingTouchIndexById(id);
    if (idx >= 0) {
        //Do end
        document.body.removeChild(document.getElementById('touch' + id));
        //Remove saved touch info
        ongoingTouches.splice(idx, 1);
    }

    updateTimer();
}

//Chooses a finger
function handleChoose() {
    var theChosenFinger = Math.floor(Math.random() * ongoingTouches.length);

    for (var i = 0; i < ongoingTouches.length; i++) {
        if (i != theChosenFinger) {
            var elem = document.getElementById('touch' + ongoingTouches[i].identifier);
            elem.style.backgroundColor = "#f00";
        }
    }
}


//Updates the timer when the number of fingers changes
function updateTimer() {
    //If there is now more than one finger, restart the timer
    if (ongoingTouches.length > 1) {
        window.clearTimeout(timer);
        timer = window.setTimeout(handleChoose, DEFAULT_TIMEOUT);
    //Otherwise stop the timer
    } else {
        window.clearTimeout(timer);
    }
}

//Creates the finger icon element
function createFinger(id, xPosition, yPosition, size = DEFAULT_SIZE) {
    var halfSize = size / 2;
    var elem = document.createElement('div');
    elem.classList = 'finger';
    elem.id = 'touch' + id;
    elem.style.width = size + "px";
    elem.style.height = size + "px";
    elem.style.borderRadius = halfSize + "px";
    elem.style.lineHeight = size + "px";
    elem.style.left = (xPosition - halfSize) + "px";
    elem.style.top = (yPosition - halfSize) + "px";
    elem.textContent = id;
    document.body.appendChild(elem);
}

//Updates a finger icon element's position
function moveFinger(id, xPosition, yPosition, size = DEFAULT_SIZE) {
    var halfSize = size / 2;
    var elem = document.getElementById('touch' + id);
    elem.style.left = (xPosition - halfSize) + "px";
    elem.style.top = (yPosition - halfSize) + "px";
}

//Creates a copy of the touch object, since touch objects can be reused
function copyTouch(touch) {
    return { identifier: touch.identifier, clientX: touch.clientX, clientY: touch.clientY };
}
function createTouchFromKey(key) {
    var keySpace = keySpaces.find(function (i) {return i.isTaken == false;});
    keySpace.isTaken = true;
    return { identifier: key.toUpperCase(), clientX: keySpace.x, clientY: keySpace.y };
}

//Finds the index of a saved touch 
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;

        if (id == idToFind) {
            return i;
        }
    }
    return -1; // not found
}

function createKeySpaces() {
    var sampler = poissonDiscSampler(window.innerWidth, window.innerHeight, 200);
    var sample;
    
    while ((sample = sampler())) {
      keySpaces.push({ x: sample[0], y: sample[1], isTaken: false});
    }
    //Add as many "spaces" as possible to the array, which should be evenly but randomly distributed
    //See Poisson Disc, Bridson's algorithm
    //Each space should also store whether it's "in use" or not, and unused ones can be used for keyboard fingers
}