document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("player-name");
    const changeBtn = document.getElementById("change-name-btn");

    const playerLevelDisplay = document.getElementById("player-level-display");
    const playerExpDisplay = document.getElementById("player-exp-display");
    const playerExpNextDisplay = document.getElementById("player-exp-next-display");
    const xpFillEl = document.getElementById("xp-fill");
    const playerImgEl = document.getElementById("player-img"); // プレイヤー画像
    const EXP_TO_LEVEL_UP = 100;

    // --- プレイヤーステータス取得 ---
    function loadPlayerStatus() {
    const savedStatus = localStorage.getItem('playerStatus'); // 変更: ToDoページと同じキーを使用
    if (savedStatus) {
        const status = JSON.parse(savedStatus);

        // DOM反映
        if (playerLevelDisplay) playerLevelDisplay.textContent = `Lv.${status.level}`;
        if (playerExpDisplay) playerExpDisplay.textContent = status.exp;
        if (playerExpNextDisplay) playerExpNextDisplay.textContent = 100;

        if (xpFillEl) {
            const expPercent = (status.exp / 100) * 100; //  変更: XPバーの幅を計算
            xpFillEl.style.width = `${expPercent}%`;
        }
    }
}

    // 初期ロード
    loadPlayerStatus();

    // 1秒ごとに自動更新してリアルタイム同期
    setInterval(loadPlayerStatus, 1000);

    // --- 名前変更 ---
    changeBtn.addEventListener("click", async () => {
        const newName = prompt("新しいプレイヤー名を入力してください：", nameEl.textContent);
        if (!newName) return;

        try {
            const res = await fetch("/api/change_name", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });
            const data = await res.json();

            if (data.status === "ok") {
                nameEl.textContent = data.name;
                alert("プレイヤー名を変更しました！");
            } else {
                alert("名前変更に失敗しました: " + data.message);
            }
        } catch (err) {
            console.error("名前変更エラー:", err);
        }
    });
});
