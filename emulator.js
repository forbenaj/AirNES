let nes;
let canvasContext;
let audioContext;
let audioScriptNode;
const audioBufferSize = 4096;
const FRAME_RATE = 1000 / 60;

let canvas;
let frameBuffer;

let audioLeftBuffer = [];
let audioRightBuffer = [];

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
function initializeEmulator(){
    canvas = document.getElementById("screen")
    canvasContext = canvas.getContext("2d");
    frameBuffer = canvasContext.createImageData(256, 240)

    nes = new jsnes.NES({
        onFrame: function (frameBufferData) {
            for (let i = 0; i < frameBufferData.length; i++) {frameBuffer.data[i * 4 + 0] = frameBufferData[i] & 0x0000FF;
                frameBuffer.data[i * 4 + 1] = (frameBufferData[i] & 0x00FF00) >> 8;
                frameBuffer.data[i * 4 + 2] = (frameBufferData[i] & 0xFF0000) >> 16;
                frameBuffer.data[i * 4 + 3] = 0xFF;
                
            }
            canvasContext.putImageData(frameBuffer, 0, 0);
        },
        onAudioSample: function(left, right) {
            if (audioContext && audioScriptNode) {
                audioLeftBuffer.push(left);
                audioRightBuffer.push(right);
            }
        }
    });
    document.getElementById("start-button").addEventListener("click", initializeAudio);

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") nes.buttonDown(1, jsnes.Controller.BUTTON_UP);
        if (event.key === "ArrowDown") nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN);
        if (event.key === "ArrowLeft") nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT);
        if (event.key === "ArrowRight") nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT);
        if (event.key === "a") nes.buttonDown(1, jsnes.Controller.BUTTON_A);
        if (event.key === "s") nes.buttonDown(1, jsnes.Controller.BUTTON_B);
        if (event.key === "Enter") nes.buttonDown(1, jsnes.Controller.BUTTON_START);
        if (event.key === " ") nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT);
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "ArrowUp") nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
        if (event.key === "ArrowDown") nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
        if (event.key === "ArrowLeft") nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
        if (event.key === "ArrowRight") nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
        if (event.key === "a") nes.buttonUp(1, jsnes.Controller.BUTTON_A);
        if (event.key === "s") nes.buttonUp(1, jsnes.Controller.BUTTON_B);
        if (event.key === "Enter") nes.buttonUp(1, jsnes.Controller.BUTTON_START);
        if (event.key === " ") nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT);
    });

}

function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioScriptNode = audioContext.createScriptProcessor(audioBufferSize, 0, 2);
        audioScriptNode.onaudioprocess = (event) => {
            const outputLeft = event.outputBuffer.getChannelData(0);
            const outputRight = event.outputBuffer.getChannelData(1);

            for (let i = 0; i < audioBufferSize; i++) {
                outputLeft[i] = audioLeftBuffer.length > 0 ? audioLeftBuffer.shift() : 0;
                outputRight[i] = audioRightBuffer.length > 0 ? audioRightBuffer.shift() : 0;
            }
        };

        audioScriptNode.connect(audioContext.destination);
    }
}

function loadROM(romData) {
    nes.loadROM(romData);
}

function startEmulator() {
    nes.frame();
    setInterval(() => nes.frame(), 1000/60);
    document.getElementById("start-button").style.display = "none"
}