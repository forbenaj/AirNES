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
    }
    initializeEmulator(){
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
        document.getElementById("start-button").addEventListener("click", this.initializeAudio);
    
    }
    initializeAudio() {
        this.audioLeftBuffer = []
        this.audioRightBuffer = []
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioScriptNode = this.audioContext.createScriptProcessor(audioBufferSize, 0, 2);
            this.audioScriptNode.onaudioprocess = (event) => {
                const outputLeft = event.outputBuffer.getChannelData(0);
                const outputRight = event.outputBuffer.getChannelData(1);
    
                for (let i = 0; i < audioBufferSize; i++) {
                    outputLeft[i] = this.audioLeftBuffer.length > 0 ? this.audioLeftBuffer.shift() : 0;
                    outputRight[i] = this.audioRightBuffer.length > 0 ? this.audioRightBuffer.shift() : 0;
                }
            };
    
            this.audioScriptNode.connect(this.audioContext.destination);
        }
    }
    
    loadROM(romData) {
        this.nes.loadROM(romData);
    }

    startEmulator() {
        this.nes.frame();
        setInterval(() => this.nes.frame(), 1000/60);
        document.getElementById("start-button").style.display = "none"
    }
    
}

const audioBufferSize = 4096;
const FRAME_RATE = 1000 / 60;


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