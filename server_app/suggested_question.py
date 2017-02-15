import logging

from sqlalchemy import desc
from sqlalchemy.sql import func
from flask.ext.sqlalchemy import Pagination

from meta import db
from models import MostViewedQuestion

DEFAULT_QUESTION_NUMBER_LIMIT = 1000
DEFAULT_QUESTIONS_PER_PAGE = 30

def get_suggested_question_ids_with_views():
    question_query = get_suggested_question_query()
    quesitons = question_query.limit(DEFAULT_QUESTION_NUMBER_LIMIT).all()

    to_json = list()
    for question in quesitons:
        to_json.append({
            "questionId": question.Question,
            "viewCount": question.Views
        })
    
    return {
        "items": to_json,
    }

def get_suggested_question_query():
     return db.session.query(MostViewedQuestion.question_id.label('Question'), func.sum(MostViewedQuestion.view_count).\
        label('Views')).filter(MostViewedQuestion.is_associated==False).group_by('Question').\
            order_by(desc('Views'))   

def get_suggested_question_pagination(page_num, per_page=DEFAULT_QUESTIONS_PER_PAGE):
    question_query = get_suggested_question_query()
    total = question_query.count()
    items = question_query.offset((page_num-1)*per_page).limit(per_page).all()
    p = Pagination(question_query, page_num, per_page, total, items)
    return p
