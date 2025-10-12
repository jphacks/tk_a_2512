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
    async function loadPlayerStatus() {
        try {
            const res = await fetch("/api/status");
            const data = await res.json();

            // 名前未設定なら初期名を表示
            nameEl.textContent = data.player.name || "勇者";

            // レベルと経験値更新
            playerLevelDisplay.textContent = `Lv.${data.player.level}`;
            playerExpDisplay.textContent = data.player.exp;
            playerExpNextDisplay.textContent = EXP_TO_LEVEL_UP;
            const expPercent = (data.player.exp / EXP_TO_LEVEL_UP) * 100;
            xpFillEl.style.width = `${expPercent}%`;

            // プレイヤー画像表示（必要に応じて変える）
            if (playerImgEl && !playerImgEl.src) {
                playerImgEl.src = "/static/player.gif";
            }
        } catch (err) {
            console.error("プレイヤーステータス取得エラー:", err);
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
