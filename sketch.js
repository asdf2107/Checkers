const textures = {};
const buttons = [];
let c = [];
const tile = {
  size: 64,
  startX: 200,
  startY: 80,
  amount: 8,
}
const direction = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
}
let cnv;
const players = {};
let availMoves = []; //1-go, 2-beat, 3-damka-go, 4-damka-beat
let beat = { i: -1, j: -1 };
let curPlr;
let opPlr;
let chosen = { i: -1, j: -1 };

class Player {
  constructor(plnum, dir) {
    this.num = plnum;
    this.dir = dir;
  }
}

function preload() {
  loadTexture('1', '1a');
  loadTexture('2');
  loadTexture('3', '3a');
  loadTexture('4');
  loadTexture('w');
  loadTexture('b');
  loadTexture('board');
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  tile.startX = (width - (tile.amount + 1) * tile.size) / 2;
  background(122, 107, 83);
  cnv.mouseClicked(lock(Button.onClick, buttons));
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      buttons.push(new Button(lock(pressed, i, j), tile.startX + i * tile.size, tile.startY + j * tile.size,
        tile.size, tile.size));
    }
  }
  setCheckers();
  initAvailMoves();
  players.p1 = (new Player(1, direction.up));
  players.p2 = (new Player(2, direction.down));
  curPlr = players.p1;
  opPlr = players.p2;
}

let fixed = false;
function pressed(i, j) {
  const last = { i:chosen.i, j: chosen.j };
  chosen = { i, j };
  if (availMoves[chosen.i][chosen.j] == 1) { // go
    c[last.i][last.j] = 0;
    c[chosen.i][chosen.j] = curPlr.num;
    nextTurn();
  } else if (availMoves[chosen.i][chosen.j] == 3) { // damka go
    c[last.i][last.j] = 0;
    c[chosen.i][chosen.j] = curPlr.num + 2;
    nextTurn();
  } else if (availMoves[chosen.i][chosen.j] == 2) { // beat
    c[last.i][last.j] = 0;
    c[(last.i + chosen.i) / 2][(last.j+ chosen.j) / 2] = 0;
    c[chosen.i][chosen.j] = curPlr.num;
    initAvailMoves();
    if (canBeat(chosen.i, chosen.j, opPlr)) {
      fixed = true;
    } else {
      nextTurn();
    }
  } else if (availMoves[chosen.i][chosen.j] == 4) { // damka beat
    c[last.i][last.j] = 0;
    c[beat.i][beat.j] = 0;
    c[chosen.i][chosen.j] = curPlr.num + 2;
    initAvailMoves();
    if (canBeatDamka(chosen.i, chosen.j, curPlr, opPlr)) {
      fixed = true;
    } else {
      nextTurn();
    }
  } else if (!fixed) {
    setAvailMoves(i, j, curPlr, opPlr);
  } else {
    chosen = { i: last.i, j: last.j };
  }
}

let anyToBeat;
function nextTurn() {
  initAvailMoves();
  fixed = false;
  const getOpPlr = () => curPlr == players.p1 ? players.p2 : players.p1;
  curPlr = getOpPlr();
  opPlr = getOpPlr();
  checkDamkis();
  anyToBeat = isAnyToBeat();
}

