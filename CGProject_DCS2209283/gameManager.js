// gameManager.js

let currentMode = null;

function startGame(mode) {
    currentMode = mode;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';

    // 移除之前加载的脚本（如果有）
    const oldScript = document.querySelector('script[data-mode]');
    if (oldScript) {
        oldScript.remove();
    }

    // 加载对应模式的脚本
    const script = document.createElement('script');
    script.setAttribute('data-mode', mode);
    
    switch(mode) {
        case 'practice':
            script.src = 'sketch.js';
            document.getElementById('scoreboard').style.display = 'block';
            document.getElementById('twoPlayerScoreboard').style.display = 'none';
            break;
        case 'twoPlayers':
            script.src = 'Vsmode.js';
            document.getElementById('scoreboard').style.display = 'none';
            document.getElementById('twoPlayerScoreboard').style.display = 'block';
            break;
    }

    script.onload = () => {
        console.log(`${mode} mode initialized`);
        // 如果需要，可以在这里调用特定的初始化函数
    };

    document.body.appendChild(script);
}

function selectTwoPlayerMode(mode) {
    currentMode = 'twoPlayers';
    let twoPlayerMode = mode;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('twoPlayerScoreboard').style.display = 'block';
    
    if (mode === 'timeLimit') {
        document.getElementById('timer').style.display = 'block';
    } else {
        document.getElementById('timer').style.display = 'none';
    }

    const script = document.createElement('script');
    script.setAttribute('data-mode', 'twoPlayers');
    script.src = 'Vsmode.js';

    script.onload = () => {
        console.log('Two players mode initialized');
        // 调用 Vsmode.js 中的初始化函数，传入具体的游戏模式
        initializeTwoPlayerMode(twoPlayerMode);
    };

    document.body.appendChild(script);
}

// 确保这些函数可以被 HTML 中的按钮访问
window.startGame = startGame;
window.selectTwoPlayerMode = selectTwoPlayerMode;