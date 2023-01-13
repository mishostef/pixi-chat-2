import { Button } from "./Button";
import { createPanel } from "./utility";
import * as PIXI from "pixi.js";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
const ouputWidth = 750;
const ouputHeight = 475;

export class createChatUI extends PIXI.Container {
  clearBtn: Button;
  textInput: Input;
  sendBtn: Button;
  textOutput: TextArea;
  messages: any;
  ui: PIXI.Container;
  isMessageAck: boolean = false;
  lastMessage: string = "";
  constructor(tiles) {
    super();
    const { buttonTiles, hlTiles, pressedTiles } = tiles;
    this.messages = [];
    this.clearBtn = new Button(
      "Clear",
      this.clearInput,
      createPanel(buttonTiles, 150, 50),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );
    this.textInput = new Input(
      "input, click to activate",
      createPanel(buttonTiles, 575, 50),
      "message"
    );
    this.sendBtn = new Button(
      "Send",
      this.sendMessage.bind(this),
      createPanel(buttonTiles, 150, 50, 0xdb4e12),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );
    this.textOutput = new TextArea(
      "chat history",
      createPanel(buttonTiles, ouputWidth, ouputHeight),
      "output",
      this.messages
    );

    this.textOutput.position.set(25, 25);
    this.textInput.position.set(25, 525);
    const buttonContainer = new PIXI.Container();

    this.clearBtn.position.set(0, 0);
    this.sendBtn.position.set(0, 60);
    buttonContainer.position.set(625, 525);

    buttonContainer.addChild(this.clearBtn, this.sendBtn);
    this.ui = new PIXI.Container();
    this.ui.addChild(this.textOutput, this.textInput, buttonContainer);
  }
  onInputClick() {
    this.textInput.label = "|";
  }

  sendMessage() {
    this.lastMessage = this.textInput.label.slice(0, -1);
    this.isMessageAck = true;
  }

  clearInput() {
    this.messages.currentMessage = "";
  }
}
