function enterAsPlayer(){
    let idInput = document.getElementById("id-input").value
    if(idInput==""){
        inputErrorMessage.innerText = "Insert a host name"
        return
    }
    loaderContainer.style.display = "flex"
    device_mode = "player"
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