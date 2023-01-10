import * as PIXI from "pixi.js";
import { TextStyle, Text } from "pixi.js";
import { Button } from "./Button";
import { TiledTexture, createPanel } from "./utility";

export function createAuthObjects(tiles, socket, auth) {
  const { buttonTiles, hlTiles, pressedTiles } = tiles;
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
      username: auth.currentUsername,
      password: auth.currentPass,
      id: socket.id,
    });
  }

  function onInputClick() {
    this.label = "|";
    auth.activeInput = this;
    if (this.name) {
      auth.activeInput = "pass";
    }
  }
  function clearInput() {
    auth.currentUsername = "";
  }
  return {
    initialUi,
    passInput,
    usernameInput,
    sendAuth: sendBtn,
    clearAuth: clearBtn,
  };
}
