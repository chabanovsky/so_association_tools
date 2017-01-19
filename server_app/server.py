from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
@app.route("/index.html")
def index():
    return render_template('layout.html')

if __name__ == "__main__":
    app.run()
