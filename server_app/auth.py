from flask import Flask, jsonify, render_template, request, g, session, flash, \
     redirect, url_for, abort
from openid.extensions import pape
from flask.ext.openid import OpenID
from openid.extensions import pape

import logging

from server import app as application, db_session, engine
from models import User

oid = OpenID(application, safe_roots=[], extension_responses=[pape.Response])
DEFAULT_STACKEXCHANGE_OPENID_ENDPOINT = 'https://openid.stackexchange.com'

@application.route('/openid/login', methods=['GET', 'POST'])
@application.route('/openid/login/', methods=['GET', 'POST'])
@oid.loginhandler
def login_openid():
    if g.user is not None:
        return redirect(oid.get_next_url())
    
    openid = DEFAULT_STACKEXCHANGE_OPENID_ENDPOINT
    pape_req = pape.Request([])
    return oid.try_login(openid, ask_for=['nickname'],
                                    extensions=[pape_req])

@oid.after_login
def create_or_login(resp):
    session['openid'] = resp.identity_url
    if 'pape' in resp.extensions:
        pape_resp = resp.extensions['pape']
        session['auth_time'] = pape_resp.auth_time
    user = User.query.filter_by(openid=resp.identity_url).first()
    if user is not None:
        g.user = user
        return redirect(oid.get_next_url())

    return redirect(url_for('create_profile_openid', next=oid.get_next_url(),
                            name=resp.nickname))                           

@application.route('/openid/create-profile', methods=['GET', 'POST'])
@application.route('/openid/create-profile/', methods=['GET', 'POST'])
def create_profile_openid():
    if g.user is not None or 'openid' not in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        name = request.form['name']
        if not name:
            logging.error(u'Error: you have to provide a name')
        else:
            db_session.add(User(name, session['openid']))
            db_session.commit()
            return redirect(oid.get_next_url())
    return render_template('create_profile.html', next_url=oid.get_next_url())                            


@application.route('/logout')
@application.route('/logout/')
def logout():
    session.pop('openid', None)
    return redirect(oid.get_next_url())
