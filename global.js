let money = 100;

function loadTexture(name) {
  textures[name] = loadImage(`textures/${name}.png`);
}

function toMenu() {
  window.location.href = '../index.html';
}

function isInArea(x0, y0, x, y, w, h) {
  if (x0 >= x && x0 < x + w && y0 >= y && y0 < y + h) {
    return true;
  }
  return false;
}

const lock = (fn, ...args) => (...nextArgs) => fn(...args, ...nextArgs);

function getHighestPr(arr) {// for buttons
  let highestPr = -10;
  let res;
  arr.forEach(obj => {
    if (obj.priority > highestPr) {
      highestPr = obj.priority;
    }
  });
  arr.forEach(obj => {
    if (obj.priority === highestPr) {
      res = obj;
    }
  });
  return res;
}

class Button {
  constructor(callback, x, y, w = 100, h = 100, scalable = false,
    backImg = undefined, text = '', backColor = color(0), sound = undefined, priority = 0, group = 0) {
    this.callback = callback;
    this.enabled = true;
    this.i = -1;
    this.j = -1;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.scalable = scalable;
    this.backImg = backImg;
    this.backColor = backColor;
    this.text = text;
    this.priority = priority;
    this.group = group;
    this.sound = sound;
  }

  static onClick(buttons) {
    const act = [];
    buttons.forEach(b => {
      if (b.enabled) {
        if (b.scalable === true && isInArea(// not implemented
          mouseX,
          mouseY,
          b.x,
          b.y,
          b.w,
          b.h
        )) {
          act.push(b);
        } else if (b.scalable === false && isInArea(
          mouseX,
          mouseY,
          b.x,
          b.y,
          b.w,
          b.h
        )) {
          act.push(b);
        }
      }
    });
    let b;
    if (act.length > 1) {
      b = getHighestPr(act);
    } else if (act.length === 1) {
      b = act[0];
    }
    try {
      if (sound)
        b.sound.play();
    } catch (e) { }
    try {
      b.callback();
    } catch (e) { console.log(e); }
  }

  draw() {
    strokeWeight(0);
    fill(this.backColor);
    rect(this.x, this.y, this.w, this.h);
    if (this.backImg != null)
      image(this.backImg, this.x, this.y, this.w, this.h);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y, this.w, this.h);
  }
}