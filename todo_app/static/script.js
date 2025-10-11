// script.js

// ==== 初期データ ====
let monsterHP = 100;  // 初期HP
let monsterMaxHP = 100;
// Note: todos配列は、Flaskなどのバックエンドで永続化するのが理想ですが、ここではブラウザ実行時にリセットされます。
const todos = [
  { title: "本を読む", attack: 10, done: false },
  { title: "課題を1つ終える", attack: 20, done: false },
  { title: "部屋を掃除する", attack: 5, done: false }
];

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form"); // ★追加：フォーム要素を取得

// ==== 関数 ====

// ToDoリストを画面に描画
function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (todo.done) li.classList.add("done");
    li.textContent = `${todo.title}（攻撃力: ${todo.attack}）`;
    li.onclick = () => completeTask(index);
    listEl.appendChild(li);
  });
}

// HPバーを更新
function updateHPBar() {
  const hpPercent = (monsterHP / monsterMaxHP) * 100;
  hpFillEl.style.width = `${hpPercent}%`;
  if (hpPercent <= 0) {
    hpFillEl.style.background = "gray";
  } else {
    hpFillEl.style.background = "red"; // HPが回復/リセットされたときのために再設定
  }
}

// モンスターのヒットアニメーション
function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

// タスク完了処理
function completeTask(index) {
  if (todos[index].done || monsterHP <= 0) return;

  todos[index].done = true;
  monsterHP -= todos[index].attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();

  if (monsterHP === 0) {
    // 完全にモンスターを倒した際の処理（ここではアラート）
    setTimeout(() => alert("🎉 モンスターを倒した！次のクエストへ！"), 300);
  }
}

// ★追加：新しいToDoを作成する関数
function addTodo(title, difficulty) {
    let attackValue;
    
    // 難易度に応じて攻撃力を設定
    switch(difficulty) {
        case '1':
            attackValue = 5;
            break;
        case '2':
            attackValue = 15;
            break;
        case '3':
            attackValue = 30;
            break;
        default:
            attackValue = 10; // デフォルト
    }

    const newTodo = {
        title: title,
        attack: attackValue,
        done: false
    };

    todos.push(newTodo);
    renderTodos(); // リストを再描画
}

// ★追加：フォームの送信イベントリスナー
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); // ページの再読み込みを防ぐ

    const titleInput = document.getElementById("todo-title");
    const difficultySelect = document.getElementById("todo-difficulty");
    
    const title = titleInput.value.trim();
    const difficulty = difficultySelect.value;
    
    if (title) {
        addTodo(title, difficulty);
        titleInput.value = ''; // 入力欄をクリア
        // Note: 本来はここでバックエンドのAPIを呼び出し、DBに保存します。
    }
});

// ==== 初期化 ====
renderTodos();
updateHPBar();