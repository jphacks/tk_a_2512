from flask import Flask, jsonify
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

@app.route("/")
def index():
    player = Player.query.first()
    monster = Monster.query.filter_by(date=date.today()).first()

    if not monster:
        monster = Monster(name="スライム", hp=0, date=date.today())
        db.session.add(monster)
        db.session.commit()

    todos = Todo.query.filter_by(date=date.today()).all()

    return jsonify({
        "player": {"name": player.name, "level": player.level},
        "monster": {"name": monster.name, "hp": monster.hp},
        "todos": [{"title": t.title, "done": t.done, "attack": t.attack_power} for t in todos]
    })

if __name__ == "__main__":
    app.run(debug=True)
