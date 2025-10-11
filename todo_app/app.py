from flask import Flask, jsonify, render_template, request
from models import db, Player, Todo, Monster
from datetime import date

app = Flask(__name__)

# --- SQLite データベース設定 ---
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --- モデルとアプリを関連付け ---
db.init_app(app)

# --- 初回起動時にデータベースを作成 ---
with app.app_context():
    db.create_all()
    # プレイヤーがまだいなければ作成
    if not Player.query.first():
        player = Player(name="勇者")
        db.session.add(player)
        db.session.commit()

# --- モンスター取得・HP更新 ---
def get_today_monster():
    monster = Monster.query.filter_by(date=date.today()).first()
    if not monster:
        monster = Monster(name="スライム")
        db.session.add(monster)
        db.session.commit()
    # 今日のTodoの攻撃力合計でHPをセット
    todos = Todo.query.filter_by(date=date.today()).all()
    monster.hp = sum(t.attack_power for t in todos)
    db.session.commit()
    return monster

# --- main page ---
@app.route("/")
def index():
    return render_template("todo.html")

# --- API: プレイヤー情報取得 ---
@app.route("/api/status")  #status API
def get_status():
    player = Player.query.first()
    monster = get_today_monster()
    todos = Todo.query.filter_by(date=date.today()).all()
    return jsonify({
        "player": {"name": player.name, "level": player.level},
        "monster": {"name": monster.name, "hp": monster.hp},
        "todos": [{"id": t.id, "title": t.title, "attack_power": t.attack_power, "done": t.done} for t in todos]
    })

# --- Todo作成処理 ---
@app.route("/api/create_todo", methods=["POST"])
def create_todo():
    data = request.json
    title = data.get("title")
    difficulty = int(data.get("difficulty", 1))

    if title:
        todo = Todo(title=title, difficulty=difficulty)
        todo.set_attack_power()  # 攻撃力を設定
        db.session.add(todo)
        db.session.commit()

        # モンスターHP更新
        monster = get_today_monster()  # この関数でHP再計算される

        return jsonify({
            "status": "ok",
            "todo": {"id": todo.id, "title": todo.title, "attack_power": todo.attack_power, "done": todo.done},
            "monster_hp": monster.hp
        })
    return jsonify({"status": "error"}), 400


# --- Todo完了処理 ---
@app.route("/api/complete_todo/<int:todo_id>", methods=["POST"])
def complete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    monster = get_today_monster()
    player = Player.query.first()

    if todo and not todo.done:
        todo.done = True
        monster.hp = max(0, monster.hp - todo.attack_power)

        # モンスター撃破判定
        if monster.hp == 0:
            player.level += 1

        db.session.commit()

    return jsonify({
        "todo_id": todo.id,
        "monster_hp": monster.hp,
        "player_level": player.level
    })

if __name__ == "__main__":
    app.run(debug=True)
