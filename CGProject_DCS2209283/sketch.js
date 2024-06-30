fetch('ball.txt')
  .then(response => response.text())
  .then(data => { var basketball = data; })
  .catch(error => console.error('Error fetching the file:', error));

var score = 0;
var w = window.innerWidth;
var h = window.innerHeight;
var total = 2;
const GROUND_HEIGHT = h - 100; // 假设玩家的初始位置是距离底部100像素
var playerMovement = { left: false, right: false };

function preload() {
  hitSound = loadSound('backboard.mp3');
  scoreSound = loadSound('score.mp3');
}

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
var playerBody = Bodies.rectangle(w / 2, h - 100, 50, 100, {
  isStatic: true,
  render: {
    fillStyle: 'blue'
  },
});

var playerHead = Bodies.circle(w / 2, h - 160, 30, {
  isStatic: true,
  render: {
    fillStyle: 'darkblue'  // 或者您想要的任何颜色
  },
});

var player = Body.create({
  parts: [playerBody, playerHead],
  isStatic: true
});

var isJumping = false;
var jumpHeight = 0;
var maxJumpHeight = 100; // 最大跳跃高度

World.add(engine.world, player);

var heldBall = null;

function movePlayer() {
  var velocity = { x: 0, y: 0 };
  if (playerMovement.left) velocity.x -= 5;
  if (playerMovement.right) velocity.x += 5;
  
  Body.setPosition(player, {
    x: player.position.x + velocity.x,
    y: GROUND_HEIGHT - jumpHeight
  });

  if (heldBall) {
    Body.setPosition(heldBall, {
      x: player.position.x,
      y: GROUND_HEIGHT - 60 - jumpHeight
    });
  }
}

function jump() {
  if (!isJumping) {
    isJumping = true;
    var jumpInterval = setInterval(function() {
      if (jumpHeight < maxJumpHeight) {
        jumpHeight += 5;
        Body.setPosition(player, {
          x: player.position.x,
          y: player.position.y - 5
        });
        if (heldBall) {
          Body.setPosition(heldBall, {
            x: heldBall.position.x,
            y: heldBall.position.y - 5
          });
        }
      } else {
        clearInterval(jumpInterval);
        fall();
      }
    }, 20);
  }
}

function fall() {
  var fallInterval = setInterval(function() {
    if (jumpHeight > 0) {
      jumpHeight -= 5;
      let newY = Math.min(player.position.y + 5, GROUND_HEIGHT);
      Body.setPosition(player, {
        x: player.position.x,
        y: newY
      });
      if (heldBall) {
        Body.setPosition(heldBall, {
          x: heldBall.position.x,
          y: newY - 60
        });
      }
    } else {
      clearInterval(fallInterval);
      isJumping = false;
      Body.setPosition(player, {
        x: player.position.x,
        y: GROUND_HEIGHT
      });
    }
  }, 20);
}

// Grab nearest ball
function grabNearestBall() {
  if (heldBall) return;

  var nearestBall = null;
  var minDistance = Infinity;

  for (var i = 0; i < balls.length; i++) {
    var distance = Matter.Vector.magnitude(
      Matter.Vector.sub(player.position, balls[i].position)
    );
    if (distance < minDistance && distance < 100) {
      minDistance = distance;
      nearestBall = balls[i];
    }
  }

  if (nearestBall) {
    heldBall = nearestBall;
    Body.setStatic(heldBall, true);
    Body.setPosition(heldBall, {
      x: player.position.x,
      y: player.position.y - 60
    });
  }
}

// Shoot ball
function shootBall() {
  if (!heldBall) return;
  Body.setStatic(heldBall, false);

  var basketX = w - 90; // 假设篮筐在右边，使用 rim1 的 x 坐标
  var distanceToBasket = basketX - player.position.x;

  var horizontalVelocity = 5 + distanceToBasket / 100;
  var verticalVelocity = -15 - jumpHeight / 10;

  verticalVelocity += jumpHeight / 20;

  horizontalVelocity = Math.min(horizontalVelocity, 20);

  var shootVelocity = { 
    x: horizontalVelocity, 
    y: verticalVelocity 
  };

  Body.setVelocity(heldBall, shootVelocity);
  heldBall = null;
}

function updateScore() {
  document.getElementById('scoreboard').innerText = "Score: " + score;
  console.log("Score updated: " + score); // 添加调试输出
}

// Mouse control for grabbing ball
document.addEventListener('mousedown', function(event) {
  grabNearestBall();
});

// Keyboard control
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A key
      playerMovement.left = true;
      break;
    case 68: // D key
      playerMovement.right = true;
      break;
    case 83: // S key
      jump();
      break;
    case 32: // Space key
      if (heldBall) {
        shootBall();
      } else {
        grabNearestBall();
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
  }
});

Events.on(engine, 'afterUpdate', function() {
  movePlayer();
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    if (ball.position.y > basketBottom1.position.y - 10 && ball.position.y < basketBottom1.position.y + 10) {
      if (ball.position.x > basketBottom1.position.x - 70 && ball.position.x < basketBottom1.position.x + 70) {
        score += 1;
        updateScore();
        console.log("Ball entered basket!"); // 添加调试输出
        playScoreSound();
        Body.setPosition(ball, { x: w / 2, y: h / 2 });
        Body.setVelocity(ball, { x: 0, y: 0 });
      }
    }
  }
});

let hitSound, scoreSound;

function preload() {
  hitSound = loadSound('backboard.mp3');
  scoreSound = loadSound('score.mp3');
}

function playHitSound() {
  hitSound.play();
}

function playScoreSound() {
  scoreSound.play();
}

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];

    if (pair.bodyA === rim1 || pair.bodyA === rim2 || pair.bodyA === rim3 || pair.bodyA === rim4 ||
        pair.bodyB === rim1 || pair.bodyB === rim2 || pair.bodyB === rim3 || pair.bodyB === rim4) {
      playHitSound();
    }
  }
});

Engine.run(engine);
Render.run(render);
