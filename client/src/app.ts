import * as PIXI from "pixi.js";
import { Button } from "./Button";
import {
  createPanel,
  tileTexture,
  isAlphaNumeric,
  TiledTexture,
} from "./utility";
const myMessages = [];
let currentMessage = "";
let isRefreshOutputNeeded = false;
const initialBitmapTextX = 30;
const initialBitmapTextY = 30;
let bitmapTextX = initialBitmapTextX;
let bitmapTextY = initialBitmapTextY;
const canvasWidht = 800;
const canvasHeight = 700;
const ouputWidth = 750;
const ouputHeight = 475;
let isBitmapFontLoaded = false;

let currentUsername = "";
let currentPass = "";
let activeInput = "";
let isInitialScreenVible = true;

import { io } from "socket.io-client";
import { Text, TextStyle } from "pixi.js";
let socket = io("http://localhost:3000/");
console.log(io);
let id = "";
socket.on("connect", () => {
  console.log("socket id= ", socket.id);
  id = socket.id;
});

socket.on("error", (error) => alert(error));

socket.on("message", ({ message, name: sym }) => {
  myMessages.push(`${sym} said: ${message}`);
  isRefreshOutputNeeded = true;
});

socket.on("ack", (username) => {
  console.log(`my username is ${username}`);
  isInitialScreenVible = false;
});

socket.emit("selectRoom", { roomId: "1" });
init();

document.body.addEventListener("keydown", (event) => {
  const key = event.key;
  console.log(key);
  if (isAlphaNumeric(key) || key === " ") {
    if (isInitialScreenVible) {
      activeInput == "pass" ? (currentPass += key) : (currentUsername += key);
    } else {
      currentMessage += key;
    }
  } else if (key === "Enter") {
    if (isInitialScreenVible) {
      socket.emit("auth", {
        username: currentUsername,
        password: currentPass,
        id,
      });
    } else {
      socket.emit("msg", {
        message: currentMessage,
        id,
      });
      currentMessage = "";
    }
  } else if (key === "Backspace") {
    if (isInitialScreenVible) {
      activeInput == "pass"
        ? (currentPass = currentPass.slice(0, -1))
        : (currentUsername = currentUsername.slice(0, -1));
    } else {
      currentMessage = currentMessage.slice(0, -1);
    }
  }
});

async function init() {
  const app = new PIXI.Application({
    width: canvasWidht,
    height: canvasHeight,
    backgroundColor: 0x4472c4,
  });

  const buttonTiles = await tileTexture("assets/bevel.png", 25, 105, 25, 105);
  const hlTiles = await tileTexture("assets/hover.png", 25, 105, 25, 105);
  const pressedTiles = await tileTexture("assets/inset.png", 25, 105, 25, 105);

  const { usernameInput, passInput, initialUi, clearAuth, sendAuth } =
    createAuthObjects(buttonTiles, hlTiles, pressedTiles);

  app.stage.addChild(initialUi);
  const { ui, textInput, textOutput, clearBtn, sendBtn } = createGraphicObjects(
    buttonTiles,
    hlTiles,
    pressedTiles
  );

  app.stage.addChild(ui);
  app.ticker.add(update);
  function update() {
    initialUi.renderable = isInitialScreenVible;
    clearAuth.renderable = isInitialScreenVible;
    sendAuth.renderable = isInitialScreenVible;

    ui.renderable = !isInitialScreenVible;
    clearBtn.interactive = !isInitialScreenVible;
    sendBtn.interactive = !isInitialScreenVible;
    if (isInitialScreenVible) {
      usernameInput.label =
        activeInput == "pass" ? currentUsername : currentUsername + "|";
      passInput.label = activeInput == "pass" ? currentPass + "|" : currentPass;
    } else {
      textInput.label = currentMessage + "|";
      if (isRefreshOutputNeeded) {
        refreshOutput(textOutput);
        isRefreshOutputNeeded = false;
      }
    }
  }
  document.body.appendChild(app.view as HTMLCanvasElement);
}

function createGraphicObjects(
  buttonTiles: TiledTexture,
  hlTiles: TiledTexture,
  pressedTiles: TiledTexture
) {
  const clearBtn = new Button(
    "Clear",
    clearInput,
    createPanel(buttonTiles, 150, 50),
    createPanel(hlTiles, 150, 50),
    createPanel(pressedTiles, 150, 50)
  );
  const textInput = new Button(
    "input, click to activate",
    onInputClick,
    createPanel(buttonTiles, 575, 50),
    createPanel(hlTiles, 575, 50),
    createPanel(pressedTiles, 575, 50)
  );
  const sendBtn = new Button(
    "Send",
    sendMessage,
    createPanel(buttonTiles, 150, 50, 0xdb4e12),
    createPanel(hlTiles, 150, 50),
    createPanel(pressedTiles, 150, 50)
  );
  const textOutput = new Button(
    "chat history",
    clearOutput,
    createPanel(buttonTiles, ouputWidth, ouputHeight),
    createPanel(hlTiles, ouputWidth, ouputHeight),
    createPanel(pressedTiles, ouputWidth, ouputHeight)
  );

  textOutput.position.set(25, 25);
  textInput.position.set(25, 525);
  const buttonContainer = new PIXI.Container();

  clearBtn.position.set(0, 0);
  sendBtn.position.set(0, 60);
  buttonContainer.position.set(625, 525);

  buttonContainer.addChild(clearBtn, sendBtn);
  const ui = new PIXI.Container();
  ui.addChild(textOutput, textInput, buttonContainer);
  return { ui, textInput, textOutput, clearBtn, sendBtn };
}

