from jinja2 import evalcontextfilter, Markup
from meta import app as application, LANGUAGE
from local_settings import GOOGLE_CUSTOM_SEARCH_KEY, GOOGLE_CUSTOM_SEARCH_CX

@application.template_filter()
@evalcontextfilter
def generate_string(eval_ctx, localized_value):
    if localized_value is None:
        return ""
    else:
        return Markup("\"" + localized_value + "\"").unescape()


def current_language():
    return LANGUAGE

def get_google_custom_search_key():
    return GOOGLE_CUSTOM_SEARCH_KEY 

def get_google_custom_search_cx():
    return GOOGLE_CUSTOM_SEARCH_CX

application.jinja_env.globals.update(current_language=current_language,
    get_google_custom_search_key=get_google_custom_search_key,
    get_google_custom_search_cx=get_google_custom_search_cx)     