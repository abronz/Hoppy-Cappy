import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  title = 'Hoppy-Cappy';

  onClickPause() {
    toggleGame();
  }

  onClickPlay() {
    startGame();
  }
}


// Containers
let boardOutContainer : HTMLDivElement;
let boardContainer : HTMLDivElement;;
let titleContainer: HTMLDivElement;
let context : CanvasRenderingContext2D;


// Board
let board : HTMLCanvasElement;
let boardMaxWidth;
let boardWidth;
let boardHeight;


// Controls
let controls :HTMLDivElement;


// Cappy
let cappyWidth;
let cappyHeight;
let cappyX;
let cappyY;
let cappyRunImg;
let cappy = {
  x : cappyX,
  y : cappyY,
  width : cappyWidth,
  height : cappyHeight
}


// Cactus
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


// Ground
let groundWidth;
let groundHeight;
let groundX;
let groundY;
let groundImg;


// Physics
let velocityX; // cactus moving left speed
let velocityY;
let gravity;


// Animations
let cappyRunFrameRow = 0;
const cappyRunMaxRow = 1;
const cappyRunMinRow = 0;
let gameFrame = 0;
const staggerFrames = 20;


// Others
let gameOver;
let gamePause;
let score;


// Initialize World
function initializeWorld() {
  boardOutContainer = <HTMLDivElement>document.getElementById("boardOutContainer");
  boardContainer = <HTMLDivElement>document.getElementById("boardContainer")
  titleContainer = <HTMLDivElement>document.getElementById("titleContainer")
  controls = <HTMLDivElement>document.getElementById("controls")
  board = <HTMLCanvasElement>document.getElementById("board")
  context = <CanvasRenderingContext2D>board.getContext("2d");  // used for drawing on the board
  gameOver = false;
  gamePause = true;
  score = 0;

  updateVisibles();
  initializeEngine();
  initializeBoard();
  initializePlayer();
  initializeProps();
}


// Initialize Engine
function initializeEngine() {
  velocityX = -2; //cactus moving left speed
  velocityY = 5;
  gravity = .15;
}


// Initialize Board
function initializeBoard() {
  boardMaxWidth = 850;
  let totalMargin = 10;
  let currentClientWidth = boardOutContainer.clientWidth;
  boardWidth = currentClientWidth > boardMaxWidth ? boardMaxWidth : currentClientWidth - totalMargin;
  boardHeight = 400;
  board.height = boardHeight;
  board.width = boardWidth;

  // Resize boardContainer to board size.
  boardContainer.setAttribute("style", "width:" + boardWidth + "px");
}


