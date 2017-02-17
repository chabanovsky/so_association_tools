
var localeManager = {
    answerStrings: [
        {{ ngettext('answer', 'answers', 1)|generate_string|safe }},
        {{ ngettext('answer', 'answers', 2)|generate_string|safe }},
        {{ ngettext('answer', 'answers', 5)|generate_string|safe }},
    ],
    scoreStrings: [
        {{ ngettext('vote', 'votes', 1)|generate_string|safe }},
        {{ ngettext('vote', 'votes', 2)|generate_string|safe }},
        {{ ngettext('vote', 'votes', 5)|generate_string|safe }},
    ],
    viewStrings: [
        {{ ngettext('view', 'views', 1)|generate_string|safe }},
        {{ ngettext('view', 'views', 2)|generate_string|safe }},
        {{ ngettext('view', 'views', 5)|generate_string|safe }},
    ],
    asked: {{ gettext('asked ')|generate_string|safe }},
    notFoundInGogle: {{ gettext('Google has not found anything by the query.')|generate_string|safe }},
    associationWasAdded: {{ gettext('Association has been added with id: ')|generate_string|safe }}
}