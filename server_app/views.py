# encoding:utf-8
import requests
import logging
import json
import urllib
import re
from urlparse import urlparse

from flask import Flask, jsonify, render_template, g, url_for, redirect, request, session, abort
from flask.ext.babel import gettext, ngettext
from sqlalchemy import and_, desc
from sqlalchemy.sql import func

from meta import app as application, db, db_session, engine, LANGUAGE, STACKOVERFLOW_HOSTNAME, STACKOVERFLOW_SITE_PARAM, INT_STACKOVERFLOW_SITE_PARAM
from models import User, Association, Question, Action
from suggested_question import get_skipped_question_pagination, get_requested_question_pagination, get_most_viewed_question_pagination, get_suggested_question_pagination
from local_settings import STACKEXCHANGE_CLIENT_SECRET, STACKEXCHANGE_CLIENT_ID, STACKEXCHANGE_CLIENT_KEY

STACKEXCHANGE_ADD_COMMENT_ENDPOINT = "https://api.stackexchange.com/2.2/posts/{id}/comments/add"
STACKEXCHANGE_ANSWER_API_ENDPOINT = "https://api.stackexchange.com/2.2/answers/{id}/";
STACKEXCHANGE_QUESTION_API_ENDPOINT = "https://api.stackexchange.com/2.2/questions/{id}/";

LOGOUT_CASES = [401, 402, 403, 405, 406]
LOGOUT_MSG = gettext('Your access token is not valid any more. To work with the app you need to log in again. Now you will be logged out.')


@application.before_request
def before_request():
    g.user = None
    if 'account_id' in session:
        g.user = User.query.filter_by(account_id=session['account_id']).first()
        
@application.after_request
def after_request(response):
    db_session.close()
    db_session.remove()
    engine.dispose()

    return response    

@application.route("/index.html", endpoint="index")
@application.route("/", endpoint="index")
def index():
    if g.user is None:
        return redirect(url_for('welcome'))  

    page = max(int(request.args.get("page", "1")), 1)
    paginator = get_most_viewed_question_pagination(page)
    return render_template('question_pag_list.html', paginator=paginator, base_url=url_for("index"), active_tab="most_viewed")

@application.route("/skipped", endpoint="skipped")
@application.route("/skipped/", endpoint="skipped")
def skipped():
    if g.user is None:
        return redirect(url_for('welcome'))  

    page = max(int(request.args.get("page", "1")), 1)
    paginator = get_skipped_question_pagination(page)
    return render_template('question_pag_list.html', paginator=paginator, base_url=url_for("skipped"), active_tab="skipped")

@application.route("/requested", endpoint="requested")
@application.route("/requested/", endpoint="requested")
def requested():
    if g.user is None:
        return redirect(url_for('welcome'))  

    page = max(int(request.args.get("page", "1")), 1)
    paginator = get_requested_question_pagination(page)
    return render_template('question_pag_list.html', paginator=paginator, base_url=url_for("requested"), active_tab="requested")

@application.route("/suggested", endpoint="suggested")
@application.route("/suggested/", endpoint="suggested")
def suggested():
    if g.user is None:
        return redirect(url_for('welcome'))  

    page = max(int(request.args.get("page", "1")), 1)
    paginator = get_suggested_question_pagination(page)
    return render_template('question_pag_list.html', paginator=paginator, base_url=url_for("suggested"), active_tab="suggested")    

@application.route("/no-way")
@application.route("/no-way/")
def no_way():
    return render_template('no_way.html')    

@application.route("/welcome")
@application.route("/welcome/")
def welcome():
    return render_template('welcome.html', language=LANGUAGE)    

@application.route("/questions/<question_id>")
@application.route("/questions/<question_id>/")
def question(question_id):
    if g.user is None:
        return redirect(url_for('welcome'))
    # Here there is an interesting question:
    # There could be more then one question with an id
    # sicne we allow users to suggest questions.
    # Wich question should be show here?
    q = Question.query.filter(and_(Question.question_id==question_id)).first()
    if q is None:
        abort(404)

    skip = Action.query.filter(and_(Action.user_id==g.user.id, 
        Action.question_id==question_id, 
        Action.action_name==Action.action_skip_name, 
        Action.canceled==False)).first()
    translate_request = Action.query.filter(and_(Action.user_id==g.user.id, 
        Action.question_id==question_id, 
        Action.action_name==Action.action_translate_request_name, 
        Action.canceled==False)).first()
    translate_request_count = db.session.query(func.count(Action.id)).filter(and_(Action.question_id==question_id,
        Action.action_name==Action.action_translate_request_name, 
        Action.canceled==False)).scalar()

    return render_template('question.html', 
        question_id=q.question_id, 
        question_views=q.view_count, 
        question=q,
        skip=skip,
        translate_request=translate_request,
        translate_request_count=translate_request_count)    

