// script.js

// --- DOM 元素获取 ---
const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');
const resetButton = document.getElementById('reset-button');
const prevLevelButton = document.getElementById('prev-level-button');
const nextLevelButton = document.getElementById('next-level-button');
const winMessage = document.getElementById('win-message');

// --- 游戏状态变量 ---
let currentLevelIndex = 0;
let currentLevelData = []; // 当前关卡的二维数组表示
let players = []; // 存储所有玩家的位置
let currentPlayerIndex = 0; // 当前控制的玩家索引
let movesCount = 0;
let totalTargets = 0;
let boxesOnTarget = 0;
let history = []; // 用于撤销功能（可选，此版本未实现撤销）

// --- 初始化游戏 ---
function initGame(levelIndex) {
    currentLevelIndex = levelIndex;
    movesCount = 0;
    boxesOnTarget = 0;
    totalTargets = 0;
    history = []; // 重置历史

    // 边界检查
    if (currentLevelIndex < 0) currentLevelIndex = 0;
    if (currentLevelIndex >= levels.length) currentLevelIndex = levels.length - 1;

    // 深拷贝关卡数据，防止修改原始 levels 数组
    const level = levels[currentLevelIndex];
    currentLevelData = level.map(row => row.split(''));

    // 解析关卡数据，找到玩家位置和目标数量
    players = []; // 重置玩家数组
    currentPlayerIndex = 0; // 重置当前玩家索引
    for (let y = 0; y < currentLevelData.length; y++) {
        for (let x = 0; x < currentLevelData[y].length; x++) {
            const tile = currentLevelData[y][x];
            if (tile === PLAYER || tile === PLAYER_ON_TARGET) {
                players.push({ x, y }); // 将每个玩家的位置添加到数组中
            }
            if (tile === TARGET || tile === PLAYER_ON_TARGET || tile === BOX_ON_TARGET) {
                totalTargets++;
            }
            if (tile === BOX_ON_TARGET) {
                boxesOnTarget++; // 初始就在目标上的箱子
            }
        }
    }

    updateUI();
    renderBoard();
    updateLevelButtons();
    winMessage.classList.add('hidden'); // 确保胜利消息隐藏
}

// --- 渲染游戏面板 ---
function renderBoard() {
    gameBoard.innerHTML = ''; // 清空旧面板

    const levelHeight = currentLevelData.length;
    const levelWidth = Math.max(...currentLevelData.map(row => row.length)); // 获取最长行的宽度

    // 设置 Grid 布局
    gameBoard.style.gridTemplateColumns = `repeat(${levelWidth}, 40px)`;
    gameBoard.style.gridTemplateRows = `repeat(${levelHeight}, 40px)`;
    gameBoard.style.width = `${levelWidth * 40}px`;
    gameBoard.style.height = `${levelHeight * 40}px`;

    for (let y = 0; y < levelHeight; y++) {
        for (let x = 0; x < (currentLevelData[y] ? currentLevelData[y].length : levelWidth); x++) { // 处理可能存在的行长不一
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const tile = currentLevelData[y] ? (currentLevelData[y][x] || FLOOR) : FLOOR; // 安全获取 tile

            // 根据 tile 类型添加样式
            switch (tile) {
                case WALL:
                    cell.classList.add('wall');
                    cell.textContent = ''; // 墙壁通常没有文本
                    break;
                case FLOOR:
                    cell.classList.add('floor');
                    break;
                case PLAYER:
                    cell.classList.add('floor', 'player');
                    cell.textContent = ''; // 移除表情符号
                    break;
                case BOX:
                    cell.classList.add('floor', 'box');
                    cell.textContent = '📦'; // 使用箱子表情符号
                    break;
                case TARGET:
                    cell.classList.add('floor', 'target');
                    break;
                case PLAYER_ON_TARGET: // 玩家在目标点上
                    cell.classList.add('floor', 'target', 'player');
                    cell.textContent = ''; // 移除表情符号
                    break;
                case BOX_ON_TARGET: // 箱子在目标点上
                    cell.classList.add('floor', 'target', 'box', 'box-on-target');
                    cell.textContent = '📦';
                    break;
                default:
                     cell.classList.add('floor'); // 未知字符视为空地
            }
            gameBoard.appendChild(cell);
        }
    }
}

// --- 处理玩家移动 ---
function handleKeyDown(event) {
    if (checkWinCondition(false)) return; // 如果已经赢了，则不响应按键

    let dx = 0;
    let dy = 0;

    switch (event.key) {
        case 'ArrowUp':    case 'w': case 'W': dy = -1; break;
        case 'ArrowDown':  case 's': case 'S': dy = 1;  break;
        case 'ArrowLeft':  case 'a': case 'A': dx = -1; break;
        case 'ArrowRight': case 'd': case 'D': dx = 1;  break;
        case 'Tab':
            event.preventDefault();
            if (players.length > 1) {
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
                updateUI();
            }
            return;
        default: return; // 非方向键，不做处理
    }

    event.preventDefault(); // 阻止方向键滚动页面

    movePlayer(dx, dy);
}

