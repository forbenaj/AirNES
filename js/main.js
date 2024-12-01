let type

let joinButton = document.getElementById("start-btn")

let mainMenu = document.getElementById("mainMenu")
let introMenu = document.getElementById("introMenu")

let loaderContainer = document.getElementById("loader-container")

let forceFullscreen = false

let idInput = document.getElementById('id-input')

let uploadRom = document.getElementById('upload-rom')
let romInput = document.getElementById('rom-input')
let startButton = document.getElementById('start-button')

let players = []

var myself = null

var conn = null


document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('uppercaseInput');

    idInput.addEventListener('input', () => {
        idInput.value = idInput.value.toUpperCase();
    });
    idInput.addEventListener('keypress', (event) => {
        if(event.key === "Enter"){
            document.getElementById("as-host-btn").click()
        }
    })
});

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock was released');
    });
    console.log('Wake lock acquired');
  } catch (err) {
    console.error(`Wake lock request failed: ${err}`);
  }
}

requestWakeLock();