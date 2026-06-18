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
            showInputError("Host name doesn't exist")
            loaderContainer.style.display = "none"
        });
    }
    sendData(data){
        if (this.conn && this.conn.open) {
            this.conn.send(data)
        }
    }

    pressControllerButton(buttonId, element) {
        if (buttonId === "mode") {
            toggleScreenOrientation();
            return;
        }

        if (!buttonMap[buttonId] || this.pressedButtons.includes(buttonId)) {
            return;
        }

        this.pressedButtons.push(buttonId)
        this.sendData({action: buttonId, attr: 1})
        element.classList.add("pressed")

        if (navigator.vibrate) {
            navigator.vibrate(12);
        }
    }

    releaseControllerButton(buttonId) {
        if (!buttonMap[buttonId]) {
            return;
        }

        this.sendData({action: buttonId, attr: 0})
        this.pressedButtons = this.pressedButtons.filter((pressedButton) => pressedButton !== buttonId)

        const element = document.getElementById(buttonId);
        if (element) {
            element.classList.remove("pressed")
        }
    }

    createController() {
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i]
                const element = getControllerButtonElementAt(touch.clientX, touch.clientY);

                if (element) {
                    const buttonId = element.id;
                    this.pressControllerButton(buttonId, element)
                    this.touchMap.set(touch.identifier, buttonId)
                }
            }
        }, {passive: false});

        const releaseTouches = (touches) => {
            for (let i = 0; i < touches.length; i++) {
                const touch = touches[i]
                if (this.touchMap.has(touch.identifier)) {
                    const buttonId = this.touchMap.get(touch.identifier)
                    this.releaseControllerButton(buttonId)
                    this.touchMap.delete(touch.identifier)
                }
            }
        };

        document.addEventListener('touchend', (e) => releaseTouches(e.changedTouches));
        document.addEventListener('touchcancel', (e) => releaseTouches(e.changedTouches));
    
    
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i]
                const element = getControllerButtonElementAt(touch.clientX, touch.clientY);
                const nextButtonId = element ? element.id : null;
                const previousButtonId = this.touchMap.get(touch.identifier);

                if (previousButtonId && previousButtonId !== nextButtonId) {
                    this.releaseControllerButton(previousButtonId)
                    this.touchMap.delete(touch.identifier)
                }

                if (!nextButtonId || previousButtonId === nextButtonId) {
                    continue;
                }

                this.pressControllerButton(nextButtonId, element)
                this.touchMap.set(touch.identifier, nextButtonId)
            }
        }, {passive: false});
    
        loaderContainer.style.display = "none"
    }
}

function enterAsPlayer(){
    let player = new Player()
    let hostName = getHostInputValue()
    if(hostName==""){
        showInputError("Insert a host name")
        return
    }
    loaderContainer.style.display = "flex"
    device_mode = "player"
    enableWakeLock()
    player.myself = new Peer();
    player.myself.on('open', function(id) {
        console.log('Connected. My peer ID is: ' + id);
        player.connectToHost(hostName)
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
            showInputError("Host name doesn't exist")
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
        loaderContainer.style.display = "none"
    });
}


let screenOrientation = "portrait"

async function toggleScreenOrientation() {
    if (screenOrientation == "portrait") {
        screenOrientation = "landscape"
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.log('Error entering fullscreen: ', error);
        }

        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape')
                .catch((error) => console.log('Error locking orientation: ', error));
        }
    } else {
        screenOrientation = "portrait"
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.log('Error exiting fullscreen: ', error);
        }

        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
}
