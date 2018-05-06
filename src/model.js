function Model(view) {
  this.view = view;
  this.gameArray = [];
  this.generation = 0;

  /* reset and initialize model */
  this.resetModel = function () {
    this.generation = 0;
    this.gameArray = new Array(this.view.columns);

    for (let i = 0; i < this.view.columns; i++) {
      this.gameArray[i] = new Array(this.view.rows);
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        this.gameArray[x][y] = 0;
      }
    }
  }

  /* activate a box in the game array */
  this.activateBox = function (x, y) {
    let posX = (x - x % this.view.fieldSize) / this.view.fieldSize;
    let posY = (y - y % this.view.fieldSize) / this.view.fieldSize;
    this.gameArray[posX][posY] = 1;
  }

  /* evolve population to the next generation */
  this.evolve = function () {
    let gameArrayClone = new Array(this.view.columns);
    for (let i = 0; i < this.view.columns; i++) {
      gameArrayClone[i] = new Array(this.view.rows);
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        gameArrayClone[x][y] = this.gameArray[x][y];
      }
    }

    /* xm = xMinus, xp = xPlus, ym = yMinus, yp = yPlus */
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

        if (this.gameArray[xm][ym] === 1) n++;
        if (this.gameArray[x][ym] === 1) n++;
        if (this.gameArray[xp][ym] === 1) n++;
        if (this.gameArray[xp][y] === 1) n++;
        if (this.gameArray[xp][yp] === 1) n++;
        if (this.gameArray[x][yp] === 1) n++;
        if (this.gameArray[xm][yp] === 1) n++;
        if (this.gameArray[xm][y] === 1) n++;

        if (this.gameArray[x][y] === 1) {
          if (n < 2 || n > 3) {
            gameArrayClone[x][y] = 0;
          }
        }

        if (this.gameArray[x][y] === 0) {
          if (n === 3) {
            gameArrayClone[x][y] = 1;
          }
        }
      }
    }

    for (let x = 0; x < this.view.columns; x++) {
      for (let y = 0; y < this.view.rows; y++) {
        this.gameArray[x][y] = gameArrayClone[x][y];
      }
    }

    this.generation++;
    this.view.repaint();
  }
}