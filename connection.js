let type

let joinButton = document.getElementById("start-btn")

let mainMenu = document.getElementById("mainMenu")
let introMenu = document.getElementById("introMenu")

let loaderContainer = document.getElementById("loader-container")

let forceFullscreen = false

let idInput = document.getElementById('id-input')

let uploadRom = document.getElementById('upload-rom')
let romInput = document.getElementById('rom-input')
let startButton = document.getElementById('start-button')

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('uppercaseInput');

    idInput.addEventListener('input', () => {
        idInput.value = idInput.value.toUpperCase();
    });
    idInput.addEventListener('keypress', (event) => {
        if(event.key === "Enter"){
            document.getElementById("as-host-btn").click()
        }
    })
});

romInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const romData = reader.result;
        loadROM(romData);
        //addRomToList(file.name, romData)
        console.log("Loaded "+file.name)
        startButton.style.display = "flex"
        uploadRom.style.display = "none"
    };

    reader.readAsBinaryString(file);
});


let players = []

var myself = null

var conn = null


function enterAsHost(){
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    loaderContainer.style.display = "flex"
    myself = new Peer(idInput);
    myself.on('open', function(id) {
        console.log('Connected as host. My peer ID is: ' + id);
        type = "host"
        mainMenu.remove()
        document.getElementById('hostMain').style.display = "flex"
        if (!isMobile()) {
            document.getElementById('joystickContainer').style.display = "none"
        }
        loaderContainer.style.display = "none"
        initializeEmulator()
        document.getElementById('my_id').innerText = myself.id
      });
    
    myself.on('connection', function(recievingConn) {
        console.log("New peer connected: "+recievingConn.peer)
        let player = recievingConn
        players.push(player)
        setupController(player, players.length)
    });

    myself.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            console.log('The host name is already in use. Choose another one');
            inputErrorMessage.innerText = "Host name already in use"
        }
        else if (err.type === 'peer-unavailable') {
            console.log('The peer you\'re trying to connect to doesn\'t exist');
            inputErrorMessage.innerText = "Peer doesn't exist"
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
        loaderContainer.style.display = "none"
    });
}

function enterAsPlayer(){
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    loaderContainer.style.display = "flex"
    type = "player"
    myself = new Peer();
    myself.on('open', function(id) {
        console.log('Connected. My peer ID is: ' + id);
        connectToHost(idInput)
      });
    
    myself.on('connection', function(recievingConn) {
        console.log("New peer connected: "+recievingConn.peer)
        conn = recievingConn
        players.push(conn)
    });

    myself.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            console.log('The peer ID is already in use. Generating new');
            enterAsPlayer()
        }
        else if (err.type === 'peer-unavailable') {
            console.log('The peer you\'re trying to connect to doesn\'t exist');
            inputErrorMessage.innerText = "Host name doesn't exist"
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
        loaderContainer.style.display = "none"
    });
}


function connectToHost(hostName){
    conn = myself.connect(hostName);

    conn.on('open', function() {
        console.log("You connected to "+conn.peer)
        document.getElementById('joystickContainer').style.display = "grid"
        createController()
        mainMenu.remove()
      });

      conn.on('error', (err) => {
       console.log(err.type)
    });
}
function activateCounter(button) {
    button.time = 0;

    const intervalId = setInterval(() => {
        button.time += 1;

        if (!button.pressed || button.time > 5) {
            clearInterval(intervalId);
        }
    }, 1);
}

function setupController(player, i){
    player.on('data', function(data){
        //let playerKeyPress = document.getElementById("player"+i+"KeyPress")
        if (data.attr == 1) {
            pressButton(data.action, i)
        } else {
            releaseButton(data.action, i)
        }
    });
    function pressButton(buttonId, i){
        let button = buttonMap[buttonId]
        if (button !== undefined) {
            nes.buttonDown(i, button.controller);
            button.pressed = true
            activateCounter(button)
        }
    }
    function releaseButton(buttonId, i) {
        let button = buttonMap[buttonId];
    
        if (!button) {
            return;
        }
    
        const intervalCheck = setInterval(() => {
            if (button.time > 5) {
                nes.buttonUp(i, button.controller);
                button.pressed = false;
                clearInterval(intervalCheck);
            }
        }, 1);
    }
    let playerIndicator = document.getElementById("player"+i+"Indicator")
    playerIndicator.classList.remove("not-connected")
    playerIndicator.classList.add("connected")
    playerIndicator.getElementsByTagName("p")[0].innerText = "Player "+i+" connected"
}

let pressedButtons = []
let touchMap = new Map()

