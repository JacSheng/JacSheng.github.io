fetch('ball.txt')
  .then(response => response.text())
  .then(data => { var basketball = data; })
  .catch(error => console.error('Error fetching the file:', error));

var w = window.innerWidth;
var h = window.innerHeight;
var total = 2;
const GROUND_HEIGHT = h - 100; // 假设玩家的初始位置是距离底部100像素
var playerMovement = { left: false, right: false };
var player2Movement = { left: false, right: false };
var leftBasket = { x: 120, y: h / 2, width: 140, height: 20 };
var rightBasket = { x: w - 120, y: h / 2, width: 140, height: 20 };


// Random Number generator
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Constraint = Matter.Constraint,
  Events = Matter.Events;

var engine = Engine.create();

var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h,
    wireframes: false,
    background: 'linear-gradient(#FFF8E1,#FFF8E1,#FFF8E1,#FFECB3 97% ,#FFCA28 97%)'
  }
});

var basketOptions = { isStatic: true, render: { fillStyle: 'darkorange', strokeStyle: 'black' } };
var netStyle = { render: { fillStyle: 'white', strokeStyle: 'black' } };

// Extra thick so the frame rate doesn't allow it to escape
//var topWall = Bodies.rectangle(w / 2, -200, w, 400, { isStatic: true });
var leftWall = Bodies.rectangle(-200, h / 2, 400, h, { isStatic: true });
var rightWall = Bodies.rectangle(w + 200, h / 2, 400, h, { isStatic: true });
var bottomWall = Bodies.rectangle(w / 2, h + 200, w, 400, { isStatic: true });

var rim1 = Bodies.circle(w - 120, (h / 2 - (h / 12)), h / 120, basketOptions);
var rim2 = Bodies.circle(120, (h / 2 - (h / 12)), h / 120, basketOptions);
var rim3 = Bodies.circle(w - 5, (h / 2 - (h / 12)), h / 120, basketOptions);
var rim4 = Bodies.circle(5, (h / 2 - (h / 12)), h / 120, basketOptions);
var basketBottom1 = Bodies.rectangle(w - 130, (h / 2), 140, 8, basketOptions);
var basketBottom2 = Bodies.rectangle(130, (h / 2), 140, 8, basketOptions);

// right front net
var net1 = Composites.stack((w - 115), (h / 2 - (h / 12)), 9, 1, 1, 0, function(x, y) {
  return Bodies.circle(x, y, 4, netStyle);
});
// left front net
var net2 = Composites.stack(125, (h / 2 - (h / 12)), 9, 1, 1, 0, function(x, y) {
  return Bodies.circle(x, y, 4, netStyle);
});
var net3 = Composites.stack((w - 5), (h / 2 - (h / 12)), 7, 1, 1, 0, function(x, y) {
  return Bodies.circle(x, y, 4, netStyle);
});
// left front net
var net4 = Composites.stack(5, (h / 2 - (h / 12)), 7, 1, 1, 0, function(x, y) {
  return Bodies.circle(x, y, 4, netStyle);
});

// chain(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options)
var chain = Composites.chain(net1, 0.5, 0, -0.5, 0, { stiffness: 1 });
Composite.add(net1, Constraint.create({
  bodyA: net1.bodies[0],
  pointB: { x: (w - 120), y: (h / 2 - (h / 12)) },
  stiffness: 0.95
}));

var chain2 = Composites.chain(net2, 0.5, 0, -0.5, 0, { stiffness: 1 });
Composite.add(net2, Constraint.create({
  bodyA: net2.bodies[0],
  pointB: { x: 120, y: (h / 2 - (h / 12)) },
  stiffness: 0.95
}));

var chain3 = Composites.chain(net3, 0.5, 0, -0.5, 0, { stiffness: 1 });
Composite.add(net3, Constraint.create({
  bodyA: net3.bodies[0],
  pointB: { x: (w - 5), y: (h / 2 - (h / 12)) },
  stiffness: 0.95
}));

var chain4 = Composites.chain(net4, 0.5, 0, -0.5, 0, { stiffness: 1 });
Composite.add(net4, Constraint.create({
  bodyA: net4.bodies[0],
  pointB: { x: 5, y: (h / 2 - (h / 12)) },
  stiffness: 0.95
}));

var balls = [];

for (var i = 0; i < total; ++i) {
  balls[i] = Bodies.circle(
    w / 2 + random(-20, 20),
    h / 2 + random(-20, 20),
    35,
    {
      friction: 0.05,
      frictionAir: 0.006,
      restitution: 0.9,
      render: {
        sprite: {
          texture: basketball,
          xScale: 0.75,
          yScale: 0.75
        }
      }
    }
  );
}

