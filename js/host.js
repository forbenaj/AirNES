class Host{
    constructor(){
        this.players = []
        this.myself = null
        this.pressedButtons = []
        this.touchMap = new Map()
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
        this.setPlayerAsConnected(i)
    }


    joinFromHost(type){
        let player = null
        players.push(player)
        let playerNum = players.length
        if (type == "desktop") {
            document.addEventListener("keydown", (event) => {
                if (event.key === "ArrowUp") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_UP);
                if (event.key === "ArrowDown") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_DOWN);
                if (event.key === "ArrowLeft") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_LEFT);
                if (event.key === "ArrowRight") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_RIGHT);
                if (event.key === "a") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_A);
                if (event.key === "s") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_B);
                if (event.key === "Enter") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_START);
                if (event.key === " ") emulator.nes.buttonDown(playerNum, jsnes.Controller.BUTTON_SELECT);
            });

            document.addEventListener("keyup", (event) => {
                if (event.key === "ArrowUp") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_UP);
                if (event.key === "ArrowDown") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_DOWN);
                if (event.key === "ArrowLeft") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_LEFT);
                if (event.key === "ArrowRight") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_RIGHT);
                if (event.key === "a") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_A);
                if (event.key === "s") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_B);
                if (event.key === "Enter") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_START);
                if (event.key === " ") emulator.nes.buttonUp(playerNum, jsnes.Controller.BUTTON_SELECT);
            });
            this.setPlayerAsConnected(playerNum)

            let joinFromHostDesktopBtn = document.getElementById('joinFromHostDesktopBtn')
            joinFromHostDesktopBtn.setAttribute("disabled", true)
        }
        else if (type == "mobile") {
            console.log("Mobile")
            document.getElementById("joystickContainer").style.display = "grid"
            document.addEventListener('touchstart', (e) => {
                for (let i = 0; i < e.touches.length; i++) {
                    let touch = e.touches[i]
                    const touchX = touch.clientX;
                    const touchY = touch.clientY;
        
                const element = document.elementFromPoint(touchX, touchY);
        
                    if (element.classList.contains("controller-button")) {
                        const buttonId = element.id;
        
                        if (!this.pressedButtons.includes(buttonId)) {
                            this.pressedButtons.push(buttonId)
                            emulator.nes.buttonDown(playerNum, buttonMap[buttonId].controller);
                            console.log("Pressed "+buttonId)
                            element.classList.add("pressed")
                            this.touchMap.set(touch.identifier, buttonId)
                        }
                    }
                }
            }, {passive: false});
        
            document.addEventListener('touchend', (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    let touch = e.changedTouches[i]
                    if (this.touchMap.has(touch.identifier)) {
                        const buttonId = this.touchMap.get(touch.identifier)
                        emulator.nes.buttonUp(playerNum, buttonMap[buttonId].controller);
                        this.pressedButtons.splice(this.pressedButtons.indexOf(buttonId), 1)
                        document.getElementById(buttonId).classList.remove("pressed")
                        this.touchMap.delete(touch.identifier)
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
        
                        if (this.touchMap.has(touch.identifier)) {
                            if (buttonId !== this.touchMap.get(touch.identifier)) {
                                emulator.nes.buttonUp(playerNum, buttonMap[this.touchMap.get(touch.identifier)].controller);
                                this.pressedButtons.splice(this.pressedButtons.indexOf(this.touchMap.get(touch.identifier)), 1)
                                document.getElementById(this.touchMap.get(touch.identifier)).classList.remove("pressed")
                                this.touchMap.delete(touch.identifier)
                            }
                        }
                        if (!this.pressedButtons.includes(buttonId)) {
                            this.pressedButtons.push(buttonId)
                            emulator.nes.buttonDown(playerNum, buttonMap[buttonId].controller);
                            element.classList.add("pressed")
                            this.touchMap.set(touch.identifier, buttonId)
                        }
                    }
                    else {
                        if (this.touchMap.has(touch.identifier)) {
                            const buttonId = this.touchMap.get(touch.identifier)
                            emulator.nes.buttonUp(playerNum, buttonMap[buttonId].controller);
                            this.pressedButtons.splice(this.pressedButtons.indexOf(buttonId), 1)
                            document.getElementById(buttonId).classList.remove("pressed")
                            this.touchMap.delete(touch.identifier)
                        }
                    }
                }
            });
        }

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

    setPlayerAsConnected(playerNum){
        let playerIndicatorDesktop = document.getElementById("player"+playerNum+"IndicatorDesktop")
        playerIndicatorDesktop.classList.remove("not-connected")
        playerIndicatorDesktop.classList.add("connected")
        playerIndicatorDesktop.getElementsByTagName("p")[0].innerText = "Player "+playerNum+" connected"

        let playerIndicatorMobile = document.getElementById("player"+playerNum+"IndicatorMobile")
        playerIndicatorMobile.classList.remove("not-connected")
        playerIndicatorMobile.classList.add("connected")
        //playerIndicatorMobile.getElementsByTagName("p")[0].innerText = "Player "+playerNum+" connected"
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





