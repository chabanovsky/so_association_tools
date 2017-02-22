import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from meta import app as application, db

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, unique=True)
    user_id = db.Column(db.Integer)
    username = db.Column(db.String(100))
    role = db.Column(db.String(30))
    is_banned = db.Column(db.Boolean)
    end_ban_date = db.Column(db.DateTime, nullable=True)
    reputation = db.Column(db.Integer)
    profile_image = db.Column(db.String(200))
    profile_link = db.Column(db.String(200))

    def __init__(self, account_id, user_id, username, reputation, profile_image, profile_link, role="user", is_banned=False):
        self.account_id = account_id
        self.user_id = user_id
        self.username = username
        self.reputation = reputation
        self.profile_image = profile_image
        self.profile_link = profile_link
        self.role = role
        self.is_banned = is_banned

    def __repr__(self):
        return '<User %r>' % str(self.id)

class MostViewedQuestion(db.Model):
    __tablename__ = 'most_viewed_question'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer)
    view_count = db.Column(db.Integer)    
    is_associated = db.Column(db.Boolean)
    # Allows to remove a question from the list manually
    can_be_associated = db.Column(db.Boolean)
    # Currenly these are not in use.
    # It seems it could be a good idea
    # to add some kind of cache and search
    title = db.Column(db.String(500))
    body = db.Column(db.String(30000))
    tags = db.Column(db.String(500))   
    # In order to track changes we need to know when we updated
    # a record last time.
    last_update_date = db.Column(db.DateTime)  

    def __init__(self, question_id, view_count, is_associated=False):
        self.question_id = question_id
        self.view_count = view_count
        self.is_associated = is_associated
        self.can_be_associated = True
        self.last_update_date = datetime.datetime.now()

    def __repr__(self):
        return '<MostViewedQuestion %s>' % str(self.id)        

class QuestionViewHistory(db.Model):
    __tablename__ = 'question_view_history'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer)
    view_count = db.Column(db.Integer)       
    view_date = db.Column(db.DateTime) 
    counted = db.Column(db.Boolean)

    def __init__(self, question_id, view_count, view_date):
        self.question_id = question_id
        self.view_count = view_count
        self.view_date = view_date
        self.counted = False

    def __repr__(self):
        return '<QuestionViewHistory %s>' % str(self.id)        
        

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

class Action(db.Model):
    __tablename__ = 'action'
    action_skip_name = 'skip'
    action_translate_request_name = 'transreq'

    id = db.Column(db.Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    most_viewed_question_id = db.Column(db.Integer, ForeignKey('most_viewed_question.id'))

    # Action could be: skipped, wanted
    action_name = db.Column(String(50)) 
    action_date = db.Column(db.DateTime)      
    canceled = db.Column(db.Boolean)

    def __init__(self, user_id, most_viewed_question_id, action_name):
        self.user_id = user_id
        self.most_viewed_question_id = most_viewed_question_id
        self.action_name = action_name
        self.action_date = datetime.datetime.now()
        self.canceled = False

    def __repr__(self):
        return '<Action %s>' % str(self.id)    