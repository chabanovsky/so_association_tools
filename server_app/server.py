from flask import Flask, jsonify, render_template

from suggested_question import get_suggested_question_ids_with_views 

app = Flask(__name__)

@app.route("/")
@app.route("/index.html")
def index():
    return render_template('question_list.html')

@app.route("/api/suggested_question_ids_with_views")
def suggested_question_ids_with_views():
    ids = get_suggested_question_ids_with_views()
    return jsonify(**ids)

@app.route("/questions/<question_id>")
@app.route("/questions/<question_id>/")
def question(question_id):
    return str(question_id)    

if __name__ == "__main__":
    app.run()
