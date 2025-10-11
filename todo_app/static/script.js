// ==== 初期データ ====
let monsterHP = 100;  // 初期HP
let monsterMaxHP = 100;

const todos = [
  { title: "本を読む", attack: 10, done: false },
  { title: "課題を1つ終える", attack: 20, done: false },
  { title: "部屋を掃除する", attack: 5, done: false }
];

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");

// ==== 関数 ====
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

function updateHPBar() {
  const hpPercent = (monsterHP / monsterMaxHP) * 100;
  hpFillEl.style.width = `${hpPercent}%`;
  if (hpPercent <= 0) {
    hpFillEl.style.background = "gray";
  }
}

function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

function completeTask(index) {
  if (todos[index].done || monsterHP <= 0) return;

  todos[index].done = true;
  monsterHP -= todos[index].attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();

  if (monsterHP === 0) {
    setTimeout(() => alert("🎉 モンスターを倒した！レベルアップ！"), 300);
  }
}

// ==== 初期化 ====
renderTodos();
updateHPBar();
