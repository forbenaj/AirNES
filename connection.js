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
        addRomToList(file.name, romData)
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


function setupController(player, i){
    player.on('data', function(data){
        let playerKeyPress = document.getElementById("player"+i+"KeyPress")
        let button = buttonMap[data.action]
        if (button !== undefined) {
            if (data.attr == 1) {
                console.log("Pressed "+data.action)
                nes.buttonDown(i, button);
            } else {
                console.log("Released "+data.action)
                nes.buttonUp(i, button);
                playerKeyPress.innerText = ""
            }
        }
    });
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