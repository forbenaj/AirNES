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