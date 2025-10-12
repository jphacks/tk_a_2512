// static/mypage.js (累計討伐数/タスク達成数を表示するロジックを追加)

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
    const playerImgEl = document.getElementById("player-img"); 
    const EXP_TO_LEVEL_UP = 100;

    // ★★★ 新しく追加した要素を取得 ★★★
    const monsterKillCountEl = document.getElementById("monster-kill-count");
    const taskCompleteCountEl = document.getElementById("task-complete-count");
    // ★★★ -------------------------- ★★★

    // --- プレイヤーステータス取得 ---
    function loadPlayerStatus() {
        const savedStatus = localStorage.getItem('playerStatus'); 
        if (savedStatus) {
            const status = JSON.parse(savedStatus);

            // DOM反映
            if (playerLevelDisplay) playerLevelDisplay.textContent = `Lv.${status.level}`;
            if (playerExpDisplay) playerExpDisplay.textContent = status.exp;
            if (playerExpNextDisplay) playerExpNextDisplay.textContent = 100;

            if (xpFillEl) {
                const expPercent = (status.exp / 100) * 100; 
                xpFillEl.style.width = `${expPercent}%`;
            }
        }
    }

    // ★★★ 累計カウント関数を追加 ★★★
    function loadAndRenderStatistics() {
        const savedHistory = localStorage.getItem('battleHistory');
        const historyLog = savedHistory ? JSON.parse(savedHistory) : [];

        // ログタイプに基づいてカウント
        const killCount = historyLog.filter(log => log.type === 'MONSTER').length;
        const taskCount = historyLog.filter(log => log.type === 'TASK').length;

        // DOMに反映
        if (monsterKillCountEl) {
            // レベルアップで討伐数が増えるため、プレイヤーレベルから1を引いた数も加算できるが、
            // historyLogの 'MONSTER' ログを使用する方が安全（レベルアップは討伐成功の証）
            monsterKillCountEl.textContent = killCount; 
        }
        if (taskCompleteCountEl) {
            taskCompleteCountEl.textContent = taskCount;
        }
    }
    // ★★★ -------------------------- ★★★


    // 初期ロード
    loadPlayerStatus();
    loadAndRenderStatistics(); // ★★★ 統計情報を初期ロード ★★★

    // 1秒ごとに自動更新してリアルタイム同期
    setInterval(loadPlayerStatus, 1000);
    setInterval(loadAndRenderStatistics, 1000); // ★★★ 統計情報も定期的に更新 ★★★

    // --- 名前変更 ---
    changeBtn.addEventListener("click", async () => {
        const newName = prompt("新しいプレイヤー名を入力してください：", nameEl.textContent);
        if (!newName) return;

        try {
            // Note: サーバー側の処理（/api/change_name）は現時点では提供されていないため、
            // クライアント側（LocalStorage）のみで名前を変更するシンプルな処理に置き換えることを検討してください
            
            // サーバー通信の代わりにLocalStorageを直接更新
            nameEl.textContent = newName;
            localStorage.setItem('playerName', newName);
            alert("プレイヤー名を変更しました！");
            
        } catch (err) {
            console.error("名前変更エラー:", err);
            // サーバー通信エラー時のフォールバック処理を保持
        }
    });
});