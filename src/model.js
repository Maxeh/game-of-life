function Model(view) {
  this.view = view;
  this.gameArray = new Array(this.view.columns);

  for (let i = 0; i < this.view.columns; i++) {
    this.gameArray[i] = new Array(this.view.rows);
  }

  for (let x = 0; x < this.view.columns; x++) {
    for (let y = 0; y < this.view.rows; y++) {
      this.gameArray[x][y] = 0;
    }
  }

  this.activateBox = function(x, y) {
    let posX = (x - x % this.view.fieldSize) / this.view.fieldSize;
    let posY = (y - y % this.view.fieldSize) / this.view.fieldSize;
    this.gameArray[posX][posY] = 1;
  }
}