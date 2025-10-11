from flask import Flask, jsonify, render_template
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
    return render_template("todo.html")

if __name__ == "__main__":
    app.run(debug=True)
