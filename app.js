//board
let board;
let boardWidth = 850;
let boardHeight = 280;
let context;

// Dino dimensions and position
let dinoWidth = 88;
let dinoHeight = 94;
let dinoBirdHeight = 50;
let dinoX = 50;
let dinoY = (boardHeight - dinoHeight) - 6;
let dinoBirdY = (boardHeight - dinoBirdHeight) - 6;

// Dino state
let dino = { 
    x: dinoX, 
    y: dinoY, 
    width: dinoWidth, 
    height: dinoHeight 
};
let isDuck= false;

// Dino images
let dinoRun1 = new Image(); 
dinoRun1.src = "./img/dino-run1.png";
let dinoRun2 = new Image(); 
dinoRun2.src = "./img/dino-run2.png";
let dinoJump = new Image(); 
dinoJump.src = "./img/dino.png";
let dinoDuck1 = new Image(); 
dinoDuck1.src = "./img/dino-duck1.png";
let dinoDuck2 = new Image(); 
dinoDuck2.src = "./img/dino-duck2.png";
let dinoDead = new Image(); 
dinoDead.src = "./img/dino-dead.png";

// Obstacle Images
let cactus1Img = new Image(); 
cactus1Img.src = "./img/cactus1.png";
let cactus2Img = new Image(); 
cactus2Img.src = "./img/cactus2.png";
let cactus3Img = new Image(); 
cactus3Img.src = "./img/cactus3.png";
let bird1Img = new Image(); 
bird1Img.src = "./img/bird1.png";
let bird2Img = new Image(); 
bird2Img.src = "./img/bird2.png";

// Obstacles
let obstacles = [];
let cactus1Width = 34, cactus2Width = 69, cactus3Width = 102;
let cactusHeight = 70;
let cactusY = (boardHeight - cactusHeight) - 6;
let birdWidth = 60, birdHeight = 45;
let birdY = (boardHeight - cactusHeight) - 50 ;

// Track and UI
let trackImg = new Image(); 
trackImg.src = "./img/track.png";
let gameOverImg = new Image(); 
gameOverImg.src = "./img/game-over.png";

let resetImg = new Image(); 
resetImg.src = "./img/reset.png";

let cloudImg=new Image();
cloudImg.src="./img/cloud.png";
let clouds = [];
let cloudWidth = 70;
let cloudHeight = 50;
let cloudYPositions = [30, 50, 70]; // Different heights for variety


// Physics
let velocityX = -8;
let velocityCloud=-1;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let frameCount = 0;

function resetGame() {
  gameOver = false;
  score = 0;
  velocityY = 0;
  isDuck = false;
  dino.y = dinoY;
  dino.height = dinoHeight;
  obstacles = [];
}

window.onload = function() {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");
  //It asks the <canvas> element for a 2D drawing context. This context is 
  // a JavaScript object with methods and properties to draw shapes, text, images, and handle pixel data.


  requestAnimationFrame(update);    //please call my update function right before the next repaint.
  setInterval(placeObstacle, 1100);
  setInterval(placeCloud, 2000);

  document.addEventListener('keydown', moveDino);
  document.addEventListener('keyup', releaseDino);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) return;

  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(trackImg, 5, boardHeight - 10, boardWidth - 5, 10);


  velocityY += gravity;
  dino.y = Math.min(dino.y + velocityY, isDuck ? dinoBirdY : dinoY);

  clouds.forEach((cloud, i) => {
    cloud.x += velocityCloud;
    context.drawImage(cloudImg, cloud.x, cloud.y, cloud.width, cloud.height);

    // Remove off-screen clouds
    if (cloud.x + cloud.width < 0) {
        clouds.splice(i, 1);
    }
  });


  frameCount++;
  let currentImg;
  if (dino.y < (isDuck ? dinoBirdY : dinoY)) {
    currentImg = dinoJump;
  } else if (isDuck){
    currentImg = (Math.floor(frameCount / 10) % 2 === 0) ? dinoDuck1 : dinoDuck2;
  } else { 
    currentImg = (Math.floor(frameCount / 10) % 2 === 0) ? dinoRun1 : dinoRun2;
  }
  context.drawImage(currentImg, dino.x, dino.y, dino.width, dino.height);

  obstacles.forEach((ob, i) => {
    ob.x += velocityX;
    if (ob.type === 'cactus') {
      context.drawImage(ob.img, ob.x, ob.y, ob.width, ob.height);
      if (detectCollision(dino, ob)) endGame();
    } else if (ob.type === 'bird') {
      let birdImg = (Math.floor(frameCount / 10) % 2 === 0) ? bird1Img : bird2Img;
      context.drawImage(birdImg, ob.x, ob.y, birdWidth, birdHeight);
      if (!isDuck && detectCollision(dino, { 
        x: ob.x, 
        y: ob.y, 
        width: birdWidth, 
        height: birdHeight 
    })) endGame();
    }
    if (ob.x + ob.width < 0) obstacles.splice(i, 1);
  });

  

  context.fillStyle = "black";
  context.font = "20px courier";
  score++;
  context.fillText(score, boardWidth - 70, 20);
}

function moveDino(e) {
  if (gameOver) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') resetGame();
    return;
  }
  if ((e.code === "Space" || e.code === "ArrowUp") && dino.y >= (isDuck ? dinoBirdY : dinoY)) {
    velocityY = -10;
    isDuck = false;
    dino.height = dinoHeight;
  } else if (e.code === "ArrowDown" && dino.y >= dinoY) {
    isDuck = true;
    dino.height = dinoBirdHeight;
    dino.y = dinoBirdY;
  }
}

function releaseDino(e) {
  if (e.code === "ArrowDown" && isDuck) {
    isDuck = false;
    dino.height = dinoHeight;
    dino.y = dinoY;
  }
}
function placeCloud() {
    if (gameOver) return;
    let r=Math.random();
    if(r<0.3) y=cloudYPositions[0];
    else if(r<0.6) y=cloudYPositions[1];
    else if(r<0.8) y=cloudYPositions[2];
    else y=boardHeight;
    // let y = cloudYPositions[Math.floor(Math.random() * cloudYPositions.length)];
    clouds.push({
        x: boardWidth,
        y: y,
        width: cloudWidth,
        height: cloudHeight
    });
}

function placeObstacle() {
  if (gameOver) return;
  let r = Math.random();
  if (r < 0.5) {
    // Cactus
    let cactus = null;
    if (r > 0.4){
        cactus = { 
            type: 'cactus', 
            img: cactus1Img, 
            x: boardWidth, 
            y: cactusY, 
            width: cactus1Width, 
            height: cactusHeight 
        };
    }
    else if (r > 0.2) {
        cactus = { 
            type: 'cactus', 
            img: cactus2Img, 
            x: boardWidth, 
            y: cactusY, 
            width: cactus2Width, 
            height: cactusHeight 
        };
    }
    else {
        cactus = { 
            type: 'cactus', 
            img: cactus3Img, 
            x: boardWidth, 
            y: cactusY, 
            width: cactus3Width, 
            height: cactusHeight 
        };
    }
    obstacles.push(cactus);
  } else {
    // Bird
    obstacles.push({ 
        type: 'bird', 
        x: boardWidth, 
        y: birdY, 
        width: birdWidth, 
        height: birdHeight 
    });
  }
}

function endGame() {
  gameOver = true;
  context.drawImage(dinoDead, dino.x, dino.y, dino.width, dino.height);
  context.drawImage(gameOverImg, 260, 100, 270, 30);
  context.drawImage(resetImg, 370, 140, 50, 40);
}

function detectCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}