import { text } from "express";
import * as PIXI from "pixi.js";
import { DisplayObject, TextStyleAlign } from "pixi.js";
import { BITMAP_STYLE, OUTPUT_WIDTH } from "../constants";
import { Input } from "./Input";

export class TextArea extends Input {
  messages: string[];
  isBitmapFontLoaded: boolean = false;
  initialBitmapTextX = 30;
  initialBitmapTextY = 30;
  bitmapTextX = this.initialBitmapTextX;
  bitmapTextY = this.initialBitmapTextY;
  constructor(
    label: string,
    element: DisplayObject,
    name: string,
    messages: string[]
  ) {
    super(label, element, name);
    this.messages = messages;
  }
  refreshOutput() {
    const append = this.appendMessage.bind(this);
    if (this.label) {
      this.label = "";
    }
    if (this.isBitmapFontLoaded) {
      append();
    } else {
      Promise.all([
        PIXI.Assets.load("../assets/font/desyrel.xml"),
        PIXI.Assets.load("../assets/font/desyrel.png"),
      ]).then(() => {
        append();
        this.isBitmapFontLoaded = true; //
      });
    }
  }

  appendMessage() {
    const lastMessage = this.messages[this.messages.length - 1];
    const bitmapFontText = new PIXI.BitmapText(lastMessage, BITMAP_STYLE);
    if (this.bitmapTextY + 100 <= this.height) {
      this.bitmapTextY += 50;
    } else {
      this.clearOutput();
    }
    if (bitmapFontText.getBounds().width > this.width) {
      const halves = lastMessage.split(":");
      const nameText = new PIXI.BitmapText(halves[0], BITMAP_STYLE);
      const messageText = new PIXI.BitmapText(halves[1], BITMAP_STYLE);
      nameText.x = this.bitmapTextX;
      nameText.y = this.bitmapTextY;
      this.bitmapTextY += 50;
      messageText.x = this.bitmapTextX;
      messageText.y = this.bitmapTextY;
      this.addChild(nameText, messageText);
    } else {
      bitmapFontText.x = this.bitmapTextX;
      bitmapFontText.y = this.bitmapTextY;
      this.addChild(bitmapFontText);
    }
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
