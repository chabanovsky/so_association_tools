from sqlalchemy import Column, Integer, String, DateTime

from meta import app as application, db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    openid = Column(String(300))

    def __init__(self, username, openid):
        self.username = username
        self.openid = openid

    def __repr__(self):
        return '<User %r>' % self.username

class MostViewedQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    questionId = db.Column(db.Integer)
    viewCount = db.Column(db.Integer)       
    viewDate = db.Column(db.DateTime) 

    def __init__(self, questionId, viewCount, viewDate):
        self.questionId = questionId
        self.viewCount = viewCount
        self.viewDate = viewDate

    def __repr__(self):
        return '<MostViewedQuestion %s>' % str(self.questionId)        