// --- 移动逻辑 ---
function movePlayer(dx, dy) {
    const currentPlayer = players[currentPlayerIndex];
    const nextPlayerPos = { x: currentPlayer.x + dx, y: currentPlayer.y + dy };
    const afterNextPos = { x: currentPlayer.x + dx * 2, y: currentPlayer.y + dy * 2 };

    // 检查目标位置是否越界
    if (!isValidPosition(nextPlayerPos.x, nextPlayerPos.y)) return;

    const nextTile = getTile(nextPlayerPos.x, nextPlayerPos.y);

    // 1. 移动到空地或目标点
    if (nextTile === FLOOR || nextTile === TARGET) {
        // 更新旧位置
        const oldTile = getTile(currentPlayer.x, currentPlayer.y);
        setTile(currentPlayer.x, currentPlayer.y, (oldTile === PLAYER_ON_TARGET) ? TARGET : FLOOR);

        // 更新新位置
        setTile(nextPlayerPos.x, nextPlayerPos.y, (nextTile === TARGET) ? PLAYER_ON_TARGET : PLAYER);

        // 更新玩家位置
        players[currentPlayerIndex] = nextPlayerPos;
        movesCount++;
        // history.push(copyLevelData(currentLevelData)); // 保存状态用于撤销
        updateUI();
        renderBoard(); // 只在移动成功后渲染
    }
    // 2. 推箱子
    else if (nextTile === BOX || nextTile === BOX_ON_TARGET) {
        // 检查箱子后方位置是否越界或无效
        if (!isValidPosition(afterNextPos.x, afterNextPos.y)) return;

        const afterNextTile = getTile(afterNextPos.x, afterNextPos.y);

        // 检查箱子后方是否为空地或目标点
        if (afterNextTile === FLOOR || afterNextTile === TARGET) {
            // 更新箱子将移动到的位置
            const isBoxMovingToTarget = (afterNextTile === TARGET);
            setTile(afterNextPos.x, afterNextPos.y, isBoxMovingToTarget ? BOX_ON_TARGET : BOX);
            // 更新箱子原位置（现在是玩家将移动到的位置）
            const isPlayerMovingToTarget = (nextTile === BOX_ON_TARGET);
            setTile(nextPlayerPos.x, nextPlayerPos.y, isPlayerMovingToTarget ? PLAYER_ON_TARGET : PLAYER);
            // 更新玩家原位置
            const oldPlayerTile = getTile(currentPlayer.x, currentPlayer.y);
            setTile(currentPlayer.x, currentPlayer.y, (oldPlayerTile === PLAYER_ON_TARGET) ? TARGET : FLOOR);

            // 更新箱子状态计数
            if (nextTile === BOX_ON_TARGET && !isBoxMovingToTarget) boxesOnTarget--;
            if (nextTile === BOX && isBoxMovingToTarget) boxesOnTarget++;

            // 更新玩家位置和步数
            players[currentPlayerIndex] = nextPlayerPos;
            movesCount++;
            // history.push(copyLevelData(currentLevelData)); // 保存状态用于撤销
            updateUI();
            renderBoard(); // 只在移动成功后渲染
            checkWinCondition(true); // 检查是否胜利
        }
    }
     // 其他情况（如撞墙）不做任何事
}

// --- 辅助函数：获取指定位置的瓦片 ---
function getTile(x, y) {
    if (!isValidPosition(x, y)) return null; // 或者返回一个特殊值表示越界
    return currentLevelData[y][x];
}

// --- 辅助函数：设置指定位置的瓦片 ---
function setTile(x, y, tile) {
    if (isValidPosition(x, y)) {
        currentLevelData[y][x] = tile;
    }
}

// --- 辅助函数：检查位置是否在地图内且不是墙 ---
function isValidPosition(x, y) {
    return y >= 0 && y < currentLevelData.length &&
           x >= 0 && x < currentLevelData[y].length;
           // 不需要检查墙，因为 getTile 会返回墙类型
}

// --- 检查胜利条件 ---
function checkWinCondition(showWinMessage) {
    // 重新计算当前在目标点上的箱子数量 (更可靠的方式)
    let currentBoxesOnTarget = 0;
    for (let y = 0; y < currentLevelData.length; y++) {
        for (let x = 0; x < currentLevelData[y].length; x++) {
            if (currentLevelData[y][x] === BOX_ON_TARGET) {
                currentBoxesOnTarget++;
            }
        }
    }
     boxesOnTarget = currentBoxesOnTarget; // 校准计数器

    if (boxesOnTarget === totalTargets && totalTargets > 0) {
        if (showWinMessage) {
            winMessage.classList.remove('hidden');
        }
        return true; // 返回胜利状态
    } else {
         winMessage.classList.add('hidden'); // 确保非胜利状态下隐藏
        return false;
    }
}


// --- 更新 UI 显示（关卡、步数） ---
function updateUI() {
    levelDisplay.textContent = currentLevelIndex + 1;
    movesDisplay.textContent = movesCount;
    document.getElementById('player-display').textContent = currentPlayerIndex + 1;
}

// --- 更新关卡切换按钮状态 ---
function updateLevelButtons() {
    prevLevelButton.disabled = currentLevelIndex === 0;
    nextLevelButton.disabled = currentLevelIndex >= levels.length - 1; // 只在最后一关禁用下一关按钮
}

// --- 事件监听 ---
document.addEventListener('keydown', handleKeyDown);
resetButton.addEventListener('click', () => initGame(currentLevelIndex));
prevLevelButton.addEventListener('click', () => {
    if (currentLevelIndex > 0) {
        initGame(currentLevelIndex - 1);
    }
});
nextLevelButton.addEventListener('click', () => {
    if (currentLevelIndex < levels.length - 1) {
         initGame(currentLevelIndex + 1);
    }
});


// --- 游戏启动 ---
initGame(0); // 从第一关开始