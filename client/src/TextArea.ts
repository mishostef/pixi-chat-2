import { Button } from "./Button";
import * as PIXI from "pixi.js";
import { DisplayObject } from "pixi.js";
import { Base } from "./Base";

export class TextArea extends Base {
  messages: string[];
  isBitmapFontLoaded: boolean = false;
  initialBitmapTextX = 30;
  initialBitmapTextY = 30;
  bitmapTextX = this.initialBitmapTextX;
  bitmapTextY = this.initialBitmapTextY;
  constructor(
    label: string,
    element: DisplayObject,
    highlight: DisplayObject,
    pressed: DisplayObject
  ) {
    super(label, element, highlight, pressed);
  }
  refreshOutput(textOutput: Button) {
    if (textOutput.label) {
      textOutput.label = "";
    }
    if (this.isBitmapFontLoaded) {
      this.appendMessage(textOutput);
    } else {
      Promise.all([
        PIXI.Assets.load("../assets/font/desyrel.xml"),
        PIXI.Assets.load("../assets/font/desyrel.png"),
      ]).then(() => {
        this.appendMessage(textOutput);
        this.isBitmapFontLoaded = true; //
      });
    }
  }

  appendMessage(textOutput: Button) {
    const lastMessage = this.messages[this.messages.length - 1];
    const bitmapFontText = new PIXI.BitmapText(lastMessage, {
      fontName: "Desyrel",
      fontSize: 20,
      align: "left",
    });

    if (this.bitmapTextY + 100 <= this.height) {
      this.bitmapTextY += 50;
    } else {
      if (this.bitmapTextX === 30) {
        this.bitmapTextY = 50;
      } else {
        this.clearOutput();
      }
    }
    bitmapFontText.x = this.bitmapTextX;
    bitmapFontText.y = this.bitmapTextY;
    textOutput.addChild(bitmapFontText);
  }
  clearOutput() {
    if (this.label) {
      this.label = "";
    }
    const notTextChildren = this.children.filter(
      (el) => !(el instanceof PIXI.BitmapText)
    );
    this.removeChildren();
    this.addChild(...notTextChildren);
    this.bitmapTextX = this.initialBitmapTextX;
    this.bitmapTextY = this.initialBitmapTextY;
  }
}
