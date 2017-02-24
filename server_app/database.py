import csv
import os
from datetime import datetime

import logging
from meta import db, db_session, engine
from models import QuestionViewHistory, MostViewedQuestion
from utils import print_progress_bar
from sqlalchemy.sql import func

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    db.create_all()


def upload_csv_from_file(path, debug_print, check_existence=True):
    filedir, filename = os.path.split(path)
    the_date = filename.split(".")[0].split("_")
    file_date = datetime(int(the_date[0]), int(the_date[1]), int(the_date[2]))
    print "Started working on %s, check existence: %s" % (path, str(check_existence))
    session = db_session()
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

            if check_existence:
                count = session.query(func.count(QuestionViewHistory.id)).filter_by(question_id=question_id, view_date=file_date).scalar()
                if count > 0:
                    if debug_print:
                        print "Question %s found in db for the date %s" % (str(question_id), str(file_date))
                    continue

            question = QuestionViewHistory(question_id, 
                view_count, 
                file_date)

            session.add(question)
            if check_existence:
                session.commit()

            if debug_print:
                print "Question %s was added" % str(question_id)

        if not check_existence:
            session.commit()
            
    session.close()

    print "Done with %s" % (path)

def upload_csv(data_path, debug_print, check_existence):
    for filename in os.listdir(data_path):
        upload_csv_from_file(data_path + filename, debug_print, check_existence)
        
def update_most_viewed():
    reader_session = db_session()
    question_count = reader_session.query(func.count(QuestionViewHistory.id)).filter_by(counted=False).scalar()
    query = reader_session.query(QuestionViewHistory.id, QuestionViewHistory.question_id, QuestionViewHistory.view_count).filter_by(counted=False)
    frame_size = 1000
    progress_index = 0
    counter = 0

    print "Questions to update: %s, frame size: %s" % (question_count, frame_size) 

    while counter <= question_count:
        all_questions = query.offset(0).limit(frame_size).all()
        counter = counter + frame_size

        session_wiriter = db_session()
        for question in all_questions:
            record_id, question_id, view_count = question
            most_viewed_question = session_wiriter.query(MostViewedQuestion).filter_by(question_id=question_id).first()
            if most_viewed_question is None:
                most_viewed_question = MostViewedQuestion(question_id, view_count)
                session_wiriter.add(most_viewed_question)
            else:
                most_viewed_question.view_count += view_count
            
            qh = session_wiriter.query(QuestionViewHistory).filter_by(id=record_id).first()
            qh.counted = True
            session_wiriter.add(qh)

            print_progress_bar(progress_index, question_count, prefix = 'Progress:', suffix = 'Complete')
            progress_index +=1
        
        session_wiriter.commit()
        session_wiriter.close()

    print "All questions were counted"
