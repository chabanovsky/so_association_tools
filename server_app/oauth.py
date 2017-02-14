import urllib
import logging
import requests

from flask import Flask, jsonify, render_template, g, url_for, redirect, request

from meta import app as application
from local_settings import STACKEXCHANGE_CLIENT_SECRET

STACKEXCHANGE_OAUTH_ENDPOINT = "https://stackexchange.com/oauth"
STACKEXCHANGE_OAUTH_GET_ACCESS_TOKEN = "https://stackexchange.com/oauth/access_token"
STACKEXCHANGE_CLIENT_ID = 5492

APP_URL = "http://demo.chabanovsky.com"

def get_redirect_url():
    return APP_URL + url_for("stackexcange_oauth_callback")

@application.route("/oauth/start")
@application.route("/oauth/start/")
def start_oauth():
    params = {
        "client_id": STACKEXCHANGE_CLIENT_ID,
        "scope": "write_access,no_expiry",
        "redirect_uri": get_redirect_url()
    }
    url = STACKEXCHANGE_OAUTH_ENDPOINT + "?" + urllib.urlencode(params)
    logging.error("start_oauth %s" % url)
    return redirect(url)
    
@application.route("/oauth/stackexchange")
@application.route("/oauth/stackexchange/")
def stackexcange_oauth_callback():
    logging.error("stackexcange_oauth_callback %s" % str(request.args.get('code')))
    params = {
        "client_id": STACKEXCHANGE_CLIENT_ID,
        "client_secret": STACKEXCHANGE_CLIENT_SECRET,
        "code": request.args.get('code'),
        "redirect_uri": get_redirect_url()
    }    

    headers = {'content-type': "application/x-www-form-urlencoded"}

    r = requests.post(STACKEXCHANGE_OAUTH_GET_ACCESS_TOKEN, data=params, headers=headers)

    if r.status_code == 400:
        logging.error("Cannot authorise a user on SE OAuth. ")
        return redirect(url_for("index"))
    
    answers = r.text.split("&")
    token = ""
    for answer in answers:
        if "access_token" in answer:
            token = answer.split("=")[1]
            break

    if token == "":
        logging.error("Cannot obtain access token on SE OAuth. ")
        return redirect(url_for("index"))
    
    redirect_to_index = redirect(url_for("index"))
    response = application.make_response(redirect_to_index )  
    response.set_cookie('access_token',value=token)
    return response
    
