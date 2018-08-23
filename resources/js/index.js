//Set our event listeners
document.addEventListener('DOMContentLoaded', function() {
    var el = document.body;
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchmove", handleMove, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleEnd, false);
    el.addEventListener("touchleave", handleEnd, false);
}, false);

//Global variables
var DEFAULT_SIZE = 100;
var DEFAULT_TIMEOUT = 3000;
var ongoingTouches = new Array;
var timer;

//Adds finger icons
function handleStart(event) {
    event.preventDefault();
    var touches = event.changedTouches;

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

//Chooses a finger
function handleChoose() {
    var theChosenFinger = Math.floor(Math.random() * ongoingTouches.length);

    for (var i = 0; i < ongoingTouches.length; i++) {
        if (i != theChosenFinger) {
            var elem = document.getElementById('touch' + ongoingTouches[i].identifier);
            elem.classList.add('not-chosen');
        }
    }

    document.body.classList.remove('timer-running');
}


//Updates the timer when the number of fingers changes
function updateTimer() {
    if (ongoingTouches.length > 1) {
        window.clearTimeout(timer);
        timer = window.setTimeout(handleChoose, DEFAULT_TIMEOUT);
        
        document.body.classList.add('timer-reset');
        document.body.offsetWidth; //force redraw
        document.body.classList.remove('timer-reset');
        document.body.classList.add('timer-running');
    } else {
        window.clearTimeout(timer);
        document.body.classList.remove('timer-running');
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
    elem.style.left = (xPosition - halfSize) + "px";
    elem.style.top = (yPosition - halfSize) + "px";
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