function onInputClick() {
  this.label = "|";
}

function sendMessage() {
  myMessages.push(currentMessage);
  socket.emit("msg", {
    message: currentMessage,
    id,
  });
  currentMessage = "";
}

function refreshOutput(textOutput: Button) {
  if (textOutput.label) {
    textOutput.label = "";
  }
  if (isBitmapFontLoaded) {
    appendMessage(textOutput);
  } else {
    Promise.all([
      PIXI.Assets.load("../assets/font/desyrel.xml"),
      PIXI.Assets.load("../assets/font/desyrel.png"),
    ]).then(() => {
      appendMessage(textOutput);
      isBitmapFontLoaded = true; //
    });
  }
}

function appendMessage(textOutput: Button) {
  const lastMessage = myMessages[myMessages.length - 1];
  const bitmapFontText = new PIXI.BitmapText(lastMessage, {
    fontName: "Desyrel",
    fontSize: 20,
    align: "left",
  });

  if (bitmapTextY + 100 <= ouputHeight) {
    bitmapTextY += 50;
  } else {
    if (bitmapTextX === 30) {
      bitmapTextX = canvasWidht / 2;
      bitmapTextY = 50;
    } else {
      clearOutput();
    }
  }
  bitmapFontText.x = bitmapTextX;
  bitmapFontText.y = bitmapTextY;
  textOutput.addChild(bitmapFontText);
}

function clearOutput() {
  if (this.label) {
    this.label = "";
  }
  const notTextChildren = this.children.filter(
    (el) => !(el instanceof PIXI.BitmapText)
  );
  this.removeChildren();
  this.addChild(...notTextChildren);
  bitmapTextX = initialBitmapTextX;
  bitmapTextY = initialBitmapTextY;
}

function clearInput() {
  currentMessage = "";
}

function createAuthObjects(
  buttonTiles: TiledTexture,
  hlTiles: TiledTexture,
  pressedTiles: TiledTexture
) {
  const clearBtn = new Button(
    "Clear",
    clearInput,
    createPanel(buttonTiles, 150, 50),
    createPanel(hlTiles, 150, 50),
    createPanel(pressedTiles, 150, 50)
  );
  const style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
  });
  const usernameText = new Text("username", style);
  usernameText.position.set(25, 500);
  const passText = new Text("password", style);
  passText.position.set(25, 575);
  const usernameInput = new Button(
    "input, click to activate",
    onInputClick,
    createPanel(buttonTiles, 575, 50),
    createPanel(hlTiles, 575, 50),
    createPanel(pressedTiles, 575, 50)
  );
  const passInput = new Button(
    "pass",
    onInputClick,
    createPanel(buttonTiles, 575, 50),
    createPanel(hlTiles, 575, 50),
    createPanel(pressedTiles, 575, 50)
  );
  passInput.name = "pass";

  const sendBtn = new Button(
    "Send",
    sendMessage1,
    createPanel(buttonTiles, 150, 50, 0xdb4e12),
    createPanel(hlTiles, 150, 50),
    createPanel(pressedTiles, 150, 50)
  );

  usernameInput.position.set(25, 525);
  passInput.position.set(25, 600);
  const buttonContainer = new PIXI.Container();

  clearBtn.position.set(0, 0);
  sendBtn.position.set(0, 60);
  buttonContainer.position.set(625, 525);

  buttonContainer.addChild(clearBtn, sendBtn);
  const initialUi = new PIXI.Container();
  initialUi.addChild(
    usernameInput,
    passInput,
    buttonContainer,
    usernameText,
    passText
  );

  function sendMessage1() {
    socket.emit("auth", {
      username: currentUsername,
      password: currentPass,
      id,
    });
  }

  function onInputClick() {
    this.label = "|";
    activeInput = this;
    if (this.name) {
      activeInput = "pass";
    }
  }
  function clearInput() {
    currentUsername = "";
  }
  return {
    initialUi,
    passInput,
    usernameInput,
    sendAuth: sendBtn,
    clearAuth: clearBtn,
  };
}
