function Controller(view, model) {
  this.view = view;
  this.model = model;
  this.mouseDown = false;

  this.view.canvas.addEventListener('mousemove',
    (e) => {
      if(this.mouseDown) {
        this.model.activateBox(e.offsetX, e.offsetY);
        this.view.repaint();
      }
    }
  );

  this.view.canvas.addEventListener('click', (e) => {
    this.model.activateBox(e.offsetX, e.offsetY);
    this.view.repaint();
  });

  this.view.canvas.addEventListener('mousedown', () => this.mouseDown = true);
  this.view.canvas.addEventListener('mouseup', () => this.mouseDown = false);
  document.body.addEventListener('mouseup', () => this.mouseDown = false);

  document.body.addEventListener('keydown', (e) => {if (e.key === "g") this.startLoop()});
  document.body.addEventListener('keydown', (e) => {if (e.key === "s") this.endLoop()});

  this.startLoop = function() {
    this.interval = setInterval(() => {
      this.evolve();
    }, 50);
  }

  this.endLoop = function() {
    clearInterval(this.interval);
  }

  this.evolve = function() {
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

    this.view.repaint();
  }
}

