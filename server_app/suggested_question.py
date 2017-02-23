import logging

from sqlalchemy import and_, not_, desc
from sqlalchemy.sql import func
from flask.ext.sqlalchemy import Pagination
from flask import g, request, session

from meta import db
from models import MostViewedQuestion, Action

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
    subquery = db.session.query(Action.most_viewed_question_id).\
        filter(and_(Action.user_id==g.user.id, Action.action_name==Action.action_skip_name, Action.canceled==False))
    return db.session.query(MostViewedQuestion.question_id.label('Question'), MostViewedQuestion.view_count.label('Views')).\
        filter(and_(MostViewedQuestion.is_associated==False, MostViewedQuestion.can_be_associated==True)).\
        filter(~MostViewedQuestion.id.in_(subquery)).\
        order_by(desc('Views'))   

def get_suggested_question_pagination(page_num, per_page=DEFAULT_QUESTIONS_PER_PAGE):
    question_query = get_suggested_question_query()
    return pagination_helper(page_num, per_page, question_query)

def get_skipped_question_pagination(page_num, per_page=DEFAULT_QUESTIONS_PER_PAGE):
    question_query = db.session.query(MostViewedQuestion.question_id.label('Question'), MostViewedQuestion.view_count.label('Views')).\
        join(Action).\
        filter(and_(MostViewedQuestion.is_associated==False, MostViewedQuestion.can_be_associated==True)).\
        filter(and_(Action.action_name==Action.action_skip_name, Action.canceled==False)).\
        order_by(desc('Views')).distinct()   

    return pagination_helper(page_num, per_page, question_query)

def get_requested_question_pagination(page_num, per_page=DEFAULT_QUESTIONS_PER_PAGE):
    question_query = db.session.query(MostViewedQuestion.question_id.label('Question'), MostViewedQuestion.view_count.label('Views')).\
        join(Action).\
        filter(and_(MostViewedQuestion.is_associated==False, MostViewedQuestion.can_be_associated==True)).\
        filter(and_(Action.action_name==Action.action_translate_request_name, Action.canceled==False)).\
        order_by(desc('Views')).distinct()   

    return pagination_helper(page_num, per_page, question_query)

def pagination_helper(page_num, per_page, question_query):
    total = question_query.count()
    items = question_query.offset((page_num-1)*per_page).limit(per_page).all()
    p = Pagination(question_query, page_num, per_page, total, items)
    return p    