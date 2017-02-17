import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from meta import app as application, db

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, unique=True)
    user_id = db.Column(db.Integer)
    username = db.Column(db.String(100))
    is_banned = db.Column(db.Boolean)
    end_ban_date = db.Column(db.DateTime, nullable=True)

    def __init__(self, account_id, user_id, username, is_banned=False):
        self.account_id = account_id
        self.user_id = user_id
        self.username = username
        self.is_banned = is_banned

    def __repr__(self):
        return '<User %r>' % str(self.id)

class MostViewedQuestion(db.Model):
    __tablename__ = 'most_viewed_question'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer)
    view_count = db.Column(db.Integer)       
    view_date = db.Column(db.DateTime) 
    is_associated = db.Column(db.Boolean)
    can_be_associated = db.Column(db.Boolean)

    def __init__(self, question_id, view_count, view_date, is_associated=False, can_be_associated=True):
        self.question_id = question_id
        self.view_count = view_count
        self.view_date = view_date
        self.is_associated = is_associated
        self.can_be_associated = can_be_associated

    def __repr__(self):
        return '<MostViewedQuestion %s>' % str(self.id)        

class Association(db.Model):
    __tablename__ = 'association'

    id = db.Column(db.Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    soen_id = db.Column(db.Integer)
    soint_id = db.Column(db.Integer)
    comment_id = db.Column(db.Integer)
    status = db.Column(String(50))      
    association_date = db.Column(db.DateTime) 

    def __init__(self, user_id, soen_id, soint_id, comment_id, status="added"):
        self.user_id = user_id
        self.soen_id = soen_id
        self.soint_id = soint_id
        self.comment_id = comment_id
        self.status = status
        self.association_date = datetime.datetime.now()

    def __repr__(self):
        return '<Association %s>' % str(self.id)        
