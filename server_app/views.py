from flask import Flask, jsonify, render_template, g, url_for, redirect
from meta import app as application
from suggested_question import get_suggested_question_ids_with_views

from auth import login

@application.route("/")
@application.route("/index.html")
def index():
    if g.user is None:
        return redirect(url_for('login'))  
    return render_template('question_list.html')
    
@application.route("/questions/<question_id>")
@application.route("/questions/<question_id>/")
def question(question_id):
    if g.user is None:
        return redirect(url_for('login'))  
    return render_template('question.html', question_id=question_id)    

@application.route("/api/suggested_question_ids_with_views")
def suggested_question_ids_with_views():
    ids = get_suggested_question_ids_with_views()
    return jsonify(**ids)    

