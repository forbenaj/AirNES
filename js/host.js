const ROM_DB_NAME = "AirNES";
const ROM_DB_VERSION = 1;
const ROM_STORE_NAME = "roms";
const MIN_BUTTON_PRESS_MS = 35;

function openRomDatabase() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            resolve(null);
            return;
        }

        const request = indexedDB.open(ROM_DB_NAME, ROM_DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(ROM_STORE_NAME)) {
                db.createObjectStore(ROM_STORE_NAME, {keyPath: "name"});
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withRomStore(mode, operation) {
    const db = await openRomDatabase();
    if (!db) {
        return null;
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(ROM_STORE_NAME, mode);
        const store = transaction.objectStore(ROM_STORE_NAME);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function readStoredRoms() {
    try {
        return await withRomStore("readonly", (store) => store.getAll()) || [];
    } catch (err) {
        console.warn("Could not read saved games", err);
        return [];
    }
}

async function saveStoredRom(game) {
    try {
        await withRomStore("readwrite", (store) => store.put(game));
    } catch (err) {
        console.warn("Could not save game locally", err);
    }
}

async function deleteStoredRom(name) {
    try {
        await withRomStore("readwrite", (store) => store.delete(name));
    } catch (err) {
        console.warn("Could not delete saved game", err);
    }
}

class Host{
    constructor(){
        this.players = []
        this.myself = null
        this.pressedButtons = []
        this.touchMap = new Map()
        this.inputStates = new Map()
        this.romLibrary = []
        this.selectedRomName = null
    }

    setupController(player, i){
        player.on('data', (data) => {
            if (!data || !data.action) {
                return;
            }

            if (data.attr == 1) {
                this.pressNesButton(i, data.action)
            } else {
                this.releaseNesButton(i, data.action)
            }
        });

        this.setPlayerAsConnected(i)
    }

    getInputState(playerNum, buttonId) {
        const stateKey = `${playerNum}:${buttonId}`;
        if (!this.inputStates.has(stateKey)) {
            this.inputStates.set(stateKey, {
                pressed: false,
                pressedAt: 0,
                releaseTimer: null
            });
        }

        return this.inputStates.get(stateKey);
    }

    pressNesButton(playerNum, buttonId) {
        const button = buttonMap[buttonId];
        if (!button || !emulator || !emulator.nes) {
            return;
        }

        const state = this.getInputState(playerNum, buttonId);
        if (state.releaseTimer) {
            clearTimeout(state.releaseTimer);
            state.releaseTimer = null;
        }

        if (state.pressed) {
            return;
        }

        emulator.nes.buttonDown(playerNum, button.controller);
        state.pressed = true;
        state.pressedAt = performance.now();
    }

    releaseNesButton(playerNum, buttonId) {
        const button = buttonMap[buttonId];
        if (!button || !emulator || !emulator.nes) {
            return;
        }

        const state = this.getInputState(playerNum, buttonId);
        if (!state.pressed) {
            return;
        }

        const elapsed = performance.now() - state.pressedAt;
        const releaseDelay = Math.max(0, MIN_BUTTON_PRESS_MS - elapsed);

        if (state.releaseTimer) {
            clearTimeout(state.releaseTimer);
        }

        state.releaseTimer = setTimeout(() => {
            emulator.nes.buttonUp(playerNum, button.controller);
            state.pressed = false;
            state.releaseTimer = null;
        }, releaseDelay);
    }

    pressControllerButton(playerNum, buttonId, element) {
        if (buttonId === "mode") {
            toggleScreenOrientation();
            return;
        }

        if (!buttonMap[buttonId] || this.pressedButtons.includes(buttonId)) {
            return;
        }

        this.pressedButtons.push(buttonId);
        this.pressNesButton(playerNum, buttonId);
        element.classList.add("pressed");
    }

    releaseControllerButton(playerNum, buttonId) {
        if (!buttonMap[buttonId]) {
            return;
        }

        this.releaseNesButton(playerNum, buttonId);
        this.pressedButtons = this.pressedButtons.filter((pressedButton) => pressedButton !== buttonId);

        const element = document.getElementById(buttonId);
        if (element) {
            element.classList.remove("pressed");
        }
    }

    bindTouchController(playerNum) {
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const element = getControllerButtonElementAt(touch.clientX, touch.clientY);

                if (!element) {
                    continue;
                }

                const buttonId = element.id;
                this.pressControllerButton(playerNum, buttonId, element);
                this.touchMap.set(touch.identifier, buttonId);

                if (navigator.vibrate && buttonMap[buttonId]) {
                    navigator.vibrate(12);
                }
            }
        }, {passive: false});

        const releaseTouches = (touches) => {
            for (let i = 0; i < touches.length; i++) {
                const touch = touches[i];
                if (!this.touchMap.has(touch.identifier)) {
                    continue;
                }

                const buttonId = this.touchMap.get(touch.identifier);
                this.releaseControllerButton(playerNum, buttonId);
                this.touchMap.delete(touch.identifier);
            }
        };

        document.addEventListener('touchend', (e) => releaseTouches(e.changedTouches));
        document.addEventListener('touchcancel', (e) => releaseTouches(e.changedTouches));

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const element = getControllerButtonElementAt(touch.clientX, touch.clientY);
                const nextButtonId = element ? element.id : null;
                const previousButtonId = this.touchMap.get(touch.identifier);

                if (previousButtonId && previousButtonId !== nextButtonId) {
                    this.releaseControllerButton(playerNum, previousButtonId);
                    this.touchMap.delete(touch.identifier);
                }

                if (!nextButtonId || previousButtonId === nextButtonId) {
                    continue;
                }

                this.pressControllerButton(playerNum, nextButtonId, element);
                this.touchMap.set(touch.identifier, nextButtonId);
            }
        }, {passive: false});
    }

    joinFromHost(type){
        let player = null
        players.push(player)
        let playerNum = players.length
        if (type == "desktop") {
            const keyMap = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
                a: "a",
                A: "a",
                s: "b",
                S: "b",
                Enter: "start",
                " ": "select"
            };

            document.addEventListener("keydown", (event) => {
                const buttonId = keyMap[event.key];
                if (!buttonId || event.repeat) {
                    return;
                }

                event.preventDefault();
                this.pressNesButton(playerNum, buttonId);
            });

            document.addEventListener("keyup", (event) => {
                const buttonId = keyMap[event.key];
                if (!buttonId) {
                    return;
                }

                event.preventDefault();
                this.releaseNesButton(playerNum, buttonId);
            });
            this.setPlayerAsConnected(playerNum)

            let joinFromHostDesktopBtn = document.getElementById('joinFromHostDesktopBtn')
            joinFromHostDesktopBtn.setAttribute("disabled", true)
        }
        else if (type == "mobile") {
            console.log("Mobile")
            document.getElementById("joystickContainer").style.display = "grid"
            this.bindTouchController(playerNum)

            let joinFromHostMobileBtn = document.getElementById('joinFromHostMobileBtn')
            joinFromHostMobileBtn.setAttribute("disabled", true)
        }

    }

    async initializeGameLibrary() {
        this.romLibrary = await readStoredRoms();
        this.romLibrary.sort((a, b) => a.name.localeCompare(b.name));
        this.renderGameList();
    }

    async addRomToList(name, romData) {
        const game = {
            name,
            romData,
            addedAt: Date.now()
        };

        const existingIndex = this.romLibrary.findIndex((storedGame) => storedGame.name === name);
        if (existingIndex >= 0) {
            this.romLibrary[existingIndex] = game;
        } else {
            this.romLibrary.push(game);
        }

        this.romLibrary.sort((a, b) => a.name.localeCompare(b.name));
        this.loadGame(game);
        this.renderGameList();
        await saveStoredRom(game);
    }

    loadGame(game) {
        emulator.loadROM(game.romData);
        this.selectedRomName = game.name;
        startButton.style.display = "flex";
        uploadRom.style.display = "none";
        console.log("Loaded "+game.name);
    }

    selectRom(name) {
        const game = this.romLibrary.find((storedGame) => storedGame.name === name);
        if (!game) {
            return;
        }

        this.loadGame(game);
        this.renderGameList();
    }

    async deleteRom(name) {
        this.romLibrary = this.romLibrary.filter((storedGame) => storedGame.name !== name);
        await deleteStoredRom(name);

        if (this.selectedRomName === name) {
            this.selectedRomName = null;
            if (!emulator.isRunning) {
                startButton.style.display = "none";
                uploadRom.style.display = "inline-block";
            }
        }

        this.renderGameList();
    }

    renderGameList() {
        let gamesList = document.getElementById("gamesList")
        gamesList.textContent = "";

        if (this.romLibrary.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.classList.add("empty-game-list");
            emptyMessage.innerText = "No games uploaded yet";
            gamesList.appendChild(emptyMessage);
            return;
        }

        this.romLibrary.forEach((game) => {
            const gameElement = document.createElement("div");
            gameElement.classList.add("game");

            if (game.name === this.selectedRomName) {
                gameElement.classList.add("selected");
            }

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.classList.add("game-select");
            selectButton.innerText = game.name;
            selectButton.title = game.name;
            selectButton.addEventListener("click", () => this.selectRom(game.name));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.classList.add("delete-game");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation();
                this.deleteRom(game.name);
            });

            gameElement.append(selectButton, deleteButton);
            gamesList.appendChild(gameElement);
        });
    }

    setPlayerAsConnected(playerNum){
        let playerIndicatorDesktop = document.getElementById("player"+playerNum+"IndicatorDesktop")
        if (playerIndicatorDesktop) {
            playerIndicatorDesktop.classList.remove("not-connected")
            playerIndicatorDesktop.classList.add("connected")
            playerIndicatorDesktop.getElementsByTagName("p")[0].innerText = "Player "+playerNum+" connected"
        }

        let playerIndicatorMobile = document.getElementById("player"+playerNum+"IndicatorMobile")
        if (playerIndicatorMobile) {
            playerIndicatorMobile.classList.remove("not-connected")
            playerIndicatorMobile.classList.add("connected")
            //playerIndicatorMobile.getElementsByTagName("p")[0].innerText = "Player "+playerNum+" connected"
        }
    }
    
}

var host = null
let addGameButton = document.getElementById('add-game-btn')

addGameButton.addEventListener("click", () => {
    romInput.click();
});

romInput.addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = async function() {
        const romData = reader.result;
        await host.addRomToList(file.name, romData);
        romInput.value = "";
    };

    reader.readAsBinaryString(file);
});


function enterAsHost(){
    let hostName = getHostInputValue()
    if(hostName==""){
        showInputError("Insert a host name")
        return
    }

    host = new Host()
    emulator = new Emulator()
    enableWakeLock()
    loaderContainer.style.display = "flex"
    host.myself = new Peer(hostName);
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
        document.querySelectorAll('.host-id').forEach((hostIdElement) => {
            hostIdElement.innerText = host.myself.id
        });
        host.initializeGameLibrary()
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
            showInputError("Host name already in use")
        }
        else if (err.type === 'peer-unavailable') {
            console.log('The peer you\'re trying to connect to doesn\'t exist');
            showInputError("Peer doesn't exist")
        } else {
            console.error('An unexpected error occurred:', err);
        }
        console.log(err.type)
        loaderContainer.style.display = "none"
    });
}





