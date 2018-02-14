window.onload = function() {
  let view = new View();
  view.createGame();

  let model = new Model(view);
  view.setModel(model);

  let controller = new Controller(view, model);
}

function View() {
  this.fieldSize = 10;
  this.gameWidth = 0;
  this.gameHeight = 0;
  this.columns = 0;
  this.rows = 0;
  this.xMargin = 0;
  this.yMargin = 0;

  this.canvas = null;
  this.ctx = null;

  this.model = null;

  this.setModel = function(model){
    this.model = model;
  }

  this.createGame = function() {
    this.gameWidth = window.innerWidth - (this.fieldSize*5);
    this.gameWidth -= this.gameWidth % this.fieldSize;

    this.gameHeight = window.innerHeight - (this.fieldSize*5);
    this.gameHeight -= this.gameHeight % this.fieldSize;

    this.columns = Math.floor(this.gameWidth / this.fieldSize);
    this.rows = Math.floor(this.gameHeight / this.fieldSize);

    this.xMargin = Math.round((window.innerWidth - this.gameWidth) / 2);
    this.yMargin = Math.round((window.innerHeight - this.gameHeight) / 2);

    document.getElementsByTagName("body")[0].innerHTML =
      "<canvas id='game-field-bg' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>" +
      "<canvas id='game-field' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>";

    this.canvas = document.getElementById("game-field");
    this.canvas.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + this.yMargin);

    this.canvasBG = document.getElementById("game-field-bg");
    this.canvasBG.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px");
    this.canvasBG.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + this.yMargin);

    this.ctx = this.canvas.getContext("2d");
    this.ctxBG = this.canvasBG.getContext("2d");

    this.ctxBG.strokeStyle="#888";

    for (let i = 0; i < this.columns; i++) {
      this.ctxBG.moveTo(i * this.fieldSize + 0.5, 0);
      this.ctxBG.lineTo(i * this.fieldSize + 0.5, this.gameHeight);
      this.ctxBG.stroke();
    }

    for (let i = 0; i < this.rows; i++) {
      this.ctxBG.moveTo(0, i * this.fieldSize + 0.5);
      this.ctxBG.lineTo(this.gameWidth, i * this.fieldSize + 0.5);
      this.ctxBG.stroke();
    }
  }

  this.repaint = function() {
    this.ctx.fillStyle = "#E80C47";

    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (this.model.gameArray[x][y] === 1) {
          this.ctx.fillRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
        } else {
          this.ctx.clearRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
        }
      }
    }
  }
}

