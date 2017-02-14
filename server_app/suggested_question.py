import logging

from sqlalchemy import desc
from sqlalchemy.sql import func

from meta import db
from models import MostViewedQuestion

DEFAULT_QUESTION_NUMBER_LIMIT = 1000

def get_suggested_question_ids_with_views():
    quesitons = db.session.query(MostViewedQuestion.question_id.label('Question'), func.sum(MostViewedQuestion.view_count).\
        label('Views')).filter(MostViewedQuestion.is_associated==False).group_by('Question').\
            order_by(desc('Views')).limit(DEFAULT_QUESTION_NUMBER_LIMIT).all()

    to_json = list()
    for question in quesitons:
        to_json.append({
            "questionId": question.Question,
            "viewCount": question.Views
        })
    
    return {
        "items": to_json,
    }