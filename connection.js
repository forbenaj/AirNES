let type

let joinButton = document.getElementById("start-btn")

let mainMenu = document.getElementById("mainMenu")
let introMenu = document.getElementById("introMenu")

let loaderContainer = document.getElementById("loader-container")

let forceFullscreen = false

let idInput = document.getElementById('id-input')

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

let players = []

var myself = null

var conn = null


function enterAsHost(){
    loaderContainer.style.display = "flex"
    type = "host"
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    myself = new Peer(idInput);
    myself.on('open', function(id) {
        console.log('Connected. My peer ID is: ' + id);
        mainMenu.remove()
        document.getElementById('hostMain').style.display = "flex"
        document.getElementById('joystickContainer').style.display = "none"
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
            console.log('The peer ID is already in use. Generating new');
            enterAsHost()
        }
        else if (err.type === 'peer-unavailable') {
            console.log('The peer you\'re trying to connect to doesn\'t exist');
            inputErrorMessage.innerText = "Peer doesn't exist"
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
    });
}

function enterAsPlayer(){
    loaderContainer.style.display = "flex"
    type = "player"
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
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
            enterAsHost()
        }
        else if (err.type === 'peer-unavailable') {
            console.log('The peer you\'re trying to connect to doesn\'t exist');
            inputErrorMessage.innerText = "Peer doesn't exist"
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
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
        console.log(button)
        if (button !== undefined) {
            if (data.attr == 1) {
                console.log("Pressed "+button)
                nes.buttonDown(i, button);
            } else {
                console.log("Released "+button)
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


function createController() {
    const controllerButtons = document.getElementsByClassName("controller-button")
    for (let i = 0; i < controllerButtons.length; i++) {
        controllerButtons[i].addEventListener("touchstart",(e)=>{
            let id = e.target.id
            console.log(id)
            console.log("Pressed "+id)
            e.preventDefault()
            conn.send({action: id, attr: 1})
        })
        controllerButtons[i].addEventListener("touchend",(e)=>{
            let id = e.target.id
            console.log("Released "+id)
            e.preventDefault()
            conn.send({action: id, attr: 0})
        })
    }

    document.documentElement.requestFullscreen();
    if (screen.orientation) {
        screen.orientation.lock('landscape')
          .catch((error) => console.log('Error locking orientation: ', error));
    }
    loaderContainer.style.display = "none"
}