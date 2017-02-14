# encoding:utf-8
import requests
import logging
import json

from flask import Flask, jsonify, render_template, g, url_for, redirect, request, session, abort
from meta import app as application, db, db_session
from models import User, Association, MostViewedQuestion
from suggested_question import get_suggested_question_ids_with_views
from local_settings import STACKEXCHANGE_CLIENT_SECRET, STACKEXCHANGE_CLIENT_ID, ASSOCIATION_TAG, STACKEXCHANGE_CLIENT_KEY

STACKEXCHANGE_ADD_COMMENT_ENDPOINT = "https://api.stackexchange.com/2.2/posts/{id}/comments/add"


@application.before_request
def before_request():
    g.user = None
    if 'account_id' in session:
        g.user = User.query.filter_by(account_id=session['account_id']).first()
        
@application.after_request
def after_request(response):
    db_session.remove()
    return response        

@application.route("/")
@application.route("/index.html")
def index():
    logging.error("index")
    if g.user is None:
        return redirect(url_for('start_oauth'))  
    return render_template('question_list.html')

@application.route("/no-way")
@application.route("/no-way/")
def no_way():
    return render_template('no_way.html')    

@application.route("/questions/<question_id>")
@application.route("/questions/<question_id>/")
def question(question_id):
    if g.user is None:
        return redirect(url_for('start_oauth'))  
    return render_template('question.html', question_id=question_id)    

@application.route("/api/suggested_question_ids_with_views")
def suggested_question_ids_with_views():
    ids = get_suggested_question_ids_with_views()
    return jsonify(**ids)    

@application.route("/api/add_association")
@application.route("/api/add_association/")
def add_association():
    access_token = session.get("access_token", None)
    if g.user is None or access_token is None:
        abort(404)

    soen_id = int(request.args.get("soen_id"))
    soint_id = int(request.args.get("soint_id"))
    
    count = Association.query.filter_by(soen_id=soen_id).count()
    if count > 0:
        # TODO add something better then 404
        abort(404)

    url = STACKEXCHANGE_ADD_COMMENT_ENDPOINT.replace("{id}", str(soint_id))
    params = {
       "body" : ASSOCIATION_TAG + u": http://stackoverflow.com/questions/" + str(soen_id) + "/",
       "access_token": access_token,
       "key": STACKEXCHANGE_CLIENT_KEY,
       "site": "ru.stackoverflow",
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
    resp = {
        "comment_id": comment_id,
        "full_response": r.text
    }

    association = Association(g.user.id, soen_id, soint_id, comment_id)
    db_session.add(association)
    db_session.commit()

    questions = MostViewedQuestion.query.filter_by(question_id=soen_id).all()
    for question in questions:
        question.is_associated = True
    db.session.commit()

    return jsonify(**resp)
