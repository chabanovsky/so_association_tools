import os
import sys

sys.path.append('/home')
sys.path.append('/home/aapp')

def application(environ, start_response):
    os.environ['LOCALE_LANGUAGE_NAME'] = environ['LOCALE_LANGUAGE_NAME']
    from server import app as _application
    return _application(environ, start_response)

