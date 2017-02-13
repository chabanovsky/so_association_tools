from sqlalchemy import Column, Integer, String

from meta import app as application, db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True)
    openid = Column(String(300))

    def __init__(self, username, openid):
        self.username = username
        self.openid = openid

    def __repr__(self):
        return '<User %r>' % self.username