import csv
import os
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from meta import db, db_session
from models import MostViewedQuestion

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    db.create_all()

def upload_csv(data_path, debug_print):
    for filename in os.listdir(data_path):
        the_date = filename.split(".")[0].split("_")
        file_date = datetime(int(the_date[0]), int(the_date[1]), int(the_date[2]))
        print "Started working on %s" % (data_path + filename)
        with open(data_path + filename, 'rb') as csvfile:
            csv_reader = csv.reader(csvfile, delimiter=',')
            for row in csv_reader:
                questionId = -1
                viewCount = -1
                try:
                    questionId = int(row[0].split("/")[2])
                    viewCount = int(row[1])
                except:
                    continue

                count = MostViewedQuestion.query.filter_by(questionId=questionId, viewDate=file_date).count()
                if count > 0:
                    if debug_print:
                        print "Question %s found in db" % str(questionId)
                    continue
                
                question = MostViewedQuestion(questionId, viewCount, file_date)
                db_session.add(question)
                db_session.commit()
                if debug_print:
                    print "Question %s was added" % str(questionId)