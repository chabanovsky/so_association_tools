import os
import sys

sys.path.append('/home')
sys.path.append('/home/aapp')

def application(environ, start_response):
    os.environ['LOCALE_LANGUAGE_NAME'] = environ['LOCALE_LANGUAGE_NAME']
    os.environ['GOOGLE_CUSTOM_SEARCH_KEY'] = environ['GOOGLE_CUSTOM_SEARCH_KEY']
    os.environ['GOOGLE_CUSTOM_SEARCH_CX'] = environ['GOOGLE_CUSTOM_SEARCH_CX']

    os.environ['STACKEXCHANGE_CLIENT_SECRET'] = environ['STACKEXCHANGE_CLIENT_SECRET']
    os.environ['STACKEXCHANGE_CLIENT_KEY'] = environ['STACKEXCHANGE_CLIENT_KEY']
    os.environ['STACKEXCHANGE_CLIENT_ID'] = environ['STACKEXCHANGE_CLIENT_ID']

    from server import app as _application
    return _application(environ, start_response)

