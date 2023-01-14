import * as PIXI from "pixi.js";
import { TextStyle, Text, DisplayObject } from "pixi.js";
import { Button } from "../models/Button";
import { INPUT_OFFSET, style } from "../constants";
import { Input } from "../models/Input";
import { TiledTexture, createPanel, getTextWidth } from "../utility";

export class createAuthObjects extends PIXI.Container {
  buttonTiles: DisplayObject;
  hlTiles: DisplayObject;
  pressedTiles: DisplayObject;
  username: string = "";
  password: string = "";
  initialUi: PIXI.Container;
  clearAuth: Button;
  sendAuth: Button;
  usernameInput: Input;
  passInput: Input;
  isSendConfirmed: boolean = false;
  constructor(tiles) {
    super();
    const { buttonTiles, hlTiles, pressedTiles } = tiles;

    this.clearAuth = new Button(
      "Clear",
      this.clearInput.bind(this),
      createPanel(buttonTiles, 150, 50),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );

    const usernameText = new Text("username", style);
    usernameText.position.set(25, 500);
    const passText = new Text("password", style);
    passText.position.set(25, 575);
    this.usernameInput = new Input(
      "input, click to activate",
      createPanel(buttonTiles, 575, 50),
      "username"
    );
    this.usernameInput.isActive = true;
    this.passInput = new Input(
      "pass",
      createPanel(buttonTiles, 575, 50),
      "pass"
    );
    this.passInput.isActive = false;

    this.sendAuth = new Button(
      "Send",
      this.sendMessage1.bind(this),
      createPanel(buttonTiles, 150, 50, 0xdb4e12),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );

    this.usernameInput.position.set(25, 525);
    this.passInput.position.set(25, 600);
    const buttonContainer = new PIXI.Container();

    this.clearAuth.position.set(0, 0);
    this.sendAuth.position.set(0, 60);
    buttonContainer.position.set(625, 525);

    buttonContainer.addChild(this.clearAuth, this.sendAuth);
    this.initialUi = new PIXI.Container();
    this.initialUi.addChild(
      this.usernameInput,
      this.passInput,
      buttonContainer,
      usernameText,
      passText
    );
    this.initialUi.interactive = true;
    this.initialUi.on("click", (ev) => {
      const target = ev.target;
      if ((target as Input).name === "username") {
        this.usernameInput.isActive = true;
        this.passInput.isActive = false;
      } else if ((target as Input).name === "pass") {
        this.usernameInput.isActive = false;
        this.passInput.isActive = true;
      }
    });
  }
  sendMessage1() {
    this.isSendConfirmed = true;
    console.log("cb");
  }

  clearInput() {
    if (this.usernameInput.isActive) {
      this.username = "";
    } else if (this.passInput.isActive) {
      this.password = "";
    }
  }
  set Password(pass) {
    if (
      getTextWidth("*".repeat(this.password.length)) <
      this.passInput.width - INPUT_OFFSET
    ) {
      this.password = pass;
    }
  }

  set Username(username) {
    if (getTextWidth(this.username) < this.usernameInput.width - INPUT_OFFSET) {
      this.username = username;
    }
  }
  get Username() {
    return this.username;
  }
  get Password() {
    return this.password;
  }
}
