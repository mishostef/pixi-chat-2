import { Container, DisplayObject, Text, TextStyle } from "pixi.js";
import { style } from "../constants";

export class Base extends Container {
  protected _label: string;
  protected text: Text;

  constructor(label: string, protected element: DisplayObject) {
    super();

    this.addChild(element);
    this.text = new Text("", style);
    this.text.anchor.set(0.1, 0.5);
    this.label = label;
    this.addChild(this.text);
    this.interactive = true;
  }
  get height() {
    return this.element.getBounds().height;
  }
  get width() {
    return this.element.getBounds().width;
  }
  get label() {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
    this.text.text = value;
    this.text.position.set(this.width / 10, this.height / 2);
  }
}