// Adds the walls to the world
World.add(engine.world, [
  //topWall,
  leftWall,
  rightWall,
  bottomWall,
  rim1,
  rim2,
  rim3,
  rim4,
  chain,
  chain2,
  chain3,
  chain4
]);

// Adds all the balls to the world
for (var i = 0; i < total; ++i) {
  World.add(engine.world, [balls[i]]);
}

// Add player
// 第一个玩家(蓝色)
var playerBody = Bodies.rectangle(w / 2, h - 100, 50, 100, {
  isStatic: true,
  render: {
    fillStyle: 'blue'
  },
});

var playerHead = Bodies.circle(w / 2, h - 160, 30, {
  isStatic: true,
  render: {
    fillStyle: 'darkblue'
  },
});

var player = Body.create({
  parts: [playerBody, playerHead],
  isStatic: true
});

// 第二个玩家(红色)
var player2Body = Bodies.rectangle(w / 2 + 100, h - 100, 50, 100, {
  isStatic: true,
  render: {
    fillStyle: 'red'
  },
});

var player2Head = Bodies.circle(w / 2 + 100, h - 160, 30, {
  isStatic: true,
  render: {
    fillStyle: 'darkred'
  },
});

var player2 = Body.create({
  parts: [player2Body, player2Head],
  isStatic: true
});

World.add(engine.world, [player, player2]);

var isJumping = [false, false];
var jumpHeight = [0, 0];
var maxJumpHeight = 100;
var heldBall = [null, null];

function movePlayer(player, movement) {
  var velocity = { x: 0, y: 0 };
  if (movement.left) velocity.x -= 5;
  if (movement.right) velocity.x += 5;
  
  var playerIndex = player === player2 ? 1 : 0;
  Body.setPosition(player, {
    x: player.position.x + velocity.x,
    y: GROUND_HEIGHT - jumpHeight[playerIndex]
  });

  if (heldBall[playerIndex]) {
    Body.setPosition(heldBall[playerIndex], {
      x: player.position.x,
      y: GROUND_HEIGHT - 60 - jumpHeight[playerIndex]
    });
  }
}

function jump(player) {
  var playerIndex = player === player2 ? 1 : 0;
  if (!isJumping[playerIndex]) {
    isJumping[playerIndex] = true;
    var jumpInterval = setInterval(function() {
      if (jumpHeight[playerIndex] < maxJumpHeight) {
        jumpHeight[playerIndex] += 5;
        Body.setPosition(player, {
          x: player.position.x,
          y: player.position.y - 5
        });
        if (heldBall[playerIndex]) {
          Body.setPosition(heldBall[playerIndex], {
            x: heldBall[playerIndex].position.x,
            y: heldBall[playerIndex].position.y - 5
          });
        }
      } else {
        clearInterval(jumpInterval);
        fall(player);
      }
    }, 20);
  }
}

function fall(player) {
  var playerIndex = player === player2 ? 1 : 0;
  var fallInterval = setInterval(function() {
    if (jumpHeight[playerIndex] > 0) {
      jumpHeight[playerIndex] -= 5;
      let newY = Math.min(player.position.y + 5, GROUND_HEIGHT);
      Body.setPosition(player, {
        x: player.position.x,
        y: newY
      });
      if (heldBall[playerIndex]) {
        Body.setPosition(heldBall[playerIndex], {
          x: heldBall[playerIndex].position.x,
          y: newY - 60
        });
      }
    } else {
      clearInterval(fallInterval);
      isJumping[playerIndex] = false;
      Body.setPosition(player, {
        x: player.position.x,
        y: GROUND_HEIGHT
      });
    }
  }, 20);
}

function grabNearestBall(player) {
  var playerIndex = player === player2 ? 1 : 0;
  if (heldBall[playerIndex]) return;

  var nearestBall = null;
  var minDistance = Infinity;

  for (var i = 0; i < balls.length; i++) {
    if (balls[i].isStatic) continue; // 跳过已经被另一个玩家拿起的球
    var distance = Matter.Vector.magnitude(
      Matter.Vector.sub(player.position, balls[i].position)
    );
    if (distance < minDistance && distance < 100) {
      minDistance = distance;
      nearestBall = balls[i];
    }
  }

  if (nearestBall) {
    heldBall[playerIndex] = nearestBall;
    Body.setStatic(heldBall[playerIndex], true);
    Body.setPosition(heldBall[playerIndex], {
      x: player.position.x,
      y: player.position.y - 60
    });
  }
}

