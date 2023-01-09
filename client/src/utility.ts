import * as PIXI from "pixi.js";

export type TiledTexture = [
  [PIXI.Texture, PIXI.Texture, PIXI.Texture],
  [PIXI.Texture, PIXI.Texture, PIXI.Texture],
  [PIXI.Texture, PIXI.Texture, PIXI.Texture]
];

export async function tileTexture(
  url: string,
  left: number,
  right: number,
  top: number,
  bottom: number
): Promise<TiledTexture> {
  const bt = PIXI.BaseTexture.from(url);

  await new Promise((resolve, reject) => {
    bt.on("loaded", resolve);
    bt.on("error", reject);
  });

  const lw = left;
  const cw = right - left;
  const rw = bt.width - right;

  const th = top;
  const ch = bottom - top;
  const bh = bt.height - bottom;

  return [
    [
      slice(bt, 0, 0, lw, th),
      slice(bt, left, 0, cw, th),
      slice(bt, right, 0, rw, th),
    ],
    [
      slice(bt, 0, top, lw, ch),
      slice(bt, left, top, cw, ch),
      slice(bt, right, top, rw, ch),
    ],
    [
      slice(bt, 0, bottom, lw, bh),
      slice(bt, left, bottom, cw, bh),
      slice(bt, right, bottom, rw, bh),
    ],
  ];
}

export function createPanel(
  tiles: TiledTexture,
  width: number,
  height: number,
  color?: number
) {
  const container = new PIXI.Container();

  // Corners
  const tl = new PIXI.Sprite(tiles[0][0]);
  const tr = new PIXI.Sprite(tiles[0][2]);
  const bl = new PIXI.Sprite(tiles[2][0]);
  const br = new PIXI.Sprite(tiles[2][2]);

  // Horizontal segments
  const t = new PIXI.Sprite(tiles[0][1]);
  const b = new PIXI.Sprite(tiles[2][1]);

  // Vertical segments
  const l = new PIXI.Sprite(tiles[1][0]);
  const r = new PIXI.Sprite(tiles[1][2]);

  container.addChild(tl, tr, bl, br);

  if (width < tl.width + tr.width) {
    const half = width / 2;
    tl.width = half;
    tr.width = half;
    bl.width = half;
    br.width = half;
    l.width = half;
    r.width = half;
  }
  if (height < tl.height + bl.height) {
    const half = height / 2;
    tl.height = half;
    tr.height = half;
    bl.height = half;
    br.height = half;
    t.height = half;
    b.height = half;
  }

  tl.position.set(0, 0);
  tr.position.set(width - tr.width, 0);
  bl.position.set(0, height - bl.height);
  br.position.set(width - br.width, height - br.height);

  // Horizontal segments
  if (width > tl.width + tr.width) {
    t.width = width - (tl.width + tr.width);
    b.width = width - (bl.width + br.width);

    t.position.set(tl.width, 0);
    b.position.set(bl.width, height - b.height);

    container.addChild(t, b);
  }

  // Vertical segments
  if (height > tl.height + bl.height) {
    l.height = height - (tl.height + bl.height);
    r.height = height - (tr.height + br.height);

    l.position.set(0, tl.height);
    r.position.set(width - r.width, tr.height);

    container.addChild(l, r);
  }

  if (width > tl.width + tr.width && height > tl.height + bl.height) {
    const c = new PIXI.Sprite(tiles[1][1]);
    c.width = width - (tl.width + tr.width);
    c.height = height - (tl.height + bl.height);

    c.position.set(tl.width, tl.height);

    container.addChild(c);
  }
  if (color) {
    const ch = (container.children as PIXI.Sprite[]).map(
      (c) => (c.tint = color)
    );
  }
  return container;
}

function slice(baseTexture, x, y, w, h) {
  return new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, w, h));
}

export function isAlphaNumeric(inputChar) {
  const regex = /^([a-zA-Z0-9_-])$/;
  return regex.test(inputChar);
}
