from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from meta import app as application, db

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    openid = db.Column(db.String(300))

    def __init__(self, username, openid):
        self.username = username
        self.openid = openid

    def __repr__(self):
        return '<User %r>' % str(self.id)

class MostViewedQuestion(db.Model):
    __tablename__ = 'most_viewed_question'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer)
    view_count = db.Column(db.Integer)       
    view_date = db.Column(db.DateTime) 
    is_associated = db.Column(db.Boolean)

    def __init__(self, question_id, view_count, view_date, is_associated=False):
        self.question_id = question_id
        self.view_count = view_count
        self.view_date = view_date
        self.is_associated = is_associated

    def __repr__(self):
        return '<MostViewedQuestion %s>' % str(self.id)        

class Association(db.Model):
    __tablename__ = 'association'

    id = db.Column(db.Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    soen_id = db.Column(db.Integer)
    soru_id = db.Column(db.Integer)
    status = db.Column(String(50))

    def __repr__(self):
        return '<Association %s>' % str(self.id)        
