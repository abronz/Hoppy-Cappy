import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hoppy-Cappy';
}

// game container
let gameContainer : HTMLDivElement;

// board
let board : HTMLCanvasElement;
let context : CanvasRenderingContext2D;
const boardInitWidth = 750;
let boardWidth;
let boardHeight;

//dino
let dinoWidth;
let dinoHeight;
let dinoX;
let dinoY;
let dinoImg;

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
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
let score;


window.onload = function() {
  initializeWorld();
  requestAnimationFrame(update);
  setInterval(placeCactus, 1000); //1000 milliseconds = 1 second
  document.addEventListener("keydown", moveDino);
  document.addEventListener("touchstart", moveDino);
}


function initializeWorld() {
  gameContainer = <HTMLDivElement>document.getElementById("gameContainer")
  board = <HTMLCanvasElement>document.getElementById("board")
  context = <CanvasRenderingContext2D>board.getContext("2d");  // used for drawing on the board
  gameOver = false;
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
  velocityY = 4*perc;
  gravity = .2*perc;
}


function initializeBoard(perc) {
  boardWidth = 750*perc;
  boardHeight = 250*perc;
  board.height = boardHeight;
  board.width = boardWidth;
}


function initializePlayer(perc) {
  dinoWidth = 88*perc;
  dinoHeight = 94*perc;
  dinoX = 50*perc;
  dinoY = (boardHeight - dinoHeight);
  dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

  dinoImg = new Image();
  dinoImg.src = "../assets/img/dino.png";
  dinoImg.onload = function() {
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
  }
}


function initializeProps(perc) {
  cactusArray = [];
  cactus1Width = 34*perc;
  cactus2Width = 69*perc;
  cactus3Width = 102*perc;
  cactusHeight = 70*perc;
  cactusX = 700*perc;
  cactusY = (boardHeight - cactusHeight);

  cactus1Img = new Image();
  cactus1Img.src = "../assets/img/cactus1.png";

  cactus2Img = new Image();
  cactus2Img.src = "../assets/img/cactus2.png";

  cactus3Img = new Image();
  cactus3Img.src = "../assets/img/cactus3.png";
}


function update() {
  requestAnimationFrame(update);

  if (!gameOver) {
    context.clearRect(0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //apply gravity to current dino.y, making sure it doesn't exceed the ground
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
      let cactus = cactusArray[i];
      cactus.x += velocityX;
      context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

      if (detectCollision(dino, cactus)) {
        gameOver = true;
        dinoImg.src = "../assets/img/dino-dead.png";
        dinoImg.onload = function() {
          context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        }
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

    if (placeCactusChance > .90) { //10% you get cactus3
      cactus.img = cactus3Img;
      cactus.width = cactus3Width;
      cactusArray.push(cactus);
    } else if (placeCactusChance > .70) { //30% you get cactus2
      cactus.img = cactus2Img;
      cactus.width = cactus2Width;

      cactusArray.push(cactus);
    } else if (placeCactusChance > .50) { //50% you get cactus1
      cactus.img = cactus1Img;
      cactus.width = cactus1Width;
      cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function moveDino(e) {
  if (((e as KeyboardEvent && (e.code == "Space" || e.code == "ArrowUp")) || e as TouchEvent)) {
    if (!gameOver && dino.y == dinoY) {
        let percentage = gameContainer.clientWidth/boardInitWidth;
        if (percentage > 1) percentage = 1;

        //jump
        velocityY = -10*percentage;
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
