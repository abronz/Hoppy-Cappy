import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hoppy-Cappy';

  onClickPause() {
    pauseGame();
  }
}

// game container
let gameContainer : HTMLDivElement;

// board
let board : HTMLCanvasElement;
let context : CanvasRenderingContext2D;
const boardInitWidth = 750;
let boardWidth;
let boardHeight;

// Cappy
let cappyWidth;
let cappyHeight;
let cappyX;
let cappyY;
let cappyRunImg;
const CAPPY_HEIGHT = 32;
const CAPPY_WIDTH = 64;

let cappy = {
  x : cappyX,
  y : cappyY,
  width : cappyWidth,
  height : cappyHeight
}

//cactus
let cactusArray;
let cactus1Width;
let cactus2Width;
let cactus3Width;
let cactusHeight;
let cactusX;
let cactusY;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//physics
let velocityX; // cactus moving left speed
let velocityY;
let gravity;

let gameOver;
let gamePause;
let score;


window.onload = function() {
  initializeWorld();
  requestAnimationFrame(update);
  setInterval(placeCactus, 1000); //1000 milliseconds = 1 second
  document.addEventListener("keydown", moveCappy);
  document.addEventListener("touchstart", moveCappy);
}


function initializeWorld() {
  gameContainer = <HTMLDivElement>document.getElementById("gameContainer")
  board = <HTMLCanvasElement>document.getElementById("board")
  context = <CanvasRenderingContext2D>board.getContext("2d");  // used for drawing on the board
  gameOver = false;
  gamePause = false
  score = 0;

  let percentage = gameContainer.clientWidth/boardInitWidth;
  if (percentage > 1) percentage = 1;

  initializeEngine(percentage);
  initializeBoard(percentage);
  initializePlayer(percentage);
  initializeProps(percentage);
}


function initializeEngine(perc) {
  velocityX = -4*perc; //cactus moving left speed
  velocityY = 5*perc;
  gravity = .25*perc;
}


function initializeBoard(perc) {
  boardWidth = 750*perc;
  boardHeight = 400;
  board.height = boardHeight;
  board.width = boardWidth;
}


function initializePlayer(perc) {
  cappyWidth = 32;
  cappyHeight = 32;
  cappyX = 50;
  cappyY = (boardHeight - cappyHeight);
  cappy = {
    x : cappyX,
    y : cappyY,
    width : cappyWidth,
    height : cappyHeight
  }

  cappyRunImg = new Image();
  cappyRunImg.src = "../assets/img/cappyRun.png";
  cappyRunImg.onload = function() {
    drawCappy("run");
  }
}


function initializeProps(perc) {
  cactusArray = [];
  cactus1Width = 64/2 + 64*perc;
  cactus2Width = 64/2 + 64*perc;
  cactus3Width = 64/2 + 64*perc;
  cactusHeight = 64/2 + 64*perc;
  cactusX = 700*perc;
  cactusY = (boardHeight - cactusHeight) + 15;

  cactus1Img = new Image();
  cactus1Img.src = "../assets/img/cactus1.png";

  cactus2Img = new Image();
  cactus2Img.src = "../assets/img/cactus1.png";

  cactus3Img = new Image();
  cactus3Img.src = "../assets/img/cactus1.png";
}


function update() {
  requestAnimationFrame(update);

  if (!gameOver && !gamePause) {
    context.clearRect(0, 0, board.width, board.height);

    // Cappy
    velocityY += gravity;
    cappy.y = Math.min(cappy.y + velocityY, cappyY); //apply gravity to current cappy.y, making sure it doesn't exceed the ground
    drawCappy("run");

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
      let cactus = cactusArray[i];
      cactus.x += velocityX;
      context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

      if (detectCollision(cappy, cactus)) {
        gameOver = true;
      }
    }

    // score
    context.fillStyle="black";
    context.font="20px courier";
    score++;
    context.fillText(score.toString(), 5, 20);
  }
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .75) { //25% you get cactus3
      cactus.img = cactus3Img;
      cactus.width = cactus3Width;
      cactusArray.push(cactus);
    } else if (placeCactusChance > .50) { //50% you get cactus2
      cactus.img = cactus2Img;
      cactus.width = cactus2Width;
      cactusArray.push(cactus);
    } else {
      cactus.img = cactus1Img;
      cactus.width = cactus1Width;
      cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function moveCappy(e) {
  if (((e as KeyboardEvent && (e.code == "Space" || e.code == "ArrowUp")) || e as TouchEvent)) {
    if (e.type == "touchstart") {
      if (e.targetTouches[0].target.id != "board") return;
    }

    if (!gameOver && !gamePause && cappy.y == cappyY) {
        let percentage = gameContainer.clientWidth/boardInitWidth;
        if (percentage > 1) percentage = 1;

        //jump
        velocityY = -12.5*percentage;
      } else if (gameOver) {
        resetGame();
      }
    }
}


function detectCollision(a, b) {
  return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
          a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
          a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
          a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}


function resetGame() {
  // Clear all:
  context.clearRect(0, 0, board.width, board.height);
  for (let i = 0; i < cactusArray.length; i++) cactusArray.pop();
  initializeWorld();
}


function pauseGame() {
  gamePause = !gamePause;
}


let cappyRunFrameRow = 0;
const cappyRunMaxRow = 1;
const cappyRunMinRow = 0;
let gameFrame = 0;
const staggerFrames = 20;

function drawCappy(key) {
  if (key == "run") {
    context.drawImage(cappyRunImg, cappy.width*cappyRunFrameRow, 0, cappy.width, cappy.height, cappy.x, cappy.y, cappy.width, cappy.height);
    if (gameFrame % staggerFrames == 0) {
      cappyRunFrameRow++;
      if (cappyRunFrameRow > cappyRunMaxRow) cappyRunFrameRow = cappyRunMinRow;
    }

    gameFrame++;
  }
}
