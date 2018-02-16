function Controller(view, model) {
  this.view = view;
  this.model = model;
  this.mouseDown = false;
  this.interval = null;
  this.patternSelected = false;

  this.addListener = function(){
    this.view.canvas.addEventListener('mousemove', (e) => {
      if(this.mouseDown) {
        this.patternSelected = false;
        this.model.activateBox(e.offsetX, e.offsetY);
        this.view.repaint();
      }
    });

    this.view.canvas.addEventListener('click', (e) => {
      this.patternSelected = false;
      this.model.activateBox(e.offsetX, e.offsetY);
      this.view.repaint();
    });

    this.view.canvas.addEventListener('mousedown', () => this.mouseDown = true);
    this.view.canvas.addEventListener('mouseup', () => this.mouseDown = false);
    document.body.addEventListener('mouseup', () => this.mouseDown = false);

    document.getElementsByTagName("button")[0].onclick = () => this.startLoop();
    document.getElementsByTagName("button")[1].onclick = () => this.evolve();
    document.getElementsByTagName("button")[2].onclick = () => this.pauseLoop();
    document.getElementsByTagName("button")[3].onclick = () => this.resetGame();
    document.getElementsByTagName("button")[4].onclick = () => this.clearHistory();

    let fieldSize = document.getElementById("input-fieldSize");
    fieldSize.onchange = function() {
      if (fieldSize.value > 1 && fieldSize.value < 100) {
        this.view.fieldSize = fieldSize.value;
        this.resetGame();
      }
    }.bind(this);

    let pattern = document.getElementById("select-pattern");
    pattern.onchange = function() {
      this.loadPattern(pattern.value.split("/"));
    }.bind(this);
  }

  this.resetGame = function() {
    this.patternSelected = false;
    this.pauseLoop();
    this.view.createGame();
    this.model.resetModel();
    this.addListener();
  }

  this.startLoop = function() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.evolve();
      }, 50);
    }
  }

  this.pauseLoop = function() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  this.clearHistory = function() {
    localStorage.clear();
    this.resetGame();
  }

  this.loadPattern = function(rows) {
    this.resetGame();
    this.patternSelected = true;

    let n = 0;
    rows.forEach((r) => {
      if (r.length > n)
        n = r.length;
    })

    if (this.view.columns >= n && this.view.rows >= rows.length) {
      let startX = Math.round((this.view.columns - n) / 2);
      let startY = Math.round((this.view.rows - rows.length) / 2);
      for (let e = 0; e < rows.length; e++) {
        for (let i = 0; i < rows[e].length; i++) {
          if (rows[e].charAt(i) === "1") {
            this.model.activateBox((startX + i) * this.view.fieldSize, (startY + e) * this.view.fieldSize);
          }
        }
      }
      this.view.repaint();
    }
  }

  this.saveInputPattern = function() {
    let input = [];

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        let add;
        this.model.gameArray[x][y] === 1 ? add = "1" : add = "0";
        if (input[y]) {
          input[y] += add;
        } else {
          input[y] = add;
        }
      }
    }

    // remove leading "0" from input array
    while (input.every((i) => i.charAt(0) === "0")) {
      for (let i = 0; i < input.length; i++){
        input[i] = input[i].substring(1, input[i].length);
      }
    }

    // remove trailing "0" from input array
    let highestLastIndex = 0;
    for (let i = 0; i < input.length; i++){
      let lastIndex = input[i].lastIndexOf("1");
      if (lastIndex > highestLastIndex)
        highestLastIndex = lastIndex;
    }
    for (let i = 0; i < input.length; i++) {
      input[i] = input[i].substring(0, highestLastIndex + 1);
    }

    // remove leading empty rows
    let firstRelevantRow = 0;
    for (let i = 0; i < input.length; i++){
      if (input[i].indexOf("1") > -1) {
        firstRelevantRow = i;
        break;
      }
    }

    // remove trailing empty rows
    let lastRelevantRow = 0;
    for (let i = input.length-1; i > 0; i--){
      if (input[i].indexOf("1") > -1) {
        lastRelevantRow = i;
        break;
      }
    }

    input = input.slice(firstRelevantRow, lastRelevantRow+1);
    input = input.join("/");

    let nr = localStorage.getItem("saveCtr");
    if (!nr) {
      localStorage.setItem("saveCtr", 1);
      localStorage.setItem("save1", input);
      localStorage.setItem("save1-date", Date.now());
    } else {
      localStorage.setItem("saveCtr", parseInt(nr) + 1);
      localStorage.setItem("save" + (parseInt(nr) + 1), input);
      localStorage.setItem("save" + (parseInt(nr) + 1) + "-date", Date.now());
    }
  }

  this.evolve = function() {
    if (this.model.generation === 0 && this.patternSelected === false) {
      this.saveInputPattern();
    }

    let gameArrayClone = new Array(this.view.columns);
    for (let i = 0; i < this.view.columns; i++) {
      gameArrayClone[i] = new Array(this.view.rows);
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        gameArrayClone[x][y] = this.model.gameArray[x][y];
      }
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {

        let n = 0;
        let xm, xp, ym, yp;

        if (x === 0) {
          xm = this.view.columns - 1;
          xp = x + 1;
        }
        else if (x === this.view.columns - 1) {
          xm = x - 1;
          xp = 0;
        }
        else {
          xm = x - 1;
          xp = x + 1;
        }

        if (y === 0) {
          ym = this.view.rows - 1;
          yp = y + 1;
        }
        else if (y === this.view.rows - 1) {
          ym = y - 1;
          yp = 0;
        }
        else {
          ym = y - 1;
          yp = y + 1;
        }

        if (this.model.gameArray[xm][ym] === 1) n++;
        if (this.model.gameArray[x][ym] === 1) n++;
        if (this.model.gameArray[xp][ym] === 1) n++;
        if (this.model.gameArray[xp][y] === 1) n++;
        if (this.model.gameArray[xp][yp] === 1) n++;
        if (this.model.gameArray[x][yp] === 1) n++;
        if (this.model.gameArray[xm][yp] === 1) n++;
        if (this.model.gameArray[xm][y] === 1) n++;

        if (this.model.gameArray[x][y] === 1) {
          if (n < 2 || n > 3) {
            gameArrayClone[x][y] = 0;
          }
        }

        if (this.model.gameArray[x][y] === 0) {
          if (n === 3) {
            gameArrayClone[x][y] = 1;
          }
        }
      }
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        this.model.gameArray[x][y] = gameArrayClone[x][y];
      }
    }

    this.model.generation++;
    this.view.repaint();
  }
}

