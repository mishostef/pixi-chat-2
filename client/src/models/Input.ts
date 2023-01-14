import { DisplayObject } from "pixi.js";
import { Base } from "./Base";

export class Input extends Base {
  isActive = false;
  constructor(
    label: string,
    element: DisplayObject,
    name: string,
  ) {
    super(label, element);
    console.log(`Input width is ${this.width} an height is ${this.height}`);
    this.interactive = true;
    this.name = name;
    this.on("click", (ev) => this.onClick(ev));
  }
  activate() {
    this.isActive = true;
  }
  clear() {
    this.label = "";
  }
  onClick(ev) {
    console.log(`input ${this.name} clicked`);
    this.activate();
  }
}
