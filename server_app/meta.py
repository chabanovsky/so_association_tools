import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask.ext.babel import Babel

from local_settings import FLASK_SECRET_KEY

def make_db_session(engine):
    return scoped_session(sessionmaker(autocommit=False,
        autoflush=True,
        bind=engine))    

def make_db_engine():
    return create_engine(app.config['SQLALCHEMY_DATABASE_URI'], convert_unicode=True)

LANGUAGE = os.environ["LOCALE_LANGUAGE_NAME"]
APP_URL = "http://demo.chabanovsky.com"
DB_NAME = "association_tools_" + LANGUAGE
STACKOVERFLOW_HOSTNAME = "stackoverflow.com"
STACKOVERFLOW_SITE_PARAM = "stackoverflow"
INT_STACKOVERFLOW_SITE_PARAM = LANGUAGE + "." + STACKOVERFLOW_SITE_PARAM

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = FLASK_SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres@localhost:5432/'+ DB_NAME + '?client_encoding=utf8'
app.config['BABEL_DEFAULT_LOCALE'] = LANGUAGE

engine = make_db_engine()
db_session = make_db_session(engine)

db = SQLAlchemy(app)                                                   

babel = Babel(app)