function isAnyToBeat() {
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      if ((i + j + 1) % 2 === 0) {
        if (c[i][j] === curPlr.num && canBeat(i, j, opPlr, false) ||
          c[i][j] === curPlr.num + 2 && canBeatDamka(i, j, curPlr, opPlr, false)) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkDamkis() {
  for (let i = 0; i < tile.amount; i++) {
    if (c[i][0] === players.p1.num) c[i][0] += 2;
    if (c[i][tile.amount - 1] === players.p2.num) c[i][tile.amount - 1] += 2;
  }
}

function setAvailMoves(i, j, plr, oppon) {
  initAvailMoves();
  if (c[i][j] === plr.num) {
    if (!canBeat(i, j, oppon) && !anyToBeat) canGo(i, j, plr);
  } else if (c[i][j] === plr.num + 2) {//damka
    if (!canBeatDamka(i, j, plr, oppon) && !anyToBeat) canGoDamka(i, j, curPlr, opPlr);
  }
}

function canGo(i, j, plr) {
  let res = false;
  try {
    if (c[i - 1][j - 1] === 0 && plr.dir === direction.up) {
      availMoves[i - 1][j - 1] = 1;
      res = true;
    }
  }
  catch {}
  try {
    if (c[i + 1][j - 1] === 0 && plr.dir === direction.up) {
      availMoves[i + 1][j - 1] = 1;
      res = true;
    }
  }
  catch {}
  try {
    if (c[i - 1][j + 1] === 0 && plr.dir === direction.down) {
      availMoves[i - 1][j + 1] = 1;
      res = true;
    }
  }
  catch {}
  try {
    if (c[i + 1][j + 1] === 0 && plr.dir === direction.down) {
      availMoves[i + 1][j + 1] = 1;
      res = true;
    }
  }
  catch {}
  return res;
}

function canBeat(i, j, oppon, setAm = true) {
  let res = false;
  _check(-1, -1);
  _check(1, -1);
  _check(-1, 1);
  _check(1, 1);
  return res;

  function _check(k1, k2) {
    try {
      if ((c[i + k1][j + k2] === oppon.num || c[i + k1][j + k2] === oppon.num + 2) && c[i + 2 * k1][j + 2 * k2] === 0) {
        if (setAm) availMoves[i + 2 * k1][j + 2 * k2] = 2;
        res = true;
      }
    }
    catch {}
  }
}

function canGoDamka(i, j) {
  let res = false;
  try {
    for (let k = 1; ; k++) {
      if (c[i - k][j - k] === 0) {
        availMoves[i - k][j - k] = 3;
        res = true;
      } else break;
    }
  }
  catch {}
  try {
    for (let k = 1; ; k++) {
      if (c[i + k][j - k] === 0) {
        availMoves[i + k][j - k] = 3;
        res = true;
      } else break;
    }
  }
  catch {}
  try {
    for (let k = 1; ; k++) {
      if (c[i - k][j + k] === 0) {
        availMoves[i - k][j + k] = 3;
        res = true;
      } else break;
    }
  }
  catch {}
  try {
    for (let k = 1; ; k++) {
      if (c[i + k][j + k] === 0) {
        availMoves[i + k][j + k] = 3;
        res = true;
      } else break;
    }
  }
  catch {}
  return res;
}

function canBeatDamka(i, j, plr, oppon, setAm = true) {
  const _availMoves = [];
  for (let i = 0; i < tile.amount; i++) {
    const arr = [];
    for (let j = 0; j < tile.amount; j++) {
      arr.push(0);
    }
    _availMoves.push(arr);
  }
  _check(-1, -1);
  _check(1, -1);
  _check(-1, 1);
  _check(1, 1);

  let res = false;
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      if (_availMoves[i][j] === 4) {
        res = true;
        if (setAm) availMoves[i][j] = _availMoves[i][j];
      }
    }
  }
  return res;
  
  function _check(k1, k2, d = 1, postJump = false) {
    try {
      const val = c[i + k1 * d][j + k2 * d];
      if (postJump) {
        if (val === 0) {
          _availMoves[i + k1 * d][j + k2 * d] = 4;
          _check(k1, k2, ++d, true);
        }
      } else {
        if (val === plr.num || val === plr.num + 2) { }
        else if (val === oppon.num || val === oppon.num + 2) {
          beat = { 'i': i + k1 * d, 'j': j + k2 * d };
          _check(k1, k2, ++d, true);
        } else {
          _check(k1, k2, ++d);
        }
      }
    }
    catch {}
  }
}

function initAvailMoves() {
  availMoves = [];
  for (let i = 0; i < tile.amount; i++) {
    const arr = [];
    for (let j = 0; j < tile.amount; j++) {
      arr.push(0);
    }
    availMoves.push(arr);
  }
  beat = { i: -1, j: -1 };
}

function setCheckers() {
  c = [];
  let pushInt;
  for (let i = 0; i < tile.amount; i++) {
    const jarr = [];
    for (let j = 0; j < tile.amount; j++) {
      if (j < 3) pushInt = 2;
      else if (j > 4) pushInt = 1;
      else pushInt = 0;
      jarr.push((i + j) % 2 ? pushInt : 0);
    }
    c.push(jarr);
  }
}

function draw() {
  noSmooth();
  strokeWeight(0);
  drawBoardFrame();
  drawTiles();
  drawAvail();
  drawCheckers();
}

function drawBoardFrame() {
  image(textures.board, tile.startX - tile.size, tile.startY - tile.size, tile.size * 10, tile.size * 10);
}

function drawTiles() {
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      image((i + j) % 2 ? textures.b : textures.w, tile.startX + i * tile.size, tile.startY + j * tile.size, tile.size, tile.size);
    }
  }
}

function drawAvail() {
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      if (availMoves[i][j] > 0) {
        fill(10, 255, 20, 60);
        rect(tile.startX + i * tile.size, tile.startY + j * tile.size, tile.size, tile.size);
      }
    }
  }
  fill(255, 255, 0, 60);
  if (chosen.i >= 0 && chosen.j >= 0)
    rect(tile.startX + chosen.i * tile.size, tile.startY + chosen.j * tile.size, tile.size, tile.size);
}

function drawCheckers() {
  for (let i = 0; i < tile.amount; i++) {
    for (let j = 0; j < tile.amount; j++) {
      drawChecker(i, j, c[i][j]);
    }
  }
}

function drawChecker(i, j, n) {
  if(n !== 0)
    image(textures[n], tile.startX + i * tile.size, tile.startY + j * tile.size, tile.size, tile.size);
}