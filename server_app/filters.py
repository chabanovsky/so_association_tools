from jinja2 import evalcontextfilter, Markup
from meta import app as application, LANGUAGE

@application.template_filter()
@evalcontextfilter
def generate_string(eval_ctx, localized_value):
    if localized_value is None:
        return ""
    else:
        return Markup("\"" + localized_value + "\"").unescape()


def current_language():
    return LANGUAGE

application.jinja_env.globals.update(current_language=current_language)     