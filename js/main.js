let device_mode

let mainMenu = document.getElementById("mainMenu")

let loaderContainer = document.getElementById("loader-container")

let consoleDiv = document.getElementById("consoleDiv")

let forceFullscreen = false

const urlParams = new URLSearchParams(window.location.search);
let showConsole = urlParams.has('console') || false

let idInput = document.getElementById('id-input')
let inputErrorMessage = document.getElementById('inputErrorMessage')

let uploadRom = document.getElementById('upload-rom')
let romInput = document.getElementById('rom-input')
let startButton = document.getElementById('start-button')

let players = []
var myself = null
var conn = null


document.addEventListener('DOMContentLoaded', () => {
    idInput.addEventListener('input', () => {
        idInput.value = idInput.value.toUpperCase().replace(/\s+/g, '');
        clearInputError();
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

function getHostInputValue() {
  return idInput.value.trim().toUpperCase();
}

function showInputError(message) {
  inputErrorMessage.innerText = message;
}

function clearInputError() {
  inputErrorMessage.innerText = "";
}

function getControllerButtonElementAt(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element || !element.closest) {
    return null;
  }

  return element.closest(".controller-button");
}

let wakeLock = null;
let shouldKeepAwake = false;

async function enableWakeLock() {
  shouldKeepAwake = true;
  await requestWakeLock();
}

async function requestWakeLock() {
  if (!shouldKeepAwake || !navigator.wakeLock || wakeLock) {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      console.log('Wake lock was released');
    });
    console.log('Wake lock acquired');
  } catch (err) {
    console.warn(`Wake lock request failed: ${err}`);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

function customLog(message, type = 'log') {
  var consoleDiv = document.getElementById('consoleDiv');
  var newMessage = document.createElement('p');
  
  var styles = {
    log: 'color: white;',
    error: 'color: red;',
    warn: 'color: orange;',
    info: 'color: lightblue;'
  };

  newMessage.style = styles[type] || styles.log;

  newMessage.textContent = message;
  consoleDiv.appendChild(newMessage);
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

if (showConsole) {
  const originalLog = console.log;
  consoleDiv.style.display = 'block';
  
  console.log = function(message, ...args) {
    customLog(message, 'log');
    originalLog.apply(console, [message, ...args]);
  };

  console.error = function(message, ...args) {
    customLog(message, 'error');
    originalLog.apply(console, ['%c' + message, 'color: red;', ...args]);
  };

  console.warn = function(message, ...args) {
    customLog(message, 'warn');
    originalLog.apply(console, ['%c' + message, 'color: orange;', ...args]);
  };

  console.info = function(message, ...args) {
    customLog(message, 'info');
    originalLog.apply(console, ['%c' + message, 'color: blue;', ...args]);
  };
  
  window.onerror = function(message, source, lineno, colno, error) {
    customLog(`Uncaught error: ${message} at ${source}:${lineno}:${colno}`, 'error');
    console.error(error);
    return true;
  };

  window.onunhandledrejection = function(event) {
    customLog(`Unhandled promise rejection: ${event.reason}`, 'error');
    console.error(event.reason);
  };

  console.log('Console enabled');
}
