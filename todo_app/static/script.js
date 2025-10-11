// script.js

// ==== 初期データ ====
let monsterHP = 100;  // 初期HP
let monsterMaxHP = 100;
let isPenaltyActive = false; // ★追加: ペナルティ状態を管理

const todos = [
  // ★初期データにもdueDateとexpiredを追加
  { title: "本を読む", attack: 10, done: false, dueDate: "2025-10-12", expired: false },
  { title: "課題を1つ終える", attack: 20, done: false, dueDate: "2025-10-15", expired: false },
  { title: "部屋を掃除する", attack: 5, done: false, dueDate: "2025-10-18", expired: false }
];

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form"); // フォーム要素を取得

// ==== 関数 ====

function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    
    if (todo.done) li.classList.add("done");
    if (todo.expired && !todo.done) li.classList.add("expired"); // ★変更: 完了してない期限切れタスクにクラス付与
    
    // ★変更: 期限を表示に追加
    li.textContent = `${todo.title}（攻撃力: ${todo.attack} / 期限: ${todo.dueDate}）`;
    li.onclick = () => completeTask(index);
    listEl.appendChild(li);
  });
}

function updateHPBar() {
  const hpPercent = (monsterHP / monsterMaxHP) * 100;
  hpFillEl.style.width = `${hpPercent}%`;
  hpFillEl.style.background = monsterHP <= 0 ? "gray" : "red";
}

function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

// ★追加: 期限切れチェックとペナルティ関数
function checkDeadlines() {
    // 日付比較のため、'YYYY-MM-DD'形式の今日の日付を取得
    const today = new Date().toISOString().split('T')[0]; 
    let expiredCount = 0;
    
    todos.forEach(todo => {
        // 完了しておらず、期限が今日より過去であるタスクをチェック
        if (!todo.done && todo.dueDate && todo.dueDate < today) {
            todo.expired = true;
            expiredCount++;
        }
    });

    if (expiredCount > 0 && !isPenaltyActive) {
        applyPenalty(expiredCount);
    } else if (expiredCount === 0 && isPenaltyActive) {
        removePenalty();
    }
    
    renderTodos(); 
}

function applyPenalty(count) {
    isPenaltyActive = true;
    monsterHP += count * 20; // ペナルティ：期限切れ1件につきHP20回復
    if (monsterHP > monsterMaxHP) monsterHP = monsterMaxHP;
    
    alert(`🚨 警告！未完了のタスク ${count} 件が期限切れです。モンスターのHPが ${count * 20} 回復し、怒り狂っています！`);
    updateHPBar();
    monsterImg.classList.add("penalty-mode");
}

function removePenalty() {
    isPenaltyActive = false;
    alert("✨ 期限切れタスクがなくなりました！モンスターの怒りが静まりました。");
    monsterImg.classList.remove("penalty-mode");
}


function completeTask(index) {
  if (todos[index].done || monsterHP <= 0) return;

  todos[index].done = true;
  todos[index].expired = false; // 完了したら期限切れフラグを解除
  
  monsterHP -= todos[index].attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();
  
  // タスク完了のたびに期限切れがないか再チェック
  checkDeadlines(); 

  if (monsterHP === 0) {
    setTimeout(() => alert("🎉 モンスターを倒した！次のクエストへ！"), 300);
  }
}

// 新しいToDoを作成する関数
function addTodo(title, difficulty, dueDate) {
    let attackValue;
    
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
            attackValue = 10;
    }

    const newTodo = {
        title: title,
        attack: attackValue,
        done: false,
        dueDate: dueDate, // ★追加
        expired: false    // ★追加
    };

    todos.push(newTodo);
    renderTodos(); 
}

// フォームの送信イベントリスナー
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const titleInput = document.getElementById("todo-title");
    const difficultySelect = document.getElementById("todo-difficulty");
    const dateInput = document.getElementById("todo-due-date"); // ★追加：期限を取得
    
    const title = titleInput.value.trim();
    const difficulty = difficultySelect.value;
    const dueDate = dateInput.value; // ★追加：値を取得
    
    if (title && dueDate) {
        addTodo(title, difficulty, dueDate);
        titleInput.value = ''; 
        dateInput.value = ''; 
        
        checkDeadlines(); // 新しいタスク追加後に期限切れチェック
    }
});


// ==== 初期化 ====
renderTodos();
updateHPBar();
checkDeadlines(); // ★変更: 起動時に期限切れチェックを実行