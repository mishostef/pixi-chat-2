import * as PIXI from "pixi.js";
import { tileTexture, isAlphaNumeric } from "./utility";
import { io } from "socket.io-client";
import { createAuthObjects } from "./auth";
import { createGraphicObjects } from "./chat";
const messages = {
  myMessages: [],
  currentMessage: "",
  isBitmapFontLoaded: false,
};
let isRefreshOutputNeeded = false;
const canvasWidht = 800;
const canvasHeight = 700;
let auth = { currentUsername: "", currentPass: "", activeInput: "" };
let isInitialScreenVible = true;

let socket = io("http://localhost:3000/");
let id = "";
socket.on("connect", () => {
  id = socket.id;
});

socket.on("error", (error) => alert(error));

socket.on("message", ({ message, name: sym }) => {
  messages.myMessages.push(`${sym} said: ${message}`);
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
      auth.activeInput == "pass"
        ? (auth.currentPass += key)
        : (auth.currentUsername += key);
    } else {
      messages.currentMessage += key;
    }
  } else if (key === "Enter") {
    if (isInitialScreenVible) {
      socket.emit("auth", {
        username: auth.currentUsername,
        password: auth.currentPass,
        id: socket.id,
      });
    } else {
      socket.emit("msg", {
        message: messages.currentMessage,
        id: socket.id,
      });
      messages.currentMessage = "";
    }
  } else if (key === "Backspace") {
    if (isInitialScreenVible) {
      auth.activeInput == "pass"
        ? (auth.currentPass = auth.currentPass.slice(0, -1))
        : (auth.currentUsername = auth.currentUsername.slice(0, -1));
    } else {
      messages.currentMessage = messages.currentMessage.slice(0, -1);
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
  const tiles = { buttonTiles, hlTiles, pressedTiles };
  const { usernameInput, passInput, initialUi, clearAuth, sendAuth } =
    createAuthObjects(tiles, socket, auth);

  app.stage.addChild(initialUi);
  const { ui, textInput, textOutput, clearBtn, sendBtn, refreshOutput } =
    createGraphicObjects(tiles, socket, messages);

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
        auth.activeInput == "pass"
          ? auth.currentUsername
          : auth.currentUsername + "|";
      passInput.label =
        auth.activeInput == "pass" ? auth.currentPass + "|" : auth.currentPass;
    } else {
      textInput.label = messages.currentMessage + "|";
      if (isRefreshOutputNeeded) {
        refreshOutput(textOutput);
        isRefreshOutputNeeded = false;
      }
    }
  }
  document.body.appendChild(app.view as HTMLCanvasElement);
}