function shootBall(player) {
  var playerIndex = player === player2 ? 1 : 0;
  if (!heldBall[playerIndex]) return;
  Body.setStatic(heldBall[playerIndex], false);

  var basketX = player === player2 ? 90 : w - 90;
  var distanceToBasket = Math.abs(basketX - player.position.x);

  var horizontalVelocity = 5 + distanceToBasket / 100;
  var verticalVelocity = -15 - jumpHeight[playerIndex] / 10;

  verticalVelocity += jumpHeight[playerIndex] / 20;

  horizontalVelocity = Math.min(horizontalVelocity, 20);

  var shootVelocity = { 
    x: player === player2 ? -horizontalVelocity : horizontalVelocity, 
    y: verticalVelocity 
  };

  Body.setVelocity(heldBall[playerIndex], shootVelocity);
  heldBall[playerIndex] = null;
}

// Mouse control for grabbing ball
document.addEventListener('mousedown', function(event) {
  grabNearestBall();
});

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    // 玩家1控制
    case 65: // A key
      playerMovement.left = true;
      break;
    case 68: // D key
      playerMovement.right = true;
      break;
    case 83: // S key
      jump(player);
      break;
    case 32: // Space key
      if (heldBall[0]) {
        shootBall(player);
      } else {
        grabNearestBall(player);
      }
      break;
    // 玩家2控制
    case 74: // J key
      player2Movement.left = true;
      break;
    case 76: // L key
      player2Movement.right = true;
      break;
    case 75: // K key
      jump(player2);
      break;
    case 73: // I key
      if (heldBall[1]) {
        shootBall(player2);
      } else {
        grabNearestBall(player2);
      }
      break;
    default:
      return;  
  }
  event.preventDefault();
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A key
      playerMovement.left = false;
      break;
    case 68: // D key
      playerMovement.right = false;
      break;
    case 74: // J key
      player2Movement.left = false;
      break;
    case 76: // L key
      player2Movement.right = false;
      break;
  }
});

// Vsmode.js

let gameMode;
let gameTime = 60; // 1分钟
let player1Score = 0;
let player2Score = 0;
let startTime;

function initializeTwoPlayerMode(mode) {
    gameMode = mode;
    resetGame();
    startGame();
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    gameTime = 60;
    updateScoreboard();
    // 重置球的位置等
}

function startGame() {
  startTime = Date.now();
  gameInterval = setInterval(updateGame, 1000);
}

function updateGame() {
  let elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  gameTime = 60 - elapsedSeconds;
  document.getElementById('timer').textContent = `Time: ${gameTime}`;
  if (gameTime <= 0) {
      endGame();
  }
    // 检查所有球是否进入篮筐
    for (var i = 0; i < balls.length; i++) {
      checkBasket(balls[i]);
  }
}

function endGame() {
    clearInterval(gameInterval);
    // 显示获胜者
    let winner = player1Score > player2Score ? "Player 1" : "Player 2";
    alert(`Game Over! ${winner} wins!`);
    // 可以添加重新开始的选项
}

function scorePoint(player) {
    if (player === 1) {
        player1Score++;
    } else {
        player2Score++;
    }

    updateScoreboard();

    if (gameMode === 'firstToFive' && (player1Score >= 5 || player2Score >= 5)) {
        endGame();
    }
}

function updateScoreboard() {
  if (gameMode === 'firstToFive') {
      document.getElementById('player1Score').textContent = `P1: ${player1Score}/5`;
      document.getElementById('player2Score').textContent = `P2: ${player2Score}/5`;
  } else {
      document.getElementById('player1Score').textContent = `P1: ${player1Score}`;
      document.getElementById('player2Score').textContent = `P2: ${player2Score}`;
  }
}

function checkBasket(ball) {
  if (ball.position.y > leftBasket.y - leftBasket.height/2 && 
      ball.position.y < leftBasket.y + leftBasket.height/2) {
      if (ball.position.x > leftBasket.x - leftBasket.width/2 && 
          ball.position.x < leftBasket.x + leftBasket.width/2) {
          scorePoint(2);  // 左侧篮筐，玩家2得分
          resetBall(ball);
          playScoreSound();
      }
  }

  if (ball.position.y > rightBasket.y - rightBasket.height/2 && 
      ball.position.y < rightBasket.y + rightBasket.height/2) {
      if (ball.position.x > rightBasket.x - rightBasket.width/2 && 
          ball.position.x < rightBasket.x + rightBasket.width/2) {
          scorePoint(1);  // 右侧篮筐，玩家1得分
          resetBall(ball);
          playScoreSound();
      }
  }
}

// 添加重置球位置的函数
function resetBall(ball) {
  Body.setPosition(ball, { x: w / 2, y: h / 2 });
  Body.setVelocity(ball, { x: 0, y: 0 });
}

// 需要修改现有的碰撞检测逻辑，在球进入篮筐时调用 scorePoint 函数
Engine.run(engine);
Render.run(render);



// 在游戏循环中添加这个函数调用
Events.on(engine, 'afterUpdate', function() {
  movePlayer(player, playerMovement);
  movePlayer(player2, player2Movement);
  updateGame();
});