@application.route("/api/add_association")
@application.route("/api/add_association/")
def add_association():
    access_token = session.get("access_token", None)
    if g.user is None or access_token is None:
        abort(404)

    soen_id = -1
    soint_id = -1

    try:
        soen_id = int(request.args.get("soen_id"))
        soint_id = int(request.args.get("soint_id"))
    except:
        return jsonify(**{
            "status": False,
            "msg": gettext("Wrong params")
        })  
    
    count = Association.query.filter_by(soen_id=soen_id).count()
    if count > 0:
        return jsonify(**{
            "status": False,
            "msg": gettext("Wrong params")
        })  

    url = STACKEXCHANGE_ADD_COMMENT_ENDPOINT.replace("{id}", str(soint_id))
    association_tag = gettext(u"association")
    params = {
       "body" : association_tag + u": http://stackoverflow.com/questions/" + str(soen_id) + "/",
       "access_token": access_token,
       "key": STACKEXCHANGE_CLIENT_KEY,
       "site": INT_STACKOVERFLOW_SITE_PARAM,
       "preview": "false"
    }
    
    r = requests.post(url, data=params) 
    comment_id = -1
    data = json.loads(r.text)
    if data.get("items", None) is not None:
        for item in data["items"]:
            if item.get("comment_id", None) is not None:
                comment_id = item["comment_id"]
                break

    if comment_id < 0:
        redirect_flag = False
        msg = r.text
        error_id = int(data.get("error_id", 0))
        if error_id in LOGOUT_CASES:
            redirect_flag = True
            msg = LOGOUT_MSG
        return jsonify(**{
            "status": False,
            "msg": msg,
            "logout": redirect_flag,
            "logout_url": url_for("logout_oauth")
        })  

    resp = {
        "status": True,
        "msg": gettext("Association was added"),
        "comment_id": comment_id,
        "full_response": r.text
    }

    association = Association(g.user.id, soen_id, soint_id, comment_id)
    db_session.add(association)
    db_session.commit()

    questions = Question.query.filter_by(question_id=soen_id).all()
    # There should be only one
    for question in questions:
        question.is_associated = True
    db.session.commit()

    return jsonify(**resp)

@application.route("/api/get-answers")
@application.route("/api/get-answers/")
def get_answers():
    access_token = session.get("access_token", None)
    if g.user is None or access_token is None:
        abort(404)

    ids = request.args.get("ids", None)
    site = request.args.get("site", None)

    if ids is None or site is None:
        abort(404)

    url = STACKEXCHANGE_ANSWER_API_ENDPOINT.replace("{id}", ids)
    params = {
       "access_token": access_token,
       "key": STACKEXCHANGE_CLIENT_KEY,
       "site": site,
       "order": "desc",
       "sort": "votes",
       "filter": "!)s4ZC4Cto10(q(Yp)zK*"
    }    
    r = requests.get(url, data=params) 
    try: 
        data = json.loads(r.text)
    except:
        return jsonify(**{
            "error": r.text
        })
    error_id = -1    
    try: 
        error_id = int(data.get("error_id", 0))
    except:
        return jsonify(**{
            "error": r.text,
        })  

    if error_id in LOGOUT_CASES:
        return jsonify(**{
            "msg": LOGOUT_MSG,
            "logout": True,
            "logout_url": url_for("logout_oauth")
        })  
                
    return jsonify(**data)    


