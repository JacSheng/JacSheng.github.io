let rectX = 0; // 初始化长方形的X坐标
let rect2 = 0; // 初始化长方形的X坐标
let rectSpeed = 7; // 初始化长方形的移动速度
let state = 'initial'; // 当前的状态
let lines = []; // 存储直线的位置
let lineSpeed = 5; // 直线的移动速度
let pauseStartTime = 0; // 记录暂停开始的时间
let lineMoveStartTime = 0; // 记录直线开始移动的时间
let lineX = 0; // animation3中从左向右移动的直线位置
let smallSquareX = 90; // 新的正方形的X坐标（初始化在右边缘中间）
let rotation = 0;
let targetRotation = 0;
let forceRotationReset = false;
let leftBallX = -90; // 左边小球的初始 X 坐标
let leftBallMoveSpeed = 3; 
let rightBallX = 215; // 右边小球的初始 X 坐标
let rightBallMoveSpeed = 5; // 蓝色小球移动速度
let scaleValue = 1;
let scaleAnimation = false;
let scaleTimer = 0;
let scaleDuration = 1000; // 缩放动画持续时间为1秒
let animation3ScaleTimer = 0; //记录animation3 缩放动画开始时间
let currentScaleValue = 1;

function setup() {
  createCanvas(1280, 720); 
}

function preload() {
  logo = loadImage('cic.jpg'); // 预加载图像 
}
function resetVariables() {
  rectX = 0;
  rect2 = 0;
  rectSpeed = 5;
  lineSpeed = 5;
  lines = [];
  lineX = 0;
  smallSquareX = 90;
  rotation = 0;
  targetRotation = 0;
  forceRotationReset = false;
  state = 'initial';
  leftBallX = -90;
  rightBallX = 215;
}


