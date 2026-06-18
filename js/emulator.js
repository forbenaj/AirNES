class Emulator{
    constructor(){
        this.nes = null
        this.canvas = null
        this.canvasContext = null
        this.frameBuffer = null
        this.audioContext = null
        this.audioScriptNode = null
        this.audioLeftBuffer = []
        this.audioRightBuffer = []
        this.audioReadIndex = 0
        this.romLoaded = false
        this.isRunning = false
        this.animationFrameId = null
        this.lastFrameTime = 0
    }
    initializeEmulator(){
        console.log("Initializing emulator")
        this.canvas = document.getElementById("screen")
        this.canvasContext = this.canvas.getContext("2d");
        this.frameBuffer = this.canvasContext.createImageData(256, 240)
    
        this.nes = new jsnes.NES({
            onFrame: (frameBufferData) => {
                for (let i = 0; i < frameBufferData.length; i++) {this.frameBuffer.data[i * 4 + 0] = frameBufferData[i] & 0x0000FF;
                    this.frameBuffer.data[i * 4 + 1] = (frameBufferData[i] & 0x00FF00) >> 8;
                    this.frameBuffer.data[i * 4 + 2] = (frameBufferData[i] & 0xFF0000) >> 16;
                    this.frameBuffer.data[i * 4 + 3] = 0xFF;
                    
                }
                this.canvasContext.putImageData(this.frameBuffer, 0, 0);
            },
            onAudioSample: (left, right) => {
                if (this.audioContext && this.audioScriptNode) {
                    this.audioLeftBuffer.push(left);
                    this.audioRightBuffer.push(right);
                }
            }
        });
    }
    initializeAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioScriptNode = this.audioContext.createScriptProcessor(audioBufferSize, 0, 2);
            this.audioScriptNode.onaudioprocess = (event) => {
                const outputLeft = event.outputBuffer.getChannelData(0);
                const outputRight = event.outputBuffer.getChannelData(1);
    
                for (let i = 0; i < audioBufferSize; i++) {
                    if (this.audioReadIndex < this.audioLeftBuffer.length) {
                        outputLeft[i] = this.audioLeftBuffer[this.audioReadIndex];
                        outputRight[i] = this.audioRightBuffer[this.audioReadIndex];
                        this.audioReadIndex += 1;
                    } else {
                        outputLeft[i] = 0;
                        outputRight[i] = 0;
                    }
                }

                if (this.audioReadIndex > audioBufferSize * 8) {
                    this.audioLeftBuffer = this.audioLeftBuffer.slice(this.audioReadIndex);
                    this.audioRightBuffer = this.audioRightBuffer.slice(this.audioReadIndex);
                    this.audioReadIndex = 0;
                }
            };
    
            this.audioScriptNode.connect(this.audioContext.destination);
        }

        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }
    }
    
    loadROM(romData) {
        this.nes.loadROM(romData);
        this.romLoaded = true;
    }

    startEmulator() {
        if (!this.romLoaded) {
            console.warn("Load a ROM before starting the emulator");
            return;
        }

        this.initializeAudio();

        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = 0;
        document.getElementById("start-button").style.display = "none"

        const runFrame = (timestamp) => {
            if (!this.lastFrameTime) {
                this.lastFrameTime = timestamp;
            }

            const elapsed = timestamp - this.lastFrameTime;
            if (elapsed >= FRAME_INTERVAL) {
                this.nes.frame();
                this.lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);
            }

            this.animationFrameId = requestAnimationFrame(runFrame);
        };

        this.animationFrameId = requestAnimationFrame(runFrame);
    }
    
}

const audioBufferSize = 1024;
const FRAME_INTERVAL = 1000 / 60;


const buttonMap = {
    'up': {controller: jsnes.Controller.BUTTON_UP, pressed: false, time: 0},
    'down': {controller: jsnes.Controller.BUTTON_DOWN, pressed: false, time: 0},
    'left': {controller: jsnes.Controller.BUTTON_LEFT, pressed: false, time: 0},
    'right': {controller: jsnes.Controller.BUTTON_RIGHT, pressed: false, time: 0},
    'start': {controller: jsnes.Controller.BUTTON_START, pressed: false, time: 0},
    'select': {controller: jsnes.Controller.BUTTON_SELECT, pressed: false, time: 0},
    'a': {controller: jsnes.Controller.BUTTON_A, pressed: false, time: 0},
    'b': {controller: jsnes.Controller.BUTTON_B, pressed: false, time: 0}
};

var emulator = null
