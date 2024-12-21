class Host{
    constructor(){
        this.players = []
        this.myself = null
        this.emulator = new Emulator()
    }

    setupController(player, i){
        player.on('data', function(data){
            //let playerKeyPress = document.getElementById("player"+i+"KeyPress")
            if (data.attr == 1) {
                pressButton(data.action, i)
            } else {
                releaseButton(data.action, i)
            }
        });
        let pressButton = (buttonId, i) => {
            let button = buttonMap[buttonId]
            if (button !== undefined) {
                emulator.nes.buttonDown(i, button.controller);
                button.pressed = true
                activateCounter(button)
            }
        }
        let releaseButton = (buttonId, i) => {
            let button = buttonMap[buttonId];
        
            if (!button) {
                return;
            }
        
            const intervalCheck = setInterval(() => {
                if (button.time > 5) {
                    emulator.nes.buttonUp(i, button.controller);
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


    joinFromHost(){
        let player = null
        players.push(player)
        let i = players.length
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowUp") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_UP);
            if (event.key === "ArrowDown") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_DOWN);
            if (event.key === "ArrowLeft") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_LEFT);
            if (event.key === "ArrowRight") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_RIGHT);
            if (event.key === "a") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_A);
            if (event.key === "s") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_B);
            if (event.key === "Enter") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_START);
            if (event.key === " ") emulator.nes.buttonDown(i, jsnes.Controller.BUTTON_SELECT);
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "ArrowUp") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_UP);
            if (event.key === "ArrowDown") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_DOWN);
            if (event.key === "ArrowLeft") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_LEFT);
            if (event.key === "ArrowRight") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_RIGHT);
            if (event.key === "a") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_A);
            if (event.key === "s") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_B);
            if (event.key === "Enter") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_START);
            if (event.key === " ") emulator.nes.buttonUp(i, jsnes.Controller.BUTTON_SELECT);
        });
        let playerIndicator = document.getElementById("player"+i+"Indicator")
        playerIndicator.classList.remove("not-connected")
        playerIndicator.classList.add("connected")
        playerIndicator.getElementsByTagName("p")[0].innerText = "Player "+i+" connected (host)"

        joinFromHostBtn.setAttribute("disabled", true)
    }

    addRomToList(name, romData) {
        let gamesList = document.getElementById("gamesList")
        let newGame = document.createElement("div")
        newGame.classList.add("game")
        newGame.innerHTML = `<h3>${name}</h3>`
        gamesList.appendChild(newGame)
        newGame.getElementsByClassName("delete-game")[0].addEventListener("click", () => {
            gamesList.removeChild(newGame)
        })
    }
    
}

var host = null

romInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const romData = reader.result;
        emulator.loadROM(romData);
        //addRomToList(file.name, romData)
        console.log("Loaded "+file.name)
        startButton.style.display = "flex"
        uploadRom.style.display = "none"
    };

    reader.readAsBinaryString(file);
});


function enterAsHost(){
    host = new Host()
    emulator = new Emulator()
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    loaderContainer.style.display = "flex"
    host.myself = new Peer(idInput);
    host.myself.on('open', function(id) {
        console.log('Connected as host. My peer ID is: ' + id);
        device_mode = "host"
        mainMenu.remove()
        document.getElementById('hostMain').style.display = "flex"
        if (!isMobile()) {
            document.getElementById('joystickContainer').style.display = "none"
        }
        loaderContainer.style.display = "none"
        emulator.initializeEmulator()
        document.getElementById('my_id').innerText = host.myself.id
      });
    
    host.myself.on('connection', function(recievingConn) {
        console.log("New peer connected: "+recievingConn.peer)
        let player = recievingConn
        players.push(player)
        host.setupController(player, players.length)
    });

    host.myself.on('error', (err) => {
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