function createController() {
    document.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            let touch = e.touches[i]
            const touchX = touch.clientX;
            const touchY = touch.clientY;

        const element = document.elementFromPoint(touchX, touchY);

            if (element.classList.contains("controller-button")) {
                const buttonId = element.id;

                if (!pressedButtons.includes(buttonId)) {
                    pressedButtons.push(buttonId)

                    conn.send({action: buttonId, attr: 1})
                    element.classList.add("pressed")
                    touchMap.set(touch.identifier, buttonId)
                }
            }
        }
    }, {passive: false});

    document.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i]
            if (touchMap.has(touch.identifier)) {
                const buttonId = touchMap.get(touch.identifier)
                conn.send({action: buttonId, attr: 0})
                pressedButtons.splice(pressedButtons.indexOf(buttonId), 1)
                document.getElementById(buttonId).classList.remove("pressed")
                touchMap.delete(touch.identifier)
            }
        }
    });


    document.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            let touch = e.touches[i]
            const touchX = touch.clientX;
            const touchY = touch.clientY;

            const element = document.elementFromPoint(touchX, touchY);

            if (element.classList.contains("controller-button")) {
                const buttonId = element.id;

                if (touchMap.has(touch.identifier)) {
                    if (buttonId !== touchMap.get(touch.identifier)) {
                        conn.send({action: touchMap.get(touch.identifier), attr: 0})
                        pressedButtons.splice(pressedButtons.indexOf(touchMap.get(touch.identifier)), 1)
                        document.getElementById(touchMap.get(touch.identifier)).classList.remove("pressed")
                        touchMap.delete(touch.identifier)
                    }
                }
                if (!pressedButtons.includes(buttonId)) {
                    pressedButtons.push(buttonId)
                    conn.send({action: buttonId, attr: 1})
                    element.classList.add("pressed")
                    touchMap.set(touch.identifier, buttonId)
                }
            }
            else {
                if (touchMap.has(touch.identifier)) {
                    const buttonId = touchMap.get(touch.identifier)
                    conn.send({action: buttonId, attr: 0})
                    pressedButtons.splice(pressedButtons.indexOf(buttonId), 1)
                    document.getElementById(buttonId).classList.remove("pressed")
                    touchMap.delete(touch.identifier)
                }
            }
        }
    });

    toggleScreenOrientation()

    loaderContainer.style.display = "none"
}

function joinFromHost(){
    let player = null
    players.push(player)
    let i = players.length
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") nes.buttonDown(i, jsnes.Controller.BUTTON_UP);
        if (event.key === "ArrowDown") nes.buttonDown(i, jsnes.Controller.BUTTON_DOWN);
        if (event.key === "ArrowLeft") nes.buttonDown(i, jsnes.Controller.BUTTON_LEFT);
        if (event.key === "ArrowRight") nes.buttonDown(i, jsnes.Controller.BUTTON_RIGHT);
        if (event.key === "a") nes.buttonDown(i, jsnes.Controller.BUTTON_A);
        if (event.key === "s") nes.buttonDown(i, jsnes.Controller.BUTTON_B);
        if (event.key === "Enter") nes.buttonDown(i, jsnes.Controller.BUTTON_START);
        if (event.key === " ") nes.buttonDown(i, jsnes.Controller.BUTTON_SELECT);
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "ArrowUp") nes.buttonUp(i, jsnes.Controller.BUTTON_UP);
        if (event.key === "ArrowDown") nes.buttonUp(i, jsnes.Controller.BUTTON_DOWN);
        if (event.key === "ArrowLeft") nes.buttonUp(i, jsnes.Controller.BUTTON_LEFT);
        if (event.key === "ArrowRight") nes.buttonUp(i, jsnes.Controller.BUTTON_RIGHT);
        if (event.key === "a") nes.buttonUp(i, jsnes.Controller.BUTTON_A);
        if (event.key === "s") nes.buttonUp(i, jsnes.Controller.BUTTON_B);
        if (event.key === "Enter") nes.buttonUp(i, jsnes.Controller.BUTTON_START);
        if (event.key === " ") nes.buttonUp(i, jsnes.Controller.BUTTON_SELECT);
    });
    let playerIndicator = document.getElementById("player"+i+"Indicator")
    playerIndicator.classList.remove("not-connected")
    playerIndicator.classList.add("connected")
    playerIndicator.getElementsByTagName("p")[0].innerText = "Player "+i+" connected (host)"

    joinFromHostBtn.setAttribute("disabled", true)
}

function addRomToList(name, romData) {
    let gamesList = document.getElementById("gamesList")
    let newGame = document.createElement("div")
    newGame.classList.add("game")
    newGame.innerHTML = `<h3>${name}</h3>`
    gamesList.appendChild(newGame)
    newGame.getElementsByClassName("delete-game")[0].addEventListener("click", () => {
        gamesList.removeChild(newGame)
    })
}

let screenOrientation = "portrait"

function toggleScreenOrientation() {
    if (screenOrientation == "portrait") {
        screenOrientation = "landscape"
        document.documentElement.requestFullscreen();
        if (screen.orientation) {
            screen.orientation.lock('landscape')
              .catch((error) => console.log('Error locking orientation: ', error));
        }
    } else {
        screenOrientation = "portrait"
        document.exitFullscreen();
        if (screen.orientation) {
            screen.orientation.unlock()
              .catch((error) => console.log('Error unlocking orientation: ', error));
        }
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock was released');
    });
    console.log('Wake lock acquired');
  } catch (err) {
    console.error(`Wake lock request failed: ${err}`);
  }
}

requestWakeLock();