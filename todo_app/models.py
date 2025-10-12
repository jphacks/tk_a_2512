from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), default="プレイヤー")
    level = db.Column(db.Integer, default=1)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.Integer, default=1)  
    attack_power = db.Column(db.Integer, default=0)
    done = db.Column(db.Boolean, default=False)
    date = db.Column(db.Date, default=date.today)

    def set_attack_power(self):
        if self.difficulty == 1:
            self.attack_power = 10
        elif self.difficulty == 2:
            self.attack_power = 20
        elif self.difficulty == 3:
            self.attack_power = 30
        else:
            self.attack_power = 0

class Monster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), default="モンスター")
    hp = db.Column(db.Integer, default=0)
    date = db.Column(db.Date, default=date.today)
