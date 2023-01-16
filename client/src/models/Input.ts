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
    this.activate();
  }
}
