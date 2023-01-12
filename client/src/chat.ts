import { Button } from "./Button";
import { TiledTexture, createPanel } from "./utility";
import * as PIXI from "pixi.js";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
const ouputWidth = 750;
const ouputHeight = 475;
const initialBitmapTextX = 30;
const initialBitmapTextY = 30;
let bitmapTextX = initialBitmapTextX;
let bitmapTextY = initialBitmapTextY;
const canvasWidht = 800;

export function createGraphicObjects(tiles, socket, messages) {
  const { buttonTiles, hlTiles, pressedTiles } = tiles;
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

  function onInputClick() {
    this.label = "|";
  }

  function sendMessage() {
    messages.myMessages.push(messages.currentMessage);
    socket.emit("msg", {
      message: messages.currentMessage,
      id: socket.id,
    });
    messages.currentMessage = "";
  }

  function refreshOutput(textOutput: Button) {
    if (textOutput.label) {
      textOutput.label = "";
    }
    if (messages.isBitmapFontLoaded) {
      appendMessage(textOutput);
    } else {
      Promise.all([
        PIXI.Assets.load("../assets/font/desyrel.xml"),
        PIXI.Assets.load("../assets/font/desyrel.png"),
      ]).then(() => {
        appendMessage(textOutput);
        messages.isBitmapFontLoaded = true; //
      });
    }
  }

  function appendMessage(textOutput: Button) {
    const lastMessage = messages.myMessages[messages.myMessages.length - 1];
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

  function clearOutput() {}

  function clearInput() {
    messages.currentMessage = "";
    //textInput.clear();
  }
  return { ui, textInput, textOutput, clearBtn, sendBtn, refreshOutput };
}

///////////////////////////////////////////////////////////////
export class createChatUI extends PIXI.Container {
  clearBtn: Button;
  textInput: Button;
  messages: any;
  constructor(tiles, socket, messages) {
    super();
    const { buttonTiles, hlTiles, pressedTiles } = tiles;
    this.messages = messages;
    this.clearBtn = new Button(
      "Clear",
      this.clearInput,
      createPanel(buttonTiles, 150, 50),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );
    const textInput = new Input(
      "input, click to activate",
      createPanel(buttonTiles, 575, 50),
      createPanel(hlTiles, 575, 50),
      createPanel(pressedTiles, 575, 50),
      "message"
    );
    const sendBtn = new Button(
      "Send",
      this.sendMessage,
      createPanel(buttonTiles, 150, 50, 0xdb4e12),
      createPanel(hlTiles, 150, 50),
      createPanel(pressedTiles, 150, 50)
    );
    const textOutput = new TextArea(
      "chat history",
      createPanel(buttonTiles, ouputWidth, ouputHeight),
      createPanel(hlTiles, ouputWidth, ouputHeight),
      createPanel(pressedTiles, ouputWidth, ouputHeight)
    );

    textOutput.position.set(25, 25);
    textInput.position.set(25, 525);
    const buttonContainer = new PIXI.Container();

    this.clearBtn.position.set(0, 0);
    sendBtn.position.set(0, 60);
    buttonContainer.position.set(625, 525);

    buttonContainer.addChild(this.clearBtn, sendBtn);
    const ui = new PIXI.Container();
    ui.addChild(textOutput, textInput, buttonContainer);
  }
  onInputClick() {
    this.textInput.label = "|";
  }

  sendMessage() {
    this.messages.myMessages.push(this.messages.currentMessage);
    // socket.emit("msg", {
    //   message: messages.currentMessage,
    //   id: socket.id,
    // });
    // messages.currentMessage = "";
  }

  clearInput() {
    this.messages.currentMessage = "";
  }
  // return { ui, textInput, textOutput, clearBtn, sendBtn, refreshOutput };
}
