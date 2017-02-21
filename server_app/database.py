import csv
import os
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from meta import db, db_session, engine
from models import QuestionViewHistory, MostViewedQuestion
from utils import print_progress_bar

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    db.create_all()


def upload_csv_from_file(path, debug_print):
    filedir, filename = os.path.split(path)
    the_date = filename.split(".")[0].split("_")
    file_date = datetime(int(the_date[0]), int(the_date[1]), int(the_date[2]))
    print "Started working on %s" % (path)
    with open(path, 'rb') as csvfile:
        csv_reader = csv.reader(csvfile, delimiter=',')
        for row in csv_reader:
            question_id = -1
            view_count = -1
            try:
                question_id = int(row[0].split("/")[2])
                view_count = int(row[1])
            except:
                continue

            if question_id < 0 or view_count < 0:
                continue

            count = QuestionViewHistory.query.filter_by(question_id=question_id, view_date=file_date).count()
            if count > 0:
                if debug_print:
                    print "Question %s found in db for the date %s" % (str(question_id), str(file_date))
                continue

            question = QuestionViewHistory(question_id, 
                view_count, 
                file_date)

            db_session.add(question)
            db_session.commit()
            db.session.commit()
            if debug_print:
                print "Question %s was added" % str(question_id)

def upload_csv(data_path, debug_print):
    for filename in os.listdir(data_path):
        upload_csv_from_file(data_path + filename, debug_print)
        
def update_most_viewed():
    query = QuestionViewHistory.query.filter_by(counted=False).distinct()
    all_questions = query.all()
    question_count = query.count()

    print "Questions to update: %s" % (question_count) 

    progress_index = 0
    for question in all_questions:
        most_viewed_question = MostViewedQuestion.query.filter_by(question_id=question.question_id).first()

        if most_viewed_question is None:
            most_viewed_question = MostViewedQuestion(question.question_id, question.view_count)
        else:
            most_viewed_question.view_count += question.view_count

        db_session.add(most_viewed_question)
        db_session.commit()

        question.counted = True
        db.session.commit()

        print_progress_bar(progress_index, question_count, prefix = 'Progress:', suffix = 'Complete')
        progress_index +=1
    
    print "All question were counted"
