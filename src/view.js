window.onload = function () {
  let view = new View();
  view.createGame();

  let model = new Model(view);
  model.resetModel();
  view.setModel(model);

  let controller = new Controller(view, model);
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
  this.startColor = "732AE8";

  this.canvas = null;
  this.ctx = null;
  this.generationCounter = null;
  this.populationCounter = null;
  this.colorInput = null;

  this.model = null;

  this.setModel = function (model) {
    this.model = model;
  }

  /* create date from timestamp */
  this.getDate = function (time) {
    let date = new Date(time);
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    let hh = date.getHours();
    let mi = date.getMinutes();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (mi < 10) mi = '0' + mi;

    return dd + '/' + mm + '/' + yyyy + " - " + hh + ":" + mi;
  }

  /* create the user interface */
  this.createGame = function () {
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
      "<button>Reset &amp clear history</button>" +
      "<select id='select-pattern'>" +
      "<option disabled selected hidden>Choose pattern...</option>" +
      "<option value='0000000000000000000000001/0000000000000000000000101/000000000000110000001100000000000011/" +
                     "000000000001000100001100000000000011/1100000000100000100011/1100000000100010110000101/" +
                     "0000000000100000100000001/0000000000010001/00000000000011'>Gosper Glider Gun</option>" +
      "<option value='00000001/000001011/00000101/000001/0001/0101'>Block-laying switch engine</option>" +
      "<option value='01001/1/10001/1111'>Lightweight spaceship</option>" +
      "<option value='0001/010001/1/100001/111110'>Middleweight spaceship</option>" +
      "<option value='00011/0100001/1/1000001/111111'>Heavyweight spaceship</option>" +
      "<option value='01001/1/10001/1111/0/0/0/0001/010001/1/100001/111110/0/0/0/00011/0100001/1/1000001/111111'>Comparing spaceships</option>" +
      "<option value='011/11/01'>F-Pentomino (1103 steps)</option>" +
      "</select>" +
      "</div>" +
      "<div id='controls2'>" +
      "<span>Grid size [2-50]:</span>" +
      "<input type=number min='2' max='50' value='" + this.fieldSize + "' id='input-fieldSize'>" +
      "<span id='color-input-text'>Color:</span><input id='color-input' class='jscolor' value=" +
          (this.colorInput !== null ? ("'" + this.colorInput.value + "'>") : ("'" + this.startColor + "'>")) +
      "<span class='text'>Generation: </span>" +
      "<span id='generation-counter'>0</span>" +
      "<span class='text'>Population: </span>" +
      "<span id='population-counter'>0</span>" +
      "</div>" +
      "<canvas id='game-field-bg' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>" +
      "<canvas id='game-field' width='" + this.gameWidth + "' height='" + this.gameHeight + "'></canvas>";

    let saveCtr = localStorage.getItem("saveCtr");
    if (saveCtr) {
      for (let i = 1; i <= parseInt(saveCtr); i++) {
        let val = localStorage.getItem("save" + i);
        let opt = document.createElement("option");
        opt.value = val;
        opt.innerHTML = this.getDate(parseInt(localStorage.getItem("save" + i + "-date")));
        document.getElementById("select-pattern").appendChild(opt);
      }
    }

    document.getElementById("controls").setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px;");
    document.getElementById("controls2").setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px;");

    this.generationCounter = document.getElementById("generation-counter");
    this.populationCounter = document.getElementById("population-counter");

    this.canvas = document.getElementById("game-field");
    this.canvas.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + (this.yMargin + 45) + "px;");

    this.canvasBG = document.getElementById("game-field-bg");
    this.canvasBG.setAttribute("style", "left:" + this.xMargin + "px; right: " + this.xMargin + "px; top:" + (this.yMargin + 45) + "px;");

    this.ctx = this.canvas.getContext("2d");
    this.ctxBG = this.canvasBG.getContext("2d");

    this.ctxBG.strokeStyle = "#888";

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

    this.colorInput = document.getElementById("color-input");
    jsc.init(); // call init function of _jscolor.js
  }

  /* paint the current model to the field */
  this.repaint = function () {
    this.ctx.fillStyle = "#" + this.colorInput.value;
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

  this.updateCounter = function (active) {
    this.generationCounter.innerHTML = this.model.generation;
    this.populationCounter.innerHTML = active;
  }

  /* update selectbox with new pattern that was saved */
  this.addPatternToHistory = function () {
    let saveCtr = localStorage.getItem("saveCtr");
    if (saveCtr) {
      let val = localStorage.getItem("save" + saveCtr);
      let opt = document.createElement("option");
      opt.value = val;
      opt.innerHTML = this.getDate(parseInt(localStorage.getItem("save" + saveCtr + "-date")));
      document.getElementById("select-pattern").appendChild(opt);
    }
  }
}

