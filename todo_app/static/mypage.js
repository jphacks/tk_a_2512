document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("player-name");
    const btn = document.getElementById("change-name-btn");

    // 初期表示：APIからプレイヤー名を取得
    fetch("/api/status")
    .then(res => res.json())
    .then(data => {
        // 名前が未設定なら初期名を表示
        nameEl.textContent = data.player.name || "勇者";
    });


    // 名前変更ボタン
    btn.addEventListener("click", () => {
        const newName = prompt("新しいプレイヤー名を入力してください：", nameEl.textContent);
        if (!newName) return;

        fetch("/api/change_name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                nameEl.textContent = data.name;
                alert("プレイヤー名を変更しました！");
            } else {
                alert("変更できませんでした：" + data.message);
            }
        });
    });
});
