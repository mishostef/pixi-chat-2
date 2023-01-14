import * as PIXI from "pixi.js";

import { tileTexture, isAlphaNumeric } from "./utility";
import { io } from "socket.io-client";
import { createAuthObjects } from "./views/auth";
import { createChatUI } from "./views/chat";
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_COLOR } from "./constants";

let isRefreshOutputNeeded = false;

let isInitialScreenVible = true;

let socket = io("http://localhost:3000/");
let id = "";
socket.on("connect", () => {
  id = socket.id;
});

socket.on("error", (error) => alert(error));

socket.on("ack", (username) => {
  isInitialScreenVible = false;
});

socket.emit("selectRoom", { roomId: "1" });
init();

async function init() {
  const app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: CANVAS_COLOR,
  });

  const buttonTiles = await tileTexture("assets/bevel.png", 25, 105, 25, 105);
  const hlTiles = await tileTexture("assets/hover.png", 25, 105, 25, 105);
  const pressedTiles = await tileTexture("assets/inset.png", 25, 105, 25, 105);
  const tiles = { buttonTiles, hlTiles, pressedTiles };
  const authObjects = new createAuthObjects(tiles);

  document.body.addEventListener("keydown", (event) => {
    const key = event.key;
    if (isAlphaNumeric(key) || key === " ") {
      handleAlphanumeric(authObjects, key, createChat);
    } else if (key === "Enter") {
      handleEnter(authObjects, createChat);
    } else if (key === "Backspace") {
      handleBackspace(authObjects, createChat);
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
    setUI(authObjects, createChat);
    if (isInitialScreenVible) {
      handleAuth(authObjects);
    } else {
      handleChat(createChat);
    }
  }
  document.body.appendChild(app.view as HTMLCanvasElement);
}

function setUI(authObjects: createAuthObjects, createChat: createChatUI) {
  authObjects.initialUi.renderable = isInitialScreenVible;
  authObjects.clearAuth.renderable = isInitialScreenVible;
  authObjects.sendAuth.renderable = isInitialScreenVible;

  createChat.ui.renderable = !isInitialScreenVible;
  createChat.ui.interactive = !isInitialScreenVible;
  createChat.clearBtn.interactive = !isInitialScreenVible;
  createChat.sendBtn.interactive = !isInitialScreenVible;
  createChat.textInput.interactive = !isInitialScreenVible;
}

function handleAlphanumeric(
  authObjects: createAuthObjects,
  key: string,
  createChat: createChatUI
) {
  if (isInitialScreenVible) {
    if (authObjects.passInput.isActive) {
      authObjects.Password += key;
    } else {
      authObjects.Username += key;
    }
  } else {
    createChat.LastMessage += key;
  }
}

function handleChat(createChat: createChatUI) {
  if (createChat.isMessageAck) {
    socket.emit("msg", {
      message: createChat.lastMessage,
      id: socket.id,
    });
    createChat.isMessageAck = false;
    createChat.lastMessage = "";
  }
  createChat.textInput.label = createChat.lastMessage + "|";

  if (isRefreshOutputNeeded) {
    createChat.textOutput.refreshOutput();
    isRefreshOutputNeeded = false;
  }
}

function handleAuth(authObjects: createAuthObjects) {
  if (authObjects.isSendConfirmed) {
    socket.emit("auth", {
      username: authObjects.username,
      password: authObjects.password,
      id: socket.id,
    });
  }
  if (authObjects.usernameInput.isActive) {
    authObjects.usernameInput.label = authObjects.username + "|";
    authObjects.passInput.label = "*".repeat(authObjects.password.length);
  } else {
    authObjects.usernameInput.label = authObjects.username;
    authObjects.passInput.label = "*".repeat(authObjects.password.length) + "|";
  }
}

function handleEnter(authObjects: createAuthObjects, createChat: createChatUI) {
  if (isInitialScreenVible) {
    socket.emit("auth", {
      username: authObjects.username,
      password: authObjects.password,
      id: socket.id,
    });
  } else {
    socket.emit("msg", {
      message: createChat.lastMessage,
      id: socket.id,
    });
    createChat.lastMessage = "";
  }
}

function handleBackspace(
  authObjects: createAuthObjects,
  createChat: createChatUI
) {
  if (isInitialScreenVible) {
    authObjects.passInput.isActive
      ? (authObjects.password = authObjects.password.slice(0, -1))
      : (authObjects.username = authObjects.username.slice(0, -1));
  } else {
    createChat.lastMessage = createChat.lastMessage.slice(0, -1);
  }
}
