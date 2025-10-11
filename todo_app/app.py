from flask import Flask, render_template, request, jsonify
from models import db, Player, Todo, Monster
from datetime import date

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    if not Player.query.first():
        player = Player(name="プレイヤー1", level=1, exp=0)
        db.session.add(player)
        db.session.commit()

# --------------------------
# ページルート
# --------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/todo")
def todo_page():
    return render_template("todo.html")

@app.route("/mypage")
def mypage():
    return render_template("mypage.html")

# --------------------------
# ヘルパー関数
# --------------------------

def get_or_create_today_monster():
    today = str(date.today())
    monster = Monster.query.filter_by(created_at=today).first()
    if monster:
        return monster
    player = Player.query.first()
    monster = Monster(
        name=f"モンスターLv{player.level}",
        hp=0,
        max_hp=0,
        level=player.level,
        created_at=today
    )
    db.session.add(monster)
    db.session.commit()
    return monster

def update_monster_hp(attack):
    monster = get_or_create_today_monster()
    monster.hp += attack
    monster.max_hp += attack
    db.session.commit()
    return monster

# --------------------------
# APIエンドポイント
# --------------------------

@app.route("/api/todos")
def get_todos():
    todos = Todo.query.all()
    return jsonify([
        {"id": t.id, "title": t.title, "done": t.done, "attack": t.attack}
        for t in todos
    ])

@app.route("/api/todo", methods=["POST"])
def add_todo():
    data = request.json
    difficulty = data["difficulty"]
    attack = {"易": 5, "中": 10, "難": 20}[difficulty]

    # 1. ToDo作成
    todo = Todo(
        title=data["title"],
        memo=data.get("memo", ""),
        difficulty=difficulty,
        attack=attack,
        done=False,
        created_at=str(date.today())
    )
    db.session.add(todo)
    db.session.commit()

    # 2. モンスターHP更新
    monster = update_monster_hp(attack)

    return jsonify({
        "status": "ok",
        "monster_hp": monster.hp,
        "monster_max_hp": monster.max_hp
    })

@app.route("/api/todo/<int:todo_id>/done", methods=["POST"])
def complete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo or todo.done:
        return jsonify({"error": "Invalid or already done"}), 400

    todo.done = True
    monster = get_or_create_today_monster()
    monster.hp -= todo.attack
    defeated = False

    # モンスターが倒された場合
    player = Player.query.first()
    if monster.hp <= 0:
        defeated = True
        player.level += 1
        # モンスター再生成時はHP0（新規ToDo追加で増える）
        monster.hp = 0
        monster.max_hp = 0

    db.session.commit()
    return jsonify({
        "monster_hp": max(monster.hp, 0),
        "monster_max_hp": monster.max_hp,
        "player_level": player.level,
        "defeated": defeated
    })

@app.route("/api/monster")
def get_monster():
    m = get_or_create_today_monster()
    return jsonify({"name": m.name, "hp": m.hp, "max_hp": m.max_hp})

@app.route("/api/player")
def get_player():
    p = Player.query.first()
    return jsonify({"name": p.name, "level": p.level})

if __name__ == "__main__":
    app.run(debug=True)

