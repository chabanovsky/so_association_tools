# encoding:utf-8
import requests
import logging
import json

from flask import Flask, jsonify, render_template, g, url_for, redirect, request, session
from meta import app as application, db_session
from models import User
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
    soen_id = int(request.args.get("soen_id"))
    soint_id = int(request.args.get("soint_id"))
    user = g.user
    access_token = session["access_token"]
    url = STACKEXCHANGE_ADD_COMMENT_ENDPOINT.replace("{id}", str(soint_id))
    params = {
       "body" : ASSOCIATION_TAG + u": http://stackoverflow.com/questions/" + str(soen_id) + "/",
       "access_token": access_token,
       "key": STACKEXCHANGE_CLIENT_KEY,
       "site": "ru.stackoverflow",
       "preview": "false"
    }
    
    r = requests.post(url, data=params) 
    resp = {
        "comment_id": -1,
        "full_response": r.text
    }   
    data = json.loads(r.text)
    if data.get("items", None) is not None:
        for item in data["items"]:
            if item.get("comment_id", None) is not None:
                resp["comment_id"] = item["comment_id"]
                break
    
    return jsonify(**resp)
