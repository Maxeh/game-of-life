window.onload = function() {
  let view = new View();
  view.createGame();

  let model = new Model(view);
  model.resetModel();
  view.setModel(model);

  let controller = new Controller(view, model);
  view.setController(controller);
  controller.addListener();
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
  this.controller = null;

  this.setModel = function(model){
    this.model = model;
  }

  this.setController = function(controller){
    this.controller = controller;
  }

  this.createGame = function() {
    this.gameWidth = window.innerWidth - 40;
    this.gameWidth -= this.gameWidth % this.fieldSize;

    this.gameHeight = window.innerHeight - 40 - 80;
    this.gameHeight -= this.gameHeight % this.fieldSize;

    this.columns = Math.floor(this.gameWidth / this.fieldSize);
    this.rows = Math.floor(this.gameHeight / this.fieldSize);

    this.xMargin = Math.round((window.innerWidth - this.gameWidth) / 2);
    this.yMargin = Math.round((window.innerHeight - this.gameHeight) / 2);

    document.getElementsByTagName("body")[0].innerHTML =
      "<div id='controls'>" +
        "<button>Run</button>" +
        "<button>Next</button>" +
        "<button>Pause</button>" +
        "<button>Reset</button>" +
        "<select id='select-pattern'>" +
          "<option disabled selected hidden>Choose pattern...</option>" +
          "<option value='00000001/000001011/00000101/000001/0001/0101'>Pattern 1</option>" +
          "<option>zwei</option>" +
          "<option>hihi</option>" +
        "</select>" +
        "<span class='text'>Generation: </span>" +
        "<span id='generation-counter'>0</span>" +
        "<span class='text'>Population: </span>" +
        "<span id='population-counter'>0</span>" +
      "</div>" +
      "<div id='controls2'>" +
        "<span>Grid size [2-50]:<span>" +
        "<input type=number min='2' max='60' value='" + this.fieldSize + "' id='input-fieldSize'>" +
      "</div>" +

      "<canvas id='game-field-bg' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>" +
      "<canvas id='game-field' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>";

    document.getElementById("controls").setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px;");
    document.getElementById("controls2").setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px;");

    this.canvas = document.getElementById("game-field");
    this.canvas.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + (this.yMargin+45) + "px;");

    this.canvasBG = document.getElementById("game-field-bg");
    this.canvasBG.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + (this.yMargin+45) + "px;");

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
    let active = 0;

    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (this.model.gameArray[x][y] === 1) {
          active++;
          this.ctx.fillRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
        } else {
          this.ctx.clearRect(x * this.fieldSize, y * this.fieldSize, this.fieldSize, this.fieldSize);
        }
      }
    }

    this.updateCounter(active);
  }

  this.updateCounter = function(active) {
    document.getElementById("generation-counter").innerHTML = this.model.generation;
    document.getElementById("population-counter").innerHTML = active;
  }
}

