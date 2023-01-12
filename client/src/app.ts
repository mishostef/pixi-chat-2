import * as PIXI from "pixi.js";
import { tileTexture, isAlphaNumeric } from "./utility";
import { io } from "socket.io-client";
import { createAuthObjects } from "./auth";
import { createChatUI } from "./chat";
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

socket.on("ack", (username) => {
  console.log(`my username is ${username}`);
  isInitialScreenVible = false;
});

socket.emit("selectRoom", { roomId: "1" });
init();

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
  const authObjects = new createAuthObjects(tiles);

  document.body.addEventListener("keydown", (event) => {
    const key = event.key;
    console.log(key);
    if (isAlphaNumeric(key) || key === " ") {
      if (isInitialScreenVible) {
        authObjects.passInput.isActive
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
        authObjects.passInput.isActive
          ? (auth.currentPass = auth.currentPass.slice(0, -1))
          : (auth.currentUsername = auth.currentUsername.slice(0, -1));
      } else {
        messages.currentMessage = messages.currentMessage.slice(0, -1);
      }
    }
  });

  app.stage.addChild(authObjects.initialUi);
  
  const createChat = new createChatUI(tiles);
  socket.on("message", ({ message, name: sym }) => {
    createChat.messages.push(`${sym} said: ${message}`);
    isRefreshOutputNeeded = true;
  });
  app.stage.addChild(createChat.ui);
  app.ticker.add(update);
  function update() {
    authObjects.initialUi.renderable = isInitialScreenVible;
    authObjects.clearAuth.renderable = isInitialScreenVible;
    authObjects.sendAuth.renderable = isInitialScreenVible;

    createChat.ui.renderable = !isInitialScreenVible;
    createChat.ui.interactive = !isInitialScreenVible;
    createChat.clearBtn.interactive = !isInitialScreenVible;
    createChat.sendBtn.interactive = !isInitialScreenVible;
    createChat.textInput.interactive = !isInitialScreenVible;
    if (isInitialScreenVible) {
      if (authObjects.isSendConfirmed) {
        socket.emit("auth", {
          username: auth.currentUsername,
          password: auth.currentPass,
          id: socket.id,
        });
      }
      if (authObjects.usernameInput.isActive) {
        authObjects.usernameInput.label = auth.currentUsername + "|";
        authObjects.passInput.label = auth.currentPass;
      } else {
        authObjects.usernameInput.label = auth.currentUsername;
        authObjects.passInput.label = auth.currentPass + "|";
      }
    } else {
      if (createChat.isMessageAck) {
        socket.emit("msg", {
          message: createChat.textInput.label,
          id: socket.id,
        });
        messages.currentMessage = "";
        console.log("Message sent");
        createChat.isMessageAck = false;
      }
      createChat.textInput.label = messages.currentMessage + "|";
      if (isRefreshOutputNeeded) {
        createChat.textOutput.refreshOutput();
        isRefreshOutputNeeded = false;
      }
    }
  }
  document.body.appendChild(app.view as HTMLCanvasElement);
}