function draw() {
  background('black'); 
  image(logo, 475,10,90,90); 
  translate(width / 3, height / 3);

  // 根据当前状态更新目标旋转角度
  if (state === 'move') {
    targetRotation = PI / 90;
    if (!scaleAnimation) {
      scaleAnimation = true;
      scaleTimer = millis(); // 记录缩放动画开始时间
    }
  } else if (state === 'animation1') {
    targetRotation = -PI / 90;
    if (!scaleAnimation) {
      scaleAnimation = true; // 在 animation1 状态下也启动缩放动画
    }
  } else {
    targetRotation = 0;
  }

  // 当强制重置旋转时，直接设置旋转角度为0
  if (forceRotationReset) {
    rotation = 0;
    forceRotationReset = false;
  } else {
    // 平滑过渡到目标旋转角度
    rotation += (targetRotation - rotation) * 1; //1是速度
  }

  //缩放效果
  if (state === 'move' || state === 'animation1' || state === 'animation2') {
    if (!scaleAnimation) {
      scaleAnimation = true;
      scaleTimer = millis();
    }
    let elapsed = millis() - scaleTimer;
    if (elapsed < scaleDuration) {
      currentScaleValue = 1 + 0.1 * sin(PI * elapsed / scaleDuration);
    } else {
      currentScaleValue = 1;
      scaleAnimation = false;
    }
  } else if (state === 'animation3') {
    if (animation3ScaleTimer === 0) {
      animation3ScaleTimer = millis();
    }
    let elapsed = millis() - animation3ScaleTimer;
    if (elapsed < 1000) { //持续时间
      currentScaleValue = map(elapsed, 0, 1000, 1, 0.8);
    } else {
      currentScaleValue = 0.8;
    }

    // 在animation3状态下绘制缩小效果的小球
    let ballScale = map(currentScaleValue, 1, 0.8, 1, 0.6); // 将整体缩放映射到小球缩放
    
    push();
    translate(100, 100); // 移动到白色正方形的中心
    scale(ballScale);
    
    fill('red');
    ellipse(leftBallX - 100, 0, 30, 30); // 左边的小球，注意坐标调整

    fill('blue');
    ellipse(rightBallX - 100, 0, 30, 30); // 右边的小球，注意坐标调整
    
    pop();

  }
  
  // 应用旋转
  push();
  translate(100, 100); // 将原点移动到白色正方形的中心点
  rotate(rotation);
  scale(currentScaleValue);
  translate(-100, -100);

  fill('white');
  rect(0, 0, 200, 200);

  // 在正方形里画出红色的长方形
  if (state === 'move' || state === 'animation1') {
    stroke(255);
    strokeWeight(0);
    fill(255, 0, 0);
    rect(rectX, 0, 90, 200);
  }
  // 画出矩形覆盖在红色长方形的中间
  if (state === 'animation1') {
    stroke(255);
    strokeWeight(0);
    fill('blue');
    rect(0, 75, 200, 50);

    // 画出从右向左移动的白色直线
    stroke(255);
    strokeWeight(2);
    for (let i = 0; i < lines.length; i++) {
      lines[i] -= lineSpeed;
      if (lines[i] < 0) {
        lines[i] = 200;
      }
      line(lines[i], 75, lines[i], 125);
    }
    line(0, 100, 200, 100);
  }
  if (state === 'animation3') {
    // 画出从右向左移动的白色直线在上方红色矩形
    noStroke();
    fill(255, 0, 0);
    rect(rect2, 0, 90, 75);
    
    // 画出下方蓝色正方形
    noStroke();
    fill('blue');
    rect(rect2, 125, 90, 75);

    noStroke();
    fill('blue');
    rect(110, 75, 90, 50);

    noStroke();
    fill(0, 0, 255);
    rect(smallSquareX, 75, 30, 50);

    rect2 -= rectSpeed;
    if (rect2 <= 0) {
      rect2 = 0;
      for (let i = 0; i < lines.length; i++) {
        lines[i] -= 5; //更新从下到上移动的横线位置&速度
        
        if (lines[i] < 0) {
          lines[i] = 75;
        }
      stroke(255);
      strokeWeight(2);
        line(rect2, lines[i], rect2 + 90, lines[i]);
      }

      // 更新从左向右移动的直线位置&速度
      lineX += 0.75;
      if (lineX > 90) {
        lineX = 0;
      }
      stroke(255);
      strokeWeight(2);
      line(lineX, 0, lineX, 75);
    }
  }

  pop(); // 恢复旋转
  
  if (state === 'initial') {
    // 移动左边的小球
    leftBallX += leftBallMoveSpeed;

    // 更新蓝色小球的位置
    if (rightBallX < 250) {
      rightBallX += rightBallMoveSpeed;
      if (rightBallX > 250) {
          rightBallX = 250;
      }
  }
    // 如果小球到达白色正方形的左边缘
    if (leftBallX >= -25) { 
      leftBallX = -25; 
      state = 'move'; 
    }
  }

  if (state !== 'animation3') {
    fill('red');
    ellipse(leftBallX, 100, 30, 30); // 左边的小球

    fill('blue');
    ellipse(rightBallX, 100, 30, 30); // 右边的小球
  }

  if (state === 'move') {
    // 更新红色长方形的X坐标
    rectX += rectSpeed;

    // 如果红色长方形移动到正方形的边缘，改变其移动方向
    if (rectX <= 0 || rectX >= 110) {
      if (rectX >= 110) {
        rectX = 110; // 确保不会超出边缘
        rectSpeed = 0; // 暂时停止移动
        if (pauseStartTime === 0) {
          pauseStartTime = millis(); // 记录暂停开始时间
        }
        // 如果暂停时间超过rectPauseTime,则改变移动方向
        if (millis() - pauseStartTime > 500) {
          rectSpeed = -5; // 开始向左移动
          pauseStartTime = 0; // 重置pauseStartTime
        }

      }if (rectX <= 0) {
        rectSpeed = 5; // 向右移动
        rectX = 0; // 确保不会超出边缘
        // 在切换到 animation1 之前，确保旋转已经完全恢复
        if (abs(rotation - PI / 90) < 0.1) {  // 如果旋转角度非常接近0
          state = 'animation1';
          startTime = millis();
          forceRotationReset = true;  // 强制重置旋转
          lines = [];
          const numLines = 5;
          const interval = 200 / numLines;
          for (let i = 0; i < numLines; i++) {
            lines.push(200 - (i * interval)); // 初始化直线位置在右侧
          }
        }
      }
    }
  } else if (state === 'animation1') {
    // 检查animation1是否完成  [time]
    if (millis() - startTime > 1000 ) {
      if (abs(rotation - PI / 90) < 0.1) {  // 如果旋转角度非常接近目标角度
        state = 'animation2';
        startTime = millis();
        forceRotationReset = true;  // 强制重置旋转
        rect2 = 0; // 重置红色长方形的位置
        lines = [];
        const numLines = 3; // 修改直线数量为3
        const interval = 100 / numLines; // 根据正方形宽度调整间隔
        for (let i = 0; i < numLines; i++) {
          lines.push(i * interval); // 初始化直线位置在左侧
        }
        lineMoveStartTime = millis(); // 初始化直线移动的开始时间
        lineSpeed = 1.5; // 设置animation2状态下的lineSpeed为1.5，使直线移动缓慢
      }
    }

    // 更新蓝色小球的位置
    rightBallX -= rightBallMoveSpeed;
    if (rightBallX <= 225) {
      rightBallX = 225;
    }
    // 更新红色小球的位置
    leftBallX -= leftBallMoveSpeed;
    if (leftBallX <= -60) { 
      leftBallX = -60;
    }
  } else if (state === 'animation2') {   
    // 如果缩放动画还没有开始,启动缩放动画
    if (!scaleAnimation) {
      scaleAnimation = true; // 启动缩放动画
      scaleTimer = millis(); // 记录缩放动画开始时间
    }

    // 根据当前时间计算缩放值
    let elapsed = millis() - scaleTimer; // 计算从缩放动画开始到现在经过的时间
    if (elapsed < scaleDuration) {
      // 如果经过的时间小于缩放动画持续时间,则计算当前缩放值
      scaleValue = 1 + 0.1 * sin(PI * elapsed / scaleDuration);
    } else {
      // 如果经过的时间大于或等于缩放动画持续时间,则将缩放值重置为1(不缩放)
      scaleValue = 1;
      scaleAnimation = false; // 缩放动画结束
    }

    push(); // 保存当前变换状态
    translate(100, 100); // 将原点移动到白色正方形的中心点
    scale(scaleValue); // 应用缩放变换

    translate(-100, -100);
    // 画出矩形覆盖在红色长方形的中间
    noStroke();
    fill('blue');
    rect(0, 75, 100, 50);

    // 检查直线是否应该继续移动&时间
    if (millis() - lineMoveStartTime < 900) {
      // 画出从左向右移动的白色直线
      stroke(255);
      strokeWeight(2);
      for (let i = 0; i < lines.length; i++) {
        lines[i] += lineSpeed;
        if (lines[i] > 100) {
          lines[i] = 0;
        }
        line(lines[i], 75, lines[i], 125);
      }
    } else {
      // 停止直线移动
      stroke(255);
      strokeWeight(2);
      for (let i = 0; i < lines.length; i++) {
        line(lines[i], 75, lines[i], 125);
      }
    }
    line(0, 100, 100, 100);

    //上下方正方形创建和移动
    stroke(255);
    strokeWeight(0);
    fill(255, 0, 0);
    rect(rect2, 0, 90, 75); // 上方红色正方形
    rect(rect2, 125, 90, 75); // 下方红色正方形
    
    rect2 += rectSpeed;

    pop();
    if (rect2 >= 110) {
      rect2 = 110;
    }

    // 检查animation2是否完成
    if (millis() - startTime > 1100) {
      state = 'animation3';
      startTime = millis();
      lines = [];
      const numLines = 3; // 修改直线数量为3
      const interval = 90 / numLines; // 根据正方形宽度调整间隔
      for (let i = 0; i < numLines; i++) {
        lines.push(90 - (i * interval)); // 初始化直线位置在右侧
      }
      lineX = 0; // 重置animation3状态下的横线位置
    }

    // 更新蓝色小球的位置
    if (rightBallX < 320) {
      rightBallX += rightBallMoveSpeed;
      if (rightBallX > 320) {
          rightBallX = 320;
      }
  }
    // 更新红色小球的位置
    if (leftBallX < -25) {
      leftBallX += leftBallMoveSpeed;
      if (leftBallX >= -25) {
        leftBallX = -25;
      }
    }
  } else if (state === 'animation3') {

    // 移动新添加的正方形到左边一定*位置
    if (smallSquareX > 25) {
      smallSquareX -= 1; // 调整移动速度
    } else {
      smallSquareX = 25;
    }
    
    // 更新蓝色小球的位置
    rightBallX -= rightBallMoveSpeed;
    if (rightBallX <= 250) {
      rightBallX = 250;
    }
    // 更新红色小球的位置
    leftBallX -= leftBallMoveSpeed;
    if (leftBallX <= -250) { // 确保小球不会穿过边缘
      leftBallX = -250;
    }

    // 检查animation3是否完成
    if (millis() - startTime > 1100) {
      state = 'move';
      resetVariables(); // 重置所有变量
      animation3ScaleTimer = 0; // 重置 animation3 缩放计时器
    }

  }
}