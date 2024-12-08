class Player{
    constructor(){
        this.conn = null
        this.pressedButtons = []
        this.touchMap = new Map()
        this.myself = null
    }
    connectToHost(hostName){
        this.conn = this.myself.connect(hostName);
    
        this.conn.on('open', () => {
            console.log("You connected to "+this.conn.peer)
            document.getElementById('joystickContainer').style.display = "grid"
            this.createController()
            mainMenu.remove()
          });
    
          this.conn.on('error', (err) => {
           console.log(err.type)
        });
    }
    sendData(data){
        this.conn.send(data)
    }
    createController() {
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
    
                        this.conn.send({action: buttonId, attr: 1})
                        element.classList.add("pressed")
                        this.touchMap.set(touch.identifier, buttonId)
                    }
                }
            }
        }, {passive: false});
    
        document.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                let touch = e.changedTouches[i]
                if (touchMap.has(touch.identifier)) {
                    const buttonId = this.touchMap.get(touch.identifier)
                    this.conn.send({action: buttonId, attr: 0})
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
    
                    if (touchMap.has(touch.identifier)) {
                        if (buttonId !== this.touchMap.get(touch.identifier)) {
                            this.conn.send({action: this.touchMap.get(touch.identifier), attr: 0})
                            this.pressedButtons.splice(pressedButtons.indexOf(this.touchMap.get(touch.identifier)), 1)
                            document.getElementById(this.touchMap.get(touch.identifier)).classList.remove("pressed")
                            this.touchMap.delete(touch.identifier)
                        }
                    }
                    if (!this.pressedButtons.includes(buttonId)) {
                        this.pressedButtons.push(buttonId)
                        this.conn.send({action: buttonId, attr: 1})
                        element.classList.add("pressed")
                        this.touchMap.set(touch.identifier, buttonId)
                    }
                }
                else {
                    if (this.touchMap.has(touch.identifier)) {
                        const buttonId = this.touchMap.get(touch.identifier)
                        this.conn.send({action: buttonId, attr: 0})
                        this.pressedButtons.splice(this.pressedButtons.indexOf(buttonId), 1)
                        document.getElementById(buttonId).classList.remove("pressed")
                        this.touchMap.delete(touch.identifier)
                    }
                }
            }
        });
    
        toggleScreenOrientation()
    
        loaderContainer.style.display = "none"
    }
}

function enterAsPlayer(){
    let player = new Player()
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    loaderContainer.style.display = "flex"
    device_mode = "player"
    player.myself = new Peer();
    player.myself.on('open', function(id) {
        console.log('Connected. My peer ID is: ' + id);
        player.connectToHost(idInput)
      });
    
      player.myself.on('connection', function(recievingConn) {
        console.log("New peer connected: "+recievingConn.peer)
        player.conn = recievingConn
        players.push(player.conn)
    });

    player.myself.on('error', (err) => {
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


function activateCounter(button) {
    button.time = 0;

    const intervalId = setInterval(() => {
        button.time += 1;

        if (!button.pressed || button.time > 5) {
            clearInterval(intervalId);
        }
    }, 1);
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