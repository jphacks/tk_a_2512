// static/mypage.js (今日の未達成タスク表示ロジックを追加)

document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("player-name");
    const changeBtn = document.getElementById("change-name-btn");

    let playerName = localStorage.getItem('playerName');
    if(!playerName) {
        playerName = "勇者";
        localStorage.setItem('playerName', playerName);
    }
    nameEl.textContent = playerName;

    const playerLevelDisplay = document.getElementById("player-level-display");
    const playerExpDisplay = document.getElementById("player-exp-display");
    const playerExpNextDisplay = document.getElementById("player-exp-next-display");
    const xpFillEl = document.getElementById("xp-fill");
    const EXP_TO_LEVEL_UP = 100;

    const monsterKillCountEl = document.getElementById("monster-kill-count");
    const taskCompleteCountEl = document.getElementById("task-complete-count");
    const killStreakDisplayEl = document.getElementById("kill-streak-display");
    
    // ★★★ 新しい要素を取得 ★★★
    const todayTodosListEl = document.getElementById("today-todos-list");


    // --- ヘルパー関数: 今日の日付を YYYY-MM-DD 形式で取得 ---
    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); 
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    // ----------------------------------------------------

    // --- プレイヤーステータス取得 ---
    function loadPlayerStatus() {
        const savedStatus = localStorage.getItem('playerStatus'); 
        if (savedStatus) {
            const status = JSON.parse(savedStatus);
            if (playerLevelDisplay) playerLevelDisplay.textContent = `Lv.${status.level}`;
            if (playerExpDisplay) playerExpDisplay.textContent = status.exp;
            if (playerExpNextDisplay) playerExpNextDisplay.textContent = 100;

            if (xpFillEl) {
                const expPercent = (status.exp / 100) * 100; 
                xpFillEl.style.width = `${expPercent}%`;
            }
        }
    }

    // --- 累計カウント関数 (既存) ---
    function loadAndRenderStatistics() {
        const savedHistory = localStorage.getItem('battleHistory');
        const historyLog = savedHistory ? JSON.parse(savedHistory) : [];
        
        const savedStreak = localStorage.getItem('killStreak');
        const killStreak = savedStreak ? JSON.parse(savedStreak) : { currentStreak: 0 };

        if (killStreakDisplayEl) {
            killStreakDisplayEl.textContent = `${killStreak.currentStreak} 日`;
        }

        const killCount = historyLog.filter(log => log.type === 'MONSTER').length;
        const taskCount = historyLog.filter(log => log.type === 'TASK').length;

        if (monsterKillCountEl) {
            monsterKillCountEl.textContent = killCount; 
        }
        if (taskCompleteCountEl) {
            taskCompleteCountEl.textContent = taskCount;
        }
    }
    
    // ★★★ 今日の未達成タスク表示関数を追加 ★★★
    function loadAndRenderTodayTodos() {
        todayTodosListEl.innerHTML = '';
        const todayDate = getTodayDateString();
        
        const savedTodos = localStorage.getItem('todos');
        const todos = savedTodos ? JSON.parse(savedTodos) : [];

        // 今日が期限日で、かつ未達成のタスクをフィルタリング
        const todayUncompleted = todos.filter(todo => 
            !todo.done && todo.dueDate === todayDate
        );

        if (todayUncompleted.length === 0) {
            todayTodosListEl.innerHTML = '<p style="margin: 0; font-style: italic;">今日の未達成タスクはありません！この調子！</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyleType = 'disc';
        ul.style.paddingLeft = '20px';
        ul.style.margin = '0';

        todayUncompleted.forEach(todo => {
            const difficulty = todo.attack === 5 ? 1 : todo.attack === 15 ? 2 : todo.attack === 30 ? 3 : '不明';
            const li = document.createElement('li');
            li.textContent = `${todo.title} (難易度: ${difficulty})`;
            li.style.marginBottom = '5px';
            ul.appendChild(li);
        });

        todayTodosListEl.appendChild(ul);
    }
    // ★★★ ---------------------------------- ★★★


    // 初期ロード
    loadPlayerStatus();
    loadAndRenderStatistics(); 
    loadAndRenderTodayTodos(); // ★★★ 初期ロードに追加 ★★★

    // 1秒ごとに自動更新してリアルタイム同期
    setInterval(loadPlayerStatus, 1000);
    setInterval(loadAndRenderStatistics, 1000); 
    setInterval(loadAndRenderTodayTodos, 1000); // ★★★ 定期更新に追加 ★★★

    // --- 名前変更 (既存) ---
    changeBtn.addEventListener("click", async () => {
        const newName = prompt("新しいプレイヤー名を入力してください：", nameEl.textContent);
        if (!newName) return;

        try {
            // サーバー通信の代わりにLocalStorageを直接更新
            nameEl.textContent = newName;
            localStorage.setItem('playerName', newName);
            alert("プレイヤー名を変更しました！");
            
        } catch (err) {
            console.error("名前変更エラー:", err);
        }
    });
});