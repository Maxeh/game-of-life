function Controller(view, model) {
  this.view = view;
  this.model = model;
  this.mouseDown = false;
  this.interval = null;
  this.patternSelected = false;

  /* set listeners for user interface elements */
  this.addListener = function () {
    /* activate boxes when mouse moves over the field and mouse is clicked */
    this.view.canvas.addEventListener('mousemove', (e) => {
      if (this.mouseDown) {
        this.patternSelected = false;
        this.model.activateBox(e.offsetX, e.offsetY);
        this.view.repaint();
      }
    });

    /* activate box when mouse clicks on it */
    this.view.canvas.addEventListener('click', (e) => {
      this.patternSelected = false;
      this.model.activateBox(e.offsetX, e.offsetY);
      this.view.repaint();
    });

    /* toggle mouseDown flag */
    this.view.canvas.addEventListener('mousedown', () => this.mouseDown = true);
    this.view.canvas.addEventListener('mouseup', () => this.mouseDown = false);
    document.body.addEventListener('mouseup', () => this.mouseDown = false);

    /* set listeners for buttons */
    document.getElementsByTagName("button")[0].onclick = () => this.startLoop();
    document.getElementsByTagName("button")[1].onclick = () => {this.saveInputPattern(); this.model.evolve()};
    document.getElementsByTagName("button")[2].onclick = () => this.pauseLoop();
    document.getElementsByTagName("button")[3].onclick = () => this.resetGame();
    document.getElementsByTagName("button")[4].onclick = () => this.clearHistory();

    /* update field when user changes field size */
    let fieldSize = document.getElementById("input-fieldSize");
    fieldSize.onchange = function () {
      if (fieldSize.value > 1 && fieldSize.value <= 50) {
        this.view.fieldSize = fieldSize.value;
        this.resetGame();
      }
    }.bind(this);

    /* load pattern when user selects a pattern in the selectbox */
    let pattern = document.getElementById("select-pattern");
    pattern.onchange = function () {
      this.loadPattern(pattern.value.split("/"));
    }.bind(this);
  }

  /* reset the game so that the user can start a new game */
  this.resetGame = function () {
    this.patternSelected = false;
    this.pauseLoop();
    this.view.createGame();
    this.model.resetModel();
    this.addListener();
  }

  /* start the game with an interval of 10ms */
  this.startLoop = function () {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.saveInputPattern();
        this.model.evolve();
     }, 10);
    }
  }

  /* pause the game by clearing the interval */
  this.pauseLoop = function () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /* clear the history and reset game */
  this.clearHistory = function () {
    localStorage.clear();
    this.resetGame();
  }

  /* update game field with a loaded pattern */
  this.loadPattern = function (rows) {
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

  /* save a pattern to the localStorage */
  this.saveInputPattern = function () {
    if (this.model.generation === 0 && this.patternSelected === false) {
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

      /* remove leading "0" from input array */
      while (input.every((i) => i.charAt(0) === "0")) {
        for (let i = 0; i < input.length; i++) {
          input[i] = input[i].substring(1, input[i].length);
        }
      }

      /* remove trailing "0" from input array */
      let highestLastIndex = 0;
      for (let i = 0; i < input.length; i++) {
        let lastIndex = input[i].lastIndexOf("1");
        if (lastIndex > highestLastIndex)
          highestLastIndex = lastIndex;
      }
      for (let i = 0; i < input.length; i++) {
        input[i] = input[i].substring(0, highestLastIndex + 1);
      }

      /* find first relevant row => not empty */
      let firstRelevantRow = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i].indexOf("1") > -1) {
          firstRelevantRow = i;
          break;
        }
      }

      /* find last relevant row => not empty */
      let lastRelevantRow = 0;
      for (let i = input.length - 1; i > 0; i--) {
        if (input[i].indexOf("1") > -1) {
          lastRelevantRow = i;
          break;
        }
      }

      /* remove leading and trailing empty rows */
      input = input.slice(firstRelevantRow, lastRelevantRow + 1);
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

      this.view.addPatternToHistory();
    }
  }
}