// Initialize Player
function initializePlayer() {
  cappyWidth = 32;
  cappyHeight = 32;
  cappyX = 25;
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


// Initialize Props/Items/Cactus
function initializeProps() {
  // Ground
  groundHeight = 10;
  groundWidth = 850;
  groundX = 0;
  groundY = (boardHeight - groundHeight);

  groundImg = new Image();
  groundImg.src = "../assets/img/ground.png";
  groundImg.onload = function() {
    drawGround();
  }

  // Cactus
  cactusArray = [];
  cactus1Width = 38;
  cactus2Width = 64;
  cactus3Width = 80;
  cactusHeight = 64*1.5 ;
  cactusX = boardWidth;
  cactusY = (boardHeight - cactusHeight) + 15 - groundHeight;

  cactus1Img = new Image();
  cactus1Img.src = "../assets/img/cactus1.png";

  cactus2Img = new Image();
  cactus2Img.src = "../assets/img/cactus2.png";

  cactus3Img = new Image();
  cactus3Img.src = "../assets/img/cactus3.png";
}


// Main
window.onload = function() {
  initializeWorld();
  requestAnimationFrame(update);
  setInterval(placeCactus, 1000); //1000 milliseconds = 1 second
  document.addEventListener("keydown", moveCappy);
  document.addEventListener("touchstart", moveCappy);
}


// Update. Anmimations.
function update() {
  if (!gameOver && !gamePause) {
    requestAnimationFrame(update);
    // Clear
    context.clearRect(0, 0, board.width, board.height);

    // Cappy
    velocityY += gravity;
    cappy.y = Math.min(cappy.y + velocityY, cappyY); // Apply gravity to current cappy.y, making sure it doesn't exceed the ground
    drawCappy("run");

    // Cactus
    drawCactus();

    // Ground:
    drawGround();

    // Score
    updateScore();
  }
}


// Update Score
function updateScore() {
  context.fillStyle="white";
  context.font = "20px 'Jersey 10', serif"
  score++;
  context.fillText(score.toString(), 5, 20);


  if (score == 1000) console.log("WON 1");
  if (score == 2000) console.log("WON 2");
  if (score == 3000) console.log("WON 3");
}


// Place Cactus
function placeCactus() {
  if (gameOver || gamePause) {
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

  let placeCactusChance = Math.random(); // 0 - 0.9999...

  if (placeCactusChance > .75) { //25% you get cactus3
    cactus.img = cactus3Img;
    cactus.width = cactus3Width;
    cactusArray.push(cactus);
  } else if (placeCactusChance > .50) { // 50% you get cactus2
    cactus.img = cactus2Img;
    cactus.width = cactus2Width;
    cactusArray.push(cactus);
  } else {
    cactus.img = cactus1Img;
    cactus.width = cactus1Width;
    cactusArray.push(cactus);
  }

  if (cactusArray.length > 5) {
      cactusArray.shift(); //remove the first element from the array so tat the array doesn't constantly grow
  }
}


// Move Player
function moveCappy(e) {
  if ((e as KeyboardEvent|| e as TouchEvent)) {
    if (e.type == "touchstart") {
      if (e.targetTouches[0].target.id != "board") return;
    } else if ((e.code != "Space" && e.code != "ArrowUp")) {
      return;
    }

    if (!gameOver && !gamePause && cappy.y == cappyY) {
        //jump
        velocityY = -6.5 +  (-0.5 * getZoomPercentage());
      }
    }
}


// Detect Any Collision
function detectCollision(a, b) {
  return a.x < b.x + (b.width*0.75) &&   //a's top left corner doesn't reach b's top right corner
          a.x + (a.width) > b.x &&   //a's top right corner passes b's top left corner
          a.y < b.y + (b.height) &&  //a's top left corner doesn't reach b's bottom left corner
          a.y + (a.height*0.5) > b.y;    //a's bottom left corner passes b's top left corner
}


// Update Menu Visiblity
function updateVisibles() {
  controls.hidden = !gamePause;
  titleContainer.hidden = controls.hidden;
}


// Reset Game
function resetGame() {
  // Clear all:
  context.clearRect(0, 0, board.width, board.height);
  for (let i = 0; i < cactusArray.length; i++) cactusArray.pop();
  initializeWorld();
}


// Toggle Game
function toggleGame() {
  gamePause = !gamePause;

  if (!gamePause) update();
}


// Try Start Game
function startGame() {
  if (gameOver) resetGame();
  gameOver = false;
  gamePause = false;
  updateVisibles();
  update();
}


// Try Stop Game
function stopGame() {
  gameOver = true;
  gamePause = true;
  updateVisibles();
  update();
}



// Draw Player
function drawCappy(key) {
  if (key == "run") {
    context.drawImage(cappyRunImg, cappy.width*cappyRunFrameRow, 0, cappy.width, cappy.height, cappy.x, cappy.y - groundHeight, cappy.width, cappy.height);
    if (gameFrame % staggerFrames == 0) {
      cappyRunFrameRow++;
      if (cappyRunFrameRow > cappyRunMaxRow) cappyRunFrameRow = cappyRunMinRow;
    }

    gameFrame++;
  }
}


function drawGround() {
  groundX += velocityX;
  context.drawImage(groundImg, groundX , groundY, groundWidth, groundHeight);
  context.drawImage(groundImg, groundX + groundWidth , groundY, groundWidth, groundHeight);
  if (groundX < 0 - groundWidth) groundX = 0;
}


function drawCactus() {
  for (let i = 0; i < cactusArray.length; i++) {
    let cactus = cactusArray[i];
    cactus.x += velocityX;
    context.drawImage(cactus.img, cactus.x , cactus.y, cactus.width, cactus.height);

    if (detectCollision(cappy, cactus)) {
      stopGame();
    }
  }
}


// Get Zoom Percentage
function getZoomPercentage() {
  let percentage = boardContainer.clientWidth/boardMaxWidth;
  if (percentage > 1) percentage = 1;
  return percentage;
}