def do_action_helper(action_name):
    if g.user is None:
        abort(404)

    soen_id = -1
    try:
        soen_id = int(request.args.get("soen_id"))
    except:
        abort(404)
        
    action = Action.query.filter(and_(Action.user_id==g.user.id, Action.question_id==soen_id, Action.action_name==action_name)).first()
    if action is not None:
        action.canceled = not action.canceled
        db.session.commit()
    else:
        action = Action(g.user.id, soen_id, action_name)
        db_session.add(action)
        db_session.commit()

    resp = {
        "status": action.canceled
    }

    return jsonify(**resp)    

@application.route("/api/skip_question")
@application.route("/api/skip_question/")
def skip_question():
    return do_action_helper(Action.action_skip_name)

@application.route("/api/translation_request")
@application.route("/api/translation_request/")
def translation_request():
    return do_action_helper(Action.action_translate_request_name)

@application.route("/api/suggest_question")
@application.route("/api/suggest_question/")
def suggest_question():
    access_token = session.get("access_token", None)
    if g.user is None or access_token is None:
        abort(404)

    url = request.args.get("question", None)
    if (url is None): 
        return jsonify(**{
            "status": False,
            "msg": gettext("Wrong params")
        })  

    unquoted = urllib.unquote(url)
    parsed = urlparse(unquoted)

    if parsed.hostname != STACKOVERFLOW_HOSTNAME:
        return jsonify(**{
            "status": False,
            "msg": gettext("Question should be on hostname: %s") % STACKOVERFLOW_HOSTNAME
        })  
        
    question_id = -1
    try:    
        question_id = int(re.findall('\d+', parsed.path)[0])
    except:
        return jsonify(**{
            "status": False,
            "msg": gettext("Cannot parse question_id. Path: %s, re: %s") % (parsed.path, re.findall('\d+', parsed.path))
        })  

    if question_id < 0:
        return jsonify(**{
            "status": True,
            "msg": gettext("Not valid question_id: %s") % (str(question_id))
        })  

    url = STACKEXCHANGE_QUESTION_API_ENDPOINT.replace("{id}", str(question_id))
    params = {
       "access_token": access_token,
       "key": STACKEXCHANGE_CLIENT_KEY,
       "site": STACKOVERFLOW_SITE_PARAM,
       "order": "desc",
       "sort": "votes",
    }    
    r = requests.get(url, data=params) 
    data = json.loads(r.text)

    if data.get("items", None) is None:
        return jsonify(**{
            "status": False,
            "msg": gettext("There are no items: %s") % r.text
        })  

    view_count = 0
    q_id = 0
    for item in data["items"]:
        if item.get("view_count", None) is not None:
            view_count = item["view_count"]
        if item.get("question_id", None) is not None:
            q_id = int(item["question_id"])
    
    if question_id != q_id:
        return jsonify(**{
            "status": False,
            "msg": gettext("Question ids are different: %s != %s, text:  %s") % (str(question_id), str(q_id), r.text)
        })  
        
    pg_session = db_session()
    suggested_question_count = pg_session.query(func.count(Question.id)).filter(and_(Question.question_id==question_id, Question.question_type==Question.question_type_suggested)).scalar()
    if suggested_question_count > 0:
        return jsonify(**{
            "status": False,
            "msg": gettext("The suggestion is already existed in the list")
        })  

    question = Question(Question.question_type_suggested, question_id, view_count, suggested_user_id=g.user.id)
    
    pg_session.add(question)
    pg_session.commit()

    association = pg_session.query(func.count(Association.id)).filter(Association.soen_id==question_id).scalar()
    if association > 0:
        question.is_associated = True
        pg_session.commit()        
        pg_session.close()
        return jsonify(**{
            "status": False,
            "msg": gettext("Suggestion was added but the association for it is already existed.")
        })  

    pg_session.close()

    return jsonify(**{
        "status": True,
        "msg": gettext("Suggestion was added")
    })  

@application.route("/api/leaderboard")
@application.route("/api/leaderboard/")
def api_leaderboard():    
    pg_session = db_session()
    query = pg_session.query(User.user_id.label('UserId'), func.count(Association.soen_id).label('AssociationCount')).filter(User.id==Association.user_id).filter(User.user_id!=6).group_by('UserId').order_by(desc('AssociationCount')).distinct()
    users = query.all()

    resp = list()
    for user in users:
        resp.append({
            "id": user.UserId,
            "count": user.AssociationCount
        })
    return jsonify(**{
        "items": resp
    })